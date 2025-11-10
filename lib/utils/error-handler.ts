/**
 * Centralized Error Handler
 * จัดการ errors แบบรวมศูนย์พร้อม logging และ monitoring
 */

import { NextResponse } from 'next/server'

/**
 * Error types
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  AI_MODEL = 'AI_MODEL_ERROR',
  FILE_SYSTEM = 'FILE_SYSTEM_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Custom application error
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>
  public readonly timestamp: string

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    
    this.name = this.constructor.name
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    this.timestamp = new Date().toISOString()

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  logToConsole?: boolean
  logToFile?: boolean
  sendToMonitoring?: boolean
  includeStackTrace?: boolean
}

const defaultConfig: ErrorHandlerConfig = {
  logToConsole: true,
  logToFile: false,
  sendToMonitoring: false,
  includeStackTrace: process.env.NODE_ENV === 'development',
}

/**
 * Log error to console
 */
function logToConsole(error: AppError | Error) {
  const isAppError = error instanceof AppError

  console.error('\n' + '='.repeat(80))
  console.error(`❌ ERROR: ${error.message}`)
  console.error('='.repeat(80))

  if (isAppError) {
    console.error(`Type: ${error.type}`)
    console.error(`Severity: ${error.severity}`)
    console.error(`Status Code: ${error.statusCode}`)
    console.error(`Operational: ${error.isOperational}`)
    console.error(`Timestamp: ${error.timestamp}`)

    if (error.context) {
      console.error(`Context:`, JSON.stringify(error.context, null, 2))
    }
  }

  if (defaultConfig.includeStackTrace && error.stack) {
    console.error('\nStack Trace:')
    console.error(error.stack)
  }

  console.error('='.repeat(80) + '\n')
}

/**
 * Send error to monitoring service
 */
async function sendToMonitoring(error: AppError | Error) {
  // TODO: Integrate with monitoring service (e.g., Sentry, LogRocket)
  // For now, just log
  console.log('[Monitoring] Error sent to monitoring service:', error.message)
}

/**
 * Handle error and return appropriate response
 */
export async function handleError(
  error: Error | AppError,
  config: ErrorHandlerConfig = defaultConfig
): Promise<NextResponse> {
  // Convert to AppError if needed
  const appError = error instanceof AppError
    ? error
    : new AppError(
        error.message,
        ErrorType.INTERNAL,
        ErrorSeverity.HIGH,
        500,
        false,
        { originalError: error.name }
      )

  // Log to console
  if (config.logToConsole) {
    logToConsole(appError)
  }

  // Send to monitoring
  if (config.sendToMonitoring) {
    await sendToMonitoring(appError)
  }

  // Prepare response
  const response: any = {
    error: {
      message: appError.message,
      type: appError.type,
      timestamp: appError.timestamp,
    },
  }

  // Include additional info in development
  if (process.env.NODE_ENV === 'development') {
    response.error.severity = appError.severity
    response.error.context = appError.context
    
    if (config.includeStackTrace && appError.stack) {
      response.error.stack = appError.stack
    }
  }

  return NextResponse.json(response, { status: appError.statusCode })
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>,
  config?: ErrorHandlerConfig
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleError(
        error instanceof Error ? error : new Error(String(error)),
        config
      )
    }
  }
}

/**
 * Common error factories
 */
export const ErrorFactory = {
  validation: (message: string, context?: Record<string, any>) =>
    new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 400, true, context),

  authentication: (message: string = 'Authentication required') =>
    new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, 401, true),

  authorization: (message: string = 'Insufficient permissions') =>
    new AppError(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, 403, true),

  notFound: (resource: string) =>
    new AppError(`${resource} not found`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404, true),

  rateLimit: (message: string = 'Rate limit exceeded') =>
    new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 429, true),

  database: (message: string, context?: Record<string, any>) =>
    new AppError(message, ErrorType.DATABASE, ErrorSeverity.HIGH, 500, true, context),

  externalApi: (service: string, message: string) =>
    new AppError(
      `External API error (${service}): ${message}`,
      ErrorType.EXTERNAL_API,
      ErrorSeverity.MEDIUM,
      502,
      true,
      { service }
    ),

  aiModel: (model: string, message: string) =>
    new AppError(
      `AI model error (${model}): ${message}`,
      ErrorType.AI_MODEL,
      ErrorSeverity.MEDIUM,
      503,
      true,
      { model }
    ),

  fileSystem: (message: string, path?: string) =>
    new AppError(
      message,
      ErrorType.FILE_SYSTEM,
      ErrorSeverity.MEDIUM,
      500,
      true,
      { path }
    ),

  timeout: (operation: string, timeoutMs: number) =>
    new AppError(
      `Operation timed out: ${operation} (${timeoutMs}ms)`,
      ErrorType.TIMEOUT,
      ErrorSeverity.MEDIUM,
      504,
      true,
      { operation, timeoutMs }
    ),

  internal: (message: string, context?: Record<string, any>) =>
    new AppError(message, ErrorType.INTERNAL, ErrorSeverity.HIGH, 500, false, context),
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries - 1) {
        const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay)
        
        if (onRetry) {
          onRetry(attempt + 1, lastError)
        }

        console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

/**
 * Timeout wrapper
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName: string = 'Operation'
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(ErrorFactory.timeout(operationName, timeoutMs)), timeoutMs)
    ),
  ])
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T = any>(json: string, fallback?: T): T | null {
  try {
    return JSON.parse(json)
  } catch (error) {
    console.error('[SafeJsonParse] Failed to parse JSON:', error)
    return fallback ?? null
  }
}

/**
 * Example usage
 */
export async function exampleUsage() {
  // Example 1: Throw custom error
  throw ErrorFactory.validation('Invalid email format', { email: 'invalid@' })

  // Example 2: Retry with backoff
  const result = await retryWithBackoff(
    async () => {
      // Some operation that might fail
      return fetch('https://api.example.com/data')
    },
    {
      maxRetries: 3,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error.message)
      },
    }
  )

  // Example 3: With timeout
  const data = await withTimeout(
    async () => {
      // Some long-running operation
      return fetch('https://api.example.com/slow-endpoint')
    },
    5000,
    'Fetch data from API'
  )
}
