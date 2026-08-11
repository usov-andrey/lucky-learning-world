---
id: TASK-020
title: "Fact Mastery Tracking Never Persists (updateFactOnAnswer Is Never Called)"
status: TESTED
version: v1.7.3
created: 2026-08-09
github_issue: null
---

# TASK-020: Fact Mastery Tracking Never Persists (`updateFactOnAnswer` Is Never Called)

## 💡 1. Idea & Proposal

- **Context**: Found during an independent review of TASK-019, while checking whether
  hard-drill mode's "serve the weakest facts first" behavior could plausibly explain
  the reported ×7 crash. `engine/math-engine.js` exports `updateFactOnAnswer(factStats,
  key, { correct, elapsedMs, sessionCount })`, and `progression.factStats` is read in
  `app.js` (`startMathLevelSession()`, `startMathMixSession()`) to build a session plan
  weighted toward facts Lucky is weak on. But `updateFactOnAnswer()` is never called
  anywhere in `app.js` — no code path records whether an individual fact was answered
  right or wrong. `factStats` is therefore always `{}` for every real player, mastery
  for every fact is always `0`, and `pickHardFocusFacts()`/`buildHardCoreBag()`/
  `sortByWeakestFirst()` (all of which sort by mastery/attempts) all silently degrade to
  an ordinary shuffle. The entire "focus on facts Lucky actually struggles with" design
  intent of hard-drill mode has never worked in production. Separately,
  `engine/progression.js`'s `normalizeStoredState()` doesn't even include `factStats` in
  its returned shape, so even if something started writing it, it would need that fixed
  too to survive a reload.
- **Proposed Solution**: call `updateFactOnAnswer()` from `handleMathAnswer()`
  on both the correct and (post-`confirmCorrection`) wrong paths, threading the result
  into `this.progression.factStats` and persisting via the existing
  `saveProgression()`; extend `normalizeStoredState()` to round-trip `factStats`.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-75**: Answering a Math Realm question, correct or wrong, calls
  `updateFactOnAnswer()` for that fact's key and persists the updated `factStats` to
  `localStorage` via the existing progression save path.
- [x] **AC-76**: `normalizeStoredState()` reads and returns `factStats` from stored
  progression data (currently dropped), so mastery survives a reload.
- [x] **AC-77**: After a session where a specific fact is answered wrong repeatedly and
  others are answered correctly, a subsequent session for the same table measurably
  prioritizes the weak fact (covered by a unit test against
  `buildLevelSessionPlan`/`buildHardCoreBag`, not requiring a real browser).

## 🧪 3. Test Coverage

- `tests/math-fact-progress.test.mjs` (`// @task TASK-020`, AC-75..AC-77).
- `tests/engine.test.mjs` remains the lower-level planner/mastery regression suite.

## 💻 4. Impacted Code Files

- `app.js` — `handleMathAnswer()`.
- `engine/progression.js` — `normalizeStoredState()`.

## 📦 5. Release & Artifacts

- Target version: `v1.7.3`.
- Plan: `docs/plans/TASK-020-implementation-plan.md`.
- Walkthrough: `docs/walkthroughs/TASK-020-walkthrough.md`.
