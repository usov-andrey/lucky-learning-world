# TASK-032 Implementation Plan

1. Replace the expanding lesson-card grid with one polished native dropdown that keeps
   every lesson visible on demand while occupying only one compact row.
2. Use the final catalog entry as the no-storage default and retain the existing saved
   selection for returning learners.
3. Wire dropdown changes through the existing shared lesson-selection path so Learn,
   Test, and Tiles modes remain synchronized.
4. Update TASK-032-tagged UI tests, run the complete automated suite, write the
   walkthrough, and commit the verified patch release.
