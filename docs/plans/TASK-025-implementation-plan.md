# TASK-025 Implementation Plan: Add 'u' Saying Long /oo/ Spelling Lesson

## Context

The owner supplied a school-book photo titled "‹u› saying long /oo/" with 18 words
(three star-graded groups of six) and asked for them to be added as a new selectable
spelling lesson and deployed.

## Approach

Mirror the TASK-014 (`ear-saying-er`) pattern, the most recently added lesson of the
same shape:

1. Write `content/u-saying-oo/audio-manifest.json` with the 18 words in photographed
   order and their definitions, using the approved voice (`en-GB-SoniaNeural`, `-15%`).
2. Generate word and definition MP3s with `scripts/generate-spelling-audio.py`, which
   also writes `content/u-saying-oo/audio/PROVENANCE.md`.
3. Author 18 original SVG illustrations in `content/u-saying-oo/images/` in the same
   house style as `content/ear-saying-er/images/` (512x320, gradient background, flat
   vector icon, word label pill), plus a provenance note.
4. Add `U_SAYING_OO_LESSON` to `content/spelling-catalog.js` with full fields
   (definition, extendedExplanation, exampleSentence, image, imageAlt, audio,
   definitionAudio, hint) and append it to `SPELLING_LESSONS`. Unlike TASK-014,
   `DEFAULT_SPELLING_LESSON_ID` stays `ear-saying-er` — this is an additional lesson,
   not a default change.
5. Update `tests/spelling-lesson-catalog.test.mjs` and `tests/spelling-lesson-ui.test.mjs`
   with TASK-025-tagged assertions for the new lesson's content, asset integrity, and
   picker/selection behavior.
6. Run `npm test` and `npm run test:coverage:gate`, then release via
   `node scripts/release.mjs --bump=minor --task=TASK-025` and push to `master` so the
   GitHub Pages deploy workflow publishes the new lesson.

## Risks considered

- **Breaking existing lessons or the default**: mitigated by AC-84, which requires the
  other four lessons and `DEFAULT_SPELLING_LESSON_ID` to remain untouched.
- **Asset integrity**: covered by TASK-014-style tests asserting every local audio/image
  path exists, is non-empty, and matches the manifest exactly.
