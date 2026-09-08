// @task TASK-005
// @task TASK-008
// @task TASK-014
// @task TASK-025
// @task TASK-028
// @task TASK-030
// @task TASK-031
// @task TASK-032
// @ac AC-27 New lesson selection and mode reuse
// @ac AC-11 Lesson Selection Persistence
// @ac AC-13 Explanation Experience Tell Me More
// @ac AC-16 Touch and Responsive UI
// @ac AC-50 New default lesson and safe-fallback target
// @ac AC-86 Fifth lesson card renders, selects, and drives the shared engine
// @ac AC-98 Sixth lesson card renders, selects, and drives the shared engine
// @ac AC-105 Seventh lesson card renders, selects, and drives the shared engine
// @ac AC-109 Eighth lesson card renders, selects, and drives the shared engine
// @ac AC-111 One compact lesson control
// @ac AC-112 Newest default and persistent choice
// @ac AC-113 Immediate touch-friendly integration

import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("TASK-032 AC-111 through AC-113: compact picker defaults to newest lesson and persists dropdown changes", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const cssContent = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;

  localStorage.clear();

  const { AppController } = await import(`../app.js?update_ui1=${Date.now()}`);
  const app = new AppController();

  app.startWordRealm();

  const picker = app.elements.spellingLessonSelect;
  assert.equal(picker.tagName, "SELECT");
  assert.equal(picker.options.length, 8, "Dropdown must contain every catalog lesson exactly once");
  assert.equal(new Set(Array.from(picker.options, option => option.value)).size, 8);
  assert.equal(document.querySelectorAll(".lesson-card").length, 0, "The expanding card grid must be removed");
  assert.equal(picker.value, "ic-ending", "The newest catalog lesson must be selected without saved state");
  assert.equal(app.selectedLessonId, "ic-ending");
  assert.equal(app.spellingEngine.deck.id, "ic-ending");
  assert.equal(app.elements.learnWordDisplay.textContent, "EPIC");
  assert.equal(picker.getAttribute("aria-label"), "Choose spelling lesson");
  assert.match(cssContent, /\.lesson-select\s*\{[\s\S]*?min-height:\s*var\(--min-touch-target\)/);
  assert.match(cssContent, /\.lesson-select\s*\{[\s\S]*?touch-action:\s*manipulation/);

  picker.value = "schwa-er";
  picker.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert.equal(app.selectedLessonId, "schwa-er");
  assert.equal(localStorage.getItem("lmm3s:selected_spelling_lesson"), "schwa-er");
  assert.equal(app.spellingEngine.deck.id, "schwa-er");
  assert.equal(app.elements.learnWordDisplay.textContent, "PATTERN", "Current mode content must refresh immediately");
  assert.match(app.elements.wordRealmTitle.textContent, /Schwa ‹er›/);
  assert.equal(picker.value, "schwa-er");

  const restoredApp = new AppController();
  assert.equal(restoredApp.selectedLessonId, "schwa-er", "A new app instance must restore the saved choice");
  assert.equal(restoredApp.spellingEngine.deck.id, "schwa-er");
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
