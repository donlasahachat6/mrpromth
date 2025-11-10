/**
 * Smart Database Wrapper
 * Wraps any Supabase call to automatically use mock if Supabase is unavailable
 */

import { isSupabaseConfigured } from './unified-db'
import { DatabaseClient } from './db-client'

const mockDb = new DatabaseClient()

/**
 * Wrap a Supabase operation to automatically fallback to mock
 */
export async function wrapSupabaseCall<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  mockFallback: () => Promise<T>
): Promise<T> {
  if (!isSupabaseConfigured()) {
    // Use mock
    return await mockFallback()
  }

  try {
    const { data, error } = await operation()
    
    if (error) {
      // If Supabase fails, try mock as fallback
      console.warn('Supabase error, falling back to mock:', error.message)
      return await mockFallback()
    }
    
    return data as T
  } catch (err: any) {
    // If Supabase completely fails, use mock
    console.warn('Supabase failed, using mock:', err.message)
    return await mockFallback()
  }
}

/**
 * Create a safe Supabase client that never throws
 */
export function createSafeSupabaseClient(supabase: any) {
  if (!isSupabaseConfigured() || !supabase) {
    // Return mock client
    return {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: 'Using mock mode' } }),
            order: () => ({ data: [], error: null }),
          }),
          order: () => ({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Using mock mode' } }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'Using mock mode' } }),
            }),
          }),
        }),
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signIn: async () => ({ data: null, error: { message: 'Using mock mode' } }),
        signUp: async () => ({ data: null, error: { message: 'Using mock mode' } }),
        signOut: async () => ({ error: null }),
      },
    }
  }

  return supabase
}

/**
 * Execute database operation with automatic fallback
 */
export async function executeDbOperation<T>(
  tableName: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  params: any
): Promise<T | T[] | null> {
  if (!isSupabaseConfigured()) {
    // Use mock database
    switch (operation) {
      case 'select':
        const { data: selectData } = await mockDb.select(tableName, params)
        return selectData as T[]
      
      case 'insert':
        const { data: insertData } = await mockDb.insert(tableName, params)
        return insertData?.[0] as T
      
      case 'update':
        const { data: updateData } = await mockDb.update(tableName, params.updates, params.match)
        return updateData?.[0] as T
      
      case 'delete':
        await mockDb.delete(tableName, params)
        return null
      
      default:
        return null
    }
  }

  // If we get here, Supabase should be used (handled by caller)
  return null
}
