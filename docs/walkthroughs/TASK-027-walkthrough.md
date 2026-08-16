# TASK-027 Walkthrough: Clear Tiles Battles on Tablets

## Result

Tiles mode now keeps the Pokémon beside the spelling controls on landscape tablets,
instead of placing it above the part of the arena visible in Lucky's photo. Lucky can
see the opponent while she builds and submits every word.

Every submission now communicates its result without requiring Lucky to read a
sentence. Correct attacks show a large green `HIT!`, animate the Pokémon as struck,
and play a short rising sound. Wrong attacks show a large red `MISS!`, animate a dodge,
and play a short descending sound. The long definition stays only in the stable hint
line and is no longer repeated in temporary feedback.

## UI changes

- Tablet and desktop Tiles arenas use side-by-side Pokémon and question columns.
- Narrow phones retain a stacked layout.
- The attack button is shortened to `Attack!`.
- Result text is limited to `HIT!` or `MISS! TRY AGAIN`.
- Submit is locked during the brief result animation to reject accidental double taps.
- Tiles-mode interactive controls retain at least 64 px touch targets.

## Regression coverage

- `tests/spelling-tiles-feedback.test.mjs` covers the responsive structure, both visual
  states, both sound directions, concise copy, hint preservation, and double-tap lock.
- `tests/e2e/full-main-scenario.e2e.mjs` runs at 1280×800, measures that the Pokémon
  and controls are side-by-side in a shared vertical region, and observes `HIT!` and
  `MISS!` in real Chromium.
- `tests/spelling-full-ui-e2e.test.mjs` protects the updated successful-attack flow.

## Verification

- `npm test`: 139/139 passed.
- `npm run test:coverage:gate`: passed; aggregate coverage 83.43% lines, 65.50%
  branches, and 73.21% functions.
- `npm run test:e2e`: 1/1 full real-browser scenario passed.
