
import { BOOTH_COLLECTIONS, getThemeById } from './themeRegistry.js';
import { ThemeRenderer } from './themeRenderer.js';

const STORAGE_KEY_THEME = 'say_cheese_booth_theme';
const STORAGE_KEY_FAVS = 'say_cheese_theme_favs';
const STORAGE_KEY_RECENTS = 'say_cheese_theme_recents';

export class ThemeManager {
  constructor() {
    this.currentThemeId = 'classic-booth';
    this.appearanceMode = 'light'; 
    this._favorites = new Set();
    this._recents = [];
    this._listeners = new Set();

    this._load();
  }

  _load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
        if (savedTheme && BOOTH_COLLECTIONS.some(t => t.id === savedTheme)) {
          this.currentThemeId = savedTheme;
        }

        const savedFavs = localStorage.getItem(STORAGE_KEY_FAVS);
        if (savedFavs) {
          const list = JSON.parse(savedFavs);
          if (Array.isArray(list)) list.forEach(id => this._favorites.add(id));
        }

        const savedRecents = localStorage.getItem(STORAGE_KEY_RECENTS);
        if (savedRecents) {
          const list = JSON.parse(savedRecents);
          if (Array.isArray(list)) this._recents = list.slice(0, 4);
        }
      }
    } catch (e) {}
  }

  _save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_THEME, this.currentThemeId);
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(Array.from(this._favorites)));
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(this._recents));
      }
    } catch (e) {}
  }

  init() {
    this.applyCurrentTheme();
  }

  getCurrentTheme() {
    return getThemeById(this.currentThemeId);
  }

  getAllThemes() {
    return BOOTH_COLLECTIONS;
  }

  setTheme(themeId, { persist = true } = {}) {
    const theme = getThemeById(themeId);
    if (!theme) return false;

    this.currentThemeId = theme.id;
    ThemeRenderer.applyTheme(theme, { appearance: this.appearanceMode });

    this._recents = this._recents.filter(id => id !== theme.id);
    this._recents.unshift(theme.id);
    if (this._recents.length > 4) this._recents.pop();

    if (persist) {
      this._save();
    }

    this._notify();
    return true;
  }

  applyCurrentTheme() {
    const theme = this.getCurrentTheme();
    ThemeRenderer.applyTheme(theme, { appearance: this.appearanceMode });
  }

  setAppearanceMode(mode) {
    if (['light', 'dark', 'system'].includes(mode)) {
      this.appearanceMode = mode;
      this.applyCurrentTheme();
    }
  }

  toggleFavorite(themeId) {
    if (this._favorites.has(themeId)) {
      this._favorites.delete(themeId);
    } else {
      this._favorites.add(themeId);
    }
    this._save();
    this._notify();
    return this._favorites.has(themeId);
  }

  isFavorite(themeId) {
    return this._favorites.has(themeId);
  }

  getFavorites() {
    return Array.from(this._favorites);
  }

  getRecents() {
    return this._recents;
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify() {
    const theme = this.getCurrentTheme();
    this._listeners.forEach(fn => {
      try { fn(theme); } catch (e) {}
    });
  }
}

export const themeManager = new ThemeManager();
