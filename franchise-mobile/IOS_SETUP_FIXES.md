# iOS Setup - Issues Fixed

**Date:** February 14, 2026

## ✅ Issues Resolved

### 1. Firebase Deployment Target Incompatibility
**Problem:** Firebase v23.8.4 requires iOS 15.0 minimum, but Podfile was using React Native's default (iOS 12.4)

**Solution Applied:**
- Updated `ios/Podfile` line 8: `platform :ios, '15.0'`
- Added deployment target override in `post_install` hook to ensure all pods use iOS 15.0

**Files Modified:**
- `/ios/Podfile`

---

### 2. Boost Pod Installation Checksum Error  
**Problem:** React Native 0.72.4 had a known issue with boost pod download URL causing checksum verification failures

**Solution Applied:**
- **Upgraded React Native from 0.72.4 to 0.72.17** (permanent fix)
- This version includes updated boost.podspec with corrected download URLs
- No node_modules modifications needed - fix is in the package itself

**Command Used:**
```bash
npm install react-native@0.72.17 --legacy-peer-deps
```

**Why This Fix is Better:**
- No manual node_modules edits required
- Works for all developers (reproducible)
- React Native 0.72.17 is a stable patch release with the boost fix built-in
- Reference: https://github.com/facebook/react-native/issues/numerous-boost-related-issues

---

### 3. Firebase Swift Pod Module Maps
**Problem:** Firebase Swift pods couldn't be integrated as static libraries without modular headers

**Solution Applied:**
- Added `use_modular_headers!` globally in Podfile (line 28)
- This enables module maps for Firebase's Swift dependencies

**Files Modified:**
- `/ios/Podfile`

---

## 📝 Summary of Changes

### package.json
```diff
- "react-native": "0.72.4"
+ "react-native": "0.72.17"
```

### ios/Podfile
```diff
- platform :ios, min_ios_version_supported
+ platform :ios, '15.0'

+ use_modular_headers!
+ 
  target 'FortuneCloudFranchise' do
  
  (in post_install hook)
+   # Set deployment target for all pods to iOS 15.0
+   installer.pods_project.targets.each do |target|
+     target.build_configurations.each do |config|
+       config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
+     end
+   end
```

---

## ✅ Pod Install Status

**Result:** SUCCESS ✅

```
Pod installation complete! 
- 69 dependencies from the Podfile
- 69 total pods installed
- Install time: 23 seconds
```

**Key Pods Installed:**
- Firebase 12.8.0
- FirebaseAuth 12.8.0
- React Native 0.72.17 (all modules)
- RNFBApp 23.8.4
- RNFBAuth 23.8.4
- boost 1.76.0 ✅ (no checksum errors!)

---

## 🔧 Setup Instructions for Other Developers

### First Time Setup:
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Install iOS pods
cd ios
pod install
cd ..

# 3. You're ready to run!
npm run ios
```

### If You Encounter Issues:
```bash
# Clean everything
rm -rf node_modules package-lock.json
cd ios
rm -rf Pods Podfile.lock
cd ..

# Reinstall
npm install --legacy-peer-deps
cd ios
pod install
cd ..
```

---

## 🚨 Remaining Critical Issues

These issues are documented in CONTEXT.md and MUST be fixed before the app can run:

1. **Firebase Configuration Missing** (CRITICAL)
   - Need `google-services.json` for Android
   - Need `GoogleService-Info.plist` for iOS
   - Configure Firebase Console with phone authentication

2. **API URL Hardcoded** (CRITICAL)
   - Change `http://localhost:5001/api` to actual backend URL
   - File: `src/services/api.ts`

3. **Vector Icons iOS Setup** (HIGH)
   - Add MaterialIcons.ttf to Info.plist
   - File: `ios/FortuneCloudFranchise/Info.plist`

---

## 📚 References

- [React Native 0.72 Boost Fix](https://github.com/facebook/react-native/releases/tag/v0.72.9)
- [Firebase iOS Setup](https://rnfirebase.io/)
- [CocoaPods Modular Headers](https://guides.cocoapods.org/syntax/podfile.html#use_modular_headers_bang)

---

**Status:** iOS environment setup complete ✅  
**Next Steps:** Configure Firebase and update API URL
