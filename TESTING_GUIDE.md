# End-to-End Testing Guide

## Prerequisites

### 1. Setup Test Admin Account

**Option A: Full Setup (Recommended)**

First, create Firebase user:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `fortune-cloud-franchise-app`
3. Go to: Authentication → Users → Add User
4. Email: `admin@fortunecloud.com`, Password: `Pass@123`
5. Copy the Firebase UID

Then link to MongoDB:

```bash
cd backend
npx ts-node scripts/setupAdminSimple.ts <paste-firebase-uid>
```

**Option B: Quick local test (DB only, no login)**

```bash
cd backend
npx ts-node scripts/setupAdminSimple.ts
```

📖 **See [ADMIN_SETUP.md](ADMIN_SETUP.md) for detailed instructions**

Admin credentials:

- **Email:** admin@fortunecloud.com
- **Password:** Pass@123

### 2. Start All Services

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:5000

**Terminal 2 - Web Dashboard:**

```bash
cd web-dashboard
npm run dev
```

Web runs on: http://localhost:3000

**Terminal 3 - Mobile App (Choose one):**

For Android:

```bash
cd franchise-mobile
npm run android
```

For iOS:

```bash
cd franchise-mobile
npm run ios
```

---

## End-to-End Testing Flow

### Phase 1: Mobile App Testing (Franchise Side)

#### 1. **Franchise Signup**

- Open the mobile app
- Navigate to Signup screen
- Fill in:
  - **Name:** Test Franchise
  - **Email:** franchise1@test.com
  - **Phone:** 9876543210
  - **City:** Mumbai
- Tap "Sign Up"
- You'll receive an OTP via Firebase (check console logs if testing locally)
- Enter OTP to complete signup
- ✅ **Expected:** Successfully authenticated and redirected to Dashboard

#### 2. **Dashboard View**

- Check Dashboard displays:
  - Total Leads count (should be 0)
  - Commission breakdown (Pending/Paid, should be ₹0)
  - Logout button in header
- ✅ **Expected:** All stats show zero for new franchise

#### 3. **Create Lead (Student)**

- Navigate to "Add Lead" tab
- Fill in student details:
  - **Student Name:** Rahul Sharma
  - **Email:** rahul@example.com
  - **Phone:** 9123456789
  - **City:** Delhi
  - **Branch:** Computer Science
  - **Year of Passing:** 2025
- Tap "Submit Lead"
- ✅ **Expected:** Success message, form clears, can create another lead

#### 4. **Create Multiple Leads**

Create 3-5 more leads with different details to test list/filter functionality.

#### 5. **View Leads List**

- Navigate to "Leads" tab
- Check all created leads appear
- Test filter chips: Submitted, HOT, WARM, COLD, Enrolled
- Try search functionality
- ✅ **Expected:** Leads display in cards, filters work, search filters by name

#### 6. **View Lead Details**

- Tap on any lead card
- Check all fields display:
  - Student Name, Email, Phone
  - City, Branch, Year of Passing
  - Current Status badge
  - Submitted Date
- ✅ **Expected:** All lead details visible, can navigate back

#### 7. **Pull to Refresh**

- On Leads List, pull down to refresh
- On Lead Detail screen, pull down
- On Dashboard, pull down
- ✅ **Expected:** Loading indicator appears, data refreshes

---

### Phase 2: Admin Dashboard Testing (Web)

#### 1. **Admin Login**

- Open browser: http://localhost:3000
- Enter credentials:
  - **Email:** admin@fortunecloud.com
  - **Password:** Pass@123
- Click "Login"
- ✅ **Expected:** Redirected to admin dashboard

#### 2. **View All Leads**

- Navigate to "Leads" section
- Should see all leads created by franchise in Phase 1
- Check columns: Student Name, Email, City, Branch, Status, Franchise Email
- ✅ **Expected:** All franchise leads visible in table

#### 3. **Update Lead Status**

- Select a lead with "Submitted" status
- Change status to "HOT"
- Save changes
- ✅ **Expected:** Status updates, visible to franchise immediately

#### 4. **Mark Lead as Enrolled**

- Select another lead
- Change status to "Enrolled"
- Enter commission details:
  - **Admission Amount:** 50000
  - **Commission Percentage:** 10
- Save
- ✅ **Expected:** Lead marked enrolled, commission calculated (₹5000)

#### 5. **View Franchises**

- Navigate to "Franchises" section
- Should see the test franchise created in Phase 1
- Check details: Name, Email, Phone, City, Lead Count, Commission
- ✅ **Expected:** Franchise data accurate

#### 6. **Manage Commission**

- Navigate to "Commissions" section
- Find the commission for enrolled lead
- Change status from "Pending" to "Approved"
- Later, mark as "Paid"
- ✅ **Expected:** Commission status updates correctly

---

### Phase 3: Mobile App Verification (After Admin Changes)

#### 1. **Verify Lead Status Update**

- Go back to mobile app
- Navigate to "Leads" tab (pulls fresh data on focus)
- Find the lead that admin marked as "HOT"
- ✅ **Expected:** Status badge shows "HOT" with orange color

#### 2. **Verify Enrolled Lead**

- Find the lead marked as "Enrolled"
- Tap to view details
- Check commission section appears showing:
  - Admission Amount: ₹50,000
  - Commission: ₹5,000
  - Status: Pending → Approved → Paid
- ✅ **Expected:** Commission details visible on lead detail

#### 3. **Verify Dashboard Commission**

