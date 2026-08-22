// @task TASK-029
// @ac AC-99 Digital and paper spelling tests persist Pokémon rewards.
// @ac AC-100 Requested Pokémon are earned without duplicates before general fallbacks.
// @ac AC-101 Tiles reward behaviour remains unchanged.

import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chooseReward, applyReward } from "../engine/reward-engine.js";
import { REWARD_POOLS, SPELLING_TEST_REWARD_POOL } from "../content/reward-pools.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const htmlContent = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const STARTER_TRIO = [
  { id: "embercub", shiny: false, level: 1 },
  { id: "leafling", shiny: false, level: 1 },
  { id: "bubblit", shiny: false, level: 1 },
];
const WANTED_IDS = ["frosty", "pebblin", "glowmoth", "aurelio"];

async function createApp(collection = STARTER_TRIO) {
  const dom = new JSDOM(htmlContent, { url: "http://localhost/" });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  localStorage.setItem("lucky_learning_player", JSON.stringify({ name: "Lucky", starterPet: "embercub" }));
  localStorage.setItem("lmm3s:collection", JSON.stringify(collection));
  const { AppController } = await import(`../app.js?task029=${Date.now()}_${Math.random()}`);
  return { app: new AppController(), dom };
}

test("TASK-029 AC-100: four spelling-test rewards collect Glaceon, Geodude, Butterfree, and Mew without duplicates before fallback", () => {
  assert.deepEqual(SPELLING_TEST_REWARD_POOL.characterIds, WANTED_IDS);

  let collection = STARTER_TRIO.map(item => ({ ...item }));
  for (let index = 0; index < WANTED_IDS.length; index += 1) {
    const reward = chooseReward(SPELLING_TEST_REWARD_POOL, collection, REWARD_POOLS, () => 0);
    assert.equal(reward.variant, "new");
    assert.ok(WANTED_IDS.includes(reward.characterId));
    collection = applyReward(collection, reward, `spelling-${index}`).collection;
  }

  assert.deepEqual(
    collection.filter(item => WANTED_IDS.includes(item.id)).map(item => item.id).sort(),
    [...WANTED_IDS].sort(),
  );

  const fallback = chooseReward(SPELLING_TEST_REWARD_POOL, collection, REWARD_POOLS, () => 0);
  assert.equal(fallback.variant, "new");
  assert.ok(!WANTED_IDS.includes(fallback.characterId), "After all four are owned, selection must fall back to the standard roster");
});

for (const submode of ["digital", "paper"]) {
  test(`TASK-029 AC-99: completed ${submode} spelling test persists a wanted Pokémon`, async () => {
    const originalRandom = Math.random;
    Math.random = () => 0;
    const { app, dom } = await createApp();
    try {
      let openedReward = null;
      app.openVictoryModal = reward => { openedReward = reward; };
      app.spellingEngine.mode = "test";
      app.spellingEngine.testSubMode = submode;

      app.finishSpellingSession();

      assert.ok(WANTED_IDS.includes(openedReward?.character?.id));
      const stored = JSON.parse(localStorage.getItem("lmm3s:collection"));
      assert.ok(stored.some(item => item.id === openedReward.character.id));
      assert.equal(stored.length, STARTER_TRIO.length + 1);
    } finally {
      Math.random = originalRandom;
      dom.window.close();
    }
  });
}

test("TASK-029 AC-101: Tiles completion keeps the existing ×6-first reward path", async () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  const { app, dom } = await createApp([{ id: "embercub", shiny: false, level: 1 }]);
  try {
    let openedReward = null;
    app.openVictoryModal = reward => { openedReward = reward; };
    app.spellingEngine.mode = "game";

    app.finishSpellingSession();

    assert.ok(["leafling", "bubblit"].includes(openedReward?.character?.id));
    assert.ok(!WANTED_IDS.includes(openedReward.character.id));
  } finally {
    Math.random = originalRandom;
    dom.window.close();
  }
});
