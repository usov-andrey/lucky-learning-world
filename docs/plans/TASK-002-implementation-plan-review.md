# Review: TASK-002 Implementation Plan (Code Coverage Measurement & AC Enforcement System)

**Reviewed document**: `docs/plans/TASK-002-implementation-plan.md` (byte-identical to root `implementation_plan.md`)
**Reviewer**: Claude Code
**Date**: 2026-07-28
**Verdict**: ⚠️ **Changes requested before approval.** The direction is right, but as written the plan cannot be executed to green: one acceptance criterion fails on day one against the existing test suite, the proposed verification test is self-recursive, and nothing in the plan actually *enforces* anything despite the title.

---

## 0. Evidence Base

All findings below were verified against the working tree, not inferred from the plan text.

| Check | Command | Result |
|---|---|---|
| Existing suite health | `npm test` | 70 tests, 70 pass, 0 fail, ~8.8 s |
| Proposed coverage command works | `node --test --experimental-test-coverage tests/*.test.mjs` | ✅ runs, prints table |
| Aggregate coverage (as proposed, tests included) | same | **63.52 % lines / 70.32 % branch / 52.22 % funcs** |
| Aggregate coverage (tests excluded) | `… --test-coverage-exclude='tests/**'` | **59.05 % lines / 65.67 % branch / 43.81 % funcs** |
| AC-tag adoption | `grep -c '@task' tests/*.test.mjs` | **1 of 12 files tagged** (`narrative-engine.test.mjs` only) |
| Local runtime | `node --version` | v22.23.1 |
| CI runtime | `.github/workflows/deploy.yml:28` | **Node 20** |

Per-file baseline worth recording in the task file (measured, tests excluded):

```
app.js                 44.84 |  41.38 |  17.43
engine/math-engine.js  53.74 |  69.70 |  68.18
engine/progression.js  36.88 |  18.75 |  22.22
engine/qr-generator.js 11.43 | 100.00 |   0.00
engine/share-controller.js 22.46 | 50.00 | 30.00
engine/reward-engine.js    77.78 | 84.09 | 94.74
engine/spelling-engine.js  87.11 | 65.38 | 72.73
engine/narrative-engine.js 100.00 | 45.45 | 100.00
telemetry.js           77.46 |  45.45 |  42.86
content/*              84–100 % lines
```

---

## 1. Blocking Findings

### B-1. AC-8.2 (AC-tagging) fails immediately — 11 of 12 test files are untagged, and the plan has no backfill step

The plan proposes a test that verifies "test files are tagged with `// @task` and `// @ac` annotations according to `DEVELOPMENT_RULES.md`". Current state:

| Tagged | Untagged |
|---|---|
| `narrative-engine.test.mjs` (4 × `@task`, 5 × `@ac`) | `catalog`, `comic-catalog`, `engine`, `integration-imports`, `narrative-integration`, `progression`, `reward-engine`, `spelling-engine`, `theme-integration`, `theme-settings`, `ui-smoke` |

This is inherited debt: `docs/plans/TASK-001-implementation-plan.md` Step 4 committed to tagging `narrative-integration.test.mjs` and `ui-smoke.test.mjs`, and that was never completed. TASK-002 silently inherits it and will turn it into a hard failure.

Worse, most of those files cover domains with **no task and no AC to point at** — there is no TASK covering `catalog`, `math-engine`, `progression`, `reward-engine`, or `theme-settings`, so "just add tags" is not a mechanical fix; it requires authoring ACs (or backfilled task records) for five subsystems.

**Required decision (pick one, state it in the plan):**
- **(a) Scoped enforcement (recommended)**: AC-8.2 applies only to test files created or modified after TASK-002. Ship an explicit, dated waiver list of the 11 legacy files inside `tasks/TASK-002-*.md`, and the enforcement test reads that list. Waiver list must only ever shrink.
- **(b) Full backfill**: add a Step 0 that authors ACs for the untagged domains and tags all 12 files. Realistic cost: this is a bigger task than the coverage work itself and probably deserves its own TASK-003.

Silently shipping (a) without writing the waiver down is not acceptable — it makes the criterion unfalsifiable.

