/**
 * Rate Limiter Test Script
 * Tests rate limiting functionality on API routes
 */

import { RateLimiter } from './lib/utils/rate-limiter'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL'
  message: string
  details?: any
}

const results: TestResult[] = []

/**
 * Test 1: Basic rate limiter functionality
 */
async function testBasicRateLimiter() {
  console.log('\n🧪 Test 1: Basic Rate Limiter Functionality')
  
  try {
    const limiter = new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
      keyPrefix: 'test'
    })
    
    // Make 5 requests (should all succeed)
    for (let i = 1; i <= 5; i++) {
      const info = await limiter.check('test-user-1')
      console.log(`  Request ${i}: remaining=${info.remaining}, limit=${info.limit}`)
      
      if (info.remaining < 0) {
        results.push({
          test: 'Basic Rate Limiter',
          status: 'FAIL',
          message: `Request ${i} should succeed but was rate limited`,
          details: info
        })
        return
      }
    }
    
    // 6th request should be rate limited
    const info = await limiter.check('test-user-1')
    console.log(`  Request 6: remaining=${info.remaining}, limit=${info.limit}`)
    
    if (info.remaining >= 0) {
      results.push({
        test: 'Basic Rate Limiter',
        status: 'FAIL',
        message: 'Request 6 should be rate limited but was allowed',
        details: info
      })
      return
    }
    
    results.push({
      test: 'Basic Rate Limiter',
      status: 'PASS',
      message: 'Rate limiter correctly limits requests after threshold'
    })
    
  } catch (error) {
    results.push({
      test: 'Basic Rate Limiter',
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test 2: Multiple users isolation
 */
async function testMultipleUsersIsolation() {
  console.log('\n🧪 Test 2: Multiple Users Isolation')
  
  try {
    const limiter = new RateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 3,
      keyPrefix: 'test-isolation'
    })
    
    // User 1: Make 3 requests
    for (let i = 1; i <= 3; i++) {
      await limiter.check('user-1')
    }
    
    // User 1: 4th request should be limited
    const user1Info = await limiter.check('user-1')
    if (user1Info.remaining >= 0) {
      results.push({
        test: 'Multiple Users Isolation',
        status: 'FAIL',
        message: 'User 1 should be rate limited',
        details: user1Info
      })
      return
    }
    
    // User 2: Should still be able to make requests
    const user2Info = await limiter.check('user-2')
    if (user2Info.remaining < 0) {
      results.push({
        test: 'Multiple Users Isolation',
        status: 'FAIL',
        message: 'User 2 should not be rate limited',
        details: user2Info
      })
      return
    }
    
    console.log(`  User 1: rate limited ✓`)
    console.log(`  User 2: not limited (remaining=${user2Info.remaining}) ✓`)
    
    results.push({
      test: 'Multiple Users Isolation',
      status: 'PASS',
      message: 'Rate limits are correctly isolated per user'
    })
    
  } catch (error) {
    results.push({
      test: 'Multiple Users Isolation',
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test 3: Rate limit headers
 */
async function testRateLimitHeaders() {
  console.log('\n🧪 Test 3: Rate Limit Headers')
  
  try {
    const limiter = new RateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 10,
      keyPrefix: 'test-headers'
    })
    
    const info = await limiter.check('test-user-headers')
    
    // Check that info contains required fields
    const requiredFields = ['limit', 'remaining', 'reset']
    const missingFields = requiredFields.filter(field => !(field in info))
    
    if (missingFields.length > 0) {
      results.push({
        test: 'Rate Limit Headers',
        status: 'FAIL',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: info
      })
      return
    }
    
    console.log(`  limit: ${info.limit} ✓`)
    console.log(`  remaining: ${info.remaining} ✓`)
    console.log(`  reset: ${info.reset} ✓`)
    
    results.push({
      test: 'Rate Limit Headers',
      status: 'PASS',
      message: 'Rate limit info contains all required fields'
    })
    
  } catch (error) {
    results.push({
      test: 'Rate Limit Headers',
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test 4: Pre-configured limiters exist
 */
async function testPreConfiguredLimiters() {
  console.log('\n🧪 Test 4: Pre-configured Limiters')
  
  try {
    const { RateLimiters } = await import('./lib/utils/rate-limiter')
    
    const requiredLimiters = [
      'strict',
      'standard',
      'generous',
      'ai',
      'projectGeneration',
      'login'
    ]
    
    const missingLimiters = requiredLimiters.filter(name => !(name in RateLimiters))
    
    if (missingLimiters.length > 0) {
      results.push({
        test: 'Pre-configured Limiters',
        status: 'FAIL',
        message: `Missing limiters: ${missingLimiters.join(', ')}`
      })
      return
    }
    
    console.log(`  Found all ${requiredLimiters.length} pre-configured limiters ✓`)
    
    results.push({
      test: 'Pre-configured Limiters',
      status: 'PASS',
      message: 'All pre-configured limiters are available'
    })
    
  } catch (error) {
    results.push({
      test: 'Pre-configured Limiters',
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test 5: API wrapper exists
 */
async function testAPIWrapper() {
  console.log('\n🧪 Test 5: API Wrapper Exists')
  
  try {
    const { withRateLimit, getClientIdentifier } = await import('./lib/utils/api-with-rate-limit')
    
    if (typeof withRateLimit !== 'function') {
      results.push({
        test: 'API Wrapper',
        status: 'FAIL',
        message: 'withRateLimit is not a function'
      })
      return
    }
    
    if (typeof getClientIdentifier !== 'function') {
      results.push({
        test: 'API Wrapper',
        status: 'FAIL',
        message: 'getClientIdentifier is not a function'
      })
      return
    }
    
    console.log(`  withRateLimit: function ✓`)
    console.log(`  getClientIdentifier: function ✓`)
    
    results.push({
      test: 'API Wrapper',
      status: 'PASS',
      message: 'API wrapper functions are available'
    })
    
  } catch (error) {
    results.push({
      test: 'API Wrapper',
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Rate Limiter Tests\n')
  console.log('=' .repeat(80))
  
  await testBasicRateLimiter()
  await testMultipleUsersIsolation()
  await testRateLimitHeaders()
  await testPreConfiguredLimiters()
  await testAPIWrapper()
  
  console.log('\n' + '=' .repeat(80))
  console.log('\n📊 Test Summary\n')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const total = results.length
  
  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`\n  Test: ${r.test}`)
      console.log(`  Message: ${r.message}`)
      if (r.details) {
        console.log(`  Details: ${JSON.stringify(r.details, null, 2)}`)
      }
    })
  }
  
  console.log('\n✅ Rate Limiter Tests Completed!')
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
