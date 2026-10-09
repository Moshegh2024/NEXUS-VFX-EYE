#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/android/app"; ART="$ROOT/ci/artifacts"; mkdir -p "$ART"
fail(){ echo "CI_FATAL: $*" >&2; exit 1; }
prebuild(){
 command -v java >/dev/null || fail "Java is missing"; command -v gradle >/dev/null || fail "Gradle is missing"; command -v node >/dev/null || fail "Node.js is missing"; command -v python3 >/dev/null || fail "Python 3 is missing"; command -v sdkmanager >/dev/null || fail "Android sdkmanager is missing"
 java -version 2>&1 | tee "$ART/java-version.txt"; gradle --version | tee "$ART/gradle-version.txt"; node --version | tee "$ART/node-version.txt"; python3 --version | tee "$ART/python-version.txt"
 test -f "$ROOT/android/settings.gradle" || fail "Missing settings.gradle"; test -f "$ROOT/android/build.gradle" || fail "Missing root build.gradle"; test -f "$ROOT/android/app/build.gradle" || fail "Missing app build.gradle"; test -f "$APP/src/main/AndroidManifest.xml" || fail "Missing AndroidManifest.xml"; test -f "$APP/src/main/java/com/nexus/vfxeye/MainActivity.java" || fail "Missing MainActivity.java"
 while IFS= read -r -d '' f; do node --check "$f"; done < <(find "$ROOT/app" "$APP/src/main/assets/public" -type f -name '*.js' -print0)
 grep -q "compileSdk 35" "$ROOT/android/app/build.gradle" || fail "compileSdk 35 contract missing"; grep -q "targetSdk 35" "$ROOT/android/app/build.gradle" || fail "targetSdk 35 contract missing"; grep -q "versionCode 30900" "$ROOT/android/app/build.gradle" || fail "versionCode 30900 contract missing"; grep -q "versionName '3.9.0'" "$ROOT/android/app/build.gradle" || fail "versionName 3.9.0 contract missing"
 echo "PREBUILD=PASS" | tee "$ART/prebuild.txt"
}
verify_apk(){
 APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"; test -f "$APK" || fail "Debug APK not found"
 AAPT2="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}/build-tools/${ANDROID_BUILD_TOOLS:-35.0.0}/aapt2"; [[ -x "$AAPT2" ]] || AAPT2="$(command -v aapt2 || true)"; [[ -n "${AAPT2:-}" && -x "$AAPT2" ]] || fail "aapt2 not found"
 "$AAPT2" dump badging "$APK" | tee "$ART/apk-badging.txt"; grep -q "package: name='com.nexus.vfxeye.debug'" "$ART/apk-badging.txt" || fail "Unexpected package ID"; grep -q "versionCode='30900'" "$ART/apk-badging.txt" || fail "Unexpected versionCode"; grep -q "versionName='3.9.0-debug'" "$ART/apk-badging.txt" || fail "Unexpected versionName"
 unzip -t "$APK" > "$ART/apk-zip-test.txt"; sha256sum "$APK" | tee "$ART/apk.sha256"; stat -c '%n %s bytes' "$APK" | tee "$ART/apk-size.txt"; echo "APK_VERIFY=PASS" | tee "$ART/apk-verify.txt"
}
evidence(){ { echo "NEXUS VFX EYE Android CI evidence"; echo "UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo "GITHUB_SHA=${GITHUB_SHA:-local}"; echo "GRADLE_VERSION=${GRADLE_VERSION:-8.11.1}"; echo "ANDROID_API=${ANDROID_API:-35}"; cat "$ART/apk.sha256"; } | tee "$ART/BUILD_EVIDENCE.txt"; }
case "${1:-}" in prebuild) prebuild;; verify-apk) verify_apk;; evidence) evidence;; *) echo "Usage: $0 {prebuild|verify-apk|evidence}" >&2; exit 2;; esac