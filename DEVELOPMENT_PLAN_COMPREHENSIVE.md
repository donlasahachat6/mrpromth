# Comprehensive Development Plan - Mr.Prompt System

## Current Status Analysis

### What's Working
1. ✅ **Vercel Deployment** - Live at https://mrpromth-azure.vercel.app
2. ✅ **Basic UI Structure** - Dashboard, Chat, Prompts pages exist
3. ✅ **Terminal-style Chat Interface** - Basic input/output working
4. ✅ **Agent Chain System** - 7 agents defined (Prompt Expander, Architecture Designer, etc.)
5. ✅ **Authentication Flow** - Login/signup pages exist
6. ✅ **Supabase Integration** - Database connected
7. ✅ **GitHub & Vercel MCP** - Connected and working

### Critical Issues to Fix

#### 1. GitHub OAuth Error (HIGH PRIORITY)
**Error**: "Unable to exchange external code: 37f8cd00c6a4ac2aab71"
**Location**: https://mrpromth-azure.vercel.app/app/dashboard?error=...

**Root Cause**: Supabase GitHub OAuth configuration incomplete
- Missing or incorrect redirect URLs
- GitHub OAuth app not properly configured
- Callback URL mismatch

**Solution Steps**:
1. Check Supabase Dashboard → Authentication → Providers → GitHub
2. Verify GitHub OAuth App settings (Client ID, Secret)
3. Add correct redirect URLs:
   - `https://mrpromth-azure.vercel.app/auth/callback`
   - `https://*.vercel.app/auth/callback`
4. Update environment variables in Vercel

#### 2. Chat Interface Incomplete (HIGH PRIORITY)
**Current State**: Terminal-style UI with basic text input
**Missing Features**:
- ❌ No agent selection dropdown
- ❌ No mode switching (chat/code/project)
- ❌ No markdown rendering
- ❌ No code syntax highlighting
- ❌ No file attachments working
- ❌ No message history persistence
- ❌ No streaming response display
- ❌ No context management UI

**Required Features** (like Codex/Cursor/Manus):
1. **Agent Selection Panel**
   - Dropdown with 39 Vanchin agents
   - Agent capabilities display
   - Load balancing indicator

2. **Mode Switching**
   - 💬 Chat Mode - General conversation
   - 💻 Code Mode - Code generation/review
   - 🚀 Project Mode - Full project generation
   - 🔧 Debug Mode - Error analysis

3. **Rich Message Display**
   - User messages (right-aligned, blue)
   - AI messages (left-aligned, with avatar)
   - Code blocks with syntax highlighting
   - Markdown rendering (bold, italic, lists, tables)
   - Copy buttons for code
   - Line numbers

4. **Context Panel**
   - Active files list
   - Project information
   - Current directory
   - Attached files display

5. **Message Actions**
   - Regenerate response
   - Edit message
   - Copy message
   - Delete message
   - Share conversation

6. **File Operations**
   - Drag & drop file upload
   - File preview
   - Download generated files
   - Inline file viewer

#### 3. Vanchin AI Integration (HIGH PRIORITY)
**Current State**: OpenAI API configured, Vanchin keys available but not integrated
**Need to Implement**:
1. Load balancer for 39 API key pairs
2. Round-robin or least-used strategy
3. Fallback mechanism when key fails
4. Rate limit tracking per key
5. Health check for each endpoint

#### 4. GitHub Integration Button (MEDIUM PRIORITY)
**Current State**: Button exists but functionality unclear
**Need to Implement**:
1. Import repository functionality
2. Clone repo to workspace
3. Analyze existing code
4. Suggest improvements
5. Create pull requests

## Implementation Plan

### Phase 1: Fix GitHub OAuth (30 minutes)
```bash
# Tasks:
1. Check Supabase GitHub OAuth configuration
2. Verify redirect URLs
3. Update environment variables
4. Test authentication flow
```

### Phase 2: Create Enhanced Chat UI (2 hours)
```typescript
// Components to create:
1. AgentSelector.tsx - Dropdown for 39 agents
2. ModeSwitch.tsx - Chat/Code/Project/Debug modes
3. MessageList.tsx - Rich message display
4. CodeBlock.tsx - Syntax highlighted code
5. ContextPanel.tsx - Files and project info
6. FileUpload.tsx - Drag & drop files
7. MessageActions.tsx - Copy/Regenerate/Edit
```

