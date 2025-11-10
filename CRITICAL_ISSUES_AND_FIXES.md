# ปัญหาวิกฤตและวิธีแก้ไขโดยละเอียด

**วันที่:** 10 พฤศจิกายน 2025

## 🚨 ปัญหาวิกฤต #1: Supabase Connection Error

### อาการ
- ไม่สามารถเข้าสู่ระบบ (Login) ได้
- ไม่สามารถสมัครสมาชิก (Signup) ได้
- ข้อความแสดงข้อผิดพลาด: `ERR_NAME_NOT_RESOLVED` และ `Project paused. Please visit the Supabase Dashboard to restore it.`

### สาเหตุ
1. **URL ของ Supabase ไม่ถูกต้องหรือโปรเจกต์ถูกพักการใช้งาน:**
   - URL ที่ผู้ใช้แจ้ง: `xcwkwdoxrbzzpwmlqswr.supabase.co` ไม่สามารถเข้าถึงได้
   - URL ที่ Hardcode ในโค้ด: `liywmjxhllpexzrnuhlu.supabase.co` ก็ไม่สามารถเข้าถึงได้เช่นกัน

2. **ไฟล์ที่มีปัญหา:**
   - `check-workflows.ts` (บรรทัดที่ 3-4): Hardcode URL และ Service Role Key
   - `config/production.config.ts` (บรรทัดที่ 147): ใช้ fallback URL
   - `next.config.optimized.js`: ใช้ fallback URL

### วิธีแก้ไข

#### วิธีที่ 1: สร้างโปรเจกต์ Supabase ใหม่ (แนะนำ)

**ขั้นตอนที่ 1: สร้างโปรเจกต์ใหม่**
1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. คลิก "New Project"
3. กรอกข้อมูล:
   - Project Name: `mrpromth` (หรือชื่ออื่นที่ต้องการ)
   - Database Password: สร้างรหัสผ่านที่แข็งแรง
   - Region: เลือก `Southeast Asia (Singapore)` เพื่อความเร็วที่ดีที่สุด
4. รอให้โปรเจกต์สร้างเสร็จ (ประมาณ 2-3 นาที)

**ขั้นตอนที่ 2: คัดลอก API Keys**
1. ไปที่ `Settings` > `API`
2. คัดลอกค่าต่อไปนี้:
   - Project URL (ตัวอย่าง: `https://abcdefghijklmn.supabase.co`)
   - `anon` `public` key
   - `service_role` `secret` key

**ขั้นตอนที่ 3: รัน Migrations**
1. ติดตั้ง Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login เข้า Supabase:
   ```bash
   supabase login
   ```

