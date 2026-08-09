# TASK-023 Walkthrough: Fix Bottom-Nav Blank Page on Hub Tap

## Result

- Fixed a real production bug: on the live site (v1.7.1), tapping the bottom nav's Hub
  button after entering Math Realm produced a completely blank content area (header and
  bottom nav rendered, everything between empty).
- Root cause: `app.js`'s `bindEvents()` registered **two** click handlers for every
  bottom-nav button — a correct `document`-level delegate, and a second, direct
  `bindTouchClick()` binding that called `this.showScreen(screenKey)` with `screenKey`
  taken from `navBtns`'s own object keys (`"hub"`/`"math"`/`"word"`/`"pokedex"`) instead
  of a real screen id (`this.elements.screens` only has `"dashboard"`, not `"hub"`).
  `bindTouchClick()`'s handler calls `stopPropagation()`, so the direct binding always
  won — for every bottom-nav tap, since both handlers were introduced the same day,
  2026-07-26 (`379cc77`/`f3dc015`/`0612b10`), well before the narrative-engine commit
  TASK-019 spent so much effort investigating. For Hub, `showScreen("hub")` matches no
  screen, so `showScreen()`'s toggle loop cleared `.active` from every screen and set it
  on none. For Math/Word, the screen *did* switch (their keys happen to be valid), but
  `startMathRealm()`/`startWordRealm()` never ran, silently leaving the session/lesson
  picker uninitialized behind `index.html`'s raw static placeholder markup.
- Fixed by routing the direct binding through the same correct per-button actions the
  (until now unreachable) delegate always intended, while keeping the debounce
  protection `bindTouchClick()` provides.

## Investigation timeline

1. The owner first asked for a fresh, clean-context Sonnet agent to investigate. That
   agent could not reproduce the bug after genuinely trying — plain navigation, the
   live site, a simulated service-worker-mid-session-update race — and checked real
   production telemetry (Cloudflare D1) for the deploy window with no corroborating
   error either. It correctly declined to fabricate a fix, which was the right call
   given what it had tried.
2. The owner then gave a more specific repro: "open the link in a new tab, tap Math,
   tap Hub" — which, from the screenshot, meant the **bottom nav bar** specifically,
   not the in-panel "⬅️ Hub" back button both the first investigation and this
   project's entire existing E2E suite (TASK-019) had exclusively exercised until now.
3. Reproduced directly: drove real Chromium against the live production site first
   (`https://usov-andrey.github.io/lucky-learning-world/`), then confirmed against a
   local checkout of the current code. `document.querySelector('.view-screen.active')`
   returned `null` after tapping `#nav-btn-hub` — every screen's `display` was `none`.
   Traced to the duplicate-handler bug above by reading `bindEvents()`'s nav-bar
   binding block and the global delegate side by side, then confirmed with
   `git blame`/`git log -S` that both predate `86a3219` entirely — this was never a
   TASK-019-era regression.
4. Verified the fix removes the bug for all four bottom-nav buttons (Hub/Math/Word/
   Pokédex) directly in a real browser against a local server, both via manual
   JS-driven clicks and the new automated tests below, before writing anything up.

## Why `jsdom` was the right primary test here (unlike TASK-018/TASK-019)

This bug is a pure DOM-event/state-machine defect — click bubbling, `stopPropagation()`,
and a wrong string key — not a real layout/paint issue like TASK-018's nested-modal bug
or a real-timer-scheduling issue like several of TASK-019's. `jsdom` fully supports
click dispatch and bubbling, so `tests/nav-bar-navigation.test.mjs` (`jsdom`) is the
correct, fast primary regression guard; a Playwright test wasn't required to *catch*
this class of bug, only to *have exercised the button* at all — which is why AC-74 also
adds one bottom-nav check to the existing Playwright suite, closing the actual gap.

## Verification

- `npm test`: 126/126 green (was 122; +4 for the new nav-bar test file).
- `npm run test:e2e`: green, including the new bottom-nav Math→Hub check.
- `tests/nav-bar-navigation.test.mjs` verified red-then-green: temporarily reverted the
  fix (`navBarActions[screenKey]()` → `this.showScreen(screenKey)`), confirmed 3 of the
  4 new tests failed with the exact expected assertion messages (the 4th, Pokédex,
  passes either way since `"pokedex"` happens to be a valid screen id — noted in the
  test file itself), restored the fix, confirmed all 4 green again.
- Manually re-verified the exact original repro (new tab → Math → Hub, bottom nav) in a
  real browser against both the live production site (pre-fix, reproduced) and a local
  server running the fixed code (post-fix, resolved) before writing this up.

## Process note

The first investigation's inability to reproduce wasn't a failure of effort — it
correctly ruled out the commit and code paths it had reason to suspect, and correctly
refused to guess. What actually cracked this was the owner's own follow-up: a tighter,
more specific repro description ("new tab, Math, then Hub") that pointed at a UI
element — the bottom nav bar — no prior investigation or test in this project had ever
touched. Worth remembering for next time: when a first pass can't reproduce a real
report, the most useful next question isn't "try harder," it's "what exact button/
element did you tap" — this project has three now-fixed bugs (TASK-018, several in
TASK-019, and this one) that all trace to one specific, previously-unexercised
interaction path, not to the code's general correctness.

## Release-process note

This release's own `scripts/release.mjs` "Mirrored plan"/"Mirrored walkthrough" step
copies the root `implementation_plan.md`/`walkthrough.md` files into
`docs/plans/`/`docs/walkthroughs/` under the *current* task's filename, regardless of
their actual content — it does not generate them from the task file. Since this
task's session never touched the root copies (only wrote directly under
`docs/plans/`/`docs/walkthroughs/`), the release script silently overwrote this exact
file and `docs/plans/TASK-023-implementation-plan.md` with TASK-019's stale content
under TASK-023's name. Caught and fixed in a same-day follow-up commit; the corrected
lesson for future tasks in this repo: update the root `implementation_plan.md`/
`walkthrough.md` copies *before* running `scripts/release.mjs`, not only the
`docs/`-prefixed ones.
