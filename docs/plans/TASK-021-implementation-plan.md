# TASK-021 Implementation Plan: Canonical Star Display

## Goal

Render already-saved stars from `progression.levels`, the canonical schema used by
`applyLevelOutcome()`, in both the header total and individual Math level chips.

## Steps

1. Add AC-tagged UI tests using an existing canonical progression save.
2. Replace both `starsByLevel` reads with safe reads from `progression.levels`.
3. Confirm the change displays existing progress without migration or replay.
4. Run the full unit and browser suites.
