/**
 * Database Client Abstraction Layer
 * Provides unified interface for Supabase operations (Mock Mode removed)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../database.types'
import { ErrorFactory } from '../utils/error-handler'

/**
 * Database configuration
 */
interface DbConfig {
  url?: string
  anonKey?: string
  serviceRoleKey?: string
}

/**
 * Database client for Supabase operations
 */
export class DatabaseClient {
  private supabase: SupabaseClient<Database>

  constructor(config?: DbConfig) {
    const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = config?.serviceRoleKey || config?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Supabase credentials are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
    }

    this.supabase = createClient<Database>(url, key)
    console.log('[DatabaseClient] Connected to Supabase')
  }

  /**
   * Check if using mock database (always false now)
   */
  public isMock(): boolean {
    return false
  }

  /**
   * Get Supabase client
   */
  public getClient(): SupabaseClient<Database> {
    return this.supabase
  }

  /**
   * Insert data
   */
  async insert<T = any>(table: string, data: T | T[]): Promise<{ data: T[] | null; error: any }> {
    try {
      const { data: result, error } = await (this.supabase as any)
        .from(table)
        .insert(data)
        .select()

      return { data: result as T[], error }
    } catch (error) {
      console.error(`[DatabaseClient] Insert error in ${table}:`, error)
      return { data: null, error }
    }
  }

  /**
   * Update data
   */
  async update<T = any>(
    table: string,
    data: Partial<T>,
    match: Record<string, any>
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query = (this.supabase as any).from(table).update(data)

      // Apply match conditions
      for (const [key, value] of Object.entries(match)) {
        query = query.eq(key, value)
      }

      const { data: result, error } = await query.select()

      return { data: result as T[], error }
    } catch (error) {
      console.error(`[DatabaseClient] Update error in ${table}:`, error)
      return { data: null, error }
    }
  }

  /**
   * Upsert data
   */
  async upsert<T = any>(table: string, data: T | T[]): Promise<{ data: T[] | null; error: any }> {
    try {
      const { data: result, error } = await (this.supabase as any)
        .from(table)
        .upsert(data)
        .select()

      return { data: result as T[], error }
    } catch (error) {
      console.error(`[DatabaseClient] Upsert error in ${table}:`, error)
      return { data: null, error }
    }
  }

  /**
   * Select data
   */
  async select<T = any>(
    table: string,
    options?: {
      columns?: string
      match?: Record<string, any>
      order?: { column: string; ascending?: boolean }
      limit?: number
    }
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query = (this.supabase as any).from(table).select(options?.columns || '*')

      // Apply match conditions
      if (options?.match) {
        for (const [key, value] of Object.entries(options.match)) {
          query = query.eq(key, value)
        }
      }

      // Apply order
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        })
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      return { data: data as T[], error }
    } catch (error) {
      console.error(`[DatabaseClient] Select error in ${table}:`, error)
      return { data: null, error }
    }
  }

  /**
   * Delete data
   */
  async delete(
    table: string,
    match: Record<string, any>
  ): Promise<{ data: any; error: any }> {
    try {
      let query = (this.supabase as any).from(table).delete()

      // Apply match conditions
      for (const [key, value] of Object.entries(match)) {
        query = query.eq(key, value)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error(`[DatabaseClient] Delete error in ${table}:`, error)
      return { data: null, error }
    }
  }
}

/**
 * Global database client instance
 */
export const db = new DatabaseClient()

/**
 * Create a new database client with custom config
 */
export function createDatabaseClient(config: DbConfig): DatabaseClient {
  return new DatabaseClient(config)
}
