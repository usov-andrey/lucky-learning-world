---
id: TASK-015
title: "Fix Modal Open/Close Touch Race (Tell Me More and Any Modal Opened by Touch)"
status: RELEASED
version: v1.5.1
created: 2026-08-08
github_issue: null
---

# TASK-015: Fix Modal Open/Close Touch Race

## 1. Goal and context

Owner reported on a real iPhone: tapping "Tell me more..." in Learn mode does nothing —
no visible modal. Other Learn-mode buttons (Speak Word, Listen to Definition, Next,
Back) work fine. A hard refresh / full app relaunch did not fix it. The owner noted this
is a long-standing issue already reported to another agent before this session.

TASK-009 ("Fix 'Tell me more...' Button Interaction & Touch Latency") already attempted
to fix a related symptom by deduplicating `bindTouchClick`'s own pointerdown+click
handling (350ms lockout, `stopPropagation`). That fix is real but incomplete: it stops
the button's *own* handler from firing twice, but does not address a separate handler —
the global `document` click delegate that closes a modal when the click target is the
`.modal-overlay` backdrop.

### Root cause

1. `bindTouchClick` fires its handler on `pointerdown` for touch input, so
   `openTellMeMoreModal()` runs and sets the modal to `display: flex` *before* the
   browser's own trailing synthetic `click` event (fired after `pointerup`, at the same
   screen coordinates) is dispatched.
2. By the time that trailing `click` event fires, the full-screen `.modal-overlay`
   (`position: fixed; inset: 0; z-index: 999999`) now covers the exact point where the
   finger lifted. The click event's `target` therefore resolves to the overlay itself,
   not the button.
3. The global backdrop-click-to-close handler
   (`if (e.target.classList.contains("modal-overlay")) { closeModal(...) }`) sees this
   and closes the modal that was just opened — within the same touch gesture, before the
   user perceives it. From the user's perspective, tapping the button does nothing.
4. This does not reproduce with a single synthetic `MouseEvent("click")` dispatched
   directly on the button (as the existing TASK-005/TASK-009 jsdom tests do), because
   that skips the pointerdown-then-coordinate-resolved-click sequence that real touch
   input produces. Hence it survived TASK-009's "92/92 tests passing" release.

## 2. Acceptance criteria

- [x] **AC-52**: When a modal is opened by a touch (`pointerdown`), the trailing
      synthetic `click` at the same coordinates must not close it via the backdrop
      handler. A genuine backdrop tap occurring after the opening gesture must still
      close the modal.

## 3. Fix

- `openModal()` stamps `modalElem.dataset.openedAt = Date.now()`.
- The backdrop-click-to-close handler ignores clicks on `.modal-overlay` within 400ms
  of that timestamp, then proceeds normally afterward.
- This is a general fix (applies to every modal opened via `bindTouchClick`, not just
  Tell Me More), since the underlying race is generic.

## 4. Test coverage

- `tests/spelling-modal-e2e.test.mjs`:
  - New test: `TASK-015 AC-52` — simulates the real pointerdown-opens /
    trailing-click-targets-overlay sequence and asserts the modal stays open, then
    confirms a later backdrop tap still closes it.
  - Updated the pre-existing TASK-009 backdrop-close assertion to backdate
    `dataset.openedAt` before dispatching the close click, since it previously
    (incidentally) relied on closing within the same guard window this fix now blocks.

## 5. Impacted files

- `app.js` (`openModal`, global backdrop click delegate)
- `tests/spelling-modal-e2e.test.mjs`
- `ACCEPTANCE_CRITERIA.md`, `tasks/INDEX.md`

## 6. Release and artifacts

- Version: `v1.5.1`
- Plan: `docs/plans/TASK-015-implementation-plan.md`
- Walkthrough: `docs/walkthroughs/TASK-015-walkthrough.md`
- Release notes: `docs/releases/v1.5.1.md`
