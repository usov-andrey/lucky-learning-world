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

- All 149 unit tests passed before and after the version bump.
- The coverage gate passed with 83.01% lines, 66.23% branches, and 74.53% functions.
- Chromium decoded all 36 non-silent MP3s and rendered all 18 SVGs. The
  illustration grid was inspected.
- The full Chromium scenario passed, including all 18 words in Learn, both
  test modes, and a completed Tiles game.
- QA logs, audio decoding results, and the illustration grid are kept locally
  under `.state/outputs/TASK-035-*`.

## Release

- Released v1.14.0 from `master` in commit `ca399f498c8dd5b2c4c199a2f5558cd9b353c213`. Pages deployed commit `b8db251f4f75520b535c1b6af3e9ccef40fddebe`.
- [GitHub Pages deployment](https://github.com/usov-andrey/lucky-learning-world/actions/runs/42811082042) completed successfully.
- Verified the public v1.14.0 build, the exact 18-word manifest, and all 54 media
  files on 2026-11-10. SVG line endings were normalised before comparison.
- The local file hashes are in `.state/outputs/TASK-035-live-verification.json`.
- [Initial deployment](https://github.com/usov-andrey/lucky-learning-world/actions/runs/42809375731) timed out while syncing files.
- The retry packages only tracked files and reports deploy errors as failed jobs.
- Revert the release commit on `master` to roll back the lesson.
