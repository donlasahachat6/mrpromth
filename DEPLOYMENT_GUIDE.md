# Deployment Guide - Mr.Prompt AI Agent Platform
**Date**: November 10, 2025  
**Status**: Ready for Deployment

---

## Pre-Deployment Checklist

### ✅ Completed Items

- [x] Authentication system configured
- [x] Supabase connection established
- [x] Rate limiting implemented
- [x] Error handling and monitoring
- [x] Structured logging system
- [x] User dashboard created
- [x] Projects management page
- [x] Agent marketplace
- [x] TypeScript build successful
- [x] Environment variables configured

### ⚠️ Required Before Production

- [ ] Configure Supabase Dashboard (Site URL, Redirect URLs)
- [ ] Set up OAuth providers (GitHub, Google)
- [ ] Add service role key for admin operations
- [ ] Configure production domain
- [ ] Set up SSL certificate
- [ ] Configure email service (for notifications)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure CDN (Cloudflare, Vercel Edge)
- [ ] Set up database backups
- [ ] Configure rate limiting thresholds for production

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**:
- Zero-config deployment
- Automatic SSL
- Edge network
- Built-in analytics
- Preview deployments
- Easy rollbacks

**Steps**:

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd /home/ubuntu/mrpromth
vercel
```

4. **Set Environment Variables**:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

5. **Deploy to Production**:
```bash
vercel --prod
```

### Option 2: Netlify

**Steps**:

1. **Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Initialize**:
```bash
netlify init
```

4. **Deploy**:
```bash
netlify deploy --prod
```

### Option 3: Docker + VPS

**Dockerfile**:
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Deploy**:
```bash
docker build -t mrprompt .
docker run -p 3000:3000 --env-file .env.local mrprompt
```

### Option 4: AWS (Advanced)

**Services**:
- **Amplify**: For Next.js hosting
- **RDS**: For database (if not using Supabase)
- **S3**: For file storage
- **CloudFront**: For CDN
- **Route 53**: For DNS

---

## Environment Variables

### Development (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://liywmjxhllpexzrnuhlu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature Flags
ENABLE_USER_REGISTRATION=true
AGENT_MODE_ENABLED=true
MAINTENANCE_MODE=false
```

### Production (.env.production)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://liywmjxhllpexzrnuhlu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
LOGROCKET_APP_ID=your_logrocket_id

# Email (Optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Feature Flags
ENABLE_USER_REGISTRATION=true
AGENT_MODE_ENABLED=true
MAINTENANCE_MODE=false
```

---

## Supabase Configuration

### 1. Database Setup

**Tables to Create** (if not exists):

```sql
-- Users table (handled by Supabase Auth)

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
```

### 2. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Chat sessions policies
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

### 3. Authentication Settings

**Go to**: https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/url-configuration

**Site URL**:
```
Production: https://your-domain.com
```

**Redirect URLs**:
```
https://your-domain.com/auth/callback
https://your-domain.com/**
```

**Email Templates** (optional):
- Customize confirmation email
- Customize password reset email
- Add your branding

---

## Domain Configuration

### 1. DNS Settings

**A Record**:
```
Type: A
Name: @
Value: [Your server IP or Vercel IP]
TTL: Auto
```

**CNAME Record** (for www):
```
Type: CNAME
Name: www
Value: your-domain.com
TTL: Auto
```

### 2. SSL Certificate

**Vercel**: Automatic  
**Netlify**: Automatic  
**Custom**: Use Let's Encrypt

```bash
# For custom server
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Performance Optimization

### 1. Next.js Configuration

**next.config.js**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['liywmjxhllpexzrnuhlu.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### 2. Caching Strategy

**Redis** (optional):
```bash
# Install Redis
npm install redis

# Configure caching
# lib/cache.ts
import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL
})

export async function getCached(key: string) {
  return await client.get(key)
}

export async function setCached(key: string, value: string, ttl: number) {
  await client.set(key, value, { EX: ttl })
}
```

### 3. Database Optimization

- Enable connection pooling
- Add appropriate indexes
- Use prepared statements
- Implement query caching

---

## Monitoring & Analytics

### 1. Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

**sentry.client.config.js**:
```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
})
```

### 2. Google Analytics

**app/layout.tsx**:
```typescript
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 3. Uptime Monitoring

**Options**:
- UptimeRobot (free)
- Pingdom
- StatusCake
- Better Uptime

---

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Enable RLS on Supabase
- [ ] Implement CSRF protection
- [ ] Add security headers
- [ ] Regular dependency updates
- [ ] Enable 2FA for admin accounts

---

## Backup Strategy

### 1. Database Backups

**Supabase**: Automatic daily backups (Pro plan)

**Manual Backup**:
```bash
# Export database
pg_dump -h db.liywmjxhllpexzrnuhlu.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_$(date +%Y%m%d).sql
```

### 2. Code Backups

- GitHub repository (primary)
- GitLab mirror (optional)
- Local backups

---

## Post-Deployment

### 1. Smoke Tests

```bash
# Test homepage
curl https://your-domain.com

# Test API
curl https://your-domain.com/api/health

# Test authentication
# (manual browser test)
```

### 2. Monitor Logs

```bash
# Vercel
vercel logs

# Check Sentry dashboard
# Check Supabase logs
```

### 3. Performance Testing

**Tools**:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse

**Target Metrics**:
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

---

## Rollback Plan

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Manual

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard [commit-hash]
git push --force origin main
```

---

## Maintenance Mode

**Enable**:
```bash
# Set environment variable
MAINTENANCE_MODE=true

# Or create maintenance page
# app/maintenance/page.tsx
```

---

## Support & Documentation

### Internal Documentation

- README.md - Project overview
- AUTH_SETUP_GUIDE.md - Authentication setup
- FEATURE_ANALYSIS.md - Feature roadmap
- DEPLOYMENT_GUIDE.md - This file

### External Resources

- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs

---

**Deployment Status**: ✅ Ready  
**Last Updated**: November 10, 2025  
**Next Review**: Before production launch
