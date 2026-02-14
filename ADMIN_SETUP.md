# Admin Setup Guide

## Quick Setup (2 Steps)

### Step 1: Create Firebase User

1. **Go to Firebase Console:**  
   https://console.firebase.google.com

2. **Select Project:**  
   `fortune-cloud-franchise-app`

3. **Navigate to Authentication:**  
   Authentication → Users → **Add User**

4. **Enter Credentials:**
   - **Email:** `admin@fortunecloud.com`
   - **Password:** `Pass@123`
   - Click **Add User**

5. **Copy the UID:**  
   After user is created, you'll see a **UID** (looks like `xYz123AbC...`)  
   Copy this UID.

---

### Step 2: Add Admin to MongoDB

Run this command with the UID you copied:

```bash
cd backend
npx ts-node scripts/setupAdminSimple.ts <paste-the-firebase-uid-here>
```

**Example:**

```bash
npx ts-node scripts/setupAdminSimple.ts xYz123AbCdEfGhIjKlM
```

You should see:

```
✓ Connected to MongoDB
✓ Created new admin
✅ Ready to login at web dashboard!
```

---

## Test Login

1. **Start Backend:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start Web Dashboard:**

   ```bash
   cd web-dashboard
   npm run dev
   ```

3. **Login:**
   - Open: http://localhost:3000
   - Email: `admin@fortunecloud.com`
   - Password: `Pass@123`

---

## Alternative: Quick Test (Without Firebase Login)

If you just want to test MongoDB connection without actual Firebase login:

```bash
cd backend
npx ts-node scripts/setupAdminSimple.ts
```

This creates admin with a temporary UID. Good for backend testing, but web login won't work.

---

## Troubleshooting

### "Admin already exists"

Run the script again with the correct Firebase UID to update:

```bash
npx ts-node scripts/setupAdminSimple.ts <correct-uid>
```

### "Firebase user not found"

Make sure you created the user in Firebase Console first.

### "MongoDB connection error"

Check your `.env` file has:

```env
MONGODB_URI=mongodb://localhost:27017/fortunecloud
```

---

## Check If Admin Exists

```bash
cd backend
npx ts-node scripts/checkAdmins.ts
```

This will list all admins in the database.
