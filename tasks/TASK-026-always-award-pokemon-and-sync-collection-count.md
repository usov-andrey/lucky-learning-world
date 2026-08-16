---
id: TASK-026
title: "Always Award Pokémon and Sync Collection Count"
status: RELEASED
version: v1.8.1
created: 2026-08-16
github_issue: null
---

# TASK-026: Always Award Pokémon and Sync Collection Count

## 💡 1. Idea & Proposal
- **Context**: Lucky completed a Math Duel and received a browser alert instead of a Pokémon reward. The dashboard also displayed `0 / 15` even though two Pokémon were already saved in her collection.
- **Proposed Solution**: Make every completed Math Duel grant a Pokémon reward while keeping stars and level unlocking performance-based. Render the dashboard collection count from normalized saved collection state during normal header/dashboard rendering.

## 📋 2. Acceptance Criteria (AC)
- [x] **AC-87**: Finishing any valid Math Duel, including a result below the three-star threshold, grants a Pokémon reward and opens the in-app reward modal instead of the browser completion alert.
- [x] **AC-88**: Stars and next-level unlocking remain based on the existing score thresholds; always granting a Pokémon must not turn a low-score attempt into a three-star result or unlock the next level.
- [x] **AC-89**: On app startup and after collection changes, the dashboard collection badge immediately displays the normalized saved collection count out of the 15 collectible Pokémon, without requiring the Pokédex screen to be opened first.
- [x] **AC-90**: The collection badge uses child-facing Pokémon wording rather than generic pet wording.

## 🧪 3. Test Coverage
- `tests/pokemon-rewards.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`

## 💻 4. Impacted Code Files
- `app.js`
- `index.html`
- `tests/pokemon-rewards.test.mjs`

## 📦 5. Release & Artifacts
- **Version**: `v1.8.1`
- **Release Notes / Walkthrough**: `docs/releases/v1.8.1.md`
