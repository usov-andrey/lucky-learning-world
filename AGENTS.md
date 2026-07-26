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
- **100% English Game UI**: No Russian text inside user-facing interface or modals.
- **Mobile Touch First**: Touch targets $\ge 64\text{px} \times 64\text{px}$, `touch-action: manipulation`, `pointer-events: none` on children.
- **Disabled Navigation Guard**: Back/Prev buttons MUST be disabled on `index === 0`.
- **High-Contrast Active Tabs**: Bottom nav items require glowing background pill and top indicator bar.
- **Responsive Modals**: `max-height: 85vh` (desktop) / `92vh` (mobile) with `overflow-y: auto`.
- **4-Digit Parent PIN Gate**: Protected parent settings using customizable PIN.

---

## 🏗 Architecture & Engineering Principles

1. **Zero-Build Architecture**: 
   - Uses standard Vanilla ES Modules (`import`/`export`).
   - No Webpack, Vite, or npm bundlers required for core web app execution.
   - Fully runnable via static hosting (GitHub Pages, `python -m http.server`).

2. **Testing**:
   - Core engine modules tested with Node native test runner: `node --test tests/*.test.mjs`.

---

## 📁 Repository Directory Structure

```
d:\SD\personal\projects\lucky-learning-world\
├── AGENTS.md                 # Root AI agent entry point & guidelines link
├── DEVELOPMENT_RULES.md      # Detailed UI/UX and engineering rules
├── README.md                 # Project documentation and launch instructions
├── index.html                # Main PWA entry point
├── styles.css                # Central CSS design system & UI tokens
├── app.js                    # Router & application state orchestrator
├── content/                  # Subject curriculum datasets & presets
├── engine/                   # Pure JS game engines (math, spelling, pet collection)
├── scripts/                  # Python utilities (OCR deck generator, TTS downloader)
└── assets/                   # Images, sounds, icons, and pet graphics
```
