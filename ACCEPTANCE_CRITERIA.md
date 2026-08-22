# Lucky's Learning World — Master Acceptance Criteria (v2.0.1-v19.1)

This document contains the official, binding Acceptance Criteria for development tasks and feature releases in **Lucky's Learning World**. Every criterion listed below is directly mapped to automated test suites (`tests/*.test.mjs`).

---

## 1. 📢 Multi-Version Announcement & Toast Banner Rules

- **[AC-1.1] Legacy Instance Banner Display**:
  - When running a legacy version instance (`v1` / `isLatestVersion = false`), the Version Update Toast Banner (`#toast-version-update`) MUST be displayed on the main dashboard screen for onboarded users.
  - Clicking `Try New Version ➔` MUST set `lucky_release_toast_dismissed = APP_VERSION`, hide the toast banner, and directly navigate to the new version URL (`../v2/` or `window.NEW_VERSION_URL`).
  - NO Parent PIN gate prompt is required when clicking `Try New Version ➔`.

- **[AC-1.2] Latest Instance Banner Suppression (Critical)**:
  - When running on the latest version instance (`v2` / `isLatestVersion = true`), the Version Update Toast Banner (`#toast-version-update`) MUST ALWAYS be suppressed (`display: none`).
  - An instance running the latest version MUST NEVER suggest trying a new version to the user.

- **[AC-1.3] Version Dismissal Persistence**:
  - Dismissing the toast banner (via `✖` or `Try New Version ➔`) records `localStorage["lucky_release_toast_dismissed"] = APP_VERSION`. The toast banner will remain hidden for that specific release version on subsequent visits.

---

## 2. 🧮 Math Realm & Level Selector Rules

- **[AC-2.1] Valid Level Title Fallbacks**:
  - Level selection chips MUST render valid level titles (e.g. `×6`, `🔒 ×7`, `🔒 ×8`, `🔒 ×9`, `🔒 ×10`, `🔒 Math Mix (×6–×10)`).
  - Selector buttons MUST NEVER render string literal `undefined` or broken template values.

- **[AC-2.2] Level Progression & Stars**:
  - Star ratings (1-3 ⭐) MUST follow accuracy thresholds defined in `settings.js`.
  - Unlocking level N+1 requires completing level N with at least 2 stars.

---

## 3. 🐾 Pokédex Sanctuary & Pet Image Resolution Rules

- **[AC-3.1] Valid Image Path Resolution**:
  - Pet cards MUST resolve valid image paths using `pres.image || pres.assetPath || pres.art.src || char.art.src || pokemon/${pokemon}.png`.
  - Pet cards MUST NEVER request non-existent files (such as `assets/silhouette_unknown.svg`), resulting in broken image icons or HTTP 404 errors.

- **[AC-3.2] Locked Pet Silhouette Presentation**:
  - Locked pets MUST display their valid sprite with dark silhouette styling (`.pet-card.locked img { filter: grayscale(1) opacity(0.35); }`).
  - Unlocked/Rescued pets MUST be sorted to the top of the grid with vibrant card styling, level badges, and full-color art.

---

## 4. 🔒 Parent Security & Hover Version Tooltip Rules

- **[AC-4.1] Hover Version Tooltip**:
  - Hovering cursor over the header Parent Mode button (`#btn-parent-mode-header`) MUST display the current app version in the native browser title tooltip (e.g. `Parent Protected Settings (v2.0.1-v19.1)`).
  - The version string MUST be inspectable without entering the Parent PIN.

- **[AC-4.2] Parent PIN Security**:
  - Access to Parent Settings modal requires entering the valid 4-digit PIN (`1234` default).

---

## 5. 🔁 Cross-Version Physical Folder Navigation

- **[AC-5.1] Physical Coexistence**:
  - `v1/` and `v2/` exist as physical standalone subdirectories on GitHub Pages.
  - `v1/` contains cross-link CTA to `./v2/`.
  - `v2/` contains Parent Settings button `⬅️ Switch to Legacy Version (v18)` pointing to `../v1/`.

---

## 6. 📊 Automated Client Telemetry & Telemetry Reporter System

- **[AC-6.1] Automated Client Telemetry & Diagnostics Logger**:
  - The application MUST initialize an automated client telemetry logger (`telemetry.js`) on page load.
  - The telemetry module MUST capture uncaught window errors (`window.onerror`), unhandled promise rejections, console errors, and UI lifecycle events (e.g. version checks, DOM element presence).
  - Telemetry logs MUST be persisted in `localStorage["lucky_telemetry_logs"]` (sliding log buffer of last 100 entries) so full runtime logs are automatically available for inspection and diagnostic reporting without manual user intervention.

---

## 7. 📖 Spelling Learn Mode Navigation Guard Rules

- **[AC-7.1] Disabled Back Button Guard on First Item**:
  - When viewing the very first item in Spelling Learn Mode (`learnIndex === 0`, e.g. Word 1 of 18), the Back button (`#btn-learn-prev`) MUST be disabled (`disabled = true`, `opacity: 0.35`, `pointer-events: none`).
  - When viewing any subsequent item (`learnIndex > 0`), the Back button MUST be enabled (`disabled = false`, `opacity: 1`, `pointer-events: auto`).

