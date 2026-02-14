# FortuneCloud Franchise Mobile App - Context Document

**Generated:** February 14, 2026  
**App Version:** 0.0.1  
**React Native Version:** 0.72.17 (upgraded from 0.72.4 to fix iOS pod install issues)

---

## 🔧 Setup Issues & Fixes

**IMPORTANT:** Build configuration issues have been resolved! See detailed documentation:
- **iOS Setup:** See [IOS_SETUP_FIXES.md](./IOS_SETUP_FIXES.md) for pod install fixes
- **Android Setup:** See [ANDROID_SETUP_FIXES.md](./ANDROID_SETUP_FIXES.md) for Java version fixes

---

## 📱 Application Overview

**FortuneCloudFranchise** is a React Native CLI-based mobile application designed for franchise partners to manage student leads and track commissions. The app enables franchises to:

- Authenticate using Firebase phone authentication (OTP-based)
- Manage student leads (create, view, track status)
- Monitor commission earnings
- Track lead status changes through a timeline
- View dashboard statistics and analytics

---

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Framework:** React Native 0.72.4 (CLI-based, not Expo)
- **Language:** TypeScript 4.8.4
- **Navigation:** React Navigation v7 (Stack & Bottom Tabs)
- **State Management:** React Context API (AuthContext)
- **Storage:** AsyncStorage for local persistence
- **Authentication:** Firebase Authentication (@react-native-firebase/auth v23.8.4)
- **HTTP Client:** Axios 1.13.4
- **Icons:** react-native-vector-icons (MaterialIcons)

### Build Configuration
- **Node Version Required:** >= 16
- **Android:**
  - Min SDK: 23
  - Target SDK: 34
  - Compile SDK: 34
  - Build Tools: 34.0.0
  - Java Version: 17
  - Kotlin: 1.9.22
  - Gradle: 8.1.1
  - Namespace: `com.fortunecloudfranchise`
  
- **iOS:**
  - Min iOS Version: 15.0 (required by Firebase 12.8.0)
  - CocoaPods: ~> 1.12
  - Ruby: >= 2.6.10

---

## 📂 Project Structure

```
franchise-mobile/
├── android/                # Android native code
├── ios/                    # iOS native code
├── src/
│   ├── context/
│   │   └── AuthContext.tsx          # Authentication state management
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Root navigator (auth vs main)
│   │   └── MainTabNavigator.tsx     # Bottom tab navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx      # Phone number login
│   │   │   ├── SignupScreen.tsx     # Franchise registration
│   │   │   └── OTPScreen.tsx        # OTP verification
│   │   ├── leads/
│   │   │   ├── LeadListScreen.tsx   # List all leads with filters
│   │   │   ├── CreateLeadScreen.tsx # Submit new student leads
│   │   │   └── LeadDetailScreen.tsx # Lead details & status history
│   │   └── main/
│   │       ├── DashboardScreen.tsx  # Statistics & overview
│   │       └── CommissionScreen.tsx # Commission breakdown
│   └── services/
│       └── api.ts                   # API client & service methods
├── App.tsx                 # Root component
├── index.js                # App entry point
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## 🔐 Authentication Flow

### Implementation Details
1. **Phone-based Authentication:** Uses Firebase Phone Auth
2. **Login Flow:**
   - User enters phone number → Firebase sends OTP
   - User verifies OTP → Firebase returns `idToken`
   - App sends `idToken` to backend `/api/auth/franchise/login`
   - Backend returns franchise data + JWT token
   - Token stored in AsyncStorage for subsequent API calls

3. **Signup Flow:**
   - User fills franchise details (name, owner, email, city, phone)
   - Firebase sends OTP → User verifies
   - App calls `/api/auth/franchise/signup` with user data
   - Then calls `/api/auth/franchise/login` to get session token
   - User logged in automatically

### AuthContext State
- `user`: Current franchise user object
- `loading`: Initial auth check state
- `login(userData, token)`: Store user & token
- `logout()`: Clear user & token

---

## 🌐 API Integration

### Base Configuration
- **API URL:** `http://localhost:5001/api` ⚠️ **ISSUE: Hardcoded localhost**
- **Authentication:** Bearer token in `Authorization` header
- **Token Storage:** AsyncStorage (key: `token`)
- **User Storage:** AsyncStorage (key: `user`)