### B-2. `tests/coverage.test.mjs` spawning `npm run test:coverage` is infinitely recursive

The plan says the new test will verify "`npm run test:coverage` command execution". `tests/coverage.test.mjs` matches the glob `tests/*.test.mjs`, so the child process re-runs the same file, which spawns another child, and so on. This hangs CI and can exhaust the machine — it is not merely slow.

The same trap applies to plain `npm test`, since the new file is in that glob too.

**Fix — one of:**
- Do not spawn at all. Assert static, cheap facts: `package.json` contains the `test:coverage` script with the expected flags; every non-waived `tests/*.test.mjs` contains a `@task` + `@ac` pair. This is a lint test and runs in milliseconds.
- If an end-to-end spawn is genuinely wanted, guard it: child is invoked with `LLW_COVERAGE_CHILD=1` and the test returns early when that variable is set, **and** the child run targets a fixed narrow file list rather than the glob.

Recommendation: the first option. Coverage *enforcement* belongs in the runner flags and CI (see B-3), not inside a test that shells out to itself.

### B-3. Nothing in the plan enforces anything — the title promises a gate that the design does not contain

`--experimental-test-coverage` only *prints* a table; the process still exits 0 at 3 % coverage. As specified, TASK-002 delivers reporting, not "Acceptance Criteria Enforcement".

The actual gate on Node 22 is threshold flags:

```
--test-coverage-lines=NN --test-coverage-branches=NN --test-coverage-functions=NN
```

which make the run exit non-zero below target. The plan must name the numbers. Given the measured baseline (59.05 / 65.67 / 43.81 with tests excluded), a defensible opening ratchet is **lines 55, branches 60, functions 40** — just under current, so it catches regressions without blocking today's work — with the rule that the numbers only move up.

Also missing: the plan never adds coverage to `.github/workflows/deploy.yml`. A threshold no pipeline runs is documentation, not enforcement.

### B-4. CI is pinned to Node 20; the flags this task needs do not exist there

`.github/workflows/deploy.yml:28` uses `node-version: '20'`. `--experimental-test-coverage` exists on Node 20, but `--test-coverage-exclude` / `--test-coverage-include` (Node ≥ 22.5) and `--test-coverage-lines|branches|functions` (Node ≥ 22.8) do not — passing them on Node 20 aborts the run with an unknown-option error.

So either the plan bumps CI to `node-version: '22'` (local dev is already on 22.23.1, so this also removes a silent version skew), or coverage stays local-only and the plan must say so explicitly. Add an `engines` field to `package.json` while you are there.

---

## 2. Major Findings

### M-1. No include/exclude scoping — the headline number is inflated by the tests themselves

Node counts the test files as covered code, and they are trivially 100 %. That is the entire gap between the two measurements above: **63.52 % reported vs 59.05 % real**. Twelve always-100 % files dragging the aggregate up means the metric can stay green while `engine/` rots.

Additionally, `app.js` (55 KB browser orchestrator, 44.84 % lines) dominates the aggregate and is only incidentally exercised through the jsdom smoke test. Mixing it with pure engine modules produces one number that means nothing for either.

**Recommendation**: define two scopes in the AC — a hard gate on `engine/**` + `content/**` (the pure, testable core, currently ~75–80 % lines), and a report-only line for `app.js` / `telemetry.js`. Always exclude `tests/**`, `node_modules/**`, `v1/**`, `v2/**` (the version snapshots are duplicate code and will double-count).

### M-2. AC-8.1 as worded is not testable

"Coverage Execution & Report Generation" states no pass/fail condition. Per `DEVELOPMENT_RULES.md` §2, an AC must be an explicit, testable condition. Suggested rewrite:

> **[AC-8.1] Coverage Gate**: `npm run test:coverage` MUST execute all suites with V8 coverage, exclude `tests/**`, `node_modules/**`, `v1/**`, `v2/**`, and MUST exit non-zero when coverage of `engine/**` and `content/**` falls below **75 % lines / 60 % branches / 65 % functions**. Baseline at TASK-002 release is recorded in `tasks/TASK-002-code-coverage-ac-system.md` §6.

