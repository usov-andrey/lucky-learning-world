---
id: TASK-024
title: "Restore Math Progress and Fix Math Mix"
status: TESTED
version: v1.7.3
created: 2026-08-11
github_issue: null
---

# TASK-024: Restore Math Progress and Fix Math Mix

## 💡 1. Idea & Proposal

- **Context**: Lucky completed seven multiplication sessions on 2026-08-10, but the
  UI still showed zero progress. Production telemetry and local reproduction found
  three independent defects: saved stars were read from a nonexistent field
  (TASK-021), per-fact mastery was never written or normalized (TASK-020), and Math
  Mix passed level objects into a planner that requires numeric tables, producing 34
  observed `NaN` renders and unfinishable sessions.
- **Proposed Solution**: release the TASK-020 and TASK-021 repairs together with the
  Math Mix contract fix, backed by controller, storage, planner, UI, and real-Chromium
  regression coverage.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-75**: Correct and wrong Math answers update and persist fact mastery.
- [x] **AC-76**: Valid fact mastery survives normalization, migration, and reload.
- [x] **AC-77**: Persisted weak facts affect subsequent session planning.
- [x] **AC-78**: The header reads and sums canonical per-level stars.
- [x] **AC-79**: Each Math level chip renders its canonical saved stars.
- [x] **AC-80**: Existing saved stars appear without reset or replay.
- [x] **AC-81**: Starting Math Mix creates and renders only finite numeric operands.
- [x] **AC-82**: The Mix planner rejects invalid table values instead of creating
  malformed facts.
- [x] **AC-83**: A full Math Mix session reaches completion and its reward path without
  an uncaught error.

## 🧪 3. Test Coverage

- `tests/math-fact-progress.test.mjs` (AC-75..AC-77).
- `tests/math-star-display.test.mjs` (AC-78..AC-80).
- `tests/math-mix-regression.test.mjs` (AC-81..AC-83).
- `tests/e2e/full-main-scenario.e2e.mjs` (real Chromium across all three repairs).

## 💻 4. Impacted Code Files

- `app.js` — answer persistence, star rendering, and numeric Mix planner call.
- `engine/progression.js` — canonical `factStats` initial/normalized/migrated shape.
- `engine/math-engine.js` — Mix planner input validation.

## 📦 5. Release & Artifacts

- Target version: `v1.7.3`.
- Plan: `docs/plans/TASK-024-implementation-plan.md`.
- Walkthrough: `docs/walkthroughs/TASK-024-walkthrough.md`.
