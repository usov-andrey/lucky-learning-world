# Active Implementation Plan: TASK-020, TASK-021, TASK-024 Math Progress Repair

## Goal

Restore trustworthy Math Realm progress by persisting per-fact mastery, displaying
canonical saved stars, and generating valid, finishable Math Mix questions.

## Workstreams

1. **TASK-020** — update and persist `factStats` on every answer; preserve it through
   normalization and reload; verify weak-fact prioritization.
2. **TASK-021** — render total and per-level stars from `progression.levels` so Lucky's
   existing saved progress appears immediately.
3. **TASK-024** — pass numeric tables into the Mix planner, reject invalid inputs, and
   verify a complete Mix session never renders `NaN`.

## Permanent Plans

- `docs/plans/TASK-020-implementation-plan.md`
- `docs/plans/TASK-021-implementation-plan.md`
- `docs/plans/TASK-024-implementation-plan.md`

## Verification

- AC-tagged red/green regression tests for all three workstreams.
- `npm test` and the permanent Playwright `npm run test:e2e` scenario.
- Clean Git status after task-specific commits.
