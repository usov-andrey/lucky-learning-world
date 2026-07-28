# Lucky's Learning World — Core Development Rules & UI/UX Standards

This document contains mandatory rules for all AI coding agents (Antigravity, Codex, Claude Code, Windsurf, Cursor) working on **Lucky's Learning World**.

---

## 1. 📝 Acceptance Criteria First & Test-Driven Workflow (Mandatory)
- **Mandatory Step 1: Acceptance Criteria Document (`ACCEPTANCE_CRITERIA.md`)**:
  - Before writing code for ANY development task, the VERY FIRST step MUST be creating an explicit Acceptance Criteria document (`ACCEPTANCE_CRITERIA.md` or `<TASK_KEY>_ACCEPTANCE_CRITERIA.md`) in markdown (`.md`) inside the project folder based on the user's specification/brief.
  - This document MUST enumerate explicit, unambiguous Acceptance Criteria (AC-1, AC-2, AC-3...) covering all functional flows, UI visibility rules, version edge cases, and error states.
- **Mandatory Step 2: Automated Tests Driven by Acceptance Criteria**:
  - Automated unit and integration tests (`tests/*.test.mjs`) MUST be written directly to cover and validate every single Acceptance Criterion defined in the `.md` document.
- **Mandatory Step 3: Iterative Updates on Unaccounted Edge Cases / Errors**:
  - If any error or unaccounted edge case occurs during implementation or review, the Acceptance Criteria `.md` document MUST be updated FIRST to record the new/refined criterion before adjusting code and tests.

---

## 2. 🌐 Language & Curriculum Standards
- **100% English UI**: All user-facing text, buttons, modals, hints, and audio TTS MUST be 100% in English. Lucky is 10 years old and attends an international school in Thailand (Cambridge / Oxford Primary curriculum).
- **No Russian in Game Interface**: Russian text is strictly forbidden inside the game UI or user-facing modals.

---

## 2. 📱 Mobile & Tablet Touch UX
- **Touch Target Size**: All interactive elements (buttons, cards, inputs) MUST have touch target sizes $\ge 64\text{px} \times 64\text{px}$ to accommodate young learners on tablets/iPads/phones.
- **Touch Latency & Event Bubbling**:
  - All interactive containers MUST include CSS `touch-action: manipulation;` to eliminate 300ms touch delay.
  - Child elements (`<span>`, `<p>`, `<img>`, `<h3>`) inside buttons and `.realm-card` elements MUST have CSS `pointer-events: none;` so touch events bubble cleanly to the card/button container.
- **Strict Button-Only Realm Navigation (Touch Scroll Safety)**:
  - Touch & click navigation handlers for Realm Cards MUST be bound strictly to explicit Action Buttons (`Enter Math Realm`, `Enter Word Realm`, `Open Pokédex`).
  - NEVER bind navigation handlers to the `.realm-card` body container, as touch-scrolling gestures will accidentally trigger navigation when the user attempts to swipe down the page.

---

## 3. 🎨 Navigation & Active State Guidelines
- **Disabled Navigation Guard**:
  - Sequence navigation controls (such as `Back` / `Previous` buttons in Spelling Learn Mode) MUST be disabled (`disabled` attribute, `opacity: 0.3`, `pointer-events: none`) on the very first item (`index === 0`). Never leave active no-op buttons for the user to tap.
- **High-Contrast Active Tab Highlight**:
  - Bottom navigation items and active tabs MUST have vibrant, high-contrast visual indicators (glowing background pill, top indicator line, bright white text) so the user instantly sees which tab is active.

---

## 4. 🖼️ Responsive Modal Layouts
- **Viewport Constraints**:
  - All `.modal-card` elements MUST enforce `max-height: 85vh` (desktop) and `max-height: 92vh` (mobile) with `overflow-y: auto` and a custom styled scrollbar.
  - The modal header and bottom "Done / Close" buttons MUST ALWAYS remain visible and reachable regardless of screen resolution.

---

## 5. 🔒 Parent Security Standards
- **4-Digit PIN Security**: Parent Protected Settings MUST be guarded by a 4-digit PIN system (`1234` default, customizable in localStorage `lucky_parent_pin`).
- **No Simple Math Gate**: Simple arithmetic challenges (e.g. 7 × 8) MUST NOT be used as parent gates, as 10-year-old Lucky can easily solve them.

---

## 6. 🐾 Pokédex Collection Presentation
- **Rescued Pets First**: Rescued/Unlocked pets MUST always be sorted to the very top of the Pokédex grid FIRST.
- **Vibrant Unlocked Card Styling**: Unlocked pet cards MUST use glowing gradient background styling (`.pet-card.unlocked`) with a neon border, glowing level badge, and bright green status text so unlocked pets stand out with 100% clarity on all devices.

---

## 7. 🏗️ Architecture & Verification Rules
- **Zero-Build Architecture**: Standard Vanilla ES Modules (`import`/`export`). No Webpack, Vite, or npm bundlers. Static hostable on GitHub Pages.
- **Mandatory Pre-Commit Verification**: Run `node --test tests/*.test.mjs` before committing or deploying any version.
