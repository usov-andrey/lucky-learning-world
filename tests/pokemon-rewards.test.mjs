// @task TASK-026
// @ac AC-87 Every completed Math Duel grants a Pokémon reward.
// @ac AC-88 Academic stars and level unlocks remain performance-based.
// @ac AC-89 The saved collection count renders immediately on the dashboard.
// @ac AC-90 The collection badge uses Pokémon wording.

import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

async function createApp({ collection = [] } = {}) {
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.setItem("lucky_learning_player", JSON.stringify({ name: "Lucky", starterPet: "embercub" }));
  localStorage.setItem("lmm3s:collection", JSON.stringify(collection));

  const { AppController } = await import(`../app.js?task026=${Date.now()}_${Math.random()}`);
  return { app: new AppController(), dom };
}

test("TASK-026 AC-89/AC-90: dashboard immediately shows the saved Pokémon count", async () => {
  const { app, dom } = await createApp({
    collection: [
      { id: "embercub", shiny: false, level: 1 },
      { id: "leafling", shiny: false, level: 1 },
    ],
  });

  assert.equal(app.collection.length, 2);
  assert.equal(document.getElementById("pets-collected-count").textContent, "2 / 15 Pokémon");
  dom.window.close();
});

test("TASK-026 AC-87/AC-88: a zero-star Math Duel still awards a Pokémon without unlocking a level", async () => {
  const { app, dom } = await createApp({
    collection: [{ id: "embercub", shiny: false, level: 1 }],
  });
  let openedReward = null;
  let alertCount = 0;
  app.openVictoryModal = (reward) => { openedReward = reward; };
  globalThis.alert = () => { alertCount += 1; };
  window.alert = globalThis.alert;
  app.mathSession = {
    levelId: "x6",
    points: 0,
    assistedCorrections: 10,
  };

  app.finishMathSession();

  assert.ok(openedReward?.character, "a valid Pokémon reward must open in the victory modal");
  assert.equal(alertCount, 0, "the browser completion alert must not be used");
  assert.equal(app.collection.length, 2, "the completed duel must add a new Pokémon");
  assert.equal(app.progression.levels.x6.stars, 0, "the low-score attempt must remain zero-star");
  assert.deepEqual(app.progression.unlockedLevelIds, ["x6"], "the low-score attempt must not unlock ×7");
  assert.equal(document.getElementById("pets-collected-count").textContent, "2 / 15 Pokémon");
  dom.window.close();
});
