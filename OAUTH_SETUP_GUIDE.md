# คู่มือการตั้งค่า OAuth Providers

**โปรเจกต์:** mrpromth-db  
**Supabase Project ID:** liywmjxhllpexzrnuhlu  
**Region:** us-east-1  
**Status:** ACTIVE_HEALTHY

## 🔐 OAuth Providers ที่ต้องตั้งค่า

### 1. GitHub OAuth

#### ขั้นตอนการตั้งค่า GitHub:

1. **ไปที่ GitHub Settings**
   - เข้า https://github.com/settings/developers
   - คลิก "New OAuth App"

2. **กรอกข้อมูล:**
   ```
   Application name: Mr.Prompt
   Homepage URL: https://mrpromth-azure.vercel.app
   Authorization callback URL: https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback
   ```

3. **คัดลอก Credentials:**
   - Client ID: `[คัดลอกจาก GitHub]`
   - Client Secret: `[คัดลอกจาก GitHub]`

4. **ตั้งค่าใน Supabase:**
   - เข้า https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/providers
   - เลือก "GitHub"
   - เปิดใช้งาน (Enable)
   - ใส่ Client ID และ Client Secret
   - บันทึก

#### Redirect URLs สำหรับ Development:
```
http://localhost:3000/auth/callback
```

#### Redirect URLs สำหรับ Production:
```
https://mrpromth-azure.vercel.app/auth/callback
```

---

### 2. Google OAuth

#### ขั้นตอนการตั้งค่า Google:

1. **ไปที่ Google Cloud Console**
   - เข้า https://console.cloud.google.com/apis/credentials
   - เลือกโปรเจกต์หรือสร้างใหม่

2. **สร้าง OAuth 2.0 Client ID:**
   - คลิก "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Mr.Prompt"

3. **กรอก Authorized redirect URIs:**
   ```
   https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

4. **คัดลอก Credentials:**
   - Client ID: `[คัดลอกจาก Google]`
   - Client Secret: `[คัดลอกจาก Google]`

5. **ตั้งค่าใน Supabase:**
   - เข้า https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/providers
   - เลือก "Google"
   - เปิดใช้งาน (Enable)
   - ใส่ Client ID และ Client Secret
   - บันทึก

#### Authorized JavaScript origins:
```
https://mrpromth-azure.vercel.app
http://localhost:3000
```

---

## 📝 ตั้งค่า Redirect URLs ใน Supabase

### Site URL:
```
https://mrpromth-azure.vercel.app
```

### Redirect URLs (เพิ่มทั้งหมดนี้):
```
https://mrpromth-azure.vercel.app/auth/callback
https://mrpromth-azure.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### วิธีตั้งค่า:
1. เข้า https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/url-configuration
2. ตั้งค่า "Site URL" เป็น `https://mrpromth-azure.vercel.app`
3. เพิ่ม Redirect URLs ทั้งหมดข้างบน
4. บันทึก

---

## 🔧 ตั้งค่า Environment Variables

### ใน Vercel:
1. เข้า https://vercel.com/dashboard
2. เลือกโปรเจกต์ "mrpromth"
3. ไปที่ Settings → Environment Variables
4. เพิ่มตัวแปรเหล่านี้:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://liywmjxhllpexzrnuhlu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[คัดลอกจาก Supabase Dashboard]
SUPABASE_SERVICE_ROLE_KEY=[คัดลอกจาก Supabase Dashboard]

# App
NEXT_PUBLIC_APP_URL=https://mrpromth-azure.vercel.app
```

### หา Supabase Keys:
1. เข้า https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/settings/api
2. คัดลอก:
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Checklist

### GitHub OAuth:
- [ ] สร้าง OAuth App ใน GitHub
- [ ] ตั้งค่า Callback URL: `https://liywmjxhllpexzrnuhlu.supabase.co/auth/v1/callback`
- [ ] คัดลอก Client ID และ Secret
- [ ] เปิดใช้งานใน Supabase Dashboard
- [ ] ทดสอบ Login ด้วย GitHub

### Google OAuth:
- [ ] สร้าง OAuth Client ใน Google Cloud Console
- [ ] ตั้งค่า Redirect URIs
- [ ] คัดลอก Client ID และ Secret
- [ ] เปิดใช้งานใน Supabase Dashboard
- [ ] ทดสอบ Login ด้วย Google

### Supabase Configuration:
- [ ] ตั้งค่า Site URL
- [ ] เพิ่ม Redirect URLs
- [ ] ตรวจสอบ Email Templates (ถ้าใช้ Email Auth)
- [ ] ตั้งค่า RLS Policies (Row Level Security)

### Vercel Configuration:
- [ ] เพิ่ม Environment Variables
- [ ] Redeploy โปรเจกต์
- [ ] ทดสอบ Production

---

## 🧪 การทดสอบ

### 1. ทดสอบ Local:
```bash
# ตั้งค่า .env.local
cp .env.example .env.local
# แก้ไขค่าใน .env.local

# รัน development server
pnpm dev

# เปิด http://localhost:3000/auth/login
# ทดสอบ Login ด้วย GitHub และ Google
```

### 2. ทดสอบ Production:
```bash
# Deploy
git push origin main

# เปิด https://mrpromth-azure.vercel.app/auth/login
# ทดสอบ Login ด้วย GitHub และ Google
```

---

## 🐛 Troubleshooting

### ปัญหา: "Invalid redirect URL"
**วิธีแก้:**
- ตรวจสอบว่า Redirect URL ตรงกับที่ตั้งค่าใน Supabase
- ตรวจสอบว่าไม่มี trailing slash (`/`) ที่ไม่จำเป็น
- ตรวจสอบว่า Site URL ถูกต้อง

### ปัญหา: "OAuth provider not configured"
**วิธีแก้:**
- ตรวจสอบว่าเปิดใช้งาน Provider ใน Supabase Dashboard แล้ว
- ตรวจสอบว่า Client ID และ Secret ถูกต้อง
- รอ 1-2 นาทีให้การตั้งค่ามีผล

### ปัญหา: "Access denied"
**วิธีแก้:**
- ตรวจสอบว่า OAuth App ใน GitHub/Google เปิดใช้งานแล้ว
- ตรวจสอบว่า Callback URL ถูกต้อง
- ตรวจสอบว่า Scope ที่ขอถูกต้อง

---

## 📚 เอกสารอ้างอิง

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu
- **Supabase Auth Providers:** https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/providers
- **Supabase URL Config:** https://supabase.com/dashboard/project/liywmjxhllpexzrnuhlu/auth/url-configuration
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub OAuth Apps:** https://github.com/settings/developers
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials
