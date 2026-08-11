// @task TASK-024
// @ac AC-81 AC-82 AC-83
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMixSessionPlan, currentQuestion, computeAnswer } from "../engine/math-engine.js";
import { LEVELS } from "../content/levels.js";
import { DEFAULT_GAME_SETTINGS } from "../content/settings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function setupApp() {
  const html = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const dom = new JSDOM(html, { url: "http://localhost/" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.alert = () => {};
  localStorage.clear();
  const { AppController } = await import(`../app.js?mix_regression=${Date.now()}_${Math.random()}`);
  const app = new AppController();
  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();
  return { app, dom };
}

test("TASK-024 AC-82: Mix planner rejects level objects instead of producing NaNxNaN", () => {
  assert.throws(
    () => buildMixSessionPlan(LEVELS, {}, DEFAULT_GAME_SETTINGS, () => 0.25),
    /numeric multiplication tables/i,
  );
});

test("TASK-024 AC-81: AppController Math Mix builds and renders finite operands", async () => {
  const { app, dom } = await setupApp();
  app.startMathMixSession();
  assert.ok(app.mathSession.queue.length > 0);
  app.mathSession.queue.forEach((question) => {
    assert.equal(Number.isFinite(question.a), true, `invalid a for ${question.key}`);
    assert.equal(Number.isFinite(question.b), true, `invalid b for ${question.key}`);
  });
  assert.doesNotMatch(app.elements.mathQuestionText.textContent, /NaN|undefined|null/);
  dom.window.close();
});

test("TASK-024 AC-83: a complete correct-answer Mix session reaches its reward path", async () => {
  const { app, dom } = await setupApp();
  let rewardOpened = null;
  app.openVictoryModal = (reward) => { rewardOpened = reward; };
  app.startMathMixSession();

  const originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (callback) => {
    callback();
    return 0;
  };
  try {
    let guard = 0;
    while (!rewardOpened && currentQuestion(app.mathSession) && guard < 40) {
      guard += 1;
      const question = currentQuestion(app.mathSession);
      app.handleMathAnswer(computeAnswer(question));
    }
    assert.ok(guard > 0 && guard < 40, `Mix did not finish; guard=${guard}`);
    assert.ok(rewardOpened?.character, "Mix completion must reach the existing reward modal path");
    assert.doesNotMatch(document.body.textContent, /(?:^|\s)(?:NaN|undefined|null)(?:$|\s)/);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    dom.window.close();
  }
});
