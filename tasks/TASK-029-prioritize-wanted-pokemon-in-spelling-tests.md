---
id: TASK-029
title: "Prioritize Wanted Pokémon in Spelling Tests"
status: RELEASED
version: v1.9.1
created: 2026-08-22
github_issue: null
---

# TASK-029: Prioritize Wanted Pokémon in Spelling Tests

## 💡 1. Idea & Proposal

- **Context**: Lucky wants to earn the currently locked Glaceon, Geodude, Butterfree,
  and Mew by completing Word Realm spelling tests, not only through the corresponding
  Math Duel tables. The existing spelling completion path always starts from the ×6
  reward pool, so these four are only reached later through a broad random fallback.
- **Proposed Solution**: Add a dedicated spelling-test priority pool containing the four
  requested Pokémon. Digital and paper spelling tests draw new rewards from that pool
  without duplicates until all four are owned, then fall back to the full standard
  roster. Preserve the existing Tiles reward behaviour.

## 📋 2. Acceptance Criteria (AC)

- [x] **AC-99**: Completing either a digital or paper Word Realm spelling test awards
      a valid Pokémon and persists it through the existing collection storage path.
- [x] **AC-100**: While any of Glaceon, Geodude, Butterfree, or Mew is unowned, spelling
      tests award one of those unowned Pokémon without issuing a duplicate; after all
      four are owned, reward selection falls back to the standard full roster.
- [x] **AC-101**: Tiles Game completion retains its existing reward-pool behaviour and
      is not redirected to the spelling-test priority pool.

## 🧪 3. Test Coverage

- `tests/spelling-pokemon-rewards.test.mjs` — requested pool membership, no-duplicate
  progression, digital and paper test integration, persistence, and Tiles regression.

## 💻 4. Impacted Code Files

- `content/reward-pools.js`
- `app.js`
- `tests/spelling-pokemon-rewards.test.mjs`
- release and task documentation

## 📦 5. Release & Artifacts

- **Version**: `v1.9.1`
- **Plan**: `docs/plans/TASK-029-implementation-plan.md`
- **Release Notes / Walkthrough**: `docs/releases/v1.9.1.md`
