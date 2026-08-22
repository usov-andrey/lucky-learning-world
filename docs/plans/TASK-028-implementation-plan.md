# TASK-028 Implementation Plan: Add ‹ough›, ‹gh› and ‹augh› Spelling Lesson

## Context

The owner supplied a school-book photo with 18 words in three groups and requested the
same complete treatment as TASK-025.

## Approach

1. Add `content/ough-gh-augh/audio-manifest.json` with the 18 photographed words and
   child-friendly definitions, using approved Sonia audio (`en-GB-SoniaNeural`, `-15%`).
2. Generate word and definition MP3s with `scripts/generate-spelling-audio.py`, including
   local audio provenance.
3. Create 18 original 512×320 SVG illustrations in the existing house style, with
   meaningful alt text and illustration provenance.
4. Add `OUGH_GH_AUGH_LESSON` to `content/spelling-catalog.js` with definitions, expanded
   explanations, examples, hints, and local asset paths; append it to `SPELLING_LESSONS`
   without changing the default.
5. Extend the catalog and lesson-picker tests with TASK-028 / AC-96–98 coverage.
6. Run the complete unit/integration and coverage gates, publish minor release `v1.9.0`,
   write the walkthrough, commit, and push the release.

## Verification

- The sixth lesson displays all 18 words in photographed order.
- Every word has usable local image, word audio, and definition audio.
- Selecting the lesson persists and feeds the shared Learn, Game, and Test engine.
- Existing lessons and the `ear-saying-er` default remain unchanged.
