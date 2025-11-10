import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Get system activity logs for admin dashboard
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

    // Get activity logs
    const { data: logs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) {
      // If table doesn't exist, return empty array
      return NextResponse.json({ logs: [] });
    }

    // Format logs with user emails
    const formattedLogs = await Promise.all(
      (logs || []).map(async (log) => {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', log.user_id)
          .single();

        return {
          id: log.id,
          user_email: userProfile?.email || 'Unknown',
          action: log.action,
          resource: log.resource_type || 'system',
          timestamp: log.created_at,
          status: log.status || 'success',
          details: log.details || ''
        };
      })
    );

    return NextResponse.json({
      logs: formattedLogs,
      total: formattedLogs.length
    });

  } catch (error: any) {
    console.error('Admin activity error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
