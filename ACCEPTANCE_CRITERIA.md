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

