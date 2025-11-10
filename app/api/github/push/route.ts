import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createGitHubIntegration } from "@/lib/github/integration";

export const dynamic = "force-dynamic";

/**
 * POST /api/github/push - Push changes to repository
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, repoPath, message, branch = 'main', author } = body;

    if (!owner || !repo || !repoPath || !message) {
      return NextResponse.json(
        { error: "owner, repo, repoPath, and message required" },
        { status: 400 }
      );
    }

    const github = createGitHubIntegration(owner, repo);
    if (!github) {
      return NextResponse.json(
        { error: "GitHub integration not configured" },
        { status: 500 }
      );
    }

    const result = await github.pushChanges(repoPath, {
      message,
      branch,
      author: author || {
        name: user.email?.split('@')[0] || 'MR.Prompt User',
        email: user.email || 'noreply@mrprompt.ai'
      }
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commitSha: result.commitSha,
      message: 'Changes pushed successfully'
    });

  } catch (error: any) {
    console.error('GitHub push API error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