> **[AC-8.2] Test Traceability**: Every `tests/*.test.mjs` file created or modified after TASK-002 MUST contain at least one `// @task TASK-XXX` and one `// @ac AC-Y` annotation. Legacy files listed in the TASK-002 waiver table are exempt; the waiver table MUST NOT grow.

(Numbers above are the `engine/**`+`content/**` scope, not the whole repo — measure once before fixing them.)

### M-3. Wrong file paths in the Verification Plan

The plan's manual-verification step names `engine/spelling-engine.mjs` and `engine/narrative-engine.mjs`. Neither exists — the real files are `engine/spelling-engine.js` and `engine/narrative-engine.js` (the whole `engine/` directory is `.js`; only tests are `.mjs`). Minor in isolation, but it indicates the plan was not checked against the tree, which is also where B-1 and B-2 came from.

### M-4. `--test-coverage` is not a Node flag

Line 8 of the plan offers "`--experimental-test-coverage` / `--test-coverage`" as if they were alternatives. There is no `--test-coverage` flag; the family is `--test-coverage-lines|branches|functions|include|exclude`. Remove the alias to avoid someone implementing it.

---

## 3. Compliance Gaps vs `DEVELOPMENT_RULES.md`

| Rule | Status | Gap |
|---|---|---|
| §1 Task file `tasks/TASK-XXX-<slug>.md` | ✅ | Planned as `TASK-002-code-coverage-ac-system.md` |
| §1 Master index sync | ⚠️ | Plan says "register in INDEX", but INDEX columns require **Version**, **AC Count**, **Primary Test File** — none are decided in the plan |
| §1 GitHub sync (`npm run task:sync`) | ❌ | Not in the plan's steps |
| §2 AC first, in **both** `tasks/TASK-XXX.md` and `ACCEPTANCE_CRITERIA.md` | ✅ | Both covered |
| §3 Walkthrough `docs/walkthroughs/TASK-002-walkthrough.md` + root `walkthrough.md` copy | ❌ | **Missing entirely** from deliverables — mandatory artifact |
| §3 Unique plan filename + root copy | ✅ | Both present and identical |
| §3 SemVer release decision | ❌ | No statement of whether this is a `patch` bump via `scripts/release.mjs --bump=patch --task=TASK-002` or explicitly release-exempt (dev tooling only). `CHANGELOG.md` handling unstated |
| §10 Zero-Build preserved | ✅ | Correct — no runtime files touched, no bundler, GitHub Pages unaffected |
| §10 Pre-commit `node --test tests/*.test.mjs` | ✅ | In verification plan |

### AC numbering convention conflict

`tasks/templates/TASK-TEMPLATE.md` and the tagging example in `DEVELOPMENT_RULES.md` §2 use flat `AC-1`, `AC-2`. `ACCEPTANCE_CRITERIA.md` uses sectioned `AC-8.1`, `AC-8.2`. The plan uses the sectioned form. Existing tags in `tests/narrative-engine.test.mjs` use the flat form (`// @ac AC-4:`).

An enforcement test that regex-matches tags needs one answer. **Recommendation**: tags carry the master-document ID (`// @ac AC-8.1`), the task file mirrors the same IDs, and the enforcement regex accepts `AC-\d+(\.\d+)?`. Whichever way it goes, write it into `DEVELOPMENT_RULES.md` §2 as part of this task — otherwise the next agent picks the other convention.

---

## 4. Minor Notes

