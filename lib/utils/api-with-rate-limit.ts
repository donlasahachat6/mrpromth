/**
 * API Route Rate Limiting Wrapper
 * Unified utility to apply rate limiting to Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter, addRateLimitHeaders, type RateLimitInfo } from './rate-limiter'

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: NextRequest): string {
  // Try user ID from auth header first
  const userId = req.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }

  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Higher-order function to wrap API route handlers with rate limiting
 * Simplified version that works with Next.js 14 route handlers
 */
export function withRateLimit(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  limiter: RateLimiter,
  options?: {
    getKey?: (req: NextRequest) => string
    onLimitExceeded?: (info: RateLimitInfo) => NextResponse
  }
) {
  return async function (req: NextRequest, context?: any) {
      try {
        // Get client identifier
        const key = options?.getKey ? options.getKey(req) : getClientIdentifier(req)
        
        // Check rate limit
        const info = await limiter.check(key)
        
        // If limit exceeded
        if (info.remaining < 0) {
          if (options?.onLimitExceeded) {
            return options.onLimitExceeded(info)
          }
          
          // Default rate limit response
          const headers = new Headers()
          addRateLimitHeaders(headers, info)
          
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.',
              limit: info.limit,
              remaining: 0,
              reset: new Date(info.reset).toISOString(),
              retryAfter: info.retryAfter,
            },
            {
              status: 429,
              headers,
            }
          )
        }
        
      // Execute handler
      const response = context ? await handler(req, context) : await handler(req)
      
      // Add rate limit headers to response
      addRateLimitHeaders(response.headers, info)
      
      return response
    } catch (error) {
      // If error is rate limit related, return 429
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: error.message,
          },
          { status: 429 }
        )
      }
      
      // Re-throw other errors
      throw error
    }
  }
}

/**
 * Simple wrapper for routes that need basic rate limiting
 */
export function rateLimited(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  limiter: RateLimiter
) {
  return withRateLimit(handler, limiter)
}
