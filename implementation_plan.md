# TASK-032 Implementation Plan

1. Replace the expanding lesson-card grid with one polished native dropdown that keeps
   every lesson visible on demand while occupying only one compact row.
2. Use the final catalog entry as the no-storage default and retain the existing saved
   selection for returning learners.
3. Wire dropdown changes through the existing shared lesson-selection path so Learn,
   Test, and Tiles modes remain synchronized.
4. Update TASK-032-tagged UI tests, run the complete automated suite, write the
   walkthrough, and commit the verified patch release.

---

# Previous TASK-029 Implementation Plan

## Goal

Let Lucky earn Glaceon, Geodude, Butterfree, and Mew by completing either spelling-test
submode, without changing the existing math progression or Tiles reward path.

## Implementation

1. Define a stable spelling-test reward pool with the internal character IDs for the
   four requested Pokémon.
2. Route completed digital and paper tests through that pool; keep Tiles on its current
   reward pool.
3. Reuse `chooseReward()` so unowned requested Pokémon are selected before duplicates
   and the standard roster becomes the fallback after the four are collected.
4. Add TASK-029 / AC-99–101 automated coverage for both test submodes, persistence,
   exact priority membership, fallback, and Tiles regression.
5. Run unit/integration, coverage, and real-browser verification; publish patch release
   `v1.9.1`, document the result, and commit all changes.

## Verification

- Digital and paper tests each persist one valid requested Pokémon reward.
- Four completed spelling tests can collect all four requested Pokémon without repeats.
- The fifth spelling-test reward comes from the remaining standard roster.
- Tiles rewards continue to follow the existing ×6-first path.
# TASK-030 Implementation Plan

1. Add the photographed 18-word lesson and child-friendly definitions to the catalog.
2. Add local SVG illustrations and approved Sonia word/definition audio with provenance.
3. Extend catalog and picker regression tests for the seventh lesson.
4. Run the full test and coverage gates, publish `v1.10.0`, commit, and push to `master`.
