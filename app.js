/**
 * Lucky's Learning World - Master Game Engine Controller & Router
 * Pure Vanilla ES Module Architecture
 */

import { SpellingEngine } from './engine/spelling-engine.js';
import { SPELLING_DECKS, getDeckById } from './content/spelling-catalog.js';
import { ShareController } from './engine/share-controller.js';

// Storage Keys & Default State
const STORAGE_KEY = 'luckys_learning_world_state';

const PET_ROSTER = [
  { id: 'pikachu', name: 'Pikachu', img: 'pokemon/pikachu.png' },
  { id: 'charmander', name: 'Charmander', img: 'pokemon/charmander.png' },
  { id: 'bulbasaur', name: 'Bulbasaur', img: 'pokemon/bulbasaur.png' },
  { id: 'squirtle', name: 'Squirtle', img: 'pokemon/squirtle.png' },
  { id: 'eevee', name: 'Eevee', img: 'pokemon/eevee.png' },
  { id: 'growlithe', name: 'Growlithe', img: 'pokemon/growlithe.png' },
  { id: 'jolteon', name: 'Jolteon', img: 'pokemon/jolteon.png' },
  { id: 'vaporeon', name: 'Vaporeon', img: 'pokemon/vaporeon.png' },
  { id: 'mew', name: 'Mew', img: 'pokemon/mew.png' },
  { id: 'rowlet', name: 'Rowlet', img: 'pokemon/rowlet.png' },
  { id: 'geodude', name: 'Geodude', img: 'pokemon/geodude.png' },
  { id: 'sylveon', name: 'Sylveon', img: 'pokemon/sylveon.png' }
];

const defaultState = {
  player: {
    name: 'Lucky',
    grade: 'g3',
    stars: 12,
    petsUnlocked: ['pikachu']
  },
  settings: {
    soundEnabled: true,
    ttsSpeed: 1.0
  }
};

