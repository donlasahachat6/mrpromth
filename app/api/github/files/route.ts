import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createGitHubIntegration } from "@/lib/github/integration";

export const dynamic = "force-dynamic";

/**
 * GET /api/github/files - List repository contents or get file content
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
    const path = searchParams.get('path') || '';
    const branch = searchParams.get('branch') || 'main';
    const action = searchParams.get('action') || 'list';

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

    if (action === 'list') {
      const contents = await github.listContents(path, branch);
      return NextResponse.json({ contents });
    }

    if (action === 'get') {
      const content = await github.getFileContent(path, branch);
      if (content === null) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ content, path });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('GitHub files GET error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/github/files - Create or update file
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, path, content, message, branch = 'main', action = 'create' } = body;

    if (!owner || !repo || !path || !content || !message) {
      return NextResponse.json(
        { error: "owner, repo, path, content, and message required" },
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

    let result;
    if (action === 'create') {
      result = await github.createFile(path, content, message, branch);
    } else if (action === 'update') {
      result = await github.updateFile(path, content, message, branch);
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `File ${action}d successfully`
    });

  } catch (error: any) {
    console.error('GitHub files POST error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/github/files - Delete file
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { owner, repo, path, message, branch = 'main' } = body;

    if (!owner || !repo || !path || !message) {
      return NextResponse.json(
        { error: "owner, repo, path, and message required" },
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

    const result = await github.deleteFile(path, message, branch);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('GitHub files DELETE error:', error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
