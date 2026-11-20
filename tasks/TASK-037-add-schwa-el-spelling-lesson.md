---
id: TASK-037
title: "Add Schwa ‹el› Spelling Lesson"
status: TESTED
version: v1.16.0
created: 2026-11-20
github_issue: null
---

# TASK-037: Add Schwa ‹el› Spelling Lesson

The schoolbook lists three groups of six words.

1. level, vowel, novel, camel, model, marvel
2. tunnel, barrel, travel, towel, cancel, mussel
3. morsel, snorkel, sequel, yodel, cockerel, scoundrel

## Acceptance criteria

- [x] **AC-130**: The schwa-el lesson contains the 18 photographed words in order and is the default for a new or invalid selection.
- [x] **AC-131**: Each word has an English definition, explanation, example, hint and original illustration, plus British Sonia word and definition recordings at -15%.
- [x] **AC-132**: The picker offers all thirteen lessons, restores a saved choice and uses the new deck in Learn, Tiles, Digital Test and Paper Test.
- [ ] **AC-133**: The unit suite, coverage gate and Chromium scenario pass. GitHub Pages serves v1.16.0 and all 54 lesson assets match the release.

## Verification

- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## Release

- `docs/releases/v1.16.0.md`
- `docs/walkthroughs/TASK-037-walkthrough.md`
