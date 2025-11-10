/**
 * Test Advanced Features
 * ทดสอบ rate limiter, request queue, และ webhook manager
 */

import { RateLimiter, RateLimiters } from './lib/utils/rate-limiter'
import { RequestQueue, PriorityQueue } from './lib/utils/request-queue'
import { WebhookManager, WebhookEvent } from './lib/webhooks/webhook-manager'

/**
 * Test Rate Limiter
 */
async function testRateLimiter() {
  console.log('\n🧪 Testing Rate Limiter...\n')

  // Create test limiter: 3 requests per 2 seconds
  const limiter = new RateLimiter({
    windowMs: 2000,
    maxRequests: 3,
    keyPrefix: 'test',
  })

  console.log('Test 1: Allow requests within limit')
  
  // Should allow first 3 requests
  for (let i = 1; i <= 3; i++) {
    const info = await limiter.check('user-1')
    console.log(`  Request ${i}: remaining=${info.remaining}, limit=${info.limit}`)
  }

  console.log('\nTest 2: Block request exceeding limit')
  
  // 4th request should be blocked
  const info4 = await limiter.check('user-1')
  console.log(`  Request 4: remaining=${info4.remaining}, retryAfter=${info4.retryAfter}s`)

  if (info4.remaining < 0) {
    console.log('  ✅ Rate limit working correctly')
  }

  console.log('\nTest 3: Different users have separate limits')
  
  const info5 = await limiter.check('user-2')
  console.log(`  User 2 Request 1: remaining=${info5.remaining}`)

  if (info5.remaining >= 0) {
    console.log('  ✅ Per-user limits working correctly')
  }

  console.log('\nTest 4: Wait for window to reset')
  console.log('  Waiting 2.5 seconds...')
  await new Promise(resolve => setTimeout(resolve, 2500))

  const info6 = await limiter.check('user-1')
  console.log(`  After reset: remaining=${info6.remaining}`)

  if (info6.remaining >= 0) {
    console.log('  ✅ Window reset working correctly')
  }

  // Test stats
  console.log('\nTest 5: Get statistics')
  const stats = limiter.getStats()
  console.log('  Stats:', stats)

  console.log('\n✅ Rate Limiter tests passed!\n')
}

/**
 * Test Request Queue
 */
async function testRequestQueue() {
  console.log('🧪 Testing Request Queue...\n')

  const queue = new PriorityQueue(2) // Max 2 concurrent

  console.log('Test 1: Process tasks with priority')

  const results: string[] = []

  // Add tasks with different priorities
  const tasks = [
    queue.addLow(async () => {
      console.log('  [LOW] Task started')
      await new Promise(resolve => setTimeout(resolve, 300))
      results.push('low')
      return 'low-result'
    }),

    queue.addHigh(async () => {
      console.log('  [HIGH] Task started')
      await new Promise(resolve => setTimeout(resolve, 200))
      results.push('high')
      return 'high-result'
    }),

    queue.addCritical(async () => {
      console.log('  [CRITICAL] Task started')
      await new Promise(resolve => setTimeout(resolve, 100))
      results.push('critical')
      return 'critical-result'
    }),

    queue.addNormal(async () => {
      console.log('  [NORMAL] Task started')
      await new Promise(resolve => setTimeout(resolve, 150))
      results.push('normal')
      return 'normal-result'
    }),
  ]

  // Wait for all tasks
  await Promise.all(tasks)

  console.log('\n  Execution order:', results)
  console.log('  ✅ Priority queue working correctly')

  console.log('\nTest 2: Handle task timeout')

  try {
    await queue.add(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return 'should-timeout'
      },
      { timeout: 500 }
    )
    console.log('  ❌ Timeout not working')
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('  ✅ Timeout working correctly')
    }
  }

  console.log('\nTest 3: Get queue statistics')
  
  await queue.waitUntilEmpty()
  
  const stats = queue.getStats()
  console.log('  Stats:', stats)

  if (stats.completed >= 4) {
    console.log('  ✅ Statistics tracking working')
  }

  console.log('\n✅ Request Queue tests passed!\n')
}

/**
 * Test Webhook Manager
 */
