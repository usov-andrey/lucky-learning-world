# Lucky's Learning World — Core Development Rules & UI/UX Standards

This document contains mandatory rules for all AI coding agents (Antigravity, Codex, Claude Code, Windsurf, Cursor) working on **Lucky's Learning World**.

---

## 1. 📌 Task & Issue Lifecycle (`tasks/`)
- **Task File Required**: Every proposed plan, feature, or bugfix MUST have a task file created under `tasks/TASK-XXX-<slug>.md` using `tasks/templates/TASK-TEMPLATE.md`.
- **Master Index Sync**: New tasks MUST be appended to `tasks/INDEX.md`.
- **GitHub Sync**: Sync tasks to GitHub Issues via `npm run task:sync` or `gh` CLI.
- **Git Commit Convention**: Every commit MUST include the task ID in its header:
  - `feat(TASK-XXX): concise summary`
  - `fix(TASK-XXX): concise summary`

---

## 2. 📝 Acceptance Criteria First & Test Traceability (Mandatory)
- **Mandatory Step 1: Acceptance Criteria (AC)**:
  - Before writing code for ANY task, define explicit Acceptance Criteria (`AC-1`, `AC-2`...) in `tasks/TASK-XXX.md` and `ACCEPTANCE_CRITERIA.md`.
- **Mandatory Step 2: AC-Tagged Automated Tests**:
  - Automated tests (`tests/*.test.mjs`) MUST be annotated with comments linking to the task and AC:
    ```javascript
    // @task TASK-001
    // @ac AC-1: Toast banner visibility rule
    test('TASK-001 AC-1: Toast banner shows only on pokemon theme', () => { ... });
    ```
- **Mandatory Step 3: Iterative AC Updates**:
  - If unexpected edge cases or bug reports occur, update the AC in `tasks/TASK-XXX.md` FIRST before modifying code and tests.

---

## 3. 📦 Semantic Versioning, Unique Artifacts & Output Rules
- **Clean SemVer Baseline**: Releases start from `v1.0.0` and increment via `node scripts/release.mjs --bump=minor|major|patch --task=TASK-XXX`.
- **Unified Version Targets**: Release script updates version strings synchronously across `package.json`, `app.js`, `index.html`, `sw.js`, `manifest.json`, and `CHANGELOG.md`.
- **Major Version Archive**: Major bumps (`v1` ➔ `v2`) snapshot the previous version in physical directories (`v1/`, `v2/`) so multiple major versions can run and be viewed simultaneously.
- **Unique Versioned Plan & Walkthrough Storage (No Overwriting)**:
  - Every task plan MUST be saved with a unique filename: `docs/plans/<TASK_ID>-implementation-plan.md` (and copied to root `implementation_plan.md` for active reference).
  - Every task walkthrough MUST be saved with a unique filename: `docs/walkthroughs/<TASK_ID>-walkthrough.md` (and copied to root `walkthrough.md` for active reference).
- **Mandatory Absolute Paths in Agent Responses**: In every final response accompanied by UI artifact buttons, the agent MUST explicitly list the absolute disk paths to the project documents.


---

## 4. 🌐 Language & Curriculum Standards
- **100% English UI**: All user-facing text, buttons, modals, hints, and audio TTS MUST be 100% in English. Lucky is 10 years old and attends an international school in Thailand (Cambridge / Oxford Primary curriculum).
- **No Russian in Game Interface**: Russian text is strictly forbidden inside the game UI or user-facing modals.

---

## 5. 📱 Mobile & Tablet Touch UX
- **Touch Target Size**: All interactive elements (buttons, cards, inputs) MUST have touch target sizes $\ge 64\text{px} \times 64\text{px}$ to accommodate young learners on tablets/iPads/phones.
- **Touch Latency & Event Bubbling**:
  - All interactive containers MUST include CSS `touch-action: manipulation;` to eliminate 300ms touch delay.
  - Child elements (`<span>`, `<p>`, `<img>`, `<h3>`) inside buttons and `.realm-card` elements MUST have CSS `pointer-events: none;` so touch events bubble cleanly to the card/button container.
- **Strict Button-Only Realm Navigation (Touch Scroll Safety)**:
  - Touch & click navigation handlers for Realm Cards MUST be bound strictly to explicit Action Buttons (`Enter Math Realm`, `Enter Word Realm`, `Open Pokédex`).
  - NEVER bind navigation handlers to the `.realm-card` body container, as touch-scrolling gestures will accidentally trigger navigation when the user attempts to swipe down the page.

---

## 6. 🎨 Navigation & Active State Guidelines
- **Disabled Navigation Guard**:
  - Sequence navigation controls (such as `Back` / `Previous` buttons in Spelling Learn Mode) MUST be disabled (`disabled` attribute, `opacity: 0.3`, `pointer-events: none`) on the very first item (`index === 0`). Never leave active no-op buttons for the user to tap.
- **High-Contrast Active Tab Highlight**:
  - Bottom navigation items and active tabs MUST have vibrant, high-contrast visual indicators (glowing background pill, top indicator line, bright white text) so the user instantly sees which tab is active.

---

## 7. 🖼️ Responsive Modal Layouts
- **Viewport Constraints**:
  - All `.modal-card` elements MUST enforce `max-height: 85vh` (desktop) and `max-height: 92vh` (mobile) with `overflow-y: auto` and a custom styled scrollbar.
  - The modal header and bottom "Done / Close" buttons MUST ALWAYS remain visible and reachable regardless of screen resolution.

---

## 8. 🔒 Parent Security Standards
- **4-Digit PIN Security**: Parent Protected Settings MUST be guarded by a 4-digit PIN system (`1234` default, customizable in localStorage `lucky_parent_pin`).
- **No Simple Math Gate**: Simple arithmetic challenges (e.g. 7 × 8) MUST NOT be used as parent gates, as 10-year-old Lucky can easily solve them.

---

## 9. 🐾 Pokédex Collection Presentation
- **Rescued Pets First**: Rescued/Unlocked pets MUST always be sorted to the very top of the Pokédex grid FIRST.
- **Vibrant Unlocked Card Styling**: Unlocked pet cards MUST use glowing gradient background styling (`.pet-card.unlocked`) with a neon border, glowing level badge, and bright green status text so unlocked pets stand out with 100% clarity on all devices.

---

## 10. 🏗️ Architecture & Verification Rules
- **Zero-Build Architecture**: Standard Vanilla ES Modules (`import`/`export`). No Webpack, Vite, or npm bundlers. Static hostable on GitHub Pages.
- **Mandatory Pre-Commit Verification**: Run `node --test tests/*.test.mjs` before committing or deploying any version.

