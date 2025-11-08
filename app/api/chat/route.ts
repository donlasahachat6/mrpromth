import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import vm from "node:vm";
import { inspect } from "node:util";

export const runtime = "nodejs";

const encoder = new TextEncoder();

type ProviderMessageRole = "system" | "user" | "assistant" | "tool";

interface ProviderMessage {
  role: ProviderMessageRole;
  content: string;
  name?: string;
  tool_call_id?: string;
}

interface ChatRequestBody {
  messages: ProviderMessage[];
  provider?: string;
  model?: string;
  session_id?: string;
  stream?: boolean;
  tool?: { name?: string; input?: string } | null;
  [key: string]: unknown;
}

type ToolName = "web_search" | "code_execution" | "project_generation";

interface ToolInvocation {
  name: ToolName;
  input: string;
}

interface ToolExecutionContext {
  userId: string;
  sessionId?: string;
}

interface ToolExecutionResult {
  name: ToolName;
  content: string;
  metadata?: Record<string, unknown>;
  modelMessage: ProviderMessage;
}

interface ToolDefinition {
  matches: (message: ProviderMessage) => string | null;
  execute: (input: string, context: ToolExecutionContext) => Promise<ToolExecutionResult>;
  description: string;
}

interface DuckDuckGoTopic {
  Text?: string;
  FirstURL?: string;
  Topics?: DuckDuckGoTopic[];
}

interface SearchResultSummary {
  title: string;
  url: string;
  snippet: string;
}

