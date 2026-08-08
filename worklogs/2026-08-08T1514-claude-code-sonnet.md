Session log. Not required reading.

# Session Log: 2026-08-08T1514 (claude-code-sonnet)

## Goal

Owner sent a school-book photo ("‹ear› saying /er/", 18 words) and asked to add the
words to "lucky learning world" and make them the default lesson, and to double-check
resources/audio quality across all modes.

## What happened

1. **First attempt went to the wrong project.** Project discovery used a filename-only
   `Glob "*lucky*"` search, which missed `personal/projects/lucky-learning-world`
   entirely (none of its files have "lucky" in the filename, only the directory does).
   The words were added instead to the archived standalone `lucky-spelling-skill`
   project (own TTS pipeline, `en-US-JennyNeural`, no images).
2. **Owner caught the mistake** ("Почему ты добавил в Spelling test, а не в lucky
   learning world?") and asked to archive `lucky-spelling-skill` and `math-monster`
   (old, pre-migration versions) — local-only archiving, no GitHub takedown.
   - Added archive notices to both projects' `AGENTS.md`/`README.md`.
   - Fixed the root workspace router (`harness/templates/AGENTS.root.md`): explicit
     routing table row for Lucky/spelling/math → `lucky-learning-world`, plus a rule to
     list project directories rather than rely on filename-only globs. Regenerated
     `D:\SD\AGENTS.md` via `link.ps1 -Root`.
   - Saved two memory entries: `lucky-learning-world-active-project`,
     `project-search-list-dirs-not-glob-filenames`.
3. **Redid the work properly as TASK-014** in `lucky-learning-world`, following its
   own process (`DEVELOPMENT_RULES.md`): Acceptance Criteria first, task file, tagged
   tests, release automation.
   - `content/ear-saying-er/`: 18 words, definitions, extended explanations, example
     sentences, hints, 18 original SVG illustrations, Sonia-voice
     (`en-GB-SoniaNeural`, `-15%`) word + definition audio via
     `scripts/generate-spelling-audio.py`, provenance files.
   - `content/spelling-catalog.js`: added `EAR_SAYING_ER_LESSON`, set
     `DEFAULT_SPELLING_LESSON_ID = "ear-saying-er"`, fixed `getSpellingLesson()`'s
     unknown-id fallback to follow the configured default instead of a hardcoded
     `page-22`.
   - Updated/added tests in `spelling-lesson-catalog.test.mjs`,
     `spelling-lesson-ui.test.mjs`; fixed two pre-existing tests that hardcoded
     Page 22 as the default (`spelling-full-ui-e2e.test.mjs`, the AC-11 UI test) and
     one that hardcoded the released version literal (`build-metadata.test.mjs`).
   - `ACCEPTANCE_CRITERIA.md` AC-48..AC-51, `tasks/TASK-014-*.md`, `tasks/INDEX.md`.
   - Release via `scripts/release.mjs --bump=minor --task=TASK-014` → `v1.5.0`.

## Grabli (what went sideways)

- `scripts/release.mjs` runs its own `git add . && git commit` as part of the release
  step. It swept in unrelated pre-existing `.wrangler/tmp/**` deletions (stale, already
  gitignored build artifacts from an earlier session) — harmless, but not something I'd
  reviewed before it landed in the commit. Worth knowing: running that script commits
  the *entire* working tree, not just the release-relevant files.
- Same script "mirrors" whatever is currently at the repo root
  (`implementation_plan.md`, `walkthrough.md`) into the new
  `docs/plans/TASK-014-*.md` / `docs/walkthroughs/TASK-014-*.md` copies. Since I hadn't
  written TASK-014-specific root files yet, it copied stale TASK-011/012 and TASK-009
  content into the TASK-014 docs. Fixed with a follow-up commit. Lesson: write the root
  `implementation_plan.md`/`walkthrough.md` *before* invoking `release.mjs`, not after.
- `git push origin master` was rejected (non-fast-forward) — another agent had pushed
  `fix(TASK-011): publish daily issue when label creation fails` to master in the
  meantime. Confirmed no file overlap, rebased cleanly, reran the full suite
  (113/113), pushed.

## Verification

- `npm test`: 113/113 (after rebase picked up the concurrent TASK-011 fix).
- `npm run test:coverage:gate`: passed, well above the 65/60/60 gate.
- Local HTTP smoke test: core files + all 54 new-lesson asset URLs (18 words ×
  image/audio/definitionAudio) returned 200.
- Pushed to `master` (`037a8cf`); GitHub Actions "Deploy to GitHub Pages", "External AI
  Agent Quality & Coverage Gate", and "Sync Tasks & Validate Task Index" all completed
  successfully.
- Production verification against `https://usov-andrey.github.io/lucky-learning-world`:
  `app.js`, `content/spelling-catalog.js`, and the new lesson's assets return 200; the
  live catalog's `DEFAULT_SPELLING_LESSON_ID` is confirmed `"ear-saying-er"`.

## Remaining / not done

- SVG illustrations were authored programmatically to match the existing house style
  and validated as well-formed XML + reachable over HTTP, but not visually reviewed in
  a browser — no screenshot/visual QA pass was done this session.
- No GitHub Issue exists for TASK-014 (`task:sync` didn't create one on this push;
  earlier tasks have issues, this one doesn't — not investigated further).

## Addendum: TASK-015, same day, later in the session

Owner tested the deployed lesson on a real iPhone and reported "Tell me more..." does
nothing in Learn mode — a bug they said they'd already reported to another agent before
(i.e. pre-existing, not something TASK-014 introduced).

- Reproduced the button/modal logic in jsdom with a direct synthetic click — worked, so
  catalog data and `openTellMeMoreModal` were not the cause. Diffed production `app.js`/
  `index.html` byte-for-byte against local (after stripping CRLF) — identical, so not a
  deploy-drift or stale-cache issue either (owner also confirmed a hard relaunch didn't
  help).
- Root cause: `bindTouchClick` opens modals on `pointerdown` for touch. The browser's
  trailing synthetic `click` (fired after `pointerup`) resolves its target by
  coordinates *at click time* — by then the just-opened full-screen modal overlay
  already covers that point, so the click's target is the overlay, and the existing
  backdrop-click-to-close handler closes the modal within the same gesture. TASK-009
  (weeks earlier) fixed a related but different symptom and never caught this, because
  its own jsdom tests dispatch a single synthetic click directly on the button, which
  never exercises the coordinate-based backdrop hit.
- Fix: `openModal()` stamps `dataset.openedAt`; the backdrop handler ignores overlay
  clicks within 400ms of that timestamp (mirrors the existing 350ms lockout pattern from
  TASK-009). General fix — covers every modal opened via `bindTouchClick`, not just Tell
  Me More.
- Added a regression test reproducing the real sequence (open via pointerdown, then a
  click whose target is the overlay, dispatched immediately) and confirmed a later
  genuine backdrop tap still closes the modal. Had to backdate `openedAt` in the
  pre-existing TASK-009 backdrop-close test, which had incidentally relied on closing
  within the same window this fix now guards.
- `npm test`: 114/114. `npm run test:coverage:gate`: passed (79.50/64.52/69.32 vs 65/60/60).
- Released `v1.5.1` (patch bump). This time wrote the root `implementation_plan.md`/
  `walkthrough.md` *before* running `release.mjs`, avoiding the TASK-014 mis-mirror
  mistake. Still had to bump the hardcoded `APP_VERSION` literal in
  `tests/build-metadata.test.mjs` again after the release script ran — this is a
  recurring one-line papercut on every release, not fixed here since it's out of scope
  for a bug-fix task and the test's strictness looks intentional (AC-47).
- Pushed to `master` (`14c2344`); Deploy/Coverage Gate/Task Sync all green. Verified the
  fix is live: production `app.js` contains `dataset.openedAt` and the `< 400` guard,
  `build-info.js` reports `v1.5.1`.

## Addendum 2: TASK-016, owner asked for an independent Opus audit before trusting TASK-015

Owner, unprompted by anything I said, pushed back: "проверь, что действительно в этом
проблема... такую задачу уже исправляли раз 5" — asked for a fresh Opus subagent with
clean context (no priming from this conversation) to independently verify the TASK-015
diagnosis/fix rather than accept it.

**Audit findings** (agent id not recorded here; see its full report in the conversation
if this file is read alongside it):

- Real prior-fix count via `git log`: 3 attempts specifically at "Tell me more" (a
  scattered click-handler fix on 26.07, TASK-009 on 04.08, TASK-015 today), 8 commits
  total touching touch/click/modal handling since 26.07. Owner's "~5 times" was
  essentially accurate.
- **My TASK-015 walkthrough mis-attributed history**: I wrote "TASK-009 left this race
  in place." The audit found via `git log -S 'this.closeModal(e.target)' -- app.js` that
  TASK-009 *introduced* the backdrop-close handler that created the race — it didn't
  exist before 04.08. TASK-015 fixed a regression from the previous "fix," not a
  long-standing latent bug.
- Built an honest jsdom A/B stand (real pointerdown-then-coordinate-resolved-click
  sequence, not a single synthetic click) and ran it against pre-TASK-009, pre-TASK-015,
  and HEAD. TASK-015's guard fixed the exact scenario it targeted (stray click on
  `.modal-overlay`, 0ms delay) but left three real failure modes open: the same race
  with a >400ms finger-hold, and — more importantly — a stray click landing on
  `#btn-close-tell-me-more` or the `✕` button *inside* the modal card (structurally more
  likely than the backdrop, since the card centers close to where the button sits).
  Verdict: architectural problem (pointerdown mutating DOM mid-gesture, plus two
  independent click-handling systems — `bindTouchClick` per-element and a global
  `document` delegate), not a one-off race; recommended removing the `pointerdown`
  trigger entirely rather than another guard.

**I then queried production telemetry directly** (Cloudflare D1 via `wrangler d1
execute --remote`, using the already-authenticated account) rather than trusting either
the subagent's jsdom stand or my own reasoning alone:

- A session at `2026-08-08T09:37:2x-28Z` — matching the phone clock "16:37" in the
  owner's screenshot exactly (Bangkok = UTC+7) — shows 7 consecutive taps on
  `btn-tell-me-more`, every one ending in `action.noop` (reason `already-active`, which
  is wrong for a modal that was never actually opened) or `action.timed_out` (`reason:
  no-semantic-outcome`). Zero `action.completed` events. `app_version: "unknown"` (older
  page, pre-dates the build-info version tag on session start) — consistent with this
  being the pre-fix (v1.5.0) failure as reported.
- A session at `10:01:04Z`, `app_version: "v1.5.1"`, shows the first tap on
  `btn-tell-me-more` producing a clean `action.completed` with `transition: modal,
  closed → modal-tell-me-more` — the TASK-015 fix does work for the common case in real
  production use, matching the audit's verdict that it fixed *something* real.

**Fix (TASK-016)**: removed the `pointerdown` listener from `bindTouchClick` in
`app.js` entirely — it now triggers only on `click`. Confirmed `touch-action:
manipulation` is already applied globally to `button` (and `.primary-btn`,
`.secondary-btn`, etc.) in `styles.css`, so this is not a responsiveness regression; it
was the actual reason `touch-action: manipulation` needed to exist, and it already did,
which is why removing `pointerdown` costs nothing. Left the TASK-015 `openedAt` guard in
place as harmless defense-in-depth and fixed its comment's mis-attribution. Rewrote the
now-obsolete TASK-015 "pointerdown opens the modal" assertion, added tests proving
pointerdown is inert and a real click opens exactly once, plus a second-modal (Parent
Gate) test proving the fix isn't Tell-Me-More-specific.

- `npm test`: 116/116. `npm run test:coverage:gate`: passed (unchanged, 79.50/64.52/69.32).
- Released `v1.5.2` (patch). Root plan/walkthrough written *before* `release.mjs` again
  (no mis-mirror this time). `tests/build-metadata.test.mjs`'s hardcoded `APP_VERSION`
  needed bumping again — third time in three releases today; still not fixing the root
  tooling gap, out of scope for a bug-fix task.
- Pushed to `master` (`350e9e8`); Deploy/Coverage Gate/Task Sync all green. Verified
  live: production `app.js` has zero `pointerdown` listeners and the new click-only
  comment marker; `build-info.js` reports `v1.5.2`.

### Grabli / things worth remembering

- **A subagent catching my own mistake is exactly what "second opinion with clean
  context" is for.** I had already shipped and deployed TASK-015 to the real production
  site Lucky uses, confident it was correct (my own jsdom repro passed, production
  matched what I tested). The owner's insistence on an independent audit before trusting
  it, given the bug's history, caught a real gap I would not have found by re-reviewing
  my own reasoning.
- **Querying the actual telemetry backend directly** (D1 via wrangler, already
  authenticated) was decisive and cheap — it turned "the subagent's static analysis
  says X" and "my jsdom simulation says Y" into "here is Lucky's real phone, at the
  literal minute of the bug report, in a database." Worth doing this earlier next time
  a live-user bug report comes with a working telemetry pipeline already in place,
  rather than reaching for jsdom reproduction first.
