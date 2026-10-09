# Phase 1 — Runtime hardening

## Scope
This feature branch hardens the existing Day 001 runtime. It does not replace the working main branch and does not claim that all 540 days are authored.

## Audit findings
- Runtime validation currently accepts weakly typed observations/evidence/hypotheses and whitespace-only diagnostic fields.
- Confidence validation should reject NaN and non-finite values explicitly.
- Stage 0 wording refers to image generation even though this runtime slice does not generate images.
- Examiner wording implies scoring that is not currently implemented.
- Launch success is not proof of IndexedDB persistence after force-stop/relaunch.

## Acceptance criteria
- Add regression tests for invalid observations, evidence, hypotheses, blank diagnostic text, and confidence boundaries.
- Rejected submissions remain in the mission state and can be corrected.
- CI syntax checks both web source and bundled Android assets, runs runtime tests, builds a debug APK, and verifies its package/version and ZIP integrity.
- Physical-device checks must verify Stage -1/Stage 0 ordering, deny-consent behavior, submission validation, save/force-stop/relaunch persistence, offline launch, and navigation.

## Limitations
This is a Day 001 runtime slice, not the completed 540-day curriculum. Image generation, authoritative examiner scoring, cloud sync, and production signing are not claimed. Real-device persistence and offline behavior require manual verification.

## Release rule
Do not distribute a new APK solely because CI is green. Review the diff, require CI success, install the exact artifact from that run, and record the device model, Android version, APK SHA-256, and manual acceptance outcomes. Keep the existing working APK as fallback.