class AppController {
  constructor() {
    this.state = this.loadState();
    this.currentView = 'dashboard-view';
    
    // Math Session State
    this.mathState = {
      mode: 'multiplication',
      questions: [],
      currentIdx: 0,
      monsterHp: 100,
      monsterMaxHp: 100,
      currentPet: PET_ROSTER[0]
    };

    // Word Session State
    this.spellingEngine = null;
    this.currentSpellingInput = "";

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
    } catch (e) {
      console.warn('Failed to load state:', e);
      return { ...defaultState };
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  init() {
    console.log("🌟 Initializing Lucky's Learning World Master Controller...");
    this.setupNavigation();
    this.setupModeChips();
    this.setupMathArena();
    this.setupWordArena();
    this.setupVictoryModal();
    this.setupShareHandler();
    this.checkUrlChallenge();
    this.updateHeaderProfile();
    this.renderPokedex();
    this.switchView('dashboard-view');
  }

  setupShareHandler() {
    document.getElementById('btn-share-line')?.addEventListener('click', () => {
      const shareUrl = ShareController.createShareUrl({
        deckId: 'y3-sightwords',
        senderName: this.state.player.name,
        score: this.state.player.stars
      });
      ShareController.shareToLine(shareUrl, `Lucky challenged you to a learning duel!`);
    });
  }

  checkUrlChallenge() {
    const challenge = ShareController.parseUrlChallenge();
    if (challenge && challenge.customWords) {
      console.log('📲 Loaded custom word challenge from URL:', challenge);
      const customDeck = {
        id: 'url-challenge',
        name: `Challenge from ${challenge.senderName}`,
        grade: 'custom',
        words: challenge.customWords
      };
      this.spellingEngine = new SpellingEngine(customDeck);
      this.switchView('word-view');
    }
  }

  updateHeaderProfile() {
    const starsEl = document.getElementById('total-stars-count');
    const petsCountEl = document.getElementById('pets-collected-count');
    
    if (starsEl) starsEl.textContent = this.state.player.stars;
    if (petsCountEl) petsCountEl.textContent = `${this.state.player.petsUnlocked.length} / ${PET_ROSTER.length} Pets`;
  }

  switchView(viewId) {
    const views = document.querySelectorAll('.view-screen');
    views.forEach(view => {
      if (view.id === viewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    this.currentView = viewId;
    this.updateBottomNavState(viewId);

    // Initialize realm session when opening view
    if (viewId === 'math-view') {
      this.startMathSession();
    } else if (viewId === 'word-view') {
      this.startWordSession('g1-sightwords');
    } else if (viewId === 'pokedex-view') {
      this.renderPokedex();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateBottomNavState(viewId) {
    const navButtons = document.querySelectorAll('.bottom-nav .nav-item');
    navButtons.forEach(btn => btn.classList.remove('active'));

    const navMap = {
      'dashboard-view': 'nav-btn-hub',
      'math-view': 'nav-btn-math',
      'word-view': 'nav-btn-word',
      'pokedex-view': 'nav-btn-pokedex',
      'settings-view': 'nav-btn-settings'
    };

    const activeNavId = navMap[viewId];
    if (activeNavId) {
      const activeBtn = document.getElementById(activeNavId);
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

  setupNavigation() {
    // Brand Logo -> Main Hub
    document.getElementById('brand-logo-btn')?.addEventListener('click', () => this.switchView('dashboard-view'));

    // Dashboard Realm Cards
    document.getElementById('btn-enter-math')?.addEventListener('click', () => this.switchView('math-view'));
    document.getElementById('btn-enter-word')?.addEventListener('click', () => this.switchView('word-view'));
    document.getElementById('btn-enter-pokedex')?.addEventListener('click', () => this.switchView('pokedex-view'));

    // Back Buttons
    document.getElementById('btn-back-from-math')?.addEventListener('click', () => this.switchView('dashboard-view'));
    document.getElementById('btn-back-from-word')?.addEventListener('click', () => this.switchView('dashboard-view'));
    document.getElementById('btn-back-from-pokedex')?.addEventListener('click', () => this.switchView('dashboard-view'));
    document.getElementById('btn-back-from-settings')?.addEventListener('click', () => this.switchView('dashboard-view'));

    // Bottom Navigation Bar
    document.getElementById('nav-btn-hub')?.addEventListener('click', () => this.switchView('dashboard-view'));
    document.getElementById('nav-btn-math')?.addEventListener('click', () => this.switchView('math-view'));
    document.getElementById('nav-btn-word')?.addEventListener('click', () => this.switchView('word-view'));
    document.getElementById('nav-btn-pokedex')?.addEventListener('click', () => this.switchView('pokedex-view'));
    document.getElementById('nav-btn-settings')?.addEventListener('click', () => this.switchView('settings-view'));
  }

  setupModeChips() {
    // Math Mode Chips
    const mathChips = document.getElementById('math-mode-chips');
    if (mathChips) {
      mathChips.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (!btn || !btn.dataset.mathMode) return;
        mathChips.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        this.mathState.mode = btn.dataset.mathMode;
        this.startMathSession();
      });
    }

    // Word Deck Chips
    const wordChips = document.getElementById('word-deck-chips');
    if (wordChips) {
      wordChips.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (!btn || !btn.dataset.deckId) return;
        wordChips.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        this.startWordSession(btn.dataset.deckId);
      });
    }
  }

  /* ==========================================================================
     MATH MONSTER REALM ENGINE
     ========================================================================== */

  startMathSession() {
    this.mathState.questions = this.generateMathQuestions(10, this.mathState.mode);
    this.mathState.currentIdx = 0;
    this.mathState.monsterHp = 100;
    this.mathState.monsterMaxHp = 100;

    // Pick random pet for battle stage
    const pet = PET_ROSTER[Math.floor(Math.random() * PET_ROSTER.length)];
    this.mathState.currentPet = pet;

    const monsterImg = document.getElementById('math-monster-img');
    const monsterName = document.getElementById('math-monster-name');
    if (monsterImg) monsterImg.src = pet.img;
    if (monsterName) monsterName.textContent = pet.name;

    this.renderMathQuestion();
  }

  generateMathQuestions(count, mode) {
    const questions = [];
    for (let i = 0; i < count; i++) {
      let a, b, answer, promptText;

      if (mode === 'addition') {
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        answer = a + b;
        promptText = `${a} + ${b} = ?`;
      } else if (mode === 'division') {
        b = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 9) + 2;
        a = b * answer;
        promptText = `${a} ÷ ${b} = ?`;
      } else {
        // Multiplication
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 9) + 2;
        answer = a * b;
        promptText = `${a} × ${b} = ?`;
      }

      // Generate 2 distractors
      const distractors = new Set();
      while (distractors.size < 2) {
        const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
        const dist = answer + delta;
        if (dist > 0 && dist !== answer) distractors.add(dist);
      }

      const options = [answer, ...Array.from(distractors)];
      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      questions.push({
        promptText,
        answer,
        options
      });
    }
    return questions;
  }

  renderMathQuestion() {
    const q = this.mathState.questions[this.mathState.currentIdx];
    if (!q) return;

    const progressEl = document.getElementById('math-question-progress');
    const displayEl = document.getElementById('math-question-text');
    const feedbackEl = document.getElementById('math-feedback-text');
    const hpBar = document.getElementById('math-monster-hp-bar');

    if (progressEl) progressEl.textContent = `Question ${this.mathState.currentIdx + 1} of ${this.mathState.questions.length}`;
    if (displayEl) displayEl.textContent = q.promptText;
    if (feedbackEl) {
      feedbackEl.textContent = '\u00A0';
      feedbackEl.classList.remove('wrong');
    }

    if (hpBar) {
      const pct = Math.max(0, Math.round((this.mathState.monsterHp / this.mathState.monsterMaxHp) * 100));
      hpBar.style.width = `${pct}%`;
    }

    // Render 3 option buttons
    const grid = document.getElementById('math-answers-grid');
    if (grid) {
      grid.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.dataset.answerIdx = idx;
        btn.textContent = opt;
        btn.addEventListener('click', () => this.handleMathAnswer(opt));
        grid.appendChild(btn);
      });
    }
  }

