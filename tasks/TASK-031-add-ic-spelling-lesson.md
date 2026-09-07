---
id: TASK-031
title: "Add ‹-ic› Spelling Lesson"
status: RELEASED
version: v1.11.0
created: 2026-09-07
github_issue: null
---

# TASK-031: Add ‹-ic› Spelling Lesson

## Context

The owner supplied a school-book photo headed `‹-ic›` and requested the same complete
treatment as the previous spelling lesson. The canonical order is: `epic`, `comic`,
`hectic`, `toxic`, `classic`, `exotic`, `heroic`, `poetic`, `athletic`, `dramatic`,
`fantastic`, `lunatic`, `chaotic`, `rhythmic`, `scientific`, `sympathetic`,
`monosyllabic`, `characteristic`.

## Acceptance Criteria

- [x] **AC-107**: The spelling catalog exposes a stable `ic-ending` lesson with
  exactly the 18 photographed words in order, preserves existing lessons, and leaves
  `DEFAULT_SPELLING_LESSON_ID` unchanged.
- [x] **AC-108**: Every word has child-friendly learning copy, meaningful alt text,
  a local SVG illustration, local `en-GB-SoniaNeural` word audio and definition audio
  at `-15%`, with matching manifest and provenance.
- [x] **AC-109**: The lesson picker shows an eighth selectable lesson and selection
  persists through the shared Learn, Game, and Test spelling engine.
- [x] **AC-110**: The complete test suite passes, release artifacts are written, and
  version `v1.11.0` is deployed from `master`.

## Impacted Files

- `content/spelling-catalog.js`
- `content/ic-ending/`
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- release and task documentation
