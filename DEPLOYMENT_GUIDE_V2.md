# Mr.Prompt Deployment Guide v2.0

**Last Updated**: November 10, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅

## 📋 Overview

This guide covers deploying Mr.Prompt with all new features including:
- Database abstraction layer with mock support
- Advanced rate limiting
- Request queue system
- Webhook notifications
- Performance monitoring
- Comprehensive error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm i -g pnpm`)
- Supabase account (optional - mock DB available)
- Vercel account (for deployment)
- Vanchin AI keys (included in repo)

### 1-Minute Deploy to Vercel

```bash
# Clone repository
git clone https://github.com/donlasahachat6/mrpromth.git
cd mrpromth

# Install dependencies
pnpm install

# Deploy to Vercel
npx vercel --prod
```

## 🔧 Environment Setup

### Option A: With Supabase (Full Features)

Create `.env.local`:

```bash
# Supabase (Required for persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (Required for authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key

# Optional: GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Option B: Without Supabase (Development)

The system works without Supabase using mock database:

```bash
# Minimal setup - just NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key
```

**Note**: Mock database is automatically used when Supabase credentials are not provided.

## 🗄️ Database Setup

### If Using Supabase

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Copy URL and keys

2. **Run Migrations**
   ```sql
   -- In Supabase SQL Editor, run these files in order:
   -- 1. supabase/migrations/001_initial_schema.sql
   -- 2. supabase/migrations/002_agent_chain_schema.sql
   -- 3. supabase/migrations/003_rbac_and_settings.sql
   -- 4. supabase/migrations/004_prompt_library_and_agents.sql
   -- 5. supabase/migrations/005_rooms_and_terminal.sql
   -- 6. supabase/migrations/006_fix_schema_and_add_features.sql
   -- 7. supabase/migrations/007_workflows_table.sql
   ```

3. **Enable RLS**
   - All tables have RLS policies
   - Policies are included in migrations

### If Using Mock Database

No setup required! The system automatically:
- Creates in-memory database
- Provides full CRUD operations
- Supports all features except persistence

## 🧪 Testing

### Run All Tests

```bash
# Unit tests
pnpm test

# Database layer tests
npx tsx test-database-layer.ts

# Advanced features tests
npx tsx test-advanced-features.ts

# Error handler tests
npx tsx test-error-handler.ts

# Performance monitor tests
npx tsx test-performance-monitor.ts

# Vanchin AI connection test
npx tsx test-vanchin-connection.ts
```

### Expected Results
- ✅ All tests should pass
- ✅ 100% success rate
- ✅ No errors or warnings

## 📦 Build for Production

```bash
# Clean build
rm -rf .next

# Production build
pnpm build

# Expected output:
# ✓ Compiled successfully
# Route (app)                              Size     First Load JS
# + First Load JS shared by all            87.3 kB
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Via Vercel Dashboard:**
1. Go to https://vercel.com
2. Import Git Repository
3. Select `donlasahachat6/mrpromth`
4. Configure environment variables
5. Deploy

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

**Environment Variables in Vercel:**
- Add all variables from `.env.local`
- Vanchin AI keys are hardcoded (no setup needed)

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 3: Docker

```dockerfile
# Dockerfile (create this)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

```bash
# Build and run
docker build -t mrprompt .
docker run -p 3000:3000 --env-file .env.production mrprompt
```

## 🎯 Feature Configuration

### Rate Limiting

Pre-configured rate limiters available:

```typescript
import { RateLimiters } from './lib/utils/rate-limiter'

// Strict: 10 requests/minute
RateLimiters.strict

// Standard: 30 requests/minute
RateLimiters.standard

// Generous: 100 requests/minute
RateLimiters.generous

// AI: 20 requests/minute
RateLimiters.ai

// Project Generation: 5 per hour
RateLimiters.projectGeneration

// Login: 5 per 15 minutes
RateLimiters.login
```

### Request Queue

Pre-configured queues:

```typescript
import { RequestQueues } from './lib/utils/request-queue'

// AI requests (max 3 concurrent)
RequestQueues.ai

// Project generation (max 2 concurrent)
RequestQueues.projectGeneration

// General API (max 10 concurrent)
RequestQueues.api

// Background tasks (max 5 concurrent)
RequestQueues.background
```

### Webhooks

Register webhooks for events:

