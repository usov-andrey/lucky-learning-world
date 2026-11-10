---
id: TASK-035
title: "Add ‹-ically› Spelling Lesson"
status: RELEASED
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
- [x] **AC-125**: The full suite, coverage gate, and Chromium scenario pass. GitHub Pages serves v1.14.0 from master and all 54 new illustrations and audio files match the release.

### Deployment retry

The first Pages deployment (run 42809375731) timed out while syncing files.
AC-125 additionally requires the retry to package the tracked snapshot of the
release, including the legacy entry points and all 54 new media files. The
Pages job must surface a deployment error as a failed job.

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

## Completion Evidence

- Release commit `ca399f498c8dd5b2c4c199a2f5558cd9b353c213`. Deployment commit `b8db251f4f75520b535c1b6af3e9ccef40fddebe`.
- All 149 tests passed before and after the version bump. The coverage gate and
  complete Chromium main scenario passed.
- [GitHub Pages deployment](https://github.com/usov-andrey/lucky-learning-world/actions/runs/42811082042) passed the actual deployment step.
- On 2026-11-10, the public v1.14.0 build and 18-word manifest matched the release,
  as did all 18 SVGs and 36 MP3s.
