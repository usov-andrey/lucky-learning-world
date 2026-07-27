// ThemeManager: Single source of truth for UI theme state & presentation mappings

export const ThemeManager = {
  STORAGE_KEY: 'lucky_learning_theme',
  DEFAULT_THEME: 'pokemon',

  getTheme() {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(this.STORAGE_KEY);
        return (val === 'comic' || val === 'pokemon') ? val : this.DEFAULT_THEME;
      }
    } catch (e) {
      // Fallback if localStorage is inaccessible
    }
    return this.DEFAULT_THEME;
  },

  setTheme(themeId) {
    const validTheme = (themeId === 'comic' || themeId === 'pokemon') ? themeId : this.DEFAULT_THEME;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, validTheme);
      }
    } catch (e) {}

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', validTheme);
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      const CustomEvt = window.CustomEvent || (typeof CustomEvent !== 'undefined' ? CustomEvent : null);
      if (CustomEvt) {
        window.dispatchEvent(new CustomEvt('lucky:themechanged', {
          detail: { theme: validTheme }
        }));
      }
    }
    return validTheme;
  },

  getCharacterPresentation(characterId, pokemonCharacter) {
    const theme = this.getTheme();
    if (theme === 'comic' && typeof window !== 'undefined' && window.COMIC_CHARACTERS && window.COMIC_CHARACTERS[characterId]) {
      return window.COMIC_CHARACTERS[characterId];
    }
    return pokemonCharacter || (typeof window !== 'undefined' && window.POKEMON_CHARACTERS ? window.POKEMON_CHARACTERS[characterId] : null);
  }
};
