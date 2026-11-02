---
id: TASK-034
title: "Add Silent Letters Spelling Lesson"
status: TESTED
version: v1.13.0
created: 2026-11-02
github_issue: null
---

# TASK-034: Add Silent Letters Spelling Lesson

## Context

The owner supplied a school-book photo headed `Silent Letters` and requested the
same complete lesson and release workflow as previous additions. The photographed
order is: whirl, wreck, kneel, crumb, ascend, descend, wrangle, knuckle, limb,
gnarled, plumbing, elsewhere, ghoulish, succumb, fascinate, wrinkliest, overwhelm,
dumbfounded.

## Acceptance Criteria

- [x] **AC-118**: A stable `silent-letters` catalog lesson contains exactly the 18 photographed words in order, preserves all nine existing lessons, and becomes the default when no valid choice is saved.
- [x] **AC-119**: Each word has child-friendly English learning copy, meaningful alt text, a distinct original local SVG, and valid local Sonia (`en-GB-SoniaNeural`, `-15%`) word and definition MP3s with matching manifest and provenance.
- [x] **AC-120**: The compact picker exposes all ten lessons exactly once, preserves valid saved choices, and the new lesson works in Learn, Game, Digital Test, and Paper Test through the shared engine.
- [ ] **AC-121**: Unit tests, coverage gate, and real-browser main-scenario checks pass; version `v1.13.0` is committed and deployed from `master`, with release documentation and deployment verification recorded.

### Audio generation compatibility

The preinstalled edge-tts 7.2.8 failed with an HTTP 403 handshake on 2026-11-02.
AC-119 additionally requires a compatible generator installed locally in `.state/outputs`,
its exact version recorded in provenance, and no change of voice or silent fallback.

## Test Coverage

- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## Impacted Files

- `content/spelling-catalog.js`
- `content/silent-letters/`
- catalog and picker tests, version files, task and release documentation

## Release & Artifacts

- Target: `v1.13.0`
- Plan: `docs/plans/TASK-034-implementation-plan.md`
- Walkthrough: `docs/walkthroughs/TASK-034-walkthrough.md`
- Release notes: `docs/releases/v1.13.0.md`
