/**
 * Safe Condition Evaluator
 * Safely evaluate conditions without using eval()
 */

/**
 * Supported operators
 */
type Operator = 
  | '==' | '!=' | '===' | '!=='
  | '>' | '<' | '>=' | '<='
  | 'contains' | 'startsWith' | 'endsWith'
  | 'matches' | 'in' | 'notIn'

interface Condition {
  field: string
  operator: Operator
  value: any
}

interface LogicalCondition {
  and?: Condition[]
  or?: Condition[]
  not?: Condition
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(condition: Condition, context: Record<string, any>): boolean {
  const fieldValue = getNestedValue(context, condition.field)
  const { operator, value } = condition

  switch (operator) {
    case '==':
      return fieldValue == value
    
    case '!=':
      return fieldValue != value
    
    case '===':
      return fieldValue === value
    
    case '!==':
      return fieldValue !== value
    
    case '>':
      return Number(fieldValue) > Number(value)
    
    case '<':
      return Number(fieldValue) < Number(value)
    
    case '>=':
      return Number(fieldValue) >= Number(value)
    
    case '<=':
      return Number(fieldValue) <= Number(value)
    
    case 'contains':
      return String(fieldValue).includes(String(value))
    
    case 'startsWith':
      return String(fieldValue).startsWith(String(value))
    
    case 'endsWith':
      return String(fieldValue).endsWith(String(value))
    
    case 'matches':
      try {
        const regex = new RegExp(String(value))
        return regex.test(String(fieldValue))
      } catch {
        return false
      }
    
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue)
    
    case 'notIn':
      return Array.isArray(value) && !value.includes(fieldValue)
    
    default:
      throw new Error(`Unsupported operator: ${operator}`)
  }
}

/**
 * Evaluate logical conditions (AND, OR, NOT)
 */
export function evaluateLogicalCondition(
  condition: LogicalCondition,
  context: Record<string, any>
): boolean {
  if (condition.and) {
    return condition.and.every((c) => evaluateCondition(c, context))
  }

  if (condition.or) {
    return condition.or.some((c) => evaluateCondition(c, context))
  }

  if (condition.not) {
    return !evaluateCondition(condition.not, context)
  }

  return false
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Safe expression evaluator (limited to simple math)
 */
export function evaluateMathExpression(expression: string): number | null {
  // Only allow numbers, spaces, and basic operators
  const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '')
  
  if (sanitized !== expression) {
    throw new Error('Invalid characters in expression')
  }

  // Check for balanced parentheses
  let depth = 0
  for (const char of sanitized) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (depth < 0) throw new Error('Unbalanced parentheses')
  }
  if (depth !== 0) throw new Error('Unbalanced parentheses')

  try {
    // Use Function constructor (safer than eval, but still sandboxed)
    const func = new Function(`'use strict'; return (${sanitized})`)
    const result = func()
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return null
    }
    
    return result
  } catch {
    return null
  }
}

/**
 * Validate condition structure
 */
export function validateCondition(condition: any): {
  valid: boolean
  error?: string
} {
  if (!condition || typeof condition !== 'object') {
    return { valid: false, error: 'Condition must be an object' }
  }

  // Check for logical operators
  if (condition.and || condition.or || condition.not) {
    if (condition.and && !Array.isArray(condition.and)) {
      return { valid: false, error: 'AND condition must be an array' }
    }
    if (condition.or && !Array.isArray(condition.or)) {
      return { valid: false, error: 'OR condition must be an array' }
    }
    if (condition.not && typeof condition.not !== 'object') {
      return { valid: false, error: 'NOT condition must be an object' }
    }
    return { valid: true }
  }

  // Check for basic condition
  if (!condition.field || !condition.operator) {
    return {
      valid: false,
      error: 'Condition must have field and operator',
    }
  }

  const validOperators: Operator[] = [
    '==', '!=', '===', '!==',
    '>', '<', '>=', '<=',
    'contains', 'startsWith', 'endsWith',
    'matches', 'in', 'notIn',
  ]

  if (!validOperators.includes(condition.operator)) {
    return {
      valid: false,
      error: `Invalid operator: ${condition.operator}`,
    }
  }

  return { valid: true }
}

/**
 * Safe template string interpolation
 */
export function safeInterpolate(
  template: string,
  context: Record<string, any>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim())
    return value !== undefined ? String(value) : match
  })
}

/**
 * Evaluate conditions with timeout
 */
export async function evaluateWithTimeout<T>(
  evaluator: () => T,
  timeoutMs: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Evaluation timeout'))
    }, timeoutMs)

    try {
      const result = evaluator()
      clearTimeout(timer)
      resolve(result)
    } catch (error) {
      clearTimeout(timer)
      reject(error)
    }
  })
}

/**
 * Example usage:
 * 
 * const condition = {
 *   and: [
 *     { field: 'user.age', operator: '>=', value: 18 },
 *     { field: 'user.country', operator: '===', value: 'US' }
 *   ]
 * }
 * 
 * const context = {
 *   user: { age: 25, country: 'US' }
 * }
 * 
 * const result = evaluateLogicalCondition(condition, context) // true
 */
