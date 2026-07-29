---
id: TASK-007
title: "Simplify and personalize the child dashboard"
status: TESTED # [IDEA | PROPOSED | ACCEPTED | IN_PROGRESS | TESTED | RELEASED]
version: v1.0.5
created: 2026-07-29
github_issue: null
---

# TASK-007: Simplify and personalize the child dashboard

## 💡 1. Idea & Proposal
- **Context**: The current mobile dashboard asks a 10-year-old learner to scan a long heading, explanatory paragraph, technical badges, and full feature descriptions before she can start playing.
- **Proposed Solution**: Turn the dashboard into a personalized quest picker with a short greeting, one clear prompt, compact colorful cards, one playful line per activity, and large explicit action buttons. Keep the visual language bright and magical without relying on gender stereotypes.

## 📋 2. Acceptance Criteria (AC)
- [x] **AC-19**: The dashboard greets the current player by name with the fallback `Hi, Lucky! ✨` and uses the single short prompt `Pick your quest`.
- [x] **AC-20**: The three dashboard choices are named `Math Battle`, `Word Quest`, and `My Pets`; each has no more than one short supporting line and one explicit action button.
- [x] **AC-21**: Long feature-list copy and curriculum jargon from the previous dashboard are absent from the dashboard view.
- [x] **AC-22**: Each realm card has a distinct colorful visual treatment and a playful, immediately recognizable icon presentation.
- [x] **AC-23**: Dashboard action buttons remain at least 64px tall, use `touch-action: manipulation`, and navigation stays bound only to the explicit buttons.
- [x] **AC-24**: On screens up to 600px wide, the dashboard uses compact cards, readable type, and spacing that substantially reduces vertical scrolling; the compact header must not force horizontal overflow or clip its controls.

## 🧪 3. Test Coverage
- List test files covering this task (tagged with `// @task TASK-007` and `// @ac AC-Y`):
  - `tests/child-dashboard.test.mjs`

## 💻 4. Impacted Code Files
- `index.html`
- `styles.css`
- `app.js`
- `tests/child-dashboard.test.mjs`

## 📦 5. Release & Artifacts
- **Version**: `v1.0.5`
- **Implementation Plan**: `docs/plans/TASK-007-implementation-plan.md`
- **Release Notes / Walkthrough**: `docs/walkthroughs/TASK-007-walkthrough.md`
