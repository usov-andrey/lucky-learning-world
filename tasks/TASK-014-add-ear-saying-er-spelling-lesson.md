---
id: TASK-014
title: "Add 'ear' Saying /er/ Spelling Lesson as New Default"
status: RELEASED
version: v1.5.0
created: 2026-08-08
github_issue: null
---

# TASK-014: Add 'ear' Saying /er/ Spelling Lesson as New Default

## 1. Goal and context

Add the 18 words from the supplied school-book photo ("‹ear› saying /er/") as a new
selectable spelling lesson, matching the depth of the existing `or-saying-er` lesson
(TASK-008): full definitions, extended explanations, example sentences, hints, local
SVG illustrations, and local Sonia-voice word and definition audio. Unlike TASK-008,
the owner explicitly asked for this lesson to become the **current default** lesson
(`DEFAULT_SPELLING_LESSON_ID`), replacing Page 22.

This corrects a routing mistake: the same 18 words were first added to the archived
standalone `lucky-spelling-skill` project instead of Lucky's Learning World. That
work is superseded by this task; `lucky-spelling-skill` is now marked archived.

Canonical word order: `earn`, `learn`, `heard`, `earth`, `search`, `earnings`, `yearn`,
`early`, `pearl`, `dearth`, `hearse`, `earnest`, `rehearse`, `overheard`, `researcher`,
`searchlight`, `earthworm`, `earthquake`.

## 2. Acceptance criteria

- [x] **AC-48**: The spelling catalog exposes a stable `ear-saying-er` lesson containing
      exactly the 18 photographed words in the photographed order, without removing any
      existing lesson.
- [x] **AC-49**: Every new word has a child-friendly definition, expanded explanation,
      example sentence, hint, meaningful alt text, repository-local SVG illustration,
      local Sonia (`en-GB-SoniaNeural`, `-15%`) word audio, and local Sonia definition
      audio, with a matching provenance file.
- [x] **AC-50**: `DEFAULT_SPELLING_LESSON_ID` is `ear-saying-er`; the lesson picker shows
      it as active by default; `getSpellingLesson()` safely falls back to it (instead of
      the previous hardcoded `page-22` fallback) for unknown or missing selections.
- [x] **AC-51**: Page 22, Schwa ‹er›, and 'or' saying /er/ remain unchanged, fully
      selectable, and drive Learn, Game, and Test through the same shared engine.

## 3. Test coverage

- `tests/spelling-lesson-catalog.test.mjs` — word order, schema completeness, local
  asset existence/integrity, manifest/provenance match, and default/fallback behavior.
- `tests/spelling-lesson-ui.test.mjs` — fourth lesson card, default-active card,
  selection persistence, and engine hand-off.
- Existing spelling engine and UI suites verify that every catalog lesson uses the same
  Learn, Game, and Test paths.

## 4. Impacted files

- `content/spelling-catalog.js`
- `content/ear-saying-er/`
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- `index.html` (static placeholder image/definition before first render)
- release and task documentation

## 5. Release and artifacts

- Version: `v1.5.0`
- Plan: `docs/plans/TASK-014-implementation-plan.md`
- Walkthrough: `docs/walkthroughs/TASK-014-walkthrough.md`
- Release notes: `docs/releases/v1.5.0.md`
