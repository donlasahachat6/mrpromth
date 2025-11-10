/**
 * Unified Database Interface
 * ใช้ Supabase หรือ Mock Database ขึ้นอยู่กับ configuration
 */

import { DatabaseClient } from './db-client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !!(
    supabaseUrl &&
    supabaseKey &&
    !supabaseKey.includes('placeholder') &&
    !supabaseUrl.includes('localhost')
  )
}

/**
 * Get database mode
 */
export function getDatabaseMode(): 'supabase' | 'mock' {
  return isSupabaseConfigured() ? 'supabase' : 'mock'
}

/**
 * Create unified database client
 */
export function createUnifiedDatabase() {
  const mode = getDatabaseMode()

  if (mode === 'mock') {
    console.log('[Database] Using mock database (Supabase not configured)')
    return new DatabaseClient() // Will use mock mode automatically
  }

  console.log('[Database] Using Supabase')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey)
}

/**
 * Export unified database instance
 */
export const db = createUnifiedDatabase()

/**
 * Database operations wrapper
 * Provides consistent API regardless of backend
 */
export class UnifiedDatabase {
  private client: any

  constructor() {
    this.client = createUnifiedDatabase()
  }

  /**
   * Get database mode
   */
  getMode(): 'supabase' | 'mock' {
    return getDatabaseMode()
  }

  /**
   * Check if using mock
   */
  isMock(): boolean {
    return this.getMode() === 'mock'
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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.insert('chat_sessions', {
        user_id: userId,
        title: title || 'New Chat',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message || 'Failed to create chat session')
      return data?.[0]
    }

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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.select('chat_sessions', {
        match: { user_id: userId },
        order: { column: 'created_at', ascending: false },
      })
      if (error) throw new Error(error.message || 'Failed to get chat sessions')
      return data || []
    }

    const { data, error } = await this.client
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getChatSession(sessionId: string) {
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.select('chat_sessions', {
        match: { id: sessionId },
        limit: 1,
      })
      if (error) throw new Error(error.message || 'Failed to get chat session')
      return data?.[0] || null
    }

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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.insert('chat_messages', {
        session_id: sessionId,
        role,
        content,
        created_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message || 'Failed to create chat message')
      return data?.[0]
    }

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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.select('chat_messages', {
        match: { session_id: sessionId },
        order: { column: 'created_at', ascending: true },
      })
      if (error) throw new Error(error.message || 'Failed to get chat messages')
      return data || []
    }

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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.insert('workflows', {
        user_id: userId,
        project_name: projectName,
        prompt,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message || 'Failed to create workflow')
      return data?.[0]
    }

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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.update('workflows', updates, { id: workflowId })
      if (error) throw new Error(error.message || 'Failed to update workflow')
      return data?.[0]
    }

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
    if (this.isMock()) {
      const mockClient = this.client as DatabaseClient
      const { data, error } = await mockClient.select('workflows', {
        match: { id: workflowId },
        limit: 1,
      })
      if (error) throw new Error(error.message || 'Failed to get workflow')
      return data?.[0] || null
    }

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
