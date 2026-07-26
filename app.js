/**
 * Lucky's Learning World — Main Application Router & Presenter Orchestrator
 * Connects pure engine modules to UI views with zero-coupling architecture.
 * UI is 100% English for Lucky. Includes Version Badge & Parent Mode Gate.
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
} from "./engine/math-engine.js?v=20260726_v9";

import { SpellingEngine } from "./engine/spelling-engine.js?v=20260726_v9";

import {
  normalizeStoredState,
  computeLevelOutcome,
  applyLevelOutcome
} from "./engine/progression.js?v=20260726_v10";

import {
  chooseReward,
  chooseMixReward,
  applyReward,
  normalizeCollection
} from "./engine/reward-engine.js?v=20260726_v11";

import { ShareController } from "./engine/share-controller.js?v=20260726_v11";

import { LEVELS } from "./content/levels.js?v=20260726_v11";
import { PAGE_22_DECK, SPELLING_DECKS, getDeckById } from "./content/spelling-catalog.js?v=20260726_v11";
import { CHARACTERS, COLLECTIBLE_CHARACTERS, getCharacterById } from "./content/characters.js?v=20260726_v11";
import { REWARD_POOLS, getPoolById } from "./content/reward-pools.js?v=20260726_v11";

const APP_VERSION = "v2.0.0-v11";

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
  SETTINGS: "lmm3s:settings",
  PARENT_PIN: "lucky_parent_pin"
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
    this.parentPin = localStorage.getItem(STORAGE_KEYS.PARENT_PIN) || "1234";

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
      btnParentModeHeader: document.getElementById("btn-parent-mode-header"),
      appVersionBadge: document.getElementById("app-version-badge"),

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

      // Dashboard Cards & Buttons
      cardMathRealm: document.getElementById("card-math-realm"),
      cardWordRealm: document.getElementById("card-word-realm"),
      cardPokedexRealm: document.getElementById("card-pokedex-realm"),
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

      // Parent Gate & Settings Modals
      parentGateModal: document.getElementById("parent-gate-modal"),
      parentGateInput: document.getElementById("parent-gate-input"),
      parentGateError: document.getElementById("parent-gate-error"),
      btnParentGateCancel: document.getElementById("btn-parent-gate-cancel"),
      btnParentGateSubmit: document.getElementById("btn-parent-gate-submit"),

      parentSettingsModal: document.getElementById("parent-settings-modal"),
      btnResetMathProgress: document.getElementById("btn-reset-math-progress"),
      btnResetPokedex: document.getElementById("btn-reset-pokedex"),
      btnResetAll: document.getElementById("btn-reset-all"),
      toggleHardDrill: document.getElementById("toggle-hard-drill"),
      inputNewParentPin: document.getElementById("input-new-parent-pin"),
      btnSaveParentPin: document.getElementById("btn-save-parent-pin"),
      btnCloseParentSettings: document.getElementById("btn-close-parent-settings"),

      // Victory Modal
      victoryModal: document.getElementById("victory-modal"),
      victoryTitle: document.getElementById("victory-title"),
      victorySubtitle: document.getElementById("victory-subtitle"),
      rewardPetImg: document.getElementById("reward-pet-img"),
      rewardPetName: document.getElementById("reward-pet-name"),
      btnShareVictoryCard: document.getElementById("btn-share-victory-card"),
      btnVictoryContinue: document.getElementById("btn-victory-continue"),

      // QR Code Modal & Buttons
      btnShowQrHeader: document.getElementById("btn-show-qr-header"),
      btnShowQrVictory: document.getElementById("btn-show-qr-victory"),
      qrModal: document.getElementById("qr-modal"),
      qrModalCanvas: document.getElementById("qr-modal-canvas"),
      qrModalUrlInput: document.getElementById("qr-modal-url-input"),
      btnCopyQrUrl: document.getElementById("btn-copy-qr-url"),
      btnCloseQrModal: document.getElementById("btn-close-qr-modal")
    };

    if (this.elements.appVersionBadge) {
      this.elements.appVersionBadge.textContent = APP_VERSION;
    }
  }

  bindEvents() {
    // Mobile Touch & Click Unified Handler
    const bindTouchClick = (element, handler) => {
      if (!element) return;
      let lastTime = 0;
      const execute = (e) => {
        const now = Date.now();
        if (now - lastTime < 300) return; // Prevent double trigger
        lastTime = now;
        handler(e);
      };
      element.addEventListener("touchend", execute, { passive: true });
      element.addEventListener("click", execute);
    };

    // Nav bar (mapping 'hub' -> 'dashboard')
    Object.entries(this.elements.navBtns).forEach(([screenKey, btn]) => {
      bindTouchClick(btn, () => this.showScreen(screenKey));
    });

    // Dashboard Realm Buttons (Strict button-only binding for touch scroll safety)
    const enterMath = () => this.startMathRealm();
    const enterWord = () => this.startWordRealm();
    const enterPokedex = () => this.showScreen("pokedex");

    bindTouchClick(this.elements.btnEnterMath, enterMath);
    bindTouchClick(this.elements.btnEnterWord, enterWord);
    bindTouchClick(this.elements.btnEnterPokedex, enterPokedex);

    // Back to Hub Buttons
    bindTouchClick(this.elements.btnBackMath, () => this.showScreen("dashboard"));
    bindTouchClick(this.elements.btnBackWord, () => this.showScreen("dashboard"));
    bindTouchClick(this.elements.btnBackPokedex, () => this.showScreen("dashboard"));
    bindTouchClick(document.getElementById("brand-logo-btn"), () => this.showScreen("dashboard"));

    // Parent Mode Header Trigger
    bindTouchClick(this.elements.btnParentModeHeader, () => this.openParentGate());

    // Parent Gate Controls
    bindTouchClick(this.elements.btnParentGateCancel, () => {
      this.closeModal(this.elements.parentGateModal);
    });
    bindTouchClick(this.elements.btnParentGateSubmit, () => this.verifyParentGate());

    if (this.elements.parentGateInput) {
      this.elements.parentGateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.verifyParentGate();
      });
    }

    // Parent Settings Controls
    bindTouchClick(this.elements.btnCloseParentSettings, () => {
      this.closeModal(this.elements.parentSettingsModal);
    });

    bindTouchClick(this.elements.btnSaveParentPin, () => {
      const newPin = this.elements.inputNewParentPin.value.trim();
      if (newPin.length === 4 && /^\d{4}$/.test(newPin)) {
        this.parentPin = newPin;
        localStorage.setItem(STORAGE_KEYS.PARENT_PIN, newPin);
        alert("Parent PIN updated successfully!");
        this.elements.inputNewParentPin.value = "";
      } else {
        alert("Please enter a valid 4-digit PIN.");
      }
    });

    bindTouchClick(this.elements.btnResetMathProgress, () => {
      if (confirm("Reset all Math levels and star progress?")) {
        this.progression = normalizeStoredState(null, LEVELS);
        this.saveProgression();
        alert("Math progress reset!");
        this.renderHeader();
      }
    });

    bindTouchClick(this.elements.btnResetPokedex, () => {
      if (confirm("Reset Pokédex pet collection?")) {
        this.collection = [{ id: "embercub", shiny: false, level: 1 }];
        this.saveCollection();
        alert("Pokédex reset!");
        this.renderHeader();
      }
    });

    bindTouchClick(this.elements.btnResetAll, () => {
      if (confirm("Reset ALL data (Player name, Math, Spelling, Pokédex)?")) {
        localStorage.removeItem(STORAGE_KEYS.PLAYER);
        localStorage.removeItem(STORAGE_KEYS.MATH_PROGRESSION);
        localStorage.removeItem(STORAGE_KEYS.MATH_COLLECTION);
        this.player = null;
        this.progression = normalizeStoredState(null, LEVELS);
        this.collection = [];
        alert("All data cleared! Onboarding will reappear.");
        location.reload();
      }
    });

    if (this.elements.toggleHardDrill) {
      this.elements.toggleHardDrill.addEventListener("change", (e) => {
        this.settings.hardDrill = e.target.checked;
      });
    }

    // QR Code Modal Bindings
    if (this.elements.btnShowQrHeader) {
      bindTouchClick(this.elements.btnShowQrHeader, () => this.openQrModal());
    }
    if (this.elements.btnShowQrVictory) {
      bindTouchClick(this.elements.btnShowQrVictory, () => this.openQrModal());
    }
    if (this.elements.btnCloseQrModal) {
      bindTouchClick(this.elements.btnCloseQrModal, () => {
        this.closeModal(this.elements.qrModal);
      });
    }
    if (this.elements.btnCopyQrUrl) {
      bindTouchClick(this.elements.btnCopyQrUrl, () => {
        if (this.elements.qrModalUrlInput) {
          navigator.clipboard.writeText(this.elements.qrModalUrlInput.value).then(() => {
            const orig = this.elements.btnCopyQrUrl.textContent;
            this.elements.btnCopyQrUrl.textContent = "Copied! ✓";
            setTimeout(() => { this.elements.btnCopyQrUrl.textContent = orig; }, 2000);
          }).catch(() => {});
        }
      });
    }

    // Onboarding starter buttons
    const starterBtns = document.querySelectorAll(".starter-pet-btn");
    starterBtns.forEach(btn => {
      bindTouchClick(btn, () => {
        starterBtns.forEach(b => {
          b.classList.remove("active");
          b.style.borderColor = "var(--border-glass)";
        });
        btn.classList.add("active");
        btn.style.borderColor = "var(--border-glow)";
      });
    });

    bindTouchClick(this.elements.btnStartOnboarding, () => this.completeOnboarding());

    // Math Level selection
    if (this.elements.mathLevelChips) {
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
    }

    // Spelling Mode Chips
    if (this.elements.spellingModeChips) {
      this.elements.spellingModeChips.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-spelling-mode]");
        if (!chip) return;

        this.elements.spellingModeChips.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");

        const mode = chip.dataset.spellingMode;
        this.switchSpellingMode(mode);
      });
    }

    // Learn Mode Controls
    bindTouchClick(this.elements.btnLearnSpeakWord, () => {
      const item = this.spellingEngine.getCurrentLearnItem();
      if (item) playAudioFile(item.audio, item.word);
    });
    bindTouchClick(this.elements.btnLearnSpeakDef, () => {
      const item = this.spellingEngine.getCurrentLearnItem();
      if (item) playAudioFile(item.definitionAudio, item.definition);
    });
    bindTouchClick(this.elements.btnLearnPrev, () => {
      this.spellingEngine.prevLearn();
      this.renderSpellingLearn();
    });
    bindTouchClick(this.elements.btnLearnNext, () => {
      this.spellingEngine.nextLearn();
      this.renderSpellingLearn();
    });

    // Test Mode Controls
    bindTouchClick(this.elements.btnSubmodeDigital, () => this.switchTestSubmode("digital"));
    bindTouchClick(this.elements.btnSubmodePaper, () => this.switchTestSubmode("paper"));

    bindTouchClick(this.elements.btnTestSpeakWord, () => {
      const q = this.spellingEngine.getCurrentTestQuestion();
      if (q) playAudioFile(q.audio, q.targetWord);
    });

    bindTouchClick(this.elements.btnDigitalSubmit, () => this.handleDigitalTestSubmit());
    if (this.elements.digitalTestInput) {
      this.elements.digitalTestInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.handleDigitalTestSubmit();
      });
    }

    bindTouchClick(this.elements.btnPaperReveal, () => {
      const q = this.spellingEngine.revealTestWord();
      if (q) {
        this.elements.paperRevealedWord.textContent = q.targetWord.toUpperCase();
        this.elements.paperRevealedWord.style.display = "block";
      }
    });
    bindTouchClick(this.elements.btnPaperCorrect, () => this.handlePaperTestResult(true));
    bindTouchClick(this.elements.btnPaperRetry, () => this.handlePaperTestResult(false));

    // Game Mode Controls
    bindTouchClick(this.elements.btnSpeakWord, () => {
      const q = this.spellingEngine.getCurrentGameQuestion();
      if (q) playAudioFile(q.audio, q.targetWord);
    });
    bindTouchClick(this.elements.btnClearSpelling, () => {
      this.selectedLetterTiles = [];
      this.renderSpellingTiles();
    });
    bindTouchClick(this.elements.btnSubmitSpelling, () => this.handleSpellingGameSubmit());

    // Victory Modal
    if (this.elements.btnShareVictoryCard) {
      bindTouchClick(this.elements.btnShareVictoryCard, () => {
        const pet = this.lastRescuedPet || { name: 'Pikachu', art: { src: 'pokemon/pikachu.png' } };
        ShareController.shareVictoryCard({
          playerName: this.player ? this.player.name : 'Lucky',
          score: 3,
          petName: pet.name,
          petImgUrl: pet.art ? pet.art.src : 'pokemon/pikachu.png'
        });
      });
    }

    bindTouchClick(this.elements.btnVictoryContinue, () => {
      this.closeModal(this.elements.victoryModal);
      this.showScreen("pokedex");
    });
  }

  // --- MODAL UTILITIES & SCROLL LOCK ---
  openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add("active");
    document.body.classList.add("modal-open");
  }

  closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove("active");
    const activeModals = document.querySelectorAll(".modal-overlay.active");
    if (activeModals.length === 0) {
      document.body.classList.remove("modal-open");
    }
  }

  // --- PARENT GATE LOGIC ---
  openParentGate() {
    this.elements.parentGateInput.value = "";
    this.elements.parentGateError.style.display = "none";
    this.openModal(this.elements.parentGateModal);
  }

  verifyParentGate() {
    const inputPin = this.elements.parentGateInput.value.trim();
    if (inputPin === this.parentPin) {
      this.closeModal(this.elements.parentGateModal);
      this.openModal(this.elements.parentSettingsModal);
    } else {
      this.elements.parentGateError.style.display = "block";
    }
  }

  checkOnboarding() {
    if (!this.player) {
      this.openModal(this.elements.onboardingModal);
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
    this.closeModal(this.elements.onboardingModal);
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
      this.elements.petsCollectedCount.textContent = `${this.collection.length} / ${COLLECTIBLE_CHARACTERS.length} Pets`;
    }
  }

  showScreen(screenKey) {
    const targetKey = screenKey === "hub" ? "dashboard" : screenKey;

    Object.values(this.elements.screens).forEach(s => s.classList.remove("active"));
    Object.values(this.elements.navBtns).forEach(b => b.classList.remove("active"));

    if (this.elements.screens[targetKey]) {
      this.elements.screens[targetKey].classList.add("active");
    }
    if (this.elements.navBtns[screenKey]) {
      this.elements.navBtns[screenKey].classList.add("active");
    } else if (this.elements.navBtns["hub"]) {
      this.elements.navBtns["hub"].classList.add("active");
    }

    if (targetKey === "pokedex") {
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

    const resident = getCharacterById(level.residentId);
    const monsterName = resident ? resident.name : `Level ${level.table} Monster`;
    this.elements.mathMonsterName.textContent = monsterName;
    if (resident && resident.art && resident.art.src) {
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

    // Disabled Navigation Guard: disable & dim Back button on the very 1st word (author)
    if (this.elements.btnLearnPrev) {
      if (item.index === 0) {
        this.elements.btnLearnPrev.disabled = true;
        this.elements.btnLearnPrev.style.opacity = "0.3";
        this.elements.btnLearnPrev.style.pointerEvents = "none";
      } else {
        this.elements.btnLearnPrev.disabled = false;
        this.elements.btnLearnPrev.style.opacity = "1";
        this.elements.btnLearnPrev.style.pointerEvents = "auto";
      }
    }

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

    // Render ONLY collectible pool characters in Pokédex (15 total)
    COLLECTIBLE_CHARACTERS.forEach(char => {
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

    this.openModal(this.elements.victoryModal);
  }

  openQrModal() {
    if (!this.elements.qrModal) return;
    const pet = this.lastRescuedPet || { name: 'Pikachu' };
    ShareController.renderQrModal(
      this.elements.qrModalCanvas,
      this.elements.qrModalUrlInput,
      {
        playerName: this.player ? this.player.name : 'Lucky',
        score: 3,
        petName: pet.name
      }
    );
    this.openModal(this.elements.qrModal);
  }
}

// Bootstrap app on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
