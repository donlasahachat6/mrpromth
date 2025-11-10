import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { vanchinLoadBalancer } from "@/lib/ai/vanchin-load-balancer";

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  session_id: string;
  messages: ChatMessage[];
  mode?: "chat" | "code" | "project" | "debug";
  agent_id?: string;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ChatRequestBody = await request.json();
    const { session_id, messages, mode = "chat", agent_id = "auto", stream = true } = body;

    // Add system prompt based on mode
    const systemPrompts = {
      chat: "You are Mr.Prompt, a helpful AI assistant. Provide clear, concise, and accurate responses.",
      code: "You are an expert code assistant. Provide clean, well-documented code with explanations. Use markdown code blocks with language tags.",
      project: "You are a full-stack project architect. Design complete, production-ready solutions with detailed specifications.",
      debug: "You are a debugging expert. Analyze errors carefully and provide step-by-step solutions.",
    };

    const systemMessage: ChatMessage = {
      role: "system",
      content: systemPrompts[mode] || systemPrompts.chat,
    };

    const fullMessages = [systemMessage, ...messages];

    // Save user message to database
    const userMessage = messages[messages.length - 1];
    if (userMessage && userMessage.role === "user") {
      await supabase.from("chat_messages").insert({
        session_id,
        user_id: user.id,
        role: "user",
        content: userMessage.content,
        mode,
        agent_id,
      });
    }

    if (!stream) {
      // Non-streaming response
      const response = await vanchinLoadBalancer.call(fullMessages, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 2000,
        stream: false,
      });

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || "";

      // Save assistant message
      await supabase.from("chat_messages").insert({
        session_id,
        user_id: user.id,
        role: "assistant",
        content: assistantMessage,
        mode,
        agent_id,
      });

      return NextResponse.json({
        message: assistantMessage,
        agent_id,
        mode,
      });
    }

    // Streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await vanchinLoadBalancer.call(fullMessages, {
            model: "gpt-4o-mini",
            temperature: 0.7,
            maxTokens: 2000,
            stream: true,
          });

          if (!response.body) {
            throw new Error("No response body");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = "";

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                  );
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;

                  if (content) {
                    accumulatedContent += content;
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "chunk", content })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  console.warn("Failed to parse SSE chunk:", e);
                }
              }
            }
          }

          // Save complete assistant message
          if (accumulatedContent) {
            await supabase.from("chat_messages").insert({
              session_id,
              user_id: user.id,
              role: "assistant",
              content: accumulatedContent,
              mode,
              agent_id,
            });
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                type: "error", 
                error: error instanceof Error ? error.message : "Unknown error" 
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", session_id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Get chat history error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