### API Endpoints

#### Auth Service
- `POST /auth/franchise/signup` - Register new franchise
- `POST /auth/franchise/login` - Login with Firebase idToken

#### Franchise Service
- `GET /franchise/dashboard` - Dashboard statistics
- `GET /franchise/leads` - List all leads
- `GET /franchise/leads/:id` - Get lead details
- `POST /franchise/leads` - Create new lead
- `GET /franchise/commissions` - Commission breakdown

### Request Interceptor
Automatically adds JWT token from AsyncStorage to all API requests.

---

## 📱 Features & Screens

### 1. **Dashboard Screen**
- Welcome message with franchise name
- **Key Metrics:**
  - Total Leads count
  - Enrolled students count
  - Total Commission earned (₹)
- **Lead Status Breakdown:** Visual list showing leads by status (HOT, WARM, COLD, ENROLLED)
- **Quick Actions:** Navigate to Commission details, Add new lead
- **Refresh:** Pull-to-refresh support

### 2. **Lead List Screen**
- **Search:** By student name or phone number
- **Filters:** All, HOT, WARM, Enrolled
- **Lead Cards:** Display name, phone, date, status badge
- Click to view lead details
- Pull-to-refresh

### 3. **Create Lead Screen**
- **Required Fields:**
  - Student Name
  - Qualification (e.g., BE, BCom)
  - Stream (e.g., Computer Science)
  - City
  - Phone Number
- **Optional Fields:**
  - Year of Passing
  - Email ID
- Form validation before submission

### 4. **Lead Detail Screen**
- **Student Information:** Name, Phone, Qualification, Stream
- **Status History Timeline:** 
  - Shows all status changes
  - Displays status, timestamp, remarks
  - Visual timeline with dots and connecting lines
- **Commission Details:** (if enrolled)
  - Commission amount
  - Payment status

### 5. **Commission Screen**
- **Summary Box:**
  - Total Payable Commission
  - Breakdown: Pending + Approved
- **Commission List:**
  - Student name
  - Admission amount
  - Commission percentage
  - Commission amount
  - Payment status (Paid, Approved, Pending)
  - Generation date

### 6. **Login Screen**
- Phone number input
- Get OTP button
- Link to Signup

### 7. **Signup Screen**
- Franchise details form
- Get OTP button
- Link to Login

### 8. **OTP Screen**
- 6-digit OTP input
- Verify button
- Resend OTP option (placeholder)

---

## 🎨 UI/UX Design Patterns

### Color Scheme
- **Primary:** #2196F3 (Blue)
- **Success/Enrolled:** #4CAF50 (Green)
- **Warning/Warm:** #ff9800 (Orange)
- **Error/Hot:** #f44336 (Red)
- **Background:** #f5f5f5 (Light Gray)
- **Text Primary:** #333
- **Text Secondary:** #666
- **Text Tertiary:** #999

### Status Colors
- **HOT:** #f44336 (Red)
- **WARM:** #ff9800 (Orange)
- **COLD:** #2196f3 (Blue)
- **ENROLLED:** #4caf50 (Green)
- **Default:** #757575 (Gray)

### Design Principles
- Clean card-based layouts
- Consistent padding/margins (15-20px)
- Rounded corners (8-12px)
- Shadow/elevation for depth
- Material Icons throughout
- Responsive to pull-to-refresh gestures
- Loading states with ActivityIndicator

---

## 🚨 CRITICAL ISSUES THAT WILL PREVENT APP FROM RUNNING

### 🔴 ISSUE #1: Firebase Configuration Missing
**Severity:** CRITICAL - App will crash on authentication

