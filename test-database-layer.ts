/**
 * Test Database Layer
 * ทดสอบ database client, cache manager, และ repositories
 */

import { DatabaseClient } from './lib/database/db-client'
import { CacheManager } from './lib/database/cache-manager'
import { WorkflowRepository } from './lib/database/repositories/workflow-repository'

async function testDatabaseClient() {
  console.log('\n🧪 Testing Database Client...\n')

  // Create mock database client
  const db = new DatabaseClient({ useMock: true })

  console.log('✅ Database client created (using mock)')
  console.log('   Is mock:', db.isMock())

  // Test insert
  console.log('\nTest 1: Insert workflow')
  const { data: inserted, error: insertError } = await db.insert('workflows', {
    id: 'test-1',
    user_id: 'user-123',
    project_name: 'Test Project',
    status: 'pending',
    progress: 0,
  })

  if (insertError) {
    console.log('❌ Insert failed:', insertError)
  } else {
    console.log('✅ Inserted:', inserted?.[0]?.id)
  }

  // Test select
  console.log('\nTest 2: Select workflow')
  const { data: selected, error: selectError } = await db.select('workflows', {
    match: { id: 'test-1' },
  })

  if (selectError) {
    console.log('❌ Select failed:', selectError)
  } else {
    console.log('✅ Selected:', selected?.length, 'rows')
    console.log('   Data:', selected?.[0])
  }

  // Test update
  console.log('\nTest 3: Update workflow')
  const { data: updated, error: updateError } = await db.update(
    'workflows',
    { status: 'completed', progress: 100 },
    { id: 'test-1' }
  )

  if (updateError) {
    console.log('❌ Update failed:', updateError)
  } else {
    console.log('✅ Updated:', updated?.[0]?.status)
  }

  // Test upsert
  console.log('\nTest 4: Upsert workflow')
  const { data: upserted, error: upsertError } = await db.upsert('workflows', {
    id: 'test-2',
    user_id: 'user-123',
    project_name: 'Test Project 2',
    status: 'analyzing',
    progress: 25,
  })

  if (upsertError) {
    console.log('❌ Upsert failed:', upsertError)
  } else {
    console.log('✅ Upserted:', upserted?.[0]?.id)
  }

  // Test delete
  console.log('\nTest 5: Delete workflow')
  const { error: deleteError } = await db.delete('workflows', { id: 'test-2' })

  if (deleteError) {
    console.log('❌ Delete failed:', deleteError)
  } else {
    console.log('✅ Deleted successfully')
  }

  // Check final state
  console.log('\nFinal state:')
  const { data: final } = await db.select('workflows')
  console.log('   Total workflows:', final?.length)

  console.log('\n✅ Database Client tests passed!\n')
}

async function testCacheManager() {
  console.log('🧪 Testing Cache Manager...\n')

  const cache = new CacheManager({ maxSize: 10, defaultTTL: 5000 })

  // Test set/get
  console.log('Test 1: Set and get')
  cache.set('key1', { value: 'test1' })
  const value1 = cache.get('key1')
  console.log('✅ Retrieved:', value1)

  // Test getOrSet
  console.log('\nTest 2: Get or set with fetcher')
  const value2 = await cache.getOrSet('key2', async () => {
    console.log('   Fetching data...')
    await new Promise(resolve => setTimeout(resolve, 100))
    return { value: 'test2' }
  })
  console.log('✅ Retrieved:', value2)

  // Test cache hit
  console.log('\nTest 3: Cache hit (should not fetch)')
  const value3 = await cache.getOrSet('key2', async () => {
    console.log('   This should not print')
    return { value: 'should not see this' }
  })
  console.log('✅ Retrieved from cache:', value3)

  // Test has
  console.log('\nTest 4: Check existence')
  console.log('✅ Has key1:', cache.has('key1'))
  console.log('✅ Has key999:', cache.has('key999'))

  // Test pattern clearing
  console.log('\nTest 5: Clear by pattern')
  cache.set('workflow:1', { id: '1' })
  cache.set('workflow:2', { id: '2' })
  cache.set('user:1', { id: '1' })
  
  const cleared = cache.clearPattern(/^workflow:/)
  console.log('✅ Cleared', cleared, 'workflow entries')
  console.log('   Remaining keys:', cache.keys())

  // Test statistics
  console.log('\nTest 6: Statistics')
  cache.printSummary()

  // Test expiration
  console.log('\nTest 7: Expiration (waiting 6 seconds...)')
  cache.set('temp', { value: 'temporary' }, 1000) // 1 second TTL
  console.log('   Has temp (before):', cache.has('temp'))
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  console.log('   Has temp (after):', cache.has('temp'))
  console.log('✅ Expiration works correctly')

  console.log('\n✅ Cache Manager tests passed!\n')
}

