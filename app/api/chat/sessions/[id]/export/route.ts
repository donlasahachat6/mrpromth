import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Export chat session history as JSON
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    // Get chat messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages found" },
        { status: 404 }
      );
    }

    // Format export data
    const exportData = {
      session_id: sessionId,
      user_id: user.id,
      user_email: user.email,
      exported_at: new Date().toISOString(),
      messages_count: messages.length,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        mode: msg.mode,
        agent_id: msg.agent_id
      })),
      metadata: {
        first_message: messages[0]?.created_at,
        last_message: messages[messages.length - 1]?.created_at,
        total_user_messages: messages.filter(m => m.role === 'user').length,
        total_assistant_messages: messages.filter(m => m.role === 'assistant').length
      }
    };

    return NextResponse.json(exportData);

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
