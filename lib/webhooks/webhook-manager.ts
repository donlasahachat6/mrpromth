/**
 * Webhook Manager
 * Send webhooks for events with retry logic
 */

import { retryWithBackoff, ErrorFactory } from '../utils/error-handler'
import { performanceMonitor } from '../utils/performance-monitor'

/**
 * Webhook event types
 */
export enum WebhookEvent {
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_PROGRESS = 'workflow.progress',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  PROJECT_GENERATED = 'project.generated',
  PROJECT_DEPLOYED = 'project.deployed',
  ERROR_OCCURRED = 'error.occurred',
}

/**
 * Webhook payload
 */
interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: any
  metadata?: Record<string, any>
}

/**
 * Webhook delivery result
 */
interface WebhookDeliveryResult {
  success: boolean
  statusCode?: number
  responseTime: number
  error?: string
  attempts: number
}

/**
 * Webhook configuration
 */
interface WebhookConfig {
  url: string
  secret?: string
  events?: WebhookEvent[]
  retries?: number
  timeout?: number
}

/**
 * Webhook manager class
 */
export class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map()
  private deliveryLog: WebhookDeliveryResult[] = []

  /**
   * Register webhook
   */
  register(id: string, config: WebhookConfig): void {
    this.webhooks.set(id, config)
    console.log(`[Webhook] Registered webhook: ${id} -> ${config.url}`)
  }

  /**
   * Unregister webhook
   */
  unregister(id: string): void {
    this.webhooks.delete(id)
    console.log(`[Webhook] Unregistered webhook: ${id}`)
  }

  /**
   * Send webhook
   */
  async send(
    event: WebhookEvent,
    data: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata,
    }

    // Find webhooks that listen to this event
    const webhooksToSend: Array<[string, WebhookConfig]> = []

    for (const [id, config] of this.webhooks.entries()) {
      if (!config.events || config.events.includes(event)) {
        webhooksToSend.push([id, config])
      }
    }

    if (webhooksToSend.length === 0) {
      console.log(`[Webhook] No webhooks registered for event: ${event}`)
      return
    }

    // Send to all webhooks in parallel
    await Promise.allSettled(
      webhooksToSend.map(([id, config]) =>
        this.deliver(id, config, payload)
      )
    )
  }

  /**
   * Deliver webhook with retry
   */
  private async deliver(
    id: string,
    config: WebhookConfig,
    payload: WebhookPayload
  ): Promise<void> {
    const startTime = Date.now()
    let attempts = 0

    try {
      await retryWithBackoff(
        async () => {
          attempts++

          const response = await fetch(config.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'MrPrompt-Webhook/1.0',
              ...(config.secret && {
                'X-Webhook-Secret': config.secret,
              }),
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(config.timeout || 10000),
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          return response
        },
        {
          maxRetries: config.retries || 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            console.log(
              `[Webhook] Retry ${attempt} for ${id}:`,
              error.message
            )
          },
        }
      )

      // Log success
      const result: WebhookDeliveryResult = {
        success: true,
        responseTime: Date.now() - startTime,
        attempts,
      }

      this.deliveryLog.push(result)

      console.log(
        `[Webhook] Delivered to ${id} in ${result.responseTime}ms (${attempts} attempts)`
      )
    } catch (error) {
      // Log failure
      const result: WebhookDeliveryResult = {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        attempts,
      }

      this.deliveryLog.push(result)

      console.error(
        `[Webhook] Failed to deliver to ${id}:`,
        result.error
      )
    }
  }

  /**
   * Get delivery statistics
   */
  getStats(): {
    total: number
    successful: number
    failed: number
    successRate: number
    avgResponseTime: number
  } {
    const total = this.deliveryLog.length
    const successful = this.deliveryLog.filter(d => d.success).length
    const failed = total - successful
    const successRate = total > 0 ? (successful / total) * 100 : 0

    const totalResponseTime = this.deliveryLog.reduce(
      (sum, d) => sum + d.responseTime,
      0
    )
    const avgResponseTime = total > 0 ? totalResponseTime / total : 0

    return {
      total,
      successful,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
    }
  }

  /**
   * Clear delivery log
   */
  clearLog(): void {
    this.deliveryLog = []
  }

  /**
   * Get registered webhooks
   */
  getWebhooks(): Array<{ id: string; config: WebhookConfig }> {
    return Array.from(this.webhooks.entries()).map(([id, config]) => ({
      id,
      config,
    }))
  }

  /**
   * Print summary
   */
  printSummary(): void {
    const stats = this.getStats()

    console.log('\n📊 Webhook Summary')
    console.log('='.repeat(50))
    console.log(`Total Deliveries: ${stats.total}`)
    console.log(`Successful: ${stats.successful}`)
    console.log(`Failed: ${stats.failed}`)
    console.log(`Success Rate: ${stats.successRate}%`)
    console.log(`Avg Response Time: ${stats.avgResponseTime}ms`)
    console.log('='.repeat(50))
  }
}