---

## 8. 🧪 Code Coverage Measurement & AC Traceability Rules

- **[AC-8.1] Coverage Threshold Gate**:
  - `npm run test:coverage:gate` MUST execute all test suites with V8 coverage excluding `tests/**`, `v1/**`, `v2/**`, `node_modules/**`.
  - The test runner MUST exit non-zero if total coverage for core logic (`engine/**` and `content/**`) falls below **75% lines / 60% branches / 65% functions**.

- **[AC-8.2] Test Traceability & Legacy Waiver**:
  - Every `tests/*.test.mjs` file created or modified after TASK-002 MUST contain at least one `// @task TASK-XXX` annotation and one `// @ac AC-Y` (or `AC-Y.Z`) annotation matching regex `AC-\d+(\.\d+)?`.
  - Legacy untagged test files are strictly restricted to the TASK-002 waiver list (`tasks/TASK-002-code-coverage-ac-system.md`). The waiver list MUST NOT grow.

---

## 9. 🤖 GitHub External AI Agent Ecosystem & Task Sync Rules

- **[AC-9.1] Multi-Agent Directive Adapters**:
  - The repository MUST maintain root directive adapter files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`) linking to `AGENTS.md` and `DEVELOPMENT_RULES.md`.
  - External AI agents operating remotely or via CLI MUST follow the task lifecycle, AC tagging, Zero-Build architecture, and test verification standards.

- **[AC-9.2] Automated GitHub Task Synchronization & CI Gates**:
  - Task specifications in `tasks/` MUST be indexable and syncable with GitHub Issues via `npm run task:sync -- --github`.
  - GitHub Actions workflows (`.github/workflows/sync-tasks.yml` and `.github/workflows/agent-ci.yml`) MUST automatically validate test coverage gates (`npm run test:coverage:gate`) on all pull requests and pushes to `master`.

---

## 10. 📚 Multi-Lesson Spelling Library Rules (TASK-005)

- **[AC-10] Lesson Catalog Default and Integrity**:
  - Page 22 and Schwa ‹er› MUST be distinct catalog lessons. Page 22 remains the default when there is no valid saved selection.

- **[AC-11] Lesson Selection Consistency**:
  - A learner-selected spelling lesson MUST persist locally and drive Game, Learn, and Test consistently.

- **[AC-12] Complete Schwa ‹er› Learning Content**:
  - Every Schwa ‹er› word MUST have local illustration, alt text, concise definition, definition audio, extended explanation, example sentence, hint, and local word audio.

- **[AC-13] Explanation Experience**:
  - Learn mode MUST show the illustration and concise definition and provide a working English **Tell me more** control on desktop, tablet, and phone.

- **[AC-14] Active-Lesson Engine Behaviour**:
  - All spelling-mode state, navigation, progress, hints, audio, and letter tiles MUST use the active lesson; Back remains disabled on the first item.

- **[AC-15] Safe Selection Fallback**:
  - An unknown stored lesson identifier MUST fall back safely to Page 22; switching lessons MUST reset unfinished spelling state.

- **[AC-16] Touch and Responsive UI**:
  - The lesson picker and extended-explanation view MUST satisfy the project's touch-target, touch-event, modal, and English-only UI rules.

- **[AC-17] Local Offline Assets**:
  - New spelling assets MUST be local, precached by the PWA strategy, and retain asset provenance or attribution.

---

## 11. 🔁 Narrative Event and PWA Release Contract Hardening (TASK-006)

- **[AC-18.1] Canonical Requeue Contract**:
  - Runtime code MUST represent a requeued incorrect answer as
    `answer.incorrect` with `context.requeued: true`.
  - Runtime code MUST NOT emit a separate `item.requeued` narrative event.

- **[AC-18.2] Narrative Event Idempotency**:
  - Re-rendering, theme refresh, or duplicate delivery of the same transition
    MUST NOT repeat narrative, milestone, reward, completion, timer, TTS, or sound
    effects.
  - A new item or attempt MUST remain eligible to emit its own event.

- **[AC-18.3] Standards-Compliant PWA Versioning**:
  - Release tooling MUST synchronize only real version markers and MUST NOT add a
    non-standard `version` property to `manifest.json`.
  - Generated release notes MUST list only version targets actually changed.

- **[AC-18.4] TASK-004 Scope Ownership**:
  - TASK-006 MUST NOT duplicate share/QR implementation or coverage work.
    `engine/share-controller.js`, `engine/qr-generator.js`, and
    `tests/share-qr.test.mjs` remain owned by TASK-004.

---

## 12. ✨ Child-Friendly Dashboard (TASK-007)

- **[AC-19] Personal, Immediate Welcome**:
  - The dashboard MUST greet the current player by name with the fallback
    `Hi, Lucky! ✨` and MUST use the single short prompt `Pick your quest`.

- **[AC-20] Three Clear Choices**:
  - The dashboard choices MUST be named `Math Battle`, `Word Quest`, and
    `My Pets`.
  - Each choice MUST contain no more than one short supporting line and one
    explicit action button.

- **[AC-21] Reduced Reading Load**:
  - The previous long feature descriptions, multi-clause welcome copy, and
    curriculum jargon MUST NOT appear in the dashboard view.

- **[AC-22] Playful Visual Identity**:
  - Each dashboard card MUST have a distinct colorful treatment and a large,
    immediately recognizable icon presentation.

- **[AC-23] Safe Touch Navigation**:
  - Every dashboard action button MUST remain at least 64px tall and use
    `touch-action: manipulation`.
  - Realm navigation MUST remain bound only to explicit action buttons.

- **[AC-24] Compact Mobile Layout**:
  - At viewport widths up to 600px, the dashboard MUST use compact card,
    typography, and spacing rules that reduce vertical scrolling without
    clipping text or controls.
  - The compact header MUST NOT force horizontal page overflow or clip its
    action controls.

---

## 13. New 'or' Saying /er/ Spelling Lesson (TASK-008)

- **[AC-25] Lesson Catalog Integrity**:
  - The catalog MUST expose a stable `or-saying-er` lesson with exactly the 18 words from the supplied photo in the same order.
  - Existing lessons and the Page 22 default MUST remain unchanged.

- **[AC-26] Complete Local Learning Content**:
  - Every new word MUST include a definition, expanded explanation, example sentence, hint, meaningful image alt text, local SVG illustration, local word audio, and local definition audio.

- **[AC-27] Shared Lesson Experience**:
  - The new lesson MUST appear in the lesson picker, persist when selected, and drive Learn, Game, and Test through the shared spelling engine.

- **[AC-28] Verified Release and Deployment**:
  - The test suite and coverage gate MUST pass before release `v1.3.0` is committed and pushed to `master` for GitHub Pages deployment.

---

## 14. Approved Spelling Voice Standard (TASK-010)

- **[AC-29] Correct Sonia Audio Replacement**:
  - The `or-saying-er` lesson MUST use 18 word tracks and 18 definition tracks generated as MP3 with `en-GB-SoniaNeural` at rate `-15%`.
  - The catalog MUST reference the approved MP3 tracks and the incorrect system-voice WAV tracks MUST NOT remain.

- **[AC-30] Persistent Voice Safety Rule**:
  - Lucky Learning World spelling audio MUST use `en-GB-SoniaNeural` by default.
  - Audio generation MUST fail explicitly instead of silently falling back to an unapproved system voice.
  - A sample MUST be approved before a different voice can be released.

- **[AC-31] Verified Audio Fix Release**:
  - Automated tests MUST verify voice configuration, asset integrity, and absence of legacy WAV tracks before release `v1.3.2` is committed and deployed.

---

## 15. Fix "Tell me more..." Modal Button & Touch Latency (TASK-009)

- **[AC-32] Single Execution Touch & Click**:
  - Clicking or tapping `#btn-tell-me-more` MUST trigger `openTellMeMoreModal()` exactly ONCE without duplicate execution or event bubbling race conditions.

