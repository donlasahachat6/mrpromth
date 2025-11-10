/**
 * Input Validation & Sanitization - ENHANCED VERSION
 * Prevents injection attacks and validates user input
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Project name is required' }
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Project name must be less than 50 characters' }
  }
  
  if (!/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: 'Project name can only contain lowercase letters, numbers, and hyphens' }
  }
  
  if (name.startsWith('-') || name.endsWith('-')) {
    return { valid: false, error: 'Project name cannot start or end with a hyphen' }
  }
  
  return { valid: true }
}

/**
 * Validate prompt
 */
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' }
  }
  
  if (prompt.length < 10) {
    return { valid: false, error: 'Prompt must be at least 10 characters' }
  }
  
  if (prompt.length > 5000) {
    return { valid: false, error: 'Prompt must be less than 5000 characters' }
  }
  
  return { valid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address' }
  }
  
  return { valid: true }
}

/**
 * Validate email format (simple boolean)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL' }
  }
}

/**
 * Validate URL format (simple boolean)
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): { valid: boolean; error?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!uuid || !uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID' }
  }
  
  return { valid: true }
}

/**
 * Validate UUID format (simple boolean)
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize SQL input (basic)
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove /* comments
    .replace(/\*\//g, '')
}

/**
 * Validate file path (prevent directory traversal)
 */
export function validateFilePath(path: string): { valid: boolean; error?: string } {
  // Check for directory traversal attempts
  if (path.includes('..') || path.includes('~')) {
    return { valid: false, error: 'Invalid file path: directory traversal detected' }
  }
  
  // Check for absolute paths
  if (path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
    return { valid: false, error: 'Absolute paths are not allowed' }
  }
  
  return { valid: true }
}

/**
 * Validate JSON
 */
export function validateJson(json: string): { valid: boolean; error?: string; data?: any } {
  try {
    const data = JSON.parse(json)
    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: 'Invalid JSON' }
  }
}

/**
 * Escape HTML
 */
export function escapeHtml(html: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return html.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate and sanitize workflow request
 */
export function validateWorkflowRequest(request: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate project name
  if (request.projectName) {
    const result = validateProjectName(request.projectName)
    if (!result.valid) {
      errors.push(result.error!)
    }
  } else {
    errors.push('Project name is required')
  }
  
  // Validate prompt
  if (request.prompt) {
    const result = validatePrompt(request.prompt)
    if (!result.valid) {
      errors.push(result.error!)
    }
  } else {
    errors.push('Prompt is required')
  }
  
  // Validate user ID
  if (!request.userId) {
    errors.push('User ID is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize filename
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .substring(0, 255); // Limit length
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxBytes;
}

/**
 * Validate file type
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return mimeType.startsWith(prefix);
    }
    return mimeType === type;
  });
}

/**
 * Common file type groups
 */
export const FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  archives: ['application/zip', 'application/x-tar', 'application/gzip'],
  code: ['text/plain', 'application/json', 'application/javascript', 'text/html', 'text/css']
};

/**
 * Validate JSON schema
 */
export function validateSchema(data: any, schema: object): {
  valid: boolean;
  errors: string[];
} {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  return {
    valid,
    errors: valid ? [] : (validate.errors?.map(e => `${e.instancePath} ${e.message}`) || [])
  };
}

/**
 * Common validation schemas
 */
export const SCHEMAS = {
  // User registration
  userRegistration: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 100 },
      displayName: { type: 'string', minLength: 1, maxLength: 100 }
    },
    additionalProperties: false
  },
  
  // Project creation
  projectCreation: {
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      description: { type: 'string', minLength: 1, maxLength: 1000 },
      prompt: { type: 'string', minLength: 1, maxLength: 5000 }
    },
    additionalProperties: false
  },
  
  // Chat message
  chatMessage: {
    type: 'object',
    required: ['message'],
    properties: {
      message: { type: 'string', minLength: 1, maxLength: 10000 },
      sessionId: { type: 'string', format: 'uuid' },
      model: { type: 'string' }
    },
    additionalProperties: false
  }
};

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Complexity checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // Feedback
  if (password.length < 8) feedback.push('Password must be at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters');
  
  return {
    valid: score >= 4,
    score,
    feedback
  };
}

/**
 * Sanitize HTML
 * Basic XSS protection
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '');
}

/**
 * Validate SQL query (basic check)
 * Prevents common SQL injection patterns
 */
export function isValidSQLQuery(query: string): boolean {
  const dangerousPatterns = [
    /;\s*drop\s+/i,
    /;\s*delete\s+/i,
    /;\s*update\s+/i,
    /;\s*insert\s+/i,
    /;\s*exec\s+/i,
    /;\s*execute\s+/i,
    /union\s+select/i,
    /--/,
    /\/\*/,
    /xp_/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(query));
}

/**
 * Sanitize object keys
 * Prevents prototype pollution
 */
export function sanitizeObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectKeys);
  }
  
  const sanitized: any = {};
  for (const key in obj) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    sanitized[key] = sanitizeObjectKeys(obj[key]);
  }
  
  return sanitized;
}
