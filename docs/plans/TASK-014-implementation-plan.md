# TASK-014 Implementation Plan: Add 'ear' Saying /er/ Spelling Lesson as New Default

## Context

The owner supplied a school-book photo titled "‹ear› saying /er/" with 18 words and asked
for them to be added to Lucky's spelling game and made the current default lesson. The
words were first (mistakenly) added to the archived standalone `lucky-spelling-skill`
project instead of Lucky's Learning World; that work is superseded by this task.

## Approach

Mirror the TASK-008 (`or-saying-er`) pattern exactly, since it is the most recently
added lesson of the same shape and already proved out the full local-asset pipeline:

1. Write `content/ear-saying-er/audio-manifest.json` with the 18 words in photographed
   order and their definitions, using the approved voice (`en-GB-SoniaNeural`, `-15%`).
2. Generate word and definition MP3s with `scripts/generate-spelling-audio.py`, which
   also writes `content/ear-saying-er/audio/PROVENANCE.md`.
3. Author 18 original SVG illustrations in `content/ear-saying-er/images/` in the same
   house style as `content/or-saying-er/images/` (512x320, gradient background, flat
   vector icon, word label pill), plus a provenance note.
4. Add `EAR_SAYING_ER_LESSON` to `content/spelling-catalog.js` with full fields
   (definition, extendedExplanation, exampleSentence, image, imageAlt, audio,
   definitionAudio, hint) and append it to `SPELLING_LESSONS`.
5. Unlike TASK-008, explicitly change `DEFAULT_SPELLING_LESSON_ID` to `ear-saying-er`
   per the owner's request, and make `getSpellingLesson()`'s unknown-id fallback resolve
   to the current default instead of a hardcoded `page-22`, so there is a single source
   of truth for "the default lesson."
6. Update `tests/spelling-lesson-catalog.test.mjs` and `tests/spelling-lesson-ui.test.mjs`
   with TASK-014-tagged assertions for the new lesson's content, asset integrity, and
   default/fallback behavior, and fix the two pre-existing tests that hardcoded Page 22
   as the default (`spelling-full-ui-e2e.test.mjs`, the AC-11 UI test).
7. Update the static `index.html` Learn-mode placeholder image/definition so it matches
   the new default instead of flashing the old Page 22 content before first render.
8. Run `npm test` and `npm run test:coverage:gate`, then release via
   `node scripts/release.mjs --bump=minor --task=TASK-014`.

## Risks considered

- **Breaking the default for existing lessons**: mitigated by AC-51 and by keeping
  `page-22`, `schwa-er`, and `or-saying-er` untouched in the catalog.
- **Fallback inconsistency**: `getSpellingLesson()` previously hardcoded `PAGE_22_LESSON`
  as its fallback regardless of the configured default; fixed to reference
  `DEFAULT_SPELLING_LESSON_ID` so fallback and default can never diverge again.
