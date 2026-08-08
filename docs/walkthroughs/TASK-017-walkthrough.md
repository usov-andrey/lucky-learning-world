# TASK-017 Walkthrough: Modal State Never Outlives Its Visibility

## Result

- Found (via direct production D1 telemetry query, not guessing) that TASK-016's fix is
  real and working — the first tap on Tell Me More opens the modal correctly — but a
  second, different bug made it look broken afterward: once opened, if the modal is
  never closed through its own controls, it stays marked `active` for the rest of the
  session, so every later tap on the same button correctly no-ops as "already-active"
  with no visible effect. Worse, a *different* modal (Parent Gate) was still able to
  open on top of it, meaning nothing enforced "only one modal is ever active."
- Fix: `app.js` now has `closeAllModals(exceptElem)`. It is called unconditionally at
  the top of `showScreen()` (any screen navigation clears stale modal state) and from
  `openModal()` itself, excluding the modal being opened (so opening any modal always
  closes any other first — at most one modal can ever be active).
- Also fixed a missing `-webkit-backdrop-filter` prefix on `.modal-overlay` found while
  investigating (Safari correctness gap), and bundled the owner's separate request:
  the diagnostic build-time label now shows `Asia/Bangkok` local time instead of UTC.
- Added regression tests reproducing both real-telemetry scenarios: a modal left open
  across a screen change, and a second modal opening while the first is still active.

## Verification

- `npm test`: 118/118 (added `TASK-017 AC-55`, `AC-56`; updated the build-time test for
  the Bangkok-local format).
- `npm run test:coverage:gate`: passed (79.52% line, 64.59% branch, 69.46% function;
  gate requires 65/60/60).

## Process note

This is the third release in a row addressing the same user-facing symptom
("Tell me more doesn't work"), and the second time production telemetry (not jsdom
alone) was queried before writing code — first to verify TASK-016 was real progress,
then to identify that this was a genuinely different bug rather than a regression of
the click-race TASK-016 fixed. See `worklogs/2026-08-08T1514-claude-code-sonnet.md` for
the full day's trail, including the independent Opus audit that led to TASK-016.
