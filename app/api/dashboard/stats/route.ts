import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    // Get stats from database
    const [
      projectsResult,
      promptsResult,
      chatsResult,
      usageResult
    ] = await Promise.all([
      // Count projects
      supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Count prompt templates
      supabase
        .from('prompt_templates')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Count chat sessions
      supabase
        .from('chat_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Get usage stats (tokens and requests)
      supabase
        .from('usage_logs')
        .select('tokens_used, created_at')
        .eq('user_id', user.id)
    ])

    // Calculate stats
    const totalProjects = projectsResult.count || 0
    const totalPrompts = promptsResult.count || 0
    const totalChats = chatsResult.count || 0
    
    // Calculate tokens used
    const tokensUsed = usageResult.data?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0
    
    // Calculate requests today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const requestsToday = usageResult.data?.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate >= today
    }).length || 0

    return NextResponse.json({
      totalProjects,
      totalPrompts,
      totalChats,
      tokensUsed,
      requestsToday
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
