# TASK-014 Walkthrough: 'ear' Saying /er/ Spelling Lesson as New Default

## Result

- Added a fourth selectable spelling lesson (`ear-saying-er`) with all 18 words from the
  supplied photo, in the photographed order.
- Every word has a definition, expanded explanation, example sentence, hint, meaningful
  alt text, an original local SVG illustration, and local Sonia (`en-GB-SoniaNeural`,
  `-15%`) word and definition audio, matching the TASK-008 (`or-saying-er`) content depth.
- `DEFAULT_SPELLING_LESSON_ID` now points at `ear-saying-er` per the owner's explicit
  request, and `getSpellingLesson()`'s unknown/missing-id fallback now resolves to the
  current default instead of a hardcoded `page-22`, so the two notions of "default"
  cannot diverge again.
- Page 22, Schwa ‹er›, and 'or' saying /er/ are unchanged and remain fully selectable
  through the existing dynamic lesson picker, Learn/Game/Test engine.
- Updated the static `index.html` Learn-mode placeholder so it shows the new default's
  first word instead of Page 22's before the app hydrates.
- Fixed two pre-existing tests that had hardcoded Page 22 as "the default lesson"
  (`tests/spelling-full-ui-e2e.test.mjs`, the AC-11 lesson-picker test in
  `tests/spelling-lesson-ui.test.mjs`) so they now assert against the new default.

## Verification

- `npm test`: 112/112 tests passed.
- `npm run test:coverage:gate`: passed (78.99% line, 64.69% branch, 68.64% function,
  gate requires 65/60/60).
- Local HTTP smoke test on `python -m http.server`: `index.html`, `app.js`, `styles.css`,
  `themes.css`, `sw.js`, and `content/spelling-catalog.js` all returned 200.
- All 54 `ear-saying-er` asset URLs (18 words × image/audio/definitionAudio) returned
  200 with non-empty bodies; spot-checked MP3s carry valid headers via the catalog test.
- Regression check: `content/page-22/lesson.json`, `content/schwa-er/audio/01_pattern.mp3`,
  and `content/or-saying-er/images/worm.svg` still resolve, confirming the older lessons
  were not disturbed.
- Release commit `7e87d93` bumped `v1.4.0` → `v1.5.0` and was committed locally
  (`feat(TASK-014): release version v1.5.0`). Not pushed to `master` / deployed — that is
  a separate, explicit step the owner has not yet requested.

## Note on origin

The same 18 words were first added to the archived standalone `lucky-spelling-skill`
project by mistake (filename-only project search missed this repository entirely). That
work is superseded by this task; `lucky-spelling-skill` and `math-monster` are now marked
archived and routed away from in the workspace root router.
