# NEXUS VFX EYE 3.9 — Android Build

- Application ID: `com.nexus.vfxeye`; debug ID: `com.nexus.vfxeye.debug`
- Version: `3.9.0`; version code: `30900`
- Minimum Android API 26; compile/target SDK 35
- Debug APK output: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release variant is unsigned unless a controlled release keystore is configured.
- Use JDK 17, Gradle 8.11.1, Android SDK Platform 35 and Build Tools 35.0.0.
- Open `android/` in Android Studio or run `gradle :app:assembleDebug`.
- Production acceptance requires a real API-26+ device, offline launch, Stage -1 → Stage 0 consent → Mission flow, restart persistence, back navigation, and a 30-minute stability session.
- A successful compile alone is not device certification.