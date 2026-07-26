import test from 'node:test';
import assert from 'node:assert/strict';
import { SpellingEngine } from '../engine/spelling-engine.js';
import { PAGE_22_DECK, SPELLING_DECKS, getDeckById } from '../content/spelling-catalog.js';

test('SpellingCatalog loads Page 22 canonical deck with 18 words', () => {
  const deck = getDeckById('page-22');
  assert.equal(deck.id, 'page-22');
  assert.equal(deck.pageLabel, 'Page 22');
  assert.equal(deck.topic, 'Schwa ‹or›');
  assert.equal(deck.words.length, 18);
  assert.equal(deck.words[0].word, 'author');
  assert.equal(deck.words[17].word, 'opportunity');
  assert.equal(deck.words[15].image, 'content/page-22/images/escalator.jpg');
});

test('SpellingEngine Learn Mode navigation works', () => {
  const engine = new SpellingEngine(PAGE_22_DECK, 'learn');
  let current = engine.getCurrentLearnItem();
  assert.ok(current);
  assert.equal(current.word, 'author');
  assert.equal(current.index, 0);

  current = engine.nextLearn();
  assert.equal(current.word, 'error');
  assert.equal(current.index, 1);

  current = engine.prevLearn();
  assert.equal(current.word, 'author');
  assert.equal(current.index, 0);
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
