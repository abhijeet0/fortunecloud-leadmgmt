# Fortune Cloud Franchise App

Complete implementation of Fortune Cloud Franchise Management System with React Native mobile app, React web dashboard, and Node.js backend.

## Project Structure

```
fortunecloud/
├── backend/                 # Node.js/Express API
├── web-dashboard/          # React web dashboard for admins
└── mobile-app/             # React Native Expo app for franchises
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Environment Variables:**
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `TWILIO_*`: Twilio SMS configuration for OTP
- `FIREBASE_*`: Firebase configuration for notifications

**Features:**
- Franchise signup/login with OTP
- Lead management system
- Commission tracking
- Admin dashboard APIs
- Real-time status updates

### Web Dashboard Setup

```bash
cd web-dashboard
npm install
REACT_APP_API_URL=http://localhost:5000/api npm start
```

**Features:**
- Admin login
- Lead management interface
- Commission management
- Lead status updates with remarks
- Comprehensive reports and analytics

### Mobile App Setup

```bash
cd mobile-app
npm install
npm start
# Press 'a' for Android or 'i' for iOS
```

**Features:**
- Franchise signup/login with OTP
- Lead submission form
- Real-time dashboard
- Commission tracking
- Lead status history

## API Documentation

### Authentication Endpoints

**Franchise Signup**
```
POST /api/auth/franchise/signup
Body: { phone, franchiseName, ownerName, email, city }
Response: { message, phone, otpExpiry }
```

**Verify Signup OTP**
```
POST /api/auth/franchise/verify-otp
Body: { phone, otp, password, franchiseName, ownerName, email, city }
Response: { message, token, franchise }
```

**Franchise Login**
```
POST /api/auth/franchise/login
Body: { phone, password }
Response: { message, token, franchise }
```

**Login with OTP**
```
POST /api/auth/franchise/login-otp
Body: { phone }
Response: { message, phone, otpExpiry }
```

**Verify Login OTP**
```
POST /api/auth/franchise/verify-login-otp
Body: { phone, otp }
Response: { message, token, franchise }
```

**Admin Login**
```
POST /api/auth/admin/login
Body: { email, password }
Response: { message, token, admin }
```

### Franchise Endpoints

**Create Lead**
```
POST /api/franchise/leads
Headers: Authorization: Bearer <token>
Body: {
  studentName,
  qualification,
  stream,
  yearOfPassing?,
  city,
  phone,
  email?
}
Response: { message, lead }
```

**Get Leads**
```
GET /api/franchise/leads?status=&searchTerm=&page=1&limit=20
Headers: Authorization: Bearer <token>
Response: { leads, pagination }
```

**Get Lead Details**
```
GET /api/franchise/leads/:leadId
Headers: Authorization: Bearer <token>
Response: { lead, history, commission }
```

**Get Dashboard**
```
GET /api/franchise/dashboard
Headers: Authorization: Bearer <token>
Response: { franchise, statistics }
```

**Get Commissions**
```
GET /api/franchise/commissions
Headers: Authorization: Bearer <token>
Response: { total, pending, approved, paid, commissions }
```

### Admin Endpoints

**Get All Leads**
```
GET /api/admin/leads?franchise=&city=&status=&date=&searchTerm=&page=1
Headers: Authorization: Bearer <token>
Response: { leads, pagination }
```

**Get Lead Details**
```
GET /api/admin/leads/:leadId
Headers: Authorization: Bearer <token>
Response: { lead, history, commission }
```

**Update Lead Status**
```
PUT /api/admin/leads/:leadId/status
Headers: Authorization: Bearer <token>
Body: { newStatus, remarks? }
Response: { message, lead }
```

**Create Enrollment**
```
POST /api/admin/enrollments
Headers: Authorization: Bearer <token>
Body: { leadId, admissionAmount }
Response: { message, lead, commission }
```

**Get Dashboard**
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token>
Response: { summary, leadsByStatus, leadsByFranchise, commissions }
```

### Reports Endpoints

**Leads by Status**
```
GET /api/admin/reports/leads-by-status
Headers: Authorization: Bearer <token>
Response: [{ _id, count }]
```

**Leads by Franchise**
```
GET /api/admin/reports/leads-by-franchise
Headers: Authorization: Bearer <token>
Response: [{ _id, franchiseName, count, enrolled }]
```

**Commission Summary**
```
GET /api/admin/reports/commission-summary
Headers: Authorization: Bearer <token>
Response: [{ _id, count, totalAmount }]
```

### Commission Endpoints

**Get Commissions**
```
GET /api/commission?status=&page=1&limit=20
Headers: Authorization: Bearer <token>
Response: { commissions, pagination }
```

**Update Commission Status**
```
PUT /api/commission/:commissionId/status
Headers: Authorization: Bearer <token>
Body: { status, remarks? }
Response: { message, commission }
```

**Get Summary**
```
GET /api/commission/summary
Headers: Authorization: Bearer <token>
Response: { byStatus, total }
```

**Get by Franchise**
```
GET /api/commission/franchise/:franchiseId?status=&page=1
Headers: Authorization: Bearer <token>
Response: { commissions, pagination, summary }
```

## Database Models

### Franchise
- phone (unique)
- password (hashed)
- franchiseName
- ownerName
- email (unique)
- city
- isVerified
- leadsSubmitted
- commissionPercentage
- status
- timestamps

### Lead
- franchiseId
- studentName
- qualification
- stream
- yearOfPassing
- city
- phone
- email
- currentStatus
- remarks
- admissionAmount
- enrollmentDate
- timestamps

### LeadStatusHistory
- leadId
- previousStatus
- newStatus
- remarks
- updatedBy
- createdAt

### Commission
- leadId
- franchiseId
- admissionAmount
- commissionPercentage
- commissionAmount
- status
- remarks
- paidDate
- timestamps

### Admin
- email (unique)
- password (hashed)
- name
- role (admin | finance_admin)
- status
- timestamps

## Status Flow

```
Submitted → Lead acknowledged → HOT → WARM → Unspoken → COLD → Visited → Enrolled
```

## Key Features Implemented

✅ **Backend**
- JWT authentication
- OTP-based signup and login
- Lead management
- Commission auto-calculation
- Admin and finance admin roles
- Comprehensive reporting

✅ **Web Dashboard**
- Admin authentication
- Lead management interface
- Status update with remarks
- Commission tracking
- Advanced filtering and search
- Analytics and reports

✅ **Mobile App**
- Franchise signup/login
- Lead submission
- Real-time dashboard
- Commission summary
- Lead history and tracking

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Web**: React, React Router, Axios
- **Mobile**: React Native, Expo, React Navigation
- **Authentication**: JWT, OTP
- **Database**: MongoDB

## Deployment

### Backend Deployment
- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables
- Ensure MongoDB Atlas connection

### Web Dashboard Deployment
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Update API URL in environment variables

### Mobile App Deployment
- Android: `eas build --platform android`
- iOS: `eas build --platform ios`
- Requires Expo account and configuration

## Notes

- OTP verification is currently logged to console (implement Twilio for production)
- Firebase push notifications setup required for production
- MongoDB should be properly configured and secured
- HTTPS recommended for production
- Implement rate limiting on auth endpoints
- Add database backup strategy

## Support

For issues and questions, refer to the API documentation and ensure all environment variables are properly configured.
