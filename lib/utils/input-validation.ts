/**
 * Input Validation Utilities
 * Implements JSON Schema validation and safe input sanitization
 */

import { z } from 'zod'

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Project name validation
  projectName: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(50, 'Project name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Project name can only contain letters, numbers, hyphens, and underscores'),
  
  // Prompt validation
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(10000, 'Prompt must be less than 10000 characters'),
  
  // Code validation
  code: z
    .string()
    .max(100000, 'Code must be less than 100KB'),
  
  // JSON validation
  json: z.string().refine(
    (val) => {
      try {
        JSON.parse(val)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid JSON format' }
  ),
}

/**
 * Validate input against a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(input)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
    }
  }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize SQL to prevent SQL injection
 */
export function sanitizeSql(input: string): string {
  // Remove common SQL injection patterns
  return input
    .replace(/['";]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255)
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }
  
  return { valid: true }
}

/**
 * Validate file type
 */
export function validateFileType(
  fileName: string,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  if (!extension || !allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    }
  }
  
  return { valid: true }
}

/**
 * Safe JSON parse with validation
 */
export function safeJsonParse<T = any>(
  input: string,
  schema?: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(input)
    
    if (schema) {
      const validation = validateInput(schema, parsed)
      if (!validation.success) {
        return {
          success: false,
          error: validation.errors.join(', '),
        }
      }
      return { success: true, data: validation.data }
    }
    
    return { success: true, data: parsed }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Invalid JSON',
    }
  }
}

/**
 * Validate environment variable
 */
export function validateEnvVar(
  name: string,
  value: string | undefined,
  required: boolean = true
): { valid: boolean; error?: string } {
  if (required && !value) {
    return {
      valid: false,
      error: `Environment variable ${name} is required but not set`,
    }
  }
  
  return { valid: true }
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(
  identifier: string,
  action: string
): string {
  return `ratelimit:${action}:${identifier}`
}

/**
 * Validate API key format
 */
export function validateApiKey(key: string): boolean {
  // Check if it's a valid API key format
  // Typically: sk-... or key_...
  return /^(sk-|key_)[a-zA-Z0-9]{32,}$/.test(key)
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length)
  }
  
  const start = data.slice(0, visibleChars)
  const end = data.slice(-visibleChars)
  const masked = '*'.repeat(data.length - visibleChars * 2)
  
  return `${start}${masked}${end}`
}

/**
 * Validate webhook URL
 */
export function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)
    
    // Must be HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Webhook URL must use HTTPS in production',
      }
    }
    
    // Block localhost in production
    if (process.env.NODE_ENV === 'production' && 
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return {
        valid: false,
        error: 'Localhost webhooks are not allowed in production',
      }
    }
    
    return { valid: true }
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    }
  }
}
