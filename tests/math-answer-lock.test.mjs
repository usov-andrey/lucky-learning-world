// @task TASK-019
// @ac AC-65/AC-66 regression guard: a second tap on a Math Realm answer button
// within the 800ms/1400ms feedback window (a real double-tap on a child's tablet)
// must be ignored, not double-processed. Before this fix, a second correct tap in
// that window threw an uncaught exception (answerFirstTry() rejects a second call
// while a correction is pending); the fix locks handleMathAnswer() between a tap
// and the next question actually rendering.
//
// EventTarget.dispatchEvent() does not rethrow listener exceptions to the caller
// (matches real browser behavior) — it reports them via window.onerror instead, so
// that's what these tests listen on rather than assert.doesNotThrow(), which would
// pass vacuously regardless of what the listener does internally.
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

  const uncaughtErrors = [];
  window.addEventListener("error", (e) => uncaughtErrors.push(e.error || e.message));

  const { AppController } = await import(`../app.js?lock_test=${Date.now()}`);
  const app = new AppController();
  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();
  app.startMathRealm();
  return { app, window, uncaughtErrors };
}

function findAnswerButton(app, predicate) {
  return [...app.elements.mathAnswersGrid.querySelectorAll(".answer-btn")].find((b) =>
    predicate(Number(b.dataset.mathChoice)),
  );
}

test("TASK-019 AC-65: a rapid second correct tap is ignored, not double-processed", async () => {
  const { app, window, uncaughtErrors } = await setupApp();
  const q = app.mathSession.queue[0];
  const correct = q.type === "missing" ? q.b : q.a * q.b;
  const btn = findAnswerButton(app, (v) => v === correct);

  btn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(app.mathAnswerLocked, true, "handleMathAnswer must lock immediately after a tap");
  const historyLenAfterFirst = app.mathSession.history.length;
  assert.equal(historyLenAfterFirst, 1, "the first tap must record exactly one history entry");
  assert.equal(app.mathSession.pendingCorrection, null, "a correct answer must not set pendingCorrection");

  // Same rendered button — the grid hasn't re-rendered yet (the 800ms timer hasn't fired).
  btn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

  assert.deepEqual(uncaughtErrors, [], "a rapid second tap must not throw uncaught");
  assert.equal(
    app.mathSession.history.length,
    historyLenAfterFirst,
    "a second rapid tap must be ignored, not recorded as a second answer",
  );
  assert.equal(
    app.mathSession.pendingCorrection,
    null,
    "a second rapid tap must not silently mark the next, not-yet-shown question wrong",
  );
});

test("TASK-019 AC-66: a rapid second wrong tap is ignored, not double-processed", async () => {
  const { app, window, uncaughtErrors } = await setupApp();
  const q = app.mathSession.queue[0];
  const correct = q.type === "missing" ? q.b : q.a * q.b;
  const wrongBtn = findAnswerButton(app, (v) => v !== correct);

  wrongBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(app.mathAnswerLocked, true, "handleMathAnswer must lock immediately after a wrong tap");
  assert.ok(app.mathSession.pendingCorrection, "a wrong tap must set pendingCorrection");
  const pendingKeyAfterFirst = app.mathSession.pendingCorrection.key;

  wrongBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

  assert.deepEqual(uncaughtErrors, [], "a rapid second wrong tap must not throw uncaught");
  assert.equal(
    app.mathSession.pendingCorrection.key,
    pendingKeyAfterFirst,
    "a second rapid tap must not re-process the pending correction",
  );
});
