---
id: TASK-001
title: "Themed Narrative Mechanics & Toast Announcement Banner"
status: RELEASED
version: v1.0.0
created: 2026-07-28
github_issue: null
---

# TASK-001: Themed Narrative Mechanics & Toast Announcement Banner

## 💡 1. Idea & Proposal
Integrate interactive narrative themes ("Comic Quest") into the educational realms (Math & Word), providing speech bubbles, character interactions, milestone announcements, and a Hub announcement toast banner allowing users to try the new theme.

## 📋 2. Acceptance Criteria (AC)
- [x] **AC-1**: Parent Controls allows explicit switching to `comic` theme upon PIN verification.
- [x] **AC-2**: Toast banner displays on Hub screen when `pokemon` theme is active and player onboarding is completed.
- [x] **AC-3**: Toast banner closes when `✖` or `Try Comic Quest ➔` is clicked, marking campaign `comic-quest-v1.0.0` as seen in localStorage.
- [x] **AC-4**: `NarrativeEngine` provides full event coverage including `session.started`, `question.presented`, `correction.*`, and `milestone.reached`.
- [x] **AC-5**: Dynamic narrative page calculation uses formula `Math.ceil(totalItems / panelsPerPage)`.
- [x] **AC-6**: `refreshThemePresentation()` preserves current spelling tile selection and timer states.
- [x] **AC-7**: Service Worker cache name is updated to `lucky-world-v1.0.0` with safe prefix purging (`lucky-world-*`).
- [x] **AC-8**: All UI elements and narrative text are 100% in English with zero Russian text.

## 🧪 3. Test Coverage
- `tests/narrative-engine.test.mjs` -> AC-4, AC-5
- `tests/narrative-integration.test.mjs` -> AC-2, AC-3, AC-6
- `tests/ui-smoke.test.mjs` -> AC-1, AC-8
- `tests/integration-imports.test.mjs` -> AC-4

## 💻 4. Impacted Code Files
- `app.js`
- `engine/narrative-engine.js`
- `content/narrative-themes.js`
- `index.html`
- `styles.css`
- `themes.css`
- `sw.js`

## 📦 5. Release & Artifacts
- **Version**: `v1.0.0`
- **Release Walkthrough**: `docs/releases/v1.0.0.md`
