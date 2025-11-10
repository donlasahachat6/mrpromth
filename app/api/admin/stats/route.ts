import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get system statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication and admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (signed in within last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', yesterday);

    // Get total projects
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Get total chats
    const { data: chatSessions } = await supabase
      .from('chat_messages')
      .select('session_id');

    const uniqueSessions = new Set(chatSessions?.map(s => s.session_id) || []);
    const totalChats = uniqueSessions.size;

    // Get total tokens used (mock data for now)
    const totalTokens = 1234567;

    // Get API calls in last 24h (mock data for now)
    const apiCalls24h = 5432;

    // Calculate error rate (mock data for now)
    const errorRate = 0.5;

    // Calculate average response time (mock data for now)
    const avgResponseTime = 245;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalProjects: totalProjects || 0,
      totalChats,
      totalTokens,
      apiCalls24h,
      errorRate,
      avgResponseTime
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
