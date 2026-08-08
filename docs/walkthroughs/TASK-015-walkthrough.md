# TASK-015 Walkthrough: Fix Modal Open/Close Touch Race

## Result

- Fixed a real, long-standing bug the owner reported live on an iPhone: tapping
  "Tell me more..." in Learn mode appeared to do nothing.
- Root cause: `bindTouchClick` opens modals on `pointerdown` for touch input. The
  browser's own trailing synthetic `click` event (fired after `pointerup`) resolves its
  target by screen coordinates at click time — by then the just-opened full-screen
  modal overlay covers that same point, so the click's target becomes the overlay, and
  the existing backdrop-click-to-close handler closes the modal within the same gesture.
  TASK-009 fixed a related but different symptom (duplicate handler execution) and did
  not cover this specific race; jsdom's synthetic single-click tests never exposed it.
- Fix: `openModal()` now stamps `dataset.openedAt`; the backdrop-click-to-close handler
  ignores clicks on the overlay within 400ms of that timestamp. This is a general fix —
  it applies to every modal opened via `bindTouchClick`, not just Tell Me More.
- Added a regression test that reproduces the real pointerdown-then-coordinate-resolved-click
  sequence and confirms the modal survives it, plus confirms a later genuine backdrop tap
  still closes the modal.
- Fixed the pre-existing TASK-009 backdrop-close test, which incidentally relied on
  closing within the same guard window this fix now blocks (backdated its `openedAt`
  before dispatching the close click).

## Verification

- `npm test`: 114/114 tests passed, including the new TASK-015 regression test and the
  updated TASK-009 test.
- `npm run test:coverage:gate`: passed (79.50% line, 64.52% branch, 69.32% function;
  gate requires 65/60/60).
