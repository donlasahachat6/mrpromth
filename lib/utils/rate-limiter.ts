/**
 * Rate Limiter
 * Limit requests per user/IP to prevent abuse
 */

import { ErrorFactory } from './error-handler'

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyPrefix?: string // Prefix for storage keys
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Timestamp when limit resets
  retryAfter?: number // Seconds until retry
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private requests: Map<string, number[]> // key -> timestamps
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.requests = new Map()
    this.config = config

    // Clean up old entries periodically
    setInterval(() => this.cleanup(), config.windowMs)
  }

  /**
   * Check if request is allowed
   */
  async check(key: string): Promise<RateLimitInfo> {
    const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get existing requests
    let timestamps = this.requests.get(fullKey) || []

    // Filter out old requests
    timestamps = timestamps.filter(ts => ts > windowStart)

    // Calculate remaining
    const remaining = Math.max(0, this.config.maxRequests - timestamps.length)
    const reset = now + this.config.windowMs

    // Check if limit exceeded
    if (timestamps.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...timestamps)
      const retryAfter = Math.ceil((oldestRequest + this.config.windowMs - now) / 1000)

      return {
        limit: this.config.maxRequests,
        remaining: -1, // Negative to indicate rate limit exceeded
        reset,
        retryAfter,
      }
    }

    // Add current request
    timestamps.push(now)
    this.requests.set(fullKey, timestamps)

    return {
      limit: this.config.maxRequests,
      remaining: remaining - 1,
      reset,
    }
  }

  /**
   * Check and throw if limit exceeded
   */
  async checkAndThrow(key: string): Promise<void> {
    const info = await this.check(key)

    if (info.remaining < 0) {
      throw ErrorFactory.rateLimit(
        `Rate limit exceeded. Try again in ${info.retryAfter} seconds.`
      )
    }
  }

  /**
   * Reset limit for key
   */
  reset(key: string): void {
    const fullKey = this.config.keyPrefix ? `${this.config.keyPrefix}:${key}` : key
    this.requests.delete(fullKey)
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(ts => ts > windowStart)

      if (filtered.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, filtered)
      }
    }
  }

  /**
   * Get current stats
   */
  getStats(): { totalKeys: number; totalRequests: number } {
    let totalRequests = 0

    for (const timestamps of this.requests.values()) {
      totalRequests += timestamps.length
    }

    return {
      totalKeys: this.requests.size,
      totalRequests,
    }
  }
}

/**
 * Create rate limiter middleware for Next.js API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config)

  return async function rateLimitMiddleware(
    req: Request,
    getUserKey: (req: Request) => string = (req) => {
      // Default: use IP address
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
      return ip
    }
  ): Promise<RateLimitInfo> {
    const key = getUserKey(req)
    const info = await limiter.check(key)

    if (info.remaining < 0) {
      throw ErrorFactory.rateLimit(
        `Rate limit exceeded. Try again in ${info.retryAfter} seconds.`
      )
    }

    return info
  }
}

/**
 * Pre-configured rate limiters
 */
export const RateLimiters = {
  // Strict: 10 requests per minute
  strict: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'strict',
  }),

  // Standard: 30 requests per minute
  standard: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'standard',
  }),

  // Generous: 100 requests per minute
  generous: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'generous',
  }),

  // AI requests: 20 per minute
  ai: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyPrefix: 'ai',
  }),

  // Project generation: 5 per hour
  projectGeneration: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'project',
  }),

  // Login attempts: 5 per 15 minutes
  login: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'login',
  }),
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  info: RateLimitInfo
): Headers {
  headers.set('X-RateLimit-Limit', info.limit.toString())
  headers.set('X-RateLimit-Remaining', info.remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(info.reset).toISOString())

  if (info.retryAfter) {
    headers.set('Retry-After', info.retryAfter.toString())
  }

  return headers
}

/**
 * Example usage in API route
 */
export async function exampleApiRoute(req: Request) {
  try {
    // Check rate limit
    const info = await RateLimiters.standard.check('user-123')

    // Process request
    const result = { success: true, data: 'response' }

    // Add rate limit headers
    const headers = new Headers()
    addRateLimitHeaders(headers, info)

    return new Response(JSON.stringify(result), { headers })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 429 }
      )
    }

    throw error
  }
}