3. Link โปรเจกต์:
   ```bash
   cd /path/to/mrpromth
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. รัน migrations:
   ```bash
   supabase db push
   ```

**ขั้นตอนที่ 4: ตั้งค่า Environment Variables**

สร้างไฟล์ `.env.local` ในโฟลเดอร์รากของโปรเจกต์:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Vanchin AI Configuration
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints
VANCHIN_AGENT_AGENT1_KEY=your_vanchin_agent1_key
VANCHIN_AGENT_AGENT2_KEY=your_vanchin_agent2_key
VANCHIN_AGENT_AGENT3_KEY=your_vanchin_agent3_key
VANCHIN_AGENT_AGENT4_KEY=your_vanchin_agent4_key
VANCHIN_AGENT_AGENT5_KEY=your_vanchin_agent5_key
VANCHIN_AGENT_AGENT6_KEY=your_vanchin_agent6_key
VANCHIN_AGENT_AGENT7_KEY=your_vanchin_agent7_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**ขั้นตอนที่ 5: ตั้งค่า OAuth Providers (GitHub & Google)**

1. **GitHub OAuth:**
   - ไปที่ GitHub Settings > Developer settings > OAuth Apps
   - สร้าง New OAuth App
   - Authorization callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - คัดลอก Client ID และ Client Secret
   - ไปที่ Supabase Dashboard > Authentication > Providers > GitHub
   - เปิดใช้งานและกรอก Client ID และ Client Secret

2. **Google OAuth:**
   - ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
   - สร้าง OAuth 2.0 Client ID
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - คัดลอก Client ID และ Client Secret
   - ไปที่ Supabase Dashboard > Authentication > Providers > Google
   - เปิดใช้งานและกรอก Client ID และ Client Secret

**ขั้นตอนที่ 6: แก้ไขโค้ดที่ Hardcode**

1. แก้ไขไฟล์ `check-workflows.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
   const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
   
   if (!url || !key) {
     console.error('❌ Supabase credentials not configured')
     process.exit(1)
   }
   
   const supabase = createClient(url, key)
   
   async function check() {
     const { data, error } = await supabase.from('workflows').select('id').limit(1)
     if (error) {
       console.log('❌ Workflows table does not exist:', error.message)
       process.exit(1)
     } else {
       console.log('✅ Workflows table exists')
       process.exit(0)
     }
   }
   
   check()
   ```

2. แก้ไขไฟล์ `config/production.config.ts` (บรรทัดที่ 147):
   ```typescript
   'connect-src': ["'self'", process.env.NEXT_PUBLIC_SUPABASE_URL || '']
   ```

3. แก้ไขไฟล์ `next.config.optimized.js`:
   ```javascript
   process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
   ```

#### วิธีที่ 2: Restore โปรเจกต์เดิม (หากยังสามารถทำได้)

1. เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. หาโปรเจกต์ที่ถูกพักการใช้งาน
3. คลิก "Restore Project"
4. รอให้โปรเจกต์กลับมาทำงานอีกครั้ง
5. ทำตามขั้นตอนที่ 2-6 ของวิธีที่ 1

---

## 🚨 ปัญหาวิกฤต #2: Build ไม่ผ่าน (Build Failure)

### อาการ
- รันคำสั่ง `pnpm build` แล้วได้ error:
  ```
  Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY 
  env variables or supabaseUrl and supabaseKey are required!
  ```
- หน้า Login และ Signup ไม่สามารถ pre-render ได้

### สาเหตุ
หน้า Login และ Signup มีการเรียก `createClientComponentClient()` ในระดับบนสุดของ component ซึ่ง Next.js พยายาม pre-render ในขั้นตอน build และ Supabase client จะ throw error หากไม่มีการตั้งค่า environment variables

### วิธีแก้ไข

**แก้ไขไฟล์ `app/auth/login/page.tsx`:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockAuth, shouldUseMockAuth } from '@/lib/auth/mock-auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useMock, setUseMock] = useState(false)
  const [supabase, setSupabase] = useState<any>(null) // เพิ่มบรรทัดนี้
  
  const router = useRouter()
  
  useEffect(() => {
    // Check if should use mock auth
    const shouldMock = shouldUseMockAuth()
    setUseMock(shouldMock)
    
    // สร้าง Supabase client เฉพาะเมื่อไม่ใช่ Mock Mode
    if (!shouldMock) {
      setSupabase(createClientComponentClient())
    }
  }, [])
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (useMock) {
        // Use mock authentication
        const { user, error: mockError } = await mockAuth.signIn(email, password)
        
        if (mockError) {
          setError(mockError)
        } else {
          router.push('/chat')
          router.refresh()
        }
      } else {
        // ตรวจสอบว่า supabase client พร้อมใช้งานหรือไม่
        if (!supabase) {
          setError('Supabase client not initialized')
          return
        }
        
        // Use Supabase authentication
        const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (supabaseError) {
          setError(supabaseError.message)
        } else {
          router.push('/chat')
          router.refresh()
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleGitHubLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      if (useMock) {
        // Use mock OAuth
        const { url, error: mockError } = await mockAuth.signInWithOAuth('github')
        
        if (mockError) {
          setError(mockError)
          setLoading(false)
        } else if (url) {
          router.push(url)
          router.refresh()
        }
      } else {
        // ตรวจสอบว่า supabase client พร้อมใช้งานหรือไม่
        if (!supabase) {
          setError('Supabase client not initialized')
          setLoading(false)
          return
        }
        
        // Use Supabase OAuth
        const { error: supabaseError } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (supabaseError) {
          setError(supabaseError.message)
          setLoading(false)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      if (useMock) {
        // Use mock OAuth
        const { url, error: mockError } = await mockAuth.signInWithOAuth('google')
        
        if (mockError) {
          setError(mockError)
          setLoading(false)
        } else if (url) {
          router.push(url)
          router.refresh()
        }
      } else {
        // ตรวจสอบว่า supabase client พร้อมใช้งานหรือไม่
        if (!supabase) {
          setError('Supabase client not initialized')
          setLoading(false)
          return
        }
        
        // Use Supabase OAuth
        const { error: supabaseError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (supabaseError) {
          setError(supabaseError.message)
          setLoading(false)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }
  
  // ... ส่วนที่เหลือของ component เหมือนเดิม
}
```

