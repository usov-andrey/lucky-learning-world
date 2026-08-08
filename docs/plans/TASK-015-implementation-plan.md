# TASK-015 Implementation Plan: Fix Modal Open/Close Touch Race

## Context

Owner reported live, on a real iPhone: tapping "Tell me more..." in Learn mode does
nothing. Other Learn-mode buttons work; a hard refresh did not help; owner said this is
a long-standing issue already reported to another agent before.

## Diagnosis

Reproduced the button's own click-handling logic in jsdom with a direct synthetic click
dispatch — it worked, proving the catalog data and `openTellMeMoreModal` logic are fine.
Confirmed production `app.js`/`index.html` byte-identical (modulo line endings) to what
was just deployed, ruling out stale cache/deploy drift.

Traced `bindTouchClick` (opens on `pointerdown` for touch) against the global
`document` click delegate's backdrop-close check
(`e.target.classList.contains("modal-overlay")`). On a real touch device, the browser's
trailing synthetic `click` (fired after `pointerup`) resolves its `target` by
coordinates *at click time* — by then the full-screen modal overlay opened during
`pointerdown` already covers that point, so the click's target is the overlay itself,
and the backdrop-close handler closes the modal within the same gesture. TASK-009 fixed
a related but different symptom (duplicate handler execution) and did not cover this.
Jsdom's `dispatchEvent` on a fixed target never exposed this, which is why TASK-009's
"92/92 passing" release still shipped the bug.

## Approach

1. `openModal()` stamps `modalElem.dataset.openedAt = Date.now()`.
2. The backdrop-click-to-close handler ignores clicks within 400ms of that timestamp.
3. Add a regression test that reproduces the real sequence (pointerdown opens, then a
   click targeting the overlay fires immediately) and asserts the modal stays open, plus
   confirms a later, genuine backdrop tap still closes it.
4. Fix the pre-existing TASK-009 test, which incidentally relied on an immediate
   backdrop click closing the modal — now correctly backdated.
5. Run `npm test` + `npm run test:coverage:gate`, release via
   `node scripts/release.mjs --bump=patch --task=TASK-015`, push, verify production.

## Risks considered

- **Guard window too short/long**: 400ms matches the existing 350ms lockout pattern
  already established in this codebase (TASK-009's `bindTouchClick`), giving headroom
  above real touch-event timing while staying well under human reaction time for a
  deliberate second tap.
- **Masking genuine backdrop taps**: mitigated by only guarding the *specific* modal
  instance's own `openedAt` timestamp, not a global lock, and by the window being short
  enough that a real intentional tap-to-close a moment later still works.