**Problem:**
- Firebase packages are installed (`@react-native-firebase/app`, `@react-native-firebase/auth`)
- **MISSING:** `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- **MISSING:** Firebase plugin configuration in `android/build.gradle`

**Impact:**
- App will crash when trying to use `auth().signInWithPhoneNumber()` on LoginScreen or SignupScreen
- No authentication will work

**Fix Required:**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Phone Authentication in Firebase Console
3. Download `google-services.json` → Place in `android/app/`
4. Download `GoogleService-Info.plist` → Place in `ios/FortuneCloudFranchise/`
5. Add to `android/build.gradle`:
   ```gradle
   dependencies {
       classpath("com.google.gms:google-services:4.4.0")
   }
   ```
6. Add to `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```
7. Run `cd ios && pod install`

---

### 🔴 ISSUE #2: API URL Hardcoded to Localhost
**Severity:** CRITICAL - Backend communication will fail

**Problem:**
- API URL is `http://localhost:5001/api` in `src/services/api.ts`
- Localhost doesn't work on physical devices
- iOS doesn't allow non-HTTPS in production

**Impact:**
- Physical devices cannot connect to backend
- All API calls will fail (login, leads, commissions, dashboard)

**Fix Required:**
1. For development on emulator: Change to computer's local IP
   ```typescript
   const API_URL = 'http://192.168.x.x:5001/api'; // Replace with your IP
   ```
2. For physical device testing: Use ngrok or similar tunneling
3. For production: Use actual backend server URL
4. **Better approach:** Use environment variables:
   ```typescript
   const API_URL = __DEV__ 
     ? 'http://192.168.x.x:5001/api' 
     : 'https://api.fortunecloud.com/api';
   ```

---

### 🔴 ISSUE #3: react-native-vector-icons Setup Required
**Severity:** HIGH - Icons won't render properly

**Problem:**
- Vector icons package is installed
- Fonts configuration exists in `android/app/build.gradle`
- **MISSING:** iOS configuration for fonts

**Impact:**
- Icons may not display on iOS (shows blank squares or question marks)
- Navigation tabs will have missing icons

**Fix Required for iOS:**
1. Add to `ios/FortuneCloudFranchise/Info.plist`:
   ```xml
   <key>UIAppFonts</key>
   <array>
     <string>MaterialIcons.ttf</string>
   </array>
   ```
2. Run `cd ios && pod install`

**Note:** Android is already configured correctly via `fonts.gradle`

---

### 🟡 ISSUE #4: iOS Pods Not Installed
**Severity:** MEDIUM - iOS build will fail

**Problem:**
- iOS dependencies managed via CocoaPods
- `Podfile` exists but pods need to be installed
- No `ios/Pods/` directory likely exists in fresh clone

**Impact:**
- `npm run ios` will fail
- Xcode build will fail with missing dependencies

**Fix Required:**
```bash
cd ios
pod install
cd ..
```

**Alternative:** Use `npx pod-install` from project root

---

### 🟡 ISSUE #5: Type Safety Issues
**Severity:** MEDIUM - Runtime errors possible

**Problem:**
- Many components use `any` type (AuthContext, route params, API responses)
- No TypeScript interfaces defined for API data models
- No type definitions file

**Impact:**
- Harder to catch bugs during development
- No autocomplete for API response data
- Runtime errors from unexpected data shapes

**Fix Required:**
Create `src/types/index.ts`:
```typescript
// Example types needed
export interface Franchise {
  _id: string;
  franchiseName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
}

export interface Lead {
  _id: string;
  studentName: string;
  qualification: string;
  stream: string;
  yearOfPassing?: string;
  city: string;
  phone: string;
  email?: string;
  status: 'HOT' | 'WARM' | 'COLD' | 'ENROLLED';
  createdAt: string;
  statusHistory?: StatusHistory[];
  commissionInfo?: CommissionInfo;
}

export interface StatusHistory {
  status: string;
  updatedAt: string;
  remarks: string;
}

export interface Commission {
  _id: string;
  leadId: Lead;
  admissionAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  enrolled: number;
  pending: number;
  totalCommission: string;
  statusBreakdown: Array<{ _id: string; count: number }>;
}
```

