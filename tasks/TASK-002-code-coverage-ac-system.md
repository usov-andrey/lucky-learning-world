---
id: TASK-002
title: "Code Coverage Measurement & Acceptance Criteria Enforcement System"
status: RELEASED
version: v1.0.1
created: 2026-07-28
github_issue: null
---

# TASK-002: Code Coverage Measurement & Acceptance Criteria Enforcement System

## 💡 1. Idea & Proposal
- **Context**: Code quality and automated testing in `lucky-learning-world` currently rely on running `npm test`. However, there is no automated measurement of code coverage, meaning untested execution paths or edge cases can accumulate undetected. Furthermore, while Acceptance Criteria (AC) and `@ac` test annotations are mandated by `DEVELOPMENT_RULES.md`, legacy test suites lack formal tag annotations.
- **Proposed Solution**: 
  1. Leverage Node.js native V8 test coverage capabilities (`node --test --experimental-test-coverage`) to measure and enforce coverage gates without external bundlers or build steps (preserving Zero-Build architecture).
  2. Define measurable threshold gates (`--test-coverage-lines=75`, `--test-coverage-branches=60`, `--test-coverage-functions=65`) targeting pure core logic (`engine/**`, `content/**`) while excluding tests, snapshots (`v1/`, `v2/`), and dependencies.
  3. Introduce `[AC-8.1]` and `[AC-8.2]` in `ACCEPTANCE_CRITERIA.md`.
  4. Create a static lint test `tests/coverage.test.mjs` to enforce tag traceability for new test suites while granting an explicit, non-expandable waiver table for legacy test files.
  5. Upgrade CI workflow `.github/workflows/deploy.yml` to Node 22.

## 📋 2. Acceptance Criteria (AC)
- [ ] **AC-8.1**: `npm run test:coverage:gate` MUST execute all test suites with V8 coverage excluding `tests/**`, `node_modules/**`, `v1/**`, `v2/**`, and MUST exit non-zero if coverage of `engine/**` and `content/**` falls below **75% lines / 60% branches / 65% functions**.
- [ ] **AC-8.2**: Every `tests/*.test.mjs` file created or modified after TASK-002 MUST contain at least one `// @task TASK-XXX` and one `// @ac AC-Y` (or `AC-Y.Z`) annotation. Legacy test files listed in the TASK-002 waiver table are exempt; the waiver list MUST NOT grow.

## 📊 3. Baseline Coverage Measurement (Recorded 2026-07-28)
Target Scope (`engine/**` + `content/**`):
- `engine/spelling-engine.js`: 87.11% lines | 65.38% branches | 72.73% functions
- `engine/narrative-engine.js`: 100.00% lines | 45.45% branches | 100.00% functions
- `engine/reward-engine.js`: 77.78% lines | 84.09% branches | 94.74% functions
- `engine/math-engine.js`: 53.74% lines | 69.70% branches | 68.18% functions
- `engine/progression.js`: 36.88% lines | 18.75% branches | 22.22% functions

## 📜 4. Legacy Test Waiver Table (Restricted & Non-Expandable)
The following 11 legacy test files predating TASK-002 are granted a temporary waiver from `@task`/`@ac` tag linting:
1. `tests/catalog.test.mjs`
2. `tests/comic-catalog.test.mjs`
3. `tests/engine.test.mjs`
4. `tests/integration-imports.test.mjs`
5. `tests/narrative-integration.test.mjs`
6. `tests/progression.test.mjs`
7. `tests/reward-engine.test.mjs`
8. `tests/spelling-engine.test.mjs`
9. `tests/theme-integration.test.mjs`
10. `tests/theme-settings.test.mjs`
11. `tests/ui-smoke.test.mjs`

## 🧪 5. Test Coverage
- `tests/coverage.test.mjs` (tagged with `// @task TASK-002` and `// @ac AC-8.2`)

## 💻 6. Impacted Code Files
- `package.json`
- `ACCEPTANCE_CRITERIA.md`
- `DEVELOPMENT_RULES.md`
- `tasks/INDEX.md`
- `.github/workflows/deploy.yml`
- `tests/coverage.test.mjs`

## 📦 7. Release & Artifacts
- **Version**: `v1.0.1`
- **Release Notes / Walkthrough**: `docs/walkthroughs/TASK-002-walkthrough.md`
