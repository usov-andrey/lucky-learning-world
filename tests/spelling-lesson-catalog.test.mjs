// @task TASK-005
// @ac AC-10 Lesson Catalog Default and Integrity
// @ac AC-12 Complete Schwa ‹er› Learning Content
// @ac AC-15 Safe Selection Fallback
// @ac AC-17 Local Offline Assets

import test from "node:test";
import assert from "node:assert/strict";

import {
  PAGE_22_LESSON,
  SCHWA_ER_LESSON,
  SPELLING_LESSONS,
  DEFAULT_SPELLING_LESSON_ID,
  getSpellingLesson,
  getSelectedSpellingLessonId,
  setSelectedSpellingLessonId
} from "../content/spelling-catalog.js";

test("TASK-005 AC-10: catalog exposes Page 22 and Schwa ‹er› as distinct stable lesson records", () => {
  assert.equal(SPELLING_LESSONS.length, 2);
  assert.equal(PAGE_22_LESSON.id, "page-22");
  assert.equal(PAGE_22_LESSON.words.length, 18);
  assert.equal(SCHWA_ER_LESSON.id, "schwa-er");
  assert.equal(SCHWA_ER_LESSON.words.length, 18);
  assert.equal(DEFAULT_SPELLING_LESSON_ID, "page-22");
});

test("TASK-005 AC-10 & AC-15: getSpellingLesson returns requested lesson or safely falls back to default", () => {
  assert.equal(getSpellingLesson("schwa-er").id, "schwa-er");
  assert.equal(getSpellingLesson("page-22").id, "page-22");
  assert.equal(getSpellingLesson("unknown-lesson-id").id, "page-22");
  assert.equal(getSpellingLesson(null).id, "page-22");
});

test("TASK-005 AC-12: Schwa ‹er› words match canonical order and contain all mandatory content fields", () => {
  const expectedWords = [
    "pattern", "referee", "opera", "cavern", "modern", "manners",
    "general", "interest", "average", "weather", "different", "interrupt",
    "exaggerate", "whether", "caterpillar", "desperate", "rhinoceros", "temperature"
  ];

  assert.equal(SCHWA_ER_LESSON.words.length, 18);

  SCHWA_ER_LESSON.words.forEach((w, idx) => {
    assert.equal(w.word, expectedWords[idx]);
    assert.ok(w.definition && w.definition.length > 0, `Missing definition for ${w.word}`);
    assert.ok(w.extendedExplanation && w.extendedExplanation.length > 0, `Missing extendedExplanation for ${w.word}`);
    assert.ok(w.exampleSentence && w.exampleSentence.length > 0, `Missing exampleSentence for ${w.word}`);
    assert.ok(w.image && w.image.startsWith("content/schwa-er/images/"), `Invalid image path for ${w.word}`);
    assert.ok(w.imageAlt && w.imageAlt.length > 0, `Missing imageAlt for ${w.word}`);
    assert.ok(w.audio && w.audio.startsWith("content/schwa-er/audio/"), `Invalid audio path for ${w.word}`);
    assert.ok(w.definitionAudio && w.definitionAudio.startsWith("content/schwa-er/audio/definitions/"), `Invalid definitionAudio path for ${w.word}`);
    assert.ok(w.hint && w.hint.length > 0, `Missing hint for ${w.word}`);
  });
});

test("TASK-005 AC-17: Page 22 words maintain complete fields and local audio/image paths", () => {
  PAGE_22_LESSON.words.forEach((w) => {
    assert.ok(w.word);
    assert.ok(w.definition);
    assert.ok(w.image && w.image.startsWith("content/page-22/images/"));
    assert.ok(w.audio && w.audio.startsWith("content/page-22/audio/"));
    assert.ok(w.definitionAudio && w.definitionAudio.startsWith("content/page-22/audio/definitions/"));
  });
});
