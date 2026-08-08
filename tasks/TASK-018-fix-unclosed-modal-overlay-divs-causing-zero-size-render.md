---
id: TASK-018
title: "Fix Unclosed Modal Overlay Divs Causing Zero-Size Render"
status: RELEASED
version: v1.6.0
created: 2026-08-08
github_issue: null
---

# TASK-018: Fix Unclosed Modal Overlay Divs Causing Zero-Size Render

## 💡 1. Idea & Proposal

- **Context**: TASK-015, TASK-016, and TASK-017 all treated "Tell Me More does
  nothing" as a JavaScript problem (a touch/click race, then stale modal state).
  Those were real bugs and the fixes were correct, but the owner reported the
  button was *still* dead after TASK-017 shipped — on desktop Chrome this time,
  ruling out any touch-specific race entirely.
  Driving a real headless Chromium browser via Playwright against production
  (at the owner's own suggestion — "why don't you catch this with a Playwright
  test yourself instead of asking me to paste console commands") showed the
  actual defect immediately: after `openModal()` ran and set
  `display:flex` + `.active` on `#modal-tell-me-more` exactly as intended, its
  own `getBoundingClientRect()` was `0×0`. Walking the live ancestor chain
  (`el.parentElement` repeatedly) showed `#modal-tell-me-more` was a
  *descendant* of `#victory-modal`, which was a descendant of
  `#parent-settings-modal` — three unrelated modal overlays nested inside one
  another instead of being siblings of `<body>`. Since `#parent-settings-modal`
  is `display:none` by default, its entire subtree renders at zero size no
  matter what CSS is applied to the descendant, regardless of `!important`.
  A `jsdom`-based tag-depth scan of `index.html` (jsdom uses the same HTML5
  parsing algorithm as real browsers) confirmed the root cause statically:
  `index.html` had three separate missing closing tags —
  1. `#theme-option-comic` (a `<label>` inside the Parent Settings modal) was
     never closed with `</label>`; a stray, wrongly-indented `</div>` stood in
     its place and was silently ignored by the HTML parser (no open `<div>`
     was in scope to close), so `.theme-radio-group`'s own closing `</div>`
     was also swallowed.
  2. `#parent-settings-modal` itself had no closing `</div>` at all — only its
     inner `.modal-card` and section wrapper were closed.
  3. `#victory-modal` itself had no closing `</div>` either — only its inner
     `.modal-card` and `.reward-pet-preview` were closed.
  Each missing close silently absorbed everything that followed into the
  wrong subtree, for the entire remainder of the file. This means all four
  release cycles today were fixing real, secondary bugs while the primary
  cause — present since whenever this markup was last hand-edited — was
  untouched. This is also why the two previous JS-only diagnoses never fully
  resolved the report: the modal *was* opening correctly at the JS/state
  layer every single time (confirmed again in this session's own browser
  console log — every click produced a fresh `Modal display set to flex &
  active` line), it just wasn't being painted because an invisible ancestor
  swallowed it.
- **Proposed Solution**:
  1. Add the three missing closing tags in `index.html` so `#modal-tell-me-more`,
     `#victory-modal`, `#qr-modal`, and `#parent-settings-modal` are all direct
     children of `<body>`, matching every other modal overlay in the file.
  2. Add a permanent structural regression test asserting every
     `.modal-overlay` element is a direct child of `<body>` — this is the
     actual invariant that broke, it is cheap (pure `jsdom` DOM-tree
     assertion, no browser needed), and it would have caught this the moment
     the markup was first broken.
  3. Use Playwright (added as a new, one-time devDependency) as the diagnostic
     tool to reproduce and verify the real rendered fix end-to-end, since this
     entire bug class is invisible to `jsdom`-based tests (jsdom does not lay
     out or paint — it cannot detect a `0×0` bounding box). Playwright itself
     is not added to the CI test gate in this task; the cheap structural
     `jsdom` assertion is what guards this invariant going forward.

## 📋 2. Acceptance Criteria (AC)
- [x] **AC-57**: Every element with class `modal-overlay` in `index.html` MUST be a direct child of `<body>` (no modal overlay may be nested inside another modal overlay or any other container).
- [x] **AC-58**: `#modal-tell-me-more`, when opened, MUST have a non-zero rendered bounding box covering the viewport (verified live via Playwright against a real Chromium render, not just via computed-style assertions).

## 🧪 3. Test Coverage
- `tests/modal-overlay-structure.test.mjs` — TASK-018 AC-57 (jsdom structural
  invariant: parses the real `index.html`, asserts every `.modal-overlay`'s
  `parentElement` is `<body>`).
- Manually verified AC-58 with a one-off Playwright script driving real
  Chromium against a local static server, before and after the fix
  (not committed as a CI test — see Process Note below).

## 💻 4. Impacted Code Files
- `index.html` (three missing closing tags added: `</label>` for
  `#theme-option-comic`, `</div>` for `#parent-settings-modal`, `</div>` for
  `#victory-modal`)
- `tests/modal-overlay-structure.test.mjs` (new)

## 📦 5. Release & Artifacts
- **Version**: `v1.6.0`
- **Release Notes / Walkthrough**: `docs/releases/v1.6.0.md`

## Process Note
Playwright (`playwright` + Chromium binary) was added as a devDependency
purely as an ad-hoc diagnostic tool for this investigation, driven directly
against the live production site and then a local static server. It is
**not** wired into `npm test` or the coverage gate — the actual regression
guard for this bug is the cheap `jsdom` structural assertion in AC-57, which
runs in milliseconds and requires no browser binary. Whether to adopt
Playwright permanently for visual/rendering regression coverage (this bug
class — nodes present in the DOM but not actually painted — is fundamentally
invisible to `jsdom`) is a separate infrastructure decision left for the
project owner, not bundled into this fix.
