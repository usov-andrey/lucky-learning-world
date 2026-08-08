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
