# 🚀 Local Testing Guide (No Firebase)

Complete setup for testing the entire system locally without Firebase dependencies.

---

## ✅ Prerequisites

- Node.js 16+
- MongoDB running locally
- No Firebase account needed!

---

## 📦 Step 1: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

Copy the local environment file:

```bash
cp .env.local .env
```

Your `.env` should have:

```env
USE_MOCK_AUTH=true
MONGODB_URI=mongodb://localhost:27017/fortunecloud
PORT=5000
JWT_SECRET=local-testing-secret-key
```

### Start Backend

```bash
npm run dev
```

You should see:

```
🧪 MOCK AUTH MODE ENABLED - For local testing only!
MongoDB connected
Server running on port 5000
```

---

## 📱 Step 2: Mobile App Setup

### Install Dependencies

```bash
cd franchise-mobile
npm install
```

### Update API Base URL

Edit `src/services/api.ts` to use your local backend:

```typescript
const API_BASE_URL = "http://localhost:5000/api";
// For Android emulator: 'http://10.0.2.2:5000/api'
// For iOS simulator: 'http://localhost:5000/api'
// For physical device: 'http://YOUR_IP:5000/api'
```

### Comment Out Firebase Notifications (Optional)

In `App.tsx`:

```typescript
// Comment out this line for testing without FCM
// setupBackgroundNotifications();
```

In `AuthContext.tsx`:

```typescript
// Comment out notification initialization for now
// await initializeNotifications();
```

### Run Mobile App

**Android:**

```bash
npm run android
```

**iOS:**

```bash
cd ios && pod install && cd ..
npm run ios
```

---

## 💻 Step 3: Web Dashboard Setup

### Install Dependencies

```bash
cd web-dashboard
npm install
```

### Update API Base URL

Edit `src/api.ts`:

```typescript
const API_BASE_URL = "http://localhost:5000/api";
```

### Comment Out Firebase (Already done)

The Firebase imports should already be commented:

```typescript
// import { auth } from './firebase';
// import { signInWithEmailAndPassword } from 'firebase/auth';
```

### Run Web Dashboard

```bash
npm start
```

Opens at: `http://localhost:3000`

---

## 🧪 Testing Flow

### Test 1: Franchise Signup (Mobile)

1. Open mobile app
2. Navigate to **Signup**
3. Fill in:
   - Name: Test Franchise
   - Email: test@example.com
   - Phone: **9876543210**
   - City: Mumbai
4. Tap **Sign Up**
5. **OTP will be displayed in console**: `📱 Mock OTP for 9876543210: 123456`
6. Enter OTP: **123456**
7. ✅ Should login successfully

### Test 2: Create Leads (Mobile)

1. Go to **Add Lead** tab
2. Create a student lead:
   - Name: Rahul Sharma
   - Email: rahul@test.com
   - Phone: 9123456789
   - City: Delhi
   - Branch: Computer Science
   - Year: 2025
3. Tap **Submit Lead**
4. ✅ Lead created

Create 2-3 more leads for testing.

### Test 3: Admin Login (Web)

1. Open browser: `http://localhost:3000`
2. Login with:
   - Email: **admin@fortunecloud.com**
   - Password: **Pass@123**
