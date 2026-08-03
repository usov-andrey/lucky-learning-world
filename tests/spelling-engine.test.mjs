// @task TASK-005
// @ac AC-14 Active-Lesson Engine Behaviour
// @ac AC-15 Safe Selection Fallback

import test from 'node:test';
import assert from 'node:assert/strict';
import { SpellingEngine } from '../engine/spelling-engine.js';
import { PAGE_22_LESSON, SCHWA_ER_LESSON, getSpellingLesson } from '../content/spelling-catalog.js';

test('TASK-005 AC-14: SpellingCatalog loads Page 22 and Schwa ‹er› canonical decks', () => {
  const page22 = getSpellingLesson('page-22');
  assert.equal(page22.id, 'page-22');
  assert.equal(page22.pageLabel, 'Page 22');
  assert.equal(page22.topic, 'Schwa ‹or›');
  assert.equal(page22.words.length, 18);
  assert.equal(page22.words[0].word, 'author');

  const schwaEr = getSpellingLesson('schwa-er');
  assert.equal(schwaEr.id, 'schwa-er');
  assert.equal(schwaEr.pageLabel, 'Schwa ‹er›');
  assert.equal(schwaEr.topic, 'Schwa ‹er›');
  assert.equal(schwaEr.words.length, 18);
  assert.equal(schwaEr.words[0].word, 'pattern');
  assert.equal(schwaEr.words[17].word, 'temperature');
});

test('TASK-005 AC-14: SpellingEngine Learn Mode works with active lesson and first-item Back guard', () => {
  const engine = new SpellingEngine(SCHWA_ER_LESSON, 'learn');
  let current = engine.getCurrentLearnItem();
  assert.ok(current);
  assert.equal(current.word, 'pattern');
  assert.equal(current.index, 0);
  assert.equal(current.total, 18);
  assert.ok(current.extendedExplanation.length > 0);
  assert.ok(current.exampleSentence.length > 0);

  current = engine.nextLearn();
  assert.equal(current.word, 'referee');
  assert.equal(current.index, 1);

  current = engine.prevLearn();
  assert.equal(current.word, 'pattern');
  assert.equal(current.index, 0);
});

test('TASK-005 AC-15: setLesson dynamically switches active lesson and resets engine state', () => {
  const engine = new SpellingEngine(PAGE_22_LESSON, 'game');
  engine.submitGameAnswer('author');
  assert.equal(engine.currentIndex, 1);
  assert.equal(engine.score, 10);

  engine.setLesson(SCHWA_ER_LESSON);
  assert.equal(engine.deck.id, 'schwa-er');
  assert.equal(engine.currentIndex, 0);
  assert.equal(engine.score, 0);
  assert.equal(engine.history.length, 0);
  assert.equal(engine.queue[0].word, 'pattern');
});

test('SpellingEngine Test Mode (Digital & Paper) handles submission & requeueing', () => {
  const sampleDeck = {
    id: 'test-deck',
    words: [
      { word: 'author', hint: 'writer' },
      { word: 'error', hint: 'mistake' }
    ]
  };

  const engine = new SpellingEngine(sampleDeck, 'test');
  let q = engine.getCurrentTestQuestion();
  assert.ok(q);
  assert.equal(q.targetWord, 'author');

  // Digital Test: Wrong answer requeues word 'author' behind 'error'
  const wrongRes = engine.submitDigitalAnswer('autor');
  assert.equal(wrongRes.isCorrect, false);
  assert.equal(wrongRes.remainingInQueue, 2);

  // Next question in queue is 'error'
  const qNext = engine.getCurrentTestQuestion();
  assert.equal(qNext.targetWord, 'error');

  // Correct answer for error
  const res1 = engine.submitDigitalAnswer('error');
  assert.equal(res1.isCorrect, true);

  // Now requeued 'author' comes up
  const qRequeued = engine.getCurrentTestQuestion();
  assert.equal(qRequeued.targetWord, 'author');

  // Correct answer for author finishes deck
  const res2 = engine.submitDigitalAnswer('author');
  assert.equal(res2.isCorrect, true);
  assert.equal(res2.isFinished, true);
  assert.equal(res2.stars, 3);
});

test('SpellingEngine Game Mode handles tiles, monster HP and battle victory', () => {
  const sampleDeck = {
    id: 'game-deck',
    words: [
      { word: 'cat', hint: 'feline' },
      { word: 'dog', hint: 'canine' }
    ]
  };

  const engine = new SpellingEngine(sampleDeck, 'game');
  let q = engine.getCurrentGameQuestion();
  assert.ok(q);
  assert.equal(q.questionNumber, 1);
  assert.ok(q.tiles.length >= 3);

  // Wrong answer in game requeues 'cat' behind 'dog'
  const wrongRes = engine.submitGameAnswer('bat');
  assert.equal(wrongRes.isCorrect, false);

  // 'dog' is now current question
  const qDog = engine.getCurrentGameQuestion();
  assert.equal(qDog.targetWord, 'dog');

  const correctRes1 = engine.submitGameAnswer('dog');
  assert.equal(correctRes1.isCorrect, true);

  // Requeued 'cat' is now current question
  const qCat = engine.getCurrentGameQuestion();
  assert.equal(qCat.targetWord, 'cat');

  const correctRes2 = engine.submitGameAnswer('cat');
  assert.equal(correctRes2.isCorrect, true);
  assert.equal(correctRes2.isFinished, true);
});

test('AC-7.1 Disabled Navigation Guard: btnLearnPrev is disabled on index 0 and enabled on index > 0', async () => {
  const { JSDOM } = await import('jsdom');
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '..');

  const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const dom = new JSDOM(htmlContent, { url: 'http://localhost/' });
  const { window } = dom;

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;

  const { AppController } = await import(`../app.js?update=${Date.now()}`);
  const app = new AppController();

  assert.ok(app.elements.btnLearnPrev, "btnLearnPrev element must exist in DOM");

  app.renderSpellingLearn();
  assert.equal(app.elements.btnLearnPrev.disabled, true, "Back button must be disabled on Word 1 (index 0)");
  assert.equal(app.elements.btnLearnPrev.style.opacity, "0.35");
  assert.equal(app.elements.btnLearnPrev.style.pointerEvents, "none");

  app.spellingEngine.nextLearn();
  app.renderSpellingLearn();
  assert.equal(app.elements.btnLearnPrev.disabled, false, "Back button must be enabled on Word 2 (index 1)");
  assert.equal(app.elements.btnLearnPrev.style.opacity, "1");
  assert.equal(app.elements.btnLearnPrev.style.pointerEvents, "auto");
});
