---
id: TASK-032
title: "Compact Spelling Lesson Picker"
status: TESTED
version: v1.11.1
created: 2026-09-08
github_issue: null
---

# TASK-032: Compact Spelling Lesson Picker

## Context

The Word Realm currently renders every spelling lesson as a large card. With eight
lessons, the picker fills most of a phone screen and pushes the learning controls far
below the fold. The owner requested a compact control that keeps the current polished
visual style, opens with the newest lesson by default, and still makes every other
lesson easy to choose.

## Acceptance Criteria

- [x] **AC-111**: The Word Realm renders one compact, attractive dropdown containing
  every catalog lesson exactly once instead of a vertically expanding card grid.
- [x] **AC-112**: With no valid saved selection, the dropdown and spelling engine use
  the newest lesson (the final catalog entry); after the learner changes the dropdown,
  that valid choice persists and is restored on the next app instance.
- [x] **AC-113**: Changing the dropdown immediately updates the shared spelling engine,
  Word Realm title, and current mode content while preserving a mobile touch target of
  at least 64 px and English-only accessible UI text.

## Test Coverage

- `tests/spelling-lesson-ui.test.mjs`

## Impacted Files

- `index.html`
- `styles.css`
- `app.js`
- `content/spelling-catalog.js`
- `tests/spelling-lesson-ui.test.mjs`

## Release & Artifacts

- **Version**: `v1.11.1`
- **Walkthrough**: `docs/walkthroughs/TASK-032-walkthrough.md`
