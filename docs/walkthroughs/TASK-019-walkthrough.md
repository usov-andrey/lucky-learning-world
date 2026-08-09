# TASK-019 Walkthrough: Permanent Playwright E2E Suite + Fix the ×7 Math Realm Crash Root Cause

## Result

- Added a permanent Playwright suite (`tests/e2e/full-main-scenario.e2e.mjs`, run via
  `npm run test:e2e`) that drives one continuous real-Chromium session through the
  entire main scenario, in order: onboarding → Math Realm ×7 (all 12 questions,
  mixing right and wrong answers, question 8 explicitly asserted) → Word Realm
  Learn/Test(digital+paper)/Game(Tiles) played to completion → Pokédex. It fails on
  any uncaught exception, unexpected `console.error`, or unexpected failed network
  request, and asserts the math progress counter never skips, resets, or unexpectedly
  drops back to the dashboard. This resolves the open decision TASK-018 explicitly
  left unresolved: adopting Playwright permanently, not just as a one-time diagnostic.
- Building it — by driving genuine clicks and typed input rather than calling
  `AppController` methods directly, unlike the existing `jsdom`-based
  `*-e2e.test.mjs` tests — surfaced **seven** real, previously-undetected bugs, all
  now fixed. **Five trace to the exact same commit**, `86a3219` (2026-07-28, the
  narrative-engine refactor), which rewrote `handleMathAnswer()`,
  `finishMathSession()`, and `finishSpellingSession()` and dropped or mismatched
  arguments each one depended on:
  1. Correct Math Realm answers never actually advanced the session —
     `answerFirstTry()` was called without the tapped value, so its own internal
     correctness check always failed, silently treating every correct tap as a
     pending correction. A second correct tap on the same (visually unchanged)
     question then threw an uncaught exception.
  2. Wrong answers never legitimately set up the correction `confirmCorrection()`
     later relied on — the wrong branch never called `answerFirstTry()` at all.
  3. Finishing a level session never scored/unlocked/rewarded correctly —
     `computeLevelOutcome()` was called with an extra argument that shifted a level
     ID string into its `settings` parameter (accuracy became `NaN`, stars always
     `0`), and the reward branch checked a field name that doesn't exist on the
     function's real return shape.
  4. Granting *any* reward corrupted `this.collection` into a non-array wrapper
     object — all three call sites assigned `applyReward()`'s full return value
     directly instead of destructuring `.collection` out of it. This is what the
     suite caught directly: the Pokédex read "undefined / 15".
  5. The victory modal was unreachable — `index.html` never had the
     `#reward-pet-img`/`#reward-pet-name` elements `openVictoryModal()` needed
     (despite a CSS rule already existing for them), so it threw before opening;
     even fixed, its image-fallback chain was missing `art.src`, the field that
     actually holds a character's image in this codebase.
  Two further, unrelated, real bugs were also found and fixed:
  6. Math correction feedback and spoken audio read a `q.answer` property that is
     never set on a question object, showing/saying "...equals undefined".
  7. A new player's chosen starter pet was never actually saved — `completeOnboarding()`
     read `dataset.starterPet`, but the HTML only ever sets `data-starter`.
- **Why this is now the leading explanation for "kicked back to the dashboard around
  question 8"**: bug 1 makes correct answers look successful while silently not
  advancing and can throw on a second correct tap; hard-drill ×7 sessions specifically
  serve Lucky the facts she struggles with most, so a real session mixes genuine
  wrong answers (which, via bug 2, can *also* throw) with correct answers in close
  succession — exactly the condition under which the accumulated silently-swallowed
  exceptions and stale state from bugs 1–2, compounded by bugs 3–5 (each one
  `.property` access away from throwing on `undefined`), are most likely to hit a
  state some render call cannot handle. This is not proof of the single exact
  trigger — it wasn't possible to replay Lucky's exact session — but it is a far
  stronger, far more specific account than "maybe the tablet reclaimed the tab,"
  which was this task's first-pass conclusion before the reward/progression bugs were
  found.

## Why `jsdom` never caught any of this

Every one of the seven bugs requires something `jsdom` (what every other test in this
repo runs against) cannot do: run real `setTimeout`-scheduled re-renders against real
DOM mutations, produce a real uncaught exception from a real click event, or make a
real (and, here, really-failing) network request. The existing `jsdom`-based
`*-e2e.test.mjs` tests call `app.startWordRealm()`, `app.completeOnboarding()`, etc.
directly — which exercises the methods, but never the click handlers, never the
timers, and never a state where a genuinely wrong click could be dispatched by a real
user through a real button. TASK-018 already established this exact gap for layout
bugs; this task confirms it applies just as hard to state-machine/timing bugs.

## Verification

- `npm test`: all 119 tests green throughout every fix in this task.
- `npm run test:e2e`: green — full main scenario, all game modes, zero console errors,
  zero uncaught exceptions, zero unexpected failed requests, question progress
  strictly 1→12 including question 8, victory modal opens cleanly with a real pet
  image and name on both the math and spelling reward paths, Pokédex renders a real
  `N / 15` count, starter pet saved correctly.
- `tests/modal-overlay-structure.test.mjs` (TASK-018's regression guard) re-run after
  editing `index.html`'s victory modal markup: still green — no modal ended up nested
  inside another.

## Process notes

- The suite is intentionally seeded with every math level pre-unlocked (mirrors a
  real returning player's save) rather than grinding ×6 first, to go straight to the
  exact level — ×7 — Lucky was playing.
- Diagnosing the two silent hangs (an infinite loop in the test's own math-loop exit
  condition, and later a genuinely stuck `answerFirstTry` state) used a small
  throwaway debug script driving the same flow with a short per-action timeout and
  verbose state logging — much faster to iterate on than re-running the full ~75s
  suite blind each time. It was deleted once its job was done; it was never a
  permanent artifact.
- At the owner's request, all TTS/audio playback is muted for every run:
  `--mute-audio` alone is insufficient on Windows, since `window.speechSynthesis`
  routes through the native SAPI/OneCore engine rather than Chromium's own audio
  pipeline — both `speechSynthesis.speak` and `HTMLMediaElement.prototype.play` are
  stubbed to no-ops via `page.addInitScript()`.
- `console.error` filtering for the CORS-blocked telemetry endpoint is done by
  ignoring the browser's generic "Failed to load resource" text outright and instead
  asserting on actual failed-request URLs (`page.on("requestfailed")`/`"response"`)
  — the generic console text carries no URL, so text-matching it can't distinguish a
  blocked telemetry ping from a real missing asset the way checking the request URL
  directly can.