- **[AC-33] Touch Target & Instant Response**:
  - `#btn-tell-me-more` MUST have `touch-action: manipulation;` set in CSS/HTML and adhere to touch target size standards.

- **[AC-34] Tell Me More Modal Content & Backdrop Closing**:
  - Opening the modal MUST populate the target word, illustration image, short definition, expanded explanation, example sentence, and audio button (`#btn-tell-me-more-audio`).
  - Tapping `#btn-close-tell-me-more`, `#btn-close-tell-me-more-x`, or tapping the backdrop overlay MUST close the modal reliably.

- **[AC-35] 100% Verified Tests**:
  - Automated tests MUST verify modal opening, content population, backdrop closing, and single event execution.

---

## 16. Session Observability and Daily Anomaly Analysis (TASK-011)

- **[AC-36] Complete Anonymous Sessions**:
  - Every production page lifecycle MUST have an anonymous session identifier, ordered events, lifecycle markers, version metadata, and a reconstructable server-side timeline.

- **[AC-37] Action and Outcome Traceability**:
  - Every supported control activation MUST be logged once and correlated with exactly one completed, no-op, failed, or timed-out outcome and its semantic state transition.

- **[AC-38] Multi-Press Diagnosis**:
  - Repeated activation after an action produces no result MUST be detected automatically and include a redacted reproduction timeline.

- **[AC-39] Invalid Render Detection**:
  - Visible invalid values including `undefined`, `null`, `NaN`, `[object Object]`, empty required labels, and missing catalog references MUST create privacy-safe anomaly events.

- **[AC-40] Reliable Telemetry Delivery**:
  - Ordered batching, offline persistence, idempotent retry, page-hide flush, queue limits, delivery health counters, and failure isolation MUST be verified.

- **[AC-41] Durable and Secure Ingestion**:
  - The backend MUST validate, rate-limit, deduplicate, durably store, and expire events without exposing secrets or persisting source IP addresses.

- **[AC-42] Daily Analysis**:
  - A scheduled job MUST analyze every production session from the previous `Asia/Bangkok` day and create exactly one idempotent Markdown report with totals, rates, anomaly fingerprints, regressions, and redacted timelines.

