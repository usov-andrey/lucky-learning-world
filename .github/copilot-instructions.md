# GitHub Copilot Instructions — Lucky's Learning World

## Core Principles & Coding Rules
- **Zero-Build Architecture**: Vanilla JS ES Modules only. No bundlers or transpilers.
- **100% English UI**: All user-facing UI text, buttons, modals, and TTS audio must be in English.
- **Mobile Touch UX**: Touch targets must be $\ge 64\text{px} \times 64\text{px}$ with `touch-action: manipulation;`.
- **Traceability**: All new unit test files in `tests/` must include `// @task TASK-XXX` and `// @ac AC-X.Y` comments.
- **Verification**: Code must pass `npm run test:coverage:gate` before committing.
- Read `AGENTS.md` and `DEVELOPMENT_RULES.md` for full project guidelines.
