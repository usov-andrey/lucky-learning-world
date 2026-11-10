# TASK-035 Walkthrough

## Lesson

- Added the `‹-ically›` lesson with all 18 words in the schoolbook order.
- Each word has an English definition, an explanation, an example sentence, a
  hint, an original SVG illustration, and meaningful alt text.
- Generated 18 pronunciation tracks and 18 definition tracks with
  `en-GB-SoniaNeural` at `-15%` using edge-tts 7.3.1.
- The new lesson is the default for players without a valid saved choice. The
  dropdown still restores valid saved choices across all eleven lessons.

## Verification

- All 149 unit tests passed.
- The coverage gate passed with 83.01% lines, 66.23% branches, and 74.53% functions.
- Chromium decoded all 36 non-silent MP3s and rendered all 18 SVGs. The
  illustration grid was inspected.
- The full Chromium scenario passed, including all 18 words in Learn, both
  test modes, and a completed Tiles game.
- QA logs, audio decoding results, and the illustration grid are kept locally
  under `.state/outputs/TASK-035-*`.

## Release

- Target version v1.14.0.
- Deployment source is `master` via the GitHub Pages workflow.
- Revert the release commit on `master` to roll back the lesson.
