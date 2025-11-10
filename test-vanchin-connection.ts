/**
 * Test Vanchin AI Connection
 * ทดสอบการเชื่อมต่อกับ Vanchin AI models ทั้งหมด
 */

import { createVanchinClient, getModelEndpoint, VANCHIN_MODELS } from './lib/ai/vanchin-client'

async function testVanchinConnection() {
  console.log('🧪 Testing Vanchin AI Connection...\n')
  console.log(`Total models available: ${Object.keys(VANCHIN_MODELS).length}\n`)

  const results: Array<{
    modelKey: string
    success: boolean
    responseTime: number
    error?: string
    response?: string
  }> = []

  // Test first 5 models to avoid rate limiting
  const modelsToTest = ['model_1', 'model_2', 'model_3', 'model_4', 'model_5'] as const

  for (const modelKey of modelsToTest) {
    const model = VANCHIN_MODELS[modelKey]
    console.log(`Testing ${model.name} (${modelKey})...`)

    const startTime = Date.now()

    try {
      const client = createVanchinClient(modelKey)
      const endpoint = getModelEndpoint(modelKey)

      const completion = await client.chat.completions.create({
        model: endpoint,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello! I am working." in one sentence.' }
        ],
        temperature: 0.7,
        max_tokens: 50
      })

      const responseTime = Date.now() - startTime
      const response = completion.choices[0]?.message?.content || 'No response'

      results.push({
        modelKey,
        success: true,
        responseTime,
        response
      })

      console.log(`✅ Success (${responseTime}ms)`)
      console.log(`   Response: ${response}\n`)

    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      results.push({
        modelKey,
        success: false,
        responseTime,
        error: errorMessage
      })

      console.log(`❌ Failed (${responseTime}ms)`)
      console.log(`   Error: ${errorMessage}\n`)
    }

    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test Summary')
  console.log('='.repeat(60))

  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length

  console.log(`Total tested: ${results.length}`)
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`⏱️  Average response time: ${avgResponseTime.toFixed(0)}ms`)

  if (successCount > 0) {
    console.log('\n✅ Vanchin AI connection is working!')
    console.log(`${successCount} out of ${results.length} models are operational.`)
  } else {
    console.log('\n❌ All models failed. Please check:')
    console.log('   1. API keys are correct')
    console.log('   2. Endpoint IDs are valid')
    console.log('   3. Network connection is stable')
    console.log('   4. Vanchin AI service is online')
  }

  console.log('\n' + '='.repeat(60))

  return results
}

// Run test
testVanchinConnection()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
