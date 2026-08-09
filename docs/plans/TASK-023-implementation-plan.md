# TASK-023 Implementation Plan: Fix Bottom-Nav Blank Page on Hub Tap

## Goal

Fix a real production bug reported by the owner: on the live site, entering Math Realm
and then tapping the bottom nav bar's Hub button produced a completely blank content
area. A first investigation (a separate clean-context agent) could not reproduce it
and found no corroborating telemetry; the owner then supplied a tighter repro ("new
tab, tap Math, tap Hub") that pointed specifically at the bottom nav bar, a UI path
this project's entire existing test suite (including TASK-019's Playwright suite) had
never exercised.

## Steps

1. Reproduce directly in a real browser: first against the live production site, then
   against a local checkout of the current code, using `document.querySelector(
   '.view-screen.active')` and `getComputedStyle(...).display` to confirm every screen
   ends up inactive/hidden after tapping `#nav-btn-hub`.
2. Trace the root cause by reading `app.js`'s `bindEvents()` nav-bar binding block
   against the pre-existing global click delegate, and confirm via `git blame`/
   `git log -S` that both predate the `86a3219` commit TASK-019 investigated — this is
   an older, unrelated bug, not a regression from that work.
3. Fix: route the direct `bindTouchClick()` nav-bar binding through the same
   per-button actions (`startMathRealm()`, `startWordRealm()`, `showScreen(...)`) the
   delegate always intended, instead of a bare `showScreen(screenKey)` using the wrong
   key.
4. Add `tests/nav-bar-navigation.test.mjs` (`jsdom` — this is a pure DOM-event/
   state-machine bug, fully visible to `jsdom`, unlike TASK-018's/TASK-019's
   layout/timing bugs) covering all four bottom-nav buttons. Verify red-then-green by
   temporarily reverting the fix.
5. Add one bottom-nav interaction to the existing Playwright suite
   (`tests/e2e/full-main-scenario.e2e.mjs`), closing the actual coverage gap that let
   this ship unnoticed — not just adding a faster test alongside an unchanged gap.
6. Manually re-verify the exact original repro (new tab → Math → Hub) against the live
   production site (pre-fix) and a local server (post-fix) before writing this up.
7. `npm test` + `npm run test:e2e` clean; bump version; release.

## Files Touched

- `app.js` — `bindEvents()`'s nav-bar binding block.
- `tests/nav-bar-navigation.test.mjs` (new).
- `tests/e2e/full-main-scenario.e2e.mjs` (bottom-nav check added).
- `ACCEPTANCE_CRITERIA.md` §24, `tasks/TASK-023-*.md`, `tasks/INDEX.md`.
