---
id: TASK-005
title: "Multi-Lesson Spelling Library and Schwa er"
status: COMPLETED
version: v1.1.0
created: 2026-07-29
completed: 2026-08-03
github_issue: null
---

# TASK-005: Multi-Lesson Spelling Library and Schwa er

## 1. Goal and context

Lucky's Learning World currently hard-codes one spelling deck: Page 22, **Schwa ‹or›**.
It has a complete learning experience: word audio, a picture, a concise definition,
definition audio, and a hint. The separate `lucky-spelling-skill` project now has the
next 18-word lesson, **Schwa ‹er›**, with word and definition audio, but it has not
been imported into Lucky's Learning World and has no illustrations there.

The next implementation must turn spelling content into a small, extensible lesson
library, not another hard-coded replacement of `PAGE_22_DECK`. It must preserve Page 22,
add Schwa ‹er› with a complete child-friendly learning experience, and let the learner
choose a lesson without an upload/admin workflow or date-based automatic switching.

## 2. Scope and decisions

### In scope

1. Preserve Page 22, **Schwa ‹or›**, including its 18 words, illustrations, audio, and
   definition audio.
2. Add Schwa ‹er› with these 18 words, in this order:
   `pattern`, `referee`, `opera`, `cavern`, `modern`, `manners`, `general`, `interest`,
   `average`, `weather`, `different`, `interrupt`, `exaggerate`, `whether`,
   `caterpillar`, `desperate`, `rhinoceros`, `temperature`.
3. Add a lesson-library data model and a learner-facing lesson picker in Spelling Realm.
4. Deliver a full Learn experience for every Schwa ‹er› word: illustration, short
   definition, word audio, definition audio, and a child-friendly expanded explanation
   with an example sentence.
5. Make the selected lesson drive **Game**, **Learn**, and **Test**; no mode may fall
   back to a hard-coded Page 22 word list.

### Product decisions

- Page 22 remains the default/current lesson after first install, so the change does not
  silently replace an active school assignment.
- The lesson picker exposes both Page 22 and Schwa ‹er›. A chosen lesson is retained in
  local storage and applies to all three Spelling modes until the learner changes it.
- Changing lessons is allowed only from the Spelling landing/lesson-picker screen; it
  resets any unfinished spelling-mode state for the newly selected lesson.
- Do **not** add word upload, teacher/admin content management, scheduled switching, or
  automatic calendar-based lesson changes.

## 3. Architecture proposal

### 3.1 Lesson library

Replace the single-deck assumption with a catalog module (for example
`content/spelling-catalog.js`) that exports:

- a stable lesson record for Page 22;
- a stable lesson record for Schwa ‹er›;
- `SPELLING_LESSONS`, an ordered array of lessons;
- `DEFAULT_SPELLING_LESSON_ID = "page-22"`;
- `getSpellingLesson(id)` with safe fallback to the default;
- one versioned local-storage key for the selected lesson (under the existing `lmm3s:`
  namespace).

Each word record must include `word`, `definition`, `extendedExplanation`,
`exampleSentence`, `image`, `imageAlt`, `audio`, `definitionAudio`, and a concise
`hint`. Data must be local, static, and safe to serve from GitHub Pages; do not hotlink
media from third-party websites.

### 3.2 Content import

- Treat `D:\SD\personal\projects\lucky-spelling-skill\content\schwa-er\words.txt`
  and `lesson.json` as the canonical source for word order and concise definitions.
- Reuse the generated Schwa ‹er› word and definition audio from
  `lucky-spelling-skill/docs/audio/`; copy the required files into this project's
  spelling-content asset tree, with repository-relative paths.
- Create or source one suitable illustration per Schwa ‹er› word. Store it locally,
  include accurate English `imageAlt`, and record a credit/license when an external
  asset is used. AI-generated assets must have a local provenance note; never claim an
  external attribution for them.
- Add the longer explanation and example sentence deliberately for a 10-year-old
  international-school learner. It must clarify the word rather than merely repeat the
  short definition.

### 3.3 UI behaviour

- The Spelling landing screen has an obvious **Choose lesson** control before mode
  selection. Each lesson card shows its title/topic, word count, and selected state.
- Learn mode shows a picture and the short explanation by default. The existing
  definition-audio control remains available.
