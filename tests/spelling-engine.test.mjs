import test from 'node:test';
import assert from 'node:assert/strict';
import { SpellingEngine } from '../engine/spelling-engine.js';
import { SPELLING_DECKS, getDeckById } from '../content/spelling-catalog.js';

test('SpellingCatalog loads Grade 1 and Grade 3 decks correctly', () => {
  assert.ok(SPELLING_DECKS.length >= 4);
  const deck = getDeckById('y3-sightwords');
  assert.equal(deck.id, 'y3-sightwords');
  assert.ok(deck.words.length > 0);
});

test('SpellingEngine initializes question and letter tiles', () => {
  const deck = getDeckById('g1-sightwords');
  const engine = new SpellingEngine(deck);
  const q = engine.getCurrentQuestion();

  assert.ok(q);
  assert.equal(q.questionNumber, 1);
  assert.equal(q.totalQuestions, deck.words.length);
  assert.ok(q.tiles.length >= q.targetWord.length);
});

test('SpellingEngine handles correct and incorrect answers', () => {
  const sampleDeck = {
    id: 'test-deck',
    name: 'Test Deck',
    grade: 'g1',
    words: [
      { word: 'cat', hint: 'feline' },
      { word: 'dog', hint: 'canine' }
    ]
  };

  const engine = new SpellingEngine(sampleDeck);
  
  // Wrong answer
  const wrongRes = engine.submitAnswer('bat');
  assert.equal(wrongRes.isCorrect, false);
  assert.equal(wrongRes.isFinished, false);
  assert.equal(engine.currentIndex, 0);

  // Correct answer for cat
  const correctRes1 = engine.submitAnswer('cat');
  assert.equal(correctRes1.isCorrect, true);
  assert.equal(engine.currentIndex, 1);

  // Correct answer for dog (finishes deck)
  const correctRes2 = engine.submitAnswer('DOG');
  assert.equal(correctRes2.isCorrect, true);
  assert.equal(correctRes2.isFinished, true);
  assert.equal(correctRes2.stars, 3);
});
