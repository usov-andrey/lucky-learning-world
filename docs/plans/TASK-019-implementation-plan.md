# TASK-019 Implementation Plan: Permanent Playwright E2E Suite + Fix the ×7 Math Realm Crash Root Cause

## Goal

Build a permanent Playwright suite that drives one continuous real-Chromium session
through the full main scenario — onboarding, Math Realm ×7, all three Word Realm
modes, Pokédex — as a regression guard for the production incident where Lucky's
Math Realm ×7 session dropped back to the dashboard around question 8. Fix whatever
real bugs the suite finds along the way, since the whole point of driving genuine
clicks instead of calling `AppController` methods directly (like the existing
`jsdom`-based `*-e2e.test.mjs` tests do) is to catch exactly this class of failure.

## Steps

1. Add `tests/e2e/static-server.mjs` — a minimal local static file server (no new
   dependency; the project stays zero-build) so Playwright can load `index.html` over
   `http://` the same way `python -m http.server` would.
2. Add `tests/e2e/full-main-scenario.e2e.mjs`, seeding `localStorage` with every math
   level unlocked (mirrors a real returning player's save) and driving: onboarding →
   Math Realm ×7 (full 12-question session, one deliberate wrong answer at question 4)
   → Word Realm Learn (forward/back through every word) → Test mode (one wrong +
   correct digital submissions, paper reveal) → Game/Tiles mode played to completion →
   Pokédex. Assert zero uncaught exceptions, zero unexpected console errors, zero
   unexpected failed network requests, and strict 1→12 question progression with no
   unexpected return to the dashboard.
3. Add `npm run test:e2e`, kept separate from `npm test`/the coverage gate (needs a
   Chromium binary, runs slower).
4. Iterate against real failures the suite surfaces — diagnosed with a throwaway debug
   script (`tests/e2e/debug-math-entry.mjs`, deleted once done) that traced app state
   before/after each interaction — rather than guessing:
   - Fix the loop-termination bug in the test itself (the app never clears
     `#math-answers-grid` on session end, so "button count is 0" is not a valid exit
     condition).
   - Fix `handleMathAnswer()` calling `answerFirstTry(session)` without the tapped
     value on both branches (correct answers never advanced; wrong answers never
     legitimately set up their own correction).
   - Fix `finishMathSession()`'s `computeLevelOutcome`/`applyLevelOutcome` argument
     mismatches and the nonexistent `outcome.rewardEligible` field (level completion
     never scored/unlocked/rewarded correctly).
   - Fix all three reward call sites assigning `applyReward()`'s
     `{ collection, appliedRewardOutcomeIds }` return value directly to
     `this.collection` instead of destructuring it (corrupted the pet collection into
     a non-array object on the first reward ever granted); add a self-healing read in
     `loadCollection()` for already-corrupted saves.
   - Fix the victory modal: add the missing `#reward-pet-img`/`#reward-pet-name`
     elements to `index.html` (a `.reward-pet-img` CSS rule already existed for an
     element that was never added), and complete `openVictoryModal()`'s image-fallback
     chain to include `art.src`.
   - Mute all audio (`--mute-audio` plus stubbing `speechSynthesis.speak` and
     `HTMLMediaElement.prototype.play`) after the owner reported the suite was
     audible — Windows routes `speechSynthesis` through native SAPI, bypassing
     `--mute-audio` alone.
5. Update `ACCEPTANCE_CRITERIA.md` (§23, AC-59 through AC-69) and this task file with
   the full, accurate account of what was found — five of the seven bugs trace to the
   same commit (`86a3219`, the narrative-engine refactor, 2026-07-28) — including the
   root-cause analysis for why this is now the leading explanation for the reported
   crash, not merely incidental findings.
6. Run `npm test` (full unit suite) and `npm run test:e2e` clean before release; bump
   version; write the walkthrough.

## Files Touched

- `app.js` (see TASK-019 §4 for the full per-function breakdown)
- `index.html` (victory modal markup)
- `tests/e2e/full-main-scenario.e2e.mjs` (new)
- `tests/e2e/static-server.mjs` (new)
- `package.json` (`test:e2e` script)
- `ACCEPTANCE_CRITERIA.md`, `tasks/TASK-019-*.md`, `tasks/INDEX.md`