- **[AC-43] Child Privacy**:
  - Automated allowlist and redaction tests MUST prove that names, PINs, answer text, query strings, raw local storage, IP addresses, and secrets are never persisted or reported.

- **[AC-44] Production Verification**:
  - A controlled smoke session MUST demonstrate normal, no-op, repeated, invalid-render, and synthetic-error paths from browser collection through the generated daily report before general rollout.

---

## 17. Single-Source Build Version and Date (TASK-012)

- **[AC-45] Single Authoritative Build Metadata**:
  - The application MUST render its diagnostic version and build time from one authoritative module; runtime code MUST NOT overwrite the release date with a hardcoded historical value.

- **[AC-46] Release Automation Synchronization**:
  - Release automation MUST update the authoritative version and UTC build timestamp together and all cache-buster/service-worker versions MUST match the same release.

- **[AC-47] Exact Diagnostic Verification**:
  - Automated tests MUST assert the exact diagnostic version/date source and fail when HTML placeholders, application metadata, telemetry metadata, or release cache versions diverge.

---

## 18. 'ear' Saying /er/ Spelling Lesson and New Default (TASK-014)

- **[AC-48] 'ear' Saying /er/ Lesson Catalog Integrity**:
  - The spelling catalog MUST expose a stable `ear-saying-er` lesson containing exactly the 18 photographed words in the photographed order, without removing or mutating any existing lesson.

- **[AC-49] Complete Local Learning Content and Sonia Audio**:
  - Every word in `ear-saying-er` MUST have a definition, extended explanation, example sentence, hint, meaningful image alt text, a repository-local SVG illustration, and local `en-GB-SoniaNeural` (`-15%`) word and definition audio, with a provenance file recording voice, rate, and generator.

- **[AC-50] New Default Lesson and Safe-Fallback Target**:
  - `DEFAULT_SPELLING_LESSON_ID` MUST be `ear-saying-er`. The lesson picker MUST show it as active by default for a fresh selection, and `getSpellingLesson()` MUST fall back to it (not a hardcoded older lesson) for unknown or missing lesson ids.

- **[AC-51] Existing Lessons Preserved**:
  - Page 22, Schwa ‹er›, and 'or' saying /er/ MUST remain unchanged, fully selectable, and continue to drive Learn, Game, and Test through the shared dynamic spelling engine.

---

## 19. Modal Open/Close Touch Race Fix (TASK-015)

- **[AC-52] Modal Survives the Trailing Click That Opened It**:
  - When a modal is opened by a touch (`pointerdown`), the browser's own trailing synthetic `click` event at the same coordinates MUST NOT be treated as a backdrop tap that immediately closes the same modal. A genuine backdrop tap occurring after the opening gesture MUST still close the modal.
  - Superseded in practice by TASK-016 (which removes the pointerdown trigger, the actual cause); this guard remains as defense-in-depth and MUST keep passing.

---

## 20. Remove Pointerdown-Triggered Modal Opening (TASK-016)

An independent Opus review of TASK-015 found the timestamp guard closed only the
narrowest failure mode (a stray click landing exactly on the full-screen backdrop) and
left at least two real, reproducible failure modes open: (1) the same race with a
longer finger-hold than the 400ms guard window, and (2) the much more likely case for
this specific button — the stray click landing on a close button *inside* the modal
card rather than on the backdrop, since the card centers roughly where the button sits.
Root cause: `bindTouchClick` opened modals on `pointerdown`, mutating the DOM mid-gesture
before the browser's own trailing `click` event resolves its target by hit-testing.

- **[AC-53] Modals Open Only on `click`; `pointerdown` Is Inert**:
  - `bindTouchClick` MUST NOT trigger its handler on `pointerdown`/`pointerup`/`touchstart`/`touchend`. It MUST trigger only on the standard `click` event, relying on the already-global `touch-action: manipulation` rule for tap responsiveness. A `pointerdown` alone MUST NOT open a modal or invoke any bound handler.

- **[AC-54] No Coordinate-Resolved Click Can Leak Onto the Wrong Control**:
  - Because no DOM mutation happens before the single `click` event's target is resolved, opening any modal (Tell Me More, Parent Gate, Parent Settings, QR) MUST NOT be capable of the click landing on a different control (backdrop or an inner close button) than the one actually tapped, for any button using `bindTouchClick`.

---

## 21. Modal State Never Outlives Its Visibility (TASK-017)

Production telemetry (queried directly from Cloudflare D1 after TASK-016 shipped)
showed a real session where Tell Me More opened successfully once, was never closed
through any of its own controls, and stayed marked `active` for the rest of the
session — every later tap on the same button correctly, but unhelpfully, no-op'd as
"already-active." A different modal (Parent Gate) opened successfully afterward,
meaning two modals could be simultaneously marked active with no single place
enforcing "only one is ever open."

- **[AC-55] Screen Navigation Always Closes Any Open Modal**:
  - Calling `showScreen()` for any screen (dashboard, math, word, pokedex) MUST close every currently-open modal, regardless of how it was left open.

