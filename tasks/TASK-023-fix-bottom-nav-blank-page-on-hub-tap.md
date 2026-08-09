---
id: TASK-023
title: "Fix Bottom-Nav Blank Page on Hub Tap (Duplicate, Conflicting Click Handlers)"
status: RELEASED
version: v1.7.2
created: 2026-08-09
github_issue: null
---

# TASK-023: Fix Bottom-Nav Blank Page on Hub Tap (Duplicate, Conflicting Click Handlers)

## 💡 1. Idea & Proposal

- **Context**: On production (v1.7.1), the owner reported: "I was in the Math menu,
  tapped Hub, and got a blank page" — reproduced with a screenshot showing the header
  and bottom nav rendered correctly, but the entire dashboard content area empty. A
  first investigation (a clean-context Sonnet agent, per the owner's request) could not
  reproduce it after genuinely trying multiple angles — plain navigation, the live
  site, and a simulated service-worker-update-mid-session race — and found no
  corroborating error in production telemetry (Cloudflare D1) for that time window
  either. The owner then confirmed the bug reliably reproduces via a specific,
  narrower repro: open the production URL in a **new tab**, tap **Math**, tap **Hub**.
  Reproduced directly (real Chromium, live prod site, then confirmed against a local
  checkout) using exactly that sequence, but via the **bottom nav bar's** Hub button
  (`#nav-btn-hub`) specifically — not the in-panel "⬅️ Hub" back button
  (`#btn-back-from-math`), which was already covered and works correctly. The first
  investigation's Playwright reproduction attempts, like this project's whole existing
  E2E suite (TASK-019), only ever exercised the in-panel back buttons and dashboard
  cards — never the bottom nav bar — which is exactly why the bug shipped unnoticed and
  didn't reproduce under that first pass.
- **Root cause**: `app.js`'s `bindEvents()` has **two separate click handlers** for
  every bottom-nav button:
  1. A `document`-level delegate (from `379cc77`, 2026-07-26) that correctly maps
     `id === "nav-btn-hub"` → `this.showScreen("dashboard")`, `"nav-btn-math"` →
     `this.startMathRealm()`, etc.
  2. A direct `bindTouchClick()` binding on each button (from `f3dc015`/`0612b10`, the
     same day) that instead calls `this.showScreen(screenKey)`, where `screenKey` is
     the literal object key from `this.elements.navBtns` — `"hub"`, `"math"`,
     `"word"`, `"pokedex"` — **not** a real screen id (`this.elements.screens` only has
     `"dashboard"`, `"math"`, `"word"`, `"pokedex"`).
  `bindTouchClick()`'s handler calls `e.stopPropagation()`, and since it's bound
  directly on the button (target phase) while the delegate is bound on `document`
  (reached only via bubbling), handler 2 **always** runs and **always** prevents
  handler 1 from ever firing — for every button, on every tap, since the day both were
  introduced (2026-07-26, predating even the narrative-engine commit TASK-019 spent so
  much time on). For Hub specifically, `showScreen("hub")` matches no key in
  `this.elements.screens`, so `showScreen()`'s screen-toggle loop removes `.active`
  from every screen and adds it to none — a fully blank content area, exactly the
  reported symptom. For Math/Word, `showScreen("math")`/`showScreen("word")` **do**
  match real screen ids, so the screen visually switches, but `startMathRealm()`/
  `startWordRealm()` — which actually initialize the session/lesson picker — never
  run, silently leaving `mathSession` `null` and the screen showing `index.html`'s raw
  static placeholder markup (dead buttons using `data-answer-val`, not the real
  `data-math-choice` `renderMathQuestion()` would render).
- **Proposed Solution**: Route the direct `bindTouchClick()` binding through the same
  correct per-button actions the (until now unreachable) delegate always intended,
  keeping the debounce protection `bindTouchClick()` provides (which a bare delegate
  listener doesn't have) rather than deleting the direct binding outright.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-1**: Tapping the bottom nav's Hub button activates the dashboard screen
  with its realm cards visible — never leaves every `.view-screen` without `.active`.
- [x] **AC-2**: Tapping the bottom nav's Math button starts a real Math Realm session
  (`startMathRealm()`), not just a bare screen switch — the rendered answer buttons
  are `renderMathQuestion()`'s real `data-math-choice` markup, not `index.html`'s
  static placeholder.
- [x] **AC-3**: Tapping the bottom nav's Word button starts the Word Realm lesson
  picker (`startWordRealm()`), not just a bare screen switch.
- [x] **AC-4**: The permanent Playwright suite (`tests/e2e/full-main-scenario.e2e.mjs`,
  TASK-019) additionally exercises the bottom nav bar at least once — the coverage gap
  that let this bug ship unnoticed by that suite is closed, not just papered over by a
  faster `jsdom` test.

## 🧪 3. Test Coverage

- `tests/nav-bar-navigation.test.mjs` (`jsdom`) — AC-1/AC-2/AC-3. This bug is a pure
  DOM-event/state-machine defect (click bubbling + a wrong string key), fully visible
  to `jsdom` unlike TASK-018's/TASK-019's layout-only bugs, so a fast `jsdom` test is
  the right primary guard here rather than a slower real-browser one. Verified
  red-then-green: temporarily reverted the fix, confirmed 3 of 4 new tests failed with
  the exact expected assertions, restored the fix, confirmed green again.
- `tests/e2e/full-main-scenario.e2e.mjs` — AC-4: added a bottom-nav Math→Hub check at
  the end of the existing full-scenario run.

## 💻 4. Impacted Code Files

- `app.js` — `bindEvents()`'s "Nav bar" block: routes through
  `{ hub: () => showScreen("dashboard"), math: () => startMathRealm(), word: () =>
  startWordRealm(), pokedex: () => showScreen("pokedex") }` instead of a bare
  `this.showScreen(screenKey)`.
- `tests/nav-bar-navigation.test.mjs` — new `jsdom` regression suite.
- `tests/e2e/full-main-scenario.e2e.mjs` — added bottom-nav coverage (AC-4).

## 📦 5. Release & Artifacts

- **Version**: `v1.7.2`
- **Release Notes / Walkthrough**: `docs/walkthroughs/TASK-023-walkthrough.md`

## 🔍 6. Note on the First Investigation

The first pass (a separate clean-context agent) was not wasted: it correctly ruled out
the `86a3219` commit and its own TASK-019 fixes as the cause, correctly identified that
a real reproduction attempt (not just code review) was necessary, and correctly refused
to fabricate a fix for a bug it couldn't confirm — all appropriate given what it had to
work with. It reproduced the *general shape* of "app shows a blank/broken screen" is a
real, recurring risk in this codebase (this is the third such bug found across TASK-018,
TASK-019, and now this one), but the specific trigger — the bottom nav bar, as opposed
to every other navigation path already covered by the existing suite — was outside what
it happened to try. This is exactly why the owner's own, more specific repro ("new tab,
Math, then Hub" — implicitly the bottom nav, since that's what's visible in the
reported screenshot) was the piece that actually cracked it.
