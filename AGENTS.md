# Lucky's Learning World — Project Guidelines & AGENTS.md

## Overview
**Lucky's Learning World** is a gamified, multi-subject educational PWA hub designed for Lucky and her classmates at an international school in Thailand (Cambridge / Oxford Primary Grade 1-5 curriculum).

It unifies:
1. **Math Realm**: Fast-paced mental math battles (multiplication, addition, division).
2. **Word Realm**: Audio-visual spelling challenges with letter tiles & word entry.
3. **Pokédex & Pet Collection**: Pet capture, leveling, and trophy collection system.
4. **Social Sharing**: LINE / Web Share links allowing classmates to play custom word/math decks instantly without registration.

---

## 🏗 Architecture & Engineering Principles

1. **Zero-Build Architecture**: 
   - Uses standard Vanilla ES Modules (`import`/`export`).
   - No Webpack, Vite, or npm bundlers required for core web app execution.
   - Fully runnable via static hosting (GitHub Pages, `python -m http.server`).

2. **Mobile & Tablet First Touch UI**:
   - Primary target devices: iPad, Android Tablets, Smartphones.
   - Interactive touch targets MUST be at least **64px × 64px** to accommodate young learners.
   - Vibrant dark-mode UI with high contrast, glassmorphism, and responsive CSS Grid/Flexbox layouts.

3. **No-Lose Educational Philosophy**:
   - Encourages learning through immediate feedback, hints, and retries without demoralizing penalty screens or hard game-over states.

4. **Testing**:
   - Core engine modules tested with Node native test runner: `node --test tests/*.test.js`.

---

## 📁 Repository Directory Structure

```
d:\SD\personal\projects\lucky-learning-world\
├── AGENTS.md                 # Project instructions and rules
├── README.md                 # Project documentation and launch instructions
├── index.html                # Main PWA entry point
├── styles.css                # Central CSS design system & UI tokens
├── app.js                    # Router & application state orchestrator
├── content/                  # Subject curriculum datasets & presets
├── engine/                   # Pure JS game engines (math, spelling, pet collection)
├── scripts/                  # Python utilities (OCR deck generator, TTS downloader)
└── assets/                   # Images, sounds, icons, and pet graphics
```