- **[AC-56] Opening a Modal Always Closes Any Other Open Modal First**:
  - `openModal()` MUST close every other currently-active modal before opening the requested one, so at most one modal is ever active at a time. Re-opening the same modal that is already open must still correctly no-op (not reset unnecessarily).

---

## 22. Fix Unclosed Modal Overlay Divs Causing Zero-Size Render (TASK-018)

Three earlier tasks (TASK-015, TASK-016, TASK-017) treated "Tell Me More does
nothing" as a JavaScript problem and fixed real bugs at that layer, but the owner
reported the button was still dead afterward — on desktop Chrome, ruling out any
touch-race explanation. Driving real Chromium via Playwright (at the owner's
suggestion, rather than asking them to paste console output) showed
`#modal-tell-me-more` had `display:flex` and `.active` set exactly as intended by
the JS, yet its own `getBoundingClientRect()` was `0×0`. The live ancestor chain
showed it nested three levels deep inside `#victory-modal` inside
`#parent-settings-modal` (`display:none` by default) instead of being a sibling of
`<body>` like every other modal. `index.html` had three separate missing closing
tags that silently absorbed everything after them into the wrong subtree for the
rest of the file. This bug class is invisible to `jsdom`-only tests: `jsdom` does
not lay out or paint, so `style.display` and `classList` "work" from the element's
own perspective even while a hidden ancestor collapses it to nothing on a real
screen.

- **[AC-57] No Modal Overlay Is Nested Inside Another Element**:
  - Every element with class `modal-overlay` in `index.html` MUST be a direct child of `<body>`. None may be nested inside another modal overlay or any other container, since a `display:none` ancestor silently renders the whole subtree at `0×0` regardless of the descendant's own CSS.

- **[AC-58] An Opened Modal Renders With a Non-Zero Viewport-Covering Box**:
  - When `#modal-tell-me-more` is opened, it MUST have a real, non-zero rendered bounding box covering the viewport, verified against an actual browser render (not just computed-style assertions, which cannot detect this failure mode).

---

## 23. Permanent Playwright End-to-End Regression Suite for the Full Main Scenario (TASK-019)

Lucky's live session in Math Realm ×7 dropped back to the dashboard mid-session
around question 8, losing her in-progress attempt. TASK-018 had already installed
Playwright as a "one-time diagnostic devDependency" and explicitly flagged adopting
it *permanently* for ongoing regression coverage as an open decision, since `jsdom`
(what every other test in this repo runs against) never lays out or paints and so
cannot see a real render, a real uncaught exception, or a real console error. This
section resolves that decision: Playwright becomes a permanent part of the test
suite, driving one continuous real-Chromium session through the entire main user
journey — every game mode, in order — exactly as a real child would use the app.

- **[AC-59] Full Main Scenario Runs End-to-End in a Real Browser**:
  - A Playwright-driven test MUST drive real Chromium through the full main scenario
    in one continuous session — onboarding, Math Realm ×7 (all 12 questions, mixing
    correct and incorrect answers), Word Realm Learn/Test(digital+paper)/Game(Tiles)
    modes played to completion, and the Pokédex screen — using only real clicks and
    typed input for every action, never calling an `AppController` action/render
    method directly the way the existing `jsdom`-based `*-e2e.test.mjs` tests do.
    Read-only `spellingEngine` getters may be used only as an oracle for the target
    spelling word in Test/Game mode, since that word is deliberately never shown in
    the DOM.
- **[AC-60] Any Uncaught Error or Console Error Fails the Suite**:
  - The suite MUST fail if any uncaught JS exception (`page.on("pageerror")`) or any
    `console.error` (`page.on("console")`) occurs anywhere during the full run, except
    `console.error` calls caused by `ClientTelemetry`'s CORS-blocked fetch to the real
    production reporter endpoint — an artifact of running against a local static server
    instead of the app's real origin, not an app bug.
- **[AC-61] Math Realm Question Progress Is Monotonic Through Question 8**:
  - The suite MUST assert `#math-question-progress` progresses through every state
    from "Question 1 of 12" to "Question 12 of 12" in strict order, with no skip,
    reset, or unexpected navigation back to the dashboard — explicitly covering
    question 8, the exact point of the reported production crash.
- **[AC-62] Math Correction Feedback Never Shows "undefined"**:
  - The on-screen correction text and spoken correction audio for a wrong Math Realm
    answer MUST show the actual correct product, never the literal string
    `"undefined"`.
- **[AC-63] A Fresh Player's Chosen Starter Pet Is Saved Correctly**:
  - Completing onboarding with a given starter pet selected MUST save and render that
    same starter pet (e.g. Embercub) for the new player, never `undefined`.
- **[AC-64] The Suite Is a Permanent, Separately-Run Regression Gate**:
  - The suite MUST run via `npm run test:e2e` against a local static file server, and
    MUST NOT be folded into `npm test` / `test:coverage:gate` (it needs a Chromium
    binary and runs slower than the `jsdom` suite). It is documented as permanent,
    superseding TASK-018's "one-time diagnostic" framing of Playwright in this repo.

