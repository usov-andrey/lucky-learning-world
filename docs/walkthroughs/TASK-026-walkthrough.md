# TASK-026 Walkthrough: Always Award Pokémon and Sync Collection Count

## Result

Lucky now receives a Pokémon reward whenever she completes a Math Duel. The browser
alert shown in the reported photo is no longer part of the completion path. Academic
progress remains honest: the existing score thresholds still determine stars and
whether the next multiplication level unlocks.

The dashboard collection card now reads directly from the saved normalized collection
as soon as the app starts. A collection containing two Pokémon therefore displays
`2 / 15 Pokémon` without requiring Lucky to open the Pokédex first.

## UI changes

- `My Pets` is now `My Pokémon`.
- The collection badge uses the format `N / 15 Pokémon`.
- Reward messaging says `New Pokémon Rescued!` or `Pokémon Level Up!`.
- The completion action says `Collect Pokémon & Continue`.

## Regression coverage

- `tests/pokemon-rewards.test.mjs` proves a saved two-Pokémon collection renders
  immediately and a zero-star completed duel still grants a valid Pokémon without
  unlocking the next level.
- `tests/e2e/full-main-scenario.e2e.mjs` verifies the Pokémon count wording in a real
  Chromium journey across Math, Math Mix, Word, and Pokédex.
- `tests/child-dashboard.test.mjs` protects the child-facing `My Pokémon` label.

## Verification

- `npm test`: 136/136 passed.
- `npm run test:coverage:gate`: passed; aggregate coverage 83.35% lines, 65.50%
  branches, and 73.21% functions.
- `npm run test:e2e`: 1/1 full real-browser scenario passed.

