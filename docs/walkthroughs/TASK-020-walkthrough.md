# TASK-020 Walkthrough: Persistent Fact Mastery

## Result

- `factStats` is now part of every initial, normalized, and v2-migrated progression
  state and survives browser reloads.
- Every accepted correct or wrong first answer updates the canonical fact key and saves
  progression immediately. Requeued retries remain genuine additional attempts.
- Each session uses a monotonically unique numeric identifier and each question records
  elapsed time, enabling the existing mastery ladder and fast-answer promotion.
- A regression test proves that a persisted weak fact is prioritized after the other
  hard facts become known.

## Verification

- `tests/math-fact-progress.test.mjs`: 3/3 green.
- Full `npm test`: 133/133 green.
- `npm run test:coverage:gate`: green; `engine/progression.js` 100% lines/functions.
- Real Chromium verifies non-empty persisted `factStats` after a completed ×7 session.
