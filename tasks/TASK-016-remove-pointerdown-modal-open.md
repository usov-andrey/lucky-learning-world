---
id: TASK-016
title: "Remove Pointerdown-Triggered Modal Opening (Architectural Fix)"
status: RELEASED
version: v1.5.2
created: 2026-08-08
github_issue: null
---

# TASK-016: Remove Pointerdown-Triggered Modal Opening

## 1. Goal and context

TASK-015 patched one specific failure mode of the "Tell me more..." button doing
nothing on real touch devices: a timestamp guard so a stray backdrop click landing
right after open doesn't immediately close the modal. Per the owner's request, an
independent Opus subagent audited that fix with a clean context before it was trusted
as final, because this class of bug had already recurred roughly five times.

The audit (see the subagent's report, summarized in
`worklogs/2026-08-08T1514-claude-code-sonnet.md`) confirmed the mechanism but found the
TASK-015 guard incomplete:

- It only covers a stray click landing on `.modal-overlay` itself, within 400ms.
- It does not cover the same race with a longer finger-hold (>400ms).
- It does not cover the more likely case for this specific button: the stray click
  landing on `#btn-close-tell-me-more` / `#btn-close-tell-me-more-x`, inside the modal
  card, since the card visually centers close to where the button sits on screen.
- Production telemetry (Cloudflare D1, queried directly for this task) confirmed both
  ends: a pre-fix session at the exact time of the owner's bug report shows 7
  consecutive taps on `btn-tell-me-more`, 0 successful opens; a post-TASK-015 session
  shows the first tap opening successfully — consistent with "the common case is fixed,
  the narrower guard doesn't close the whole class."

Root cause: `bindTouchClick` opened modals on `pointerdown`, synchronously mutating the
DOM (raising the full-screen overlay) before the browser's own trailing `click` event
for that same touch gesture resolves its target via hit-testing at click-dispatch time.
Any timestamp- or target-based guard added after the fact is fundamentally reactive;
removing the pointerdown trigger removes the precondition for the whole bug class.

## 2. Acceptance criteria

- [x] **AC-53**: `bindTouchClick` opens/triggers only on `click`; a `pointerdown` alone
      must not invoke any bound handler or open any modal.
- [x] **AC-54**: With no DOM mutation happening before the single click event's target
      is resolved, no modal-opening button can have its gesture's coordinate-resolved
      event land on a different control (backdrop or an inner close button).

## 3. Fix

- `app.js` `bindTouchClick`: removed the `pointerdown` listener entirely; kept the
  existing `click` listener, its 350ms re-entry guard, and `stopPropagation`.
- Confirmed via `styles.css` that `touch-action: manipulation` is already applied
  globally to `button` (plus `.primary-btn`, `.secondary-btn`, etc.), so this is not a
  responsiveness regression — the ~300ms tap delay this pointerdown trigger was
  originally introduced to avoid is already eliminated by that CSS rule.
- Left the TASK-015 `openedAt` timestamp guard in place as harmless defense-in-depth.
- Updated the stale comment on the backdrop-close handler that attributed the race to
  TASK-009 "leaving it in place" — TASK-009 actually introduced the backdrop-close
  handler that created this exact race (confirmed via `git log -S`).

## 4. Test coverage

- `tests/spelling-modal-e2e.test.mjs`:
  - Rewrote the TASK-015 test to test the guard directly (still useful, no longer
    load-bearing) instead of asserting pointerdown opens a modal.
  - New `TASK-016 AC-53` test: pointerdown alone does not open the modal; a real click
    does, exactly once.
  - New `TASK-016 AC-54` test: opening the Parent Gate modal (a second, independent
    modal-opening button) via a single click still works, confirming the fix is general
    and not Tell-Me-More-specific.

## 5. Verification

- Queried production D1 telemetry directly (`wrangler d1 execute`) to confirm the
  reported failure and the TASK-015 partial fix against real sessions before making
  this change, rather than relying on jsdom simulation alone.
- `npm test`: 116/116. `npm run test:coverage:gate`: passed (79.50/64.52/69.32 vs
  65/60/60 gate).

## 6. Impacted files

- `app.js` (`bindTouchClick`, backdrop-close handler comment)
- `tests/spelling-modal-e2e.test.mjs`
- `ACCEPTANCE_CRITERIA.md`, `tasks/INDEX.md`

## 7. Release and artifacts

- Version: `v1.5.2`
- Plan: `docs/plans/TASK-016-implementation-plan.md`
- Walkthrough: `docs/walkthroughs/TASK-016-walkthrough.md`
- Release notes: `docs/releases/v1.5.2.md`
