# TASK-016 Walkthrough: Remove Pointerdown-Triggered Modal Opening

## Result

- Removed the actual cause of the recurring "Tell me more does nothing" bug class:
  `bindTouchClick` no longer opens modals on `pointerdown`. It now triggers only on the
  standard `click` event.
- This is a structural fix, not another patch: with no DOM mutation happening before a
  single click event's target is resolved by the browser, there is no longer any window
  for a "trailing" event to resolve against a freshly-opened overlay or an inner close
  button. It closes all four failure scenarios an independent Opus audit identified
  (stray click on backdrop, same but with a longer finger-hold, stray click on either
  close button inside the modal card), not just the one TASK-015's timestamp guard
  covered.
- No responsiveness regression: `touch-action: manipulation` is already applied
  globally to `button` (and `.primary-btn`, `.secondary-btn`, etc.) in `styles.css`,
  which is what the pointerdown trigger was originally introduced to work around.
- Left TASK-015's `openedAt` guard in place as harmless defense-in-depth, and corrected
  its comment (it previously mis-attributed the race to TASK-009 "leaving it in place";
  TASK-009 actually introduced the backdrop-close handler that created the race).
- Confirmed against real production telemetry (Cloudflare D1) before and after this
  class of change, rather than relying on jsdom simulation alone.

## Verification

- `npm test`: 116/116 (added `TASK-016 AC-53`, `AC-54`; rewrote the now-obsolete
  TASK-015 pointerdown-opens-a-modal assertion to test the guard directly instead).
- `npm run test:coverage:gate`: passed (79.50% line, 64.52% branch, 69.32% function;
  gate requires 65/60/60).

## Process note

This task exists because the owner asked for an independent Opus subagent (clean
context, no priming) to verify TASK-015 before trusting it, given the bug had recurred
about five times. That audit is what surfaced the incomplete guard and the correct
architectural fix; see `worklogs/2026-08-08T1514-claude-code-sonnet.md` for the fuller
audit trail, including the exact prior-fix commit history and the production telemetry
queries that confirmed both the original failure and the TASK-015 partial fix.
