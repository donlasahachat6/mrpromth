/**
 * Structured Logging Utility
 * Provides consistent logging across the application with levels, context, and metadata
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  userId?: string
  requestId?: string
  sessionId?: string
  workflowId?: string
  projectId?: string
  agentId?: string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: LogContext
  metadata?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private minLevel: LogLevel
  private context: LogContext

  constructor(minLevel: LogLevel = LogLevel.INFO, context: LogContext = {}) {
    this.minLevel = minLevel
    this.context = context
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger(this.minLevel, { ...this.context, ...context })
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata)
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata)
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata)
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined

    this.log(LogLevel.ERROR, message, metadata, errorData)
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: { name: string; message: string; stack?: string }
  ): void {
    // Skip if below minimum level
    if (level < this.minLevel) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: Object.keys(this.context).length > 0 ? this.context : undefined,
      metadata,
      error,
    }

    // In production, send to logging service (e.g., Datadog, LogRocket, Sentry)
    // For now, use console with structured format
    this.output(level, entry)
  }

  /**
   * Output log entry
   */
  private output(level: LogLevel, entry: LogEntry): void {
    const formatted = JSON.stringify(entry)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.ERROR:
        console.error(formatted)
        break
    }
  }
}

// Default logger instance
export const logger = new Logger(
  process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
)

/**
 * Create a logger for a specific module
 */
export function createLogger(moduleName: string, context?: LogContext): Logger {
  return logger.child({ module: moduleName, ...context })
}

/**
 * Request logger middleware helper
 */
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({ requestId, userId })
}

/**
 * Workflow logger helper
 */
export function createWorkflowLogger(workflowId: string, userId: string): Logger {
  return logger.child({ workflowId, userId, module: 'workflow' })
}

/**
 * Agent logger helper
 */
export function createAgentLogger(agentId: string, userId: string): Logger {
  return logger.child({ agentId, userId, module: 'agent' })
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createLogger } from '@/lib/utils/logger'
 * 
 * const log = createLogger('chat-api')
 * 
 * log.info('Processing chat request', { provider: 'openai', model: 'gpt-4' })
 * log.error('Failed to process request', error, { requestId: '123' })
 * ```
 */
