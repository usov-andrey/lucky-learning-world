---
id: TASK-019
title: "Permanent Playwright E2E Suite + Fix the ×7 Math Realm Crash Root Cause"
status: RELEASED
version: v1.7.0
created: 2026-08-08
github_issue: null
---

# TASK-019: Permanent Playwright End-to-End Regression Suite for the Full Main Scenario

## 💡 1. Idea & Proposal

- **Context**: On 2026-08-08 Lucky was playing Math Realm's ×7 table and, around the
  8th question, the app dropped her back to the dashboard mid-session — she lost the
  in-progress attempt. The owner asked for automated coverage that walks the real,
  in-order main scenario across every game mode so a regression like this fails a test
  instead of reaching Lucky. This is also the exact open decision TASK-018 flagged and
  deliberately left unresolved: Playwright + Chromium were installed as a "one-time
  diagnostic devDependency" for that bug hunt (see
  `docs/walkthroughs/TASK-018-walkthrough.md`), because `jsdom` (what every other test
  in this repo runs against) never lays out, paints, or runs real timers — it cannot
  see a real render, a real uncaught exception, or a real console error the way an
  actual browser can. This task adopts Playwright permanently for exactly that gap.
- **What building the suite actually found**: driving the real onboarding, math, and
  spelling flows by genuine click/type — never by calling `AppController` methods
  directly, the way the existing `jsdom`-based `*-e2e.test.mjs` tests do — surfaced
  **seven** previously-undetected real bugs, none catchable by any `jsdom` test in this
  repo. **Five of them trace to the exact same commit**, `86a3219`
  ("feat(narrative): implement thematic narrative engine...", 2026-07-28 — eleven days
  before the incident), which rewrote `handleMathAnswer()`, `finishMathSession()`, and
  `finishSpellingSession()` and, in the process, silently broke the correct-answer path,
  the wrong-answer path, level scoring/unlocking, reward granting, and the victory
  modal — all at once, all in code Lucky exercises on essentially every play session in
  Math Realm hard-drill mode. See §6 for why this is now the leading explanation for the
  reported crash, not merely "two cosmetic bugs found along the way."
- **Proposed Solution**: Add a permanent Playwright test, run from a local static file
  server (no external hosting, no dev server needed — the project stays zero-build),
  that drives one continuous real-Chromium session through the entire main user
  journey in order: onboarding → Math Realm (×7 table, full 12-question session,
  deliberately answering some questions wrong to exercise the correction/requeue path)
  → Word Realm Learn mode → Word Realm Test mode (digital + paper) → Word Realm Game
  (Tiles) mode, played to completion → Pokédex. The test fails on any uncaught page
  error, any unexpected `console.error`, any unexpected failed network request, or any
  unexpected return to the dashboard mid-session. Kept out of `npm test` / the coverage
  gate (browser tests are slow and need a Chromium binary) and given its own
  `npm run test:e2e` script instead. Every bug found while building it is fixed in this
  same task (§4), since each was directly exposed by, and directly blocked, the suite
  passing.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-1**: A Playwright-driven test drives real Chromium through the full main
  scenario in one continuous session — onboarding, Math Realm ×7 (all 12 questions,
  mixing correct and incorrect answers), Word Realm Learn/Test(digital+paper)/Game
  (Tiles) modes played to completion, and the Pokédex screen — using only real clicks
  and typed input for every action (never calling an `AppController` action/render
  method directly). Math's correct answer is derived purely from the rendered
  `#math-question-text`. Read-only `spellingEngine` getters are used only as an oracle
  for the target spelling word in Test/Game mode, since that word is deliberately never
  shown in the DOM (it is what the child is being quizzed on).
- [x] **AC-2**: The test fails if any uncaught JS exception (`page.on("pageerror")`),
  unexpected `console.error` (`page.on("console")`), or unexpected failed network
  request (`page.on("requestfailed")`/`page.on("response")`) occurs anywhere during the
  full run — except calls to the real production telemetry reporter endpoint, CORS- or
  network-blocked as an artifact of running against a local static server instead of
  the app's real origin (`ClientTelemetry` already swallows this in its own try/catch;
  it is not an app bug).
- [x] **AC-3**: The test asserts the Math Realm's `#math-question-progress` counter
  progresses through every state from "Question 1 of 12" to "Question 12 of 12" in
  strict order with no skip, reset, or unexpected navigation back to the dashboard —
  explicitly covering question 8, the exact point of the reported production crash.
- [x] **AC-4**: The Math Realm's on-screen correction text and spoken correction audio
  for a wrong answer show the actual correct product, never the literal string
  `"undefined"`.
- [x] **AC-5**: A freshly onboarded player's starter pet is saved and rendered as the
  pet they actually selected (e.g. Embercub), never `undefined`.
