# TASK-036 Walkthrough

## Lesson

- Added Schwa ‹al› with all 18 photographed words in order, from animal to cathedral.
- Added English definitions, explanations, examples and hints, plus 18 original SVG illustrations with alt text.
- Generated and decoded 36 word and definition tracks using edge-tts 7.3.1, British Sonia and a rate of −15%.
- Schwa ‹al› is the default when there is no valid saved choice. The picker offers all twelve lessons.

## Verification

- Visually reviewed all 18 rendered illustrations and decoded all 36 MP3s in Chromium.
- All 150 tests passed with coverage of 83.14% of lines, 66.09% of branches and 74.64% of functions.
- Updated the Chromium scenario's final Learn card to cathedral. The full scenario passed, including both Test modes and a complete Tiles game.
- All 150 tests passed again with the version set to v1.15.0.

## Release

- GitHub Pages deployed v1.15.0 from master at commit `8b35458c0fa1676ae6c59b50c6724447eecd69f9`. [Deployment run](https://github.com/usov-andrey/lucky-learning-world/actions/runs/43862199969)
- Verified the live build, the exact 18-word manifest and all 54 media files on 2026-11-16. SVG line endings were normalised before comparison.
- Local verification evidence is in `.state/outputs/TASK-036-live-verification.json`.
