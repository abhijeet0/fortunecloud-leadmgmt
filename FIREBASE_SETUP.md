# Firebase Setup Guide

This guide will help you set up Firebase for the Fortune Cloud application.

## Prerequisites

- Firebase account (https://firebase.google.com)
- Node.js installed
- npm or yarn package manager

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `fortune-cloud`
4. Follow the setup wizard and create the project

## Step 2: Enable Authentication Methods

### Enable Phone Authentication (for mobile app signup/login)
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Phone** sign-in method
3. Accept terms and save

### Enable Email/Password Authentication (for admin login)
1. In Authentication → Sign-in method
2. Enable **Email/Password** sign-in method
3. Save

## Step 3: Enable Cloud Messaging

1. Go to **Cloud Messaging** tab
2. Copy the **Server API Key** and **Sender ID** for later use
3. Create a Web API Key if not already created

## Step 4: Get Service Account Credentials

1. Go to **Project Settings** (gear icon)
2. Click **"Service Accounts"** tab
3. Click **"Generate new private key"**
4. Save the downloaded JSON file safely
5. Copy the values from this file for backend configuration

## Step 5: Configure Backend

### Update backend .env file

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fortunecloud
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://localhost:19000

# Firebase Configuration (from service account JSON)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_from_json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_firebase_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_from_json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your_client_cert_url_from_json
FIREBASE_DATABASE_URL=https://your_firebase_project.firebaseio.com
```

## Step 6: Configure Web Dashboard

### Get Web SDK Configuration

1. Go to **Project Settings** → **Your Apps**
2. Click the web app icon (or create one if needed)
3. Copy the Firebase config object

### Update web dashboard .env file

```bash
cp web-dashboard/.env.example web-dashboard/.env
```

Edit `web-dashboard/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api

# Firebase Web SDK Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_from_cloud_messaging
```

### Get VAPID Key for Web Push Notifications

1. Go to **Cloud Messaging** tab
2. Under **Web configuration**, click **"Generate key pair"** if not already done
3. Copy the public key (VAPID Key)
4. Add it to `.env` as `REACT_APP_FIREBASE_VAPID_KEY`

## Step 7: Configure Mobile App

### Update mobile app .env file

```bash
cp mobile-app/.env.example mobile-app/.env
```

Edit `mobile-app/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Firebase Web SDK Configuration (same as web dashboard)
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 8: Create Admin User

You need to create an admin user in Firebase. You can do this in two ways:

### Option A: Using Firebase Console

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter email and password
4. Click **Create user**
5. Note: You'll need to set the custom claims separately using the backend API

### Option B: Using Backend API

After backend is running:

```bash
curl -X POST http://localhost:5000/api/auth/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fortunecloud.com",
    "password": "securePassword123",
    "name": "Admin User",
    "role": "admin"
  }'
```

## Step 9: Test the Setup

### Test Firebase Authentication

1. Start the backend:
```bash
cd backend
npm install
npm run dev
```

2. Start the web dashboard:
```bash
cd web-dashboard
npm install
npm start
```

3. Try logging in with:
   - Email: `admin@fortunecloud.com`
   - Password: `securePassword123`

### Test Mobile App Authentication

1. Start the mobile app:
```bash
cd mobile-app
npm install
npm start
```

2. Try signing up with a phone number
3. Verify OTP sent to phone (Firebase will handle this)

## Security Rules

### Firestore Security Rules (if using Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /franchises/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.firebaseUid;
    }
    match /admins/{document=**} {
      allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role in ['admin', 'finance_admin'];
    }
  }
}
```

## Firebase Extensions (Optional)

For enhanced functionality, consider enabling:

1. **Cloud Storage for Firebase** - for document storage
2. **Cloud Functions** - for automated tasks
3. **Firebase Analytics** - for tracking user behavior

## Troubleshooting

### Issue: "Failed to initialize Firebase Admin SDK"
- Check that all environment variables are correct
- Ensure the private key in `.env` has proper escaped newlines (`\n`)
- Verify the service account credentials are valid

### Issue: "Phone authentication not working"
- Ensure Phone authentication is enabled in Firebase Console
- For development, Firebase provides test phone numbers
- Check that phone format includes country code (+91 for India)

### Issue: "Push notifications not received"
- Ensure Cloud Messaging is properly configured
- Check that device tokens are being registered
- Verify VAPID key is correct for web push
- Ensure notifications permission is granted on client

### Issue: "Custom claims not being set"
- Use the backend API to set admin roles with custom claims
- Custom claims take effect on next token refresh

## Production Setup

For production deployment:

1. Create a new Firebase project for production
2. Use environment-specific configuration
3. Enable additional security rules
4. Set up monitoring and logging
5. Consider Firebase pricing and quotas
6. Enable backup and disaster recovery

## Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
