import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

test('Integration Contract: index.html contains all navigation and back button IDs', () => {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const requiredIds = [
    'btn-back-from-math',
    'btn-back-from-word',
    'btn-back-from-pokedex',
    'brand-logo-btn',
    'nav-btn-hub',
    'nav-btn-math',
    'nav-btn-word',
    'nav-btn-pokedex',
    'btn-enter-math',
    'btn-enter-word',
    'btn-enter-pokedex',
    'card-math-realm',
    'card-word-realm',
    'card-pokedex-realm'
  ];

  requiredIds.forEach(id => {
    assert.ok(htmlContent.includes(`id="${id}"`), `index.html must contain id="${id}"`);
  });
});

test('Integration Contract: content/themes.js exports ThemeManager', async () => {
  const mod = await import('../content/themes.js');
  assert.ok(mod.ThemeManager, 'ThemeManager must be exported');
  assert.equal(typeof mod.ThemeManager.getTheme, 'function');
  assert.equal(typeof mod.ThemeManager.setTheme, 'function');
});

test('Integration Contract: content/comic-characters.js exports COMIC_CHARACTERS', async () => {
  const mod = await import('../content/comic-characters.js');
  assert.ok(mod.COMIC_CHARACTERS, 'COMIC_CHARACTERS must be exported');
  assert.equal(typeof mod.getComicCharacterById, 'function');
});

test('Integration Contract: engine/narrative-engine.js & content/narrative-themes.js export required symbols', async () => {
  const themesMod = await import('../content/narrative-themes.js');
  assert.ok(themesMod.NARRATIVE_THEMES, 'NARRATIVE_THEMES must be exported');
  assert.ok(themesMod.NARRATIVE_THEMES.pokemon);
  assert.ok(themesMod.NARRATIVE_THEMES.comic);

  const engineMod = await import('../engine/narrative-engine.js');
  assert.ok(engineMod.NarrativeEngine, 'NarrativeEngine must be exported');
  assert.equal(typeof engineMod.NarrativeEngine.resolveViewModel, 'function');
});


