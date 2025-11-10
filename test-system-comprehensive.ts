/**
 * Comprehensive System Test
 * Tests all major components and integrations
 */

interface TestResult {
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  message: string
  details?: any
}

const results: TestResult[] = []

/**
 * Test Category 1: Rate Limiting
 */
async function testRateLimiting() {
  console.log('\n📦 Category 1: Rate Limiting')
  
  try {
    const { RateLimiter, RateLimiters } = await import('./lib/utils/rate-limiter')
    const { withRateLimit } = await import('./lib/utils/api-with-rate-limit')
    
    // Test 1.1: Rate limiter exists
    if (typeof RateLimiter !== 'function') {
      results.push({
        category: 'Rate Limiting',
        test: 'RateLimiter class exists',
        status: 'FAIL',
        message: 'RateLimiter is not a constructor'
      })
    } else {
      results.push({
        category: 'Rate Limiting',
        test: 'RateLimiter class exists',
        status: 'PASS',
        message: 'RateLimiter class is available'
      })
    }
    
    // Test 1.2: Pre-configured limiters
    const requiredLimiters = ['strict', 'standard', 'generous', 'ai', 'projectGeneration', 'login']
    const missingLimiters = requiredLimiters.filter(name => !(name in RateLimiters))
    
    if (missingLimiters.length > 0) {
      results.push({
        category: 'Rate Limiting',
        test: 'Pre-configured limiters',
        status: 'FAIL',
        message: `Missing limiters: ${missingLimiters.join(', ')}`
      })
    } else {
      results.push({
        category: 'Rate Limiting',
        test: 'Pre-configured limiters',
        status: 'PASS',
        message: `All ${requiredLimiters.length} limiters available`
      })
    }
    
    // Test 1.3: API wrapper
    if (typeof withRateLimit !== 'function') {
      results.push({
        category: 'Rate Limiting',
        test: 'API wrapper function',
        status: 'FAIL',
        message: 'withRateLimit is not a function'
      })
    } else {
      results.push({
        category: 'Rate Limiting',
        test: 'API wrapper function',
        status: 'PASS',
        message: 'withRateLimit function available'
      })
    }
    
  } catch (error) {
    results.push({
      category: 'Rate Limiting',
      test: 'Module import',
      status: 'FAIL',
      message: `Failed to import: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test Category 2: Logging System
 */
async function testLoggingSystem() {
  console.log('\n📦 Category 2: Logging System')
  
  try {
    const { logger, createLogger, LogLevel } = await import('./lib/utils/logger')
    
    // Test 2.1: Logger exists
    if (!logger) {
      results.push({
        category: 'Logging',
        test: 'Default logger',
        status: 'FAIL',
        message: 'Default logger not found'
      })
    } else {
      results.push({
        category: 'Logging',
        test: 'Default logger',
        status: 'PASS',
        message: 'Default logger available'
      })
    }
    
    // Test 2.2: Logger methods
    const methods = ['debug', 'info', 'warn', 'error', 'child']
    const missingMethods = methods.filter(method => typeof (logger as any)[method] !== 'function')
    
    if (missingMethods.length > 0) {
      results.push({
        category: 'Logging',
        test: 'Logger methods',
        status: 'FAIL',
        message: `Missing methods: ${missingMethods.join(', ')}`
      })
    } else {
      results.push({
        category: 'Logging',
        test: 'Logger methods',
        status: 'PASS',
        message: `All ${methods.length} methods available`
      })
    }
    
    // Test 2.3: Create logger function
    if (typeof createLogger !== 'function') {
      results.push({
        category: 'Logging',
        test: 'createLogger function',
        status: 'FAIL',
        message: 'createLogger is not a function'
      })
    } else {
      const testLogger = createLogger('test-module')
      if (!testLogger) {
        results.push({
          category: 'Logging',
          test: 'createLogger function',
          status: 'FAIL',
          message: 'createLogger returned null'
        })
      } else {
        results.push({
          category: 'Logging',
          test: 'createLogger function',
          status: 'PASS',
          message: 'createLogger works correctly'
        })
      }
    }
    
    // Test 2.4: Log levels
    if (!LogLevel) {
      results.push({
        category: 'Logging',
        test: 'Log levels enum',
        status: 'FAIL',
        message: 'LogLevel enum not found'
      })
    } else {
      const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
      const missingLevels = levels.filter(level => !(level in LogLevel))
      
      if (missingLevels.length > 0) {
        results.push({
          category: 'Logging',
          test: 'Log levels enum',
          status: 'FAIL',
          message: `Missing levels: ${missingLevels.join(', ')}`
        })
      } else {
        results.push({
          category: 'Logging',
          test: 'Log levels enum',
          status: 'PASS',
          message: `All ${levels.length} log levels available`
        })
      }
    }
    
  } catch (error) {
    results.push({
      category: 'Logging',
      test: 'Module import',
      status: 'FAIL',
      message: `Failed to import: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test Category 3: Error Monitoring
 */
async function testErrorMonitoring() {
  console.log('\n📦 Category 3: Error Monitoring')
  
  try {
    const { 
      errorMonitor, 
      captureError, 
      captureMessage,
      setUserContext,
      clearUserContext,
      addBreadcrumb
    } = await import('./lib/utils/error-monitoring')
    
    // Test 3.1: Error monitor instance
    if (!errorMonitor) {
      results.push({
        category: 'Error Monitoring',
        test: 'Error monitor instance',
        status: 'FAIL',
        message: 'errorMonitor not found'
      })
    } else {
      results.push({
        category: 'Error Monitoring',
        test: 'Error monitor instance',
        status: 'PASS',
        message: 'Error monitor instance available'
      })
    }
    
    // Test 3.2: Helper functions
    const helpers = [
      { name: 'captureError', fn: captureError },
      { name: 'captureMessage', fn: captureMessage },
      { name: 'setUserContext', fn: setUserContext },
      { name: 'clearUserContext', fn: clearUserContext },
      { name: 'addBreadcrumb', fn: addBreadcrumb }
    ]
    
    const missingHelpers = helpers.filter(h => typeof h.fn !== 'function')
    
    if (missingHelpers.length > 0) {
      results.push({
        category: 'Error Monitoring',
        test: 'Helper functions',
        status: 'FAIL',
        message: `Missing helpers: ${missingHelpers.map(h => h.name).join(', ')}`
      })
    } else {
      results.push({
        category: 'Error Monitoring',
        test: 'Helper functions',
        status: 'PASS',
        message: `All ${helpers.length} helper functions available`
      })
    }
    
    // Test 3.3: Error capture works
    try {
      captureError(new Error('Test error'), { test: true }, 'low')
      results.push({
        category: 'Error Monitoring',
        test: 'Error capture',
        status: 'PASS',
        message: 'Error capture executed without throwing'
      })
    } catch (error) {
      results.push({
        category: 'Error Monitoring',
        test: 'Error capture',
        status: 'FAIL',
        message: `Error capture threw: ${error instanceof Error ? error.message : String(error)}`
      })
    }
    
  } catch (error) {
    results.push({
      category: 'Error Monitoring',
      test: 'Module import',
      status: 'FAIL',
      message: `Failed to import: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test Category 4: Error Handler Integration
 */
async function testErrorHandlerIntegration() {
  console.log('\n📦 Category 4: Error Handler Integration')
  
  try {
    const { AppError, ErrorType, ErrorSeverity, ErrorFactory } = await import('./lib/utils/error-handler')
    
    // Test 4.1: AppError class
    if (typeof AppError !== 'function') {
      results.push({
        category: 'Error Handler',
        test: 'AppError class',
        status: 'FAIL',
        message: 'AppError is not a constructor'
      })
    } else {
      results.push({
        category: 'Error Handler',
        test: 'AppError class',
        status: 'PASS',
        message: 'AppError class available'
      })
    }
    
    // Test 4.2: Error types enum
    if (!ErrorType) {
      results.push({
        category: 'Error Handler',
        test: 'ErrorType enum',
        status: 'FAIL',
        message: 'ErrorType enum not found'
      })
    } else {
      results.push({
        category: 'Error Handler',
        test: 'ErrorType enum',
        status: 'PASS',
        message: 'ErrorType enum available'
      })
    }
    
    // Test 4.3: Error factory
    if (!ErrorFactory) {
      results.push({
        category: 'Error Handler',
        test: 'ErrorFactory',
        status: 'FAIL',
        message: 'ErrorFactory not found'
      })
    } else {
      const factoryMethods = ['validation', 'authentication', 'authorization', 'notFound', 'rateLimit']
      const missingMethods = factoryMethods.filter(method => typeof (ErrorFactory as any)[method] !== 'function')
      
      if (missingMethods.length > 0) {
        results.push({
          category: 'Error Handler',
          test: 'ErrorFactory methods',
          status: 'FAIL',
          message: `Missing methods: ${missingMethods.join(', ')}`
        })
      } else {
        results.push({
          category: 'Error Handler',
          test: 'ErrorFactory methods',
          status: 'PASS',
          message: `All ${factoryMethods.length} factory methods available`
        })
      }
    }
    
  } catch (error) {
    results.push({
      category: 'Error Handler',
      test: 'Module import',
      status: 'FAIL',
      message: `Failed to import: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

/**
 * Test Category 5: File Structure
 */
async function testFileStructure() {
  console.log('\n📦 Category 5: File Structure')
  
  const fs = await import('fs/promises')
  const path = await import('path')
  
  // Test 5.1: Critical files exist
  const criticalFiles = [
    'lib/utils/rate-limiter.ts',
    'lib/utils/api-with-rate-limit.ts',
    'lib/utils/logger.ts',
    'lib/utils/error-monitoring.ts',
    'lib/utils/error-handler.ts',
    'app/api/chat/route.ts',
    'app/api/agent-chain/route.ts',
    'app/api/workflow/route.ts'
  ]
  
  for (const file of criticalFiles) {
    try {
      await fs.access(file)
      results.push({
        category: 'File Structure',
        test: `File exists: ${file}`,
        status: 'PASS',
        message: 'File exists'
      })
    } catch (error) {
      results.push({
        category: 'File Structure',
        test: `File exists: ${file}`,
        status: 'FAIL',
        message: 'File not found'
      })
    }
  }
  
  // Test 5.2: Old rate limiter files removed
  const oldFiles = [
    'lib/middleware/rate-limit.ts',
    'lib/rate-limit-middleware.ts',
    'lib/ratelimit.ts'
  ]
  
  for (const file of oldFiles) {
    try {
      await fs.access(file)
      results.push({
        category: 'File Structure',
        test: `Old file removed: ${file}`,
        status: 'FAIL',
        message: 'Old file still exists (should be removed)'
      })
    } catch (error) {
      results.push({
        category: 'File Structure',
        test: `Old file removed: ${file}`,
        status: 'PASS',
        message: 'Old file successfully removed'
      })
    }
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Comprehensive System Tests\n')
  console.log('=' .repeat(80))
  
  await testRateLimiting()
  await testLoggingSystem()
  await testErrorMonitoring()
  await testErrorHandlerIntegration()
  await testFileStructure()
  
  console.log('\n' + '=' .repeat(80))
  console.log('\n📊 Test Summary\n')
  
  // Group by category
  const categories = [...new Set(results.map(r => r.category))]
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category)
    const passed = categoryResults.filter(r => r.status === 'PASS').length
    const failed = categoryResults.filter(r => r.status === 'FAIL').length
    const total = categoryResults.length
    
    console.log(`\n${category}:`)
    console.log(`  Total: ${total} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`)
  }
  
  const totalPassed = results.filter(r => r.status === 'PASS').length
  const totalFailed = results.filter(r => r.status === 'FAIL').length
  const totalTests = results.length
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`\nOverall Results:`)
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${totalPassed}`)
  console.log(`❌ Failed: ${totalFailed}`)
  console.log(`\nSuccess Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`)
  
  if (totalFailed > 0) {
    console.log('\n❌ Failed Tests:\n')
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  [${r.category}] ${r.test}`)
      console.log(`    Message: ${r.message}`)
      if (r.details) {
        console.log(`    Details: ${JSON.stringify(r.details, null, 2)}`)
      }
    })
  }
  
  console.log('\n✅ Comprehensive System Tests Completed!')
  
  // Exit with appropriate code
  process.exit(totalFailed > 0 ? 1 : 0)
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
