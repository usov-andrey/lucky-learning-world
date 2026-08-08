# TASK-018 Walkthrough: Fix Unclosed Modal Overlay Divs Causing Zero-Size Render

## Result

- The owner asked directly why I wasn't using something like Playwright to
  catch this myself instead of asking them to paste console output. That was
  the right call: driving a real headless Chromium browser against production
  found the actual bug in minutes, after three prior JS-focused fixes
  (TASK-015/016/017) had not resolved it.
- `#modal-tell-me-more` was opening exactly as intended by the JS
  (`display:flex`, `.active`, confirmed live in the console every single
  click) but rendered at `0×0`. Its real ancestor chain, walked live in the
  browser, was `#modal-tell-me-more < #victory-modal < #parent-settings-modal
  < body` — three modal overlays wrongly nested inside one another instead of
  being siblings, with the outermost one `display:none` by default and
  therefore collapsing everything inside it to nothing.
- A `jsdom` tag-depth scan of `index.html` (same HTML5 parsing algorithm as a
  real browser) pinpointed three separate missing closing tags in the Parent
  Settings / Victory modal markup, each swallowing everything after it into
  the wrong subtree for the rest of the file. Fixed all three; verified with
  `jsdom` that every `.modal-overlay` is now a direct child of `<body>`, and
  with Playwright against a local static server that the modal now renders at
  full viewport size (`390×844`) with the expected content visible.
- Added `tests/modal-overlay-structure.test.mjs` as the permanent regression
  guard — a cheap `jsdom` assertion, not a browser test, since the invariant
  itself (correct DOM nesting) is what needs protecting, and checking it
  doesn't require layout/paint.

## Why this explains the whole day

TASK-015, TASK-016, and TASK-017 were not wasted work — the click-race and
modal-state-stickiness bugs they fixed were real and are still worth having
fixed. But none of them could have fixed this, because the actual paint
failure lives entirely outside the JS/state layer they were all inspecting.
`jsdom`, which every prior test in this project (including today's) runs
against, cannot detect this failure mode at all: it doesn't lay out or paint,
so `style.display` and `classList` look "correct" from the element's own
perspective even while a hidden ancestor renders the whole subtree at zero
size on a real screen. Only a real browser (or a structural DOM-nesting
assertion, which is what `AC-57`'s test now provides going forward) could
have caught it.

## Verification

- `npm test`: all tests green, including the new `TASK-018 AC-57` structural
  test.
- `npm run test:coverage:gate`: passed.
- Playwright (local static server, before/after): `#modal-tell-me-more`
  bounding rect went from `{w:0,h:0}` to `{w:390,h:844}`; screenshot confirms
  the modal now renders fully, correctly populated with the word's definition.

## Process note

Playwright + Chromium were installed as a one-time diagnostic devDependency
for this investigation only. They are not part of `npm test` or the coverage
gate. The permanent regression guard is the cheap `jsdom` structural
assertion (AC-57), which encodes the actual invariant that broke without
needing a browser binary in CI. Whether to adopt Playwright permanently for
ongoing visual/rendering regression coverage — a real gap, since this bug
class is invisible to `jsdom` by construction — is flagged as an open
decision for the project owner rather than bundled into this fix.
