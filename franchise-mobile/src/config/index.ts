import { Platform } from 'react-native';

/**
 * Application Configuration
 *
 * For React Native, Firebase on Android is configured via google-services.json
 * and on iOS via GoogleService-Info.plist. The native SDKs pick these up
 * automatically — no JS-side Firebase config is needed.
 *
 * API_URL:
 *  - In __DEV__  mode we point to the local backend.
 *    • Android emulator  → 10.0.2.2 maps to the host machine's localhost.
 *    • iOS simulator     → localhost works directly.
 *    • Physical device   → replace with your machine's LAN IP (e.g. 192.168.x.x).
 *  - In production, replace with the actual deployed API URL.
 */

// ── Backend API ───────────────────────────────────────────────
const DEV_API_HOST = Platform.select({
  android: 'localhost', // Android emulator → host machine
  ios: 'localhost', // iOS simulator   → host machine
  default: 'localhost',
});

const DEV_API_URL = `http://${DEV_API_HOST}:5001/api`;
const PROD_API_URL = 'https://api.fortunecloud.com/api'; // Update when ready

export const API_URL: string = 'http://localhost:5001/api'; //__DEV__ ? DEV_API_URL : PROD_API_URL;

// ── Firebase ──────────────────────────────────────────────────
// Native Firebase SDKs are configured automatically from:
//   Android → android/app/google-services.json
//   iOS     → ios/FortuneCloudFranchise/GoogleService-Info.plist
//
// If you need the project ID in JS for any reason:
export const FIREBASE_PROJECT_ID = 'fortune-cloud-franchise-app';

// ── App Constants ─────────────────────────────────────────────
export const APP_NAME = 'FortuneCloud Franchise';
export const DEFAULT_COUNTRY_CODE = '+91';
export const OTP_LENGTH = 6;
export const OTP_RESEND_TIMEOUT_SECONDS = 30;
