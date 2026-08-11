// @task TASK-020
// @ac AC-75 AC-76 AC-77
import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeStoredState } from "../engine/progression.js";
import { buildLevelSessionPlan, createFactRecord } from "../engine/math-engine.js";
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
  localStorage.clear();
  const { AppController } = await import(`../app.js?fact_progress=${Date.now()}_${Math.random()}`);
  const app = new AppController();
  app.elements.onboardingNameInput.value = "Lucky";
  app.completeOnboarding();
  app.startMathRealm();
  return { app, dom };
}

function withoutScheduledRender(callback) {
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = () => 0;
  try {
    callback();
  } finally {
    globalThis.setTimeout = originalSetTimeout;
  }
}

test("TASK-020 AC-75: correct and wrong answers persist factStats immediately", async () => {
  const correctSetup = await setupApp();
  const correctQuestion = correctSetup.app.mathSession.queue[0];
  const correctAnswer = correctQuestion.type === "missing"
    ? correctQuestion.b
    : correctQuestion.a * correctQuestion.b;

  withoutScheduledRender(() => correctSetup.app.handleMathAnswer(correctAnswer));
  const correctSave = JSON.parse(localStorage.getItem("lmm3s:progression"));
  assert.equal(correctSave.factStats[correctQuestion.key].attempts, 1);
  assert.equal(correctSave.factStats[correctQuestion.key].correct, 1);
  correctSetup.dom.window.close();

  const wrongSetup = await setupApp();
  const wrongQuestion = wrongSetup.app.mathSession.queue[0];
  const answer = wrongQuestion.type === "missing" ? wrongQuestion.b : wrongQuestion.a * wrongQuestion.b;
  withoutScheduledRender(() => wrongSetup.app.handleMathAnswer(answer + 1));
  const wrongSave = JSON.parse(localStorage.getItem("lmm3s:progression"));
  assert.equal(wrongSave.factStats[wrongQuestion.key].attempts, 1);
  assert.equal(wrongSave.factStats[wrongQuestion.key].correct, 0);
  assert.equal(wrongSave.factStats[wrongQuestion.key].wrongStreak, 1);
  wrongSetup.dom.window.close();
});

test("TASK-020 AC-76: normalization preserves valid factStats and rejects corrupt shapes", () => {
  const factStats = {
    "6x7": { ...createFactRecord(), attempts: 4, correct: 2, wrongStreak: 1, mastery: 1 },
  };
  const normalized = normalizeStoredState({ factStats }, LEVELS);
  assert.deepEqual(normalized.factStats, factStats);
  assert.deepEqual(normalizeStoredState({ factStats: [] }, LEVELS).factStats, {});
  assert.deepEqual(normalizeStoredState({ factStats: "corrupt" }, LEVELS).factStats, {});
  assert.deepEqual(normalizeStoredState(null, LEVELS).factStats, {});
});

test("TASK-020 AC-77: persisted weak fact is prioritized after other hard facts are mastered", () => {
  const factStats = {
    "6x6": { ...createFactRecord(), attempts: 8, correct: 8, mastery: 2 },
    "6x7": { ...createFactRecord(), attempts: 8, correct: 8, mastery: 2 },
    "6x8": { ...createFactRecord(), attempts: 3, correct: 1, wrongStreak: 2, mastery: 1 },
    "6x9": { ...createFactRecord(), attempts: 8, correct: 8, mastery: 2 },
  };
  const persisted = normalizeStoredState({ factStats }, LEVELS);
  const level = LEVELS.find(({ id }) => id === "x6");
  const plan = buildLevelSessionPlan(level, persisted.factStats, DEFAULT_GAME_SETTINGS, () => 0.42);
  assert.ok(plan.meta.focusFacts.includes("6x8"));
  const scoredKeys = plan.questions.filter(({ phase }) => phase === "scored").map(({ key }) => key);
  assert.ok(scoredKeys.filter((key) => key === "6x8").length >= 2);
});