---

### 🟡 ISSUE #6: OTP Resend Not Implemented
**Severity:** LOW - UX issue, not blocking

**Problem:**
- "Resend OTP" button shows placeholder Alert
- No actual resend logic implemented

**Impact:**
- Users cannot resend OTP if not received
- Have to restart login/signup flow

**Fix Required:**
Store `confirmation` object in state and implement actual resend:
```typescript
const handleResend = async () => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const newConfirmation = await auth().signInWithPhoneNumber(formattedPhone);
    setConfirmation(newConfirmation);
    Alert.alert('Success', 'OTP resent successfully');
  } catch (error) {
    Alert.alert('Error', 'Failed to resend OTP');
  }
};
```

---

### 🟡 ISSUE #7: No Error Boundaries
**Severity:** LOW - Poor UX on crashes

**Problem:**
- No error boundaries implemented
- App crashes will show React Native red screen

**Impact:**
- Poor user experience on errors
- No graceful error handling

**Fix Required:**
Implement Error Boundary component or use `react-native-error-boundary`

---

## ⚙️ Environment Setup Requirements

### Prerequisites
1. **Node.js:** >= 16
2. **Ruby:** >= 2.6.10 (for iOS/CocoaPods)
3. **Java:** JDK 17
4. **Android Studio:** Latest with SDK 34
5. **Xcode:** 14+ (macOS only, for iOS)
6. **CocoaPods:** >= 1.12

### First-Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Install iOS pods (macOS only)
cd ios && pod install && cd ..

# 3. Setup Firebase (follow ISSUE #1)

# 4. Update API URL in src/services/api.ts

# 5. Run the app
npm run android  # For Android
npm run ios      # For iOS
```

---

## 🧪 Testing & Quality

### Current State
- Test setup exists (Jest configured)
- `__tests__/App.test.tsx` exists (not reviewed in detail)
- No comprehensive test coverage visible

### Recommendations
- Add unit tests for API services
- Add integration tests for authentication flow
- Add component tests for key screens
- Add E2E tests for critical user flows

---

## 📦 Dependencies Overview

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react-native | 0.72.4 | Core framework |
| react | 18.2.0 | UI library |
| @react-navigation/native | ^7.1.28 | Navigation foundation |
| @react-navigation/bottom-tabs | ^7.10.1 | Tab navigation |
| @react-navigation/native-stack | ^7.11.0 | Stack navigation |
| @react-native-firebase/app | ^23.8.4 | Firebase core |
| @react-native-firebase/auth | ^23.8.4 | Firebase auth |
| @react-native-async-storage/async-storage | ^2.2.0 | Local storage |
| axios | ^1.13.4 | HTTP client |
| react-native-vector-icons | ^10.3.0 | Icons |
| react-native-safe-area-context | ^4.7.1 | Safe area handling |
| react-native-screens | ^3.22.1 | Native screen optimization |

### Key Dev Dependencies
- TypeScript 4.8.4
- ESLint (React Native config)
- Prettier
- Jest & Test Renderer
- Babel presets

---

## 🚀 Build & Run Commands

```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios            # Run on iOS

# Code Quality
npm run lint           # Run ESLint
npm run test           # Run Jest tests

