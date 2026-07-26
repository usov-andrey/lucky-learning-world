/**
 * Lucky's Learning World — Main Application Router & Presenter Orchestrator
 * Connects pure engine modules to UI views with zero-coupling architecture.
 */

import {
  buildLevelSessionPlan,
  buildMixSessionPlan,
  createLevelSession,
  currentQuestion,
  computeAnswer,
  buildChoices,
  answerFirstTry,
  confirmCorrection,
  factKey
} from "./engine/math-engine.js";

import { SpellingEngine } from "./engine/spelling-engine.js";

import {
  normalizeStoredState,
  computeLevelOutcome,
  applyLevelOutcome
} from "./engine/progression.js";

import {
  chooseReward,
  chooseMixReward,
  applyReward,
  normalizeCollection
} from "./engine/reward-engine.js";

import { LEVELS } from "./content/levels.js";
import { PAGE_22_DECK, SPELLING_DECKS, getDeckById } from "./content/spelling-catalog.js";
import { CHARACTERS, getCharacterById } from "./content/characters.js";
import { REWARD_POOLS, getPoolById } from "./content/reward-pools.js";

// --- GLOBAL AUDIO & TTS CONTROLLER ---
let audioUnlocked = false;
let currentAudio = null;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  if (window.speechSynthesis) {
    const dummy = new SpeechSynthesisUtterance("");
    dummy.volume = 0.01;
    window.speechSynthesis.speak(dummy);
  }
}

window.addEventListener("pointerdown", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

function playAudioFile(src, fallbackText) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  if (src) {
    const audio = new Audio(src);
    currentAudio = audio;
    audio.play().catch(() => {
      if (fallbackText) speakTTS(fallbackText);
    });
  } else if (fallbackText) {
    speakTTS(fallbackText);
  }
}

function speakTTS(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

function speakMathFact(a, b) {
  const product = a * b;
  const wordA = numberToWord(a);
  const wordB = numberToWord(b);
  const wordProd = numberToWord(product);
  speakTTS(`${wordA} times ${wordB} is ${wordProd}`);
}

function speakPraise() {
  const praises = [
    "Awesome job, Lucky!",
    "Superstar math skills!",
    "Brilliant answer!",
    "You are unstoppable!",
    "Fantastic learning!"
  ];
  const chosen = praises[Math.floor(Math.random() * praises.length)];
  speakTTS(chosen, 0.95);
}

function numberToWord(n) {
  const words = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"
  ];
  if (n <= 20) return words[n];
  if (n < 100) {
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r === 0 ? tens[t] : `${tens[t]} ${words[r]}`;
  }
  return n.toString();
}

// --- STATE MANAGEMENT ---
const STORAGE_KEYS = {
  PLAYER: "lucky_learning_player",
  MATH_PROGRESSION: "lmm3s:progression",
  MATH_COLLECTION: "lmm3s:collection",
  SETTINGS: "lmm3s:settings"
};

const DEFAULT_SETTINGS = {
  warmupCount: 2,
  scoredCount: 10,
  hardDrill: true,
  passThreshold: 0.5,
  unlockThreshold: 0.8,
  rewardThreshold: 0.9
};

class AppController {
  constructor() {
    this.player = this.loadPlayer();
    this.progression = this.loadProgression();
    this.collection = this.loadCollection();
    this.settings = DEFAULT_SETTINGS;

    this.spellingEngine = new SpellingEngine(PAGE_22_DECK, "learn");
    this.mathSession = null;
    this.currentMathLevel = LEVELS[0];
    this.selectedLetterTiles = [];

    this.initDOM();
    this.bindEvents();
    this.checkOnboarding();
    this.renderHeader();
  }

