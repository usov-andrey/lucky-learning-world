# TASK-021 Walkthrough: Canonical Star Display

## Result

- The header now totals stars from `progression.levels[levelId].stars` for known Math
  levels, with defensive finite/range handling.
- Each level chip renders its own canonical saved star value.
- Existing saves display immediately; no migration, reset, or replay is needed. This is
  why Lucky's already-completed 2026-08-10 level sessions become visible after update.
- `git show 86a3219 -- app.js` confirms both broken `starsByLevel` reads were introduced
  by the same 2026-07-28 narrative refactor that caused TASK-019's regression cluster.

## Verification

- `tests/math-star-display.test.mjs`: canonical five-star save renders as total `5`,
  with `★★` on ×6 and `★★★` on ×7.
- Full `npm test`: 133/133 green.
- Real Chromium confirms a completed ×7 session renders `3` in the header and `★★★`
  on the ×7 chip.
