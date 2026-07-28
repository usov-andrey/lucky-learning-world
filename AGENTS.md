# Lucky's Learning World — Project Guidelines & AGENTS.md

## Overview
**Lucky's Learning World** is a gamified, multi-subject educational PWA hub designed for Lucky and her classmates at an international school in Thailand (Cambridge / Oxford Primary Grade 1-5 curriculum).

It unifies:
1. **Math Realm**: Fast-paced mental math battles (multiplication, addition, division).
2. **Word Realm**: Audio-visual spelling challenges with letter tiles & word entry.
3. **Pokédex & Pet Collection**: Pet capture, leveling, and trophy collection system.
4. **Social Sharing**: LINE / Web Share links allowing classmates to play custom word/math decks instantly without registration.

---

## 📜 Core Development Rules & Guidelines
All AI agents (Antigravity, Codex, Claude Code, Windsurf, Cursor) working on this repository MUST strictly follow the mandatory rules documented in:

👉 **[DEVELOPMENT_RULES.md](file:///d:/SD/personal/projects/lucky-learning-world/DEVELOPMENT_RULES.md)**

### Key Highlights:
- **Mandatory Acceptance Criteria Document (`ACCEPTANCE_CRITERIA.md`)**: First step of ANY development task is creating a markdown Acceptance Criteria document (`ACCEPTANCE_CRITERIA.md`) from the spec/brief. All automated tests are written directly against these criteria. On any error or unaccounted edge case, the Acceptance Criteria document MUST be updated first.
- **100% English Game UI**: No Russian text inside user-facing interface or modals.
- **Mobile Touch First**: Touch targets $\ge 64\text{px} \times 64\text{px}$, `touch-action: manipulation`, `pointer-events: none` on children.
- **Disabled Navigation Guard**: Back/Prev buttons MUST be disabled on `index === 0`.
- **High-Contrast Active Tabs**: Bottom nav items require glowing background pill and top indicator bar.
- **Responsive Modals**: `max-height: 85vh` (desktop) / `92vh` (mobile) with `overflow-y: auto`.
- **4-Digit Parent PIN Gate**: Protected parent settings using customizable PIN.
- **Project Artifact Storage & Unique History Rule**: All implementation plans, walkthroughs, task specifications, and release notes MUST be stored permanently inside the project directory (`D:\SD\personal\projects\lucky-learning-world\`). Plans are saved under `docs/plans/<TASK_ID>-implementation-plan.md` and walkthroughs under `docs/walkthroughs/<TASK_ID>-walkthrough.md` so historical documents are never overwritten. In addition, agents MUST always include absolute paths to project documents in final responses.
- **Mandatory Automatic Git Commit**: Upon completion of ANY task or feature, the agent MUST automatically run `git add .` and `git commit -m "feat(TASK-XXX): description"`. Agents MUST NEVER complete a task leaving uncommitted working tree changes.

---

## 🏗 Architecture & Engineering Principles

1. **Zero-Build Architecture**: 
   - Uses standard Vanilla ES Modules (`import`/`export`).
   - No Webpack, Vite, or npm bundlers required for core web app execution.
   - Fully runnable via static hosting (GitHub Pages, `python -m http.server`).

2. **Testing**:
   - Core engine modules tested with Node native test runner: `node --test tests/*.test.mjs`.

---

## 🔍 AI Agent Diagnostic Protocol (Troubleshooting & Audit)
When investigating a bug, regression, or user question about what was changed in a specific feature, follow this mandatory 4-step protocol:

1. **Step 1: Check Master Task Index (`tasks/INDEX.md`)**:
   Locate the task ID (`TASK-XXX`) associated with the feature or domain.
2. **Step 2: Inspect Task Specification (`tasks/TASK-XXX.md`)**:
   Review original user context, defined Acceptance Criteria (`AC-1`, `AC-2`...), impacted files, and target version.
3. **Step 3: Run & Inspect Tagged Tests**:
   Execute `rg "@task TASK-XXX" tests/` to find test cases written for that feature. Run `node --test tests/<test-file>.mjs`.
4. **Step 4: Review Release Walkthrough (`docs/releases/vX.Y.Z.md`)**:
   Check historical execution artifacts, release notes, and code diff notes.

---

## 📁 Repository Directory Structure

```
d:\SD\personal\projects\lucky-learning-world\
├── AGENTS.md                 # Root AI agent entry point & guidelines link
├── DEVELOPMENT_RULES.md      # Detailed UI/UX and engineering rules
├── README.md                 # Project documentation and launch instructions
├── CHANGELOG.md              # Auto-generated release notes history
├── tasks/                    # Task specs (TASK-001.md, INDEX.md, templates)
├── docs/releases/            # Per-release walkthrough artifacts
├── scripts/                  # Release automation & GitHub sync scripts
├── index.html                # Main PWA entry point
├── styles.css                # Central CSS design system & UI tokens
├── app.js                    # Router & application state orchestrator
├── content/                  # Subject curriculum datasets & presets
├── engine/                   # Pure JS game engines (math, spelling, pet collection)
└── assets/                   # Images, sounds, icons, and pet graphics
```

