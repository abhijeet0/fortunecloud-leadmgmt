# Android Setup - Issues Fixed

**Date:** February 14, 2026

## ✅ Issue Resolved

### Firebase Auth Java Version Compatibility
**Problem:** Firebase Auth v23.8.4 uses Java pattern matching in instanceof (requires Java 16+), and there were JVM target inconsistencies between Java and Kotlin tasks

**Error Messages:**
```
error: pattern matching in instanceof is not supported in -source 11
  (use -source 16 or higher to enable pattern matching in instanceof)

Inconsistent JVM-target compatibility detected for tasks 
'compileDebugJavaWithJavac' (11) and 'compileDebugKotlin' (17).
```

**Root Cause:**
- Firebase Auth v23.8.4 uses modern Java syntax features
- Pattern matching in instanceof requires Java 16 or higher
- Some modules were still using Java 11 despite project-level settings
- Kotlin tasks were configured for JVM 17 but Java tasks weren't consistently applied

**Solution Applied:**
Added comprehensive Java 17 configuration at both `allprojects` and `subprojects` levels in `android/build.gradle`:

```gradle
allprojects {
    tasks.withType(JavaCompile).all {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    
    tasks.withType(KotlinCompile).all {
        kotlinOptions {
            jvmTarget = "17"
        }
    }
}

subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            // Force all Java compilation tasks to use Java 17
            project.tasks.withType(JavaCompile).configureEach {
                sourceCompatibility = '17'
                targetCompatibility = '17'
            }
            
            // Force all Kotlin compilation tasks to use JVM 17
            if (project.plugins.hasPlugin("kotlin-android")) {
                project.tasks.withType(KotlinCompile).configureEach {
                    kotlinOptions {
                        jvmTarget = "17"
                    }
                }
            }
        }
    }
}
```

This ensures ALL modules (including third-party dependencies) use Java 17 consistently.

---

## 📝 Files Modified

### android/build.gradle
```diff
+ // In allprojects block:
  tasks.withType(JavaCompile).all {
      sourceCompatibility = JavaVersion.VERSION_17
      targetCompatibility = JavaVersion.VERSION_17
-     options.release = 17  // Removed - causes warnings
  }
  
+ tasks.withType(KotlinCompile).all {
+     kotlinOptions {
+         jvmTarget = "17"
+     }
+ }
+
+ // In subprojects afterEvaluate block:
+ // Force all Java compilation tasks to use Java 17
+ project.tasks.withType(JavaCompile).configureEach {
+     sourceCompatibility = '17'
+     targetCompatibility = '17'
+ }
+
+ // Force all Kotlin compilation tasks to use JVM 17  
+ project.tasks.withType(KotlinCompile).configureEach {
+     kotlinOptions {
+         jvmTarget = "17"
+     }
+ }
```

---

## ✅ Build Configuration Summary

### Java Version
- **Required:** Java 17 (for Firebase Auth v23.8.4)
- **Configured:** Java 17 (via gradle.properties and build.gradle)
- **Location:** `org.gradle.java.home=/Users/rohitmadas/.sdkman/candidates/java/17.0.13-amzn`

### Kotlin
- **Version:** 1.9.22
- **JVM Target:** 17

### Android SDK
- **Min SDK:** 23 (Android 6.0)
- **Target SDK:** 34 (Android 14)
- **Compile SDK:** 34
- **Build Tools:** 34.0.0

---

## 🔧 For Other Developers

### Prerequisites
- **Java 17 or higher** must be installed
- Set `JAVA_HOME` or configure in `gradle.properties`

### First Time Build:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### If You Encounter Java Version Issues:
```bash
# Check your Java version
java -version  # Should show 17 or higher

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

---

## 🚨 Remaining Critical Issues

Same as documented in CONTEXT.md:

1. **Firebase Configuration Missing** (CRITICAL)
   - Need `google-services.json` in `android/app/`
   - Add Firebase plugin to `android/app/build.gradle`
   - Configure Firebase Console with phone authentication

2. **API URL Hardcoded** (CRITICAL)
   - Change `http://localhost:5001/api` to actual backend URL
   - File: `src/services/api.ts`

3. **Google Services Plugin** (CRITICAL)
   - Add to `android/build.gradle`: 
     ```gradle
     classpath("com.google.gms:google-services:4.4.0")
     ```
   - Add to `android/app/build.gradle`:
     ```gradle
     apply plugin: 'com.google.gms.google-services'
     ```

---

## 📚 References

- [Firebase Android Setup](https://rnfirebase.io/#2-android-setup)
- [React Native Firebase Auth](https://rnfirebase.io/auth/usage)
- [Java Release Option](https://docs.gradle.org/current/userguide/building_java_projects.html#sec:java_cross_compilation)

---

**Status:** Android build configuration complete ✅  
**Next Steps:** Add Firebase configuration files and update API URL
