# TASK-018 Implementation Plan: Fix Unclosed Modal Overlay Divs Causing Zero-Size Render

## Problem

Four release cycles today (TASK-015, 016, 017, and now this one) addressed the
same owner-facing symptom: tapping "Tell Me More" does nothing. The first three
fixed real JavaScript-layer bugs (a touch/click race, then modal state that could
outlive its own visibility). But the owner reported the button was still dead on
**desktop Chrome** after TASK-017 shipped — which rules out any touch-specific
race as the remaining cause.

At the owner's own suggestion ("why don't you catch this yourself with a
Playwright test instead of asking me to paste console commands"), a real headless
Chromium browser was driven against the live production site. The JS was
confirmed working perfectly — every click logged `Modal display set to flex &
active` — but `document.getElementById("modal-tell-me-more").getBoundingClientRect()`
was `0×0` immediately after. Walking `element.parentElement` repeatedly showed
`#modal-tell-me-more` nested three levels deep inside `#victory-modal` inside
`#parent-settings-modal`, instead of being a sibling of `<body>` like every other
modal overlay. Since `#parent-settings-modal` is `display:none` by default, its
entire subtree renders at zero size regardless of any CSS on the descendant,
`!important` or not.

A `jsdom`-based tag-depth scan of the raw `index.html` (jsdom implements the same
HTML5 parsing algorithm as real browsers) confirmed the cause statically: three
separate missing closing tags in the Parent Settings / Victory modal markup, each
one silently absorbing everything that followed into the wrong subtree for the
rest of the file.

This also explains why TASK-015/016/017 never fully resolved the report: the
modal genuinely was opening correctly at the JS/state layer every time. It just
was never being painted, because an invisible ancestor swallowed it.

## Fix

1. `index.html`:
   - Close `#theme-option-comic`'s `<label>` properly (it was missing `</label>`
     entirely; a stray, wrongly-indented `</div>` stood in its place and was
     silently ignored by the parser since no `<div>` was open in scope).
   - Close `.theme-radio-group`'s own `<div>` (was being swallowed by the same
     missing-`</label>` bug).
   - Close `#parent-settings-modal`'s own `<div>` (only its inner `.modal-card`
     and section wrapper were being closed).
   - Close `#victory-modal`'s own `<div>` (only its inner `.modal-card` and
     `.reward-pet-preview` were being closed).
2. Add `tests/modal-overlay-structure.test.mjs`: a `jsdom` structural assertion
   that every `.modal-overlay` element's `parentElement` is `<body>`. This is
   the actual invariant that broke; it's a cheap, deterministic guard that
   would have caught this the moment the markup was first damaged, without
   needing a real browser.
3. Playwright + Chromium were added as a one-time diagnostic devDependency to
   reproduce and verify the fix against a real render, both on production and
   against a local static server before/after the fix. Not wired into `npm
   test` or the coverage gate — see the task file's Process Note for why, and
   for the open question of whether to adopt it permanently.

## Verification

- `npm test` — full suite green, including the new structural test.
- `npm run test:coverage:gate` — passed.
- Playwright script driven against a local static server: before the fix,
  `#modal-tell-me-more`'s rendered rect was `{w:0, h:0}`; after the fix, `{w:390,
  h:844}` (full viewport), with a screenshot showing the modal fully visible and
  correctly populated.
