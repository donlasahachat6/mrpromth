/**
 * Performance Monitor
 * ติดตามและวิเคราะห์ performance ของระบบ
 */

/**
 * Performance metric
 */
interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
  tags?: string[]
}

/**
 * Performance summary
 */
interface PerformanceSummary {
  totalOperations: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  p50Duration: number
  p95Duration: number
  p99Duration: number
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]>
  private activeTimers: Map<string, number>

  constructor() {
    this.metrics = new Map()
    this.activeTimers = new Map()
  }

  /**
   * Start timing an operation
   */
  start(name: string, metadata?: Record<string, any>, tags?: string[]): string {
    const timerId = `${name}_${Date.now()}_${Math.random()}`
    
    this.activeTimers.set(timerId, Date.now())
    
    // Store initial metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
      tags,
    }

    this.metrics.get(name)!.push(metric)

    return timerId
  }

  /**
   * End timing an operation
   */
  end(timerId: string): number | null {
    const startTime = this.activeTimers.get(timerId)
    
    if (!startTime) {
      console.warn(`[PerformanceMonitor] Timer not found: ${timerId}`)
      return null
    }

    const duration = Date.now() - startTime
    this.activeTimers.delete(timerId)

    // Update metric with end time and duration
    const name = timerId.split('_')[0]
    const metrics = this.metrics.get(name)
    
    if (metrics) {
      const metric = metrics[metrics.length - 1]
      metric.endTime = Date.now()
      metric.duration = duration
    }

    return duration
  }

  /**
   * Measure operation with automatic timing
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>,
    tags?: string[]
  ): Promise<T> {
    const timerId = this.start(name, metadata, tags)
    
    try {
      const result = await operation()
      this.end(timerId)
      return result
    } catch (error) {
      this.end(timerId)
      throw error
    }
  }

  /**
   * Get metrics for specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || []
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceMetric[]> {
    return this.metrics
  }

  /**
   * Get summary for specific operation
   */
  getSummary(name: string): PerformanceSummary | null {
    const metrics = this.getMetrics(name)
    
    if (metrics.length === 0) {
      return null
    }

    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!)
      .sort((a, b) => a - b)

    if (durations.length === 0) {
      return null
    }

    const sum = durations.reduce((acc, d) => acc + d, 0)
    const avg = sum / durations.length

    return {
      totalOperations: durations.length,
      averageDuration: avg,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p50Duration: this.percentile(durations, 50),
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99),
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], p: number): number {
    const index = Math.ceil((sortedArray.length * p) / 100) - 1
    return sortedArray[Math.max(0, index)]
  }

  /**
   * Print summary for all operations
   */
  printSummary() {
    console.log('\n📊 Performance Summary')
    console.log('='.repeat(100))
    console.log(
      'Operation'.padEnd(30) +
      'Count'.padEnd(10) +
      'Avg'.padEnd(12) +
      'Min'.padEnd(12) +
      'Max'.padEnd(12) +
      'P95'.padEnd(12) +
      'P99'
    )
    console.log('='.repeat(100))

    const names = Array.from(this.metrics.keys()).sort()

    for (const name of names) {
      const summary = this.getSummary(name)
      
      if (summary) {
        console.log(
          name.padEnd(30) +
          summary.totalOperations.toString().padEnd(10) +
          `${summary.averageDuration.toFixed(0)}ms`.padEnd(12) +
          `${summary.minDuration.toFixed(0)}ms`.padEnd(12) +
          `${summary.maxDuration.toFixed(0)}ms`.padEnd(12) +
          `${summary.p95Duration.toFixed(0)}ms`.padEnd(12) +
          `${summary.p99Duration.toFixed(0)}ms`
        )
      }
    }

    console.log('='.repeat(100))
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
    this.activeTimers.clear()
  }

  /**
   * Export metrics to JSON
   */
  exportToJson(): string {
    const data: Record<string, any> = {}

    for (const [name, metrics] of this.metrics.entries()) {
      data[name] = {
        metrics: metrics.map(m => ({
          startTime: m.startTime,
          endTime: m.endTime,
          duration: m.duration,
          metadata: m.metadata,
          tags: m.tags,
        })),
        summary: this.getSummary(name),
      }
    }

    return JSON.stringify(data, null, 2)
  }
}

/**
 * Global instance
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for automatic performance monitoring
 */
export function monitored(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const name = operationName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(
        name,
        () => originalMethod.apply(this, args),
        { args: args.length }
      )
    }

    return descriptor
  }
}

/**
 * Helper function to measure sync operations
 */
export function measureSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  const timerId = performanceMonitor.start(name, metadata)
  
  try {
    const result = operation()
    performanceMonitor.end(timerId)
    return result
  } catch (error) {
    performanceMonitor.end(timerId)
    throw error
  }
}

/**
 * Helper function to measure async operations
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measure(name, operation, metadata)
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Example 1: Manual timing
  const timer1 = performanceMonitor.start('database_query', { table: 'users' })
  // ... do database query
  await new Promise(resolve => setTimeout(resolve, 100))
  performanceMonitor.end(timer1)

  // Example 2: Automatic timing
  await performanceMonitor.measure(
    'api_request',
    async () => {
      // ... do API request
      await new Promise(resolve => setTimeout(resolve, 200))
      return { data: 'result' }
    },
    { endpoint: '/api/users' }
  )

  // Example 3: Multiple operations
  for (let i = 0; i < 5; i++) {
    await measureAsync('loop_operation', async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    })
  }

  // Print summary
  performanceMonitor.printSummary()

  // Get specific summary
  const summary = performanceMonitor.getSummary('api_request')
  console.log('API Request Summary:', summary)

  // Export to JSON
  const json = performanceMonitor.exportToJson()
  console.log('Exported metrics:', json)
}

/**
 * Integration with workflow orchestrator
 */
export class MonitoredWorkflowOrchestrator {
  async executeWithMonitoring(workflowId: string) {
    // Monitor overall workflow
    await performanceMonitor.measure(
      'workflow_execution',
      async () => {
        // Step 1: Analyze
        await performanceMonitor.measure(
          'workflow_step_analyze',
          async () => {
            // ... analyze logic
            await new Promise(resolve => setTimeout(resolve, 500))
          },
          { workflowId, step: 1 }
        )

        // Step 2: Generate
        await performanceMonitor.measure(
          'workflow_step_generate',
          async () => {
            // ... generate logic
            await new Promise(resolve => setTimeout(resolve, 1000))
          },
          { workflowId, step: 2 }
        )

        // Step 3: Package
        await performanceMonitor.measure(
          'workflow_step_package',
          async () => {
            // ... package logic
            await new Promise(resolve => setTimeout(resolve, 300))
          },
          { workflowId, step: 3 }
        )
      },
      { workflowId }
    )

    // Print summary
    performanceMonitor.printSummary()
  }
}