const toolRegistry: Record<ToolName, ToolDefinition> = {
  project_generation: {
    description: "Generates a complete full-stack web project from a natural language description.",
    matches(message) {
      if (message.role !== "user") return null;
      const content = message.content.toLowerCase();
      
      // Keywords สำหรับการสร้างโปรเจกต์
      const createKeywords = [
        'สร้าง', 'create', 'build', 'make', 'generate', 
        'ทำ', 'เริ่ม', 'start', 'new project', 'โปรเจกต์ใหม่'
      ];
      
      // Project types
      const projectTypes = [
        'website', 'เว็บ', 'blog', 'บล็อก', 'e-commerce', 'ร้านค้า',
        'dashboard', 'แดชบอร์ด', 'app', 'แอป', 'api', 'todo', 'chat',
        'project', 'โปรเจกต์'
      ];
      
      const hasCreateKeyword = createKeywords.some(kw => content.includes(kw));
      const hasProjectType = projectTypes.some(type => content.includes(type));
      
      if (hasCreateKeyword && hasProjectType) {
        return message.content;
      }
      
      // Check for explicit command
      const commandMatch = content.match(/^!generate\s+(.+)/i);
      if (commandMatch) {
        return commandMatch[1].trim();
      }
      
      return null;
    },
    async execute(prompt, context) {
      // Import WorkflowOrchestrator
      const { WorkflowOrchestrator } = await import('@/lib/workflow/orchestrator');
      
      // Extract project name from prompt
      const nameMatch = prompt.match(/(?:ชื่อ|name|called?)\s+["']?([a-z0-9-]+)["']?/i);
      const projectName = nameMatch 
        ? nameMatch[1].toLowerCase().replace(/[^a-z0-9-]/g, '-')
        : `project-${Date.now()}`;
      
      // Create orchestrator
      const orchestrator = new WorkflowOrchestrator({
        userId: context.userId,
        projectName,
        prompt,
      });
      
      // Execute workflow
      try {
        const result = await orchestrator.execute(prompt);
        
        return {
          name: "project_generation",
          content: `✅ Project created successfully!\n\n**Project**: ${projectName}\n**Workflow ID**: ${result.id}\n**Status**: ${result.status}\n\nYou can view the progress at /generate/${result.id}`,
          metadata: {
            projectName,
            workflowId: result.id,
            status: result.status,
          },
          modelMessage: {
            role: "system",
            content: `Project generation completed. Workflow ID: ${result.id}`,
          },
        };
      } catch (error) {
        throw new Error(`Project generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
  web_search: {
    description: "Searches the public web for up-to-date information.",
    matches(message) {
      if (message.role !== "user") return null;
      const content = message.content.trim();
      const commandMatch = content.match(/^!search\s+(.+)/i);
      if (commandMatch) {
        return commandMatch[1].trim();
      }

      const bracketMatch = content.match(/\[\[\s*web_search\s*::\s*([^\]]+)\]\]/i);
      if (bracketMatch) {
        return bracketMatch[1].trim();
      }

      return null;
    },
    async execute(query, context) {
      const results = await runWebSearch(query);
      const summaryLines = results.map(
        (item, index) => `${index + 1}. ${item.title} — ${item.snippet} (${item.url})`
      );

      const summarizedContent = summaryLines.join("\n") || "No relevant results were found.";

      return {
        name: "web_search",
        content: summarizedContent,
        metadata: {
          query,
          results,
        },
        modelMessage: {
          role: "system",
          content: [
            `Web search results for "${query}":`,
            summarizedContent,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      };
    },
  },
  code_execution: {
    description: "Executes short JavaScript snippets in a sandboxed environment.",
    matches(message) {
      if (message.role !== "user") return null;
      const inlineMatch = message.content.match(/^!code\s+([\s\S]+)/i);
      if (inlineMatch) {
        return inlineMatch[1].trim();
      }

      const fenceMatch = message.content.match(/```(?:js|javascript|ts|typescript)?\n([\s\S]*?)```/i);
      if (fenceMatch) {
        return fenceMatch[1].trim();
      }

      return null;
    },
    async execute(code, context) {
      return executeCodeSnippet(code);
    },
  },
};

function getGatewayUrl() {
  const url = process.env.AI_GATEWAY_URL ?? "http://localhost:8000";
  if (!url) {
    throw new Error("AI_GATEWAY_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

function normalizeProvider(provider?: string): "openai" | "anthropic" {
  const value = (provider ?? "openai").toLowerCase();
  if (["claude", "anthropic"].includes(value)) {
    return "anthropic";
  }
  return "openai";
}

function encodeEvent(payload: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function flattenTopics(topics: DuckDuckGoTopic[], acc: SearchResultSummary[] = []): SearchResultSummary[] {
  for (const topic of topics) {
    if (Array.isArray(topic.Topics) && topic.Topics.length > 0) {
      flattenTopics(topic.Topics, acc);
      continue;
    }

    if (topic.Text && topic.FirstURL) {
      acc.push({
        title: topic.Text,
        url: topic.FirstURL,
        snippet: topic.Text,
      });
    }
  }
  return acc;
}

async function runWebSearch(query: string): Promise<SearchResultSummary[]> {
  const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const response = await fetch(endpoint, {
    headers: { "User-Agent": "MrPrompt/1.0 (+https://mrprompt.local)" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Web search failed with status ${response.status}`);
  }

  const data = await response.json();
  const summaries: SearchResultSummary[] = [];

  if (typeof data.AbstractText === "string" && data.AbstractText.trim()) {
    summaries.push({
      title: data.Heading || query,
      url: data.AbstractURL || "",
      snippet: data.AbstractText,
    });
  }

  const related = flattenTopics(Array.isArray(data.RelatedTopics) ? data.RelatedTopics : []);
  for (const item of related) {
    if (!summaries.find((entry) => entry.url === item.url)) {
      summaries.push(item);
    }
    if (summaries.length >= 5) break;
  }

  return summaries.slice(0, 5);
}

function formatValue(value: unknown): string {
  return inspect(value, { depth: 2, maxArrayLength: 10, breakLength: 80 });
}

async function executeCodeSnippet(code: string): Promise<ToolExecutionResult> {
  const trimmed = code.trim();

  if (!trimmed) {
    throw new Error("No code provided for execution");
  }

  if (trimmed.length > 3000) {
    throw new Error("Code snippet is too long (limit 3000 characters)");
  }

  const output: string[] = [];
  const sandboxConsole = {
    __buffer: output,
    log: (...args: unknown[]) => output.push(args.map((arg) => formatValue(arg)).join(" ")),
    error: (...args: unknown[]) => output.push(args.map((arg) => formatValue(arg)).join(" ")),
    warn: (...args: unknown[]) => output.push(args.map((arg) => formatValue(arg)).join(" ")),
    info: (...args: unknown[]) => output.push(args.map((arg) => formatValue(arg)).join(" ")),
  };

  const sandbox: Record<string, unknown> = {
    console: sandboxConsole,
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Date,
    RegExp,
    JSON,
    Set,
    Map,
  };

  sandbox.globalThis = sandbox;

  try {
    const script = new vm.Script(trimmed, { filename: "sandboxed-eval.js" });
    const context = vm.createContext(sandbox);
    const result = script.runInContext(context, { timeout: 500 });

    if (typeof result !== "undefined") {
      output.push(`Return value: ${formatValue(result)}`);
    }

    const combined = output.length > 0 ? output.join("\n") : "No output.";

    return {
      name: "code_execution",
      content: combined,
      metadata: { code: trimmed },
      modelMessage: {
        role: "system",
        content: `Code execution output:\n${combined}`,
      },
    };
  } catch (error) {
    throw new Error(
      `Execution error: ${
        error instanceof Error ? error.message : "Unknown sandbox execution failure"
      }`
    );
  }
}

function detectExplicitTool(tool: ChatRequestBody["tool"]): ToolInvocation | null {
  if (!tool || typeof tool !== "object") return null;
  const { name, input } = tool as { name?: string; input?: string };
  if (!name || !input) return null;
  if (name === "web_search" || name === "code_execution") {
    return { name, input: input.trim() };
  }
  return null;
}

function detectToolInvocation(messages: ProviderMessage[]): ToolInvocation | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "user") continue;

    for (const [name, definition] of Object.entries(toolRegistry) as [ToolName, ToolDefinition][]) {
      const input = definition.matches(message);
      if (input) {
        return { name, input };
      }
    }
    break;
  }
  return null;
}

async function executeTool(
  invocation: ToolInvocation,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const definition = toolRegistry[invocation.name];
  if (!definition) {
    throw new Error(`Tool ${invocation.name} is not registered`);
  }

  return definition.execute(invocation.input, context);
}

function extractProviderText(provider: "openai" | "anthropic", payload: any): string {
  if (provider === "anthropic") {
    const segments = Array.isArray(payload?.content) ? payload.content : [];
    const textSegments = segments
      .map((segment: any) => {
        if (typeof segment?.text === "string") return segment.text;
        if (Array.isArray(segment?.content)) {
          return segment.content.map((entry: any) => entry?.text ?? "").join("");
        }
        return typeof segment === "string" ? segment : "";
      })
      .filter(Boolean);
    return textSegments.join(" ").trim();
  }

  const choices = Array.isArray(payload?.choices) ? payload.choices : [];
  if (choices.length > 0) {
    const content = choices
      .map((choice: any) => choice?.message?.content ?? choice?.delta?.content ?? "")
      .filter(Boolean)
      .join(" ");
    if (content) {
      return content.trim();
    }
  }

  if (typeof payload?.content === "string") {
    return payload.content.trim();
  }

  return "";
}

function buildStreamResponse(events: Record<string, unknown>[]) {
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(encodeEvent(event));
        }
        controller.close();
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const provider = normalizeProvider(body.provider);
  const wantStream = body.stream !== false;

  const explicitTool = detectExplicitTool(body.tool ?? null);
  const toolInvocation = explicitTool ?? detectToolInvocation(messages);

  let toolResult: ToolExecutionResult | null = null;
  let augmentedMessages = [...messages];

  if (toolInvocation) {
    try {
      toolResult = await executeTool(toolInvocation, {
        userId: user.id,
        sessionId: typeof body.session_id === "string" ? body.session_id : undefined,
      });
      augmentedMessages = [...augmentedMessages, toolResult.modelMessage];
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tool execution failed";
      if (wantStream) {
        return buildStreamResponse([
          { type: "error", error: message },
          { type: "done" },
        ]);
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const gatewayUrl = getGatewayUrl();
  const gatewayApiKey = process.env.AI_GATEWAY_API_KEY;

  const upstreamResponse = await fetch(`${gatewayUrl}/api/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(gatewayApiKey ? { "X-API-Key": gatewayApiKey } : {}),
      "X-User-Id": user.id,
    },
    body: JSON.stringify({
      ...body,
      provider,
      stream: false,
      messages: augmentedMessages,
    }),
  });

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text();
    const detail = errorText || "Unexpected error from AI gateway";
    if (wantStream) {
      return buildStreamResponse([
        { type: "error", error: detail },
        { type: "done" },
      ]);
    }
    return NextResponse.json({ error: detail }, { status: upstreamResponse.status });
  }

  const providerPayload = await upstreamResponse.json();
  const finalText = extractProviderText(provider, providerPayload);

  if (!wantStream) {
    return NextResponse.json({
      content: finalText,
      provider,
      tool: toolResult
        ? {
            name: toolResult.name,
            content: toolResult.content,
            metadata: toolResult.metadata,
          }
        : null,
    });
  }

  const events: Record<string, unknown>[] = [];
  if (toolResult) {
    events.push({
      type: "tool",
      name: toolResult.name,
      content: toolResult.content,
      metadata: toolResult.metadata,
    });
  }

  if (finalText) {
    events.push({ type: "chunk", content: finalText });
  }

  events.push({ type: "done" });

  return buildStreamResponse(events);
}
