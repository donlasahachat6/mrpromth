/**
 * Request Queue System
 * Queue and process requests with priority and concurrency control
 */

import { performanceMonitor } from './performance-monitor'
import { ErrorFactory } from './error-handler'

/**
 * Queue item
 */
interface QueueItem<T = any> {
  id: string
  task: () => Promise<T>
  priority: number
  createdAt: number
  resolve: (value: T) => void
  reject: (error: any) => void
  timeout?: number
  metadata?: Record<string, any>
}

/**
 * Queue statistics
 */
interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  avgProcessingTime: number
}

/**
 * Request queue class
 */
export class RequestQueue {
  private queue: QueueItem[] = []
  private processing: Set<string> = new Set()
  private maxConcurrency: number
  private stats = {
    completed: 0,
    failed: 0,
    totalProcessingTime: 0,
  }

  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency
  }

  /**
   * Add task to queue
   */
  async add<T>(
    task: () => Promise<T>,
    options?: {
      priority?: number
      timeout?: number
      metadata?: Record<string, any>
    }
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const item: QueueItem<T> = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        task,
        priority: options?.priority || 0,
        createdAt: Date.now(),
        resolve,
        reject,
        timeout: options?.timeout,
        metadata: options?.metadata,
      }

      this.queue.push(item)

      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority)

      // Process queue
      this.processQueue()
    })
  }

  /**
   * Process queue
   */
  private async processQueue(): Promise<void> {
    // Check if we can process more
    if (this.processing.size >= this.maxConcurrency) {
      return
    }

    // Get next item
    const item = this.queue.shift()
    if (!item) {
      return
    }

    // Mark as processing
    this.processing.add(item.id)

    // Process item
    try {
      const startTime = Date.now()

      // Execute with optional timeout
      let result: any

      if (item.timeout) {
        result = await Promise.race([
          item.task(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(ErrorFactory.timeout('Task', item.timeout!)),
              item.timeout
            )
          ),
        ])
      } else {
        result = await item.task()
      }

      // Track stats
      const processingTime = Date.now() - startTime
      this.stats.completed++
      this.stats.totalProcessingTime += processingTime

      // Resolve
      item.resolve(result)

      console.log(
        `[Queue] Completed task ${item.id} in ${processingTime}ms (priority: ${item.priority})`
      )
    } catch (error) {
      this.stats.failed++
      item.reject(error)

      console.error(`[Queue] Failed task ${item.id}:`, error)
    } finally {
      // Remove from processing
      this.processing.delete(item.id)

      // Process next
      this.processQueue()
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const avgProcessingTime =
      this.stats.completed > 0
        ? this.stats.totalProcessingTime / this.stats.completed
        : 0

    return {
      pending: this.queue.length,
      processing: this.processing.size,
      completed: this.stats.completed,
      failed: this.stats.failed,
      avgProcessingTime: Math.round(avgProcessingTime),
    }
  }

  /**
   * Clear queue
   */
  clear(): void {
    // Reject all pending tasks
    for (const item of this.queue) {
      item.reject(new Error('Queue cleared'))
    }

    this.queue = []
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.processing.size === 0
  }

  /**
   * Wait for queue to be empty
   */
  async waitUntilEmpty(): Promise<void> {
    while (!this.isEmpty()) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  /**
   * Print queue summary
   */
  printSummary(): void {
    const stats = this.getStats()

    console.log('\n📊 Queue Summary')
    console.log('='.repeat(50))
    console.log(`Pending: ${stats.pending}`)
    console.log(`Processing: ${stats.processing}`)
    console.log(`Completed: ${stats.completed}`)
    console.log(`Failed: ${stats.failed}`)
    console.log(`Avg Processing Time: ${stats.avgProcessingTime}ms`)
    console.log('='.repeat(50))
  }
}

/**
 * Priority queue with different priority levels
 */
export class PriorityQueue extends RequestQueue {
  static readonly PRIORITY = {
    CRITICAL: 100,
    HIGH: 75,
    NORMAL: 50,
    LOW: 25,
    BACKGROUND: 0,
  }

  /**
   * Add critical priority task
   */
  async addCritical<T>(
    task: () => Promise<T>,
    options?: { timeout?: number; metadata?: Record<string, any> }
  ): Promise<T> {
    return this.add(task, { ...options, priority: PriorityQueue.PRIORITY.CRITICAL })
  }

  /**
   * Add high priority task
   */
  async addHigh<T>(
    task: () => Promise<T>,
    options?: { timeout?: number; metadata?: Record<string, any> }
  ): Promise<T> {
    return this.add(task, { ...options, priority: PriorityQueue.PRIORITY.HIGH })
  }

  /**
   * Add normal priority task
   */
  async addNormal<T>(
    task: () => Promise<T>,
    options?: { timeout?: number; metadata?: Record<string, any> }
  ): Promise<T> {
    return this.add(task, { ...options, priority: PriorityQueue.PRIORITY.NORMAL })
  }

  /**
   * Add low priority task
   */
  async addLow<T>(
    task: () => Promise<T>,
    options?: { timeout?: number; metadata?: Record<string, any> }
  ): Promise<T> {
    return this.add(task, { ...options, priority: PriorityQueue.PRIORITY.LOW })
  }

  /**
   * Add background priority task
   */
  async addBackground<T>(
    task: () => Promise<T>,
    options?: { timeout?: number; metadata?: Record<string, any> }
  ): Promise<T> {
    return this.add(task, { ...options, priority: PriorityQueue.PRIORITY.BACKGROUND })
  }
}

/**
 * Global request queues
 */
export const RequestQueues = {
  // AI requests queue (max 3 concurrent)
  ai: new PriorityQueue(3),

  // Project generation queue (max 2 concurrent)
  projectGeneration: new PriorityQueue(2),

  // General API requests (max 10 concurrent)
  api: new RequestQueue(10),

  // Background tasks (max 5 concurrent)
  background: new RequestQueue(5),
}

/**
 * Example usage
 */
export async function exampleUsage() {
  const queue = new PriorityQueue(2)

  // Add tasks with different priorities
  const results = await Promise.all([
    queue.addCritical(async () => {
      console.log('Critical task started')
      await new Promise(resolve => setTimeout(resolve, 1000))
      return 'critical-result'
    }),

    queue.addNormal(async () => {
      console.log('Normal task started')
      await new Promise(resolve => setTimeout(resolve, 500))
      return 'normal-result'
    }),

    queue.addLow(async () => {
      console.log('Low task started')
      await new Promise(resolve => setTimeout(resolve, 300))
      return 'low-result'
    }),

    queue.addHigh(async () => {
      console.log('High task started')
      await new Promise(resolve => setTimeout(resolve, 800))
      return 'high-result'
    }),
  ])

  console.log('Results:', results)

  // Wait for all tasks to complete
  await queue.waitUntilEmpty()

  // Print summary
  queue.printSummary()
}