- A visible **Tell me more** control reveals the longer explanation and example sentence
  in the same responsive learning panel/modal. It must be keyboard accessible and work
  on desktop, tablet, and phone.
- All controls meet the project's 64px minimum touch target rule; cards/buttons use
  `touch-action: manipulation`, and child elements do not consume the pointer event.
- The explanatory view remains within the project's modal height and scrolling limits.

### 3.4 Engine and state

- Refactor `SpellingEngine` and `app.js` so counts, progress labels, hints, audio,
  Learn navigation, Test questions, and letter-tile Game questions come from the active
  lesson's word array.
- Keep the first-item Back-button disabled guard for every lesson.
- An unknown or obsolete stored lesson id must load the Page 22 default safely.
- Service-worker precaching/versioning must include all new local media so an already
  visited lesson continues to work offline.

## 4. Acceptance criteria

- [x] **AC-10**: The catalog exposes Page 22 and Schwa ‹er› as distinct stable lesson
  records, preserves Page 22's 18-word content, and defaults to Page 22 when no valid
  stored lesson selection exists.
- [x] **AC-11**: The learner can select either lesson from the Spelling landing screen;
  the chosen lesson persists locally and is used consistently by Game, Learn, and Test.
- [x] **AC-12**: All 18 Schwa ‹er› records have a local illustration, meaningful English
  alt text, a concise definition, definition audio, an extended explanation, an example
  sentence, and a hint. Their word and definition audio play without a network request
  after the lesson has been cached.
- [x] **AC-13**: In Learn mode, the illustration and short definition are immediately
  available; **Tell me more** reliably reveals the longer explanation and example on
  desktop, tablet, and phone, with no disabled or no-op control.
- [x] **AC-14**: Navigation, progress, question counts, hints, word audio, definition
  audio, and Game letter tiles all use the active lesson. The Back button is disabled on
  word 1 for both lessons.
- [x] **AC-15**: A stale/unknown saved lesson id safely uses Page 22; switching lessons
  resets incomplete spelling state and never causes mixed words from two lessons.
- [x] **AC-16**: The lesson picker and expanded-explanation UI satisfy the project's
  touch-target, touch-event, modal-height, and English-only UI requirements.
- [x] **AC-17**: All new lesson assets are repository-local, are included in the PWA
  cache strategy, and retain valid provenance/credit information.

## 5. Required test coverage

Create and tag tests with `// @task TASK-005` and the matching `// @ac AC-XX` comment.

- `tests/spelling-lesson-catalog.test.mjs`
  - catalog records, default fallback, word order/count, asset fields, and stale storage
    fallback;
- `tests/spelling-engine.test.mjs`
  - active-lesson Game/Learn/Test state, progress counts, first-item Back guard, and
    lesson-switch reset;
- `tests/spelling-lesson-ui.test.mjs`
  - lesson picker, selected state, **Tell me more** interaction, image/definition
    rendering, and English UI labels;
- an HTTP/PWA smoke check covering both lessons, at least one word audio and definition
  audio per lesson, images, offline cache manifest/service worker, and desktop/mobile
  modal constraints.

Run before commit:

```bash
npm test
npm run test:coverage:gate
```

## 6. Expected impacted files

- `content/spelling-catalog.js`
- `engine/spelling-engine.js`
- `app.js`, `index.html`, `styles.css`, `sw.js`
- new local spelling content/media under `content/`
- `tests/spelling-lesson-catalog.test.mjs`
- `tests/spelling-engine.test.mjs`
- `tests/spelling-lesson-ui.test.mjs`
- `ACCEPTANCE_CRITERIA.md`, `tasks/INDEX.md`

## 7. Non-goals

- teacher upload screens, an admin content-management system, or changing words inside
  the PWA;
- scheduled lesson changes or a test-date calendar;
- changing Math Realm, Pokédex rules, rewards, or parent-PIN behaviour;
- removing Page 22 or its existing lesson assets.

## 8. Release and handoff

- **Target version**: `v1.1.0` (minor feature release).
- **Implementation plan**: `docs/plans/TASK-005-implementation-plan.md` and active
  reference `implementation_plan.md`.
- **Walkthrough**: `docs/walkthroughs/TASK-005-walkthrough.md` and active reference
  `walkthrough.md`.
- **Release notes**: `docs/releases/v1.1.0.md`.
- **Commit convention**: `feat(TASK-005): add multi-lesson spelling library`.
