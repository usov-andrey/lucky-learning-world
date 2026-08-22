---
id: TASK-028
title: "Add ‹ough›, ‹gh› and ‹augh› Spelling Lesson"
status: RELEASED
version: v1.9.0
created: 2026-08-22
github_issue: null
---

# TASK-028: Add ‹ough›, ‹gh› and ‹augh› Spelling Lesson

## 💡 1. Idea & Proposal

- **Context**: The owner supplied a school-book photo headed `‹ough› ‹gh› ‹augh›` and
  asked for the new words to be added in the same complete form as the previous spelling
  lesson. The photo contains 18 words in three groups of six. Canonical order, top to
  bottom: `ought`, `bought`, `brought`, `fought`, `nought`, `thought`, `ghostly`,
  `dinghy`, `ghoul`, `aghast`, `gherkin`, `yoghurt`, `naughty`, `fraught`, `caught`,
  `daughter`, `distraught`, `onslaught`.
- **Proposed Solution**: Mirror TASK-025 completely: add a sixth selectable lesson,
  child-friendly learning copy, original local SVG illustrations, approved Sonia word
  and definition audio, provenance records, catalog/UI regression coverage, release
  documentation, and a minor release. The current default lesson remains unchanged.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-96**: The spelling catalog exposes a stable `ough-gh-augh` lesson containing
      exactly the 18 photographed words in photographed order, preserves all existing
      lessons, and leaves `DEFAULT_SPELLING_LESSON_ID` unchanged.
- [x] **AC-97**: Every new word has a child-friendly definition, expanded explanation,
      example sentence, hint, meaningful alt text, repository-local SVG illustration,
      local Sonia (`en-GB-SoniaNeural`, `-15%`) word audio, and local Sonia definition
      audio, with matching audio and image provenance.
- [x] **AC-98**: The lesson picker shows a sixth selectable lesson card for
      `ough-gh-augh`; selecting it persists via `setSelectedSpellingLessonId` and drives
      Learn, Game, and Test through the shared spelling engine.

## 🧪 3. Test Coverage

- `tests/spelling-lesson-catalog.test.mjs` — canonical order, schema completeness,
  local asset integrity, manifest/provenance match (`AC-96`, `AC-97`).
- `tests/spelling-lesson-ui.test.mjs` — sixth lesson card, selection persistence, and
  shared engine hand-off (`AC-98`).

## 💻 4. Impacted Code Files

- `content/spelling-catalog.js`
- `content/ough-gh-augh/` (`audio-manifest.json`, `audio/`, `images/`)
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- release and task documentation

## 📦 5. Release & Artifacts

- **Version**: `v1.9.0`
- **Plan**: `docs/plans/TASK-028-implementation-plan.md`
- **Release Notes / Walkthrough**: `docs/releases/v1.9.0.md`