- Navigate to Dashboard tab
- Check commission summary updated:
  - Total Commission: ₹5,000
  - Breakdown shows Pending/Approved/Paid amounts
- ✅ **Expected:** Commission stats match admin actions

#### 4. **Verify Commission Screen**

- Navigate to "Commission" tab
- Should see commission entry for enrolled student
- Check:
  - Student name
  - Admission amount
  - Commission amount
  - Status badge
  - Generated date
- ✅ **Expected:** Commission history displays correctly

---

### Phase 4: Push Notifications Testing

#### 1. **Mobile: Enable Notifications**

- When mobile app asks for notification permission, allow it
- Check device token is registered (check backend logs)
- ✅ **Expected:** Token saved to backend

#### 2. **Admin: Send Notification** (if implemented)

- From admin dashboard, trigger a notification to franchise
- Could be: Lead status change, commission approval, etc.
- ✅ **Expected:** Franchise receives push notification on mobile

---

### Phase 5: Edge Cases & Error Handling

#### Mobile App:

- ❌ Try creating lead with invalid phone (not 10 digits)
- ❌ Try creating lead with invalid email
- ❌ Test logout and re-login
- ❌ Test app behavior with poor network (airplane mode)
- ❌ Try filtering leads with no results
- ✅ **Expected:** Proper validation messages, error states, empty states

#### Web Dashboard:

- ❌ Try logging in with wrong password
- ❌ Try accessing protected route without login
- ❌ Test updating lead with invalid commission amount
- ❌ Test filtering franchises/leads/commissions
- ✅ **Expected:** Proper error messages, redirects, validation

---

## Testing Checklist

### Mobile Franchise App ✓

- [ ] Signup with phone OTP
- [ ] Login with existing phone
- [ ] View Dashboard with stats
- [ ] Create new lead with validation
- [ ] View leads list with filters
- [ ] Search leads
- [ ] View lead details
- [ ] Pull-to-refresh on all screens
- [ ] View commission history
- [ ] Logout functionality
- [ ] Push notification permission
- [ ] UI: All text inputs visible (not white)
- [ ] UI: Proper colors and spacing

### Admin Web Dashboard ✓

- [ ] Admin login with email/password
- [ ] View all franchises
- [ ] View all leads from all franchises
- [ ] Update lead status (Submitted → HOT → WARM → COLD → Enrolled)
- [ ] Enter commission details for enrolled leads
- [ ] View commission list
- [ ] Update commission status (Pending → Approved → Paid)
- [ ] Filter/search functionality
- [ ] Logout

### Data Synchronization ✓

- [ ] Lead status change in admin reflects in mobile immediately
- [ ] New lead from mobile appears in admin dashboard
- [ ] Commission approval in admin updates mobile dashboard
- [ ] Real-time updates on tab focus (useFocusEffect)

---

## Common Issues & Solutions

### Issue: Backend not connecting to MongoDB

**Solution:** Check `.env` file has correct `MONGODB_URI`

### Issue: Firebase OTP not received

**Solution:**

- Check Firebase Console → Authentication → Sign-in methods → Phone enabled
- For testing, use Firebase Console to get test phone numbers
- Check backend Firebase service account JSON is configured

### Issue: Mobile app white screen

**Solution:**

```bash
cd franchise-mobile
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npm run ios  # or npm run android
```

### Issue: Admin can't login

**Solution:** Re-run setup script:

```bash
cd backend
npx ts-node scripts/setupTestAdmin.ts
```

### Issue: Commission not showing on mobile

**Solution:**

- Ensure lead status is "Enrolled" in admin
- Pull down to refresh on mobile Dashboard/Commission tabs
- Check backend API response includes commission data

---

## API Endpoints Reference

### Franchise Endpoints:

- POST `/api/auth/signup` - Signup with phone
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/login` - Login existing user
- GET `/api/franchise/dashboard` - Dashboard stats
- GET `/api/franchise/leads` - List leads with filters
- POST `/api/franchise/leads` - Create new lead
- GET `/api/franchise/leads/:id` - Lead details
- GET `/api/franchise/commissions` - Commission history
- POST `/api/notifications/franchise/device-token` - Register FCM token

### Admin Endpoints:

- POST `/api/admin/login` - Admin login
- GET `/api/admin/franchises` - List all franchises
- GET `/api/admin/leads` - All leads across franchises
- PUT `/api/admin/leads/:id` - Update lead status
- GET `/api/admin/commissions` - All commissions
- PUT `/api/admin/commissions/:id` - Update commission status

---

## Database Seed Data (Optional)

If you want to test with pre-populated data, create a seed script:

```bash
cd backend
npx ts-node scripts/seedTestData.ts
```

This would create:

- 2-3 test franchises
- 10-15 test leads with varied statuses
- 3-5 commission records

---

## Performance Testing

1. **Load Test:** Create 50+ leads and check mobile list performance
2. **Filter Test:** Test lead filters with large dataset
3. **Search Test:** Search leads with 100+ records
4. **Network Test:** Test app behavior on slow 3G

---

## Success Criteria

✅ **Mobile app builds and runs without errors**  
✅ **TypeScript compiles with zero errors**  
✅ **All form validations work correctly**  
✅ **All text inputs are visible (not white)**  
✅ **Data updates reflect in real-time between mobile and admin**  
✅ **Push notifications work (if enabled)**  
✅ **No console errors during normal flow**  
✅ **Proper error handling and user feedback**  
✅ **Logout works and clears session properly**
