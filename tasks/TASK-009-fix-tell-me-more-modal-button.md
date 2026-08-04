# TASK-009: Fix "Tell me more..." Button Interaction & Touch Latency

## Overview
Fix the "Tell me more..." button in Learn Mode (`spelling-learn-container`) which fails to open or opens and instantly closes on touch/click due to duplicate event handler delegation (`bindTouchClick` + global `document` click delegate) and touch ghost click race conditions.

---

## 🎯 Acceptance Criteria (AC)

### AC-1: Single Clean Event Execution on Touch & Click
- Clicking or tapping `#btn-tell-me-more` MUST trigger `openTellMeMoreModal()` exactly ONCE without duplicate execution or event bubbling race conditions.

### AC-2: Touch Target & Instant Response (`touch-action: manipulation`)
- `#btn-tell-me-more` MUST have `touch-action: manipulation;` set in CSS/HTML and adhere to touch target size standards ($\ge 64\text{px} \times 64\text{px}$ / $\ge 48\text{px}$ height).

### AC-3: Tell Me More Modal Content & Audio Controls
- Opening the modal MUST populate the target word, illustration image, short definition, expanded explanation, example sentence, and audio button (`#btn-tell-me-more-audio`).
- Clicking `#btn-close-tell-me-more`, `#btn-close-tell-me-more-x`, or tapping the backdrop overlay MUST close the modal reliably.

### AC-4: 100% Passing Unit & E2E Tests
- `node --test tests/*.test.mjs` MUST pass 100% with tag `@task TASK-009` and `@ac AC-1` .. `AC-4`.

---

## 🛠 Impacted Files
- `app.js`
- `index.html`
- `styles.css`
- `ACCEPTANCE_CRITERIA.md`
- `tasks/INDEX.md`
- `tests/spelling-modal-e2e.test.mjs`
