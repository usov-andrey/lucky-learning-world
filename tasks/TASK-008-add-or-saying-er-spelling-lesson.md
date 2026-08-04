---
id: TASK-008
title: "Add 'or' Saying /er/ Spelling Lesson"
status: RELEASED
version: v1.3.0
created: 2026-08-04
github_issue: null
---

# TASK-008: Add 'or' Saying /er/ Spelling Lesson

## 1. Goal and context

Add the 18 words shown in the supplied school-book photo as a new selectable spelling lesson. Preserve the existing Page 22 and Schwa <er> lessons and reuse the established Learn, Game, and Test experience.

Canonical word order: `worm`, `word`, `world`, `worst`, `worker`, `worse`, `workable`, `worthy`, `worship`, `fireworks`, `worksheet`, `worthless`, `workmanship`, `worldliness`, `workforce`, `worldwide`, `worthwhile`, `worthlessness`.

## 2. Acceptance criteria

- [x] **AC-25**: The spelling catalog exposes a stable `or-saying-er` lesson containing exactly the 18 photographed words in the photographed order, without changing the default lesson or removing existing lessons.
- [x] **AC-26**: Every new word has a child-friendly definition, expanded explanation, example sentence, hint, meaningful alt text, repository-local SVG illustration, local word audio, and local definition audio.
- [x] **AC-27**: The new lesson appears in the existing lesson picker, persists when selected, and drives Learn, Game, and Test through the shared dynamic spelling engine.
- [x] **AC-28**: The full automated test suite and coverage gate pass, release `v1.3.0` is committed, pushed to `master`, and the GitHub Pages deployment completes successfully.

## 3. Test coverage

- `tests/spelling-lesson-catalog.test.mjs` — word order, schema completeness, and local asset paths.
- `tests/spelling-lesson-ui.test.mjs` — third lesson card, selection persistence, and engine hand-off.
- Existing spelling engine and UI suites verify that every catalog lesson uses the same Learn, Game, and Test paths.

## 4. Impacted files

- `content/spelling-catalog.js`
- `content/or-saying-er/`
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- release and task documentation

## 5. Release and artifacts

- Version: `v1.3.0`
- Plan: `docs/plans/TASK-008-implementation-plan.md`
- Walkthrough: `docs/walkthroughs/TASK-008-walkthrough.md`
- Release notes: `docs/releases/v1.3.0.md`
