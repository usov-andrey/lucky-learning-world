# Implementation Plan: Architecture for Task Tracking, AC-Driven Tests, Semantic Release & Diagnostics

## Approved Decisions & Principles

1. **Task & GitHub Sync**: Local-first `tasks/TASK-XXX.md` as single source of truth, synced to GitHub Issues via `scripts/sync-issues.mjs` / `gh` CLI.
2. **Major Version Snapshots**: Physical directory snapshots (`v1/`, `v2/`, etc.) kept in project root so multiple major versions can be run, viewed, and hosted simultaneously.
3. **Commit Convention**: Strict format `feat(TASK-XXX): ...` or `fix(TASK-XXX): ...` for exact git log searchability.
4. **Current Version Reset**: Version baseline reset to **`v1.0.0`** (replacing confusing historical numbers).
5. **Backfill**: Backfill existing Comic Narrative work as `TASK-001` (`tasks/TASK-001-comic-narrative.md`).
6. **Release Notes**: Auto-generated structured Release Notes in `CHANGELOG.md`, `docs/releases/vX.Y.Z.md`, and GitHub Releases.

---

## 🛠️ Execution Steps

### Step 1: Initialize Task Structure & Backfill TASK-001
- Create `tasks/` directory.
- Create `tasks/INDEX.md` master table.
- Create `tasks/templates/TASK-TEMPLATE.md`.
- Backfill `tasks/TASK-001-comic-narrative.md` with all ACs (AC-1 to AC-8) for the narrative update.

### Step 2: Update Core Rules & Diagnostic Protocol
- Update `DEVELOPMENT_RULES.md` with:
  - Task lifecycle rules (`tasks/TASK-XXX.md`).
  - AC-tagging requirement in unit tests (`// @task TASK-XXX`, `// @ac AC-Y`).
  - Git commit prefix requirement (`feat(TASK-XXX): ...`).
  - Version bump & release notes rules.
- Update `AGENTS.md` with the 4-step Agent Diagnostic Protocol for troubleshooting regressions.

### Step 3: Implement Automation Scripts (`scripts/`)
- Create `scripts/release.mjs`:
  - Handles semantic version bump (`major`, `minor`, `patch`).
  - Resets baseline to `v1.0.0`.
  - Updates version strings across `package.json`, `app.js`, `index.html`, `sw.js`, `manifest.json`.
  - Generates Release Notes in `CHANGELOG.md` and `docs/releases/vX.Y.Z.md`.
  - Handles Major version physical directory archiving (`v1/`, `v2/`...).
- Create `scripts/sync-issues.mjs`:
  - Creates/syncs GitHub Issues from `tasks/TASK-XXX.md` via `gh` CLI or REST API.

### Step 4: Tag Existing Tests with TASK-001 & AC Mapping
- Annotate `tests/narrative-engine.test.mjs`, `tests/narrative-integration.test.mjs`, `tests/ui-smoke.test.mjs` with `// @task TASK-001` and `// @ac AC-X`.

### Step 5: Update CI/CD Workflow (`.github/workflows/deploy.yml`)
- Ensure automated test suite execution `node --test tests/*.test.mjs` runs on push before GitHub Pages deployment.

---

## 🧪 Verification Plan

1. **Task & Test Searchability**:
   - Run `rg "@task TASK-001" tests/` to confirm test tagging.
2. **Release Automation**:
   - Run `node scripts/release.mjs --dry-run` to verify version synchronization and Release Notes generation.
3. **Test Suite Verification**:
   - Run `node --test tests/*.test.mjs` to ensure 100% test passing.
