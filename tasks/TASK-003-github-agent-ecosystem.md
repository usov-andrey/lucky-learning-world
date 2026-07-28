---
id: TASK-003
title: "GitHub External AI Agent Ecosystem & Task Artifact Synchronization"
status: RELEASED
version: v1.0.2
created: 2026-07-28
github_issue: "#3"
---

# TASK-003: GitHub External AI Agent Ecosystem & Task Artifact Synchronization

## 💡 1. Idea & Proposal
- **Context**: Multiple AI coding agents (Antigravity, Claude Code, Cursor, Windsurf, Codex, GitHub Copilot Workspace) work on `lucky-learning-world` locally and remotely via GitHub. To ensure every agent follows identical development standards, Acceptance Criteria, task tracking, and test verification workflows, the repository needs explicit multi-agent directive adapters and GitHub Actions synchronization workflows.
- **Proposed Solution**: 
  1. Create agent adapter files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`) pointing to the master rules in `AGENTS.md` and `DEVELOPMENT_RULES.md`.
  2. Implement GitHub Issue Forms template (`.github/ISSUE_TEMPLATE/task.yml`) to standardize task submission in GitHub UI.
  3. Create GitHub Actions workflows (`.github/workflows/sync-tasks.yml` and `.github/workflows/agent-ci.yml`) to validate task structure, test coverage gates, and issue indexing on push/PR.
  4. Write `tests/github-agent-ecosystem.test.mjs` (tagged with `@task TASK-003` and `@ac AC-9.1`) to statically assert that all agent adapters, issue templates, and workflow files exist and remain valid.

## 📋 2. Acceptance Criteria (AC)
- [ ] **AC-9.1**: The repository MUST contain multi-agent directive files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`) linking to `AGENTS.md` and `DEVELOPMENT_RULES.md`.
- [ ] **AC-9.2**: The repository MUST include GitHub Issue Template (`.github/ISSUE_TEMPLATE/task.yml`) and CI workflows (`.github/workflows/sync-tasks.yml`, `.github/workflows/agent-ci.yml`) enforcing task verification and test coverage gates.

## 🧪 3. Test Coverage
- `tests/github-agent-ecosystem.test.mjs` (tagged with `// @task TASK-003` and `// @ac AC-9.1`)

## 💻 4. Impacted Code Files
- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.cursorrules`
- `.windsurfrules`
- `.github/ISSUE_TEMPLATE/task.yml`
- `.github/workflows/sync-tasks.yml`
- `.github/workflows/agent-ci.yml`
- `ACCEPTANCE_CRITERIA.md`
- `tasks/INDEX.md`
- `tests/github-agent-ecosystem.test.mjs`

## 📦 5. Release & Artifacts
- **Version**: `v1.0.2`
- **Release Notes / Walkthrough**: `docs/walkthroughs/TASK-003-walkthrough.md`