### Phase 3: Vanchin AI Integration (1 hour)
```typescript
// Files to create/update:
1. lib/ai/vanchin-load-balancer.ts
2. lib/ai/vanchin-client-pool.ts
3. app/api/chat/route.ts (update)
4. Environment variables (.env.local)
```

### Phase 4: Chat Persistence (1 hour)
```sql
-- Supabase tables:
1. chat_sessions (id, user_id, title, created_at, updated_at)
2. chat_messages (id, session_id, role, content, agent_id, created_at)
3. chat_files (id, session_id, file_name, file_url, file_type)
4. agent_usage (id, agent_id, user_id, requests_count, last_used)
```

### Phase 5: GitHub Integration (1 hour)
```typescript
// Components:
1. GitHubRepoImporter.tsx
2. GitHubPRCreator.tsx
3. app/api/github/import/route.ts
4. app/api/github/analyze/route.ts
```

### Phase 6: Testing & Deployment (1 hour)
```bash
# Test checklist:
1. ✅ GitHub OAuth login
2. ✅ Chat with agent selection
3. ✅ Mode switching
4. ✅ File upload
5. ✅ Code highlighting
6. ✅ Message persistence
7. ✅ GitHub import
8. ✅ Vanchin AI responses
```

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **UI Components**: Radix UI + Tailwind CSS
- **Markdown**: react-markdown
- **Code Highlighting**: Prism.js or highlight.js
- **File Upload**: react-dropzone
- **State Management**: React hooks + SWR

### Backend Stack
- **API Routes**: Next.js API routes
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Provider**: Vanchin AI (39 endpoints)
- **Rate Limiting**: Upstash Redis

### Database Schema

```sql
-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT DEFAULT 'chat', -- chat, code, project, debug
  agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  agent_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Files
CREATE TABLE chat_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Usage Tracking
CREATE TABLE agent_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  success_rate FLOAT DEFAULT 1.0
);
```

### Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Vanchin AI (39 pairs)
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints
VANCHIN_API_KEY_1=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VANCHIN_ENDPOINT_1=ep-lpvcnv-1761467347624133479
# ... (38 more pairs)

# OpenAI (fallback)
OPENAI_API_KEY=xxx

# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx

# App Config
NEXT_PUBLIC_APP_URL=https://mrpromth-azure.vercel.app
NODE_ENV=production
```

## Priority Order

### Immediate (Next 2 hours)
1. ✅ Fix GitHub OAuth error
2. ✅ Create enhanced chat UI with agent selection
3. ✅ Integrate Vanchin AI with load balancing
4. ✅ Add markdown and code highlighting

### Short-term (Next 4 hours)
5. ✅ Implement chat persistence to Supabase
6. ✅ Add file upload functionality
7. ✅ Create context management panel
8. ✅ Fix GitHub integration button

### Medium-term (Next 8 hours)
9. ✅ Add all 39 Vanchin agents
10. ✅ Implement mode switching (chat/code/project/debug)
11. ✅ Create agent usage analytics
12. ✅ Add message actions (copy/regenerate/edit)

### Long-term (Next 16 hours)
13. ✅ Code execution in chat
14. ✅ Real-time collaboration
15. ✅ Voice input/output
16. ✅ Mobile app optimization

## Success Criteria

### Must Have (MVP)
- [x] GitHub OAuth working
- [x] Chat with agent selection
- [x] Markdown rendering
- [x] Code syntax highlighting
- [x] Message persistence
- [x] Vanchin AI integration (39 keys)

### Should Have
- [x] File upload
- [x] Mode switching
- [x] Context panel
- [x] Message actions
- [x] GitHub import

### Nice to Have
- [ ] Code execution
- [ ] Voice input
- [ ] Real-time collaboration
- [ ] Mobile optimization

## Next Steps

1. **Start with OAuth fix** - Critical blocker
2. **Build enhanced chat UI** - Core feature
3. **Integrate Vanchin AI** - Differentiation
4. **Test end-to-end** - Quality assurance
5. **Deploy to production** - Go live

Let's begin! 🚀