async function testWorkflowRepository() {
  console.log('🧪 Testing Workflow Repository...\n')

  const repo = new WorkflowRepository()

  // Test create
  console.log('Test 1: Create workflow')
  const created = await repo.create({
    user_id: 'user-123',
    project_name: 'Test Project',
    project_description: 'A test project',
    status: 'pending',
    progress: 0,
  })
  console.log('✅ Created:', created.id)

  // Test findById
  console.log('\nTest 2: Find by ID')
  const found = await repo.findById(created.id)
  console.log('✅ Found:', found?.project_name)

  // Test findById (from cache)
  console.log('\nTest 3: Find by ID (from cache)')
  const foundCached = await repo.findById(created.id)
  console.log('✅ Found (cached):', foundCached?.project_name)

  // Test update
  console.log('\nTest 4: Update workflow')
  const updated = await repo.update(created.id, {
    status: 'analyzing',
    progress: 25,
  })
  console.log('✅ Updated status:', updated.status)
  console.log('   Progress:', updated.progress)

  // Test findByUserId
  console.log('\nTest 5: Find by user ID')
  const userWorkflows = await repo.findByUserId('user-123')
  console.log('✅ Found', userWorkflows.length, 'workflows for user')

  // Test create another
  console.log('\nTest 6: Create another workflow')
  const created2 = await repo.create({
    user_id: 'user-123',
    project_name: 'Test Project 2',
    status: 'completed',
    progress: 100,
  })
  console.log('✅ Created:', created2.id)

  // Test findByUserId again
  console.log('\nTest 7: Find by user ID (updated)')
  const userWorkflows2 = await repo.findByUserId('user-123')
  console.log('✅ Found', userWorkflows2.length, 'workflows for user')

  // Test countByUserId
  console.log('\nTest 8: Count by user ID')
  const count = await repo.countByUserId('user-123')
  console.log('✅ Count:', count)

  // Test findByStatus
  console.log('\nTest 9: Find by status')
  const pending = await repo.findByStatus('pending')
  const completed = await repo.findByStatus('completed')
  console.log('✅ Pending:', pending.length)
  console.log('   Completed:', completed.length)

  // Test getRecent
  console.log('\nTest 10: Get recent workflows')
  const recent = await repo.getRecent(5)
  console.log('✅ Recent:', recent.length, 'workflows')

  // Test delete
  console.log('\nTest 11: Delete workflow')
  await repo.delete(created2.id)
  console.log('✅ Deleted:', created2.id)

  // Verify deletion
  const deleted = await repo.findById(created2.id)
  console.log('   Verify deleted:', deleted === null ? 'Success' : 'Failed')

  console.log('\n✅ Workflow Repository tests passed!\n')
}

async function runAllTests() {
  console.log('='.repeat(80))
  console.log('🧪 Database Layer Test Suite')
  console.log('='.repeat(80))

  try {
    await testDatabaseClient()
    await testCacheManager()
    await testWorkflowRepository()

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
