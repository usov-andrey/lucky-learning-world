# TASK-028 Walkthrough: ‹ough›, ‹gh› and ‹augh› Spelling Lesson

## Result

Word Realm now includes a sixth selectable lesson named `‹ough›, ‹gh› and ‹augh›`.
It contains all 18 photographed words in their original three-group order:

`ought`, `bought`, `brought`, `fought`, `nought`, `thought`, `ghostly`, `dinghy`,
`ghoul`, `aghast`, `gherkin`, `yoghurt`, `naughty`, `fraught`, `caught`, `daughter`,
`distraught`, `onslaught`.

## Complete learning content

- Every word includes a child-friendly definition, expanded explanation, example
  sentence, short hint, and meaningful image description.
- Every word has an original repository-local 512×320 SVG illustration.
- Every word has a local pronunciation MP3 and definition MP3 generated with the
  approved British voice `en-GB-SoniaNeural` at `-15%`.
- Audio and illustration provenance are stored beside the assets.
- The current default (`ear-saying-er`) remains unchanged.

## Integration

The new lesson uses the shared spelling engine and therefore works in Learn, Test
(digital and paper), and Tiles Game modes. Selection persists through the existing
`lmm3s:selected_spelling_lesson` storage key.

## Verification

- Focused TASK-028 catalog/UI tests: 10/10 passed.
- `npm test`: 140/140 passed.
- `npm run test:coverage:gate`: passed; 84.45% lines, 65.44% branches, 73.21% functions.
- `npm run test:e2e`: 1/1 full real-Chromium scenario passed.
- All 18 SVG files parse as valid XML; all 36 MP3s are non-empty with valid MP3 headers.
