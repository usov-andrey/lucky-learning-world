---
id: TASK-025
title: "Add 'u' Saying Long /oo/ Spelling Lesson"
status: RELEASED
version: v1.8.0
created: 2026-08-15
github_issue: null
---

# TASK-025: Add 'u' Saying Long /oo/ Spelling Lesson

## 💡 1. Idea & Proposal

- **Context**: The owner supplied a school-book photo titled "‹u› saying long /oo/" with 18
  words (three star-graded groups of six) and asked for them to be added as a new
  selectable spelling lesson and released. This is a new lesson alongside the existing
  four (`page-22`, `schwa-er`, `or-saying-er`, `ear-saying-er`), not a default change.
  Canonical word order (as photographed, top to bottom): `super`, `ruin`, `flu`, `fluid`,
  `gnu`, `truth`, `truly`, `cruel`, `lunar`, `ruby`, `fluent`, `superb`, `crucial`,
  `frugal`, `glucose`, `superior`, `plumage`, `translucent`.
- **Proposed Solution**: Mirror the TASK-014 (`ear-saying-er`) pattern exactly: local
  Sonia-voice audio via `scripts/generate-spelling-audio.py`, original house-style SVG
  illustrations, a new `U_SAYING_OO_LESSON` catalog entry appended to `SPELLING_LESSONS`,
  and matching test coverage. `DEFAULT_SPELLING_LESSON_ID` stays `ear-saying-er`.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-84**: The spelling catalog exposes a stable `u-saying-oo` lesson containing
      exactly the 18 photographed words in the photographed order, without removing or
      altering any existing lesson, and `DEFAULT_SPELLING_LESSON_ID` remains unchanged.
- [x] **AC-85**: Every new word has a child-friendly definition, expanded explanation,
      example sentence, hint, meaningful alt text, repository-local SVG illustration,
      local Sonia (`en-GB-SoniaNeural`, `-15%`) word audio, and local Sonia definition
      audio, with a matching provenance file for both audio and images.
- [x] **AC-86**: The lesson picker shows a fifth selectable lesson card for `u-saying-oo`;
      selecting it persists via `setSelectedSpellingLessonId` and drives Learn, Game, and
      Test through the same shared engine as every other lesson.

## 🧪 3. Test Coverage

- `tests/spelling-lesson-catalog.test.mjs` — word order, schema completeness, local asset
  existence/integrity, manifest/provenance match (tagged `// @task TASK-025`,
  `// @ac AC-84`, `// @ac AC-85`).
- `tests/spelling-lesson-ui.test.mjs` — fifth lesson card, selection persistence, and
  engine hand-off (tagged `// @task TASK-025`, `// @ac AC-86`).

## 💻 4. Impacted Code Files

- `content/spelling-catalog.js`
- `content/u-saying-oo/` (`audio-manifest.json`, `audio/`, `images/`)
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- release and task documentation

## 📦 5. Release & Artifacts

- **Version**: `v1.8.0`
- **Plan**: `docs/plans/TASK-025-implementation-plan.md`
- **Release Notes / Walkthrough**: `docs/releases/v1.8.0.md`
