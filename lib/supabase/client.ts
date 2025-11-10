/**
 * Safe Supabase Client
 * Creates client safely without throwing errors during build
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../database.types'

let cachedClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

/**
 * Get or create Supabase client
 * Safe to call during SSR/build time
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // During SSR/build, return a mock client that won't be used
    return null as any
  }

  if (!cachedClient) {
    try {
      cachedClient = createClientComponentClient<Database>()
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      return null as any
    }
  }

  return cachedClient
}

/**
 * Create a new Supabase client (for components)
 * This is safe to use in client components
 */
export function createSafeSupabaseClient() {
  if (typeof window === 'undefined') {
    return null as any
  }

  try {
    return createClientComponentClient<Database>()
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null as any
  }
}
