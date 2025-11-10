/**
 * Test Error Handler
 * ทดสอบการทำงานของ error handling system
 */

import {
  ErrorFactory,
  retryWithBackoff,
  withTimeout,
  safeJsonParse,
} from './lib/utils/error-handler'

async function testErrorFactory() {
  console.log('\n🧪 Testing Error Factory...\n')

  try {
    // Test 1: Validation error
    console.log('Test 1: Validation Error')
    throw ErrorFactory.validation('Invalid email format', { email: 'invalid@' })
  } catch (error: any) {
    console.log('✅ Caught validation error:', error.message)
    console.log('   Type:', error.type)
    console.log('   Status:', error.statusCode)
  }

  try {
    // Test 2: Not found error
    console.log('\nTest 2: Not Found Error')
    throw ErrorFactory.notFound('User')
  } catch (error: any) {
    console.log('✅ Caught not found error:', error.message)
    console.log('   Type:', error.type)
    console.log('   Status:', error.statusCode)
  }

  try {
    // Test 3: Rate limit error
    console.log('\nTest 3: Rate Limit Error')
    throw ErrorFactory.rateLimit()
  } catch (error: any) {
    console.log('✅ Caught rate limit error:', error.message)
    console.log('   Type:', error.type)
    console.log('   Status:', error.statusCode)
  }

  try {
    // Test 4: AI model error
    console.log('\nTest 4: AI Model Error')
    throw ErrorFactory.aiModel('model_1', 'Connection timeout')
  } catch (error: any) {
    console.log('✅ Caught AI model error:', error.message)
    console.log('   Type:', error.type)
    console.log('   Context:', error.context)
  }

  console.log('\n✅ Error Factory tests passed!\n')
}

async function testRetryWithBackoff() {
  console.log('🧪 Testing Retry with Backoff...\n')

  let attemptCount = 0

  // Test: Operation that fails twice then succeeds
  const result = await retryWithBackoff(
    async () => {
      attemptCount++
      console.log(`Attempt ${attemptCount}...`)

      if (attemptCount < 3) {
        throw new Error('Temporary failure')
      }

      return 'Success!'
    },
    {
      maxRetries: 5,
      initialDelay: 100,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        console.log(`  Retry ${attempt}: ${error.message}`)
      },
    }
  )

  console.log(`✅ Result: ${result}`)
  console.log(`   Total attempts: ${attemptCount}\n`)
}

async function testWithTimeout() {
  console.log('🧪 Testing Timeout Wrapper...\n')

  try {
    // Test 1: Operation completes in time
    console.log('Test 1: Fast operation (should succeed)')
    const result1 = await withTimeout(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'Completed'
      },
      1000,
      'Fast operation'
    )
    console.log('✅ Result:', result1)
  } catch (error: any) {
    console.log('❌ Unexpected error:', error.message)
  }

  try {
    // Test 2: Operation times out
    console.log('\nTest 2: Slow operation (should timeout)')
    await withTimeout(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return 'Should not reach here'
      },
      500,
      'Slow operation'
    )
    console.log('❌ Should have timed out')
  } catch (error: any) {
    console.log('✅ Caught timeout error:', error.message)
    console.log('   Type:', error.type)
  }

  console.log()
}

async function testSafeJsonParse() {
  console.log('🧪 Testing Safe JSON Parse...\n')

  // Test 1: Valid JSON
  const valid = safeJsonParse('{"name": "John", "age": 30}')
  console.log('Test 1: Valid JSON')
  console.log('✅ Result:', valid)

  // Test 2: Invalid JSON
  const invalid = safeJsonParse('{ invalid json }')
  console.log('\nTest 2: Invalid JSON')
  console.log('✅ Result:', invalid, '(should be null)')

  // Test 3: Invalid JSON with fallback
  const withFallback = safeJsonParse('{ invalid }', { default: 'value' })
  console.log('\nTest 3: Invalid JSON with fallback')
  console.log('✅ Result:', withFallback)

  console.log()
}

async function testIntegratedScenario() {
  console.log('🧪 Testing Integrated Scenario...\n')
  console.log('Scenario: API call with retry and timeout\n')

  let apiCallCount = 0

  try {
    const result = await retryWithBackoff(
      async () => {
        apiCallCount++
        console.log(`API call attempt ${apiCallCount}`)

        // Simulate API call with timeout
        return withTimeout(
          async () => {
            // Simulate processing
            const delay = apiCallCount === 1 ? 2000 : 100 // First call times out
            await new Promise(resolve => setTimeout(resolve, delay))

            // Simulate occasional failure
            if (apiCallCount === 2) {
              throw ErrorFactory.externalApi('TestAPI', 'Service unavailable')
            }

            return { data: 'Success', attempt: apiCallCount }
          },
          1000,
          'API call'
        )
      },
      {
        maxRetries: 5,
        initialDelay: 200,
        onRetry: (attempt, error) => {
          console.log(`  Retrying (${attempt}): ${error.message}`)
        },
      }
    )

    console.log('\n✅ Final result:', result)
    console.log(`   Total API calls: ${apiCallCount}`)
  } catch (error: any) {
    console.log('\n❌ Failed after all retries:', error.message)
  }

  console.log()
}

async function runAllTests() {
  console.log('='.repeat(80))
  console.log('🧪 Error Handler Test Suite')
  console.log('='.repeat(80))

  try {
    await testErrorFactory()
    await testRetryWithBackoff()
    await testWithTimeout()
    await testSafeJsonParse()
    await testIntegratedScenario()

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
