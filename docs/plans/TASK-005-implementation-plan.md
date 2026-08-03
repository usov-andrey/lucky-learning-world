# TASK-005 Implementation Plan: Multi-Lesson Spelling Library and Schwa ‹er›

Convert Spelling Realm from a single hard-coded deck (Page 22, Schwa ‹or›) into a multi-lesson library supporting Page 22 and Schwa ‹er›, complete with local audio, custom SVG illustrations, child-friendly expanded explanations ("Tell me more"), local-storage persistence, responsive touch UI, and PWA offline precaching.

## User Review Required

> [!IMPORTANT]
> **Default Lesson**: Page 22 (Schwa ‹or›) remains the default active lesson on first load. The learner can switch to Schwa ‹er› or back at any time from the Spelling landing screen.
> **No External Hotlinking**: All audio files from `lucky-spelling-skill` will be copied into `content/schwa-er/audio/` and all 18 Schwa ‹er› words will have custom repository-local SVG illustrations in `content/schwa-er/images/`.

## Open Questions

None. The task specification (`TASK-005.md`) defines all word lists, audio origins, UI requirements, touch target constraints, and fallbacks.

## Proposed Changes

---

### Catalog & Content Layer

#### [MODIFY] [content/spelling-catalog.js](file:///D:/SD/personal/projects/lucky-learning-world/content/spelling-catalog.js)
- Define `PAGE_22_LESSON` and `SCHWA_ER_LESSON` with complete 18-word data schemas (`word`, `definition`, `extendedExplanation`, `exampleSentence`, `image`, `imageAlt`, `audio`, `definitionAudio`, `hint`).
- Export `SPELLING_LESSONS`, `DEFAULT_SPELLING_LESSON_ID = "page-22"`, `getSpellingLesson(id)`, and maintain backward-compatible `PAGE_22_DECK` / `getDeckById`.
- Add local storage helper for reading/writing `lmm3s:selected_spelling_lesson`.

#### [NEW] [content/schwa-er/audio/](file:///D:/SD/personal/projects/lucky-learning-world/content/schwa-er/audio/)
- Copy 18 word audio `.mp3` files from `lucky-spelling-skill/docs/audio/` into `content/schwa-er/audio/`.
- Copy 18 definition audio `.mp3` files from `lucky-spelling-skill/docs/audio/definitions/` into `content/schwa-er/audio/definitions/`.

#### [NEW] [content/schwa-er/images/](file:///D:/SD/personal/projects/lucky-learning-world/content/schwa-er/images/)
- Create 18 high-quality, child-friendly SVG illustrations (`pattern.svg`, `referee.svg`, `opera.svg`, `cavern.svg`, `modern.svg`, `manners.svg`, `general.svg`, `interest.svg`, `average.svg`, `weather.svg`, `different.svg`, `interrupt.svg`, `exaggerate.svg`, `whether.svg`, `caterpillar.svg`, `desperate.svg`, `rhinoceros.svg`, `temperature.svg`).

---

### Engine & App Logic

#### [MODIFY] [engine/spelling-engine.js](file:///D:/SD/personal/projects/lucky-learning-world/engine/spelling-engine.js)
- Enhance `SpellingEngine` to accept a lesson object and allow setting/switching lessons via `setLesson(lesson)`.
- Ensure reset clears queue, score, stars, monster HP, history, and revealed words.
- Ensure all Learn, Test, and Game methods reference active lesson properties (`lesson.words`, `lesson.title`, `lesson.topic`).

#### [MODIFY] [app.js](file:///D:/SD/personal/projects/lucky-learning-world/app.js)
- Integrate lesson loading from `localStorage` (`lmm3s:selected_spelling_lesson`) with default fallback to `"page-22"`.
- Implement `renderSpellingLessonPicker()` to render interactive lesson cards (Page 22 & Schwa ‹er›).
- Handle lesson selection clicks: update selected lesson state, save to `localStorage`, reset `SpellingEngine`, and re-render the active mode.
- Update `renderSpellingLearn()` to display short definition and wire up the **Tell me more** button.
- Add `openTellMeMoreModal(item)` and `closeTellMeMoreModal()` to present the extended explanation and example sentence in an accessible responsive modal with audio playback controls.

---

### UI & Styling Layer

#### [MODIFY] [index.html](file:///D:/SD/personal/projects/lucky-learning-world/index.html)
- Add **Choose Lesson** card grid section to `#screen-word`.
- Add **Tell me more** button to `#spelling-learn-container`.
- Add `#modal-tell-me-more` modal dialog for expanded explanations.

#### [MODIFY] [styles.css](file:///D:/SD/personal/projects/lucky-learning-world/styles.css)
- Add styles for `.lesson-picker-grid`, `.lesson-card`, `.lesson-card.active`, `.btn-tell-me-more`, and `.tell-me-more-modal`.
- Ensure all touch targets are $\ge 64\text{px} \times 64\text{px}$ with `touch-action: manipulation` and `pointer-events: none` on child elements.
- Enforce modal height bounds (`max-height: 85vh` desktop / `92vh` mobile with `overflow-y: auto`).

#### [MODIFY] [sw.js](file:///D:/SD/personal/projects/lucky-learning-world/sw.js)
- Add Schwa ‹er› audio and image assets to PWA cache list.

---

### Test Suites

#### [NEW] [tests/spelling-lesson-catalog.test.mjs](file:///D:/SD/personal/projects/lucky-learning-world/tests/spelling-lesson-catalog.test.mjs)
- Test catalog structure, Page 22 & Schwa ‹er› records, word count (18 each), schema completeness, default fallback, and safe fallback on stale/invalid storage IDs.
- Annotate with `@task TASK-005` and `@ac AC-10`, `@ac AC-12`, `@ac AC-15`, `@ac AC-17`.

#### [MODIFY] [tests/spelling-engine.test.mjs](file:///D:/SD/personal/projects/lucky-learning-world/tests/spelling-engine.test.mjs)
- Update engine tests to cover active lesson selection, progress labels for 18-word lessons, first-item Back guard, and lesson-switching state resets.
- Annotate with `@task TASK-005` and `@ac AC-14`, `@ac AC-15`.

#### [NEW] [tests/spelling-lesson-ui.test.mjs](file:///D:/SD/personal/projects/lucky-learning-world/tests/spelling-lesson-ui.test.mjs)
- Test lesson picker rendering, active state toggling, **Tell me more** modal interaction, English labels, touch target compliance, and image/audio rendering.
- Annotate with `@task TASK-005` and `@ac AC-11`, `@ac AC-13`, `@ac AC-16`.

## Verification Plan

### Automated Tests
```bash
npm test
npm run test:coverage:gate
```

### Manual Verification
- Launch the PWA locally via HTTP server.
- Navigate to Word Realm: verify Page 22 is selected by default.
- Click **Schwa ‹er›** lesson card: verify active state highlights and engine updates.
- Test Learn Mode for Schwa ‹er›: click **Tell me more** to open extended explanation modal; verify audio play, example sentence, and closing modal.
- Test Game and Test modes: verify all 18 words are driven by Schwa ‹er›.
- Reload page: verify selected lesson choice persists from `localStorage`.
