/**
 * Smart Model Selector
 * เลือก AI model ที่เหมาะสมตามประเภทของงานและ load balancing
 */

import { VANCHIN_MODELS, createVanchinClient, getModelEndpoint } from './vanchin-client'
import OpenAI from 'openai'

/**
 * Model performance metrics
 */
interface ModelMetrics {
  modelKey: string
  successCount: number
  failureCount: number
  totalResponseTime: number
  requestCount: number
  lastUsed: number
  averageResponseTime: number
  successRate: number
}

/**
 * Task type for model selection
 */
export type TaskType = 
  | 'code-generation'
  | 'analysis'
  | 'conversation'
  | 'testing'
  | 'documentation'
  | 'general'

/**
 * Model selector with intelligent load balancing
 */
export class SmartModelSelector {
  private metrics: Map<string, ModelMetrics>
  private modelKeys: string[]
  private currentIndex: number

  constructor() {
    this.modelKeys = Object.keys(VANCHIN_MODELS)
    this.currentIndex = 0
    this.metrics = new Map()

    // Initialize metrics for all models
    this.modelKeys.forEach(key => {
      this.metrics.set(key, {
        modelKey: key,
        successCount: 0,
        failureCount: 0,
        totalResponseTime: 0,
        requestCount: 0,
        lastUsed: 0,
        averageResponseTime: 0,
        successRate: 1.0
      })
    })
  }

  /**
   * Select best model for task type
   */
  selectModel(taskType: TaskType = 'general'): {
    client: OpenAI
    endpoint: string
    modelKey: string
  } {
    let selectedKey: string

    // Strategy 1: Round-robin for general tasks
    if (taskType === 'general') {
      selectedKey = this.selectRoundRobin()
    }
    // Strategy 2: Performance-based for specific tasks
    else {
      selectedKey = this.selectByPerformance()
    }

    const client = createVanchinClient(selectedKey as any)
    const endpoint = getModelEndpoint(selectedKey as any)

    return {
      client,
      endpoint,
      modelKey: selectedKey
    }
  }

