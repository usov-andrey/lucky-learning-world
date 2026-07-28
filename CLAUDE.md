# Claude Code Directives — Lucky's Learning World

Welcome, Claude Code! This project uses a strict **Task-Driven, Acceptance Criteria-First Development Model**.

## 🚀 Quick Execution Rules

1. **Read Core Guidelines First**:
   - Always read `AGENTS.md` and `DEVELOPMENT_RULES.md`.
   - Master Acceptance Criteria: `ACCEPTANCE_CRITERIA.md`.

2. **Testing & Coverage Commands**:
   - Run tests: `npm test`
   - Run coverage report: `npm run test:coverage`
   - Run coverage CI gate: `npm run test:coverage:gate`

3. **Task & Issue Lifecycle**:
   - Create task: `node scripts/task-new.mjs --title="Feature Title"`
   - Sync task index & GitHub Issues: `npm run task:sync -- --github`
   - Bump release version: `node scripts/release.mjs --bump=patch|minor|major --task=TASK-XXX`

4. **Tagging Convention**:
   - Test files MUST contain `// @task TASK-XXX` and `// @ac AC-Y` or `AC-Y.Z`.

5. **Architecture**:
   - 100% Zero-Build Vanilla ES Modules (`import`/`export`).
   - Do NOT introduce Webpack, Vite, Babel, or external bundlers.