- **"Open Questions: None at this time"** is not accurate. At minimum three decisions are open and belong to the user: the threshold numbers (B-3), the coverage scope (M-1), and the tag-backfill policy (B-1). Listing them is the point of the section.
- **No baseline is recorded.** Without committing today's numbers into the task file, a future "coverage dropped" claim is unprovable. The table in §0 of this review is ready to paste.
- **`telemetry.js` as a manual-verification target** (77.46 %) is incidental jsdom smoke-test coverage. Either give it a number to hold or drop it from the verification list.
- **`v1/` and `v2/` snapshots** contain full copies of `app.js` and friends. If they are not excluded, the report doubles/triples the same uncovered lines and the aggregate becomes unreadable.
- **Both plan copies must stay in sync.** Root `implementation_plan.md` and `docs/plans/TASK-002-implementation-plan.md` are currently byte-identical; any accepted revision must be applied to both, per §3.
- **Uncommitted tree.** `git status` shows TASK-001 artifacts (`tasks/`, `docs/`, `scripts/*.mjs`, `CHANGELOG.md`, `walkthrough.md`) still untracked/modified. TASK-002 builds directly on them — land TASK-001 first so a coverage regression can be bisected against a clean history.

---

## 5. What Is Right

Worth keeping as-is:

- Native V8 coverage over an external tool (nyc/c8) is exactly the correct call for this repo — zero new runtime dependencies, no bundler, Zero-Build architecture untouched.
- Correctly scoped as non-invasive: no changes to `app.js`, `engine/`, `index.html`, so GitHub Pages deployment risk is nil.
- Extending `ACCEPTANCE_CRITERIA.md` with a new numbered section rather than editing existing ones respects the unique-history rule.
- Section 8 is genuinely free in the master AC document (current sections 1–7), so no renumbering collision.
- The proposed command does work as written on the local Node 22 toolchain — verified, not assumed.

---

## 6. Recommended Revision (concrete)

Replace the plan's step list with:

1. **Decide and record** (user input required): thresholds, coverage scope, tag-backfill policy → into "Open Questions" answers.
2. **Land TASK-001** — commit the untracked task/docs/scripts artifacts first.
3. **`tasks/TASK-002-code-coverage-ac-system.md`** from the template, including the measured baseline table and the legacy-tag waiver table.
4. **`package.json`**:
   ```json
   "test:coverage": "node --test --experimental-test-coverage --test-coverage-exclude=tests/** --test-coverage-exclude=v1/** --test-coverage-exclude=v2/** tests/*.test.mjs",
   "test:coverage:gate": "npm run test:coverage -- --test-coverage-lines=75 --test-coverage-branches=60 --test-coverage-functions=65"
   ```
   plus `"engines": { "node": ">=22.8" }`. (Verify the exact flag repetition syntax on the pinned Node before committing — `--test-coverage-exclude` accepts multiple occurrences.)
5. **`ACCEPTANCE_CRITERIA.md`** — Section 8 with the rewritten, measurable AC-8.1 / AC-8.2 from M-2.
6. **`DEVELOPMENT_RULES.md`** §2 — pin the AC-ID format for tags.
7. **`tests/coverage.test.mjs`** — static assertions only (script presence + flags; tag lint over non-waived files). No self-spawning.
8. **`.github/workflows/deploy.yml`** — bump to Node 22, replace `npm test` with `npm run test:coverage:gate`.
9. **`tasks/INDEX.md`** — full row: status `ACCEPTED`, version, AC count 2, primary test file `tests/coverage.test.mjs`.
10. **`npm run task:sync`** — GitHub Issue.
11. **`docs/walkthroughs/TASK-002-walkthrough.md`** + root `walkthrough.md` copy.
12. **Release decision** — `node scripts/release.mjs --bump=patch --task=TASK-002`, or an explicit written statement that dev tooling is release-exempt.

---

## 7. Absolute Paths

- Review: `D:\SD\personal\projects\lucky-learning-world\docs\plans\TASK-002-implementation-plan-review.md`
- Reviewed plan: `D:\SD\personal\projects\lucky-learning-world\docs\plans\TASK-002-implementation-plan.md`
- Root plan copy: `D:\SD\personal\projects\lucky-learning-world\implementation_plan.md`
- Rules: `D:\SD\personal\projects\lucky-learning-world\DEVELOPMENT_RULES.md`
- Master AC: `D:\SD\personal\projects\lucky-learning-world\ACCEPTANCE_CRITERIA.md`
- Task index: `D:\SD\personal\projects\lucky-learning-world\tasks\INDEX.md`
- CI workflow: `D:\SD\personal\projects\lucky-learning-world\.github\workflows\deploy.yml`