# Cleaning (when facing issues)
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Metro cache
npm start -- --reset-cache
```

---

## 📝 Code Style & Conventions

### Current Conventions
- **ESLint:** Uses `@react-native` preset
- **Prettier:**
  - Single quotes
  - No bracket spacing
  - Trailing commas: all
  - Arrow parens: avoid
  - Bracket same line: true

### Component Patterns
- Functional components with hooks
- StyleSheet for styles (no inline styles generally)
- Async/await for async operations
- Try-catch error handling
- Loading states with ActivityIndicator
- Pull-to-refresh support

---

## 🔄 State Management Pattern

### Current Approach: Context API
- **AuthContext:** Global authentication state
- **Local State:** useState for component-specific state
- **No Redux:** Simple app doesn't require complex state management

### Data Flow
1. User authenticates → AuthContext updated
2. Token stored in AsyncStorage
3. API calls use token from AsyncStorage (via interceptor)
4. Each screen fetches own data (no global data cache)
5. Pull-to-refresh re-fetches data

---

## 🌍 Internationalization
**Status:** Not implemented
- Hardcoded English strings
- Indian Rupee (₹) hardcoded
- +91 country code assumed for phone numbers

---

## 🔐 Security Considerations

### Current Security
✅ **Good:**
- JWT token-based authentication
- Bearer token in headers
- Secure storage (AsyncStorage encrypted on modern devices)
- Firebase phone authentication

⚠️ **Needs Attention:**
- No certificate pinning
- No biometric authentication option
- Sensitive data only in AsyncStorage (consider KeyChain/KeyStore)
- HTTP allowed in debug (use HTTPS for production)

---

## 📊 Performance Considerations

### Current Optimizations
- `useCallback` for memoizing fetch functions
- Flatlist for lead/commission lists (virtualized)
- Loading states prevent multiple requests

### Potential Improvements
- Add pagination for large lead lists
- Implement data caching (React Query or similar)
- Optimize image loading if images added
- Add request debouncing for search

---

## 🐛 Known Behavioral Issues (Non-Breaking)

1. **Status Filter Mismatch:** Filter uses 'Enrolled' but status might be 'ENROLLED' (case sensitivity)
2. **Phone Number Format:** Assumes 10-digit Indian phone numbers only
3. **Resend OTP:** Shows alert but doesn't actually resend
4. **No Offline Support:** App requires internet connection for all features
5. **No Data Validation:** Minimal client-side validation (relies on backend)
6. **Error Messages:** Generic error messages, no user-friendly explanations

---

## 📚 Additional Context

### Backend Expectations
The app expects a backend API with:
- Firebase Admin SDK for verifying idTokens
- Franchise user model
- Lead management endpoints
- Commission tracking system
- MongoDB or similar database (based on `_id` field patterns)

### Deployment Readiness
**Status:** NOT PRODUCTION READY

**Blockers:**
1. Firebase not configured (CRITICAL)
2. API URL is localhost (CRITICAL)
3. No release keystore for Android
4. No app icon/splash screen customization visible
5. No privacy policy or terms of service links
6. No analytics or crash reporting
7. No push notifications setup

---

## 🎯 Recommended Next Steps

### Immediate (Blocking)
1. ✅ Configure Firebase (google-services files)
2. ✅ Update API URL to actual backend
3. ✅ Run `pod install` for iOS
4. ✅ Configure vector icons for iOS

### Short-term (Quality)
1. Add TypeScript interfaces
2. Implement proper error handling
3. Add loading skeletons
4. Implement OTP resend
5. Add input validation
6. Add error boundaries

### Medium-term (Production)
1. Setup CI/CD pipeline
2. Add analytics (Firebase Analytics)
3. Add crash reporting (Crashlytics)
4. Implement biometric auth
5. Add app icons and splash screens
6. Generate release keystores
7. Add privacy policy & terms

### Long-term (Enhancement)
1. Offline support with local database
2. Push notifications
3. Multi-language support
4. Dark mode
5. Advanced filters and sorting
6. Export capabilities (PDF reports)

---

## 📞 Support & Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Firebase React Native](https://rnfirebase.io/)

### Troubleshooting Common Issues
- **Metro bundler issues:** Clear cache with `npm start -- --reset-cache`
- **Android build fails:** Clean with `cd android && ./gradlew clean`
- **iOS build fails:** Reinstall pods `cd ios && pod install`
- **Firebase errors:** Verify google-services files are in correct location

---

**Last Updated:** February 14, 2026  
**Maintainer:** Development Team  
**Status:** Development (Pre-Production)