  loadPlayer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLAYER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  savePlayer() {
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(this.player));
    this.renderHeader();
  }

  loadProgression() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATH_PROGRESSION));
      return normalizeStoredState(raw, LEVELS);
    } catch {
      return normalizeStoredState(null, LEVELS);
    }
  }

  saveProgression() {
    localStorage.setItem(STORAGE_KEYS.MATH_PROGRESSION, JSON.stringify(this.progression));
  }

  loadCollection() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATH_COLLECTION));
      return normalizeCollection(raw);
    } catch {
      return [];
    }
  }

  saveCollection() {
    localStorage.setItem(STORAGE_KEYS.MATH_COLLECTION, JSON.stringify(this.collection));
  }

  initDOM() {
    this.elements = {
      // Header
      headerPlayerName: document.getElementById("header-player-name"),
      headerPlayerAvatar: document.getElementById("header-player-avatar"),
      totalStarsCount: document.getElementById("total-stars-count"),
      btnShareLine: document.getElementById("btn-share-line"),

      // Screens
      screens: {
        dashboard: document.getElementById("dashboard-view"),
        math: document.getElementById("math-view"),
        word: document.getElementById("word-view"),
        pokedex: document.getElementById("pokedex-view")
      },

      // Nav
      navBtns: {
        hub: document.getElementById("nav-btn-hub"),
        math: document.getElementById("nav-btn-math"),
        word: document.getElementById("nav-btn-word"),
        pokedex: document.getElementById("nav-btn-pokedex")
      },

      // Dashboard
      btnEnterMath: document.getElementById("btn-enter-math"),
      btnEnterWord: document.getElementById("btn-enter-word"),
      btnEnterPokedex: document.getElementById("btn-enter-pokedex"),

      // Math
      btnBackMath: document.getElementById("btn-back-from-math"),
      mathLevelChips: document.getElementById("math-level-chips"),
      mathMonsterImg: document.getElementById("math-monster-img"),
      mathMonsterName: document.getElementById("math-monster-name"),
      mathMonsterHpBar: document.getElementById("math-monster-hp-bar"),
      mathQuestionProgress: document.getElementById("math-question-progress"),
      mathQuestionText: document.getElementById("math-question-text"),
      mathFeedbackText: document.getElementById("math-feedback-text"),
      mathAnswersGrid: document.getElementById("math-answers-grid"),

      // Word (Spelling)
      btnBackWord: document.getElementById("btn-back-from-word"),
      spellingModeChips: document.getElementById("spelling-mode-chips"),
      spellingLearnContainer: document.getElementById("spelling-learn-container"),
      spellingTestContainer: document.getElementById("spelling-test-container"),
      spellingGameContainer: document.getElementById("spelling-game-container"),

      // Learn Mode Elements
      learnWordDisplay: document.getElementById("learn-word-display"),
      learnProgressText: document.getElementById("learn-progress-text"),
      btnLearnSpeakWord: document.getElementById("btn-learn-speak-word"),
      learnImage: document.getElementById("learn-image"),
      learnDefinition: document.getElementById("learn-definition"),
      btnLearnSpeakDef: document.getElementById("btn-learn-speak-def"),
      btnLearnPrev: document.getElementById("btn-learn-prev"),
      btnLearnNext: document.getElementById("btn-learn-next"),

      // Test Mode Elements
      btnSubmodeDigital: document.getElementById("btn-submode-digital"),
      btnSubmodePaper: document.getElementById("btn-submode-paper"),
      digitalTestBox: document.getElementById("digital-test-box"),
      paperTestBox: document.getElementById("paper-test-box"),
      testQuestionProgress: document.getElementById("test-question-progress"),
      btnTestSpeakWord: document.getElementById("btn-test-speak-word"),
      testWordHint: document.getElementById("test-word-hint"),
      digitalTestInput: document.getElementById("digital-test-input"),
      digitalFeedbackText: document.getElementById("digital-feedback-text"),
      btnDigitalSubmit: document.getElementById("btn-digital-submit"),
      paperRevealedWord: document.getElementById("paper-revealed-word"),
      btnPaperReveal: document.getElementById("btn-paper-reveal"),
      btnPaperCorrect: document.getElementById("btn-paper-correct"),
      btnPaperRetry: document.getElementById("btn-paper-retry"),

      // Game Mode Elements
      wordMonsterHpBar: document.getElementById("word-monster-hp-bar"),
      wordMonsterImg: document.getElementById("word-monster-img"),
      wordMonsterName: document.getElementById("word-monster-name"),
      wordQuestionProgress: document.getElementById("word-question-progress"),
      btnSpeakWord: document.getElementById("btn-speak-word"),
      wordHintText: document.getElementById("word-hint-text"),
      wordSlotsRow: document.getElementById("word-slots-row"),
      wordFeedbackText: document.getElementById("word-feedback-text"),
      letterTilesBank: document.getElementById("letter-tiles-bank"),
      btnClearSpelling: document.getElementById("btn-clear-spelling"),
      btnSubmitSpelling: document.getElementById("btn-submit-spelling"),

      // Pokédex
      btnBackPokedex: document.getElementById("btn-back-from-pokedex"),
      pokedexGrid: document.getElementById("pokedex-grid"),
      petsCollectedCount: document.getElementById("pets-collected-count"),

      // Onboarding Modal
      onboardingModal: document.getElementById("onboarding-modal"),
      onboardingNameInput: document.getElementById("onboarding-name-input"),
      btnStartOnboarding: document.getElementById("btn-start-onboarding"),

      // Victory Modal
      victoryModal: document.getElementById("victory-modal"),
      victoryTitle: document.getElementById("victory-title"),
      victorySubtitle: document.getElementById("victory-subtitle"),
      rewardPetImg: document.getElementById("reward-pet-img"),
      rewardPetName: document.getElementById("reward-pet-name"),
      btnVictoryContinue: document.getElementById("btn-victory-continue")
    };
  }

  bindEvents() {
    // Nav bar
    Object.entries(this.elements.navBtns).forEach(([screenKey, btn]) => {
      if (btn) btn.addEventListener("click", () => this.showScreen(screenKey));
    });

    // Dashboard Realm Cards
    this.elements.btnEnterMath.addEventListener("click", () => this.startMathRealm());
    this.elements.btnEnterWord.addEventListener("click", () => this.startWordRealm());
    this.elements.btnEnterPokedex.addEventListener("click", () => this.showScreen("pokedex"));

    this.elements.btnBackMath.addEventListener("click", () => this.showScreen("dashboard"));
    this.elements.btnBackWord.addEventListener("click", () => this.showScreen("dashboard"));

    // Onboarding starter buttons
    const starterBtns = document.querySelectorAll(".starter-pet-btn");
    starterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        starterBtns.forEach(b => {
          b.classList.remove("active");
          b.style.borderColor = "var(--border-glass)";
        });
        btn.classList.add("active");
        btn.style.borderColor = "var(--border-glow)";
      });
    });

    this.elements.btnStartOnboarding.addEventListener("click", () => this.completeOnboarding());

    // Math Level selection
    this.elements.mathLevelChips.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-math-level]");
      if (!chip) return;

      this.elements.mathLevelChips.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const levelId = chip.dataset.mathLevel;
      if (levelId === "mix") {
        this.startMathMixSession();
      } else {
        const level = LEVELS.find(l => l.id === levelId);
        if (level) this.startMathLevelSession(level);
      }
    });

    // Spelling Mode Chips
    this.elements.spellingModeChips.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-spelling-mode]");
      if (!chip) return;

      this.elements.spellingModeChips.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const mode = chip.dataset.spellingMode;
      this.switchSpellingMode(mode);
    });

    // Learn Mode Controls
    this.elements.btnLearnSpeakWord.addEventListener("click", () => {
      const item = this.spellingEngine.getCurrentLearnItem();
      if (item) playAudioFile(item.audio, item.word);
    });
    this.elements.btnLearnSpeakDef.addEventListener("click", () => {
      const item = this.spellingEngine.getCurrentLearnItem();
      if (item) playAudioFile(item.definitionAudio, item.definition);
    });
    this.elements.btnLearnPrev.addEventListener("click", () => {
      this.spellingEngine.prevLearn();
      this.renderSpellingLearn();
    });
    this.elements.btnLearnNext.addEventListener("click", () => {
      this.spellingEngine.nextLearn();
      this.renderSpellingLearn();
    });

    // Test Mode Controls
    this.elements.btnSubmodeDigital.addEventListener("click", () => this.switchTestSubmode("digital"));
    this.elements.btnSubmodePaper.addEventListener("click", () => this.switchTestSubmode("paper"));

    this.elements.btnTestSpeakWord.addEventListener("click", () => {
      const q = this.spellingEngine.getCurrentTestQuestion();
      if (q) playAudioFile(q.audio, q.targetWord);
    });

    this.elements.btnDigitalSubmit.addEventListener("click", () => this.handleDigitalTestSubmit());
    this.elements.digitalTestInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.handleDigitalTestSubmit();
    });

    this.elements.btnPaperReveal.addEventListener("click", () => {
      const q = this.spellingEngine.revealTestWord();
      if (q) {
        this.elements.paperRevealedWord.textContent = q.targetWord.toUpperCase();
        this.elements.paperRevealedWord.style.display = "block";
      }
    });
    this.elements.btnPaperCorrect.addEventListener("click", () => this.handlePaperTestResult(true));
    this.elements.btnPaperRetry.addEventListener("click", () => this.handlePaperTestResult(false));

    // Game Mode Controls
    this.elements.btnSpeakWord.addEventListener("click", () => {
      const q = this.spellingEngine.getCurrentGameQuestion();
      if (q) playAudioFile(q.audio, q.targetWord);
    });
    this.elements.btnClearSpelling.addEventListener("click", () => {
      this.selectedLetterTiles = [];
      this.renderSpellingTiles();
    });
    this.elements.btnSubmitSpelling.addEventListener("click", () => this.handleSpellingGameSubmit());

    // Victory Modal
    this.elements.btnVictoryContinue.addEventListener("click", () => {
      this.elements.victoryModal.classList.remove("active");
      this.showScreen("pokedex");
    });
  }

  checkOnboarding() {
    if (!this.player) {
      this.elements.onboardingModal.classList.add("active");
    }
  }

  completeOnboarding() {
    const name = this.elements.onboardingNameInput.value.trim() || "Lucky";
    const activeStarter = document.querySelector(".starter-pet-btn.active");
    const starterId = activeStarter ? activeStarter.dataset.starter : "embercub";

    const starterPetMap = {
      embercub: "embercub",
      aquafox: "leafpup",
      leafpup: "glowmoth"
    };

    const initialPetId = starterPetMap[starterId] || "embercub";

    this.player = {
      name,
      starter: starterId,
      spellingStars: 0,
      createdAt: Date.now()
    };

    if (this.collection.length === 0) {
      this.collection = [{ id: initialPetId, shiny: false, level: 1 }];
      this.saveCollection();
    }

    this.savePlayer();
    this.elements.onboardingModal.classList.remove("active");
  }

  renderHeader() {
    if (this.elements.headerPlayerName) {
      this.elements.headerPlayerName.textContent = this.player ? this.player.name : "Lucky";
    }

    let mathStars = 0;
    if (this.progression && this.progression.levels) {
      Object.values(this.progression.levels).forEach(lvl => {
        mathStars += (lvl.stars || 0);
      });
    }
    const totalStars = mathStars + (this.player ? (this.player.spellingStars || 0) : 0);
    this.elements.totalStarsCount.textContent = totalStars;

    if (this.elements.petsCollectedCount) {
      this.elements.petsCollectedCount.textContent = `${this.collection.length} / ${CHARACTERS.length} Pets`;
    }
  }

  showScreen(screenKey) {
    Object.values(this.elements.screens).forEach(s => s.classList.remove("active"));
    Object.values(this.elements.navBtns).forEach(b => b.classList.remove("active"));

    if (this.elements.screens[screenKey]) {
      this.elements.screens[screenKey].classList.add("active");
    }
    if (this.elements.navBtns[screenKey]) {
      this.elements.navBtns[screenKey].classList.add("active");
    }

    if (screenKey === "pokedex") {
      this.renderPokedex();
    }
  }

  // --- MATH REALM CONTROLLER ---
  startMathRealm() {
    this.showScreen("math");
    this.startMathLevelSession(LEVELS[0]);
  }

  startMathLevelSession(level) {
    this.currentMathLevel = level;
    const plan = buildLevelSessionPlan(level, {}, this.settings);
    this.mathSession = createLevelSession(level.id, plan.questions, this.settings);

    const resident = getCharacterById(level.residentId.replace("res_", ""));
    const monsterName = resident ? resident.name : `Level ${level.table} Monster`;
    this.elements.mathMonsterName.textContent = monsterName;
    if (resident) {
      this.elements.mathMonsterImg.src = resident.art.src;
    }

    this.renderMathQuestion();
  }

  startMathMixSession() {
    const unlockedTables = [6, 7, 8, 9, 10];
    const plan = buildMixSessionPlan(unlockedTables, {}, this.settings);
    this.mathSession = createLevelSession("mix", plan.questions, this.settings);

    this.elements.mathMonsterName.textContent = "🔥 Ultimate Mix Monster";
    this.elements.mathMonsterImg.src = "pokemon/pikachu.png";
    this.renderMathQuestion();
  }

  renderMathQuestion() {
    if (!this.mathSession || this.mathSession.finished) {
      this.finishMathSession();
      return;
    }

    const q = currentQuestion(this.mathSession);
    if (!q) {
      this.finishMathSession();
      return;
    }

    const total = this.settings.warmupCount + this.settings.scoredCount;
    const currentNum = this.mathSession.history.length + 1;
    this.elements.mathQuestionProgress.textContent = `Question ${Math.min(currentNum, total)} of ${total}`;

    // Silhouette opacity reveal
    const revealOpacity = 0.2 + (this.mathSession.reveal / 8) * 0.8;
    this.elements.mathMonsterImg.style.opacity = Math.min(1, revealOpacity);

    if (q.type === "missing") {
      this.elements.mathQuestionText.textContent = `${q.a} × ? = ${q.a * q.b}`;
    } else {
      this.elements.mathQuestionText.textContent = `${q.a} × ${q.b} = ?`;
    }

    this.elements.mathFeedbackText.innerHTML = "&nbsp;";
    this.elements.mathFeedbackText.classList.remove("wrong");

    const choices = buildChoices(q);
    this.elements.mathAnswersGrid.innerHTML = "";
    choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = choice.value;
      btn.addEventListener("click", () => this.handleMathAnswer(choice.value, q));
      this.elements.mathAnswersGrid.appendChild(btn);
    });
  }

  handleMathAnswer(value, question) {
    const correctVal = computeAnswer(question);
    const isCorrect = value === correctVal;

    if (isCorrect) {
      speakPraise();
      this.elements.mathFeedbackText.textContent = "Correct! ⭐";
      this.elements.mathFeedbackText.classList.remove("wrong");

      if (this.mathSession.pendingCorrection) {
        this.mathSession = confirmCorrection(this.mathSession);
      } else {
        this.mathSession = answerFirstTry(this.mathSession, value, 1000);
      }

      setTimeout(() => this.renderMathQuestion(), 800);
    } else {
      // Wrong answer No-Lose Loop: highlight correct answer, recite full fact, requeue 2-3 steps
      speakMathFact(question.a, question.b);
      this.elements.mathFeedbackText.textContent = `Fact: ${question.a} × ${question.b} = ${question.a * question.b}`;
      this.elements.mathFeedbackText.classList.add("wrong");

      const buttons = this.elements.mathAnswersGrid.querySelectorAll(".answer-btn");
      buttons.forEach(b => {
        if (Number(b.textContent) === correctVal) {
          b.style.background = "#2ed573";
          b.style.borderColor = "#2ed573";
        } else if (Number(b.textContent) === value) {
          b.style.background = "#ff4757";
        }
      });

      if (!this.mathSession.pendingCorrection) {
        this.mathSession = answerFirstTry(this.mathSession, value, 1000);
      }
    }
  }

  finishMathSession() {
    const outcome = computeLevelOutcome(this.mathSession, this.settings);
    outcome.outcomeId = `out_${Date.now()}`;
    outcome.levelId = this.mathSession.levelId;
    outcome.createdAt = new Date().toISOString();

    this.progression = applyLevelOutcome(this.progression, outcome, LEVELS);
    this.saveProgression();

    if (outcome.earnsReward) {
      const pool = getPoolById(this.currentMathLevel.rewardPoolId) || REWARD_POOLS[0];
      const reward = chooseReward(pool, this.collection, REWARD_POOLS);
      const applyRes = applyReward(this.collection, reward, outcome.outcomeId);
      this.collection = applyRes.collection;
      this.saveCollection();

      const pet = getCharacterById(reward.characterId);
      this.showVictoryModal("MATH DUEL VICTORY!", `You earned ${outcome.stars} Stars!`, pet);
    } else {
      this.showVictoryModal("LEVEL COMPLETE!", `You scored ${outcome.points} points. Keep practicing!`, null);
    }

    this.renderHeader();
  }

  // --- WORD REALM CONTROLLER ---
  startWordRealm() {
    this.showScreen("word");
    this.switchSpellingMode("learn");
  }

  switchSpellingMode(mode) {
    this.spellingEngine.setMode(mode);

    this.elements.spellingLearnContainer.style.display = mode === "learn" ? "block" : "none";
    this.elements.spellingTestContainer.style.display = mode === "test" ? "block" : "none";
    this.elements.spellingGameContainer.style.display = mode === "game" ? "block" : "none";

    if (mode === "learn") {
      this.renderSpellingLearn();
    } else if (mode === "test") {
      this.renderSpellingTest();
    } else if (mode === "game") {
      this.renderSpellingGame();
    }
  }

  // Learn Mode Presenter
  renderSpellingLearn() {
    const item = this.spellingEngine.getCurrentLearnItem();
    if (!item) return;

    this.elements.learnProgressText.textContent = `Word ${item.index + 1} of ${item.total}`;
    this.elements.learnWordDisplay.textContent = item.word;
    this.elements.learnDefinition.textContent = item.definition;

    if (item.image) {
      this.elements.learnImage.src = item.image;
      this.elements.learnImage.style.display = "block";
    } else {
      this.elements.learnImage.style.display = "none";
    }

    playAudioFile(item.audio, item.word);
  }

  // Test Mode Presenter
  switchTestSubmode(submode) {
    this.spellingEngine.testSubMode = submode;
    this.elements.btnSubmodeDigital.classList.toggle("active", submode === "digital");
    this.elements.btnSubmodePaper.classList.toggle("active", submode === "paper");

    this.elements.digitalTestBox.style.display = submode === "digital" ? "block" : "none";
    this.elements.paperTestBox.style.display = submode === "paper" ? "block" : "none";

    this.renderSpellingTest();
  }

  renderSpellingTest() {
    const q = this.spellingEngine.getCurrentTestQuestion();
    if (!q) {
      this.finishSpellingSession();
      return;
    }

    this.elements.testQuestionProgress.textContent = `Word ${q.index + 1} of ${q.totalQuestions}`;
    this.elements.testWordHint.textContent = `Hint: "${q.hint || q.definition}"`;
    this.elements.digitalTestInput.value = "";
    this.elements.digitalFeedbackText.innerHTML = "&nbsp;";
    this.elements.digitalFeedbackText.classList.remove("wrong");

    this.elements.paperRevealedWord.style.display = "none";

    playAudioFile(q.audio, q.targetWord);
  }

  handleDigitalTestSubmit() {
    const input = this.elements.digitalTestInput.value;
    const res = this.spellingEngine.submitDigitalAnswer(input);

    if (res.isCorrect) {
      speakPraise();
      this.elements.digitalFeedbackText.textContent = "Correct! ⭐";
      this.elements.digitalFeedbackText.classList.remove("wrong");
      setTimeout(() => {
        if (res.isFinished) this.finishSpellingSession();
        else this.renderSpellingTest();
      }, 800);
    } else {
      const q = this.spellingEngine.getCurrentTestQuestion();
      if (q) playAudioFile(q.audio, q.targetWord);
      this.elements.digitalFeedbackText.textContent = `Requeued! Target word: ${q ? q.targetWord : ""}`;
      this.elements.digitalFeedbackText.classList.add("wrong");
      setTimeout(() => this.renderSpellingTest(), 1400);
    }
  }

  handlePaperTestResult(isCorrect) {
    if (isCorrect) {
      speakPraise();
      this.spellingEngine.score += 10;
    }
    this.spellingEngine.currentIndex += 1;
    if (this.spellingEngine.currentIndex >= this.spellingEngine.deck.words.length) {
      this.finishSpellingSession();
    } else {
      this.renderSpellingTest();
    }
  }

  // Game Mode Presenter (Letter Tiles Battle)
  renderSpellingGame() {
    const q = this.spellingEngine.getCurrentGameQuestion();
    if (!q) {
      this.finishSpellingSession();
      return;
    }

    this.elements.wordQuestionProgress.textContent = `Word ${q.questionNumber} of ${q.totalQuestions}`;
    this.elements.wordHintText.textContent = `"${q.hint || q.definition}"`;

    this.selectedLetterTiles = [];
    this.renderSpellingTiles();

    // Render Tiles Bank
    this.elements.letterTilesBank.innerHTML = "";
    q.tiles.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "tile-btn";
      btn.textContent = letter;
      btn.addEventListener("click", () => {
        this.selectedLetterTiles.push(letter);
        this.renderSpellingTiles();
      });
      this.elements.letterTilesBank.appendChild(btn);
    });

    playAudioFile(q.audio, q.targetWord);
  }

  renderSpellingTiles() {
    this.elements.wordSlotsRow.innerHTML = "";
    if (this.selectedLetterTiles.length === 0) {
      const slot = document.createElement("span");
      slot.className = "letter-slot empty";
      slot.textContent = "_";
      this.elements.wordSlotsRow.appendChild(slot);
      return;
    }

    this.selectedLetterTiles.forEach(char => {
      const slot = document.createElement("span");
      slot.className = "letter-slot";
      slot.textContent = char;
      this.elements.wordSlotsRow.appendChild(slot);
    });
  }

  handleSpellingGameSubmit() {
    const wordInput = this.selectedLetterTiles.join("");
    const res = this.spellingEngine.submitGameAnswer(wordInput);

    if (res.isCorrect) {
      speakPraise();
      this.elements.wordFeedbackText.textContent = "Direct hit! 💥";
      this.elements.wordFeedbackText.classList.remove("wrong");

      const hpPercent = (res.monsterHp / res.monsterMaxHp) * 100;
      this.elements.wordMonsterHpBar.style.width = `${hpPercent}%`;

      setTimeout(() => {
        if (res.isFinished) this.finishSpellingSession();
        else this.renderSpellingGame();
      }, 800);
    } else {
      const q = this.spellingEngine.getCurrentGameQuestion();
      if (q) playAudioFile(q.audio, q.targetWord);
      this.elements.wordFeedbackText.textContent = `Wrong tiles! Word: ${q ? q.targetWord : ""}`;
      this.elements.wordFeedbackText.classList.add("wrong");
      this.selectedLetterTiles = [];
      setTimeout(() => this.renderSpellingGame(), 1400);
    }
  }

  finishSpellingSession() {
    const stars = this.spellingEngine.stars || 3;
    if (this.player) {
      this.player.spellingStars = (this.player.spellingStars || 0) + stars;
      this.savePlayer();
    }

    // Award pet reward
    const pool = REWARD_POOLS[0];
    const reward = chooseReward(pool, this.collection, REWARD_POOLS);
    const applyRes = applyReward(this.collection, reward, `spelling_${Date.now()}`);
    this.collection = applyRes.collection;
    this.saveCollection();

    const pet = getCharacterById(reward.characterId);
    this.showVictoryModal("SPELLING BEE VICTORY!", `Page 22 Mastered! Earned ${stars} Stars!`, pet);
    this.renderHeader();
  }

  // --- UNIFIED POKÉDEX PRESENTER ---
  renderPokedex() {
    this.elements.pokedexGrid.innerHTML = "";
    const ownedMap = new Map(this.collection.map(item => [item.id, item]));

    CHARACTERS.forEach(char => {
      const isOwned = ownedMap.has(char.id);
      const ownedData = ownedMap.get(char.id);

      const card = document.createElement("article");
      card.className = `pet-card ${isOwned ? "" : "locked"}`;

      const levelBadge = isOwned ? `<span style="position: absolute; top: 10px; right: 10px; background: var(--grad-primary); padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">Lv. ${ownedData.level || 1}</span>` : "";
      const shinyBadge = isOwned && ownedData.shiny ? `<span style="position: absolute; top: 10px; left: 10px; font-size: 16px;">✨</span>` : "";

      card.innerHTML = `
        ${levelBadge}
        ${shinyBadge}
        <img class="pet-img" src="${char.art.src}" alt="${char.name}">
        <div class="pet-name">${char.name}</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${isOwned ? "Rescued & Leveling" : "Locked in Realm"}</div>
      `;

      this.elements.pokedexGrid.appendChild(card);
    });
  }

  showVictoryModal(title, subtitle, pet) {
    this.elements.victoryTitle.textContent = title;
    this.elements.victorySubtitle.textContent = subtitle;

    if (pet) {
      this.elements.rewardPetImg.src = pet.art.src;
      this.elements.rewardPetName.textContent = `${pet.name} Rescued!`;
    } else {
      this.elements.rewardPetImg.src = "pokemon/pikachu.png";
      this.elements.rewardPetName.textContent = "Great Progress!";
    }

    this.elements.victoryModal.classList.add("active");
  }
}

// Bootstrap app on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
