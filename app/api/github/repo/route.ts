import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createGitHubIntegration } from "@/lib/github/integration";

export const dynamic = "force-dynamic";

/**
 * GET /api/github/repo - Get repository information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "owner and repo parameters required" },
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

    const repoInfo = await github.getRepoInfo();
    const branches = await github.listBranches();
    const commits = await github.getCommits('main', 10);

    return NextResponse.json({
      repository: repoInfo,
      branches,
      recent_commits: commits
    });

  } catch (error: any) {
    console.error('GitHub repo API error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/github/repo - Clone repository
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, branch, action } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "owner and repo required" },
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

    if (action === 'clone') {
      const result = await github.cloneRepository({
        branch: branch || 'main',
        targetDir: `/tmp/repos/${user.id}/${repo}`
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        path: result.path,
        message: 'Repository cloned successfully'
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('GitHub clone API error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
