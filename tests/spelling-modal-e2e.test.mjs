// @task TASK-005
// @ac AC-13 Tell Me More Modal E2E Verification
// @ac AC-16 Touch and Responsive UI

import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("TASK-005 E2E: Clicking Tell Me More opens modal with pattern extended explanation & example, then closes on Got It", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;

  localStorage.clear();

  const { AppController } = await import(`../app.js?update_modal_e2e=${Date.now()}`);
  const app = new AppController();

  app.selectSpellingLesson("schwa-er");
  app.switchSpellingMode("learn");

  const currentItem = app.spellingEngine.getCurrentLearnItem();
  assert.equal(currentItem.word, "pattern");

  const btnTellMeMore = document.getElementById("btn-tell-me-more");
  const modalTellMeMore = document.getElementById("modal-tell-me-more");
  const wordElem = document.getElementById("tell-me-more-word");
  const expElem = document.getElementById("tell-me-more-explanation");
  const exElem = document.getElementById("tell-me-more-example");
  const btnClose = document.getElementById("btn-close-tell-me-more");

  assert.ok(btnTellMeMore, "btn-tell-me-more element must exist in DOM");
  assert.ok(modalTellMeMore, "modal-tell-me-more element must exist in DOM");

  // Initial state: modal not flex
  assert.notEqual(modalTellMeMore.style.display, "flex", "Modal must not be flex by default");

  // Simulate user click on Tell Me More button
  btnTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));

  // Assert modal is open and active
  assert.equal(modalTellMeMore.style.display, "flex", "Modal must display as flex on click");
  assert.ok(modalTellMeMore.classList.contains("active"), "Modal must have active class");
  assert.equal(wordElem.textContent, "PATTERN");
  assert.ok(expElem.textContent.length > 10, "Extended explanation must be populated");
  assert.ok(exElem.textContent.length > 5, "Example sentence must be populated");

  // Simulate user click on Got It button
  btnClose.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));

  // Assert modal is closed
  assert.equal(modalTellMeMore.style.display, "none", "Modal must be hidden after clicking close");
});

test("TASK-005 Diagnostic E2E: Build version and timestamp badge element exists in DOM", () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  const badgeElem = window.document.getElementById("diag-build-version");
  assert.ok(badgeElem, "#diag-build-version element must exist in index.html");
  assert.ok(badgeElem.textContent.startsWith("v1."), "Badge text must start with version string v1.");
});

// @task TASK-009
// @ac AC-32 Single Execution Touch & Click
// @ac AC-33 Touch Target & Instant Response
// @ac AC-34 Tell Me More Modal Content & Backdrop Closing
// @ac AC-35 100% Verified Tests
test("TASK-009 E2E: Tell me more button handles single execution on touch/click, supports backdrop click, and enforces touch-action", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.clear();

  const { AppController } = await import(`../app.js?task009_modal_e2e=${Date.now()}`);
  const app = new AppController();

  app.selectSpellingLesson("or-saying-er");
  app.switchSpellingMode("learn");

  const btnTellMeMore = document.getElementById("btn-tell-me-more");
  const modalTellMeMore = document.getElementById("modal-tell-me-more");
  const wordElem = document.getElementById("tell-me-more-word");

  assert.ok(btnTellMeMore, "btn-tell-me-more must exist");
  assert.equal(btnTellMeMore.style.touchAction, "manipulation", "btn-tell-me-more must have touch-action: manipulation inline or in CSS");

  // Track number of times openTellMeMoreModal is called
  let callCount = 0;
  const originalOpen = app.openTellMeMoreModal.bind(app);
  app.openTellMeMoreModal = (item) => {
    callCount++;
    originalOpen(item);
  };

  // Simulate touch pointerdown followed by click event
  const pointerEvent = new window.PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "touch" });
  const clickEvent = new window.MouseEvent("click", { bubbles: true, cancelable: true });

  btnTellMeMore.dispatchEvent(pointerEvent);
  btnTellMeMore.dispatchEvent(clickEvent);

  assert.equal(callCount, 1, "openTellMeMoreModal must be called exactly ONCE despite touch pointerdown + click sequence");
  assert.equal(modalTellMeMore.style.display, "flex", "Modal must display as flex");
  assert.equal(wordElem.textContent, "WORM");

  // Test closing via backdrop click on .modal-overlay
  modalTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(modalTellMeMore.style.display, "none", "Modal must close on backdrop overlay click");
});

