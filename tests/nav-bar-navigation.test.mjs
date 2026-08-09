// @task TASK-023
// @ac AC-1 Every bottom-nav button (Hub/Math/Word/Pokédex) navigates to a real,
// correctly-initialized screen — none of them leaves the app with no `.view-screen`
// marked active.
//
// Regression guard for a real production incident: tapping the bottom nav's "Hub"
// button produced a completely blank page (header and bottom nav visible, the entire
// content area empty). Root cause: two competing click handlers existed for these
// buttons — a correct `document`-level delegate (app.js's bindEvents "Global Event
// Delegate", handling id === "nav-btn-hub" etc.) and a second, direct bindTouchClick
// binding that called `this.showScreen(screenKey)` with `screenKey` taken straight
// from `navBtns`'s own object keys ("hub"/"math"/"word"/"pokedex") instead of a real
// screen id ("dashboard"/"math"/"word"/"pokedex" — note "hub" vs "dashboard"). Because
// bindTouchClick's handler calls stopPropagation(), it always won over the delegate,
// so `showScreen("hub")` ran every time Hub was tapped: it matches no key in
// `this.elements.screens`, so the screen-toggle loop removes `.active` from every
// screen and adds it to none. Math/Word had the same double-binding but didn't blank
// the page, since "math"/"word" happen to be valid screen ids — they instead skipped
// `startMathRealm()`/`startWordRealm()` entirely, leaving `mathSession`/the lesson
// picker uninitialized and the screen showing `index.html`'s raw static placeholder
// markup (dead buttons with `data-answer-val`, not the real `data-math-choice`
// buttons `renderMathQuestion()` would have produced).
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function setupApp() {
  const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.clear();

  const { AppController } = await import(`../app.js?nav_test=${Date.now()}`);
  const app = new AppController();
  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();
  return { app, window };
}

function click(window, id) {
  document.getElementById(id).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
}

test("TASK-023 AC-1: bottom-nav Hub returns to a fully rendered dashboard, not a blank page", async () => {
  const { app, window } = await setupApp();

  click(window, "nav-btn-math");
  assert.equal(document.querySelector(".view-screen.active")?.id, "math-view");

  click(window, "nav-btn-hub");
  assert.equal(
    document.querySelector(".view-screen.active")?.id,
    "dashboard-view",
    "Hub must activate the dashboard screen, not leave every screen inactive",
  );
  assert.ok(
    document.querySelector(".realms-grid")?.children.length > 0,
    "the dashboard's realm cards must still be present after navigating back to it",
  );
});

test("TASK-023 AC-1: bottom-nav Math actually starts a session, not just switches screens", async () => {
  const { app, window } = await setupApp();

  assert.equal(app.mathSession, null, "no math session should exist before entering Math Realm");
  click(window, "nav-btn-math");

  assert.equal(document.querySelector(".view-screen.active")?.id, "math-view");
  assert.ok(app.mathSession, "nav-btn-math must call startMathRealm(), not a bare showScreen()");
  const answerBtn = document.querySelector("#math-answers-grid .answer-btn");
  assert.ok(answerBtn, "a real, JS-rendered answer button must exist");
  assert.ok(
    answerBtn.hasAttribute("data-math-choice"),
    "the answer button must be renderMathQuestion()'s real markup, not index.html's static placeholder (which uses data-answer-val)",
  );
});

test("TASK-023 AC-1: bottom-nav Word actually starts the lesson, not just switches screens", async () => {
  const { app, window } = await setupApp();

  click(window, "nav-btn-word");

  assert.equal(document.querySelector(".view-screen.active")?.id, "word-view");
  assert.ok(
    document.getElementById("spelling-lesson-grid").children.length > 0,
    "nav-btn-word must call startWordRealm(), which renders the lesson picker",
  );
});

test("TASK-023 AC-1: bottom-nav Pokédex activates the Pokédex screen", async () => {
  const { app, window } = await setupApp();

  click(window, "nav-btn-pokedex");

  assert.equal(document.querySelector(".view-screen.active")?.id, "pokedex-view");
});