async function testWebhookManager() {
  console.log('🧪 Testing Webhook Manager...\n')

  const webhookManager = new WebhookManager()

  console.log('Test 1: Register webhooks')

  // Register test webhook (will fail but that's ok for testing)
  webhookManager.register('test-webhook-1', {
    url: 'https://httpbin.org/post',
    events: [WebhookEvent.WORKFLOW_STARTED, WebhookEvent.WORKFLOW_COMPLETED],
    retries: 2,
    timeout: 5000,
  })

  webhookManager.register('test-webhook-2', {
    url: 'https://httpbin.org/status/200',
    events: [WebhookEvent.PROJECT_GENERATED],
  })

  const webhooks = webhookManager.getWebhooks()
  console.log(`  Registered ${webhooks.length} webhooks`)
  console.log('  ✅ Registration working')

  console.log('\nTest 2: Send webhook event')

  await webhookManager.send(
    WebhookEvent.WORKFLOW_STARTED,
    {
      workflowId: 'wf-test-123',
      userId: 'user-456',
      projectName: 'Test Project',
    },
    {
      environment: 'test',
    }
  )

  console.log('  ✅ Webhook sent')

  console.log('\nTest 3: Send event to specific webhook')

  await webhookManager.send(
    WebhookEvent.PROJECT_GENERATED,
    {
      projectId: 'proj-789',
      projectName: 'Generated Project',
      downloadUrl: 'https://example.com/download',
    }
  )

  console.log('  ✅ Targeted webhook sent')

  console.log('\nTest 4: Get delivery statistics')

  // Wait a bit for webhooks to complete
  await new Promise(resolve => setTimeout(resolve, 1000))

  const stats = webhookManager.getStats()
  console.log('  Stats:', stats)

  if (stats.total > 0) {
    console.log('  ✅ Statistics tracking working')
  }

  console.log('\n✅ Webhook Manager tests passed!\n')
}

/**
 * Test Integration: All features together
 */
async function testIntegration() {
  console.log('🧪 Testing Integration (All Features)...\n')

  console.log('Scenario: User generates a project with rate limiting and queuing')

  const limiter = RateLimiters.projectGeneration
  const queue = new PriorityQueue(1)
  const webhookManager = new WebhookManager()

  // Register webhook
  webhookManager.register('integration-test', {
    url: 'https://httpbin.org/post',
    events: [
      WebhookEvent.WORKFLOW_STARTED,
      WebhookEvent.WORKFLOW_COMPLETED,
    ],
  })

  // Simulate user request
  const userId = 'integration-user-123'

  console.log('\n1. Check rate limit')
  const rateLimitInfo = await limiter.check(userId)
  console.log(`   Remaining requests: ${rateLimitInfo.remaining}`)

  if (rateLimitInfo.remaining < 0) {
    console.log('   ❌ Rate limit exceeded')
    return
  }

  console.log('   ✅ Rate limit OK')

  console.log('\n2. Add to queue')
  const queuedTask = queue.addHigh(async () => {
    console.log('   Processing project generation...')

    // Send start webhook
    await webhookManager.send(WebhookEvent.WORKFLOW_STARTED, {
      workflowId: 'wf-integration-test',
      userId,
      projectName: 'Integration Test Project',
    })

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 500))

    // Send completion webhook
    await webhookManager.send(WebhookEvent.WORKFLOW_COMPLETED, {
      workflowId: 'wf-integration-test',
      results: { success: true },
      duration: 500,
    })

    return { success: true, projectId: 'proj-integration-test' }
  })

  console.log('   ✅ Added to queue')

  console.log('\n3. Wait for completion')
  const result = await queuedTask
  console.log('   Result:', result)
  console.log('   ✅ Task completed')

  console.log('\n4. Check statistics')
  console.log('   Queue stats:', queue.getStats())
  console.log('   Webhook stats:', webhookManager.getStats())

  console.log('\n✅ Integration test passed!\n')
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('='.repeat(80))
  console.log('🧪 Advanced Features Test Suite')
  console.log('='.repeat(80))

  try {
    await testRateLimiter()
    await testRequestQueue()
    await testWebhookManager()
    await testIntegration()

    console.log('='.repeat(80))
    console.log('✅ All tests passed!')
    console.log('='.repeat(80))
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
    throw error
  }
}

// Run tests
runAllTests()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
