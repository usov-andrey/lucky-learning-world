# TASK-010 Implementation Plan: Sonia Neural Audio Fix

Replace the unacceptable system-voice audio from v1.3.0 with the user-approved British female neural voice `en-GB-SoniaNeural`.

## Changes

1. Add a reproducible Sonia-only generator and checked-in source manifest.
2. Generate 18 word and 18 definition MP3 tracks at rate `-15%` in a staging directory.
3. Validate all generated MP3 files, replace the old WAV assets, and update catalog paths.
4. Persist the Sonia requirement and sample-approval gate in project rules and provenance.
5. Run all tests and coverage, release `v1.3.2`, push, and verify GitHub Pages.

## Release gate

No commit or deployment is allowed unless every catalog path resolves to a non-empty MP3 and no legacy WAV remains in the lesson.
