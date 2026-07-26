/**
 * Pure Game & Learning Engine for Word Realm (Spelling)
 * Independent of DOM, UI controllers, or math modules.
 */

import { PAGE_22_DECK } from "../content/spelling-catalog.js";

export class SpellingEngine {
  constructor(deck = PAGE_22_DECK, mode = "game") {
    this.deck = deck;
    this.mode = mode; // "learn", "test", "game"
    this.testSubMode = "digital"; // "paper" | "digital"
    this.currentIndex = 0;
    this.score = 0;
    this.stars = 0;
    this.monsterMaxHp = (deck.words ? deck.words.length : 10) * 10;
    this.monsterHp = this.monsterMaxHp;
    this.queue = deck.words ? deck.words.slice() : [];
    this.requeuedKeys = [];
    this.history = [];
    this.revealedWords = new Set();
  }

  setMode(mode, testSubMode = "digital") {
    this.mode = mode;
    this.testSubMode = testSubMode;
    this.reset();
  }

  reset() {
    this.currentIndex = 0;
    this.score = 0;
    this.stars = 0;
    this.monsterHp = this.monsterMaxHp;
    this.queue = this.deck.words ? this.deck.words.slice() : [];
    this.requeuedKeys = [];
    this.history = [];
    this.revealedWords.clear();
  }

  // --- Learn Mode API ---
  getCurrentLearnItem() {
    if (!this.deck.words || this.currentIndex >= this.deck.words.length) {
      return null;
    }
    const item = this.deck.words[this.currentIndex];
    return {
      index: this.currentIndex,
      total: this.deck.words.length,
      wordObj: item,
      word: item.word,
      definition: item.definition,
      image: item.image,
      imageAlt: item.imageAlt,
      audio: item.audio,
      definitionAudio: item.definitionAudio,
      hint: item.hint
    };
  }

  nextLearn() {
    if (this.currentIndex < this.deck.words.length - 1) {
      this.currentIndex += 1;
    }
    return this.getCurrentLearnItem();
  }

  prevLearn() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
    }
    return this.getCurrentLearnItem();
  }

  // --- Test Mode API (Paper & Digital) ---
  getCurrentTestQuestion() {
    if (this.queue.length === 0) {
      return null;
    }
    const item = this.queue[0];
    const targetWord = item.word.toLowerCase();
    const isRevealed = this.revealedWords.has(item.word);

    return {
      index: this.currentIndex,
      totalQuestions: this.deck.words.length,
      remainingInQueue: this.queue.length,
      wordObj: item,
      targetWord: targetWord,
      audio: item.audio,
      definition: item.definition,
      definitionAudio: item.definitionAudio,
      hint: item.hint,
      isRevealed: isRevealed,
      subMode: this.testSubMode
    };
  }

  revealTestWord() {
    const q = this.getCurrentTestQuestion();
    if (q) {
      this.revealedWords.add(q.wordObj.word);
    }
    return this.getCurrentTestQuestion();
  }

  submitDigitalAnswer(input) {
    if (this.queue.length === 0) {
      return { isCorrect: false, isFinished: true };
    }

    const currentItem = this.queue[0];
    const targetWord = currentItem.word.toLowerCase();
    const cleanInput = (input || "").trim().toLowerCase();
    const isCorrect = cleanInput === targetWord;

    if (isCorrect) {
      this.score += 10;
      this.queue.shift();
      this.currentIndex += 1;
      this.history.push({ word: targetWord, correct: true, attemptInput: cleanInput });
    } else {
      // Requeue wrong answer 2 steps ahead in queue without hard penalty
      const missedItem = this.queue.shift();
      this.history.push({ word: targetWord, correct: false, attemptInput: cleanInput });

      const insertIndex = Math.min(2, this.queue.length);
      this.queue.splice(insertIndex, 0, missedItem);
      this.requeuedKeys.push(targetWord);
    }

    const isFinished = this.queue.length === 0;
    if (isFinished) {
      const maxPossibleScore = this.deck.words.length * 10;
      this.stars = Math.min(3, Math.max(1, Math.ceil((this.score / maxPossibleScore) * 3)));
    }

    return {
      isCorrect,
      score: this.score,
      stars: this.stars,
      isFinished,
      remainingInQueue: this.queue.length
    };
  }

  // --- Game Mode API (Letter tiles monster battle) ---
  getCurrentGameQuestion(rng = Math.random) {
    if (this.queue.length === 0) {
      return null;
    }
    const item = this.queue[0];
    const targetWord = item.word.toLowerCase();

    // Scramble letters with extra distractor letters
    const letters = targetWord.split('');
    const extraAlphabet = 'abcdefghijklmnopqrstuvwxyz';
    const extraCount = Math.max(2, 8 - letters.length);
    for (let i = 0; i < extraCount; i++) {
      letters.push(extraAlphabet[Math.floor(rng() * extraAlphabet.length)]);
    }

    // Shuffle tiles
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    return {
      wordObj: item,
      targetWord: targetWord,
      tiles: letters,
      hint: item.hint,
      audio: item.audio,
      definition: item.definition,
      definitionAudio: item.definitionAudio,
      image: item.image,
      questionNumber: this.currentIndex + 1,
      totalQuestions: this.deck.words.length,
      monsterHp: this.monsterHp,
      monsterMaxHp: this.monsterMaxHp
    };
  }

  submitGameAnswer(input) {
    if (this.queue.length === 0) {
      return { isCorrect: false, isFinished: true };
    }

    const currentItem = this.queue[0];
    const targetWord = currentItem.word.toLowerCase();
    const cleanInput = (input || "").trim().toLowerCase();
    const isCorrect = cleanInput === targetWord;

    if (isCorrect) {
      this.score += 10;
      this.monsterHp = Math.max(0, this.monsterHp - 10);
      this.queue.shift();
      this.currentIndex += 1;
      this.history.push({ word: targetWord, correct: true });
    } else {
      const missedItem = this.queue.shift();
      const insertIndex = Math.min(2, this.queue.length);
      this.queue.splice(insertIndex, 0, missedItem);
      this.requeuedKeys.push(targetWord);
      this.history.push({ word: targetWord, correct: false });
    }

    const isFinished = this.queue.length === 0;
    if (isFinished) {
      const maxPossibleScore = this.deck.words.length * 10;
      this.stars = Math.min(3, Math.max(1, Math.ceil((this.score / maxPossibleScore) * 3)));
    }

    return {
      isCorrect,
      score: this.score,
      stars: this.stars,
      monsterHp: this.monsterHp,
      monsterMaxHp: this.monsterMaxHp,
      isFinished,
      remainingInQueue: this.queue.length
    };
  }
}