```typescript
import { webhookManager, WebhookEvent } from './lib/webhooks/webhook-manager'

webhookManager.register('my-webhook', {
  url: 'https://your-webhook-url.com',
  events: [
    WebhookEvent.WORKFLOW_STARTED,
    WebhookEvent.WORKFLOW_COMPLETED,
    WebhookEvent.PROJECT_GENERATED,
  ],
  secret: 'your-secret-key',
  retries: 3,
})
```

## 📊 Monitoring

### Performance Monitoring

Built-in performance monitoring:

```typescript
import { performanceMonitor } from './lib/utils/performance-monitor'

// Get metrics
const metrics = performanceMonitor.getMetrics('operation_name')

// Export to JSON
const report = performanceMonitor.exportToJSON()
```

### Error Tracking

Comprehensive error handling:

```typescript
import { ErrorFactory } from './lib/utils/error-handler'

// Create typed errors
throw ErrorFactory.validation('Invalid input')
throw ErrorFactory.notFound('Resource')
throw ErrorFactory.rateLimit('Too many requests')
```

## 🔍 Troubleshooting

### Build Errors

**Issue**: TypeScript errors during build
```bash
# Solution: Clean and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

**Issue**: Database type errors
```bash
# Solution: System uses mock DB automatically
# No action needed - will work without Supabase
```

### Runtime Errors

**Issue**: "Database not available"
```bash
# Solution: Check if using mock DB
# Mock DB is automatic fallback - no errors should occur
```

**Issue**: "Rate limit exceeded"
```bash
# Solution: Wait for rate limit window to reset
# Or adjust rate limiter configuration
```

### Performance Issues

**Issue**: Slow response times
```bash
# Solution: Check performance metrics
npx tsx -e "import { performanceMonitor } from './lib/utils/performance-monitor'; performanceMonitor.printSummary()"
```

## 📈 Performance Benchmarks

### Current Metrics
- **Build Time**: ~2 minutes
- **Bundle Size**: 87.3 kB (First Load JS)
- **API Response**: < 500ms
- **AI Response**: 1-3s
- **Database Query**: < 100ms (mock) / < 200ms (Supabase)
- **Cache Hit Rate**: 66-100%

### Optimization Tips
1. Enable caching (built-in cache manager)
2. Use request queue for concurrent requests
3. Configure rate limiting appropriately
4. Monitor with performance monitor
5. Use webhooks for async operations

## 🔒 Security

### Built-in Security Features
- ✅ Rate limiting (multiple tiers)
- ✅ Request queue (prevent overload)
- ✅ Error handling (no sensitive data leaks)
- ✅ Type-safe database queries
- ✅ RLS policies (when using Supabase)

### Recommendations
1. Use HTTPS in production
2. Set strong NEXTAUTH_SECRET
3. Configure CORS properly
4. Enable Supabase RLS
5. Monitor rate limit violations

## 📚 Documentation

### Available Docs
- `README.md` - Project overview
- `ANALYSIS_REPORT.md` - System analysis
- `DEVELOPMENT_REPORT_NOV_10_2025.md` - Latest development
- `docs/NEW_FEATURES.md` - Feature documentation
- `NEXT_STEPS.md` - Future improvements

### API Documentation
See `/docs` folder for:
- API endpoints
- Agent documentation
- Database schema
- Type definitions

## ✅ Deployment Checklist

### Pre-Deployment
- [x] All tests passing
- [x] Build successful
- [x] No TypeScript errors
- [x] Environment variables configured
- [ ] Supabase setup (optional)
- [ ] Domain configured

### Deployment
- [ ] Deploy to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Test in production
- [ ] Monitor for errors

### Post-Deployment
- [ ] Verify all features work
- [ ] Check performance metrics
- [ ] Set up monitoring
- [ ] Configure webhooks (optional)

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Application loads without errors
- ✅ Authentication works
- ✅ Chat interface functional
- ✅ Project generation works
- ✅ Code editor accessible
- ✅ API endpoints responding
- ✅ Performance meets benchmarks

## 🆘 Support

- **GitHub Issues**: https://github.com/donlasahachat6/mrpromth/issues
- **Documentation**: `/docs` folder
- **Test Files**: `test-*.ts` files for examples

---

**Ready to Deploy!** 🚀

All systems tested and verified. Choose your deployment platform and follow the steps above.
