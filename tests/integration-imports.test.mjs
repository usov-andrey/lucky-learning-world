import test from 'node:test';
import assert from 'node:assert/strict';

test('Integration Contract: content/characters.js exports all required symbols', async () => {
  const mod = await import('../content/characters.js');
  assert.ok(Array.isArray(mod.CHARACTERS), 'CHARACTERS should be an array');
  assert.equal(typeof mod.getCharacterById, 'function', 'getCharacterById must be exported');
  assert.equal(typeof mod.getStageCount, 'function', 'getStageCount must be exported');
  assert.equal(typeof mod.getShinyStageLevel, 'function', 'getShinyStageLevel must be exported');

  // Verify getCharacterById lookup
  const pikachu = mod.getCharacterById('res_x6');
  assert.ok(pikachu, 'Pikachu resident must exist');
  assert.equal(pikachu.name, 'Pikachu');
});

test('Integration Contract: content/reward-pools.js exports getPoolById', async () => {
  const mod = await import('../content/reward-pools.js');
  assert.ok(Array.isArray(mod.REWARD_POOLS), 'REWARD_POOLS should be an array');
  assert.equal(typeof mod.getPoolById, 'function', 'getPoolById must be exported');

  const pool = mod.getPoolById('x6');
  assert.ok(pool);
  assert.equal(pool.id, 'x6');
});

test('Integration Contract: content/spelling-catalog.js exports PAGE_22_DECK and getDeckById', async () => {
  const mod = await import('../content/spelling-catalog.js');
  assert.ok(mod.PAGE_22_DECK);
  assert.equal(typeof mod.getDeckById, 'function');
  assert.equal(mod.PAGE_22_DECK.words.length, 18);
});

test('Integration Contract: engine/math-engine.js exports all runtime functions', async () => {
  const mod = await import('../engine/math-engine.js');
  assert.equal(typeof mod.buildLevelSessionPlan, 'function');
  assert.equal(typeof mod.buildMixSessionPlan, 'function');
  assert.equal(typeof mod.createLevelSession, 'function');
  assert.equal(typeof mod.currentQuestion, 'function');
  assert.equal(typeof mod.computeAnswer, 'function');
  assert.equal(typeof mod.buildChoices, 'function');
  assert.equal(typeof mod.answerFirstTry, 'function');
  assert.equal(typeof mod.confirmCorrection, 'function');
  assert.equal(typeof mod.factKey, 'function');
});

test('Integration Contract: engine/spelling-engine.js exports SpellingEngine class', async () => {
  const mod = await import('../engine/spelling-engine.js');
  assert.equal(typeof mod.SpellingEngine, 'function');
});

test('Integration Contract: engine/reward-engine.js exports chooseReward & applyReward', async () => {
  const mod = await import('../engine/reward-engine.js');
  assert.equal(typeof mod.chooseReward, 'function');
  assert.equal(typeof mod.chooseMixReward, 'function');
  assert.equal(typeof mod.applyReward, 'function');
  assert.equal(typeof mod.normalizeCollection, 'function');
});