  /**
   * Round-robin selection
   */
  private selectRoundRobin(): string {
    const key = this.modelKeys[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.modelKeys.length
    return key
  }

  /**
   * Performance-based selection
   * เลือก model ที่มี success rate สูงและ response time ต่ำ
   */
  private selectByPerformance(): string {
    const now = Date.now()
    const models = Array.from(this.metrics.values())

    // Filter out models that failed recently
    const availableModels = models.filter(m => {
      // If never used, it's available
      if (m.requestCount === 0) return true
      
      // If last request was more than 5 minutes ago, it's available
      if (now - m.lastUsed > 5 * 60 * 1000) return true
      
      // If success rate is good, it's available
      return m.successRate > 0.7
    })

    if (availableModels.length === 0) {
      // Fallback to round-robin if no models available
      return this.selectRoundRobin()
    }

    // Score each model
    const scoredModels = availableModels.map(m => {
      let score = 0

      // Factor 1: Success rate (weight: 40%)
      score += m.successRate * 0.4

      // Factor 2: Response time (weight: 30%)
      // Lower is better, normalize to 0-1 scale
      if (m.averageResponseTime > 0) {
        const normalizedTime = Math.max(0, 1 - (m.averageResponseTime / 5000))
        score += normalizedTime * 0.3
      } else {
        score += 0.3 // New models get benefit of doubt
      }

      // Factor 3: Least recently used (weight: 20%)
      const timeSinceLastUse = now - m.lastUsed
      const normalizedRecency = Math.min(1, timeSinceLastUse / (5 * 60 * 1000))
      score += normalizedRecency * 0.2

      // Factor 4: Load distribution (weight: 10%)
      const avgRequests = models.reduce((sum, model) => sum + model.requestCount, 0) / models.length
      const loadFactor = m.requestCount < avgRequests ? 1 : 0.5
      score += loadFactor * 0.1

      return { modelKey: m.modelKey, score }
    })

    // Sort by score (highest first)
    scoredModels.sort((a, b) => b.score - a.score)

    // Return best model
    return scoredModels[0].modelKey
  }

  /**
   * Record successful request
   */
  recordSuccess(modelKey: string, responseTime: number) {
    const metrics = this.metrics.get(modelKey)
    if (!metrics) return

    metrics.successCount++
    metrics.requestCount++
    metrics.totalResponseTime += responseTime
    metrics.lastUsed = Date.now()
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.requestCount
    metrics.successRate = metrics.successCount / metrics.requestCount

    this.metrics.set(modelKey, metrics)
  }

  /**
   * Record failed request
   */
  recordFailure(modelKey: string, responseTime: number) {
    const metrics = this.metrics.get(modelKey)
    if (!metrics) return

    metrics.failureCount++
    metrics.requestCount++
    metrics.totalResponseTime += responseTime
    metrics.lastUsed = Date.now()
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.requestCount
    metrics.successRate = metrics.successCount / metrics.requestCount

    this.metrics.set(modelKey, metrics)
  }

  /**
   * Get metrics for all models
   */
  getMetrics(): ModelMetrics[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get metrics for specific model
   */
  getModelMetrics(modelKey: string): ModelMetrics | undefined {
    return this.metrics.get(modelKey)
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.modelKeys.forEach(key => {
      this.metrics.set(key, {
        modelKey: key,
        successCount: 0,
        failureCount: 0,
        totalResponseTime: 0,
        requestCount: 0,
        lastUsed: 0,
        averageResponseTime: 0,
        successRate: 1.0
      })
    })
  }

  /**
   * Print metrics summary
   */
  printMetrics() {
    console.log('\n📊 Model Performance Metrics')
    console.log('='.repeat(80))
    console.log(
      'Model'.padEnd(15) +
      'Requests'.padEnd(12) +
      'Success'.padEnd(12) +
      'Avg Time'.padEnd(12) +
      'Success Rate'
    )
    console.log('='.repeat(80))

    const metrics = this.getMetrics()
    metrics
      .sort((a, b) => b.requestCount - a.requestCount)
      .forEach(m => {
        if (m.requestCount > 0) {
          console.log(
            m.modelKey.padEnd(15) +
            m.requestCount.toString().padEnd(12) +
            m.successCount.toString().padEnd(12) +
            `${m.averageResponseTime.toFixed(0)}ms`.padEnd(12) +
            `${(m.successRate * 100).toFixed(1)}%`
          )
        }
      })

    console.log('='.repeat(80))
  }
}

/**
 * Global instance
 */
export const modelSelector = new SmartModelSelector()

/**
 * Helper function to execute AI request with automatic model selection
 */
export async function executeWithSmartSelection(
  messages: Array<{ role: string; content: string }>,
  taskType: TaskType = 'general',
  options?: {
    temperature?: number
    maxTokens?: number
    retries?: number
  }
): Promise<{
  response: string
  modelKey: string
  responseTime: number
}> {
  const maxRetries = options?.retries ?? 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { client, endpoint, modelKey } = modelSelector.selectModel(taskType)
    const startTime = Date.now()

    try {
      const completion = await client.chat.completions.create({
        model: endpoint,
        messages: messages as any,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000
      })

      const responseTime = Date.now() - startTime
      const response = completion.choices[0]?.message?.content || ''

      // Record success
      modelSelector.recordSuccess(modelKey, responseTime)

      return {
        response,
        modelKey,
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      lastError = error instanceof Error ? error : new Error(String(error))

      // Record failure
      modelSelector.recordFailure(modelKey, responseTime)

      console.error(`[SmartSelector] Attempt ${attempt + 1} failed with ${modelKey}:`, lastError.message)

      // If not last attempt, try again with different model
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }
    }
  }

  throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError?.message}`)
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Example 1: Simple request
  const result1 = await executeWithSmartSelection(
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain TypeScript in one sentence.' }
    ],
    'general'
  )

  console.log('Response:', result1.response)
  console.log('Model used:', result1.modelKey)
  console.log('Response time:', result1.responseTime, 'ms')

  // Example 2: Code generation task
  const result2 = await executeWithSmartSelection(
    [
      { role: 'user', content: 'Write a function to reverse a string in JavaScript.' }
    ],
    'code-generation',
    { temperature: 0.3, maxTokens: 500 }
  )

  console.log('Code:', result2.response)

  // Print metrics
  modelSelector.printMetrics()
}