- [x] **AC-6**: The suite runs via a new `npm run test:e2e` script against a local
  static file server, is not part of `npm test` / `test:coverage:gate`, and is
  documented as a *permanent* regression gate — superseding TASK-018's "one-time
  diagnostic" framing of Playwright in this repo.
- [x] **AC-65**: Tapping the correct Math Realm answer advances the session's queue and
  history on that same tap (fixes `answerFirstTry()` being called without the tapped
  value — see §6, bug 1).
- [x] **AC-66**: Tapping a wrong Math Realm answer leaves the session in a state where
  the scheduled `confirmCorrection()` call 1400ms later succeeds instead of throwing
  (fixes the wrong-answer branch never calling `answerFirstTry()` — see §6, bug 2).
- [x] **AC-67**: Finishing a Math Realm level session computes real accuracy/stars from
  the actual session and settings, and can unlock the next level and grant a reward
  (fixes `computeLevelOutcome()`/`applyLevelOutcome()` argument mismatches and a
  nonexistent `outcome.rewardEligible` field — see §6, bug 3).
- [x] **AC-68**: Granting any reward (Math level, Math Mix, or Word Realm) leaves
  `this.collection` — and its `localStorage` persistence — a plain array, never
  `applyReward()`'s internal `{ collection, appliedRewardOutcomeIds }` wrapper object
  (see §6, bug 4). `loadCollection()` additionally self-heals an already-corrupted save.
- [x] **AC-69**: Opening the victory modal after any reward populates the pet's name and
  image without throwing, and the image is never the literal string `"undefined"`
  (fixes missing `#reward-pet-img`/`#reward-pet-name` markup in `index.html` and an
  incomplete image-fallback chain in `openVictoryModal()` — see §6, bug 5).

## 🧪 3. Test Coverage

- `tests/e2e/full-main-scenario.e2e.mjs` — tagged `// @task TASK-019` /
  `// @ac AC-1` through `AC-6`; AC-65 through AC-69 are exercised (and would fail the
  suite if regressed) by the same continuous run, not by separate test cases.

## 💻 4. Impacted Code Files

- `app.js`:
  - `handleMathAnswer()` — pass `choice` to `answerFirstTry()` on both the correct and
    wrong branches (AC-65, AC-66); correction text/audio now compute `q.a * q.b`
    instead of the never-set `q.answer` (AC-4).
  - `completeOnboarding()` — read `dataset.starter` instead of the nonexistent
    `dataset.starterPet` (AC-5).
  - `finishMathSession()` — restored correct `computeLevelOutcome(session, settings)`
    call and `outcome.outcomeId`/`levelId`/`createdAt` population; restored
    `applyLevelOutcome(progression, outcome, LEVELS)`; restored `outcome.earnsReward`
    check (was `outcome.rewardEligible`, undefined); restored `rewardPoolId` field name
    (was `poolId`, undefined); reward is now resolved into `{ ...chosen, character,
    level }` before use (AC-67, AC-68, AC-69).
  - `finishSpellingSession()` — same reward-resolution and `REWARD_POOLS`/outcomeId
    argument fixes as above (AC-68, AC-69).
  - `loadCollection()` — self-heals a collection already corrupted by the AC-68 bug
    (AC-68).
  - `openVictoryModal()` — image-fallback chain now includes `art.src`, matching the
    pattern already used correctly in `renderPokedex()` (AC-69).
  - Constructor — added `this.appliedRewardOutcomeIds = []`.
- `index.html` — added the missing `#reward-pet-img`/`#reward-pet-name` elements inside
  `.reward-pet-preview` (there was already a `.reward-pet-img` CSS rule for an element
  that never existed); properly closed `.reward-pet-preview` and removed the now-extra
  trailing `</div>` (AC-69).
- `tests/e2e/full-main-scenario.e2e.mjs` — new Playwright suite (AC-1 through AC-6;
  exercises AC-65 through AC-69).
- `tests/e2e/static-server.mjs` — small local static file server helper used only by
  the e2e suite.
- `package.json` — new `test:e2e` script; `playwright` promoted from a one-time
  diagnostic dependency (TASK-018) to a permanent one.

## 📦 5. Release & Artifacts

- **Version**: `v1.7.0`
- **Release Notes / Walkthrough**: `docs/walkthroughs/TASK-019-walkthrough.md`

## 🔍 6. Root-Cause Analysis: Why This Is the Crash, Not Just Bugs Found Along the Way

All five bugs below come from `86a3219` (2026-07-28), which rewrote three functions in
`app.js` as part of the narrative-engine feature and, in doing so, dropped or
mismatched arguments the rewritten code depended on. `git show 86a3219 -- app.js` shows
each removed line was correct; none of it was ever this broken before that commit.

