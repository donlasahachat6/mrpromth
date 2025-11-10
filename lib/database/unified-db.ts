/**
 * Unified Database Interface
 * ใช้ Supabase เท่านั้น (ลบ Mock Mode ออกแล้ว)
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import { ENV } from '@/lib/env'

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  if (!ENV.isSupabaseConfigured()) {
    // During build time, return false instead of throwing
    if (ENV.isBuildTime()) {
      console.warn('⚠️ Supabase credentials not found during build');
      return false;
    }
    throw new Error('Supabase credentials are required. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.')
  }

  return true
}

/**
 * Get database mode
 */
export function getDatabaseMode(): 'supabase' {
  return 'supabase'
}

/**
 * Create unified database client
 */
export function createUnifiedDatabase() {
  const configured = isSupabaseConfigured();
  
  // During build time, return a placeholder client
  if (!configured && ENV.isBuildTime()) {
    console.warn('⚠️ Creating placeholder Supabase client for build');
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
  
  const { url, anonKey } = ENV.getSupabaseConfig();

  console.log('[Database] Using Supabase:', url)

  return createClient<Database>(url, anonKey)
}

/**
 * Unified database instance
 */
const supabase = createUnifiedDatabase()

/**
 * Unified Database API
 */
export const unifiedDb = {
  // Chat Sessions
  async createChatSession(userId: string, title?: string) {
    const { data, error } = await (supabase as any)
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: title || 'New Chat',
        metadata: {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getChatSessions(userId: string) {
    const { data, error } = await (supabase as any)
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getChatSession(sessionId: string) {
    const { data, error } = await (supabase as any)
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return data
  },

  // Chat Messages
  async createChatMessage(
    sessionId: string,
    sender: 'user' | 'assistant' | 'system',
    content: string
  ) {
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender,
        content,
        metadata: {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getChatMessages(sessionId: string) {
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  // Projects
  async createProject(userId: string, name: string, userPrompt: string) {
    const { data, error } = await (supabase as any)
      .from('projects')
      .insert({
        user_id: userId,
        name,
        user_prompt: userPrompt,
        status: 'pending',
        agent_outputs: {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getProjects(userId: string) {
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getProject(projectId: string) {
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) throw error
    return data
  },

  async updateProject(projectId: string, updates: any) {
    const { data, error } = await (supabase as any)
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

export default unifiedDb
