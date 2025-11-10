/**
 * Error Monitoring Service - IMPROVED VERSION
 * All TODOs RESOLVED
 * 
 * Integrates with Sentry for error tracking (optional)
 */

// Check if Sentry is available
let Sentry: any = null
let sentryInitialized = false

/**
 * Initialize Sentry - RESOLVED TODO (Line 47)
 */
export function initializeErrorMonitoring() {
  if (sentryInitialized) return
  
  try {
    // Only initialize in production or if SENTRY_DSN is set
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Dynamically import Sentry to avoid errors if not installed
      import('@sentry/nextjs')
        .then((SentryModule: any) => {
          Sentry = SentryModule
          
          Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            debug: process.env.NODE_ENV === 'development',
            
            // Filter out sensitive data
            beforeSend(event: any, hint: any) {
              // Remove sensitive headers
              if (event.request?.headers) {
                delete event.request.headers['authorization']
                delete event.request.headers['cookie']
              }
              
              // Remove sensitive query params
              if (event.request?.query_string) {
                event.request.query_string = event.request.query_string
                  .replace(/token=[^&]*/gi, 'token=[REDACTED]')
                  .replace(/api_key=[^&]*/gi, 'api_key=[REDACTED]')
              }
              
              return event
            },
          })
          
          sentryInitialized = true
          console.log('[Error Monitoring] Sentry initialized successfully')
        })
        .catch((error: any) => {
          console.warn('[Error Monitoring] Sentry not available, using console logging:', error.message)
        })
    } else {
      console.log('[Error Monitoring] Sentry DSN not configured, using console logging')
    }
  } catch (error) {
    console.error('[Error Monitoring] Initialization error:', error)
  }
}

/**
 * Log an error - RESOLVED TODO (Line 113)
 */
export function logError(error: Error, context?: Record<string, any>) {
  console.error('[Error]', error, context)
  
  if (Sentry && sentryInitialized) {
    Sentry.captureException(error, {
      extra: context,
      level: 'error'
    })
  } else {
    // Fallback to console
    console.error('[Error Monitoring] Error logged:', {
      message: error.message,
      stack: error.stack,
      context
    })
  }
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: Record<string, any>) {
  console.warn('[Warning]', message, context)
  
  if (Sentry && sentryInitialized) {
    Sentry.captureMessage(message, {
      level: 'warning',
      extra: context
    })
  }
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: Record<string, any>) {
  console.log('[Info]', message, context)
  
  if (Sentry && sentryInitialized) {
    Sentry.captureMessage(message, {
      level: 'info',
      extra: context
    })
  }
}

/**
 * Set user context - RESOLVED TODO (Line 123)
 */
export function setUserContext(user: {
  id: string
  email?: string
  username?: string
  [key: string]: any
}) {
  if (Sentry && sentryInitialized) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } else {
    console.log('[Error Monitoring] User context set:', user.id)
  }
}

/**
 * Clear user context - RESOLVED TODO (Line 133)
 */
export function clearUserContext() {
  if (Sentry && sentryInitialized) {
    Sentry.setUser(null)
  } else {
    console.log('[Error Monitoring] User context cleared')
  }
}

/**
 * Add breadcrumb - RESOLVED TODO (Line 148)
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  if (Sentry && sentryInitialized) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000
    })
  } else {
    console.log(`[Breadcrumb] [${category}] ${message}`, data)
  }
}

/**
 * Track performance
 */
export function startTransaction(name: string, op: string = 'custom') {
  if (Sentry && sentryInitialized) {
    return Sentry.startTransaction({ name, op })
  }
  
  // Fallback to simple timing
  const startTime = Date.now()
  return {
    finish: () => {
      const duration = Date.now() - startTime
      console.log(`[Performance] ${name} took ${duration}ms`)
    }
  }
}

/**
 * Send custom event to monitoring service - RESOLVED TODO (Line 158)
 */
export function sendEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (Sentry && sentryInitialized) {
    Sentry.captureMessage(eventName, {
      level: 'info',
      extra: properties,
      tags: {
        event_type: 'custom'
      }
    })
  } else {
    console.log(`[Event] ${eventName}`, properties)
  }
  
  // Can also send to LogRocket or other services here
  if (typeof window !== 'undefined' && (window as any).LogRocket) {
    (window as any).LogRocket.track(eventName, properties)
  }
}

/**
 * Capture API error
 */
export function captureAPIError(
  endpoint: string,
  method: string,
  statusCode: number,
  error: any
) {
  const errorMessage = `API Error: ${method} ${endpoint} - ${statusCode}`
  
  if (Sentry && sentryInitialized) {
    Sentry.captureException(new Error(errorMessage), {
      tags: {
        type: 'api_error',
        endpoint,
        method,
        status_code: statusCode
      },
      extra: {
        error_details: error
      }
    })
  } else {
    console.error(errorMessage, error)
  }
}

/**
 * Capture database error
 */
export function captureDatabaseError(
  operation: string,
  table: string,
  error: any
) {
  const errorMessage = `Database Error: ${operation} on ${table}`
  
  if (Sentry && sentryInitialized) {
    Sentry.captureException(new Error(errorMessage), {
      tags: {
        type: 'database_error',
        operation,
        table
      },
      extra: {
        error_details: error
      }
    })
  } else {
    console.error(errorMessage, error)
  }
}

/**
 * Capture authentication error
 */
export function captureAuthError(
  action: string,
  error: any
) {
  const errorMessage = `Auth Error: ${action}`
  
  if (Sentry && sentryInitialized) {
    Sentry.captureException(new Error(errorMessage), {
      tags: {
        type: 'auth_error',
        action
      },
      extra: {
        error_details: error
      }
    })
  } else {
    console.error(errorMessage, error)
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  initializeErrorMonitoring()
}

export default {
  initialize: initializeErrorMonitoring,
  logError,
  logWarning,
  logInfo,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  sendEvent,
  captureAPIError,
  captureDatabaseError,
  captureAuthError
}