/**
 * Global webhook manager
 */
export const webhookManager = new WebhookManager()

/**
 * Helper functions for common events
 */
export const WebhookHelpers = {
  /**
   * Send workflow started event
   */
  async workflowStarted(workflowId: string, userId: string, projectName: string) {
    await webhookManager.send(WebhookEvent.WORKFLOW_STARTED, {
      workflowId,
      userId,
      projectName,
    })
  },

  /**
   * Send workflow progress event
   */
  async workflowProgress(
    workflowId: string,
    step: number,
    totalSteps: number,
    status: string
  ) {
    await webhookManager.send(WebhookEvent.WORKFLOW_PROGRESS, {
      workflowId,
      step,
      totalSteps,
      progress: Math.round((step / totalSteps) * 100),
      status,
    })
  },

  /**
   * Send workflow completed event
   */
  async workflowCompleted(
    workflowId: string,
    results: any,
    duration: number
  ) {
    await webhookManager.send(WebhookEvent.WORKFLOW_COMPLETED, {
      workflowId,
      results,
      duration,
    })
  },

  /**
   * Send workflow failed event
   */
  async workflowFailed(workflowId: string, error: string) {
    await webhookManager.send(WebhookEvent.WORKFLOW_FAILED, {
      workflowId,
      error,
    })
  },

  /**
   * Send project generated event
   */
  async projectGenerated(
    projectId: string,
    projectName: string,
    downloadUrl: string
  ) {
    await webhookManager.send(WebhookEvent.PROJECT_GENERATED, {
      projectId,
      projectName,
      downloadUrl,
    })
  },

  /**
   * Send project deployed event
   */
  async projectDeployed(
    projectId: string,
    deploymentUrl: string,
    environment: string
  ) {
    await webhookManager.send(WebhookEvent.PROJECT_DEPLOYED, {
      projectId,
      deploymentUrl,
      environment,
    })
  },

  /**
   * Send error occurred event
   */
  async errorOccurred(
    error: string,
    context?: Record<string, any>
  ) {
    await webhookManager.send(WebhookEvent.ERROR_OCCURRED, {
      error,
      context,
    })
  },
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Register webhooks
  webhookManager.register('slack', {
    url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    events: [
      WebhookEvent.WORKFLOW_COMPLETED,
      WebhookEvent.WORKFLOW_FAILED,
    ],
    retries: 3,
    timeout: 5000,
  })

  webhookManager.register('discord', {
    url: 'https://discord.com/api/webhooks/YOUR/WEBHOOK',
    events: [WebhookEvent.PROJECT_GENERATED],
    secret: 'your-secret-key',
  })

  // Send events
  await WebhookHelpers.workflowStarted('wf-123', 'user-456', 'My Project')
  await WebhookHelpers.workflowProgress('wf-123', 3, 7, 'generating-backend')
  await WebhookHelpers.workflowCompleted('wf-123', { success: true }, 120000)

  // Print summary
  webhookManager.printSummary()
}
