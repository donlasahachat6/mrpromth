/**
 * Test Performance Monitor
 * ทดสอบการทำงานของ performance monitoring system
 */

import {
  performanceMonitor,
  measureAsync,
  measureSync,
} from './lib/utils/performance-monitor'

async function testManualTiming() {
  console.log('\n🧪 Testing Manual Timing...\n')

  // Test 1: Simple timing
  console.log('Test 1: Simple database query simulation')
  const timer1 = performanceMonitor.start('database_query', { table: 'users' })
  await new Promise(resolve => setTimeout(resolve, 100))
  const duration1 = performanceMonitor.end(timer1)
  console.log(`✅ Duration: ${duration1}ms`)

  // Test 2: Multiple operations
  console.log('\nTest 2: Multiple API calls')
  for (let i = 0; i < 5; i++) {
    const timer = performanceMonitor.start('api_call', { endpoint: '/api/users', attempt: i + 1 })
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    performanceMonitor.end(timer)
  }
  console.log('✅ Completed 5 API calls')

  console.log()
}

async function testAutomaticTiming() {
  console.log('🧪 Testing Automatic Timing...\n')

  // Test 1: Async operation
  console.log('Test 1: Async operation')
  const result1 = await measureAsync('async_operation', async () => {
    await new Promise(resolve => setTimeout(resolve, 150))
    return 'Async result'
  })
  console.log(`✅ Result: ${result1}`)

  // Test 2: Sync operation
  console.log('\nTest 2: Sync operation')
  const result2 = measureSync('sync_operation', () => {
    let sum = 0
    for (let i = 0; i < 1000000; i++) {
      sum += i
    }
    return sum
  })
  console.log(`✅ Result: ${result2}`)

  console.log()
}

async function testMeasureMethod() {
  console.log('🧪 Testing Measure Method...\n')

  // Test: Workflow simulation
  console.log('Simulating workflow with multiple steps...')

  await performanceMonitor.measure(
    'workflow_execution',
    async () => {
      // Step 1
      await performanceMonitor.measure(
        'workflow_step_analyze',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 200))
        },
        { step: 1 }
      )

      // Step 2
      await performanceMonitor.measure(
        'workflow_step_generate',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 300))
        },
        { step: 2 }
      )

      // Step 3
      await performanceMonitor.measure(
        'workflow_step_package',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
        },
        { step: 3 }
      )
    },
    { workflowId: 'test-123' }
  )

  console.log('✅ Workflow completed\n')
}

async function testMetricsRetrieval() {
  console.log('🧪 Testing Metrics Retrieval...\n')

  // Add some test data
  for (let i = 0; i < 10; i++) {
    await measureAsync('test_operation', async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    })
  }

  // Get specific metrics
  console.log('Test 1: Get specific operation metrics')
  const metrics = performanceMonitor.getMetrics('test_operation')
  console.log(`✅ Found ${metrics.length} metrics for test_operation`)

  // Get summary
  console.log('\nTest 2: Get operation summary')
  const summary = performanceMonitor.getSummary('test_operation')
  if (summary) {
    console.log('✅ Summary:')
    console.log(`   Total operations: ${summary.totalOperations}`)
    console.log(`   Average duration: ${summary.averageDuration.toFixed(2)}ms`)
    console.log(`   Min duration: ${summary.minDuration}ms`)
    console.log(`   Max duration: ${summary.maxDuration}ms`)
    console.log(`   P50 (median): ${summary.p50Duration}ms`)
    console.log(`   P95: ${summary.p95Duration}ms`)
    console.log(`   P99: ${summary.p99Duration}ms`)
  }

  console.log()
}

async function testExportToJson() {
  console.log('🧪 Testing Export to JSON...\n')

  // Export metrics
  const json = performanceMonitor.exportToJson()
  const data = JSON.parse(json)

  console.log('✅ Exported metrics:')
  console.log(`   Total operation types: ${Object.keys(data).length}`)

  // Show sample
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    console.log(`\n   Sample (${firstKey}):`)
    console.log(`   - Metrics count: ${data[firstKey].metrics.length}`)
    console.log(`   - Average duration: ${data[firstKey].summary?.averageDuration.toFixed(2)}ms`)
  }

  console.log()
}

async function testPerformanceComparison() {
  console.log('🧪 Testing Performance Comparison...\n')

  // Simulate different implementations
  console.log('Comparing two implementations...\n')

  // Implementation A (slower)
  console.log('Testing Implementation A (baseline)...')
  for (let i = 0; i < 5; i++) {
    await measureAsync('implementation_a', async () => {
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 50))
    })
  }

  // Implementation B (faster)
  console.log('Testing Implementation B (optimized)...')
  for (let i = 0; i < 5; i++) {
    await measureAsync('implementation_b', async () => {
      await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 30))
    })
  }

  // Compare
  const summaryA = performanceMonitor.getSummary('implementation_a')
  const summaryB = performanceMonitor.getSummary('implementation_b')

  if (summaryA && summaryB) {
    console.log('\n✅ Comparison Results:')
    console.log(`   Implementation A: ${summaryA.averageDuration.toFixed(2)}ms average`)
    console.log(`   Implementation B: ${summaryB.averageDuration.toFixed(2)}ms average`)
    
    const improvement = ((summaryA.averageDuration - summaryB.averageDuration) / summaryA.averageDuration) * 100
    console.log(`   Improvement: ${improvement.toFixed(1)}% faster`)
  }

  console.log()
}

async function runAllTests() {
  console.log('='.repeat(80))
  console.log('🧪 Performance Monitor Test Suite')
  console.log('='.repeat(80))

  try {
    await testManualTiming()
    await testAutomaticTiming()
    await testMeasureMethod()
    await testMetricsRetrieval()
    await testExportToJson()
    await testPerformanceComparison()

    // Print final summary
    console.log('='.repeat(80))
    console.log('📊 Final Performance Summary')
    console.log('='.repeat(80))
    performanceMonitor.printSummary()

    console.log('\n='.repeat(80))
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
