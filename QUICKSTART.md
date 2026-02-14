# 🚀 Quick Start - Local Testing (No Firebase)

**Complete testing setup in 5 minutes without any Firebase configuration!**

---

## 📋 Prerequisites

- ✅ Node.js 16+
- ✅ MongoDB running locally (or MongoDB Atlas free tier)
- ✅ Android Studio / Xcode (for mobile testing)
- ❌ No Firebase account needed!

---

## ⚡ Quick Setup

### 1️⃣ Backend (1 minute)

```bash
cd backend

# Install dependencies
npm install

# Backend is already configured for mock auth!
# Check .env file has: USE_MOCK_AUTH=true

# Start backend
npm run dev
```

**Expected output:**

```
🧪 MOCK AUTH MODE ENABLED - For local testing only!
MongoDB connected
Server running on port 5001
```

---

### 2️⃣ Web Dashboard (1 minute)

```bash
cd web-dashboard

# Install dependencies
npm install

# Start web dashboard
npm start
```

**Opens at:** `http://localhost:3000`

**Test Login:**

- Email: `admin@fortunecloud.com`
- Password: `Pass@123`
- ✅ Auto-creates admin on first login!

---

### 3️⃣ Mobile App (2 minutes)

```bash
cd franchise-mobile

# Install dependencies (if not done)
npm install

# For Android
npm run android

# For iOS
cd ios && pod install && cd ..
npm run ios
```

**Mobile is already configured!**

- API points to `localhost:5001` (iOS) or `10.0.2.2:5001` (Android emulator)
- Firebase code is active but optional for notifications

---

## 🧪 Test the Flow

### Mobile: Signup & Create Lead (2 min)

1. **Open mobile app**
2. **Tap "Sign Up"**
3. **Fill in:**
   - Name: Test Franchise
   - Email: test@example.com
   - Phone: **9876543210**
   - City: Mumbai
4. **Check backend console** for OTP: `📱 Mock OTP for 9876543210: 123456`
5. **Enter OTP:** `123456`
6. ✅ **Logged in!**

7. **Go to "Add Lead" tab**
8. **Create a lead:**
   - Student Name: Rahul Sharma
   - Email: rahul@test.com
   - Phone: 9123456789
   - City: Delhi
   - Branch: Computer Science
   - Year: 2025
9. ✅ **Lead created!**

---

### Web: Login & Manage Leads (1 min)

1. **Open browser:** `http://localhost:3000`
2. **Login:**
   - Email: `admin@fortunecloud.com`
   - Password: `Pass@123`
3. ✅ **Logged in!**

4. **Navigate to "Leads"**
5. **Find the lead** you created from mobile
6. **Click to edit**
7. **Change status** from "Submitted" to "HOT"
8. **Save**
9. ✅ **Status updated!**

10. **For another lead, mark as "Enrolled"**
11. **Enter:**
    - Admission Amount: `50000`
    - Commission %: `10`
12. **Save**
13. ✅ **Commission created:** ₹5,000

---

### Mobile: Verify Updates (30 sec)

1. **Go back to mobile app**
2. **Navigate to "Leads" tab**
3. ✅ **See updated status** (HOT, Enrolled)
4. **Navigate to "Dashboard"**
5. ✅ **See commission:** ₹5,000
6. **Navigate to "Commission" tab**
7. ✅ **See commission entry** with student name

---

## 🎯 Testing Credentials

### Mobile (Any 10-digit phone)

- Phone: Use any number (e.g., `9876543210`, `9876543211`)
- OTP: Always `123456` (check backend console)

### Web Admin

- Email: `admin@fortunecloud.com`
- Password: `Pass@123`

---

## 🔧 Troubleshooting

### Backend won't start

**Check MongoDB:**

```bash
# If using local MongoDB
brew services start mongodb-community

# Or check if MongoDB Atlas connection string is correct in .env
```

### Mobile can't connect

**Android Emulator:** Already configured to `10.0.2.2:5001`  
**iOS Simulator:** Already configured to `localhost:5001`  
**Physical Device:**

1. Find your IP:
   ```bash
   ifconfig | grep "inet "
   ```
2. Update `franchise-mobile/src/config/index.ts`:
   ```typescript
   const DEV_API_HOST = "192.168.x.x"; // Your IP
   ```

### OTP not showing

- Check **backend console** (not mobile)
- OTP is always `123456` in mock mode
- Look for: `📱 Mock OTP for 9876543210: 123456`

### Admin login fails

Make sure:

- Email is exactly: `admin@fortunecloud.com`
- Password is exactly: `Pass@123`
- Backend shows: `🧪 MOCK AUTH MODE ENABLED`

---

## 📊 What Works in Mock Mode

✅ **Franchise signup** (mobile)  
✅ **OTP verification** (fixed OTP: 123456)  
✅ **Franchise login** (mobile)  
✅ **Admin login** (web - auto-creates admin)  
✅ **Lead creation** (mobile)  
✅ **Lead management** (web)  
✅ **Commission tracking** (both)  
✅ **Status updates** sync between mobile/web  
✅ **JWT authentication** (7-day token expiry)  
✅ **All CRUD operations**

❌ **Firebase push notifications** (comment out in App.tsx if issues)  
❌ **Firebase phone verification** (using mock OTP instead)

---

## 🔄 Switch to Firebase (Later)

When ready for production:

**Backend:**

```env
# Change in .env
USE_MOCK_AUTH=false
```

**Web:**

```typescript
// In LoginPage.tsx
const USE_MOCK_AUTH = false; // Change to false
```

**Mobile:**

- Uncomment notification setup in App.tsx
- Firebase Auth will work automatically via native SDKs

---

## 📝 Quick Testing Checklist

- [ ] Backend starts with "MOCK AUTH MODE" message
- [ ] Web admin login works (admin@fortunecloud.com / Pass@123)
- [ ] Mobile signup works with any phone (OTP: 123456)
- [ ] Mobile can create leads
- [ ] Web shows leads from mobile
- [ ] Web can update lead status
- [ ] Mobile sees updated status
- [ ] Commission created in web shows in mobile dashboard
- [ ] No Firebase errors in any console

---

## ✅ Success!

If all the above works, you have a **fully functional local testing environment** without any Firebase setup!

**Next Steps:**

- Create more test data
- Test edge cases
- Try different scenarios
- See [LOCAL_TESTING.md](LOCAL_TESTING.md) for detailed testing guide

---

## 💡 Tips

1. **OTP is always 123456** - check backend console
2. **Admin auto-creates** on first login - no setup needed
3. **Phone numbers** can be any 10 digits
4. **Tokens expire** in 7 days - logout and login again
5. **MongoDB data persists** - restart won't lose data

Happy Testing! 🎉
