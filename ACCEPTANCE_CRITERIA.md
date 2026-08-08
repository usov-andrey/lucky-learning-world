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
