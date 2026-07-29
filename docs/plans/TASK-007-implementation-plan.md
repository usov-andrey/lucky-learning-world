# TASK-007 Implementation Plan — Child-Friendly Dashboard

## Goal

Make the home screen feel like an inviting game choice for Lucky, age 10, while
removing the reading burden visible in the current phone layout.

## Product Direction

- Use a personal greeting and one direct instruction.
- Present three instantly recognizable choices: Math Battle, Word Quest, My Pets.
- Give every choice a distinct color world, large icon, tiny supporting phrase,
  and one large action button.
- Use violet, aqua, coral, gold, stars, and soft glows for an energetic,
  magical feel without making the design stereotypically gendered.
- Preserve the existing English-only UI, navigation IDs, and game behavior.

## Implementation

1. Replace the dashboard heading and realm-card copy in `index.html`.
2. Add semantic dashboard classes and decorative, non-interactive visual layers.
3. Add a cached greeting element in `app.js` and update it from the current
   player during `renderHeader()`.
4. Restyle only the dashboard layer in `styles.css`, including compact mobile
   rules at 600px and below.
5. Add `tests/child-dashboard.test.mjs` for copy, personalization, touch sizing,
   mobile rules, and explicit-button navigation.

## Verification

- Run `node --test tests/child-dashboard.test.mjs`.
- Run the complete `node --test tests/*.test.mjs` suite.
- Render the page at a phone viewport and visually inspect the dashboard.
- Confirm the working tree contains only TASK-007 changes plus the documented
  revert of the accidental no-op release command.

## Files

- `tasks/TASK-007-simplify-and-personalize-the-child-dashboard.md`
- `ACCEPTANCE_CRITERIA.md`
- `index.html`
- `styles.css`
- `app.js`
- `tests/child-dashboard.test.mjs`
- `docs/plans/TASK-007-implementation-plan.md`
- `docs/walkthroughs/TASK-007-walkthrough.md`
