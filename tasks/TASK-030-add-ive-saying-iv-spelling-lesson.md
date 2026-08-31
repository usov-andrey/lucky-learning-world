---
id: TASK-030
title: "Add ‹ive› Saying /iv/ Spelling Lesson"
status: RELEASED
version: v1.10.0
created: 2026-08-31
github_issue: null
---

# TASK-030: Add ‹ive› Saying /iv/ Spelling Lesson

## Context

The owner supplied a school-book photo headed `‹ive› saying /iv/` and requested the
same complete treatment as the previous spelling lesson. The canonical order is:
`festive`, `positive`, `active`, `massive`, `negative`, `motive`, `adjective`,
`impressive`, `explosive`, `elusive`, `expensive`, `superlative`, `constructive`,
`destructive`, `exclusive`, `inclusive`, `alliterative`, `imaginative`.

## Acceptance Criteria

- [x] **AC-103**: The spelling catalog exposes a stable `ive-saying-iv` lesson with
  exactly the 18 photographed words in order, preserves existing lessons, and leaves
  `DEFAULT_SPELLING_LESSON_ID` unchanged.
- [x] **AC-104**: Every word has child-friendly learning copy, meaningful alt text,
  a local SVG illustration, local `en-GB-SoniaNeural` word audio and definition audio
  at `-15%`, with matching manifest and provenance.
- [x] **AC-105**: The lesson picker shows a seventh selectable lesson and selection
  persists through the shared Learn, Game, and Test spelling engine.
- [x] **AC-106**: The complete test suite passes, release artifacts are written, and
  version `v1.10.0` is deployed from `master`.

## Impacted Files

- `content/spelling-catalog.js`
- `content/ive-saying-iv/`
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- release and task documentation
