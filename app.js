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
} from "./engine/math-engine.js?v=v1.4.0";

import { SpellingEngine } from "./engine/spelling-engine.js?v=v1.4.0";

import {
  normalizeStoredState,
  computeLevelOutcome,
  applyLevelOutcome
} from "./engine/progression.js?v=v1.4.0";

import {
  chooseReward,
  chooseMixReward,
  applyReward,
  normalizeCollection
} from "./engine/reward-engine.js?v=v1.4.0";

import { ShareController } from "./engine/share-controller.js?v=v1.4.0";
import { NarrativeEngine } from "./engine/narrative-engine.js?v=v1.4.0";

import { LEVELS } from "./content/levels.js?v=v1.4.0";
import {
  PAGE_22_LESSON,
  SCHWA_ER_LESSON,
  SPELLING_LESSONS,
  getSpellingLesson,
  getSelectedSpellingLessonId,
  setSelectedSpellingLessonId,
  PAGE_22_DECK,
  SPELLING_DECKS,
  getDeckById
} from "./content/spelling-catalog.js?v=v1.4.0";
import { CHARACTERS, COLLECTIBLE_CHARACTERS, getCharacterById } from "./content/characters.js?v=v1.4.0";
import { REWARD_POOLS, getPoolById } from "./content/reward-pools.js?v=v1.4.0";
import { ThemeManager } from "./content/themes.js?v=v1.4.0";
import { COMIC_CHARACTERS } from "./content/comic-characters.js?v=v1.4.0";
import { NARRATIVE_THEMES } from "./content/narrative-themes.js?v=v1.4.0";
import { ClientTelemetry } from "./telemetry.js?v=v1.4.0";
import { APP_VERSION, BUILD_TIMESTAMP, formatBuildLabel } from "./build-info.js?v=v1.4.0";

export { APP_VERSION, BUILD_TIMESTAMP };

// --- GLOBAL AUDIO & TTS CONTROLLER ---
let currentAudio = null;
let currentSynthUtterance = null;

function stopSpeechAndAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentSynthUtterance = null;
  }
}

function speakText(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    ClientTelemetry.emit("audio.failed", { reason: "speech-synthesis-unavailable", audio_kind: "tts" });
    ClientTelemetry.actionFailed("speech-synthesis-unavailable");
    return;
  }
  stopSpeechAndAudio();

  try {
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    currentSynthUtterance = u;
    window.speechSynthesis.speak(u);
    ClientTelemetry.transition("audio", "requested", "tts-started", { audio_kind: "tts" });
  } catch (e) {
    console.warn("TTS fail:", e);
    ClientTelemetry.emit("audio.failed", { reason: "speech-synthesis-error", audio_kind: "tts" });
    ClientTelemetry.actionFailed("speech-synthesis-error");
  }
}

function playAudioFile(audioPath, fallbackText) {
  stopSpeechAndAudio();

  if (!audioPath) {
    if (fallbackText) speakText(fallbackText);
    else ClientTelemetry.actionNoop("missing-audio-path");
    return;
  }

  try {
    const a = new Audio(audioPath);
    currentAudio = a;
    ClientTelemetry.emit("audio.requested", {
      audio_kind: "file",
      resource_path: String(audioPath).split("?")[0]
    });
    a.addEventListener("playing", () => {
      ClientTelemetry.transition("audio", "requested", "playing", { audio_kind: "file" });
    }, { once: true });
    a.addEventListener("error", () => {
      ClientTelemetry.emit("resource.failed", {
        resource_kind: "audio",
        resource_path: String(audioPath).split("?")[0]
      });
      ClientTelemetry.actionFailed("audio-load-failed");
    }, { once: true });
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio file play failed, fallback to TTS:", err);
        ClientTelemetry.emit("audio.failed", { reason: "play-promise-rejected", audio_kind: "file" });
        if (fallbackText) speakText(fallbackText);
        else ClientTelemetry.actionFailed("audio-play-failed");
      });
    }
  } catch (e) {
    ClientTelemetry.emit("audio.failed", { reason: "audio-construction-error", audio_kind: "file" });
    if (fallbackText) speakText(fallbackText);
    else ClientTelemetry.actionFailed("audio-construction-error");
  }
}

function playEffectSound(effectName) {
  // Decorative sound effects helper
  stopSpeechAndAudio();
}

function numberToWord(n) {
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
                 "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
  if (n >= 0 && n <= 20) return words[n];
  if (n < 100) {
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r === 0 ? tens[t] : `${tens[t]} ${words[r]}`;
  }
  return n.toString();
}

