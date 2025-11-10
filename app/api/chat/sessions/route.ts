import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get user's chat sessions
 */
export async function GET(request: NextRequest) {
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

    // Get all unique session IDs for the user
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('session_id, created_at, content, role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      throw messagesError;
    }

    // Group messages by session
    const sessionsMap = new Map<string, any>();
    
    if (messages) {
      for (const msg of messages) {
        if (!sessionsMap.has(msg.session_id)) {
          sessionsMap.set(msg.session_id, {
            id: msg.session_id,
            messages: [],
            created_at: msg.created_at,
            last_message_at: msg.created_at
          });
        }
        
        const session = sessionsMap.get(msg.session_id);
        session.messages.push(msg);
        
        // Update last message time
        if (new Date(msg.created_at) > new Date(session.last_message_at)) {
          session.last_message_at = msg.created_at;
        }
        
        // Update first message time
        if (new Date(msg.created_at) < new Date(session.created_at)) {
          session.created_at = msg.created_at;
        }
      }
    }

    // Format sessions
    const sessions = Array.from(sessionsMap.values()).map(session => {
      // Get first user message as title
      const firstUserMessage = session.messages
        .filter((m: any) => m.role === 'user')
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
      
      const title = firstUserMessage?.content?.substring(0, 50) || 'Untitled Chat';
      
      return {
        id: session.id,
        title: title.length < 50 ? title : title + '...',
        messages_count: session.messages.length,
        created_at: session.created_at,
        last_message_at: session.last_message_at
      };
    });

    // Sort by last message time
    sessions.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    return NextResponse.json({
      sessions,
      total: sessions.length
    });

  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
