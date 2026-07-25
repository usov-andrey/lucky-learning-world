/**
 * Pure Game Engine for Word Monster Spelling Battles
 */

export class SpellingEngine {
  constructor(deck) {
    this.deck = deck;
    this.currentIndex = 0;
    this.score = 0;
    this.stars = 0;
    this.monsterMaxHp = deck.words.length * 10;
    this.monsterHp = this.monsterMaxHp;
    this.currentUserInput = "";
    this.synth = window.speechSynthesis || null;
  }

  getCurrentQuestion() {
    if (this.currentIndex >= this.deck.words.length) {
      return null;
    }
    const item = this.deck.words[this.currentIndex];
    const targetWord = item.word.toLowerCase();
    
    // Scramble letters with extra random distractor letters
    const letters = targetWord.split('');
    const extraAlphabet = 'abcdefghijklmnopqrstuvwxyz';
    const extraCount = Math.max(2, 8 - letters.length);
    for (let i = 0; i < extraCount; i++) {
      letters.push(extraAlphabet[Math.floor(Math.random() * extraAlphabet.length)]);
    }
    
    // Shuffle tiles
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    return {
      wordObj: item,
      targetWord: targetWord,
      tiles: letters,
      hint: item.hint,
      questionNumber: this.currentIndex + 1,
      totalQuestions: this.deck.words.length
    };
  }

  speakCurrentWord() {
    const q = this.getCurrentQuestion();
    if (!q || !this.synth) return;

    this.synth.cancel(); // Stop prior audio
    const utterance = new SpeechSynthesisUtterance(q.targetWord);
    utterance.rate = 0.85; // Slightly slower for primary kids
    utterance.lang = 'en-US';
    this.synth.speak(utterance);
  }

  submitAnswer(input) {
    const q = this.getCurrentQuestion();
    if (!q) return { isCorrect: false, isFinished: true };

    const cleanInput = input.trim().toLowerCase();
    const isCorrect = cleanInput === q.targetWord;

    if (isCorrect) {
      this.score += 10;
      this.monsterHp = Math.max(0, this.monsterHp - 10);
      this.currentIndex += 1;
      this.currentUserInput = "";
    }

    const isFinished = this.currentIndex >= this.deck.words.length;
    if (isFinished) {
      this.stars = Math.min(3, Math.ceil((this.score / (this.deck.words.length * 10)) * 3));
    }

    return {
      isCorrect,
      score: this.score,
      stars: this.stars,
      monsterHp: this.monsterHp,
      monsterMaxHp: this.monsterMaxHp,
      isFinished
    };
  }
}
