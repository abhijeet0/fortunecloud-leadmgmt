# Franchise Mobile - Setup Summary

The setup of the `franchise-mobile` application is now complete. Below is a summary of the configuration and build improvements made.

## 🚀 Key Achievements

### 1. Android Build & Environment
- **React Native 0.72.17**: Correctly configured and building.
- **Java 17 Enforced**: All Gradle modules (including Firebase) are forced to use Java 17 toolchain, resolving compatibility issues.
- **Dependency Pinning**: All key libraries (`react-navigation`, `react-native-screens`, `axios`, etc.) are pinned to versions compatible with RN 0.72.
- **Package Name Alignment**: Application ID and Java namespace updated to `com.fortunecloud.leadmgmt` to match the Firebase configuration.

### 2. Firebase Integration
- **Auto-Initialization**: `google-services.json` placed in `android/app/` and Google Services Gradle plugin applied.
- **Phone Auth Ready**: Firebase Auth v23.8.4 integrated.
- **Authentication Flow**: Updated Login, Signup, and OTP screens with Firebase phone authentication logic.
- **Session Management**: `AuthContext` updated to handle Firebase tokens and automated signout.

### 3. Application Architecture
- **Central Config**: New `src/config/index.ts` handles:
  - `API_URL` selection (Android emulator uses `10.0.2.2`).
  - Auth constants (OTP length, country codes).
- **Hardened API Service**: `api.ts` now uses the central config and includes interceptors for auto-attaching tokens and handling `401 Unauthorized` errors.
- **Code Quality**: Prettier and Linting issues fixed across the codebase.

## 🛠 How to Run

### Development
1. Start the Metro Bundler:
   ```bash
   npm start
   ```
2. Run on Android:
   ```bash
   npm run android
   ```

### Troubleshooting
- If you face Firebase errors:
  - Ensure the Metro cache is clean: `npm start -- --reset-cache`.
  - Perform a clean Android build: `cd android && ./gradlew clean && cd ..`.
- Backend Connection:
  - The app points to `http://10.0.2.2:5001/api` by default for the Android emulator. Ensure your local backend is running on port `5001`.

## 📁 Files Modified/Created
- `android/build.gradle` (Java 17/Google Services)
- `android/app/build.gradle` (Package Name/ID/Plugins)
- `android/app/google-services.json` (Moved)
- `src/config/index.ts` (New)
- `src/services/api.ts` (Updated)
- `src/context/AuthContext.tsx` (Updated)
- `src/screens/auth/OTPScreen.tsx` (Rewritten)
- `src/navigation/MainTabNavigator.tsx` (Lint fixes)
- `package.json` (Dependency pinning)

**Setup Status: [COMPLETED]**
