# TASK-030 Walkthrough

- Added the `ive-saying-iv` lesson with the 18 photographed words in order.
- Added child-friendly definitions, explanations, examples, hints, alt text, and local SVG art.
- Generated 36 MP3 tracks with `en-GB-SoniaNeural` at `-15%` and recorded provenance.
- Extended catalog and lesson-picker regression coverage; full suite passed before release.

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
