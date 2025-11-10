import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/agents/[id]/toggle - Toggle agent active status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current agent
    const { data: agent, error: fetchError } = await supabase
      .from("agents")
      .select("author_id, is_public")
      .eq("id", id)
      .single();

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (agent.author_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Toggle is_public status
    const { data: updatedAgent, error: updateError } = await supabase
      .from("agents")
      .update({
        is_public: !agent.is_public,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error toggling agent:", updateError);
      return NextResponse.json(
        { error: "Failed to toggle agent" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "toggle_agent",
      resource_type: "agent",
      resource_id: id,
      details: { is_public: updatedAgent.is_public }
    });

    return NextResponse.json({ agent: updatedAgent });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
