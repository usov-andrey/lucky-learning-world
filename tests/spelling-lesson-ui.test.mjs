// @task TASK-005
// @task TASK-008
// @task TASK-014
// @ac AC-27 New lesson selection and mode reuse
// @ac AC-11 Lesson Selection Persistence
// @ac AC-13 Explanation Experience Tell Me More
// @ac AC-16 Touch and Responsive UI
// @ac AC-50 New default lesson and safe-fallback target

import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("TASK-005 AC-11, updated by TASK-014 AC-50: Lesson picker renders all four cards, defaults to 'ear' saying /er/, and persists selection in localStorage", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;

  localStorage.clear();

  const { AppController } = await import(`../app.js?update_ui1=${Date.now()}`);
  const { getSelectedSpellingLessonId } = await import(`../content/spelling-catalog.js?update_cat1=${Date.now()}`);
  const app = new AppController();

  app.startWordRealm();

  let lessonCards = app.elements.spellingLessonGrid.querySelectorAll(".lesson-card");
  assert.equal(lessonCards.length, 4, "Picker grid must render exactly 4 lesson cards");

  let page22Card = Array.from(lessonCards).find(c => c.dataset.lessonId === "page-22");
  let schwaErCard = Array.from(lessonCards).find(c => c.dataset.lessonId === "schwa-er");
  let orSayingErCard = Array.from(lessonCards).find(c => c.dataset.lessonId === "or-saying-er");
  let earSayingErCard = Array.from(lessonCards).find(c => c.dataset.lessonId === "ear-saying-er");

  assert.ok(page22Card, "Page 22 card must exist");
  assert.ok(orSayingErCard, "'or' saying /er/ card must exist");
  assert.ok(schwaErCard, "Schwa ‹er› card must exist");
  assert.ok(earSayingErCard, "'ear' saying /er/ card must exist");

  assert.ok(earSayingErCard.classList.contains("active"), "'ear' saying /er/ should be active by default");
  assert.equal(getSelectedSpellingLessonId(), "ear-saying-er");

  // Select Schwa ‹er›
  app.selectSpellingLesson("schwa-er");

  assert.equal(app.selectedLessonId, "schwa-er");
  assert.equal(localStorage.getItem("lmm3s:selected_spelling_lesson"), "schwa-er");
  assert.equal(app.spellingEngine.deck.id, "schwa-er");

  // Re-query updated DOM nodes after re-render
  const updatedActiveCard = app.elements.spellingLessonGrid.querySelector(".lesson-card.active");
  assert.ok(updatedActiveCard, "Active lesson card must exist after selection");
  assert.equal(updatedActiveCard.dataset.lessonId, "schwa-er", "Schwa ‹er› card must be active after selection");
  app.selectSpellingLesson("or-saying-er");
  assert.equal(app.selectedLessonId, "or-saying-er");
  assert.equal(localStorage.getItem("lmm3s:selected_spelling_lesson"), "or-saying-er");
  assert.equal(app.spellingEngine.deck.words[0].word, "worm");
});

test("TASK-005 AC-13 & AC-16: Tell me more button opens modal with extended explanation, example, and audio", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;

  const { AppController } = await import(`../app.js?update_ui2=${Date.now()}`);
  const app = new AppController();

  app.selectSpellingLesson("schwa-er");
  app.switchSpellingMode("learn");

  const item = app.spellingEngine.getCurrentLearnItem();
  assert.equal(item.word, "pattern");

  assert.ok(app.elements.btnTellMeMore, "Tell me more button must exist in DOM");
  assert.ok(app.elements.modalTellMeMore, "Tell me more modal must exist in DOM");

  app.openTellMeMoreModal(item);

  assert.equal(app.elements.modalTellMeMore.style.display, "flex");
  assert.ok(app.elements.modalTellMeMore.classList.contains("active"));
  assert.equal(app.elements.tellMeMoreWord.textContent, "PATTERN");
  assert.equal(app.elements.tellMeMoreShortDef.textContent, item.definition);
  assert.equal(app.elements.tellMeMoreExplanation.textContent, item.extendedExplanation);
  assert.equal(app.elements.tellMeMoreExample.textContent, `"${item.exampleSentence}"`);

  // Close modal
  app.closeModal(app.elements.modalTellMeMore);
  assert.equal(app.elements.modalTellMeMore.style.display, "none");
});
