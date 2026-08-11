# TASK-020 Implementation Plan: Persistent Fact Mastery

## Goal

Record every first math answer against its canonical fact, persist that mastery in the
progression state, and retain it across reloads so later sessions can prioritize facts
Lucky actually finds difficult.

## Steps

1. Add AC-tagged storage and controller tests for correct and wrong answers.
2. Extend initial, normalized, and migrated progression shapes with `factStats`.
3. Track a stable per-session identifier and per-question elapsed time in the controller.
4. Update and save fact mastery on both answer paths.
5. Verify weak-fact prioritization and the full suite.