Building AC-59 through AC-64 surfaced five further real, previously-undetected bugs, all
introduced by the same commit (`86a3219`, 2026-07-28, the narrative-engine refactor) and
none catchable by any `jsdom`-based test in this repo, since each requires either real
timer scheduling, a real click producing a real uncaught exception, or a real failed
network request:

- **[AC-65] Answering Correctly Actually Advances the Math Session**:
  - Tapping the correct Math Realm answer MUST advance the session's queue and history
    on that same tap. (Previously, `handleMathAnswer()` called the engine's
    `answerFirstTry(session)` without the tapped value, so the engine's own internal
    correctness check always evaluated `undefined === computeAnswer(question)` —
    false — silently re-marking every correct answer as a pending correction. The
    *same* question then kept reappearing with freshly randomized wrong-choice
    distractors, "Question N of 12" frozen, until a second correct tap on it threw an
    uncaught `"answerFirstTry called while a correction is pending"` exception. Session
    progress in practice came almost entirely from genuinely wrong answers — exactly
    what a hard-drill ×7 session serves most of — which independently confirms this bug
    as the leading explanation for the reported crash.)
- **[AC-66] Answering Wrong Actually Sets Up the Correction It Later Confirms**:
  - Tapping a wrong Math Realm answer MUST leave the session in a state where the
    scheduled `confirmCorrection()` call 1400ms later succeeds. (Previously the wrong
    branch never called `answerFirstTry()` at all, so `pendingCorrection` was never
    legitimately set for a wrong answer — `confirmCorrection()` threw `"called with no
    pending correction"` unless it happened to inherit stale state left over from
    AC-65's bug.)
- **[AC-67] Completing a Math Level Session Correctly Scores, Unlocks, and Rewards**:
  - Finishing a Math Realm level session MUST compute real accuracy/stars from the
    actual session and settings, MUST be able to unlock the next level and grant a
    reward, and MUST NOT silently zero out progress. (Previously `finishMathSession()`
    called `computeLevelOutcome(session, level.id, settings)` — an extra positional
    argument the function's real two-parameter signature `(session, settings)` doesn't
    accept, which shifted `level.id`, a string, into the `settings` slot. Accuracy
    became `points / undefined` = `NaN`, so `stars` was always `0` and the
    reward-eligibility branch — checked via a `outcome.rewardEligible` field that
    doesn't exist on the function's actual return shape — could never run for level
    sessions. `applyLevelOutcome()` was also called without its required `levels`
    argument and without `outcome.outcomeId`/`outcome.levelId` ever being set, so
    progress was recorded under an `undefined` key and only the very first-ever call
    could apply at all.)
- **[AC-68] Granting Any Reward Leaves `collection` an Array, Never the Internal Wrapper Object**:
  - After any reward is granted (Math level, Math Mix, or Word Realm), `this.collection`
    and its `localStorage` persistence MUST remain a plain array of pet entries.
    (Previously all three call sites assigned `applyReward()`'s full return value —
    `{ collection, appliedRewardOutcomeIds }` — directly to `this.collection` instead of
    destructuring it, corrupting the collection into a non-array object on the very
    first reward ever granted. This broke the Pokédex screen — `collection.length` on a
    plain object is `undefined`, rendering "undefined / 15" — and would throw on any
    later `collection.find()`/`.map()` call. `loadCollection()` now self-heals an
    already-corrupted save by recovering the nested `.collection` array if present.)
- **[AC-69] Opening the Victory Modal Never Throws and Never Shows a Broken Image**:
  - Opening the victory modal after any reward MUST populate the reward pet's name and
    image without throwing, and the image `src` MUST NOT be the literal string
    `"undefined"`. (Two independent bugs: `index.html`'s `.reward-pet-preview` container
    had no `#reward-pet-img`/`#reward-pet-name` elements at all — despite a
    `.reward-pet-img` CSS rule already existing for them — so `openVictoryModal()`
    threw `Cannot set properties of null` before the modal could ever open, aborting
    the rest of `finishMathSession()`/`finishSpellingSession()` mid-function. Separately,
    its image-resolution fallback chain (`pres.image || pres.assetPath || char.image`)
    never included `art.src`, the field that actually holds a character's image in this
    codebase's data shape — used correctly by `renderPokedex()` elsewhere in the same
    file — so even after the modal could open, the pet image resolved to `undefined`.)

An independent review (a second agent, clean context, Opus) of AC-59 through AC-69 found
the fixes for AC-65 through AC-69 correct against the engine functions' real signatures,
confirmed all seven bugs as real via `git show 86a3219`, and confirmed `npm test` /
`npm run test:e2e` green with no audio output. It also found two further real bugs the
first pass missed, and — by mutation-testing the suite itself (temporarily reintroducing
the AC-67 bug and re-running) — proved AC-67 was not actually guarded by the suite as
claimed, since the victory-modal check was conditional and the fallback `alert()` path
was silently auto-accepted. Both gaps are fixed below.

- **[AC-70] Every Starter-Pet Choice Saves a Real, Valid Character**:
  - Completing onboarding with any of the three starter buttons selected — not just the
    default (Embercub) — MUST save and collect a character id that actually exists in
    `content/characters.js`. (AC-5's original fix correctly changed
    `dataset.starterPet` → `dataset.starter`, but two of the three buttons' actual
    `data-starter` values, `"aquafox"` and `"leafpup"`, were themselves stale — not
    existing in the current character roster at all, a separate, older-generation content
    mismatch AC-5's own suite never caught because it only ever exercised the default
    Embercub button. Fixed by pointing those two buttons at the real ids for the game's
    intended fire/water/grass starter trio — `embercub`, `bubblit`, `leafling`, the first
    three entries in `content/characters.js`'s `POOL_CHARACTERS` — while leaving their
    child-facing display names unchanged. Regression-guarded by a new, fast `jsdom` test,
    `tests/onboarding-starter-pet.test.mjs`, that completes onboarding through all three
    buttons and checks each resulting collection entry against `getCharacterById()`.)
- **[AC-71] A Rapid Second Tap on a Math Realm Answer Is Ignored, Not Double-Processed**:
  - Tapping a second Math Realm answer button within the 800ms (correct) / 1400ms
    (wrong) window before the next question renders MUST be ignored — it MUST NOT throw
    an uncaught exception, and MUST NOT silently mark a not-yet-shown question as
    answered. (AC-65/AC-66 fixed `answerFirstTry()` being called correctly, but neither
    `renderMathQuestion()`'s click listeners nor `handleMathAnswer()` guarded against a
    second tap landing inside that window — a plausible real interaction on a child's
    tablet, and, depending on timing, capable of hitting `answerFirstTry()`'s own
    "correction already pending" guard exception. Fixed with a `mathAnswerLocked` flag
    set for the duration of the window. Regression-guarded by
    `tests/math-answer-lock.test.mjs`, which dispatches two rapid clicks and checks both
    for an uncaught exception, via `window.onerror` — `EventTarget.dispatchEvent()` does
    not propagate listener exceptions back to its caller, so `assert.doesNotThrow()`
    around a `dispatchEvent()` call would pass vacuously regardless of what the listener
    does internally — and for silent misprocessing of the *next* question.)

---

## 24. Fix Bottom-Nav Blank Page on Hub Tap (TASK-023)

A real production incident: opening the live site in a new tab, tapping Math, then
tapping the bottom nav's Hub button produced a completely blank content area — header
and bottom nav rendered, everything between them empty. Root cause: two competing
click handlers on every bottom-nav button, one correct (a `document`-level delegate)
and one wrong (a direct `bindTouchClick()` binding passing the literal object key
`"hub"` instead of the real screen id `"dashboard"`) — and the wrong one always won,
via `stopPropagation()`, for every bottom-nav button since the day both handlers were
introduced (2026-07-26), predating even the `86a3219` commit TASK-019 investigated so
thoroughly.

- **[AC-72] Bottom-Nav Hub Never Blanks the Page**:
  - Tapping `#nav-btn-hub` MUST activate the dashboard screen (`.view-screen.active`
    with id `"dashboard-view"`) with its realm cards present. It MUST NOT result in no
    `.view-screen` having the `.active` class.
- **[AC-73] Bottom-Nav Math/Word Actually Start Their Realm, Not Just Switch Screens**:
  - Tapping `#nav-btn-math` MUST call `startMathRealm()` (a real session, verified via
    `renderMathQuestion()`'s `data-math-choice` markup, not `index.html`'s static
    placeholder `data-answer-val` buttons), not a bare `showScreen("math")`. Tapping
    `#nav-btn-word` MUST call `startWordRealm()` (the lesson picker rendered), not a
    bare `showScreen("word")`.
- **[AC-74] The Permanent E2E Suite Exercises the Bottom Nav, Closing the Coverage Gap
  That Let This Ship**:
  - `tests/e2e/full-main-scenario.e2e.mjs` (TASK-019) MUST include at least one
    interaction via the bottom nav bar, not exclusively the in-panel back buttons and
    dashboard cards it used exclusively before — that exact gap is why this bug shipped
    unnoticed and didn't reproduce under a first, careful investigation attempt.

---

## 25. Persistent Fact Mastery (TASK-020)

- **[AC-75] Every Math Answer Updates Fact Mastery**:
  - A correct or wrong first answer MUST update the matching canonical fact key through
    `updateFactOnAnswer()` exactly once and persist the resulting `factStats` through
    the existing progression storage path. A later requeued retry is a new attempt and
    may update the fact again.
- **[AC-76] Fact Mastery Survives Reloads and Migration**:
  - Initial, normalized, and migrated progression states MUST contain a valid
    `factStats` object. Valid stored mastery records MUST survive normalization and a
    browser reload; arrays or corrupt values MUST safely become an empty object.
- **[AC-77] Weak Facts Affect Subsequent Session Planning**:
  - Persisted repeated mistakes MUST measurably prioritize the weak fact in a later
    level plan instead of every player permanently receiving a blank-history shuffle.

---

## 26. Canonical Star Display (TASK-021)

- **[AC-78] Header Shows the Real Total Star Count**:
  - The header total MUST equal the sum of finite non-negative stars stored at
    `progression.levels[levelId].stars`; it MUST NOT read the nonexistent
    `progression.starsByLevel` field.
- **[AC-79] Level Chips Show Their Own Stars**:
  - Every Math level chip MUST render the stars stored in its canonical
    `progression.levels[levelId]` record, while levels without stars remain blank.
- **[AC-80] Existing Progress Appears Without Re-Earning It**:
  - A previously saved canonical progression state MUST display its stars immediately
    after loading; no data migration, reset, or replay is required.

---

## 27. Valid and Finishable Math Mix (TASK-024)

- **[AC-81] Math Mix Never Renders Invalid Operands**:
  - Starting Math Mix through the application MUST create finite numeric operands and
    MUST never render `NaN`, `undefined`, or `null` in math question or feedback text.
- **[AC-82] Mix Planner Rejects Invalid Table Inputs**:
  - `buildMixSessionPlan()` MUST receive numeric multiplication tables and fail fast on
    invalid values rather than silently creating `NaNxNaN` facts.
- **[AC-83] Math Mix Can Reach Completion**:
  - A full Mix session MUST remain answerable through its final question and reach the
    existing completion/reward path without an uncaught runtime error.

---

## 28. Add 'u' Saying Long /oo/ Spelling Lesson (TASK-025)

- **[AC-84] Complete Stable Lesson Catalog Entry**:
  - The catalog MUST expose `u-saying-oo` with exactly the 18 supplied words in order,
    preserve all existing lessons, and leave the default lesson unchanged.
- **[AC-85] Complete Local Learning Content and Approved Audio**:
  - Every new word MUST include complete child-friendly learning content, a local SVG,
    local Sonia (`en-GB-SoniaNeural`, `-15%`) word and definition audio, and matching
    audio and image provenance.
- **[AC-86] Shared Lesson Picker and Engine Integration**:
  - The picker MUST render a fifth selectable lesson card, persist the selection, and
    drive Learn, Game, and Test through the shared spelling engine.

---

## 29. Always Award Pokémon and Sync Collection Count (TASK-026)

- **[AC-87] Every Completed Math Duel Grants a Pokémon**:
  - Finishing any valid Math Duel, including an attempt below the three-star reward
    threshold, MUST grant a valid Pokémon reward and open the in-app reward modal.
    It MUST NOT fall back to a browser completion alert.
- **[AC-88] Academic Progress Remains Performance-Based**:
  - Always granting a Pokémon MUST NOT change the existing star calculation or
    next-level unlock threshold. A low-score attempt retains its actual star count
    and does not unlock the next level unless the existing threshold is met.
- **[AC-89] Saved Collection Count Renders Immediately**:
  - On startup and after every collection change, the dashboard collection badge MUST
    show the normalized saved collection length out of all 15 collectible Pokémon,
    without requiring the player to open the Pokédex first.
- **[AC-90] Collection Badge Uses Pokémon Wording**:
  - The dashboard badge MUST identify the collected characters as Pokémon rather than
    generic pets.

---

## 30. Clear Tiles Battle Feedback on Tablets (TASK-027)

- **[AC-91] Pokémon and Tiles Stay Together on Tablets**:
  - At landscape tablet widths, the Tiles arena MUST place the Pokémon battle stage
    beside the spelling question and tile controls so Lucky can see both in the same
    viewport region. Narrow phones MUST retain a readable stacked layout.
- **[AC-92] Correct Attacks Are Instantly Recognizable**:
  - A correct Tiles submission MUST immediately show a large green `HIT!` signal,
    visibly animate the Pokémon as hit, and play a short rising success sound.
- **[AC-93] Wrong Attacks Are Instantly Recognizable**:
  - A wrong Tiles submission MUST immediately show a large red `MISS!` signal,
    visibly animate the Pokémon dodging, and play a short descending miss sound.
- **[AC-94] Feedback Does Not Require Reading a Definition**:
  - Persistent feedback MUST be limited to `HIT!` or `MISS! TRY AGAIN` and MUST NOT
    repeat the word definition. The definition remains visible in the dedicated hint
    line throughout the retry.
- **[AC-95] Feedback Cannot Be Double-Submitted**:
  - Submit taps during the result animation MUST be ignored, and the Tiles controls
    MUST retain touch targets at least 64 px high and `touch-action: manipulation`.

---

## 31. Add ‹ough›, ‹gh› and ‹augh› Spelling Lesson (TASK-028)

- **[AC-96] Complete Stable Lesson Catalog Entry**:
  - The catalog MUST expose `ough-gh-augh` with exactly the 18 supplied words in order,
    preserve all existing lessons, and leave the default lesson unchanged.
- **[AC-97] Complete Local Learning Content and Approved Audio**:
  - Every new word MUST include child-friendly learning content, a local original SVG,
    local Sonia (`en-GB-SoniaNeural`, `-15%`) word and definition audio, and matching
    audio and image provenance.
- **[AC-98] Shared Lesson Picker and Engine Integration**:
  - The picker MUST render a sixth selectable lesson card, persist the selection, and
    drive Learn, Game, and Test through the shared spelling engine.