  handleMathAnswer(selectedAnswer) {
    const q = this.mathState.questions[this.mathState.currentIdx];
    if (!q) return;

    const feedbackEl = document.getElementById('math-feedback-text');
    const monsterImg = document.getElementById('math-monster-img');

    if (selectedAnswer === q.answer) {
      // Correct!
      if (feedbackEl) {
        feedbackEl.textContent = 'Awesome! Spot on! ⭐';
        feedbackEl.classList.remove('wrong');
      }

      if (monsterImg) {
        monsterImg.classList.add('hit-anim');
        setTimeout(() => monsterImg.classList.remove('hit-anim'), 450);
      }

      this.mathState.monsterHp -= Math.ceil(100 / this.mathState.questions.length);
      this.mathState.currentIdx += 1;

      if (this.mathState.currentIdx >= this.mathState.questions.length) {
        // Battle Won!
        setTimeout(() => this.triggerVictory(this.mathState.currentPet), 600);
      } else {
        setTimeout(() => this.renderMathQuestion(), 500);
      }
    } else {
      // Wrong!
      if (feedbackEl) {
        feedbackEl.textContent = 'Try again! You can do it! 💪';
        feedbackEl.classList.add('wrong');
      }
    }
  }

  setupMathArena() {
    // Initialized dynamically
  }

  /* ==========================================================================
     WORD MONSTER REALM ENGINE
     ========================================================================== */

  startWordSession(deckId) {
    const deck = getDeckById(deckId);
    this.spellingEngine = new SpellingEngine(deck);
    this.currentSpellingInput = "";

    const monsterImg = document.getElementById('word-monster-img');
    const monsterName = document.getElementById('word-monster-name');
    const pet = PET_ROSTER[Math.floor(Math.random() * PET_ROSTER.length)];
    if (monsterImg) monsterImg.src = pet.img;
    if (monsterName) monsterName.textContent = `Spelling ${pet.name}`;

    this.renderWordQuestion();
  }

  renderWordQuestion() {
    if (!this.spellingEngine) return;
    const q = this.spellingEngine.getCurrentQuestion();
    if (!q) return;

    const progressEl = document.getElementById('word-question-progress');
    const hintEl = document.getElementById('word-hint-text');
    const feedbackEl = document.getElementById('word-feedback-text');
    const hpBar = document.getElementById('word-monster-hp-bar');

    if (progressEl) progressEl.textContent = `Word ${q.questionNumber} of ${q.totalQuestions}`;
    if (hintEl) hintEl.textContent = `"${q.hint}"`;
    if (feedbackEl) {
      feedbackEl.textContent = '\u00A0';
      feedbackEl.classList.remove('wrong');
    }

    if (hpBar) {
      const pct = Math.max(0, Math.round((this.spellingEngine.monsterHp / this.spellingEngine.monsterMaxHp) * 100));
      hpBar.style.width = `${pct}%`;
    }

    this.renderWordSlots(q.targetWord.length);
    this.renderLetterTiles(q.tiles);

    // Speak word automatically on question load
    setTimeout(() => this.spellingEngine.speakCurrentWord(), 300);
  }