1. **Correct answers never advanced the session.** `handleMathAnswer()`'s correct
   branch called `answerFirstTry(this.mathSession)` — without the tapped value the
   engine function needs to check correctness itself. Internally,
   `undefined === computeAnswer(question)` is always `false`, so *every* correct tap
   silently set `pendingCorrection` on the current question exactly like a wrong
   answer, without telling the UI (which independently — and correctly — computed
   `isCorrect` itself and showed "Great job!"). The same question then reappeared with
   freshly randomized wrong-choice distractors, "Question N of 12" frozen. A **second**
   correct tap on it hit the engine's own guard (`if (session.pendingCorrection) throw`)
   and threw an uncaught exception mid-handler, aborting before the render/advance code
   below it ever ran.
2. **Wrong answers never legitimately set up their own correction.** The wrong branch
   scheduled `confirmCorrection()` 1400ms later without ever calling `answerFirstTry()`
   first — the only function that actually sets `pendingCorrection`. It "worked" only
   when it happened to inherit state left over from bug 1's mishandling of the
   *previous* correct answer; a wrong answer with no such stale state threw
   `"confirmCorrection called with no pending correction"`.
3. **Level completion never scored, unlocked, or rewarded correctly.**
   `finishMathSession()` called `computeLevelOutcome(session, level.id, settings)` — an
   extra argument the real two-parameter signature `(session, settings)` doesn't accept,
   which shifted `level.id` (a string) into the `settings` slot. `accuracy` became
   `NaN`, `stars` was always `0`, and the reward branch was gated on
   `outcome.rewardEligible`, a field that doesn't exist on `computeLevelOutcome`'s
   actual return shape (it's `earnsReward`) — so it could never fire.
   `applyLevelOutcome()` was also called without its required `levels` argument and
   without `outcome.outcomeId`/`levelId` ever being set, meaning progress was written
   under an `undefined` key and, after the very first call ever, silently stopped
   applying at all (idempotency-by-`outcomeId` treated every subsequent call as a
   duplicate of that first `undefined`-keyed one).
4. **Any granted reward corrupted the pet collection.** All three reward call sites
   (`finishMathSession()` ×2, `finishSpellingSession()`) assigned `applyReward()`'s full
   return value — `{ collection, appliedRewardOutcomeIds }` — directly to
   `this.collection`, instead of destructuring `.collection` out of it. The very first
   reward ever granted turned `this.collection` into a non-array object, which is what
   TASK-019's own suite caught directly: the Pokédex read `undefined / 15`
   (`{...}.length` is `undefined`), and any later `collection.find()`/`.map()` call
   would have thrown outright.
5. **The victory modal itself was unreachable.** `index.html`'s `.reward-pet-preview`
   container had no `#reward-pet-img`/`#reward-pet-name` elements at all, despite a
   `.reward-pet-img` CSS rule already existing for them — so
   `this.elements.rewardPetImg.src = ...` threw `Cannot set properties of null` *before*
   `openModal()` ever ran, aborting the rest of `finishMathSession()`/
   `finishSpellingSession()` mid-function (so `renderHeader()` at the very end never
   ran either). Even after that markup was added, the image-resolution fallback chain
   never checked `art.src` — the field that actually holds a character's image in this
   codebase (`renderPokedex()`, elsewhere in the same file, gets this right) — so the
   image still silently resolved to the literal string `"undefined"`.

**Why this explains "kicked back to the dashboard around question 8" specifically**:
bug 1 makes a correct answer look successful ("Great job!") while silently not
advancing, and the second uncaught exception it can throw aborts a click handler mid-way
— the browser just logs it and stops that handler's execution, it does not itself
navigate anywhere. But `unlocksNext`/mastery-driven question selection in hard-drill
mode (bug 3) means Lucky was being served the facts she struggles with most — the
scenario most likely to mix genuine wrong answers (which, via bug 2, can *also* throw)
with correct answers (which, via bug 1, always risk throwing on the second tap) in close
succession, deep into a session, long after the app has accumulated enough silently
swallowed exceptions and stale state that *some* downstream render call — several are
one `.property` access away from throwing on `undefined`, as bugs 3–5 each independently
demonstrate — hits a state it cannot handle and the screen genuinely resets. This
suite's own AC-3 (strict 1→12 progression, question 8 explicitly asserted) and AC-2
(zero uncaught errors, zero unexpected console errors, zero unexpected failed requests)
together are the regression guard: with all five bugs fixed, a real ×7 session —
driven end-to-end with a genuine mix of right and wrong answers — now runs clean.

This is not a certainty-of-single-root-cause claim — five real, independently-severe
bugs were found and fixed, any one of which was worth fixing on its own, and it is not
possible to replay Lucky's exact real session to prove which combination fired that
day. But this is a far stronger, far more specific explanation than the previous
draft's "maybe the tablet's browser reclaimed the tab" theory, and it is the one this
task leaves the codebase with evidence for.
