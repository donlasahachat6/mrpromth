/**
 * Unified Database Interface
 * ใช้ Supabase เท่านั้น (ลบ Mock Mode ออกแล้ว)
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
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
  isSupabaseConfigured() // Will throw if not configured
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log('[Database] Using Supabase:', supabaseUrl)
  return createClient<Database>(supabaseUrl, supabaseKey)
}

/**
 * Export unified database instance
 */
export const db = createUnifiedDatabase()

/**
 * Database operations wrapper
 * Provides consistent API for Supabase operations
 */
export class UnifiedDatabase {
  private client: any

  constructor() {
    this.client = createUnifiedDatabase()
  }

  /**
   * Get database mode
   */
  getMode(): 'supabase' {
    return 'supabase'
  }

  /**
   * Check if using mock (always false now)
   */
  isMock(): boolean {
    return false
  }

  /**
   * Get raw client
   */
  getClient() {
    return this.client
  }

  /**
   * Chat Sessions
   */
  async createChatSession(userId: string, title?: string) {
    const { data, error } = await this.client
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
  }

  async getChatSessions(userId: string) {
    const { data, error } = await this.client
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getChatSession(sessionId: string) {
    const { data, error } = await this.client
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Chat Messages
   */
  async createChatMessage(sessionId: string, role: string, content: string) {
    const { data, error } = await this.client
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getChatMessages(sessionId: string) {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Workflows
   */
  async createWorkflow(userId: string, projectName: string, prompt: string) {
    const { data, error } = await this.client
      .from('workflows')
      .insert({
        user_id: userId,
        project_name: projectName,
        prompt,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateWorkflow(workflowId: string, updates: any) {
    const { data, error } = await this.client
      .from('workflows')
      .update(updates)
      .eq('id', workflowId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getWorkflow(workflowId: string) {
    const { data, error } = await this.client
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (error) throw error
    return data
  }
}

/**
 * Export unified database instance
 */
export const unifiedDb = new UnifiedDatabase()
