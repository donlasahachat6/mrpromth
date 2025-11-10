# 🚨 Quick Fix Guide - MrPromth

## Problem
Vercel is using **wrong Vanchin API keys** → All chat requests fail with 403 Forbidden

## Solution (Choose ONE method)

---

### Method 1: Vercel Dashboard (EASIEST) ⭐

1. Go to: https://vercel.com/mrpromths-projects-2aa848c0/mrpromth/settings/environment-variables

2. **Delete** all existing `VANCHIN_*` variables (if any old ones exist)

3. **Add** these 29 new variables:

#### Base URL
```
Key: VANCHIN_BASE_URL
Value: https://vanchin.streamlake.ai/api/gateway/v1/endpoints
Target: Production, Preview, Development
```

#### Agent 1
```
Key: VANCHIN_API_KEY_1
Value: WW8GMBSTec_uPhRJQFe5y9OCsYrUKzslQx-LXWKLT9g
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_1
Value: ep-lpvcnv-1761467347624133479
Target: Production, Preview, Development
```

#### Agent 2
```
Key: VANCHIN_API_KEY_2
Value: 3gZ9oCeG3sgxUTcfesqhfVnkAOO3JAEJTZWeQKwqzrk
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_2
Value: ep-j9pysc-1761467653839114083
Target: Production, Preview, Development
```

#### Agent 3
```
Key: VANCHIN_API_KEY_3
Value: npthpUsOWQ68u2VibXDmN3IWTM2IGDJeAxQQL1HVQ50
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_3
Value: ep-2uyob4-1761467835762653881
Target: Production, Preview, Development
```

#### Agent 4
```
Key: VANCHIN_API_KEY_4
Value: l1BsR_0ttZ9edaMf9NGBhFzuAfAS64KUmDGAkaz4VBU
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_4
Value: ep-nqjal5-1762460264139958733
Target: Production, Preview, Development
```

#### Agent 5
```
Key: VANCHIN_API_KEY_5
Value: Bt5nUT0GnP20fjZLDKsIvQKW5KOOoU4OsmQrK8SuUE8
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_5
Value: ep-mhsvw6-1762460362477023705
Target: Production, Preview, Development
```

#### Agent 6
```
Key: VANCHIN_API_KEY_6
Value: vsgJFTYUao7OVR7_hfvrbKX2AMykOAEwuwEPomro-zg
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_6
Value: ep-h614n9-1762460436283699679
Target: Production, Preview, Development
```

#### Agent 7
```
Key: VANCHIN_API_KEY_7
Value: pgBW4ALnqV-RtjlC4EICPbOcH_mY4jpQKAu3VXX6Y9k
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_7
Value: ep-ohxawl-1762460514611065743
Target: Production, Preview, Development
```

#### Agent 8
```
Key: VANCHIN_API_KEY_8
Value: cOkB4mwHHjs95szkuOLGyoSRtzTwP2u6-0YBdcQKszI
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_8
Value: ep-bng3os-1762460592040033785
Target: Production, Preview, Development
```

#### Agent 9
```
Key: VANCHIN_API_KEY_9
Value: 6quSWJIN9tLotXUQNQypn_U2u6BwvvVLAOk7pgl7ybI
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_9
Value: ep-kazx9x-1761818165668826967
Target: Production, Preview, Development
```

#### Agent 10
```
Key: VANCHIN_API_KEY_10
Value: Co8IQ684LePQeq4t2bCB567d4zFa92N_7zaZLhJqkTo
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_10
Value: ep-6bl8j9-1761818251624808527
Target: Production, Preview, Development
```

#### Agent 11
```
Key: VANCHIN_API_KEY_11
Value: a9ciwI-1lgQW8128LG-QK_W0XWtYZ5Kt2aa2Zkjrq9w
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_11
Value: ep-2d9ubo-1761818334800110875
Target: Production, Preview, Development
```

#### Agent 12
```
Key: VANCHIN_API_KEY_12
Value: Ln-Z6aKGDxaMGXvN9hjMunpDNr975AncIpRtK7XrtTw
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_12
Value: ep-dnxrl0-1761818420368606961
Target: Production, Preview, Development
```

#### Agent 13
```
Key: VANCHIN_API_KEY_13
Value: CzQtP9g9qwM6wyxKJZ9spUloShOYH8hR-CHcymRks6w
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_13
Value: ep-nmgm5b-1761818484923833700
Target: Production, Preview, Development
```

#### Agent 14
```
Key: VANCHIN_API_KEY_14
Value: ylFdJan4VXsgm698_XaQZrc9KC_1EE7MRARV6sNapzI
Target: Production, Preview, Development

Key: VANCHIN_ENDPOINT_14
Value: ep-8rvmfy-1762460863026449765
Target: Production, Preview, Development
```

4. **Wait** for Vercel to auto-redeploy (2-3 minutes)

5. **Test** the fix:
```bash
curl https://mrpromth-azure.vercel.app/api/test-vanchin
```

Expected result: `{"success": true, "status": 200, ...}`

---

### Method 2: Automated Script (if you have VERCEL_TOKEN)

```bash
cd /home/ubuntu/mrpromth
export VERCEL_TOKEN="your_vercel_token_here"
python3 update_vercel_env.py
```

---

## Verification

After updating environment variables:

1. **Check deployment status:**
   https://vercel.com/mrpromths-projects-2aa848c0/mrpromth

2. **Test API endpoint:**
   ```bash
   curl https://mrpromth-azure.vercel.app/api/test-vanchin
   ```

3. **Expected response:**
   ```json
   {
     "success": true,
     "status": 200,
     "responsePreview": "สวัสดี...",
     "model": "kat-coder-pro-v1"
   }
   ```

4. **If still failing:**
   - Check Vercel deployment logs
   - Verify all 29 variables are set
   - Ensure no old variables remain
   - Try triggering manual redeploy

---

## What Was Fixed Already ✅

1. ✅ Database migration applied (chat_sessions, chat_messages, etc.)
2. ✅ Chat API updated to use correct table names
3. ✅ Code committed and pushed to GitHub
4. ✅ Verified Vanchin API works locally
5. ✅ Confirmed API client implementation is correct

## What Needs Fixing 🔴

1. 🔴 Vercel environment variables (THIS GUIDE)

## After This Fix ⏭️

Next steps after environment variables are corrected:
1. Test authentication (GitHub/Google OAuth)
2. Test chat functionality (all 4 modes)
3. Test file upload
4. Monitor performance

---

**Estimated Time:** 15-30 minutes  
**Difficulty:** Easy (copy-paste)  
**Impact:** Fixes all chat functionality

---

**Need Help?**
- Full analysis: `CRITICAL_ISSUES_FOUND.md`
- Complete report: `END_TO_END_TEST_REPORT.md`
- Test script: `test_vanchin_direct.py`
