import test from "node:test";
import assert from "node:assert/strict";
import { chooseReward, applyReward, normalizeCollection, chooseMixReward } from "../engine/reward-engine.js";
import { REWARD_POOLS } from "../content/reward-pools.js";
import { getStageCount, getShinyStageLevel } from "../content/characters.js";

function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL_IDS = [...new Set(REWARD_POOLS.flatMap((p) => p.characterIds))];

function ownAll({ atTop }) {
  return ALL_IDS.map((id) => ({ id, shiny: false, level: atTop ? getStageCount(id) : 1 }));
}

test("chooseReward: seeded RNG is deterministic, unowned -> variant 'new'", () => {
  const pool = REWARD_POOLS[0];
  const a = chooseReward(pool, [], REWARD_POOLS, mulberry32(42));
  const b = chooseReward(pool, [], REWARD_POOLS, mulberry32(42));
  assert.deepEqual(a, b);
  assert.ok(pool.characterIds.includes(a.characterId));
  assert.equal(a.variant, "new");
});

test("chooseReward: never a duplicate 'new' while an unowned character exists in the pool", () => {
  const pool = REWARD_POOLS[0];
  const collection = [{ id: pool.characterIds[0], shiny: false, level: 1 }];
  for (let seed = 0; seed < 30; seed += 1) {
    const reward = chooseReward(pool, collection, REWARD_POOLS, mulberry32(seed));
    assert.notEqual(reward.characterId, pool.characterIds[0]);
    assert.equal(reward.variant, "new");
  }
});

test("chooseReward: pool exhausted but characters unowned elsewhere -> global 'new'", () => {
  const pool = REWARD_POOLS[0];
  const ownPoolOnly = pool.characterIds.map((id) => ({ id, shiny: false, level: 1 }));
  const reward = chooseReward(pool, ownPoolOnly, REWARD_POOLS, mulberry32(1));
  assert.equal(reward.variant, "new");
  assert.ok(!pool.characterIds.includes(reward.characterId));
});

test("chooseReward: everyone owned at top stage -> a 'levelup', never 'complete'", () => {
  const pool = REWARD_POOLS[0];
  const collection = ownAll({ atTop: true });
  for (let seed = 0; seed < 20; seed += 1) {
    const reward = chooseReward(pool, collection, REWARD_POOLS, mulberry32(seed));
    assert.equal(reward.variant, "levelup");
    assert.notEqual(reward.complete, true);
    assert.ok(reward.characterId);
  }
});

test("applyReward: 'new' appends level 1; 'levelup' increments; idempotent by outcomeId", () => {
  let result = applyReward([], { characterId: "embercub", variant: "new" }, "out-1", []);
  assert.deepEqual(result.collection, [{ id: "embercub", shiny: false, level: 1 }]);

  result = applyReward(result.collection, { characterId: "embercub", variant: "levelup" }, "out-2", result.appliedRewardOutcomeIds);
  assert.equal(result.collection[0].level, 2);

  const before = result;
  result = applyReward(before.collection, { characterId: "embercub", variant: "levelup" }, "out-2", before.appliedRewardOutcomeIds);
  assert.deepEqual(result, before);
});

test("normalizeCollection: defaults level, migrates legacy shiny -> level 2, keeps explicit level", () => {
  const normalized = normalizeCollection([
    { id: "sun", shiny: true, sessionCount: 4 },
    { id: "mint" },
    { id: "veteran", shiny: false, level: 5 },
    { bogus: true },
    "not-an-object",
  ]);
  assert.deepEqual(normalized, [
    { id: "sun", shiny: true, level: 2 },
    { id: "mint", shiny: false, level: 1 },
    { id: "veteran", shiny: false, level: 5 },
  ]);
});
