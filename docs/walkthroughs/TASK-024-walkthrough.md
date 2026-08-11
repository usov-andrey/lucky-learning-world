# TASK-024 Walkthrough: Restore Math Progress and Fix Math Mix

## Result

All three defects confirmed from Lucky's production session are fixed together:

1. **Saved stars are visible.** Header and level chips read the canonical
   `progression.levels[levelId].stars` records, so existing completed sessions appear
   without replaying them.
2. **Fact mastery is real and persistent.** Correct and wrong answers update
   `factStats` immediately, the data survives normalization/reload/migration, elapsed
   time is recorded, and future plans can prioritize weak facts.
3. **Math Mix is valid and finishable.** The controller passes numeric table values,
   the planner fails fast on invalid inputs, and no question/feedback can be generated
   from the former object-array mismatch that produced `NaNxNaN` in production.

## Production Evidence

- The 2026-08-10 anonymous session showed seven completed level sessions whose saved
  stars were hidden by the display bug.
- A later Math Mix attempt generated 34 privacy-safe `render.invalid` events: 21 on
  `#math-question-text` and 13 on `#math-feedback-text`, all with sentinel `NaN`.
- Local reproduction showed every Mix question key was `NaNxNaN`; the fixed planner
  receives `[6, 7, 8, 9, 10]` and rejects object inputs.

## Verification

- New red/green regressions: 7/7 green across fact persistence, star display, and Mix.
- `npm test`: 133/133 green.
- `npm run test:coverage:gate`: green (81.60% lines, 65.78% branches, 72.90% functions).
- `npm run test:e2e`: green in real Chromium. It completes ×7 and Math Mix through all
  12 sequential questions each, asserts persisted `factStats`, header/chip stars,
  finite Mix text, reward completion, and zero uncaught page errors.
- The E2E gate remains strict for all local assets and HTTP failures; optional Google
  Fonts failures and deliberate in-carousel image request cancellations are excluded
  because they do not affect application correctness and made offline CI nondeterministic.

## Files

- `app.js`
- `engine/progression.js`
- `engine/math-engine.js`
- `tests/math-fact-progress.test.mjs`
- `tests/math-star-display.test.mjs`
- `tests/math-mix-regression.test.mjs`
- `tests/e2e/full-main-scenario.e2e.mjs`
