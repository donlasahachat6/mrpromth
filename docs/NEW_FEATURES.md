# New Features Documentation

**Date**: November 10, 2025  
**Version**: 2.0  
**Status**: Development

---

## Overview

This document describes the new features and improvements added to the Mr.Prompt system.

---

## 1. Smart Model Selector

### Purpose
Intelligent AI model selection with automatic load balancing and performance tracking.

### Location
`lib/ai/smart-model-selector.ts`

### Features

#### 1.1 Intelligent Model Selection
- **Round-robin**: For general tasks
- **Performance-based**: For specific tasks (code generation, analysis, etc.)
- **Automatic failover**: Switches to another model if one fails

#### 1.2 Performance Tracking
- Success rate monitoring
- Response time tracking
- Load distribution
- Least recently used (LRU) tracking

#### 1.3 Task Types
- `code-generation`: For generating code
- `analysis`: For analyzing requirements
- `conversation`: For chat interactions
- `testing`: For test generation
- `documentation`: For creating docs
- `general`: For general purpose

### Usage

```typescript
import { executeWithSmartSelection, modelSelector } from '@/lib/ai/smart-model-selector'

// Example 1: Simple request
const result = await executeWithSmartSelection(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain TypeScript.' }
  ],
  'general'
)

console.log('Response:', result.response)
console.log('Model used:', result.modelKey)
console.log('Response time:', result.responseTime, 'ms')

// Example 2: Code generation with specific options
const codeResult = await executeWithSmartSelection(
  [{ role: 'user', content: 'Write a function to sort an array.' }],
  'code-generation',
  { 
    temperature: 0.3, 
    maxTokens: 500,
    retries: 3 
  }
)

// Example 3: Manual model selection
const { client, endpoint, modelKey } = modelSelector.selectModel('analysis')

// Example 4: View metrics
modelSelector.printMetrics()
```

### Benefits
- **Improved reliability**: Automatic retry with different models
- **Better performance**: Uses fastest available models
- **Load balancing**: Distributes requests evenly
- **Monitoring**: Track which models perform best

---

## 2. Error Handler

### Purpose
Centralized error handling with retry logic, timeout management, and structured error types.

### Location
`lib/utils/error-handler.ts`

### Features

#### 2.1 Error Types
- `VALIDATION_ERROR`: Input validation failures
- `AUTHENTICATION_ERROR`: Auth failures
- `AUTHORIZATION_ERROR`: Permission issues
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `DATABASE_ERROR`: Database operations
- `EXTERNAL_API_ERROR`: External API failures
- `AI_MODEL_ERROR`: AI model issues
- `FILE_SYSTEM_ERROR`: File operations
- `INTERNAL_ERROR`: Internal server errors
- `TIMEOUT_ERROR`: Operation timeouts

#### 2.2 Error Severity
- `LOW`: Minor issues, user can continue
- `MEDIUM`: Significant issues, some features affected
- `HIGH`: Major issues, core functionality affected
- `CRITICAL`: System-wide failures

#### 2.3 Features
- Automatic retry with exponential backoff
- Timeout wrapper for long operations
- Structured error responses
- Development vs production error details
- Error logging and monitoring

### Usage

```typescript
import { 
  ErrorFactory, 
  handleError, 
  withErrorHandler,
  retryWithBackoff,
  withTimeout 
} from '@/lib/utils/error-handler'

// Example 1: Throw custom errors
throw ErrorFactory.validation('Invalid email format', { email: 'test@' })
throw ErrorFactory.notFound('User')
throw ErrorFactory.rateLimit()

// Example 2: Wrap API route with error handling
export const POST = withErrorHandler(async (req: Request) => {
  // Your logic here
  return NextResponse.json({ success: true })
})

// Example 3: Retry with backoff
const data = await retryWithBackoff(
  async () => {
    return fetch('https://api.example.com/data')
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}:`, error.message)
    }
  }
)

// Example 4: Timeout wrapper
const result = await withTimeout(
  async () => {
    // Long operation
    return processLargeFile()
  },
  5000, // 5 seconds
  'Process large file'
)

// Example 5: Manual error handling
try {
  // Some operation
} catch (error) {
  return handleError(error)
}
```

### Benefits
- **Consistent error handling**: Same format across all APIs
- **Better debugging**: Structured error information
- **Improved reliability**: Automatic retry for transient failures
- **Better UX**: Clear error messages for users

---

## 3. Performance Monitor

### Purpose
Track and analyze performance metrics for all operations.

### Location
`lib/utils/performance-monitor.ts`

### Features

#### 3.1 Metrics Tracking
- Operation duration
- Request count
- Average/min/max response times
- Percentiles (P50, P95, P99)

#### 3.2 Monitoring Methods
- Manual timing (start/end)
- Automatic timing (measure)
- Decorator-based monitoring

### Usage

```typescript
import { 
  performanceMonitor, 
  measureAsync,
  measureSync 
} from '@/lib/utils/performance-monitor'

// Example 1: Manual timing
const timer = performanceMonitor.start('database_query', { table: 'users' })
// ... do database query
performanceMonitor.end(timer)

// Example 2: Automatic timing (async)
const data = await measureAsync('api_request', async () => {
  return fetch('https://api.example.com/data')
})

// Example 3: Automatic timing (sync)
const result = measureSync('calculation', () => {
  return complexCalculation()
})

// Example 4: With measure method
await performanceMonitor.measure(
  'workflow_execution',
  async () => {
    // Your workflow logic
  },
  { workflowId: '123' }
)

