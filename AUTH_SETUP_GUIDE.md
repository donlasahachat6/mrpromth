# Authentication Setup Guide
**Date**: November 10, 2025  
**Status**: ✅ Backend Ready, Need Frontend Configuration

---

## Current Status

### ✅ What's Working

- **Supabase Connection**: Connected successfully
- **OAuth URLs**: GitHub and Google OAuth URLs generated correctly
- **Email Authentication**: Working (tested with invalid credentials)
- **Database Access**: Connected and accessible
- **Environment Variables**: Configured in `.env.local`

### ⚠️ What Needs Configuration

1. **Supabase Dashboard Settings**
2. **OAuth Redirect URLs**
3. **Site URL Configuration**

---

## Supabase Configuration

### Project Details

- **Project URL**: `https://liywmjxhllpexzrnuhlu.supabase.co`
- **Project Ref**: `liywmjxhllpexzrnuhlu`
- **Anon Key**: Configured ✅

### Required Dashboard Settings

#### 1. Authentication → URL Configuration

Go to: https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/url-configuration

**Site URL** (ต้องตั้งค่า):
```
Development: http://localhost:3000
Production: https://your-domain.com
```

**Redirect URLs** (ต้องเพิ่ม):
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/login
http://localhost:3000/**
https://your-domain.com/auth/callback
https://your-domain.com/**
```

#### 2. Authentication → Providers

Go to: https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/providers

**Email Provider** (ควรเปิดอยู่แล้ว):
- ✅ Enable Email provider
- ✅ Confirm email: Optional (for development)
- ✅ Secure email change: Recommended

**GitHub Provider**:
- ✅ Enable GitHub provider
- Client ID: (from GitHub OAuth App)
- Client Secret: (from GitHub OAuth App)
- Callback URL: `https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback`

**Google Provider**:
- ✅ Enable Google provider  
- Client ID: (from Google Cloud Console)
- Client Secret: (from Google Cloud Console)
- Callback URL: `https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback`

---

## GitHub OAuth Setup

### If Not Set Up Yet

1. **Go to GitHub Settings**:
   - https://github.com/settings/developers
   - Click "New OAuth App"

2. **Application Settings**:
   ```
   Application name: Mr.Prompt
   Homepage URL: http://localhost:3000
   Authorization callback URL: https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback
   ```

3. **Get Credentials**:
   - Copy Client ID
   - Generate Client Secret
   - Add to Supabase Dashboard

### If Already Set Up

1. **Verify Callback URL**:
   - Go to your GitHub OAuth App settings
   - Check callback URL matches: `https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback`

2. **Update if Needed**:
   - If URL is different, update it
   - Regenerate secret if necessary

---

## Google OAuth Setup

### If Not Set Up Yet

1. **Go to Google Cloud Console**:
   - https://console.cloud.google.com/
   - Create new project or select existing

2. **Enable Google+ API**:
   - APIs & Services → Library
   - Search "Google+ API"
   - Enable it

3. **Create OAuth Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   
4. **Configure OAuth Consent Screen**:
   ```
   App name: Mr.Prompt
   User support email: your-email@example.com
   Developer contact: your-email@example.com
   ```

5. **Authorized Redirect URIs**:
   ```
   https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback
   ```

6. **Get Credentials**:
   - Copy Client ID
   - Copy Client Secret
   - Add to Supabase Dashboard

### If Already Set Up

1. **Verify Redirect URI**:
   - Go to Google Cloud Console → Credentials
   - Check your OAuth 2.0 Client
   - Verify redirect URI: `https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback`

2. **Update if Needed**:
   - Add the correct redirect URI
   - Update in Supabase Dashboard

---

## Testing Authentication

### 1. Test Email Authentication

```bash
# Go to login page
http://localhost:3000/auth/login

# Try to sign up
http://localhost:3000/auth/signup