**แก้ไขไฟล์ `app/auth/signup/page.tsx` ในลักษณะเดียวกัน**

---

## 🔐 ปัญหาความปลอดภัย: Hardcoded Credentials

### ไฟล์ที่ต้องแก้ไข

1. **`check-workflows.ts`** - ลบ hardcoded URL และ Key
2. **`config/production.config.ts`** - ลบ fallback URL
3. **`next.config.optimized.js`** - ลบ fallback URL
4. **`test-auth.ts`** - ลบ fallback URL

### วิธีแก้ไข
ดูตัวอย่างโค้ดที่แก้ไขแล้วในส่วน "ปัญหาวิกฤต #1 > ขั้นตอนที่ 6"

---

## 📋 TODO Items ที่ต้องพัฒนาต่อ

### High Priority
1. ✅ แก้ไข Supabase connection
2. ✅ แก้ไข Build failure
3. ⏳ JSON Schema validation (`app/api/agents/[id]/execute/route.ts`)
4. ⏳ Safe condition evaluation (`app/api/agents/[id]/execute/route.ts`)

### Medium Priority
5. ⏳ Image processing features (OCR, description, resize, convert)
6. ⏳ PDF image upload to storage
7. ⏳ AI-powered code generation (migrations, API routes, functions)

### Low Priority
8. ⏳ Least-used model selection strategy
9. ⏳ Web search implementation
10. ⏳ Code execution sandbox

---

## 🎯 ขั้นตอนการแก้ไขแบบเร่งด่วน (Quick Fix Steps)

### สำหรับการทดสอบเบื้องต้น (ใช้ Mock Mode)

1. **ตั้งค่า Environment Variables:**
   ```bash
   cd /path/to/mrpromth
   cp .env.example .env.local
   ```

2. **แก้ไข `.env.local`:**
   ```env
   # ปล่อยว่างเพื่อใช้ Mock Mode
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   
   # ใส่ค่าอื่นๆ ตามต้องการ
   OPENAI_API_KEY=your_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. **แก้ไขโค้ด Login/Signup ตามที่แนะนำในส่วน "ปัญหาวิกฤต #2"**

4. **Build และรันโปรเจกต์:**
   ```bash
   pnpm build
   pnpm start
   ```

5. **ทดสอบ:**
   - เข้า `http://localhost:3000/auth/login`
   - ใช้ Demo Account: `demo@example.com` (password อะไรก็ได้)

### สำหรับการใช้งานจริง (Production)

ทำตามขั้นตอนในส่วน "ปัญหาวิกฤต #1 > วิธีที่ 1" ทั้งหมด

---

**หมายเหตุ:** เอกสารนี้จะถูกอัปเดตเมื่อมีการแก้ไขปัญหาหรือพบปัญหาใหม่
