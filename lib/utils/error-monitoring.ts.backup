/**
 * Error Monitoring Utility
 * Centralized error tracking and reporting
 * Ready for Sentry, LogRocket, or other monitoring services
 */

import { logger } from './logger'

interface ErrorContext {
  userId?: string
  requestId?: string
  sessionId?: string
  workflowId?: string
  projectId?: string
  url?: string
  method?: string
  statusCode?: number
  [key: string]: any
}

interface ErrorReport {
  error: Error
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  fingerprint?: string[]
}

class ErrorMonitor {
  private enabled: boolean
  private sentryDsn?: string

  constructor() {
    this.enabled = process.env.NODE_ENV === 'production'
    this.sentryDsn = process.env.SENTRY_DSN
  }

  /**
   * Initialize error monitoring service
   */
  async init(): Promise<void> {
    if (!this.enabled || !this.sentryDsn) {
      logger.info('Error monitoring disabled (development mode or no DSN)')
      return
    }

    try {
      // TODO: Initialize Sentry or other monitoring service
      // Example:
      // const Sentry = await import('@sentry/nextjs')
      // Sentry.init({
      //   dsn: this.sentryDsn,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: 0.1,
      //   beforeSend(event) {
      //     // Filter sensitive data
      //     return event
      //   }
      // })
      
      logger.info('Error monitoring initialized')
    } catch (error) {
      logger.error('Failed to initialize error monitoring', error)
    }
  }

  /**
   * Capture and report an error
   */
  captureError(report: ErrorReport): void {
    const { error, context, severity, fingerprint } = report

    // Log error locally
    logger.error(error.message, error, {
      severity,
      context,
      fingerprint,
    })

    // Send to monitoring service in production
    if (this.enabled && this.sentryDsn) {
      this.sendToMonitoringService(report)
    }
  }

  /**
   * Capture an exception with context
   */
  captureException(
    error: Error | unknown,
    context?: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const err = error instanceof Error ? error : new Error(String(error))
    
    this.captureError({
      error: err,
      context: context || {},
      severity,
    })
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext
  ): void {
    logger.info(message, { level, context })

    if (this.enabled && this.sentryDsn) {
      // TODO: Send to monitoring service
      // Sentry.captureMessage(message, { level, contexts: { custom: context } })
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, username?: string): void {
    if (this.enabled && this.sentryDsn) {
      // TODO: Set user context in monitoring service
      // Sentry.setUser({ id: userId, email, username })
    }
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (this.enabled && this.sentryDsn) {
      // TODO: Clear user context
      // Sentry.setUser(null)
    }
  }

  /**
   * Add breadcrumb for error context
   */
  addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, any>,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    if (this.enabled && this.sentryDsn) {
      // TODO: Add breadcrumb
      // Sentry.addBreadcrumb({ message, category, data, level })
    }
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoringService(report: ErrorReport): void {
    try {
      // TODO: Implement actual sending to Sentry/LogRocket
      // Example:
      // Sentry.withScope((scope) => {
      //   scope.setLevel(this.mapSeverityToLevel(report.severity))
      //   scope.setContext('custom', report.context)
      //   if (report.fingerprint) {
      //     scope.setFingerprint(report.fingerprint)
      //   }
      //   Sentry.captureException(report.error)
      // })
    } catch (error) {
      logger.error('Failed to send error to monitoring service', error)
    }
  }

  /**
   * Map severity to Sentry level
   */
  private mapSeverityToLevel(severity: string): string {
    const mapping: Record<string, string> = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'fatal',
    }
    return mapping[severity] || 'error'
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor()

/**
 * Initialize error monitoring
 */
export async function initErrorMonitoring(): Promise<void> {
  await errorMonitor.init()
}

/**
 * Capture error helper
 */
export function captureError(
  error: Error | unknown,
  context?: ErrorContext,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  errorMonitor.captureException(error, context, severity)
}

/**
 * Capture message helper
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  errorMonitor.captureMessage(message, level, context)
}

/**
 * Set user context helper
 */
export function setUserContext(userId: string, email?: string, username?: string): void {
  errorMonitor.setUser(userId, email, username)
}

/**
 * Clear user context helper
 */
export function clearUserContext(): void {
  errorMonitor.clearUser()
}

/**
 * Add breadcrumb helper
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  errorMonitor.addBreadcrumb(message, category, data, level)
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { captureError, setUserContext, addBreadcrumb } from '@/lib/utils/error-monitoring'
 * 
 * // Set user context
 * setUserContext(user.id, user.email, user.username)
 * 
 * // Add breadcrumb
 * addBreadcrumb('User clicked generate button', 'user-action', { projectId: '123' })
 * 
 * // Capture error
 * try {
 *   await generateProject()
 * } catch (error) {
 *   captureError(error, { projectId: '123', userId: user.id }, 'high')
 *   throw error
 * }
 * ```
 */
