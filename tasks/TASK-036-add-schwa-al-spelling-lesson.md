---
id: TASK-036
title: "Add Schwa ‹al› Spelling Lesson"
status: TESTED
version: v1.15.0
created: 2026-11-16
github_issue: null
---

# TASK-036: Add Schwa ‹al› Spelling Lesson

Add the schoolbook list in order: animal, coral, special, plural, total, equal,
external, several, crystal, casual, capital, hospital, abysmal, natural, journal,
festival, material, cathedral.

## Acceptance criteria

- [x] **AC-126**: A stable `schwa-al` lesson presents all 18 photographed words in order, preserves the existing eleven lessons and is the default when there is no valid saved choice.
- [x] **AC-127**: All words have English explanations, examples, hints and original local illustrations. The 36 matching word and definition MP3s use approved British Sonia at `-15%`, with provenance.
- [x] **AC-128**: The picker shows twelve unique lessons and restores valid saved choices. Schwa ‹al› works in Learn, Tiles, Digital Test and Paper Test.
- [ ] **AC-129**: The unit suite, coverage gate and Chromium scenario pass. GitHub Pages serves v1.15.0 and all 54 media assets match the release.

## Verification

The Learn scenario checks both endpoints of the new lesson, animal and cathedral.

- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## Release

- `docs/releases/v1.15.0.md`
- `docs/walkthroughs/TASK-036-walkthrough.md`
