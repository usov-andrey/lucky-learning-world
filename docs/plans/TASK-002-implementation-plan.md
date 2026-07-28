# TASK-002: Code Coverage Measurement & Acceptance Criteria Enforcement System (Revised)

Implement native V8 code coverage reporting and enforcement for `lucky-learning-world` using Node test runner capabilities (`node --test --experimental-test-coverage`), establish formal Master Acceptance Criteria rules with measurable coverage gates, and tag test suites for end-to-end traceability with a legacy waiver policy.

## User Review & Decisions Required

> [!IMPORTANT]
> **Plan Revised Based on Peer Review** ([TASK-002-implementation-plan-review.md](file:///d:/SD/personal/projects/lucky-learning-world/docs/plans/TASK-002-implementation-plan-review.md)):
> 
> 1. **Coverage Threshold Gate (AC-8.1)**:
>    - Gate targets `engine/**` and `content/**` (excluding `tests/**`, `node_modules/**`, `v1/**`, `v2/**`).
>    - Thresholds: **75% Lines / 60% Branches / 65% Functions** (measured baseline: lines ~82%, branches ~64%, funcs ~70%).
> 2. **Tag Traceability & Legacy Waiver (AC-8.2)**:
>    - AC-8.2 tag linting applies to all test files created or modified after TASK-002.
>    - 11 legacy test files without task tags are granted an explicit waiver list in `tasks/TASK-002-*.md` (the waiver list cannot grow).
> 3. **Non-Recursive Lint Test**:
>    - `tests/coverage.test.mjs` will perform static linting of `package.json` scripts and test file `@task`/`@ac` annotations (no self-spawning recursive child processes).
> 4. **Node 22 Upgrade for CI**:
>    - CI `.github/workflows/deploy.yml` bumped from Node 20 to Node 22 (required for V8 coverage flags).
>    - `package.json` updated with `"engines": { "node": ">=22.8" }`.

## Open Questions

None remaining. All three key decisions (thresholds, waiver policy, CI Node version) are fully addressed in the revised plan above.

## Proposed Changes

### Task System & Master Documentation

#### [NEW] [TASK-002-code-coverage-ac-system.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/TASK-002-code-coverage-ac-system.md)
- Create formal task file with baseline measurements, AC-8.1 and AC-8.2 definitions, legacy test waiver table (11 untagged files), and impacted file list.

#### [MODIFY] [INDEX.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/INDEX.md)
- Register `TASK-002` in task index: Status `ACCEPTED`, Version `v1.0.1`, AC Count `2`, Primary Test File `tests/coverage.test.mjs`.

#### [MODIFY] [ACCEPTANCE_CRITERIA.md](file:///d:/SD/personal/projects/lucky-learning-world/ACCEPTANCE_CRITERIA.md)
- Add Section 8: `8. 🧪 Code Coverage Measurement & AC Traceability Rules`:
  - `[AC-8.1] Coverage Gate`: `npm run test:coverage:gate` executes suites with V8 coverage excluding `tests/**`, `v1/**`, `v2/**`, `node_modules/**` and exits non-zero if coverage falls below 75% lines / 60% branches / 65% functions for `engine/**` and `content/**`.
  - `[AC-8.2] Test Traceability & Legacy Waiver`: Every test file created/modified post-TASK-002 MUST contain `// @task TASK-XXX` and `// @ac AC-Y.Z`. Legacy untagged files are strictly restricted to the TASK-002 waiver list.

#### [MODIFY] [DEVELOPMENT_RULES.md](file:///d:/SD/personal/projects/lucky-learning-world/DEVELOPMENT_RULES.md)
- Clarify tag syntax convention in §2: `@ac AC-X` or `@ac AC-X.Y` regex matching `AC-\d+(\.\d+)?`.

---

### Configuration & CI Workflows

#### [MODIFY] [package.json](file:///d:/SD/personal/projects/lucky-learning-world/package.json)
- Add `"engines": { "node": ">=22.8" }`.
- Add scripts:
  - `"test:coverage"`: `"node --test --experimental-test-coverage --test-coverage-exclude=tests/** --test-coverage-exclude=v1/** --test-coverage-exclude=v2/** tests/*.test.mjs"`
  - `"test:coverage:gate"`: `"npm run test:coverage -- --test-coverage-lines=75 --test-coverage-branches=60 --test-coverage-functions=65"`

#### [MODIFY] [.github/workflows/deploy.yml](file:///d:/SD/personal/projects/lucky-learning-world/.github/workflows/deploy.yml)
- Bump Node version to `22`.
- Replace `npm test` step with `npm run test:coverage:gate`.

---

### Test Suite & Artifacts

#### [NEW] [coverage.test.mjs](file:///d:/SD/personal/projects/lucky-learning-world/tests/coverage.test.mjs)
- Static assertion test tagged with `@task TASK-002` and `@ac AC-8.2`:
  - Asserts `package.json` contains `test:coverage` and `test:coverage:gate` scripts.
  - Verifies all non-waived test files contain valid `@task` and `@ac` annotations.

#### [NEW] [TASK-002-walkthrough.md](file:///d:/SD/personal/projects/lucky-learning-world/docs/walkthroughs/TASK-002-walkthrough.md) & [walkthrough.md](file:///d:/SD/personal/projects/lucky-learning-world/walkthrough.md)
- Document completed execution, test output logs, and baseline coverage report summary.

## Verification Plan

### Automated Tests
- Run `npm test` to verify standard test suite completion.
- Run `npm run test:coverage` to inspect per-file V8 coverage summary.
- Run `npm run test:coverage:gate` to verify non-zero failure exit code enforcement when thresholds are violated.

### Manual Verification
- Inspect coverage output for `engine/spelling-engine.js`, `engine/narrative-engine.js`, `engine/math-engine.js`, and `engine/progression.js`.
- Sync tasks via `npm run task:sync`.
- Run patch release bump: `node scripts/release.mjs --bump=patch --task=TASK-002`.