// Example 5: View metrics
performanceMonitor.printSummary()

// Example 6: Get specific metrics
const summary = performanceMonitor.getSummary('api_request')
console.log('Average time:', summary.averageDuration)
console.log('P95:', summary.p95Duration)

// Example 7: Export to JSON
const json = performanceMonitor.exportToJson()
```

### Benefits
- **Performance insights**: Know which operations are slow
- **Optimization targets**: Identify bottlenecks
- **Monitoring**: Track performance over time
- **Debugging**: Find performance regressions

---

## 4. Optimized Workflow Orchestrator

### Purpose
Improved version of the workflow orchestrator with better error handling, retry logic, and performance monitoring.

### Location
`lib/workflow/optimized-orchestrator.ts`

### Features

#### 4.1 Improvements
- Smart AI model selection
- Automatic retry for failed steps
- Performance monitoring for each step
- Timeout protection
- Better error messages
- Step duration tracking

#### 4.2 New Capabilities
- Configurable timeout per workflow
- Detailed performance summary
- AI model metrics
- Step-by-step monitoring

### Usage

```typescript
import { OptimizedWorkflowOrchestrator } from '@/lib/workflow/optimized-orchestrator'

// Create orchestrator
const orchestrator = new OptimizedWorkflowOrchestrator({
  userId: 'user-123',
  projectName: 'my-project',
  prompt: 'Create a todo app with authentication',
  options: {
    skipTesting: false,
    skipDeployment: false,
    timeout: 300000 // 5 minutes
  }
})

// Execute workflow
const result = await orchestrator.execute(
  'Create a todo app with authentication',
  {
    timeout: 300000
  }
)

console.log('Workflow completed:', result.id)
console.log('Total duration:', result.performance.totalDuration)
console.log('Step durations:', result.performance.stepDurations)
```

### Benefits
- **More reliable**: Automatic retry and failover
- **Faster**: Smart model selection
- **Better monitoring**: Track performance
- **Safer**: Timeout protection

---

## 5. Vanchin AI Connection Test

### Purpose
Test connectivity and performance of all Vanchin AI models.

### Location
`test-vanchin-connection.ts`

### Features
- Test multiple models
- Measure response time
- Success rate tracking
- Summary report

### Usage

```bash
# Run test
npx tsx test-vanchin-connection.ts
```

### Output
```
🧪 Testing Vanchin AI Connection...
Total models available: 19

Testing Model 1 (model_1)...
✅ Success (3564ms)
   Response: Hello! I am working.

Testing Model 2 (model_2)...
✅ Success (2095ms)
   Response: Hello! I am working.

...

📊 Test Summary
============================================================
Total tested: 5
✅ Successful: 5
❌ Failed: 0
⏱️  Average response time: 1751ms

✅ Vanchin AI connection is working!
5 out of 5 models are operational.
```

---

## Integration Guide

### Step 1: Update Workflow to Use Optimized Orchestrator

```typescript
// Before
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator'

// After
import { OptimizedWorkflowOrchestrator } from '@/lib/workflow/optimized-orchestrator'
```

### Step 2: Add Error Handling to API Routes

```typescript
import { withErrorHandler, ErrorFactory } from '@/lib/utils/error-handler'

export const POST = withErrorHandler(async (req: Request) => {
  // Validate input
  if (!body.email) {
    throw ErrorFactory.validation('Email is required')
  }

  // Your logic here
  return NextResponse.json({ success: true })
})
```

### Step 3: Add Performance Monitoring

```typescript
import { performanceMonitor } from '@/lib/utils/performance-monitor'

export async function POST(req: Request) {
  return performanceMonitor.measure('api_endpoint', async () => {
    // Your logic here
    return NextResponse.json({ success: true })
  })
}
```

### Step 4: Use Smart Model Selection

```typescript
import { executeWithSmartSelection } from '@/lib/ai/smart-model-selector'

const result = await executeWithSmartSelection(
  messages,
  'code-generation',
  { temperature: 0.3, maxTokens: 1000 }
)
```

---

## Migration Checklist

- [ ] Update workflow orchestrator imports
- [ ] Add error handling to all API routes
- [ ] Add performance monitoring to critical paths
- [ ] Replace direct Vanchin AI calls with smart selector
- [ ] Test all endpoints with new error handling
- [ ] Monitor performance metrics
- [ ] Review and optimize slow operations

---

## Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
# Test Vanchin AI connection
npx tsx test-vanchin-connection.ts

# Test error handling
npx tsx test-error-handler.ts

# Test performance monitoring
npx tsx test-performance-monitor.ts
```

---

## Performance Benchmarks

### Before Optimization
- Average workflow time: ~180 seconds
- Success rate: ~85%
- Retry rate: ~15%

### After Optimization (Expected)
- Average workflow time: ~120 seconds (33% faster)
- Success rate: ~95% (with retry logic)
- Retry rate: ~5%

---

## Future Improvements

1. **Caching Layer**
   - Cache AI responses for similar prompts
   - Reduce API calls

2. **Parallel Processing**
   - Run independent steps in parallel
   - Reduce total workflow time

3. **Advanced Monitoring**
   - Real-time dashboard
   - Alerting for failures
   - Performance trends

4. **AI Model Optimization**
   - Fine-tune model selection algorithm
   - Add more models
   - Implement cost optimization

---

## Support

For questions or issues:
- GitHub Issues: https://github.com/donlasahachat6/mrpromth/issues
- Documentation: `/docs`

---

**Last Updated**: November 10, 2025  
**Version**: 2.0
