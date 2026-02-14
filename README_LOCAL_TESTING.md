# 🚀 FortuneCloud - Local Testing Setup

**Test the complete franchise management system locally WITHOUT Firebase!**

---

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Web Dashboard (new terminal)
cd web-dashboard
npm install
npm start

# 3. Mobile App (new terminal)
cd franchise-mobile
npm install
npm run android  # or npm run ios
```

### Test Credentials

**Mobile:**

- Phone: Any 10-digit (e.g., `9876543210`)
- OTP: `123456` (always)

**Web:**

- Email: `admin@fortunecloud.com`
- Password: `Pass@123`

**📖 See [QUICKSTART.md](QUICKSTART.md) for detailed steps**

---

## 📚 Documentation

| Guide                                      | Description                         |
| ------------------------------------------ | ----------------------------------- |
| **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** | ✅ Setup summary & configuration    |
| **[QUICKSTART.md](QUICKSTART.md)**         | ⚡ 5-minute getting started guide   |
| **[LOCAL_TESTING.md](LOCAL_TESTING.md)**   | 🧪 Complete testing guide           |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)**   | 📋 End-to-end testing scenarios     |
| **[ADMIN_SETUP.md](ADMIN_SETUP.md)**       | 👤 Firebase admin setup (for later) |

---

## 🎯 What This Setup Provides

✅ **No Firebase Required** - Complete mock authentication system  
✅ **Fixed OTP (123456)** - No SMS, instant testing  
✅ **Auto Admin** - Admin user created on first login  
✅ **JWT Tokens** - Secure authentication with 7-day expiry  
✅ **Full Functionality** - All features work exactly as production  
✅ **Easy Debugging** - All auth logic in your backend

---

## 🔧 System Architecture

```
Mobile App (React Native)
    ↓ HTTP (JWT Token)
Backend API (Express + MongoDB)
    ↑ HTTP (JWT Token)
Web Dashboard (React)
```

**Auth Flow:**

1. Mobile: Phone → Mock OTP (123456) → JWT Token
2. Web: Email/Password → JWT Token
3. All requests use JWT in Authorization header

---

## 🧪 Mock Auth Enabled

Backend configured with `USE_MOCK_AUTH=true`:

- Phone verification → Mock OTP system
- Admin login → Direct email/password
- Token generation → JWT (not Firebase)
- No Firebase API calls

**Switch to Firebase:** Set `USE_MOCK_AUTH=false` in backend `.env`

---

## 📱 Tech Stack

### Backend

- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT authentication
- Mock OTP system

### Mobile

- React Native 0.72
- TypeScript
- AsyncStorage
- Axios

### Web

- React 18
- TypeScript
- React Router
- Axios

---

## 🎯 Testing Flow

1. **Franchise Signup** (Mobile) → OTP 123456 → Dashboard
2. **Create Lead** (Mobile) → Student information
3. **Admin Login** (Web) → View all leads
4. **Update Status** (Web) → HOT/WARM/COLD/Enrolled
5. **Mark Enrolled** (Web) → Commission tracking
6. **Verify Sync** (Mobile) → See updates immediately

---

## 📂 Project Structure

```
├── backend/              # Express API
│   ├── controllers/
│   │   ├── mockAuthController.ts  # Mock auth logic
│   │   └── ...
│   ├── middleware/
│   │   ├── mockAuth.ts            # JWT verification
│   │   └── ...
│   ├── .env              # USE_MOCK_AUTH=true
│   └── server.ts         # Entry point
│
├── franchise-mobile/     # React Native app
│   ├── src/
│   │   ├── config/       # API URL config
│   │   ├── services/     # API calls
│   │   └── screens/      # UI screens
│   └── ...
│
├── web-dashboard/        # React admin panel
│   ├── src/
│   │   ├── pages/
│   │   │   └── LoginPage.tsx  # Direct API login
│   │   └── api.ts
│   └── ...
│
└── *.md                  # Documentation
```

---

## ✅ Pre-Setup Checklist

Backend is already configured with:

- [x] Mock authentication middleware
- [x] Mock OTP controller
- [x] JWT token generation
- [x] Conditional Firebase initialization
- [x] Environment variable `USE_MOCK_AUTH=true`

Web Dashboard:

- [x] Firebase imports commented
- [x] Direct API login implemented
- [x] Mock mode enabled

Mobile App:

- [x] Local API URLs configured
- [x] Works with JWT tokens
- [x] Compatible with mock OTP

---

## 🚦 Getting Started

### Prerequisites

- Node.js 16+
- MongoDB (local or Atlas)
- Android Studio / Xcode (for mobile)

### Installation

```bash
# Clone repo (if not already)
git clone <repo-url>
cd fortunecloud-leadmgmt

# Install all dependencies
cd backend && npm install && cd ..
cd web-dashboard && npm install && cd ..
cd franchise-mobile && npm install && cd ..
```

### Run Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Should show: 🧪 MOCK AUTH MODE ENABLED

# Terminal 2 - Web
cd web-dashboard
npm start
# Opens at http://localhost:3000

# Terminal 3 - Mobile
cd franchise-mobile
npm run android  # or npm run ios
```

### First Test

1. **Mobile:** Signup with phone `9876543210`, OTP `123456`
2. **Mobile:** Create a student lead
3. **Web:** Login with `admin@fortunecloud.com` / `Pass@123`
4. **Web:** View the lead, change status to "Enrolled"
5. **Mobile:** Verify commission appears in Dashboard

✅ **If this works, you're all set!**

---

## 🐛 Common Issues

### "Backend won't start"

```bash
# Check MongoDB
brew services start mongodb-community
# OR verify MongoDB Atlas connection in .env
```

### "Mobile can't connect to backend"

```bash
# Check API URL in: franchise-mobile/src/config/index.ts
# Android emulator: http://10.0.2.2:5001/api
# iOS simulator: http://localhost:5001/api
```

### "OTP not working"

- Check backend console for: `📱 Mock OTP for xxx: 123456`
- Always use `123456` as OTP in mock mode

### "Admin login fails"

- Email must be exactly: `admin@fortunecloud.com`
- Password must be exactly: `Pass@123`
- Check backend shows: `🧪 MOCK AUTH MODE ENABLED`

---

## 🔄 Production Deployment

When ready to deploy with Firebase:

1. Set `USE_MOCK_AUTH=false` in backend `.env`
2. Configure Firebase credentials in backend
3. Set `USE_MOCK_AUTH = false` in web `LoginPage.tsx`
4. Uncomment Firebase notifications in mobile `App.tsx`
5. Build and deploy!

---

## 📖 Learn More

- [Backend API Documentation](backend/README.md) (if exists)
- [Mobile App Documentation](franchise-mobile/README.md)
- [Web Dashboard Documentation](web-dashboard/README.md)
- [Complete Testing Guide](TESTING_GUIDE.md)

---

## 🆘 Support

1. Check [LOCAL_TESTING.md](LOCAL_TESTING.md) troubleshooting section
2. Review [QUICKSTART.md](QUICKSTART.md) for setup steps
3. Verify backend console shows "MOCK AUTH MODE ENABLED"
4. Ensure MongoDB is running and connected

---

## 📝 License

[Your License Here]

---

**Happy Testing! 🎉**

Start with [QUICKSTART.md](QUICKSTART.md) → [LOCAL_TESTING.md](LOCAL_TESTING.md) → [TESTING_GUIDE.md](TESTING_GUIDE.md)
