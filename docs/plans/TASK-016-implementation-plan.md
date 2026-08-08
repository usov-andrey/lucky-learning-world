# TASK-016 Implementation Plan: Remove Pointerdown-Triggered Modal Opening

## Context

Per the owner's request, an independent Opus subagent audited TASK-015 (the earlier
"Tell me more does nothing" fix) with a clean context, because this bug class had
recurred roughly five times before. The audit confirmed the race-condition mechanism
but found the TASK-015 timestamp guard incomplete — it only stops a stray click landing
exactly on the backdrop within 400ms, not a longer finger-hold, and not the more likely
case of the stray click landing on a close button inside the modal card. It recommended
removing the actual cause: opening modals on `pointerdown`.

Before implementing, queried the production Cloudflare D1 telemetry directly to confirm
against real sessions: a pre-fix session at the exact time of the owner's bug report
shows 7 consecutive failed taps; a post-TASK-015 session shows the first tap succeeding
— consistent with "the common case got fixed, the guard doesn't close the whole class."

## Approach

1. In `app.js`, remove the `pointerdown` listener from `bindTouchClick`; keep only
   `click` (with its existing 350ms re-entry guard and `stopPropagation`).
2. Verify `touch-action: manipulation` is already applied globally to `button` (and
   `.primary-btn`, `.secondary-btn`, etc.) in `styles.css`, so this is not a
   responsiveness regression.
3. Leave the TASK-015 `openedAt` guard in place as harmless defense-in-depth; fix its
   comment, which mis-attributed the race's origin to TASK-009 "leaving it in place"
   when TASK-009 actually introduced the backdrop-close handler that created it
   (confirmed via `git log -S 'this.closeModal(e.target)'`).
4. Rewrite the TASK-015 pointerdown-opens-a-modal test (now testing removed behavior)
   and add tests proving pointerdown is inert and a real click still opens exactly once,
   plus a second-modal (Parent Gate) test to confirm the fix isn't Tell-Me-More-specific.
5. `npm test` + `npm run test:coverage:gate`, then release via
   `node scripts/release.mjs --bump=patch --task=TASK-016`, push, verify production.

## Why this is lower-risk than another guard

The previous two fixes (TASK-009, TASK-015) each added defensive logic reacting to a
symptom of the same underlying cause, and each left a gap the next report re-opened.
Removing the `pointerdown` trigger removes the precondition itself: with only one event
(`click`) per gesture, and no DOM mutation before that event's target is resolved, there
is no window in which a "trailing" event's target can have shifted to something a
handler just opened.
