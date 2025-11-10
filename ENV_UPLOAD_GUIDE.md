# คู่มือการอัพโหลด Environment Variables ไป Vercel

## 📋 ภาพรวม

โปรเจคนี้มี **84 environment variables** ที่ต้องตั้งค่าใน Vercel:
- **Supabase:** 3 variables
- **Vanchin AI:** 79 variables (39 API keys + 39 endpoints + 1 base URL)
- **Other:** 2 variables (APP_URL, NODE_ENV)

---

## 🎯 วิธีที่ 1: ใช้ Shell Script (แนะนำ - เร็วที่สุด)

### ขั้นตอน:

1. **ดึง Vercel Token:**
   - ไปที่ https://vercel.com/account/tokens
   - คลิก "Create Token"
   - ตั้งชื่อ: "MR.Promth Env Upload"
   - Scope: เลือก team "mrpromths-projects-2aa848c0"
   - คลิก "Create"
   - **คัดลอก token ทันที** (จะแสดงครั้งเดียว)

2. **ตั้งค่า Token ใน Terminal:**
   ```bash
   export VERCEL_TOKEN='your_token_here'
   ```

3. **รัน Script:**
   ```bash
   cd /path/to/mrpromth
   ./upload_env_vars.sh
   ```

4. **รอให้เสร็จ:**
   - Script จะอัพโหลดทีละ variable
   - ใช้เวลาประมาณ 1-2 นาที

5. **Redeploy:**
   - ไปที่ Vercel Dashboard
   - คลิก "Deployments" → "Redeploy"

**เวลาที่ใช้:** ~5 นาที

---

## 🌐 วิธีที่ 2: ผ่าน Vercel Dashboard (Manual)

### ขั้นตอน:

1. **เปิด Vercel Dashboard:**
   ```
   https://vercel.com/mrpromths-projects-2aa848c0/mrpromth/settings/environment-variables
   ```

2. **เปิดไฟล์ `vercel_env_config.json`:**
   - อยู่ใน root directory ของโปรเจค
   - มี 84 variables พร้อมค่า

3. **เพิ่ม Variables ทีละตัว:**
   - คลิก "Add New"
   - **Key:** คัดลอกจาก JSON (เช่น `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value:** คัดลอกค่าจาก JSON
   - **Target:** เลือก **ทั้งหมด** (Production, Preview, Development)
   - คลิก "Save"

4. **ทำซ้ำสำหรับทุก Variable:**
   - ใช้เวลาประมาณ 15-20 นาที

5. **Redeploy:**
   - ไปที่ "Deployments"
   - คลิก "Redeploy" บน latest deployment

**เวลาที่ใช้:** ~20-25 นาที

---

## 🗄️ วิธีที่ 3: ดึงจาก Supabase (สำหรับ Automation)

Environment variables ถูกเก็บไว้ใน Supabase แล้ว!

### Query เพื่อดึงข้อมูล:

```sql
SELECT key, value, target 
FROM env_variables 
WHERE project_name = 'mrpromth'
ORDER BY key;
```

### ใช้ใน Code:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ดึง env vars
const { data, error } = await supabase
  .from('env_variables')
  .select('*')
  .eq('project_name', 'mrpromth');

if (data) {
  data.forEach(({ key, value }) => {
    process.env[key] = value;
  });
}
```

---

## 📊 รายการ Variables สำคัญ

### 1. Supabase (3 variables)

```
NEXT_PUBLIC_SUPABASE_URL=https://liywmjxhllpexzrnuhlu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_8ZlcRVFhxlk2muMHneo-mQ_pJP7Wx7_
```

### 2. Vanchin AI (79 variables)

```
VANCHIN_BASE_URL=https://vanchin.streamlake.ai/api/gateway/v1/endpoints

# API Keys (39 pairs)
VANCHIN_API_KEY_1=WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
VANCHIN_ENDPOINT_1=ep-lpvcnv-1761467347624133479
...
VANCHIN_API_KEY_39=mk3IEpn4EQomPceum6ALgOdHjwHAZJo52xllz0y32B8
VANCHIN_ENDPOINT_39=ep-mb0m44-1762718869832867784
```

### 3. Other (2 variables)

```
NEXT_PUBLIC_APP_URL=https://mrpromth-azure.vercel.app
NODE_ENV=production
```

---

## ✅ การตรวจสอบหลังอัพโหลด

### 1. ตรวจสอบใน Vercel Dashboard:
```
https://vercel.com/mrpromths-projects-2aa848c0/mrpromth/settings/environment-variables
```

ควรเห็น:
- ✅ 84 environment variables
- ✅ ทุก variable มี target: Production, Preview, Development

### 2. ตรวจสอบหลัง Redeploy:

เปิด browser console และตรวจสอบ:
```javascript
// ควรเห็นค่าเหล่านี้
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### 3. ทดสอบ Chat:

1. Login เข้าระบบ
2. ไปที่ `/chat`
3. ส่งข้อความ
4. ตรวจสอบว่า AI ตอบกลับมา

---

## 🐛 Troubleshooting

### ปัญหา: "VERCEL_TOKEN not set"

**แก้ไข:**
```bash
export VERCEL_TOKEN='your_token_here'
```

### ปัญหา: "Unauthorized"

**แก้ไข:**
- ตรวจสอบว่า token ถูกต้อง
- ตรวจสอบว่า token มี scope ที่ถูกต้อง (team access)
- สร้าง token ใหม่ถ้าจำเป็น

### ปัญหา: "Rate limit exceeded"

**แก้ไข:**
- รอ 1-2 นาที
- รัน script อีกครั้ง (จะข้าม variables ที่อัพโหลดแล้ว)

### ปัญหา: Chat ไม่ทำงานหลัง Deploy

**แก้ไข:**
1. ตรวจสอบว่า env vars ถูกตั้งค่าครบ (84 ตัว)
2. ตรวจสอบว่า Redeploy เสร็จแล้ว
3. Clear browser cache
4. ลอง login ใหม่
5. ตรวจสอบ Vercel logs:
   ```
   https://vercel.com/mrpromths-projects-2aa848c0/mrpromth/logs
   ```

---

## 📝 หมายเหตุ

- **Token Security:** อย่าแชร์ VERCEL_TOKEN กับใคร
- **Backup:** ไฟล์ `vercel_env_config.json` และ Supabase table เป็น backup
- **Updates:** ถ้าต้องการอัพเดท env vars ให้แก้ไขใน Vercel Dashboard
- **Local Development:** ใช้ไฟล์ `.env.local` สำหรับ development

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Get Vercel Token from https://vercel.com/account/tokens
export VERCEL_TOKEN='your_token_here'

# 2. Run upload script
cd /path/to/mrpromth
./upload_env_vars.sh

# 3. Redeploy on Vercel Dashboard
# 4. Test the app!
```

---

**หมายเหตุ:** หลังจากอัพโหลด env vars แล้ว ต้อง **Redeploy** เพื่อให้การเปลี่ยนแปลงมีผล!
