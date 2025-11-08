import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workflow from database
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Mock file structure for now
    // In production, this would read from the actual project files
    const files = generateMockFileStructure(workflow.project_name);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error loading project files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockFileStructure(projectName: string) {
  return [
    {
      name: 'app',
      path: '/app',
      type: 'folder',
      children: [
        {
          name: 'page.tsx',
          path: '/app/page.tsx',
          type: 'file',
        },
        {
          name: 'layout.tsx',
          path: '/app/layout.tsx',
          type: 'file',
        },
        {
          name: 'api',
          path: '/app/api',
          type: 'folder',
          children: [
            {
              name: 'route.ts',
              path: '/app/api/route.ts',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      name: 'components',
      path: '/components',
      type: 'folder',
      children: [
        {
          name: 'Header.tsx',
          path: '/components/Header.tsx',
          type: 'file',
        },
        {
          name: 'Footer.tsx',
          path: '/components/Footer.tsx',
          type: 'file',
        },
      ],
    },
    {
      name: 'lib',
      path: '/lib',
      type: 'folder',
      children: [
        {
          name: 'utils.ts',
          path: '/lib/utils.ts',
          type: 'file',
        },
      ],
    },
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
    },
    {
      name: 'README.md',
      path: '/README.md',
      type: 'file',
    },
  ];
}