  renderWordSlots(targetLength) {
    const slotsRow = document.getElementById('word-slots-row');
    if (!slotsRow) return;

    slotsRow.innerHTML = '';
    const letters = this.currentSpellingInput.split('');

    for (let i = 0; i < targetLength; i++) {
      const slot = document.createElement('span');
      slot.className = 'letter-slot';
      if (i < letters.length) {
        slot.textContent = letters[i];
      } else {
        slot.classList.add('empty');
        slot.textContent = '_';
      }
      slotsRow.appendChild(slot);
    }
  }

  renderLetterTiles(tiles) {
    const tilesBank = document.getElementById('letter-tiles-bank');
    if (!tilesBank) return;

    tilesBank.innerHTML = '';
    tiles.forEach((letter) => {
      const btn = document.createElement('button');
      btn.className = 'tile-btn';
      btn.textContent = letter;
      btn.addEventListener('click', () => {
        this.currentSpellingInput += letter;
        const q = this.spellingEngine.getCurrentQuestion();
        if (q) this.renderWordSlots(q.targetWord.length);
      });
      tilesBank.appendChild(btn);
    });
  }

  setupWordArena() {
    document.getElementById('btn-speak-word')?.addEventListener('click', () => {
      if (this.spellingEngine) this.spellingEngine.speakCurrentWord();
    });

    document.getElementById('btn-clear-spelling')?.addEventListener('click', () => {
      this.currentSpellingInput = "";
      const q = this.spellingEngine?.getCurrentQuestion();
      if (q) this.renderWordSlots(q.targetWord.length);
    });

    document.getElementById('btn-submit-spelling')?.addEventListener('click', () => {
      if (!this.spellingEngine) return;
      const res = this.spellingEngine.submitAnswer(this.currentSpellingInput);
      const feedbackEl = document.getElementById('word-feedback-text');

      if (res.isCorrect) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Great Spelling! 🌟';
          feedbackEl.classList.remove('wrong');
        }

        this.currentSpellingInput = "";

        if (res.isFinished) {
          const pet = PET_ROSTER[Math.floor(Math.random() * PET_ROSTER.length)];
          setTimeout(() => this.triggerVictory(pet), 600);
        } else {
          setTimeout(() => this.renderWordQuestion(), 500);
        }
      } else {
        if (feedbackEl) {
          feedbackEl.textContent = 'Not quite! Try tapping the letters again!';
          feedbackEl.classList.add('wrong');
        }
      }
    });
  }

  /* ==========================================================================
     VICTORY & POKÉDEX CONTROLLER
     ========================================================================== */

  triggerVictory(pet) {
    // Award 3 stars & unlock pet
    this.state.player.stars += 3;
    if (!this.state.player.petsUnlocked.includes(pet.id)) {
      this.state.player.petsUnlocked.push(pet.id);
    }
    this.saveState();
    this.updateHeaderProfile();

    const modal = document.getElementById('victory-modal');
    const petImg = document.getElementById('reward-pet-img');
    const petName = document.getElementById('reward-pet-name');

    if (petImg) petImg.src = pet.img;
    if (petName) petName.textContent = `${pet.name} Rescued & Added to Pokédex!`;
    if (modal) modal.classList.add('active');
  }

  setupVictoryModal() {
    document.getElementById('btn-victory-continue')?.addEventListener('click', () => {
      const modal = document.getElementById('victory-modal');
      if (modal) modal.classList.remove('active');
      this.switchView('pokedex-view');
    });
  }

  renderPokedex() {
    const grid = document.getElementById('pokedex-grid');
    if (!grid) return;

    grid.innerHTML = '';
    PET_ROSTER.forEach(pet => {
      const isUnlocked = this.state.player.petsUnlocked.includes(pet.id);
      const card = document.createElement('div');
      card.className = `pet-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      card.innerHTML = `
        <img src="${pet.img}" alt="${pet.name}" class="pet-img">
        <div class="pet-name">${pet.name}</div>
        <div style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
          ${isUnlocked ? '⭐ Level 1 Companion' : '🔒 Battle to Unlock'}
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

// Global App Instance
export const app = new AppController();