export function getCharacterImgSrc(pres, defaultChar) {
  if (pres) {
    if (pres.image) return pres.image;
    if (pres.assetPath) return pres.assetPath;
    if (pres.art && pres.art.src) return pres.art.src;
  }
  if (defaultChar) {
    if (defaultChar.image) return defaultChar.image;
    if (defaultChar.assetPath) return defaultChar.assetPath;
    if (defaultChar.art && defaultChar.art.src) return defaultChar.art.src;
    if (defaultChar.pokemon) return `pokemon/${defaultChar.pokemon}.png`;
  }
  return "pokemon/pikachu.png";
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

export class AppController {
  constructor() {
    this.player = this.loadPlayer();
    this.progression = this.loadProgression();
    this.collection = this.loadCollection();
    this.settings = DEFAULT_SETTINGS;
    this.parentPin = localStorage.getItem(STORAGE_KEYS.PARENT_PIN) || "1234";

    this.selectedLessonId = getSelectedSpellingLessonId();
    const activeLesson = getSpellingLesson(this.selectedLessonId);
    this.spellingEngine = new SpellingEngine(activeLesson, "learn");
    this.mathSession = null;
    this.currentMathLevel = LEVELS[0];
    this.selectedLetterTiles = [];

    this.lastRescuedCharacterId = null;
    this.lastNarrativeEvent = null;
    this.toastCampaignKey = "comic-quest-v19";
    this.isLatestVersion = true;

    this.initDOM();
    this.bindEvents();
    this.checkOnboarding();
    this.renderHeader();
  }

  loadPlayer() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER));
    } catch {
      return null;
    }
  }

  savePlayer(playerObj) {
    this.player = playerObj;
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(playerObj));
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
      welcomeGreetingTitle: document.getElementById("welcome-greeting-title"),
      btnShareLine: document.getElementById("btn-share-line"),
      btnParentModeHeader: document.getElementById("btn-parent-mode-header"),
      appVersionBadge: document.getElementById("app-version-badge"),

      // Toast Banner
      toastVersionUpdate: document.getElementById("toast-version-update"),
      btnToastTryVersion: document.getElementById("btn-toast-try-version") || document.getElementById("btn-toast-try-comic"),
      btnToastClose: document.getElementById("btn-toast-close"),

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
      wordRealmTitle: document.getElementById("word-realm-title"),
      spellingLessonGrid: document.getElementById("spelling-lesson-grid"),
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
      btnTellMeMore: document.getElementById("btn-tell-me-more"),
      btnLearnPrev: document.getElementById("btn-learn-prev"),
      btnLearnNext: document.getElementById("btn-learn-next"),

      // Tell Me More Modal Elements
      modalTellMeMore: document.getElementById("modal-tell-me-more"),
      tellMeMoreWord: document.getElementById("tell-me-more-word"),
      tellMeMoreImg: document.getElementById("tell-me-more-img"),
      tellMeMoreShortDef: document.getElementById("tell-me-more-short-def"),
      tellMeMoreExplanation: document.getElementById("tell-me-more-explanation"),
      tellMeMoreExample: document.getElementById("tell-me-more-example"),
      btnTellMeMoreAudio: document.getElementById("btn-tell-me-more-audio"),
      btnCloseTellMeMore: document.getElementById("btn-close-tell-me-more"),
      btnCloseTellMeMoreX: document.getElementById("btn-close-tell-me-more-x"),

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
      btnTestPrev: document.getElementById("btn-test-prev"),

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
      btnGamePrev: document.getElementById("btn-game-prev"),

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

    if (document.getElementById("modal-app-version")) {
      document.getElementById("modal-app-version").textContent = APP_VERSION;
    }
    if (document.getElementById("diag-build-version")) {
      document.getElementById("diag-build-version").textContent = formatBuildLabel();
    }
  }

  bindEvents() {
    const bindTouchClick = (element, handler) => {
      if (!element) return;
      let handled = false;
      const execute = (e) => {
        if (handled) return;
        handled = true;
        setTimeout(() => { handled = false; }, 350);
        if (e && typeof e.stopPropagation === "function") {
          e.stopPropagation();
        }
        handler(e);
      };

      element.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch" || e.pointerType === "pen") {
          execute(e);
        }
      }, { passive: true });
      element.addEventListener("click", execute);
    };

    // Global Event Delegate & Modal Backdrop Click Handler
    if (typeof document !== "undefined") {
      document.addEventListener("click", (e) => {
        if (e.target && e.target.classList && e.target.classList.contains("modal-overlay")) {
          this.closeModal(e.target);
          return;
        }

        const btn = e.target.closest("button, .realm-action-btn, .chip-btn, .answer-btn, .tile-btn, .nav-item, .back-btn, .header-action-btn");
        if (!btn) return;

        const id = btn.id;
        if (id === "btn-enter-math") this.startMathRealm();
        else if (id === "btn-enter-word") this.startWordRealm();
        else if (id === "btn-enter-pokedex") this.showScreen("pokedex");
        else if (id === "btn-back-from-math" || id === "btn-back-from-word" || id === "btn-back-from-pokedex" || id === "brand-logo-btn") this.showScreen("dashboard");
        else if (id === "nav-btn-hub") this.showScreen("dashboard");
        else if (id === "nav-btn-math") this.startMathRealm();
        else if (id === "nav-btn-word") this.startWordRealm();
        else if (id === "nav-btn-pokedex") this.showScreen("pokedex");
        else if (id === "btn-parent-mode-header") this.openParentGate();
        else if (id === "btn-show-qr-header" || id === "btn-show-qr-victory") this.openQrModal();
      });
    }

    // Toast Banner Listeners (Generic Version Update Announcement - No PIN required)
    if (this.elements.btnToastClose) {
      bindTouchClick(this.elements.btnToastClose, () => {
        localStorage.setItem("lucky_release_toast_dismissed", APP_VERSION);
        if (this.elements.toastVersionUpdate) {
          this.elements.toastVersionUpdate.style.display = "none";
        }
      });
    }

    if (this.elements.btnToastTryVersion) {
      bindTouchClick(this.elements.btnToastTryVersion, () => {
        localStorage.setItem("lucky_release_toast_dismissed", APP_VERSION);
        if (this.elements.toastVersionUpdate) {
          this.elements.toastVersionUpdate.style.display = "none";
        }
        if (typeof window !== "undefined" && window.NEW_VERSION_URL) {
          window.location.href = window.NEW_VERSION_URL;
        } else if (typeof window !== "undefined") {
          window.location.href = "./v2/";
        }
      });
    }

    const btnSwitchV1 = document.getElementById("btn-switch-to-v1");
    if (btnSwitchV1) {
      bindTouchClick(btnSwitchV1, () => {
        window.location.href = "./v1/";
      });
    }

    // Nav bar
    Object.entries(this.elements.navBtns).forEach(([screenKey, btn]) => {
      bindTouchClick(btn, () => this.showScreen(screenKey));
    });

    // Dashboard Realm Buttons
    bindTouchClick(this.elements.btnEnterMath, () => this.startMathRealm());
    bindTouchClick(this.elements.btnEnterWord, () => this.startWordRealm());
    bindTouchClick(this.elements.btnEnterPokedex, () => this.showScreen("pokedex"));

    // Back Buttons
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

    // Theme Radio Controls
    const optionPokemon = document.getElementById("theme-option-pokemon");
    const optionComic = document.getElementById("theme-option-comic");
    const radioPokemon = document.getElementById("radio-theme-pokemon");
    const radioComic = document.getElementById("radio-theme-comic");

    const selectTheme = (themeId) => {
      ThemeManager.setTheme(themeId);
      this.syncParentThemeRadioUi(themeId);
    };

    if (optionPokemon) optionPokemon.addEventListener("click", () => selectTheme("pokemon"));
    if (optionComic) optionComic.addEventListener("click", () => selectTheme("comic"));
    if (radioPokemon) radioPokemon.addEventListener("change", () => selectTheme("pokemon"));
    if (radioComic) radioComic.addEventListener("change", () => selectTheme("comic"));

    this.syncParentThemeRadioUi();

    if (typeof window !== "undefined") {
      window.addEventListener("lucky:themechanged", (e) => {
        this.refreshThemePresentation();
      });
    }

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
    const attachQrListener = (btn) => {
      if (!btn) return;
      bindTouchClick(btn, (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.openQrModal();
      });
    };

    attachQrListener(this.elements.btnShowQrHeader || document.getElementById("btn-show-qr-header"));
    attachQrListener(this.elements.btnShowQrVictory || document.getElementById("btn-show-qr-victory"));

    const closeQrBtn = this.elements.btnCloseQrModal || document.getElementById("btn-close-qr-modal");
    if (closeQrBtn) {
      bindTouchClick(closeQrBtn, () => {
        const modal = this.elements.qrModal || document.getElementById("qr-modal");
        this.closeModal(modal);
      });
    }

    const copyQrBtn = this.elements.btnCopyQrUrl || document.getElementById("btn-copy-qr-url");
    if (copyQrBtn) {
      bindTouchClick(copyQrBtn, () => {
        const input = this.elements.qrModalUrlInput || document.getElementById("qr-modal-url-input");
        if (input && input.value) {
          navigator.clipboard.writeText(input.value).then(() => {
            const orig = copyQrBtn.textContent;
            copyQrBtn.textContent = "Copied! ✓";
            setTimeout(() => { copyQrBtn.textContent = orig; }, 2000);
          }).catch(() => {});
        }
      });
    }

    // Onboarding starters
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

    // Lesson Library Picker Grid
    if (this.elements.spellingLessonGrid) {
      this.elements.spellingLessonGrid.addEventListener("click", (e) => {
        const card = e.target.closest("[data-lesson-id]");
        if (!card) return;
        const lessonId = card.dataset.lessonId;
        this.selectSpellingLesson(lessonId);
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
    bindTouchClick(this.elements.btnTellMeMore, () => {
      const item = this.spellingEngine.getCurrentLearnItem();
      if (item) this.openTellMeMoreModal(item);
    });
    bindTouchClick(this.elements.btnCloseTellMeMore, () => {
      this.closeModal(this.elements.modalTellMeMore);
    });
    bindTouchClick(this.elements.btnCloseTellMeMoreX, () => {
      this.closeModal(this.elements.modalTellMeMore);
    });
    bindTouchClick(this.elements.btnTellMeMoreAudio, () => {
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
    bindTouchClick(this.elements.btnTestPrev, () => {
      this.spellingEngine.prevTest();
      this.renderSpellingTest();
    });

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
    bindTouchClick(this.elements.btnGamePrev, () => {
      this.spellingEngine.prevGame();
      this.renderSpellingGame();
    });

    // Victory Modal Continue
    bindTouchClick(this.elements.btnVictoryContinue, () => {
      this.closeModal(this.elements.victoryModal);
      this.showScreen("dashboard");
    });
  }

  checkToastBannerVisibility() {
    ClientTelemetry.log("info", "checkToastBannerVisibility evaluated", {
      isLatestVersion: this.isLatestVersion,
      hasToastElement: !!this.elements.toastVersionUpdate,
      pathname: typeof window !== "undefined" ? window.location.pathname : ""
    });
    if (this.isLatestVersion || (typeof window !== "undefined" && window.location.pathname.includes("/v2/"))) {
      if (this.elements.toastVersionUpdate) {
        this.elements.toastVersionUpdate.style.display = "none";
      }
      return;
    }
    const dismissedVer = localStorage.getItem("lucky_release_toast_dismissed");
    const isOnboarded = this.player != null;
    const isDashboard = this.elements.screens.dashboard && this.elements.screens.dashboard.classList.contains("active");
    
    const openModal = Array.from(document.querySelectorAll(".modal-overlay")).find(m => m.style.display === "flex" || (m.classList.contains("active") && m.style.display !== "none"));
    const hasOpenModal = openModal != null;

    if (isOnboarded && isDashboard && !hasOpenModal && dismissedVer !== APP_VERSION) {
      if (this.elements.toastVersionUpdate) {
        this.elements.toastVersionUpdate.style.display = "flex";
      }
    } else {
      if (this.elements.toastVersionUpdate) {
        this.elements.toastVersionUpdate.style.display = "none";
      }
    }
  }

  refreshThemePresentation() {
    const currentTheme = ThemeManager.getTheme();
    this.syncParentThemeRadioUi(currentTheme);
    this.renderHeader();

    // Refresh active Math monster image
    if (this.mathSession && this.elements.mathMonsterImg) {
      const charId = this.currentMathLevel ? this.currentMathLevel.characterId : "res_x6";
      const defaultChar = getCharacterById(charId);
      const pres = ThemeManager.getCharacterPresentation(charId, defaultChar);
      if (pres) {
        this.elements.mathMonsterImg.src = getCharacterImgSrc(pres, defaultChar);
        this.elements.mathMonsterImg.alt = pres.name;
        if (this.elements.mathMonsterName) this.elements.mathMonsterName.textContent = pres.name;
      }
    }

    // Refresh active Spelling monster image
    if (this.spellingEngine && this.spellingEngine.mode === "game" && this.elements.wordMonsterImg) {
      const activeWordObj = this.spellingEngine.currentWord();
      const charId = activeWordObj ? activeWordObj.monsterId || "embercub" : "embercub";
      const defaultChar = getCharacterById(charId);
      const pres = ThemeManager.getCharacterPresentation(charId, defaultChar);
      if (pres) {
        this.elements.wordMonsterImg.src = getCharacterImgSrc(pres, defaultChar);
        this.elements.wordMonsterImg.alt = pres.name;
        if (this.elements.wordMonsterName) this.elements.wordMonsterName.textContent = pres.name;
      }
    }

    // Refresh narrative view model if existing
    if (this.lastNarrativeEvent) {
      const vm = NarrativeEngine.resolveViewModel(this.lastNarrativeEvent, currentTheme);
      this.renderNarrativeViewModel(vm);
    }

    // Refresh Pokedex if active
    if (this.elements.screens.pokedex && this.elements.screens.pokedex.classList.contains("active")) {
      this.renderPokedex();
    }

    this.checkToastBannerVisibility();
  }

  emitNarrativeEvent(type, context = {}) {
    const previousType = this.lastNarrativeEvent?.type || "none";
    const event = { type, context };
    this.lastNarrativeEvent = event;
    ClientTelemetry.transition("game-event", previousType, type, {
      event_type: type,
      realm: context.realm,
      mode: context.mode,
      level_id: context.level,
      item_index: context.itemIndex,
      total_items: context.totalItems,
      requeued: Boolean(context.requeued),
      character_id: context.characterId
    });
    const vm = NarrativeEngine.resolveViewModel(event, ThemeManager.getTheme());
    this.renderNarrativeViewModel(vm);
  }

  renderNarrativeViewModel(vm) {
    if (!vm) return;
    let container = document.getElementById("math-narrative-banner") || document.getElementById("word-narrative-banner");

    if (container) {
      container.innerHTML = `
        <div class="narrative-caption narrative-tone-${vm.tone}">${vm.caption}</div>
        <div class="narrative-speech-bubble">${vm.speech}</div>
      `;
      container.style.display = "block";
    }
  }

  checkOnboarding() {
    if (!this.player) {
      this.openModal(this.elements.onboardingModal);
    } else {
      this.closeModal(this.elements.onboardingModal);
    }
    this.checkToastBannerVisibility();
  }

  completeOnboarding() {
    const name = this.elements.onboardingNameInput.value.trim();
    if (!name) {
      alert("Please enter your name!");
      return;
    }

    const activeStarter = document.querySelector(".starter-pet-btn.active");
    const petId = activeStarter ? activeStarter.dataset.starterPet : "embercub";

    this.player = { name, starterPet: petId };
    this.savePlayer(this.player);

    if (this.collection.length === 0) {
      this.collection.push({ id: petId, shiny: false, level: 1 });
      this.saveCollection();
    }

    this.closeModal(this.elements.onboardingModal);
    this.renderHeader();
    this.checkToastBannerVisibility();
  }

  renderHeader() {
    if (!this.player) return;
    this.elements.headerPlayerName.textContent = this.player.name;
    if (this.elements.welcomeGreetingTitle) {
      this.elements.welcomeGreetingTitle.textContent = `Hi, ${this.player.name}! ✨`;
    }

    const charId = this.player.starterPet || "embercub";
    const defaultChar = getCharacterById(charId);
    const pres = ThemeManager.getCharacterPresentation(charId, defaultChar);
    const avatarPath = getCharacterImgSrc(pres, defaultChar);

    this.elements.headerPlayerAvatar.src = avatarPath;

    let stars = 0;
    Object.values(this.progression.starsByLevel || {}).forEach(s => stars += (s || 0));
    this.elements.totalStarsCount.textContent = stars;

    if (this.elements.btnParentModeHeader) {
      this.elements.btnParentModeHeader.title = `Parent Protected Settings (${APP_VERSION})`;
    }
  }

  showScreen(screenKey) {
    const previousScreen = Object.entries(this.elements.screens)
      .find(([, screen]) => screen?.classList.contains("active"))?.[0] || "unknown";
    if (previousScreen === screenKey) {
      ClientTelemetry.actionNoop("already-active");
    }
    Object.entries(this.elements.screens).forEach(([k, screen]) => {
      if (screen) {
        if (k === screenKey) screen.classList.add("active");
        else screen.classList.remove("active");
      }
    });

    Object.entries(this.elements.navBtns).forEach(([k, btn]) => {
      if (btn) {
        const mapped = k === "hub" ? "dashboard" : k;
        if (mapped === screenKey) btn.classList.add("active");
        else btn.classList.remove("active");
      }
    });

    if (screenKey === "pokedex") {
      this.renderPokedex();
    }

    if (previousScreen !== screenKey) {
      ClientTelemetry.transition("screen", previousScreen, screenKey);
    }

    this.checkToastBannerVisibility();
  }

  // --- MATH REALM ---
  startMathRealm() {
    this.showScreen("math");
    this.renderMathChips();
    this.startMathLevelSession(LEVELS[0]);
  }

  renderMathChips() {
    let html = "";
    const starsByLvl = (this.progression && this.progression.starsByLevel) ? this.progression.starsByLevel : {};
    const unlockedIds = (this.progression && this.progression.unlockedLevelIds) ? this.progression.unlockedLevelIds : ["x6"];

    LEVELS.forEach((lvl) => {
      const stars = starsByLvl[lvl.id] || 0;
      const isUnlocked = unlockedIds.includes(lvl.id);
      const starStr = stars > 0 ? "★".repeat(stars) : "";
      const lockStr = isUnlocked ? "" : "🔒 ";
      const activeClass = this.currentMathLevel && this.currentMathLevel.id === lvl.id ? "active" : "";
      const lvlTitle = lvl.title || ("×" + lvl.table);

      html += `<button class="chip-btn ${activeClass}" data-math-level="${lvl.id}" ${!isUnlocked ? 'disabled style="opacity:0.5"' : ""}>
        ${lockStr}${lvlTitle} ${starStr}
      </button>`;
    });

    const isMixUnlocked = unlockedIds.length >= LEVELS.length;
    html += `<button class="chip-btn" data-math-level="mix" ${!isMixUnlocked ? 'disabled style="opacity:0.5"' : ""}>
      ${isMixUnlocked ? "" : "🔒 "}Math Mix (×6–×10)
    </button>`;

    if (this.elements.mathLevelChips) {
      this.elements.mathLevelChips.innerHTML = html;
    }
  }

  startMathLevelSession(level) {
    this.currentMathLevel = level;
    const settings = this.settings || DEFAULT_SETTINGS;
    const factStats = (this.progression && this.progression.factStats) ? this.progression.factStats : {};
    const plan = buildLevelSessionPlan(level, factStats, settings);
    this.mathSession = createLevelSession(level.id, plan.questions, settings);
    this.mathSession.totalQuestions = plan.questions.length;
    this.renderMathChips();
    this.renderMathQuestion();

    this.emitNarrativeEvent("session.started", { realm: "math", level: level.id, totalItems: plan.questions.length });
    this.emitNarrativeEvent("question.presented", { realm: "math", itemIndex: 0, totalItems: plan.questions.length });
  }

  startMathMixSession() {
    this.currentMathLevel = null;
    const settings = this.settings || DEFAULT_SETTINGS;
    const factStats = (this.progression && this.progression.factStats) ? this.progression.factStats : {};
    const plan = buildMixSessionPlan(LEVELS, factStats, settings);
    this.mathSession = createLevelSession("mix", plan.questions, settings);
    this.mathSession.totalQuestions = plan.questions.length;
    this.renderMathChips();
    this.renderMathQuestion();

    this.emitNarrativeEvent("session.started", { realm: "math", level: "mix", totalItems: plan.questions.length });
    this.emitNarrativeEvent("question.presented", { realm: "math", itemIndex: 0, totalItems: plan.questions.length });
  }

  renderMathQuestion() {
    if (!this.mathSession) return;
    const q = currentQuestion(this.mathSession);

    if (!q) {
      this.finishMathSession();
      return;
    }

    const charId = this.currentMathLevel ? this.currentMathLevel.characterId : "res_x6";
    const defaultChar = getCharacterById(charId);
    const pres = ThemeManager.getCharacterPresentation(charId, defaultChar);

    if (pres && this.elements.mathMonsterImg) {
      this.elements.mathMonsterImg.src = getCharacterImgSrc(pres, defaultChar);
      this.elements.mathMonsterImg.alt = pres.name;
    }
    if (pres && this.elements.mathMonsterName) {
      this.elements.mathMonsterName.textContent = pres.name;
    }

    const total = this.mathSession.totalQuestions || 12;
    const curr = Math.min(total, this.mathSession.history ? this.mathSession.history.length + 1 : 1);
    this.elements.mathQuestionProgress.textContent = `Question ${curr} of ${total}`;

    const hpPct = Math.max(0, Math.min(100, Math.round(((total - (curr - 1)) / total) * 100)));
    this.elements.mathMonsterHpBar.style.width = `${hpPct}%`;

    this.elements.mathQuestionText.textContent = q.type === "missing" ? `${q.a} × ? = ${q.a * q.b}` : `${q.a} × ${q.b} = ?`;
    this.elements.mathFeedbackText.textContent = "";

    const choices = buildChoices(q);
    let html = "";
    choices.forEach((c) => {
      html += `<button class="answer-btn" data-math-choice="${c.value}">${c.value}</button>`;
    });

    this.elements.mathAnswersGrid.innerHTML = html;

    const btns = this.elements.mathAnswersGrid.querySelectorAll(".answer-btn");
    btns.forEach(b => {
      b.addEventListener("click", () => {
        const choice = parseInt(b.dataset.mathChoice, 10);
        this.handleMathAnswer(choice);
      });
    });

    const currIdx = this.mathSession.history ? this.mathSession.history.length : 0;
    this.emitNarrativeEvent("question.presented", { realm: "math", itemIndex: currIdx, totalItems: total });
  }

  handleMathAnswer(choice) {
    if (!this.mathSession) return;
    const q = currentQuestion(this.mathSession);
    if (!q) return;

    const correctAnswer = computeAnswer(q);
    const isCorrect = choice === correctAnswer;
    const total = this.mathSession.totalQuestions || 12;
    const currIdx = this.mathSession.history ? this.mathSession.history.length : 0;

    if (isCorrect) {
      this.elements.mathFeedbackText.textContent = "Great job! Correct! ★";
      this.elements.mathFeedbackText.style.color = "var(--color-success)";
      playAudioFile(null, "Great job!");

      this.mathSession = answerFirstTry(this.mathSession);

      if ((currIdx + 1) % 4 === 0) {
        this.emitNarrativeEvent("milestone.reached", { realm: "math", itemIndex: currIdx, totalItems: total });
      } else {
        this.emitNarrativeEvent("answer.correct", { realm: "math", itemIndex: currIdx, totalItems: total });
      }

      setTimeout(() => {
        this.renderMathQuestion();
      }, 800);
    } else {
      this.elements.mathFeedbackText.textContent = `Correction needed! ${q.a} × ${q.b} = ${q.answer}`;
      this.elements.mathFeedbackText.style.color = "var(--color-error)";

      speakText(`${q.a} times ${q.b} equals ${q.answer}`);

      this.emitNarrativeEvent("correction.shown", { realm: "math", requeued: true });

      setTimeout(() => {
        this.mathSession = confirmCorrection(this.mathSession);
        this.emitNarrativeEvent("correction.confirmed", { realm: "math" });
        this.renderMathQuestion();
      }, 1400);
    }
  }

  finishMathSession() {
    if (!this.mathSession) return;

    let reward = null;
    let outcome = null;

    if (this.currentMathLevel) {
      outcome = computeLevelOutcome(this.mathSession, this.currentMathLevel.id, this.settings);
      this.progression = applyLevelOutcome(this.progression, outcome);
      this.saveProgression();

      if (outcome.rewardEligible) {
        const pool = getPoolById(this.currentMathLevel.poolId) || REWARD_POOLS[0];
        reward = chooseReward(pool, this.collection, outcome.outcomeId);
        if (reward) {
          this.collection = applyReward(this.collection, reward);
          this.saveCollection();
        }
      }
    } else {
      reward = chooseMixReward(this.collection, `mix_${Date.now()}`);
      if (reward) {
        this.collection = applyReward(this.collection, reward);
        this.saveCollection();
      }
    }

    this.emitNarrativeEvent("session.completed", { realm: "math" });

    if (reward && reward.character) {
      this.lastRescuedCharacterId = reward.character.id;
      const eventType = reward.variant === "levelup" ? "reward.levelup" : "reward.new";
      this.emitNarrativeEvent(eventType, {
        realm: "math",
        characterId: reward.character.id,
        characterName: reward.character.name,
        level: reward.level || 1
      });
      this.openVictoryModal(reward);
    } else {
      alert("Math Duel Complete! Excellent work!");
      this.showScreen("dashboard");
    }

    this.renderHeader();
  }

  // --- WORD REALM (SPELLING) ---
  startWordRealm() {
    this.showScreen("word");
    this.renderSpellingLessonPicker();
    this.switchSpellingMode("learn");
  }

  selectSpellingLesson(lessonId) {
    const previousLessonId = this.selectedLessonId || "unknown";
    const lesson = getSpellingLesson(lessonId);
    this.selectedLessonId = lesson.id;
    setSelectedSpellingLessonId(lesson.id);
    this.spellingEngine.setLesson(lesson);
    if (previousLessonId === lesson.id) ClientTelemetry.actionNoop("already-active");
    else ClientTelemetry.transition("lesson", previousLessonId, lesson.id, { lesson_id: lesson.id });
    this.renderSpellingLessonPicker();
    this.switchSpellingMode(this.spellingEngine.mode || "learn");
  }

  renderSpellingLessonPicker() {
    if (!this.elements.spellingLessonGrid) return;
    let html = "";
    SPELLING_LESSONS.forEach(lesson => {
      const isSelected = lesson.id === this.selectedLessonId;
      const activeClass = isSelected ? "active" : "";
      const badgeText = isSelected ? "Selected ✓" : "Select ➔";

      html += `<button type="button" class="lesson-card ${activeClass}" data-lesson-id="${lesson.id}">
        <div class="lesson-card-header">
          <span class="lesson-card-topic">${lesson.topic}</span>
          <span class="lesson-card-badge">${badgeText}</span>
        </div>
        <div class="lesson-card-meta">${lesson.pageLabel} • ${lesson.words.length} Words</div>
      </button>`;
    });
    this.elements.spellingLessonGrid.innerHTML = html;

    if (this.elements.wordRealmTitle) {
      const activeLesson = getSpellingLesson(this.selectedLessonId);
      this.elements.wordRealmTitle.textContent = `🔤 Word Realm — ${activeLesson.pageLabel} (${activeLesson.topic})`;
    }
  }

  switchSpellingMode(mode) {
    const previousMode = this.spellingEngine.mode || "unknown";
    this.spellingEngine.setMode(mode);

    if (this.elements.spellingModeChips) {
      this.elements.spellingModeChips.querySelectorAll(".chip-btn").forEach(c => {
        if (c.dataset.spellingMode === mode) c.classList.add("active");
        else c.classList.remove("active");
      });
    }

    this.elements.spellingLearnContainer.style.display = mode === "learn" ? "block" : "none";
    this.elements.spellingTestContainer.style.display = mode === "test" ? "block" : "none";
    this.elements.spellingGameContainer.style.display = mode === "game" ? "block" : "none";

    const totalWords = this.spellingEngine.deck.words ? this.spellingEngine.deck.words.length : 18;
    this.emitNarrativeEvent("session.started", { realm: "spelling", mode, totalItems: totalWords });
    if (previousMode === mode) ClientTelemetry.actionNoop("already-active");
    else ClientTelemetry.transition("mode", previousMode, mode, { mode, total_items: totalWords });

    if (mode === "learn") this.renderSpellingLearn();
    else if (mode === "test") this.renderSpellingTest();
    else if (mode === "game") this.renderSpellingGame();
  }

  renderSpellingLearn() {
    const item = this.spellingEngine.getCurrentLearnItem();
    if (!item) return;

    const totalWords = this.spellingEngine.deck.words ? this.spellingEngine.deck.words.length : 18;
    const previousItemIndex = this.telemetryLearnIndex ?? -1;
    this.telemetryLearnIndex = this.spellingEngine.currentIndex;
    this.elements.learnWordDisplay.textContent = item.word.toUpperCase();
    this.elements.learnProgressText.textContent = `Word ${this.spellingEngine.currentIndex + 1} of ${totalWords}`;
    this.elements.learnImage.src = item.image;
    this.elements.learnImage.alt = item.imageAlt || item.word;
    this.elements.learnDefinition.textContent = item.definition;

    const badgeElem = this.elements.spellingLearnContainer ? this.elements.spellingLearnContainer.querySelector(".realm-badge") : null;
    if (badgeElem) {
      const activeLesson = getSpellingLesson(this.selectedLessonId);
      badgeElem.textContent = `${activeLesson.pageLabel} • ${activeLesson.topic}`;
    }

    const isFirstItem = this.spellingEngine.currentIndex === 0;
    if (this.elements.btnLearnPrev) {
      this.elements.btnLearnPrev.disabled = isFirstItem;
      this.elements.btnLearnPrev.style.opacity = isFirstItem ? "0.35" : "1";
      this.elements.btnLearnPrev.style.pointerEvents = isFirstItem ? "none" : "auto";
    }

    if (previousItemIndex !== this.spellingEngine.currentIndex) {
      ClientTelemetry.transition("item", previousItemIndex, this.spellingEngine.currentIndex, {
        mode: "learn",
        item_index: this.spellingEngine.currentIndex,
        total_items: totalWords,
        lesson_id: this.selectedLessonId
      });
    }

    playAudioFile(item.audio, item.word);
  }

  openTellMeMoreModal(item) {
    console.log("💡 [LLW UI] openTellMeMoreModal requested for item:", item);
    const modalElem = this.elements.modalTellMeMore || document.getElementById("modal-tell-me-more");
    if (!item || !modalElem) {
      console.error("❌ [LLW UI Error] Target item or modal element missing:", { item, modalElem });
      return;
    }

    const wordElem = this.elements.tellMeMoreWord || document.getElementById("tell-me-more-word");
    const imgElem = this.elements.tellMeMoreImg || document.getElementById("tell-me-more-img");
    const shortDefElem = this.elements.tellMeMoreShortDef || document.getElementById("tell-me-more-short-def");
    const expElem = this.elements.tellMeMoreExplanation || document.getElementById("tell-me-more-explanation");
    const exElem = this.elements.tellMeMoreExample || document.getElementById("tell-me-more-example");

    if (wordElem) wordElem.textContent = item.word ? item.word.toUpperCase() : "";
    if (imgElem) {
      imgElem.src = item.image || "";
      imgElem.alt = item.imageAlt || item.word || "";
    }
    if (shortDefElem) shortDefElem.textContent = item.definition || "";
    if (expElem) expElem.textContent = item.extendedExplanation || item.definition || "";
    if (exElem) exElem.textContent = item.exampleSentence ? `"${item.exampleSentence}"` : "";

    console.log("📖 [LLW UI] Populated modal elements for word:", item.word, "extendedExp:", item.extendedExplanation);
    this.openModal(modalElem);
  }

  switchTestSubmode(submode) {
    this.spellingEngine.setTestSubmode(submode);
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

    const totalWords = this.spellingEngine.deck.words ? this.spellingEngine.deck.words.length : 18;
    this.elements.testQuestionProgress.textContent = `Word ${this.spellingEngine.testIndex + 1} of ${totalWords}`;
    this.elements.testWordHint.textContent = `Hint: "${q.definition}"`;
    this.elements.digitalTestInput.value = "";
    this.elements.digitalFeedbackText.textContent = "";
    this.elements.paperRevealedWord.style.display = "none";

    const isFirstTestItem = this.spellingEngine.testIndex === 0;
    if (this.elements.btnTestPrev) {
      this.elements.btnTestPrev.disabled = isFirstTestItem;
      this.elements.btnTestPrev.style.opacity = isFirstTestItem ? "0.35" : "1";
      this.elements.btnTestPrev.style.pointerEvents = isFirstTestItem ? "none" : "auto";
    }

    playAudioFile(q.audio, q.targetWord);
    this.emitNarrativeEvent("question.presented", { realm: "spelling", itemIndex: this.spellingEngine.testIndex, totalItems: totalWords });
  }

  handleDigitalTestSubmit() {
    const inputVal = this.elements.digitalTestInput.value.trim();
    if (!inputVal) return;

    const totalWords = this.spellingEngine.deck.words ? this.spellingEngine.deck.words.length : 18;
    const res = this.spellingEngine.submitDigitalTestAnswer(inputVal);
    if (res.isCorrect) {
      this.elements.digitalFeedbackText.textContent = "Correct! ★";
      this.elements.digitalFeedbackText.style.color = "var(--color-success)";

      if ((this.spellingEngine.testIndex + 1) % 6 === 0) {
        this.emitNarrativeEvent("milestone.reached", { realm: "spelling", itemIndex: this.spellingEngine.testIndex, totalItems: totalWords });
      } else {
        this.emitNarrativeEvent("answer.correct", { realm: "spelling", itemIndex: this.spellingEngine.testIndex, totalItems: totalWords });
      }

      setTimeout(() => {
        this.renderSpellingTest();
      }, 800);
    } else {
      const targetStr = res.targetWord ? res.targetWord.toUpperCase() : "";
      this.elements.digitalFeedbackText.textContent = `Not quite. Correct spelling: ${targetStr}`;
      this.elements.digitalFeedbackText.style.color = "var(--color-error)";

      this.emitNarrativeEvent("answer.incorrect", { realm: "spelling", itemIndex: this.spellingEngine.testIndex, totalItems: totalWords, requeued: true });

      setTimeout(() => {
        this.renderSpellingTest();
      }, 1400);
    }
  }

  handlePaperTestResult(isCorrect) {
    const totalWords = this.spellingEngine.deck.words ? this.spellingEngine.deck.words.length : 18;
    this.spellingEngine.recordPaperTestResult(isCorrect);
    if (isCorrect) {
      this.emitNarrativeEvent("answer.correct", { realm: "spelling", itemIndex: this.spellingEngine.testIndex, totalItems: totalWords });
    } else {
      this.emitNarrativeEvent("answer.incorrect", { realm: "spelling", itemIndex: this.spellingEngine.testIndex, totalItems: totalWords, requeued: true });
    }
    this.renderSpellingTest();
  }

  renderSpellingGame() {
    const q = this.spellingEngine.getCurrentGameQuestion();
    if (!q) {
      this.finishSpellingSession();
      return;
    }

    const charId = q.monsterId || "embercub";
    const defaultChar = getCharacterById(charId);
    const pres = ThemeManager.getCharacterPresentation(charId, defaultChar);

    if (pres && this.elements.wordMonsterImg) {
      this.elements.wordMonsterImg.src = getCharacterImgSrc(pres, defaultChar);
      this.elements.wordMonsterImg.alt = pres.name;
    }
    if (pres && this.elements.wordMonsterName) {
      const activeLesson = getSpellingLesson(this.selectedLessonId);
      this.elements.wordMonsterName.textContent = `${pres.name} (${activeLesson.pageLabel})`;
    }

    const isFirstGameItem = this.spellingEngine.gameIndex === 0;
    if (this.elements.btnGamePrev) {
      this.elements.btnGamePrev.disabled = isFirstGameItem;
      this.elements.btnGamePrev.style.opacity = isFirstGameItem ? "0.35" : "1";
      this.elements.btnGamePrev.style.pointerEvents = isFirstGameItem ? "none" : "auto";
    }

    const totalWords = this.spellingEngine.deck.words ? this.spellingEngine.deck.words.length : 18;
    const curr = Math.min(totalWords, this.spellingEngine.gameIndex + 1);
    this.elements.wordQuestionProgress.textContent = `Monster ${curr} of ${totalWords}`;

    const hpPct = Math.max(0, Math.min(100, Math.round((this.spellingEngine.gameMonsterHp / (this.spellingEngine.monsterMaxHp || 180)) * 100)));
    this.elements.wordMonsterHpBar.style.width = `${hpPct}%`;

    this.elements.wordHintText.textContent = `Hint: "${q.definition}"`;
    this.elements.wordFeedbackText.textContent = "";

    this.selectedLetterTiles = [];
    this.renderSpellingTiles();

    playAudioFile(q.audio, q.targetWord);
    this.emitNarrativeEvent("question.presented", { realm: "spelling", itemIndex: this.spellingEngine.gameIndex, totalItems: 18 });
  }

  renderSpellingTiles() {
    const q = this.spellingEngine.getCurrentGameQuestion();
    if (!q) return;

    let slotsHtml = "";
    for (let i = 0; i < q.targetWord.length; i++) {
      const letter = this.selectedLetterTiles[i] || "";
      slotsHtml += `<div class="letter-slot ${letter ? 'filled' : ''}">${letter.toUpperCase()}</div>`;
    }
    this.elements.wordSlotsRow.innerHTML = slotsHtml;

    let bankHtml = "";
    q.scrambledTiles.forEach((tileObj, idx) => {
      const isUsed = this.selectedLetterTiles.includes(tileObj);
      bankHtml += `<button class="tile-btn" data-tile-idx="${idx}" ${isUsed ? 'disabled style="opacity:0.3"' : ''}>
        ${tileObj.letter.toUpperCase()}
      </button>`;
    });
    this.elements.letterTilesBank.innerHTML = bankHtml;

    const btns = this.elements.letterTilesBank.querySelectorAll(".tile-btn");
    btns.forEach(b => {
      b.addEventListener("click", () => {
        const idx = parseInt(b.dataset.tileIdx, 10);
        const tileObj = q.scrambledTiles[idx];
        if (tileObj && !this.selectedLetterTiles.includes(tileObj)) {
          this.selectedLetterTiles.push(tileObj);
          this.renderSpellingTiles();
        }
      });
    });
  }

  handleSpellingGameSubmit() {
    const q = this.spellingEngine.getCurrentGameQuestion();
    if (!q) return;

    const assembledWord = this.selectedLetterTiles.map(t => t.letter).join("").toLowerCase();
    const res = this.spellingEngine.submitGameWord(assembledWord);

    if (res.isCorrect) {
      this.elements.wordFeedbackText.textContent = "Direct hit on monster! ★";
      this.elements.wordFeedbackText.style.color = "var(--color-success)";

      if ((this.spellingEngine.gameIndex + 1) % 6 === 0) {
        this.emitNarrativeEvent("milestone.reached", { realm: "spelling", itemIndex: this.spellingEngine.gameIndex, totalItems: 18 });
      } else {
        this.emitNarrativeEvent("answer.correct", { realm: "spelling", itemIndex: this.spellingEngine.gameIndex, totalItems: 18 });
      }

      setTimeout(() => {
        this.renderSpellingGame();
      }, 800);
    } else {
      this.elements.wordFeedbackText.textContent = `Try again! Hint: ${q.definition}`;
      this.elements.wordFeedbackText.style.color = "var(--color-error)";

      this.emitNarrativeEvent("answer.incorrect", { realm: "spelling", itemIndex: this.spellingEngine.gameIndex, totalItems: 18, requeued: true });

      setTimeout(() => {
        this.selectedLetterTiles = [];
        this.renderSpellingTiles();
      }, 1000);
    }
  }

  finishSpellingSession() {
    const reward = chooseReward(REWARD_POOLS[0], this.collection, `spelling_${Date.now()}`);
    if (reward) {
      this.collection = applyReward(this.collection, reward);
      this.saveCollection();
    }

    this.emitNarrativeEvent("session.completed", { realm: "spelling" });

    if (reward && reward.character) {
      this.lastRescuedCharacterId = reward.character.id;
      const eventType = reward.variant === "levelup" ? "reward.levelup" : "reward.new";
      this.emitNarrativeEvent(eventType, {
        realm: "spelling",
        characterId: reward.character.id,
        characterName: reward.character.name,
        level: reward.level || 1
      });
      this.openVictoryModal(reward);
    } else {
      alert("Spelling Session Completed! Great job!");
      this.showScreen("dashboard");
    }

    this.renderHeader();
  }

  // --- POKÉDEX VIEW ---
  renderPokedex() {
    if (this.elements.petsCollectedCount) {
      this.elements.petsCollectedCount.textContent = `${this.collection.length} / ${COLLECTIBLE_CHARACTERS.length}`;
    }

    let html = "";
    COLLECTIBLE_CHARACTERS.forEach(char => {
      const ownedItem = this.collection.find(c => c.id === char.id);
      const isOwned = ownedItem != null;
      const pres = ThemeManager.getCharacterPresentation(char.id, char);

      const nameStr = pres ? (pres.name || char.name) : char.name;
      const imgPath = pres ? (pres.image || pres.assetPath || (pres.art && pres.art.src)) : (char.image || (char.art && char.art.src) || (char.pokemon ? `pokemon/${char.pokemon}.png` : ""));
      const levelStr = isOwned ? `Lvl ${ownedItem.level || 1}` : "Locked";

      html += `<div class="pet-card ${isOwned ? 'owned unlocked' : 'locked'}">
        <img class="pet-img" src="${imgPath || `pokemon/${char.pokemon || char.id}.png`}" alt="${nameStr}" />
        <div class="pet-name">${nameStr}</div>
        <div class="pet-level">${levelStr}</div>
      </div>`;
    });

    if (this.elements.pokedexGrid) {
      this.elements.pokedexGrid.innerHTML = html;
    }
  }

  // --- MODALS & PARENT GATE ---
  openModal(modalElem) {
    if (!modalElem) {
      ClientTelemetry.actionFailed("missing-modal");
      return;
    }
    const wasOpen = modalElem.classList.contains("active") || modalElem.style.display === "flex";
    modalElem.style.display = "flex";
    modalElem.classList.add("active");
    if (wasOpen) ClientTelemetry.actionNoop("already-active");
    else ClientTelemetry.transition("modal", "closed", modalElem.id || "modal");
    console.log("✨ [LLW Modal] Modal display set to flex & active:", modalElem.id);
  }

  closeModal(modalElem) {
    if (!modalElem) {
      ClientTelemetry.actionFailed("missing-modal");
      return;
    }
    const wasOpen = modalElem.classList.contains("active") || modalElem.style.display === "flex";
    modalElem.style.display = "none";
    modalElem.classList.remove("active");
    if (wasOpen) ClientTelemetry.transition("modal", modalElem.id || "modal", "closed");
    else ClientTelemetry.actionNoop("already-closed");
    this.checkToastBannerVisibility();
  }

  openParentGate() {
    this.elements.parentGateInput.value = "";
    this.elements.parentGateError.style.display = "none";
    this.openModal(this.elements.parentGateModal);
    setTimeout(() => {
      this.elements.parentGateInput.focus();
    }, 100);
  }

  verifyParentGate() {
    const inputPin = this.elements.parentGateInput.value.trim();
    if (inputPin === this.parentPin) {
      this.closeModal(this.elements.parentGateModal);
      this.openModal(this.elements.parentSettingsModal);
      this.syncParentThemeRadioUi();
    } else {
      ClientTelemetry.actionNoop("invalid-state");
      this.elements.parentGateError.style.display = "block";
      this.elements.parentGateInput.value = "";
    }
  }

  syncParentThemeRadioUi(activeTheme) {
    const currentTheme = activeTheme || ThemeManager.getTheme();
    const radioPokemon = document.getElementById("radio-theme-pokemon");
    const radioComic = document.getElementById("radio-theme-comic");
    const cardPokemon = document.getElementById("theme-option-pokemon");
    const cardComic = document.getElementById("theme-option-comic");

    if (activeTheme) {
      if (radioPokemon) radioPokemon.checked = (currentTheme === "pokemon");
      if (radioComic) radioComic.checked = (currentTheme === "comic");
    } else if (radioComic && radioComic.checked) {
      // Preserve pre-selected radio state from Try CTA click
    } else {
      if (radioPokemon) radioPokemon.checked = (currentTheme === "pokemon");
      if (radioComic) radioComic.checked = (currentTheme === "comic");
    }

    const isComicActive = radioComic ? radioComic.checked : (currentTheme === "comic");
    const isPokemonActive = radioPokemon ? radioPokemon.checked : (currentTheme === "pokemon");

    if (cardPokemon) cardPokemon.classList.toggle("active", isPokemonActive);
    if (cardComic) cardComic.classList.toggle("active", isComicActive);
  }

  openVictoryModal(reward) {
    const char = reward.character || getCharacterById("embercub");
    const pres = ThemeManager.getCharacterPresentation(char.id, char);

    this.elements.victoryTitle.textContent = reward.variant === "levelup" ? "Pet Level Up!" : "New Pet Rescued!";
    this.elements.victorySubtitle.textContent = reward.variant === "levelup"
      ? `${pres.name} powered up to Level ${reward.level}!`
      : `${pres.name} joined your Pet Collection!`;

    this.elements.rewardPetImg.src = pres.image || pres.assetPath || char.image;
    this.elements.rewardPetName.textContent = pres.name;

    this.openModal(this.elements.victoryModal);
  }

  openQrModal() {
    const url = "https://usov-andrey.github.io/lucky-learning-world/";
    this.elements.qrModalUrlInput.value = url;

    ShareController.generateVictoryCardBlob({
      playerName: this.player ? this.player.name : "Lucky",
      themeId: ThemeManager.getTheme(),
      totalStars: parseInt(this.elements.totalStarsCount.textContent, 10) || 0
    }).then(blob => {
      if (blob && this.elements.qrModalCanvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = this.elements.qrModalCanvas.getContext("2d");
          if (ctx) {
            this.elements.qrModalCanvas.width = img.width;
            this.elements.qrModalCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = URL.createObjectURL(blob);
      }
    }).catch(() => {});

    this.openModal(this.elements.qrModal);
  }
}

// Auto-initialize when DOM ready
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.appController = new AppController();
    window.LLW_DEBUG = {
      app: window.appController,
      openTellMeMore: () => {
        const item = window.appController.spellingEngine.getCurrentLearnItem();
        console.log("🛠️ [LLW Debug] Manual trigger openTellMeMore for item:", item);
        window.appController.openTellMeMoreModal(item);
      }
    };
    console.log(`🚀 [LLW System] App initialized successfully! Version: ${APP_VERSION}`);
  });
}
