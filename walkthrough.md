# TASK-034 Walkthrough

## Result

- Added `silent-letters` with all 18 photographed words in order: whirl, wreck,
  kneel, crumb, ascend, descend, wrangle, knuckle, limb, gnarled, plumbing,
  elsewhere, ghoulish, succumb, fascinate, wrinkliest, overwhelm, dumbfounded.
- Added English definitions, explanations, example sentences, hints, and alt text.
- Created 18 distinct original SVG scenes illustrating the word meanings.
- Generated 36 local MP3s with `en-GB-SoniaNeural` at `-15%` and recorded provenance.
- Extended catalog and compact-picker regression coverage for ten lessons.
- New players default to Silent Letters; existing valid saved choices are restored.

## Verification

- Catalog checks: 12/12 passed. Picker checks: 2/2 passed.
- `npm test`: 148/148 passed.
- `npm run test:coverage:gate`: passed; 82.94% lines, 66.20% branches, 74.63% functions.
- Chromium audio QA decoded all 36 MP3s and checked non-silent audio data.
- Rendered and visually inspected all 18 SVG illustrations in a preview grid.
- `npm run test:e2e`: 1/1 full Chromium main scenario passed (85 seconds), including
  Silent Letters Learn navigation, Digital Test, Paper Test, and a complete Tiles game.

## Audio compatibility

Preinstalled edge-tts 7.2.8 returned HTTP 403 during the service handshake.
Installed official edge-tts 7.3.1 under project-local `.state/outputs` and used the
existing Sonia-only generator successfully. No global installation or voice change.
The source manifest and generated audio provenance record the exact speech input,
voice, rate, generator version, and existing voice approval.

## Release

- Target version: `v1.13.0`.
- Deployment source: `master` via the repository GitHub Pages workflow.
- Deployment verification: pending.

## Rollback

Revert the TASK-034 release commit on `master` and let GitHub Pages redeploy.
No learner storage schema or prior lesson data was changed.
