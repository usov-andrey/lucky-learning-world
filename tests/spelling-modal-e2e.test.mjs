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
  assert.equal(badgeElem.textContent.trim(), "Loading current build…", "Static HTML must use the non-authoritative build placeholder");
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

  // Test closing via backdrop click on .modal-overlay. Backdrop clicks within the open
  // gesture's own guard window are ignored (TASK-015 AC-52), so simulate a later, genuine
  // tap by backdating openedAt rather than clicking immediately after opening.
  modalTellMeMore.dataset.openedAt = String(Date.now() - 1000);
  modalTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(modalTellMeMore.style.display, "none", "Modal must close on backdrop overlay click");
});

// @task TASK-015
// @ac AC-52 Backdrop-close guard still works as defense-in-depth
test("TASK-015 AC-52: an artificially-immediate backdrop click is still ignored by the openedAt guard", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.clear();

  const { AppController } = await import(`../app.js?task015_modal_race=${Date.now()}`);
  const app = new AppController();

  app.selectSpellingLesson("ear-saying-er");
  app.switchSpellingMode("learn");

  const btnTellMeMore = document.getElementById("btn-tell-me-more");
  const modalTellMeMore = document.getElementById("modal-tell-me-more");

  // TASK-016 removed the actual cause of the race (opening on pointerdown), so this guard
  // is no longer load-bearing in practice -- but it is cheap defense-in-depth, so keep a
  // direct test of the guard itself: a click targeting the overlay right after open must
  // still be ignored, and a later one must still close it.
  btnTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(modalTellMeMore.style.display, "flex", "Modal must open on click");

  modalTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(modalTellMeMore.style.display, "flex", "An immediate backdrop click within the guard window must not close the modal");

  modalTellMeMore.dataset.openedAt = String(Date.now() - 1000);
  modalTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(modalTellMeMore.style.display, "none", "A genuine later backdrop tap must still close the modal");
});

// @task TASK-016
// @ac AC-53 Modals open only on click; pointerdown is inert
// @ac AC-54 A click on a button behind a modal card never leaks through
test("TASK-016 AC-53: pointerdown alone does not open the modal; a real click does, exactly once", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.clear();

  const { AppController } = await import(`../app.js?task016_no_pointerdown=${Date.now()}`);
  const app = new AppController();

  app.selectSpellingLesson("ear-saying-er");
  app.switchSpellingMode("learn");

  const btnTellMeMore = document.getElementById("btn-tell-me-more");
  const modalTellMeMore = document.getElementById("modal-tell-me-more");

  let callCount = 0;
  const originalOpen = app.openTellMeMoreModal.bind(app);
  app.openTellMeMoreModal = (item) => {
    callCount++;
    originalOpen(item);
  };

  // A touch gesture that never completes as a click (e.g. the finger drags off the
  // element and cancels) must not open anything -- proving the handler no longer reacts
  // to pointerdown at all.
  btnTellMeMore.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "touch" }));
  assert.equal(callCount, 0, "pointerdown alone must not open the modal");
  assert.notEqual(modalTellMeMore.style.display, "flex", "Modal must stay closed on pointerdown alone");

  // The actual click (which is what a completed tap/click always produces, and whose
  // target the browser resolves *before* any handler runs) opens it, exactly once.
  btnTellMeMore.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(callCount, 1, "a real click must open the modal exactly once");
  assert.equal(modalTellMeMore.style.display, "flex", "Modal must be open after the click");
});

test("TASK-016 AC-54: opening a second modal (parent gate) from a button positioned where a modal card would center is unaffected", async () => {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.clear();

  const { AppController } = await import(`../app.js?task016_parent_gate=${Date.now()}`);
  const app = new AppController();

  const btnParentMode = document.getElementById("btn-parent-mode-header");
  const parentGateModal = document.getElementById("parent-gate-modal");
  assert.ok(btnParentMode, "btn-parent-mode-header must exist");
  assert.ok(parentGateModal, "parent-gate-modal must exist");

  btnParentMode.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  assert.equal(parentGateModal.style.display, "flex", "Parent gate modal must open on a single click, with no separate opening event to race against");
});
