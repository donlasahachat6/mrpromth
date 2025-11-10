import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Activity {
  id: string
  type: 'chat' | 'project' | 'prompt'
  title: string
  timestamp: string
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get recent activities from different sources
    const [chatsResult, projectsResult, promptsResult] = await Promise.all([
      // Recent chats
      supabase
        .from('chat_sessions')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent projects
      supabase
        .from('projects')
        .select('id, name, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5),
      
      // Recent prompts
      supabase
        .from('prompt_templates')
        .select('id, name, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)
    ])

    // Combine and format activities
    const activities: Activity[] = []

    // Add chats
    if (chatsResult.data) {
      chatsResult.data.forEach(chat => {
        activities.push({
          id: chat.id,
          type: 'chat',
          title: chat.title || 'Untitled Chat',
          timestamp: chat.created_at
        })
      })
    }

    // Add projects
    if (projectsResult.data) {
      projectsResult.data.forEach(project => {
        activities.push({
          id: project.id,
          type: 'project',
          title: project.name,
          timestamp: project.updated_at
        })
      })
    }

    // Add prompts
    if (promptsResult.data) {
      promptsResult.data.forEach(prompt => {
        activities.push({
          id: prompt.id,
          type: 'prompt',
          title: prompt.name,
          timestamp: prompt.updated_at
        })
      })
    }

    // Sort by timestamp and get top 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const recentActivities = activities.slice(0, 10)

    return NextResponse.json(recentActivities)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
