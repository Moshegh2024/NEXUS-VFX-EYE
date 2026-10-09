# NEXUS VFX EYE — Android Build Kit 3.9.0

Offline-first training-runtime prototype with a native Android WebView shell, local IndexedDB persistence, explicit Stage 0 consent, a diagnostic exercise flow, and GitHub Actions debug-APK CI.

## Build contract
- Application ID: `com.nexus.vfxeye`; debug ID: `com.nexus.vfxeye.debug`
- Version: `3.9.0`, version code `30900`
- Minimum Android API 26; compile/target API 35
- Web runtime: `app/`; Android project: `android/`
- CI builds a debug APK, verifies package/version and ZIP integrity, and uploads APK plus evidence.

## Local build
Use JDK 17, Gradle 8.11.1, Android SDK Platform 35 and Build Tools 35.0.0:
```bash
cd android
gradle --no-daemon :app:assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Release and verification boundary
Do not commit production signing keys. The release variant is not a production-signed release. Real-device installation, offline launch, persistence after process restart, navigation, and device-matrix verification remain external acceptance tests. This is a runtime/build prototype and does not claim to contain the complete authored curriculum for all 540 days; Day 001 is a training slice.