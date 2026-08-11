---
id: TASK-021
title: "Star Counts Always Read 0 (progression.starsByLevel Does Not Exist)"
status: TESTED
version: v1.7.3
created: 2026-08-09
github_issue: null
---

# TASK-021: Star Counts Always Read 0 (`progression.starsByLevel` Does Not Exist)

## 💡 1. Idea & Proposal

- **Context**: Found during an independent review of TASK-019. `app.js` reads
  `this.progression.starsByLevel` in two places — `renderHeader()` (`app.js:957`, the
  header's total-stars counter) and `renderMathChips()` (`app.js:1007`, the per-level
  star display on the Math Realm level-select chips) — but `progression.starsByLevel`
  does not exist anywhere in the progression schema. `engine/progression.js`'s
  `createInitialProgression()`/`normalizeStoredState()` store per-level stars at
  `progression.levels[levelId].stars` (set by `applyLevelOutcome()`). Both read sites
  therefore always get `undefined`/`{}`, so the header's total star count and every
  level chip's star display always read `0`/blank regardless of actual stars earned —
  a real, currently-live symptom on every screen that shows stars. Likely from the same
  `86a3219` narrative-engine refactor as TASK-019's bugs 1–5 (unconfirmed — not checked
  against `git show 86a3219` yet), since that commit also touched `renderHeader()`.
- **Proposed Solution**: change both read sites to derive stars from
  `progression.levels`, e.g. `Object.values(progression.levels || {}).reduce((sum, l)
  => sum + (l.stars || 0), 0)` for the header total, and `progression.levels[lvl.id]
  ?.stars || 0` per chip.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-78**: After earning stars on a level (once TASK-020/level-completion scoring
  is confirmed working — depends on TASK-019's AC-67 fix already being in place), the
  header's total star count reflects the real sum across all levels.
- [x] **AC-79**: Each Math Realm level chip's star display (`★` repeated per star)
  reflects that level's actual `progression.levels[id].stars`, not always blank.
- [x] **AC-80**: A previously saved canonical progression state displays its stars
  immediately after loading, without migration, reset, or replay.

Investigation note: `git show 86a3219 -- app.js` confirms both `starsByLevel` reads
were introduced by the same narrative refactor as TASK-019's regression cluster; this
is recorded in the walkthrough.

## 🧪 3. Test Coverage

- `tests/math-star-display.test.mjs` (`// @task TASK-021`, AC-78..AC-80).

## 💻 4. Impacted Code Files

- `app.js` — `renderHeader()` (`app.js:957`), `renderMathChips()` (`app.js:1007`).

## 📦 5. Release & Artifacts

- Target version: `v1.7.3`.
- Plan: `docs/plans/TASK-021-implementation-plan.md`.
- Walkthrough: `docs/walkthroughs/TASK-021-walkthrough.md`.
