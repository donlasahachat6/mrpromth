/**
 * Cache Manager
 * In-memory caching layer for database queries and API responses
 */

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

/**
 * Cache statistics
 */
interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

/**
 * Cache manager class
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<any>>
  private stats: { hits: number; misses: number }
  private maxSize: number
  private defaultTTL: number

  constructor(options?: { maxSize?: number; defaultTTL?: number }) {
    this.cache = new Map()
    this.stats = { hits: 0, misses: 0 }
    this.maxSize = options?.maxSize || 1000
    this.defaultTTL = options?.defaultTTL || 300000 // 5 minutes default
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update hits
    entry.hits++
    this.stats.hits++

    return entry.data as T
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Check size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
    })
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Clear cache by pattern
   */
  clearPattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    let count = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Get or set (fetch if not in cache)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)

    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)

    return data
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      console.log(`[CacheManager] Evicted oldest entry: ${oldestKey}`)
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let leastHits = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
      console.log(`[CacheManager] Evicted LRU entry: ${lruKey}`)
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    let count = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0) {
      console.log(`[CacheManager] Cleaned ${count} expired entries`)
    }

    return count
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Print cache summary
   */
  printSummary(): void {
    const stats = this.getStats()

    console.log('\n📊 Cache Summary')
    console.log('='.repeat(50))
    console.log(`Size: ${stats.size} / ${this.maxSize}`)
    console.log(`Hits: ${stats.hits}`)
    console.log(`Misses: ${stats.misses}`)
    console.log(`Hit Rate: ${stats.hitRate}%`)
    console.log('='.repeat(50))
  }
}

/**
 * Global cache instance
 */
export const cache = new CacheManager({
  maxSize: 1000,
  defaultTTL: 300000, // 5 minutes
})

/**
 * Cache key builders
 */
export const CacheKeys = {
  workflow: (id: string) => `workflow:${id}`,
  workflowList: (userId: string) => `workflows:user:${userId}`,
  projectFiles: (workflowId: string) => `project_files:workflow:${workflowId}`,
  chatSession: (id: string) => `chat_session:${id}`,
  chatMessages: (sessionId: string) => `chat_messages:session:${sessionId}`,
  user: (id: string) => `user:${id}`,
  aiResponse: (prompt: string, model: string) => 
    `ai:${model}:${Buffer.from(prompt).toString('base64').substring(0, 50)}`,
}

/**
 * Helper function to cache database queries
 */
export async function cachedQuery<T>(
  key: string,
  query: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return cache.getOrSet(key, query, ttl)
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Example 1: Simple get/set
  cache.set('user:123', { id: '123', name: 'John' })
  const user = cache.get('user:123')
  console.log('User:', user)

  // Example 2: Get or set with fetcher
  const workflow = await cache.getOrSet(
    'workflow:abc',
    async () => {
      // Simulate database query
      return { id: 'abc', status: 'completed' }
    },
    60000 // 1 minute TTL
  )
  console.log('Workflow:', workflow)

  // Example 3: Clear pattern
  cache.set('workflow:1', { id: '1' })
  cache.set('workflow:2', { id: '2' })
  cache.set('user:1', { id: '1' })
  
  const cleared = cache.clearPattern(/^workflow:/)
  console.log('Cleared:', cleared, 'workflow entries')

  // Example 4: Statistics
  cache.printSummary()

  // Example 5: Clean expired
  const expired = cache.cleanExpired()
  console.log('Cleaned:', expired, 'expired entries')
}
