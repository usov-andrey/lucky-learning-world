---
id: TASK-027
title: "Make Tiles Battle Feedback Obvious on Tablets"
status: RELEASED
version: v1.8.2
created: 2026-08-16
github_issue: null
---

# TASK-027: Make Tiles Battle Feedback Obvious on Tablets

## 💡 1. Idea & Proposal
- **Context**: In Tiles mode on Lucky's landscape tablet, the vertically stacked Pokémon battle stage sits above the visible question controls. Lucky cannot see whom she is attacking. Correct and wrong submissions produce no effect sound, and the wrong-answer message repeats the full definition, so she cannot understand the outcome before it disappears.
- **Proposed Solution**: Keep the Pokémon visible beside the spelling controls on tablet layouts. Replace sentence-dependent feedback with an immediate large `HIT!` or `MISS!` battle signal, matching Pokémon animation, colour, and distinct generated sound effect. Keep the hint in its existing dedicated hint line instead of repeating it in the result.

## 📋 2. Acceptance Criteria (AC)
- [x] **AC-91**: On landscape tablet viewports, the Tiles arena presents the Pokémon battle stage beside the question and tile controls so both are visible in the same viewport region; narrow phones retain a readable stacked layout.
- [x] **AC-92**: A correct Tiles submission immediately shows a large green `HIT!` signal, visibly animates the Pokémon as hit, and plays a short rising success sound.
- [x] **AC-93**: A wrong Tiles submission immediately shows a large red `MISS!` signal, visibly animates the Pokémon dodging, and plays a short descending miss sound.
- [x] **AC-94**: Persistent feedback is concise (`HIT!` or `MISS! TRY AGAIN`) and never repeats the long word definition; the original hint remains available in its dedicated hint line.
- [x] **AC-95**: Repeated submit taps during the feedback animation are ignored, and all controls remain at least 64 px touch targets.

## 🧪 3. Test Coverage
- `tests/spelling-tiles-feedback.test.mjs`
- `tests/spelling-full-ui-e2e.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## 💻 4. Impacted Code Files
- `index.html`
- `styles.css`
- `app.js`
- `tests/spelling-tiles-feedback.test.mjs`
- `tests/spelling-full-ui-e2e.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## 📦 5. Release & Artifacts
- **Version**: `v1.8.2`
- **Release Notes / Walkthrough**: `docs/releases/v1.8.2.md`
