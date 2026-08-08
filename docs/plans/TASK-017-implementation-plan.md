# TASK-017 Implementation Plan: Modal State Never Outlives Its Visibility

## Context

Owner tested v1.5.2 (TASK-016) live and reported "Tell me more..." still didn't work.
Queried production D1 telemetry for the latest session, confirmed on `app_version:
"v1.5.2"`: first tap opens correctly (`action.completed`), but the modal is never
closed through any of its own controls for the rest of the session, so every later tap
correctly no-ops as "already-active" — which is exactly what feels like "the button
doesn't work" from outside. A different modal (Parent Gate) opened successfully later
in the same session while Tell Me More was still internally marked active.

## Approach

1. `app.js`: add `closeAllModals(exceptElem)` iterating every known modal element
   (onboarding, parent gate, parent settings, victory, QR, Tell Me More). Call it
   unconditionally at the top of `showScreen()` (any screen navigation clears stale
   modal state) and from inside `openModal()` excluding the modal being opened (opening
   any modal always closes any other, so at most one is ever active).
2. `styles.css`: add the missing `-webkit-backdrop-filter` prefix on `.modal-overlay`
   (found while investigating; Safari correctness gap, cheap to fix alongside).
3. Bundle the owner's separate small request: `build-info.js`'s `formatBuildLabel` now
   renders the diagnostic build time in `Asia/Bangkok` local time instead of UTC.
4. Add regression tests reproducing both angles of the real telemetry finding: modal
   survives navigation without a proper close, and a second modal opening while the
   first is still active.
5. `npm test` + `npm run test:coverage:gate`, release via
   `node scripts/release.mjs --bump=patch --task=TASK-017`, push, verify production
   against the actual telemetry pattern once more if possible.

## Why query telemetry again before writing code

TASK-015 shipped on jsdom-only confidence and was found incomplete by an independent
audit. TASK-016 was verified against real telemetry before considering it complete.
This task exists *because* that verification step was followed through after TASK-016
too — the owner's live report plus telemetry, not assumption, is what identified this
as a genuinely different bug rather than a regression of the same one.
