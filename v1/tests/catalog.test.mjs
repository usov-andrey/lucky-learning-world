import test from "node:test";
import assert from "node:assert/strict";
import { validateCatalog, LEVELS, CHARACTERS, REWARD_POOLS, getLevel, getNextLevel, getCharacter, getPool } from "../content/catalog.js";

test("catalog: shipped content has no validation errors", () => {
  assert.deepEqual(validateCatalog(), []);
});

test("catalog: level/character/pool ids are unique", () => {
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, LEVELS.length);
  assert.equal(new Set(CHARACTERS.map((c) => c.id)).size, CHARACTERS.length);
  assert.equal(new Set(REWARD_POOLS.map((p) => p.id)).size, REWARD_POOLS.length);
});

test("catalog: every level's residentId and rewardPoolId resolve", () => {
  LEVELS.forEach((level) => {
    assert.ok(getCharacter(level.residentId), `residentId ${level.residentId} for ${level.id}`);
    assert.ok(getPool(level.rewardPoolId), `rewardPoolId ${level.rewardPoolId} for ${level.id}`);
  });
});

test("catalog: every pool's characterIds resolve", () => {
  REWARD_POOLS.forEach((pool) => {
    pool.characterIds.forEach((id) => {
      assert.ok(getCharacter(id), `pool ${pool.id} references unknown character ${id}`);
    });
  });
});

test("catalog: validateCatalog flags a broken reference", () => {
  const badLevels = [{ id: "x6", order: 1, table: 6, reviewTables: [], rewardPoolId: "missing", residentId: "res_x6" }];
  const errors = validateCatalog(badLevels, CHARACTERS, REWARD_POOLS);
  assert.ok(errors.some((e) => e.includes("rewardPoolId")));
});

test("catalog: getNextLevel resolves the unlock chain in order", () => {
  const x6 = getLevel("x6");
  const x7 = getNextLevel(x6);
  assert.equal(x7.id, "x7");
  const x10 = getLevel("x10");
  assert.equal(getNextLevel(x10), null);
});

test("catalog: image-kind characters must carry art.src", () => {
  const errors = validateCatalog(
    LEVELS,
    [{ id: "broken", name: "Broken", art: { kind: "image", src: null } }],
    REWARD_POOLS.map((p) => ({ ...p, characterIds: [] })),
  );
  assert.ok(errors.some((e) => e.includes("art.src")));
});
