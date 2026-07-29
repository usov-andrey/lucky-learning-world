# TASK-006 — Narrative Event and PWA Release Contract Hardening

## Status

Proposed corrective follow-up. TASK-001 remains `RELEASED`; its historical task,
acceptance criteria, walkthrough, and release notes are not rewritten.

## Scope decisions

1. `item.requeued` is not a separate runtime narrative event.
2. Duplicate side effects are prevented at the transition boundary.
3. `manifest.json` receives no non-standard version field.
4. `engine/share-controller.js` remains owned by TASK-004.

## Step 1 — Freeze acceptance criteria and baseline

- Confirm AC-18.1 through AC-18.4 in
  `tasks/TASK-006-harden-narrative-and-release-contracts.md`.
- Run the current test suite and record the baseline.
- Add failing AC-tagged tests before changing runtime code.
- Verify TASK-004 status; do not copy its share/QR work into TASK-006.

## Step 2 — Unify the requeue contract

Use this single runtime shape:

```js
{
  type: "answer.incorrect",
  context: {
    requeued: true
  }
}
```

Required changes:

- keep `app.js` on the canonical shape;
- remove the standalone `item.requeued` catalog entries and tests, unless a
  compatibility path is explicitly documented and never emitted;
- ensure a wrong answer produces one feedback ViewModel;
- ensure the learning engine's queue mutation does not overwrite feedback with a
  second narrative event.

## Step 3 — Add transition-level idempotency

Use a stable transition key:

```text
sessionId:itemId:attempt:eventType
```

Implementation requirements:

- keep a bounded set of processed keys for the current session;
- reject a duplicate emit for the same key;
- clear or rotate keys only when a new session actually starts;
- do not emit domain events from render methods;
- `lucky:themechanged` re-resolves `lastNarrativeEvent` without emitting;
- theme refresh cannot restart timers, TTS, sound effects, rewards, completion,
  or Victory Card presentation;
- a new `attempt`, `itemId`, or genuine transition remains valid.

## Step 4 — Correct PWA release synchronization

Synchronize actual release markers in:

- `package.json`;
- `APP_VERSION` in `app.js`;
- visible version diagnostics and resource query strings in `index.html`;
- service-worker registration query, when versioned;
- `CACHE_NAME` in `sw.js`;
- automated version assertions;
- `CHANGELOG.md` and release artifacts.

Do not add a `version` property to `manifest.json`. Update the manifest only when
its real PWA metadata changes. Generated release notes must not claim the manifest
was version-bumped when it was untouched.

Service-worker activation must continue deleting only old cache keys with the
known `lucky-world-` prefix.

## Step 5 — Verify without duplicating TASK-004

Run:

```powershell
node --test tests/*.test.mjs
npm run test:coverage:gate
node scripts/release.mjs --dry-run --bump=patch --task=TASK-006
```

Verify:

- one incorrect/requeued transition produces one narrative event;
- duplicate delivery and repeated render are side-effect free;
- new items and attempts still emit;
- theme switching preserves question, score, tiles, queue, timers, audio, and
  rewards;
- dry-run reports only real version targets;
- `manifest.json` stays standards-compliant and versionless;
- TASK-004 remains the only task changing share/QR runtime files.

## Definition of Done

- AC-18.1 through AC-18.4 are covered by tagged automated tests;
- all existing tests and coverage gates pass;
- TASK-001 remains unchanged and released;
- TASK-004 scope is not duplicated;
- TASK-006 walkthrough records the implementation commits, verification, and any
  version rebase;
- the release is committed under TASK-006 and documented as a new corrective
  change, not as a retroactive TASK-001 edit.

