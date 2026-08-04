// @task TASK-013
// @ac AC-1
import test from 'node:test';
import assert from 'node:assert/strict';
import { SpellingEngine } from '../engine/spelling-engine.js';
import { getCharacterImgSrc } from '../app.js';
import { PAGE_22_LESSON, OR_SAYING_ER_LESSON } from '../content/spelling-catalog.js';
import { getCharacterById } from '../content/characters.js';
import { ThemeManager } from '../content/themes.js';

test('TASK-013 AC-1 & AC-2: SpellingEngine.prevTest steps back in Test mode and respects index 0 guard', () => {
  const engine = new SpellingEngine(PAGE_22_LESSON, 'test');
  
  // At index 0, prevTest does nothing and remains at index 0
  assert.equal(engine.testIndex, 0);
  const q0 = engine.prevTest();
  assert.equal(engine.testIndex, 0);
  assert.equal(q0.targetWord, PAGE_22_LESSON.words[0].word.toLowerCase());

  // Advance digital test answer
  engine.submitDigitalAnswer(PAGE_22_LESSON.words[0].word);
  assert.equal(engine.testIndex, 1);

  // Now call prevTest() to step back
  const qBack = engine.prevTest();
  assert.equal(engine.testIndex, 0);
  assert.equal(qBack.targetWord, PAGE_22_LESSON.words[0].word.toLowerCase());
});

test('TASK-013 AC-3 & AC-4: SpellingEngine.prevGame steps back in Game/Tiles mode and respects index 0 guard', () => {
  const engine = new SpellingEngine(PAGE_22_LESSON, 'game');
  
  // At index 0, prevGame does nothing
  assert.equal(engine.gameIndex, 0);
  const q0 = engine.prevGame();
  assert.equal(engine.gameIndex, 0);
  assert.equal(q0.targetWord, PAGE_22_LESSON.words[0].word.toLowerCase());

  // Submit correct game word
  engine.submitGameWord(PAGE_22_LESSON.words[0].word);
  assert.equal(engine.gameIndex, 1);

  // Call prevGame() to step back
  const qBack = engine.prevGame();
  assert.equal(engine.gameIndex, 0);
  assert.equal(qBack.targetWord, PAGE_22_LESSON.words[0].word.toLowerCase());
});

test('TASK-013 AC-5: getCharacterImgSrc correctly resolves art.src for Pokemon characters (e.g. Growlithe / embercub)', () => {
  const char = getCharacterById('embercub');
  assert.ok(char, 'embercub character exists');
  assert.equal(char.name, 'Growlithe');

  const pres = ThemeManager.getCharacterPresentation('embercub', char);
  const src = getCharacterImgSrc(pres, char);

  assert.ok(src, 'image source is not empty or undefined');
  assert.notEqual(src, 'undefined');
  assert.ok(src.includes('growlithe.png'), `image src should contain growlithe.png but got ${src}`);
});
