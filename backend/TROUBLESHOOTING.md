# 🔧 Troubleshooting: "ID token required" Error

## Problem

Getting error `"ID token required"` when trying to login to admin dashboard.

**This means:** Backend is still using Firebase authentication instead of mock authentication.

---

## ✅ Solution

### Step 1: Verify .env Configuration

Check `backend/.env` has:

```env
USE_MOCK_AUTH=true
```

✅ **Your .env is already configured correctly!**

### Step 2: Restart Backend Server

The backend **must be restarted** to pick up the mock authentication routes.

**Kill any running backend:**

```bash
# Find and kill backend process on port 5001
lsof -ti:5001 | xargs kill -9
```

**Start backend fresh:**

```bash
cd backend
npm run dev
```

**Expected output:**

```
🧪 MOCK AUTH MODE ENABLED - For local testing only!
   Set USE_MOCK_AUTH=false in .env to use Firebase
📍 Auth Routes - USE_MOCK_AUTH: true
✅ Loading MOCK auth endpoints
MongoDB connected
Server running on port 5001
```

### Step 3: Test Mock Mode is Active

Open browser or use curl:

```bash
curl http://localhost:5001/api/auth/test-mode
```

**Expected response:**

```json
{
  "mode": "MOCK",
  "message": "Mock authentication is active"
}
```

If you see `"mode": "FIREBASE"`, the backend is not reading the .env correctly.

### Step 4: Test Admin Login

**From web dashboard login page:**

- Email: `admin@fortunecloud.com`
- Password: `Pass@123`

**Or test with curl:**

```bash
curl -X POST http://localhost:5001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fortunecloud.com","password":"Pass@123"}'
```

**Expected response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "admin_...",
    "email": "admin@fortunecloud.com",
    "name": "Test Admin",
    "role": "admin"
  }
}
```

---

## 🔍 Debugging Checklist

If still getting "ID token required":

- [ ] Backend restarted after changing .env
- [ ] Console shows: `🧪 MOCK AUTH MODE ENABLED`
- [ ] Console shows: `✅ Loading MOCK auth endpoints`
- [ ] Test endpoint returns `"mode": "MOCK"`
- [ ] No old backend processes running (check `lsof -ti:5001`)
- [ ] Web dashboard is calling `http://localhost:5001/api/auth/admin/login`

---

## 🚨 Common Issues

### Issue 1: Auth Guard Causing Logout (Getting logged out after login)

**Symptom:** Can login successfully but get logged out when trying to access protected endpoints (dashboard, leads, etc.)  
**Root Cause:** Auth middleware was checking `USE_MOCK_AUTH` at module load time instead of runtime, causing it to cache the wrong value

**Fix Applied:**

- Changed `middleware/auth.ts` to check environment variable at runtime
- Changed `const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === "true"` (module scope)
- To: `const isMockAuthEnabled = () => process.env.USE_MOCK_AUTH === "true"` (runtime function)
- Added logging to show which auth mode is being used

**Verification:**

```bash
# Get token from login
TOKEN=$(curl -X POST http://localhost:5001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fortunecloud.com","password":"Pass@123"}' \
  -s | jq -r '.token')

# Test protected endpoint
curl -X GET http://localhost:5001/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq '.'
```

**Expected:** Dashboard data returns without 401 error  
**Server logs should show:**

```
🔵 Using MOCK admin auth
✅ Mock admin auth successful: admin@fortunecloud.com
```

### Issue 2: Backend not restarted

**Symptom:** Still getting Firebase errors  
**Fix:** Kill backend and restart

### Issue 3: Multiple backend instances

**Symptom:** Changes not taking effect  
**Fix:**

```bash
lsof -ti:5001 | xargs kill -9
npm run dev
```

### Issue 4: .env not loaded

**Symptom:** Console doesn't show "MOCK AUTH MODE"  
**Fix:** Make sure `dotenv.config()` is at the top of server.ts

### Issue 5: Wrong endpoint

**Symptom:** Getting 404 or wrong error  
**Fix:** Web should call `/api/auth/admin/login` not `/api/admin/login`

---

## ✅ Verification Steps

1. **Kill any backend process:**

   ```bash
   lsof -ti:5001 | xargs kill -9
   ```

2. **Verify .env:**

   ```bash
   cd backend
   grep USE_MOCK_AUTH .env
   # Should show: USE_MOCK_AUTH=true
   ```

3. **Start backend:**

   ```bash
   npm run dev
   ```

4. **Check logs:**
   - Should see: `🧪 MOCK AUTH MODE ENABLED`
   - Should see: `📍 Auth Routes - USE_MOCK_AUTH: true`
   - Should see: `✅ Loading MOCK auth endpoints`

5. **Test mode:**

   ```bash
   curl http://localhost:5001/api/auth/test-mode
   # Should return: {"mode":"MOCK"}
   ```

6. **Test login:**
   ```bash
   curl -X POST http://localhost:5001/api/auth/admin/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@fortunecloud.com","password":"Pass@123"}'
   ```

---

## 🎯 Success!

When working correctly:

- ✅ Backend logs show "MOCK AUTH MODE"
- ✅ Test endpoint returns `"mode": "MOCK"`
- ✅ Login returns JWT token
- ✅ Web dashboard login works
- ✅ No "ID token required" error

---

Need more help? Check [QUICKSTART.md](../QUICKSTART.md) or [LOCAL_TESTING.md](../LOCAL_TESTING.md)