3. ✅ Should login successfully (auto-creates admin if doesn't exist)

### Test 4: Manage Leads (Web)

1. Navigate to **Leads** section
2. You should see all franchise leads
3. Click on a lead
4. Change status to **HOT**
5. Save
6. ✅ Status updated

### Test 5: Mark as Enrolled (Web)

1. Select another lead
2. Change status to **Enrolled**
3. Enter:
   - Admission Amount: **50000**
   - Commission %: **10**
4. Save
5. ✅ Commission created (₹5,000)

### Test 6: Verify on Mobile

1. Go back to mobile app
2. Navigate to **Leads** tab
3. ✅ Should see updated statuses (HOT, Enrolled)
4. Navigate to **Dashboard**
5. ✅ Should show commission: ₹5,000
6. Navigate to **Commission** tab
7. ✅ Should show commission entry

---

## 🔑 Mock Auth Details

### Fixed OTP

All OTPs are: **123456** (check backend console for confirmation)

### Admin Credentials

- Email: **admin@fortunecloud.com**
- Password: **Pass@123**

### Token Expiry

JWT tokens expire in 7 days (configurable in `mockAuth.ts`)

---

## 📋 Quick Testing Checklist

### Mobile App ✓

- [ ] Signup with phone (use any 10-digit number)
- [ ] OTP verification (always use 123456)
- [ ] Create lead
- [ ] View leads list
- [ ] Filter leads
- [ ] Search leads
- [ ] View lead details
- [ ] Dashboard shows stats
- [ ] Commission tab shows entries
- [ ] Logout

### Web Dashboard ✓

- [ ] Admin login (admin@fortunecloud.com / Pass@123)
- [ ] View franchises list
- [ ] View all leads
- [ ] Update lead status
- [ ] Mark lead as enrolled
- [ ] Enter commission details
- [ ] View commissions
- [ ] Filter/search

### Data Sync ✓

- [ ] Lead created in mobile appears in web
- [ ] Status changed in web reflects in mobile
- [ ] Commission from web shows in mobile dashboard

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** "MongoDB connection failed"

```bash
# Start MongoDB
brew services start mongodb-community
# OR
mongod --dbpath ~/data/db
```

### Mobile can't connect to backend

**Error:** "Network request failed"

**Android Emulator:**

```typescript
const API_BASE_URL = "http://10.0.2.2:5000/api";
```

**iOS Simulator/Real Device:**

Find your local IP:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Use: `http://YOUR_IP:5000/api`

### OTP not working

- Check backend console for the OTP
- Default OTP is always **123456**
- Make sure `USE_MOCK_AUTH=true` in backend `.env`

### Admin auto-login not working

Backend auto-creates admin on first login attempt. Make sure:

- Email: **admin@fortunecloud.com** (exact)
- Password: **Pass@123** (exact)

---

## 🔄 Switching to Firebase

When ready to use Firebase:

### Backend

1. Edit `.env`:
   ```env
   USE_MOCK_AUTH=false
   ```
2. Uncomment Firebase credentials in `.env`
3. Restart backend

### Mobile

1. Uncomment Firebase notification setup in `App.tsx` and `AuthContext.tsx`
2. Rebuild app

### Web

1. Uncomment Firebase imports in `api.ts`
2. Restart dev server

---

## 📊 Testing Scenarios

### Scenario 1: Complete Flow

1. **Franchise signs up** (mobile)
2. **Franchise creates 5 leads** (mobile)
3. **Admin logs in** (web)
4. **Admin marks 2 leads as HOT** (web)
5. **Admin enrolls 1 lead with ₹50k admission** (web)
6. **Franchise sees updates** (mobile)
7. **Franchise sees ₹5k commission** (mobile dashboard)

### Scenario 2: Multiple Franchises

1. **Signup franchise A** (phone: 9876543210)
2. **Logout and signup franchise B** (phone: 9876543211)
3. **Each creates leads**
4. **Admin sees all leads from both** (web)
5. **Commissions tracked separately**

### Scenario 3: Commission Workflow

1. **Franchise creates lead** (mobile)
2. **Admin marks as enrolled with commission** (web)
3. **Admin approves commission** (web)
4. **Franchise sees "Approved" status** (mobile)
5. **Admin marks as paid** (web)
6. **Franchise sees "Paid" status** (mobile)

---

## ✅ Success Criteria

- ✅ Mobile app runs without Firebase
- ✅ Web dashboard works without Firebase
- ✅ All API endpoints respond correctly
- ✅ Data syncs between mobile and web
- ✅ No Firebase errors in console
- ✅ Complete workflow from signup → lead creation → commission tracking

---

## 📝 Notes

- **Mock OTP is always 123456** - check backend console
- **Admin is auto-created** on first login
- **JWT tokens stored** in AsyncStorage (mobile) and localStorage (web)
- **MongoDB persists data** - restart backend won't lose data
- **No Firebase costs** during local development

---

## 🎯 Next Steps

1. ✅ Complete local testing
2. Test edge cases (invalid inputs, network errors)
3. Load testing with many leads
4. Switch to Firebase for production
5. Deploy to staging/production

Happy Testing! 🚀
