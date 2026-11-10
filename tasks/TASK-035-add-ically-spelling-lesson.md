---
id: TASK-035
title: "Add ‹-ically› Spelling Lesson"
status: TESTED
version: v1.14.0
created: 2026-11-10
github_issue: null
---

# TASK-035: Add ‹-ically› Spelling Lesson

## Context

The owner supplied a schoolbook photo and requested a lesson and release in
the same format as previous spelling sets. The 18 words, in photographed order,
are artistically, critically, logically, quizzically, basically, vertically,
historically, politically, romantically, technically, typically, chaotically,
alphabetically, traumatically, majestically, rhythmically, sarcastically,
catastrophically.

## Acceptance Criteria

- [x] **AC-122**: The stable lesson ID is ically-ending. Its 18 words match the photograph in order, and it is the default for players without a valid saved lesson.
- [x] **AC-123**: Each word has child-friendly English learning copy, an original SVG with meaningful alt text, and approved Sonia word and definition MP3s at -15% with matching manifest and provenance.
- [x] **AC-124**: The dropdown lists all eleven lessons exactly once, restores valid saved choices, and supports the new lesson in Learn, Tiles, Digital Test, and Paper Test.
- [ ] **AC-125**: The full suite, coverage gate, and Chromium scenario pass. GitHub Pages serves v1.14.0 from master and all 54 new illustrations and audio files match the release.

## Test Coverage

- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## Impacted Files

- `content/spelling-catalog.js` and `content/ically-ending/`
- Catalog, picker, and main-scenario checks, release metadata and documentation

## Release & Artifacts

- Version v1.14.0
- `docs/plans/TASK-035-implementation-plan.md`
- `docs/walkthroughs/TASK-035-walkthrough.md`
- `docs/releases/v1.14.0.md`
