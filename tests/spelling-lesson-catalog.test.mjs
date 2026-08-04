// @task TASK-005
// @task TASK-008
// @ac AC-25 New lesson catalog integrity
// @ac AC-26 Complete local learning content
// @ac AC-10 Lesson Catalog Default and Integrity
// @ac AC-12 Complete Schwa ‹er› Learning Content
// @ac AC-15 Safe Selection Fallback
// @ac AC-17 Local Offline Assets

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  PAGE_22_LESSON,
  SCHWA_ER_LESSON,
  OR_SAYING_ER_LESSON,
  SPELLING_LESSONS,
  DEFAULT_SPELLING_LESSON_ID,
  getSpellingLesson,
  getSelectedSpellingLessonId,
  setSelectedSpellingLessonId
} from "../content/spelling-catalog.js";

test("TASK-005 AC-10: catalog exposes Page 22 and Schwa ‹er› as distinct stable lesson records", () => {
  assert.equal(SPELLING_LESSONS.length, 3);
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

test("TASK-008 AC-25 & AC-26: catalog exposes the complete 'or' saying /er/ lesson in photo order", () => {
  const expectedWords = [
    "worm", "word", "world", "worst", "worker", "worse", "workable", "worthy", "worship",
    "fireworks", "worksheet", "worthless", "workmanship", "worldliness", "workforce",
    "worldwide", "worthwhile", "worthlessness"
  ];

  assert.equal(OR_SAYING_ER_LESSON.id, "or-saying-er");
  assert.equal(OR_SAYING_ER_LESSON.topic, "'or' saying /er/");
  assert.deepEqual(OR_SAYING_ER_LESSON.words.map(item => item.word), expectedWords);
  assert.equal(OR_SAYING_ER_LESSON.wordCount, expectedWords.length);

  OR_SAYING_ER_LESSON.words.forEach((item) => {
    assert.ok(item.definition, `Missing definition for ${item.word}`);
    assert.ok(item.extendedExplanation, `Missing extended explanation for ${item.word}`);
    assert.ok(item.exampleSentence, `Missing example sentence for ${item.word}`);
    assert.ok(item.hint, `Missing hint for ${item.word}`);
    assert.ok(item.imageAlt, `Missing image alt text for ${item.word}`);
    assert.match(item.image, /^content\/or-saying-er\/images\/.+\.svg$/);
    assert.match(item.audio, /^content\/or-saying-er\/audio\/.+\.wav$/);
    assert.match(item.definitionAudio, /^content\/or-saying-er\/audio\/definitions\/.+\.wav$/);
    for (const assetPath of [item.image, item.audio, item.definitionAudio]) {
      const absoluteAssetPath = fileURLToPath(new URL(`../${assetPath}`, import.meta.url));
      assert.ok(fs.existsSync(absoluteAssetPath), `Missing local asset ${assetPath}`);
      assert.ok(fs.statSync(absoluteAssetPath).size > 0, `Empty local asset ${assetPath}`);
    }
  });
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
