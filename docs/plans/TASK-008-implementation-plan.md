# TASK-008 Implementation Plan: 'or' Saying /er/ Spelling Lesson

Add the 18 photographed spelling words as a third catalog lesson while preserving the existing Page 22 default and Schwa <er> lesson.

## Changes

1. Extend `content/spelling-catalog.js` with `OR_SAYING_ER_LESSON`, keeping the photographed order and the complete learning-content schema used by existing lessons.
2. Add 18 repository-local SVG illustrations, 18 word audio files, and 18 definition audio files under `content/or-saying-er/`, with local provenance documentation.
3. Update catalog and UI tests to require three lessons, verify every new word and asset path, and confirm that selection persists and updates the shared spelling engine.
4. Run the full test suite and coverage gate, create release `v1.3.0`, commit, push `master`, and verify the GitHub Pages workflow.

## Verification

```bash
npm test
npm run test:coverage:gate
```