# Use test credentials:
Email: test@mrpromth.com
Password: Test123456!
```

### 2. Test GitHub OAuth

```bash
# Click "Sign in with GitHub" button
# Should redirect to GitHub
# After authorization, should redirect back to /auth/callback
# Then redirect to /chat or /dashboard
```

### 3. Test Google OAuth

```bash
# Click "Sign in with Google" button
# Should redirect to Google
# After authorization, should redirect back to /auth/callback
# Then redirect to /chat or /dashboard
```

---

## Common Issues & Solutions

### Issue 1: "Invalid redirect URL"

**Cause**: Redirect URL not added to Supabase allowed list

**Solution**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your redirect URLs to the list
3. Include wildcards: `http://localhost:3000/**`

### Issue 2: "OAuth provider not configured"

**Cause**: GitHub/Google OAuth not enabled in Supabase

**Solution**:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable GitHub/Google provider
3. Add Client ID and Secret
4. Save changes

### Issue 3: "Session not persisting"

**Cause**: Cookie/CORS issues

**Solution**:
1. Check browser console for errors
2. Verify Site URL in Supabase matches your domain
3. Clear browser cache and cookies
4. Try incognito mode

### Issue 4: "ERR_NAME_NOT_RESOLVED"

**Cause**: Wrong Supabase URL or DNS issue

**Solution**:
1. Verify `.env.local` has correct URL
2. Test URL in browser: `https://liywmjxhllpexzrnuhlu.supabase.co`
3. Check if Supabase project is active

---

## Environment Variables Checklist

### Required Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://liywmjxhllpexzrnuhlu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables

```bash
# For admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Quick Start Commands

### 1. Install Dependencies

```bash
cd /home/ubuntu/mrpromth
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test Authentication

```bash
# Run test script
npx tsx test-auth.ts

# Should show:
# ✅ Connection: PASS
# ✅ OAuth: PASS
# ✅ Email Auth: PASS
# ✅ Database: PASS
```

### 4. Open in Browser

```
http://localhost:3000/auth/login
```

---

## Next Steps

### Immediate Actions

1. **Configure Supabase Dashboard**:
   - [ ] Set Site URL
   - [ ] Add Redirect URLs
   - [ ] Verify OAuth providers

2. **Test Authentication**:
   - [ ] Test email sign up/login
   - [ ] Test GitHub OAuth
   - [ ] Test Google OAuth

3. **Create Test User**:
   - [ ] Sign up with email
   - [ ] Verify email (if required)
   - [ ] Test login

### Future Enhancements

4. **Add More Providers**:
   - [ ] Facebook OAuth
   - [ ] Twitter OAuth
   - [ ] Microsoft OAuth

5. **Implement Features**:
   - [ ] Password reset
   - [ ] Email verification
   - [ ] Two-factor authentication
   - [ ] Social account linking

6. **Security**:
   - [ ] Rate limiting on auth endpoints
   - [ ] Brute force protection
   - [ ] Session management
   - [ ] Audit logging

---

## Support

### Supabase Documentation

- **Authentication**: https://supabase.com/docs/guides/auth
- **OAuth**: https://supabase.com/docs/guides/auth/social-login
- **Redirect URLs**: https://supabase.com/docs/guides/auth/redirect-urls

### Project Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu
- **GitHub OAuth Apps**: https://github.com/settings/developers
- **Google Cloud Console**: https://console.cloud.google.com/

---

## Test Results

### Backend Tests (Automated)

```
✅ Supabase Connection: PASS
✅ GitHub OAuth URL: PASS
✅ Google OAuth URL: PASS
✅ Email Authentication: PASS
✅ Database Access: PASS
```

**Status**: All backend tests passing! 🎉

### Frontend Tests (Manual)

- [ ] Email sign up works
- [ ] Email login works
- [ ] GitHub OAuth works
- [ ] Google OAuth works
- [ ] Session persists after refresh
- [ ] Logout works

**Status**: Needs manual testing after Supabase Dashboard configuration

---

**Last Updated**: November 10, 2025  
**Configuration Status**: ✅ Backend Ready, ⚠️ Dashboard Configuration Needed
