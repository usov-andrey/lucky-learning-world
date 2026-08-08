---
id: TASK-017
title: "Modal State Never Outlives Its Visibility (Single Source of Truth)"
status: RELEASED
version: v1.5.3
created: 2026-08-08
github_issue: null
---

# TASK-017: Modal State Never Outlives Its Visibility

## 1. Goal and context

Owner tested TASK-016 (v1.5.2) live and reported the "Tell me more..." button still
didn't work. Queried production D1 telemetry for the very latest session (post-v1.5.2,
confirmed via `sessions.app_version`) and found a different bug from the one TASK-015/
TASK-016 fixed:

- First tap on `btn-tell-me-more`: `action.completed`, `transition: modal, closed →
  modal-tell-me-more` — opens correctly, the click-race bug is genuinely gone.
- The modal is then never closed through any of its own controls (no `modal,
  modal-tell-me-more → closed` transition appears anywhere later in the session).
- Every subsequent tap on the same button: `action.noop`, `reason: already-active` —
  correct given the internal state, but the user perceives this as "the button doesn't
  work," because nothing further happens.
- Later in the same session, the header's Parent Mode button successfully opened the
  Parent Gate modal — meaning the app allowed a second modal to open while the first was
  still internally marked active, with no single place enforcing "only one modal is
  ever open at a time" or resetting stale state on navigation.

## 2. Acceptance criteria

- [x] **AC-55**: `showScreen()` closes every currently-open modal, regardless of how it
      was left open.
- [x] **AC-56**: `openModal()` closes every other currently-active modal before opening
      the requested one; re-opening the same already-open modal still correctly no-ops.

## 3. Fix

- `app.js`: added `closeAllModals(exceptElem)`, iterating every known modal element.
  Called unconditionally at the top of `showScreen()`, and from `openModal()` (excluding
  the modal being opened) so opening any modal always closes any other.
- `styles.css`: added the missing `-webkit-backdrop-filter` prefix alongside the
  existing unprefixed `backdrop-filter` on `.modal-overlay` (Safari correctness gap
  found while investigating, unrelated but cheap to fix alongside).
- `build-info.js`: unrelated small owner request bundled into this release — the
  diagnostic build-time label now formats in `Asia/Bangkok` local time instead of UTC.

## 4. Test coverage

- `tests/spelling-modal-e2e.test.mjs`:
  - `TASK-017 AC-55`: opens Tell Me More, navigates away via `showScreen`, confirms the
    modal is closed, then confirms the button works again after returning (not stuck
    "already-active").
  - `TASK-017 AC-56`: opens Tell Me More, then opens Parent Gate without a screen
    change, confirms Tell Me More is closed as a result.
- `tests/build-metadata.test.mjs`: updated to assert the Bangkok-local format instead
  of UTC.

## 5. Verification

- Queried production D1 telemetry (`wrangler d1 execute --remote`) before writing any
  code, to confirm this was a real, distinct bug from TASK-015/016 rather than a
  guess.
- `npm test`: 118/118. `npm run test:coverage:gate`: passed (79.52/64.59/69.46 vs
  65/60/60 gate).

## 6. Impacted files

- `app.js` (`closeAllModals`, `openModal`, `showScreen`)
- `styles.css` (`.modal-overlay`)
- `build-info.js` (`formatBuildLabel`)
- `tests/spelling-modal-e2e.test.mjs`, `tests/build-metadata.test.mjs`
- `ACCEPTANCE_CRITERIA.md`, `tasks/INDEX.md`

## 7. Release and artifacts

- Version: `v1.5.3`
- Plan: `docs/plans/TASK-017-implementation-plan.md`
- Walkthrough: `docs/walkthroughs/TASK-017-walkthrough.md`
- Release notes: `docs/releases/v1.5.3.md`
