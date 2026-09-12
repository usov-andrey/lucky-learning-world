# TASK-033 Walkthrough

## Result

- Added the `st-saying-s` lesson with all 18 photographed words in their original order.
- Added child-friendly definitions, explanations, examples, hints, and meaningful alt text.
- Added 18 original local SVG learning illustrations.
- Generated 18 word tracks and 18 definition tracks with `en-GB-SoniaNeural` at `-15%`.
- Added matching audio/image provenance and a speech-source manifest.
- Extended catalog and compact-picker coverage for the ninth selectable lesson and newest default.

## Verification

- Focused catalog and picker tests: 13/13 passed.
- `npm test`: 147/147 passed.
- `npm run test:coverage:gate`: passed; 82.81% lines, 66.14% branches, 74.53% functions.
- `npm run test:e2e`: 1/1 full real-Chromium scenario passed.
- Asset inventory: 18 SVG files and 36 non-empty MP3 files.

## Release

- Target version: `v1.12.0`.
- Deployment source: `master` via the repository's GitHub Pages workflow.
- Task state: `RELEASED`.

---

# Previous TASK-032 Walkthrough

## Result

- Replaced the eight large lesson cards with one compact styled dropdown.
- Kept the existing glass, violet, green, and gold visual language.
- Made the newest catalog lesson the automatic default when no valid choice is saved.
- Preserved each learner's valid saved lesson selection across app instances.
- Kept all eight lessons selectable and synchronized with Learn, Test, and Tiles modes.
- Preserved the required 64 px touch target and added an English accessible label.

## Verification

- Focused lesson-picker/catalog/navigation tests: 16/16 passed.
- `npm test`: 146/146 passed.
- `npm run test:coverage:gate`: passed; 82.62% lines, 65.85% branches, 74.21% functions.
- `npm run test:e2e`: 1/1 full real-Chromium scenario passed.

## Release

- Target version: `v1.11.1`.
- Released locally as `v1.11.1`.
- Task state: `RELEASED`.

---

# Previous TASK-029 Walkthrough: Wanted Pokémon from Spelling Tests

## Result

Lucky can now earn Glaceon, Geodude, Butterfree, and Mew by completing Word Realm
spelling tests. Both Digital Test and Paper Test use the new priority reward pool.

## Reward behaviour

- Each completed spelling test awards one unowned Pokémon from the requested set.
- No requested Pokémon is repeated while another requested Pokémon remains locked.
- After all four are collected, later spelling tests return to the standard full-roster
  reward fallback.
- Tiles Game retains its previous ×6-first reward behaviour.
- Math Duel reward pools and academic progression are unchanged.

## Verification

- TASK-029 focused tests: 4/4 passed.
- `npm test`: 144/144 passed.
- `npm run test:coverage:gate`: passed; 84.54% lines, 65.88% branches, 73.42% functions.
- `npm run test:e2e`: 1/1 full real-Chromium scenario passed, including digital and
  paper spelling tests plus Tiles mode.
# TASK-030 Walkthrough

- Added the `ive-saying-iv` lesson with the 18 photographed words in order.
- Added child-friendly definitions, explanations, examples, hints, alt text, and local SVG art.
- Generated 36 MP3 tracks with `en-GB-SoniaNeural` at `-15%` and recorded provenance.
- Extended catalog and lesson-picker regression coverage; full suite passed before release.
