# Fortune Cloud - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional, for easy setup)

## Quick Start with Docker (Recommended)

### 1. Start Backend and MongoDB
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000

### 2. Create Admin User (One-time setup)

Connect to MongoDB and run:
```javascript
db.admins.insertOne({
  email: "admin@fortunecloud.com",
  password: "$2a$10$...hashed_password...",  // Use bcryptjs to hash "admin123"
  name: "Admin User",
  role: "admin",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the curl command to manually create via API after updating password logic.

### 3. Start Web Dashboard
```bash
cd web-dashboard
npm install
REACT_APP_API_URL=http://localhost:5000/api npm start
```

Open http://localhost:3000

Login with:
- Email: `admin@fortunecloud.com`
- Password: `admin123`

### 4. Start Mobile App
```bash
cd mobile-app
npm install
npm start
```

Follow the Expo prompts to run on Android/iOS emulator or physical device.

---

## Manual Setup (Without Docker)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fortunecloud
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://localhost:19000
```

Start MongoDB (if running locally):
```bash
mongod
```

Start backend:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### 2. Web Dashboard Setup

```bash
cd web-dashboard
npm install
REACT_APP_API_URL=http://localhost:5000/api npm start
```

Dashboard will open at http://localhost:3000

### 3. Mobile App Setup

```bash
cd mobile-app
npm install
npm start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web preview
- Scan QR code with Expo Go app for physical device

---

## Admin Dashboard Login

**Default Admin Credentials:**
- Email: `admin@fortunecloud.com`
- Password: `admin123`

> **Important:** Change these credentials immediately in production!

To create additional admin accounts, use MongoDB directly or implement admin creation API.

---

## Testing the Application

### Franchise App Flow

1. **Signup**
   - Enter phone number
   - Verify OTP (check backend logs for OTP code)
   - Enter franchise details and password

2. **Login**
   - Use phone + password OR
   - Use phone + OTP verification

3. **Dashboard**
   - View statistics
   - See commission summary

4. **Submit Lead**
   - Fill lead details form
   - Submit to admin

5. **View Leads**
   - See all submitted leads
   - Filter by status
   - View lead details and commission info

### Admin Dashboard Flow

1. **Login**
   - Email: `admin@fortunecloud.com`
   - Password: `admin123`

2. **Leads Management**
   - View all leads
   - Update lead status
   - Add remarks
   - Create enrollments

3. **Commission Management**
   - Approve/pay commissions
   - View commission summary

4. **Reports**
   - View analytics
   - Generate reports by status, franchise, etc.

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fortunecloud
JWT_SECRET=change_this_to_a_random_string
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Optional - SMS OTP
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional - Firebase Notifications
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_key
FIREBASE_CLIENT_EMAIL=your_firebase_email
```

### Web Dashboard (.env or .env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Mobile App
- API URL is hardcoded in `src/services/api.js`
- Update the `API_BASE_URL` variable for different environments

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify authentication credentials

**CORS Error**
- Check CORS_ORIGIN includes your app URL
- Restart backend after changes

**Port Already in Use**
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Web Dashboard Issues

**API Connection Error**
- Verify backend is running
- Check REACT_APP_API_URL
- Check browser console for errors

**Login Fails**
- Verify admin user exists in MongoDB
- Check JWT_SECRET matches between backend and expectations

### Mobile App Issues

**Expo Connection Error**
- Check metro bundler is running
- Restart Expo with `npm start --clear`

**API Not Responding**
- Verify API_BASE_URL in api.js
- Check backend is running
- Allow app network access

---

## Production Deployment

### Backend
```bash
# Build production image
docker build -t fortunecloud-backend ./backend

# Run with environment variables
docker run -e MONGODB_URI=<production_mongo_uri> \
           -e JWT_SECRET=<secure_random_key> \
           -p 5000:5000 \
           fortunecloud-backend
```

### Web Dashboard
```bash
# Build
npm run build

# Deploy build folder to:
# - Vercel
# - Netlify  
# - AWS S3 + CloudFront
# - Your own server
```

### Mobile App
```bash
# For Android
eas build --platform android

# For iOS
eas build --platform ios
```

---

## Database Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb://admin:admin123@localhost:27017/fortunecloud" --out backup/

# Restore MongoDB
mongorestore --uri="mongodb://admin:admin123@localhost:27017/fortunecloud" backup/fortunecloud/
```

---

## Support & Documentation

- API Documentation: See [README.md](./README.md)
- Backend: [backend/](./backend/)
- Web Dashboard: [web-dashboard/](./web-dashboard/)
- Mobile App: [mobile-app/](./mobile-app/)

For detailed API endpoints, refer to README.md
