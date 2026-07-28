# TASK-002: Code Coverage Measurement & Acceptance Criteria Enforcement System

Implement native V8 code coverage reporting for `lucky-learning-world` using Node test runner's coverage capabilities (`node --test --experimental-test-coverage`), establish formal Master Acceptance Criteria rules for test coverage, and tag test suites for end-to-end traceability.

## User Review Required

> [!IMPORTANT]
> - Node.js native test coverage (`--experimental-test-coverage` / `--test-coverage`) will be added to `package.json` as `npm run test:coverage`.
> - Coverage reporting will output summary statistics for test runs without modifying any runtime game files (`app.js`, `engine/`, `index.html`), maintaining 100% Zero-Build architecture and GitHub Pages compatibility.
> - A dedicated test file `tests/coverage.test.mjs` will verify coverage script execution and AC compliance.

## Open Questions

None at this time. All requirements follow the established `DEVELOPMENT_RULES.md` and `ACCEPTANCE_CRITERIA.md` standards.

## Proposed Changes

### Task System & Master Documentation

#### [NEW] [TASK-002-code-coverage-ac-system.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/TASK-002-code-coverage-ac-system.md)
- Formal task specification containing idea, Acceptance Criteria (AC-8.1, AC-8.2), test coverage mapping, and impacted files.

#### [MODIFY] [INDEX.md](file:///d:/SD/personal/projects/lucky-learning-world/tasks/INDEX.md)
- Register `TASK-002` in the master task index table.

#### [MODIFY] [ACCEPTANCE_CRITERIA.md](file:///d:/SD/personal/projects/lucky-learning-world/ACCEPTANCE_CRITERIA.md)
- Add Section 8: `🧪 Code Coverage Measurement & AC Traceability Rules` defining `[AC-8.1]` (Coverage Execution & Report Generation) and `[AC-8.2]` (AC-Tagging & Test Traceability).

---

### Configuration & Scripts

#### [MODIFY] [package.json](file:///d:/SD/personal/projects/lucky-learning-world/package.json)
- Add `"test:coverage": "node --test --experimental-test-coverage tests/*.test.mjs"` to `scripts`.

---

### Test Suite

#### [NEW] [coverage.test.mjs](file:///d:/SD/personal/projects/lucky-learning-world/tests/coverage.test.mjs)
- Create automated test verifying:
  - `npm run test:coverage` command execution.
  - Test files are tagged with `// @task` and `// @ac` annotations according to `DEVELOPMENT_RULES.md`.

## Verification Plan

### Automated Tests
- Run `npm test` to ensure all existing test suites pass.
- Run `npm run test:coverage` to verify V8 coverage calculation across all test files.

### Manual Verification
- Inspect coverage summary output for core engine modules (`engine/spelling-engine.mjs`, `engine/narrative-engine.mjs`, `telemetry.js`).
