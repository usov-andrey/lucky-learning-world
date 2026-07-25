/**
 * Lucky's Learning World - Application State & Router Controller
 * Pure Vanilla ES Module Architecture
 */

// Storage Keys & Default State
const STORAGE_KEY = 'luckys_learning_world_state';

const defaultState = {
  player: {
    name: 'Lucky',
    grade: 'g3',
    stars: 12,
    petsUnlocked: ['pikachu-starter']
  },
  settings: {
    soundEnabled: true,
    ttsSpeed: 1.0,
    schoolProgram: 'cambridge-g3'
  }
};

class AppController {
  constructor() {
    this.state = this.loadState();
    this.currentView = 'dashboard-view';
    
    // Bind DOM events after DOM loaded
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
      console.warn('Failed to load state from localStorage:', e);
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
    console.log("🌟 Initializing Lucky's Learning World...");
    this.setupNavigation();
    this.setupModeChips();
    this.updateHeaderProfile();
    this.switchView('dashboard-view');
  }

  updateHeaderProfile() {
    const starsEl = document.getElementById('total-stars-count');
    const petsCountEl = document.getElementById('pets-collected-count');
    
    if (starsEl) starsEl.textContent = this.state.player.stars;
    if (petsCountEl) petsCountEl.textContent = `${this.state.player.petsUnlocked.length} / 24 Pets`;
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

    // Bottom Navigation Bar Items
    document.getElementById('nav-btn-hub')?.addEventListener('click', () => this.switchView('dashboard-view'));
    document.getElementById('nav-btn-math')?.addEventListener('click', () => this.switchView('math-view'));
    document.getElementById('nav-btn-word')?.addEventListener('click', () => this.switchView('word-view'));
    document.getElementById('nav-btn-pokedex')?.addEventListener('click', () => this.switchView('pokedex-view'));
    document.getElementById('nav-btn-settings')?.addEventListener('click', () => this.switchView('settings-view'));
  }

  setupModeChips() {
    // Mode selection handler helper
    const handleChipSelection = (containerId) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip-btn');
        if (!btn) return;

        container.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        // Handle grade preset change if in settings
        if (btn.dataset.grade) {
          this.state.player.grade = btn.dataset.grade;
          this.saveState();
          console.log(`Grade preset updated: ${btn.dataset.grade}`);
        }
      });
    };

    handleChipSelection('math-mode-chips');
    handleChipSelection('word-deck-chips');
  }
}

// Global App Instance
export const app = new AppController();
