---
id: TASK-033
title: "Add ‹st› Saying /s/ Spelling Lesson"
status: RELEASED
version: v1.12.0
created: 2026-09-12
github_issue: null
---

# TASK-033: Add ‹st› Saying /s/ Spelling Lesson

## Context

The owner supplied a school-book photo headed `‹st› saying /s/` and requested the same
complete treatment as the previous spelling lesson. The canonical order is: `castle`,
`bustle`, `listen`, `thistle`, `jostle`, `glisten`, `bristle`, `fasten`, `hasten`,
`moisten`, `whistle`, `gristle`, `Christmas`, `mistletoe`, `chestnut`, `nestle`,
`wrestle`, `chasten`.

## Acceptance Criteria

- [x] **AC-114**: The spelling catalog exposes a stable `st-saying-s` lesson with
  exactly the 18 photographed words in order, preserves every existing lesson, and
  makes the new final catalog entry the default for players without a saved choice.
- [x] **AC-115**: Every word has child-friendly learning copy, meaningful alt text,
  a local original SVG illustration, local `en-GB-SoniaNeural` word audio and definition
  audio at `-15%`, with matching manifest and provenance.
- [x] **AC-116**: The compact picker shows all nine lessons exactly once and the new
  lesson works through the shared Learn, Game, and Test spelling engine.
- [x] **AC-117**: The complete automated suite passes, release artifacts are written,
  and version `v1.12.0` is deployed from `master`.

## Impacted Files

- `content/spelling-catalog.js`
- `content/st-saying-s/`
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- release and task documentation
