import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { callVanchinAPI, streamVanchinAPI } from "@/lib/vanchin-client";
import { withRateLimit } from "@/lib/utils/api-with-rate-limit";
import { RateLimiters } from "@/lib/utils/rate-limiter";

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
  stream?: boolean;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

async function handlePOST(request: NextRequest) {
  console.log('[Chat API] Received POST request');
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[Chat API] User:', user?.id || 'No user');

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ChatRequestBody = await request.json();
    
    // Validate request body
    if (!body.session_id || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    if (body.messages.length === 0) {
      return NextResponse.json({ error: "Messages array cannot be empty" }, { status: 400 });
    }
    const { 
      session_id, 
      messages, 
      mode = "chat", 
      stream: enableStream = true,
      model = "gpt-4o-mini",
      temperature = 0.7,
      max_tokens = 2000
    } = body;

    // Add system prompt based on mode
    const systemPrompts = {
      chat: "You are Mr.Prompt, a helpful AI assistant. Provide clear, concise, and accurate responses in Thai language.",
      code: "You are an expert code assistant. Provide clean, well-documented code with explanations. Use markdown code blocks with language tags. Respond in Thai language.",
      project: "You are a full-stack project architect. Design complete, production-ready solutions with detailed specifications. Respond in Thai language.",
      debug: "You are a debugging expert. Analyze errors carefully and provide step-by-step solutions. Respond in Thai language.",
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
      });
    }

    // Log usage to activity_logs
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "chat_request",
      resource_type: "chat",
      resource_id: session_id,
      details: { mode, model, message_count: messages.length },
    });

    if (!enableStream) {
      // Non-streaming response
      const response = await callVanchinAPI({
        messages: fullMessages,
        model,
        temperature,
        max_tokens,
        stream: false,
      });

      const assistantMessage = response.choices[0]?.message?.content || "";

      // Save assistant message
      await supabase.from("chat_messages").insert({
        session_id,
        user_id: user.id,
        role: "assistant",
        content: assistantMessage,
        mode,
      });

      return NextResponse.json({
        message: assistantMessage,
        mode,
        usage: response.usage,
      });
    }

    // Streaming response
    console.log('[Chat API] Starting streaming response');
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedContent = "";

          console.log('[Chat API] Calling streamVanchinAPI');
          for await (const chunk of streamVanchinAPI({
            messages: fullMessages,
            model,
            temperature,
            max_tokens,
            stream: true,
          })) {
            accumulatedContent += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`
              )
            );
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );

          // Save complete assistant message
          if (accumulatedContent) {
            await supabase.from("chat_messages").insert({
              session_id,
              user_id: user.id,
              role: "assistant",
              content: accumulatedContent,
              mode,
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

    return new NextResponse(responseStream, {
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

// Export POST with rate limiting
export const POST = withRateLimit(handlePOST, RateLimiters.ai, {
  getKey: (req) => {
    const userId = req.headers.get('x-user-id');
    return userId || `ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
  }
});
