# TASK-026 Implementation Plan: Always Award Pokémon and Sync Collection Count

## Goal

Replace the unrewarding Math Duel completion alert with a real Pokémon reward for every completed duel, and make the dashboard collection badge reflect Lucky's saved collection immediately.

## Implementation

1. Extend the TASK-026 acceptance criteria and add focused regression tests before changing application code.
2. Decouple Pokémon rewards from the existing three-star threshold in `finishMathSession()` while leaving score, stars, and level-unlock calculations unchanged.
3. Make `renderHeader()` refresh the dashboard collection badge from the normalized collection array, including immediately after startup and after a newly awarded Pokémon is saved.
4. Use Pokémon-specific wording in the collection card.
5. Run the full Node suite and the permanent Playwright scenario, publish patch release `v1.8.1`, write the walkthrough, and commit all task changes.

## Verification

- A low-scoring completed Math Duel opens the reward modal with a valid Pokémon and never invokes the browser alert.
- The same low-scoring result retains its actual stars and does not unlock the next level.
- A saved collection of two valid Pokémon renders as `2 / 15 Pokémon` on the dashboard without visiting Pokédex.
- All unit/integration and browser end-to-end tests pass.
