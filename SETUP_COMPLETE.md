# ✅ Local Testing Setup Complete!

Your FortuneCloud app is now configured for **complete local testing WITHOUT Firebase**.

---

## 🎉 What's Been Set Up

### ✅ Backend (Mock Authentication)

- **Location:** `/backend`
- **Mode:** Mock Auth Enabled (`USE_MOCK_AUTH=true`)
- **Port:** 5001
- **Features:**
  - Mock OTP system (fixed OTP: `123456`)
  - JWT token authentication
  - Auto-admin creation
  - All API endpoints working

### ✅ Web Dashboard (Direct API Login)

- **Location:** `/web-dashboard`
- **Port:** 3000
- **Firebase:** Commented out
- **Login:** Direct backend API call
- **Credentials:** `admin@fortunecloud.com` / `Pass@123`

### ✅ Mobile App (Already Configured)

- **Location:** `/franchise-mobile`
- **API:** Points to `localhost:5001` (iOS) / `10.0.2.2:5001` (Android)
- **Auth:** Works with mock OTP system
- **Firebase:** Native SDKs present but optional

---

## 🚀 How to Start Testing

### Quick Start (Recommended)

**See:** [QUICKSTART.md](QUICKSTART.md)

TL;DR:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Web
cd web-dashboard
npm start

# Terminal 3 - Mobile
cd franchise-mobile
npm run android  # or npm run ios
```

### Complete Testing Guide

**See:** [LOCAL_TESTING.md](LOCAL_TESTING.md)

Includes:

- Detailed setup instructions
- Complete test scenarios
- Troubleshooting guide
- API endpoint reference

---

## 🔑 Testing Credentials

### Mobile Franchise

- **Phone:** Any 10-digit number (e.g., `9876543210`)
- **OTP:** Always `123456` (check backend console)
- **Multiple users:** Use different phone numbers

### Web Admin

- **Email:** `admin@fortunecloud.com`
- **Password:** `Pass@123`
- **Auto-created:** First login creates admin if not exists

---

## 📊 Mock Auth Features

### What Works:

✅ Franchise signup with phone  
✅ OTP verification (mock OTP: 123456)  
✅ Franchise login  
✅ Admin login (email/password)  
✅ JWT token authentication (7-day expiry)  
✅ All CRUD operations  
✅ Lead management  
✅ Commission tracking  
✅ Status synchronization  
✅ Full app functionality

### What's Mocked:

- Firebase phone verification → Mock OTP system
- Firebase admin auth → JWT + email/password
- Push notifications → Optional (can be commented out)

---

## 🔧 Configuration Files Changed

### Backend

| File                                         | Change                     |
| -------------------------------------------- | -------------------------- |
| `.env`                                       | Added `USE_MOCK_AUTH=true` |
| `server.ts`                                  | Conditional Firebase init  |
| `middleware/auth.ts`                         | Conditional auth routing   |
| `routes/auth.ts`                             | Mock auth routes           |
| **NEW:** `middleware/mockAuth.ts`            | Mock JWT auth              |
| **NEW:** `controllers/mockAuthController.ts` | Mock login/signup          |

### Web Dashboard

| File                      | Change                               |
| ------------------------- | ------------------------------------ |
| `src/pages/LoginPage.tsx` | Direct API login, Firebase commented |

### Mobile App

| File                  | Status                               |
| --------------------- | ------------------------------------ |
| `src/config/index.ts` | Already configured for local backend |
| `src/services/api.ts` | Already points to local API          |
| Firebase setup        | Optional (native SDKs present)       |

---

## 🧪 Test the Complete Flow

### 1. Backend Running

```bash
cd backend
npm run dev
```

**Expected output:**

```
🧪 MOCK AUTH MODE ENABLED - For local testing only!
MongoDB connected
Server running on port 5001
```

### 2. Mobile: Create Franchise & Lead

1. Signup with phone `9876543210`
2. **OTP in backend console:** `📱 Mock OTP for 9876543210: 123456`
3. Enter OTP: `123456`
4. Create lead for student
5. ✅ Lead visible in mobile

### 3. Web: Manage Lead

1. Open `http://localhost:3000`
2. Login: `admin@fortunecloud.com` / `Pass@123`
3. Go to Leads
4. Change status to "HOT" or "Enrolled"
5. ✅ Status updated

### 4. Mobile: Verify Sync

1. Go to Leads tab
2. ✅ See updated status
3. Go to Dashboard
4. ✅ See commission (if enrolled)

---

## 🔄 Switch Back to Firebase

When ready for production:

### Backend (.env)

```env
USE_MOCK_AUTH=false
```

### Web (LoginPage.tsx)

```typescript
const USE_MOCK_AUTH = false;
```

### Mobile

- Uncomment notification setup in `App.tsx`
- Firebase Auth works via native SDKs

---

## 📝 Key Files

### Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[LOCAL_TESTING.md](LOCAL_TESTING.md)** - Complete testing guide
- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** - Firebase admin setup (for later)
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - End-to-end testing scenarios

### New Backend Files

- `middleware/mockAuth.ts` - JWT authentication
- `controllers/mockAuthController.ts` - Mock login/signup logic
- `.env.local` - Example local config

---

## 💡 Benefits of Mock Mode

1. **No Firebase Account Needed** - Test immediately
2. **Fixed OTP (123456)** - No SMS costs, instant testing
3. **Auto Admin Creation** - No setup scripts needed
4. **Offline Testing** - Works without internet
5. **Faster Development** - No Firebase API delays
6. **Easy Debugging** - All auth logic in your backend
7. **No Quotas** - Unlimited test users

---

## ⚠️ Important Notes

1. **OTP is always 123456** in mock mode
2. **Check backend console** for OTP messages
3. **Admin auto-creates** on first login (no Firebase user needed)
4. **JWT tokens expire in 7 days** - logout/login to refresh
5. **MongoDB data persists** - restart won't lose data
6. **Mock mode for testing only** - Use Firebase for production

---

## ✅ Testing Checklist

Before considering setup complete, verify:

- [ ] Backend starts with "MOCK AUTH MODE" message
- [ ] Web admin login works
- [ ] Mobile signup works (any phone + OTP 123456)
- [ ] Mobile can create leads
- [ ] Web shows mobile's leads
- [ ] Web can update lead status
- [ ] Mobile sees updated status
- [ ] Commission tracking works
- [ ] No Firebase errors anywhere

---

## 🎯 Next Steps

1. ✅ **Test complete flow** (see QUICKSTART.md)
2. Test edge cases (invalid inputs, network errors)
3. Create seed data for testing
4. Test with multiple franchises
5. Performance testing
6. When ready, switch to Firebase for production

---

## 🆘 Need Help?

### Backend Issues

- Make sure MongoDB is running
- Check `.env` has `USE_MOCK_AUTH=true`
- Port 5001 already in use? Kill the process or change PORT in .env

### Mobile Issues

- Android emulator: API should be `http://10.0.2.2:5001/api`
- iOS simulator: API should be `http://localhost:5001/api`
- Physical device: Use your machine's IP address

### Web Issues

- Make sure `USE_MOCK_AUTH = true` in `LoginPage.tsx`
- Check browser console for errors
- Backend must be running on port 5001

---

**🎉 You're all set for local testing!**

Start with [QUICKSTART.md](QUICKSTART.md) for a 5-minute test run.
