/**
 * Database Client Abstraction Layer
 * Provides unified interface for database operations with fallback support
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
  useMock?: boolean
}

/**
 * Database client with fallback support
 */
export class DatabaseClient {
  private supabase: SupabaseClient<Database> | null = null
  private useMock: boolean = false
  private mockData: Map<string, any[]> = new Map()

  constructor(config?: DbConfig) {
    const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = config?.serviceRoleKey || config?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if we should use mock
    this.useMock = config?.useMock || !url || !key || url.includes('placeholder')

    if (!this.useMock && url && key) {
      try {
        this.supabase = createClient<Database>(url, key)
        console.log('[DatabaseClient] Connected to Supabase')
      } catch (error) {
        console.warn('[DatabaseClient] Failed to connect to Supabase, using mock:', error)
        this.useMock = true
      }
    } else {
      console.log('[DatabaseClient] Using mock database (no credentials provided)')
    }

    // Initialize mock data
    if (this.useMock) {
      this.initializeMockData()
    }
  }

  /**
   * Initialize mock data for development
   */
  private initializeMockData() {
    this.mockData.set('workflows', [])
    this.mockData.set('project_files', [])
    this.mockData.set('chat_sessions', [])
    this.mockData.set('chat_messages', [])
  }

  /**
   * Check if using mock database
   */
  public isMock(): boolean {
    return this.useMock
  }

  /**
   * Get Supabase client (throws if using mock)
   */
  public getClient(): SupabaseClient<Database> {
    if (!this.supabase) {
      throw ErrorFactory.database('Supabase client not available (using mock database)')
    }
    return this.supabase
  }

  /**
   * Insert data
   */
  async insert<T = any>(table: string, data: T | T[]): Promise<{ data: T[] | null; error: any }> {
    if (this.useMock) {
      return this.mockInsert(table, data)
    }

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
    if (this.useMock) {
      return this.mockUpdate(table, data, match)
    }

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
    if (this.useMock) {
      return this.mockUpsert(table, data)
    }

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
    if (this.useMock) {
      return this.mockSelect(table, options)
    }

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
    if (this.useMock) {
      return this.mockDelete(table, match)
    }

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

  /**
   * Mock implementations
   */
  private mockInsert<T>(table: string, data: T | T[]): { data: T[] | null; error: any } {
    const items = Array.isArray(data) ? data : [data]
    const tableData = this.mockData.get(table) || []

    // Add IDs and timestamps
    const newItems = items.map((item: any) => ({
      id: item.id || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    }))

    tableData.push(...newItems)
    this.mockData.set(table, tableData)

    console.log(`[MockDB] Inserted ${newItems.length} rows into ${table}`)
    return { data: newItems as T[], error: null }
  }

  private mockUpdate<T>(
    table: string,
    data: Partial<T>,
    match: Record<string, any>
  ): { data: T[] | null; error: any } {
    const tableData = this.mockData.get(table) || []
    const updated: T[] = []

    for (let i = 0; i < tableData.length; i++) {
      const item = tableData[i]
      let matches = true

      // Check if item matches all conditions
      for (const [key, value] of Object.entries(match)) {
        if (item[key] !== value) {
          matches = false
          break
        }
      }

      if (matches) {
        tableData[i] = {
          ...item,
          ...data,
          updated_at: new Date().toISOString(),
        }
        updated.push(tableData[i])
      }
    }

    this.mockData.set(table, tableData)

    console.log(`[MockDB] Updated ${updated.length} rows in ${table}`)
    return { data: updated, error: null }
  }

  private mockUpsert<T>(table: string, data: T | T[]): { data: T[] | null; error: any } {
    const items = Array.isArray(data) ? data : [data]
    const tableData = this.mockData.get(table) || []
    const upserted: T[] = []

    for (const item of items) {
      const itemId = (item as any).id
      const existingIndex = tableData.findIndex((t: any) => t.id === itemId)

      if (existingIndex >= 0) {
        // Update existing
        tableData[existingIndex] = {
          ...tableData[existingIndex],
          ...item,
          updated_at: new Date().toISOString(),
        }
        upserted.push(tableData[existingIndex])
      } else {
        // Insert new
        const newItem = {
          id: itemId || `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...item,
          created_at: (item as any).created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        tableData.push(newItem)
        upserted.push(newItem as T)
      }
    }

    this.mockData.set(table, tableData)

    console.log(`[MockDB] Upserted ${upserted.length} rows in ${table}`)
    return { data: upserted, error: null }
  }

  private mockSelect<T>(
    table: string,
    options?: {
      columns?: string
      match?: Record<string, any>
      order?: { column: string; ascending?: boolean }
      limit?: number
    }
  ): { data: T[] | null; error: any } {
    let tableData = this.mockData.get(table) || []

    // Apply match filter
    if (options?.match) {
      tableData = tableData.filter((item: any) => {
        for (const [key, value] of Object.entries(options.match!)) {
          if (item[key] !== value) {
            return false
          }
        }
        return true
      })
    }

    // Apply order
    if (options?.order) {
      const { column, ascending = true } = options.order
      tableData.sort((a: any, b: any) => {
        const aVal = a[column]
        const bVal = b[column]
        if (aVal < bVal) return ascending ? -1 : 1
        if (aVal > bVal) return ascending ? 1 : -1
        return 0
      })
    }

    // Apply limit
    if (options?.limit) {
      tableData = tableData.slice(0, options.limit)
    }

    console.log(`[MockDB] Selected ${tableData.length} rows from ${table}`)
    return { data: tableData as T[], error: null }
  }

  private mockDelete(
    table: string,
    match: Record<string, any>
  ): { data: any; error: any } {
    const tableData = this.mockData.get(table) || []
    const filtered = tableData.filter((item: any) => {
      for (const [key, value] of Object.entries(match)) {
        if (item[key] === value) {
          return false // Remove matching items
        }
      }
      return true
    })

    const deletedCount = tableData.length - filtered.length
    this.mockData.set(table, filtered)

    console.log(`[MockDB] Deleted ${deletedCount} rows from ${table}`)
    return { data: { count: deletedCount }, error: null }
  }

  /**
   * Get mock data (for testing)
   */
  public getMockData(table: string): any[] {
    return this.mockData.get(table) || []
  }

  /**
   * Clear mock data (for testing)
   */
  public clearMockData(table?: string) {
    if (table) {
      this.mockData.set(table, [])
    } else {
      this.initializeMockData()
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
