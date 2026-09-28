
const STORAGE_KEY = 'say_cheese_preferences_v1';
const SCHEMA_VERSION = 1;

export const PERSONALITY_MESSAGES = {
  classic: {
    welcome: 'Welcome to the photobooth.',
    welcomeBack: 'Welcome back.',
    readyPrompt: 'Ready for another photo session?',
    posePrompts: [
      'Look at the camera 👀',
      'Give a warm smile ✨',
      'Try a candid look 🌿',
      'Classic side profile 📸',
      'Chin up and smile 💫',
    ],
    countdownCue: 'Get Ready! Smile ✨',
    sessionDone: 'Your photos are ready.',
    collageReady: 'Craft your memory print.',
  },
  playful: {
    welcome: 'Hey bestie! Let’s take cute pics ✨',
    welcomeBack: 'Yay, you’re back! 💕',
    readyPrompt: 'Ready to snap some memories? ✨',
    posePrompts: [
      'Peace sign time! ✌️',
      'Big happy grin! 😄',
      'Silly goofy face! 🤪',
      'Blow a cute kiss! 💋',
      'Heart hands pose! 🫶',
    ],
    countdownCue: 'Strike a pose! 📸✨',
    sessionDone: 'Okayyy, these turned out SO cute! 🥰',
    collageReady: 'Time to decorate with cute stickers! 🎀',
  },
  cozy: {
    welcome: 'A quiet space for little moments.',
    welcomeBack: 'Welcome back, take your time.',
    readyPrompt: 'Ready to capture a gentle memory?',
    posePrompts: [
      'Soft gentle smile ☕',
      'Cozy candid glance 🧣',
      'Comfortable and relaxed 🌿',
      'Natural laugh 🌸',
      'Warm gaze ✨',
    ],
    countdownCue: 'Breathe and smile softly 🌿',
    sessionDone: 'A little memory, saved gently. ☕',
    collageReady: 'Arrange your cozy scrapbook print.',
  },
  retro: {
    welcome: 'Analog Photomaton · Flash Ready',
    welcomeBack: 'Darkroom Ready · Roll Loaded',
    readyPrompt: 'Film loaded. Ready for exposure?',
    posePrompts: [
      'Hold still for the shutter 🎞️',
      '90s vintage glare 🕶️',
      'Cinema close-up 🎬',
      'Spontaneous flash snap ⚡',
      'Film grain gaze 📽️',
    ],
    countdownCue: 'Charging flash... ⚡',
    sessionDone: 'Fresh from the chemical bath. 🎞️',
    collageReady: 'Assemble your 35mm contact sheet.',
  },
  minimal: {
    welcome: 'Photobooth',
    welcomeBack: 'Welcome back.',
    readyPrompt: 'Ready.',
    posePrompts: [
      'Look ahead',
      'Hold still',
      'Natural',
      'Profile',
      'Smile',
    ],
    countdownCue: 'Ready',
    sessionDone: 'Photos ready.',
    collageReady: 'Export layout.',
  },
};

export const THEMES = [
  { id: 'classic', name: 'Classic Warmth', icon: '🪵', desc: 'Warm cream, linen oatmeal & terracotta accents' },
  { id: 'vintage', name: 'Darkroom Vintage', icon: '🎞️', desc: 'Sepia noir, rich amber & vintage film grain' },
  { id: 'soft', name: 'Soft Memory', icon: '🌸', desc: 'Pastel peach, gentle oatmeal & blush hues' },
  { id: 'playful', name: 'Candy Pop', icon: '🍭', desc: 'Sunny caramel, lilac touch & vibrant playfulness' },
  { id: 'noir', name: 'Midnight Noir', icon: '🌙', desc: 'Sleek dark matte aesthetic with luminous accents' },
];

export const DEFAULT_PREFERENCES = {
  version: SCHEMA_VERSION,
  onboardingCompleted: false,
  profile: {
    displayName: '',
    boothName: 'CheesyBooth',
    greeting: 'Ready to make a memory?',
  },
  personality: 'classic', 
  defaults: {
    photoCount: 4,
    countdown: 5,
    posePrompts: 'on',
    funMode: 'classic',
    layout: 'vertical-strip',
    aspectRatio: 'strip',
    frameColor: '#FAF6EE',
    frameStyle: 'clean',
    filter: 'warm-vintage',
    filterIntensity: 80,
    fontFamily: 'Space Grotesk',
  },
  appearance: {
    theme: 'classic',
    accentColor: '#C86D51',
  },
  experience: {
    soundEnabled: true,
    volume: 80,
    soundStyle: 'classic', 
    animationIntensity: 'full', 
    mirrorPreview: true,
  },
  favorites: {
    layouts: ['vertical-strip', 'grid-2x2'],
    filters: ['warm-vintage', 'film-35mm'],
    stickers: ['✨', '💖', '🎞️'],
  },
  recents: {
    layouts: [],
    filters: [],
    stickers: [],
    frameColors: [],
  },
  lastSession: {
    photoCount: 4,
    countdown: 5,
    funMode: 'classic',
    layout: 'vertical-strip',
    filter: 'warm-vintage',
    frameColor: '#FAF6EE',
    timestamp: 0,
  },
};

export class PreferenceManager {
  constructor() {
    this._listeners = new Set();
    this.prefs = this._load();
    this._setupMultiTabSync();
    this.applyThemeAndAppearance();
  }

  _validate(data) {
    if (!data || typeof data !== 'object') return { ...DEFAULT_PREFERENCES };

    const valid = JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));

    if (data.profile && typeof data.profile === 'object') {
      if (typeof data.profile.displayName === 'string') {
        valid.profile.displayName = data.profile.displayName.slice(0, 40).trim();
      }
      if (typeof data.profile.boothName === 'string' && data.profile.boothName.trim()) {
        valid.profile.boothName = data.profile.boothName.slice(0, 50).trim();
      }
      if (typeof data.profile.greeting === 'string') {
        valid.profile.greeting = data.profile.greeting.slice(0, 80).trim();
      }
    }

    if (['classic', 'playful', 'cozy', 'retro', 'minimal'].includes(data.personality)) {
      valid.personality = data.personality;
    }

    valid.onboardingCompleted = Boolean(data.onboardingCompleted);

    if (data.defaults && typeof data.defaults === 'object') {
      valid.defaults.photoCount = [2, 4, 6].includes(data.defaults.photoCount) ? data.defaults.photoCount : 4;
      valid.defaults.countdown = [3, 5, 10].includes(data.defaults.countdown) ? data.defaults.countdown : 5;
      if (['on', 'off'].includes(data.defaults.posePrompts)) valid.defaults.posePrompts = data.defaults.posePrompts;
      if (typeof data.defaults.funMode === 'string') valid.defaults.funMode = data.defaults.funMode;
      if (typeof data.defaults.layout === 'string') valid.defaults.layout = data.defaults.layout;
      if (typeof data.defaults.aspectRatio === 'string') valid.defaults.aspectRatio = data.defaults.aspectRatio;
      if (typeof data.defaults.frameColor === 'string') valid.defaults.frameColor = data.defaults.frameColor;
      if (typeof data.defaults.frameStyle === 'string') valid.defaults.frameStyle = data.defaults.frameStyle;
      if (typeof data.defaults.filter === 'string') valid.defaults.filter = data.defaults.filter;
      if (typeof data.defaults.filterIntensity === 'number') {
        valid.defaults.filterIntensity = Math.max(0, Math.min(100, data.defaults.filterIntensity));
      }
      if (typeof data.defaults.fontFamily === 'string') valid.defaults.fontFamily = data.defaults.fontFamily;
    }

    if (data.appearance && typeof data.appearance === 'object') {
      if (['classic', 'vintage', 'soft', 'playful', 'noir'].includes(data.appearance.theme)) {
        valid.appearance.theme = data.appearance.theme;
      }
      if (typeof data.appearance.accentColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(data.appearance.accentColor)) {
        valid.appearance.accentColor = data.appearance.accentColor;
      }
    }

    if (data.experience && typeof data.experience === 'object') {
      valid.experience.soundEnabled = Boolean(data.experience.soundEnabled);
      if (typeof data.experience.volume === 'number') {
        valid.experience.volume = Math.max(0, Math.min(100, data.experience.volume));
      }
      if (['classic', 'soft', 'retro'].includes(data.experience.soundStyle)) {
        valid.experience.soundStyle = data.experience.soundStyle;
      }
      if (['full', 'reduced', 'off'].includes(data.experience.animationIntensity)) {
        valid.experience.animationIntensity = data.experience.animationIntensity;
      }
      valid.experience.mirrorPreview = data.experience.mirrorPreview !== false;
    }

    if (data.favorites && typeof data.favorites === 'object') {
      if (Array.isArray(data.favorites.layouts)) valid.favorites.layouts = data.favorites.layouts.slice(0, 20);
      if (Array.isArray(data.favorites.filters)) valid.favorites.filters = data.favorites.filters.slice(0, 20);
      if (Array.isArray(data.favorites.stickers)) valid.favorites.stickers = data.favorites.stickers.slice(0, 50);
    }

    if (data.recents && typeof data.recents === 'object') {
      if (Array.isArray(data.recents.layouts)) valid.recents.layouts = data.recents.layouts.slice(0, 10);
      if (Array.isArray(data.recents.filters)) valid.recents.filters = data.recents.filters.slice(0, 10);
      if (Array.isArray(data.recents.stickers)) valid.recents.stickers = data.recents.stickers.slice(0, 15);
      if (Array.isArray(data.recents.frameColors)) valid.recents.frameColors = data.recents.frameColors.slice(0, 10);
    }

    if (data.lastSession && typeof data.lastSession === 'object') {
      valid.lastSession = { ...valid.lastSession, ...data.lastSession };
      if (![3, 5, 10].includes(valid.lastSession.countdown)) {
        valid.lastSession.countdown = 5;
      }
      if (![2, 4, 6].includes(valid.lastSession.photoCount)) {
        valid.lastSession.photoCount = 4;
      }
    }

    return valid;
  }

  _load() {
    try {
      if (typeof localStorage === 'undefined') return JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
      const parsed = JSON.parse(raw);
      return this._validate(parsed);
    } catch (err) {
      console.warn('Preferences storage failed to load; using defaults:', err);
      return JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
    }
  }

  _save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
      }
    } catch (err) {
      console.warn('Preferences storage save failed (in-memory only):', err);
    }
    this._notify();
  }

  _setupMultiTabSync() {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          this.prefs = this._validate(JSON.parse(e.newValue));
          this.applyThemeAndAppearance();
          this._notify();
        } catch (err) {

        }
      }
    });
  }

  get(path) {
    if (!path) return this.prefs;
    const parts = path.split('.');
    let cur = this.prefs;
    for (const p of parts) {
      if (cur === undefined || cur === null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  set(path, value) {
    const parts = path.split('.');
    let cur = this.prefs;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    this.prefs = this._validate(this.prefs);
    this._save();
    this.applyThemeAndAppearance();
  }

  update(partialObj) {
    const merge = (target, source) => {
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
      return target;
    };

    merge(this.prefs, partialObj);
    this.prefs = this._validate(this.prefs);
    this._save();
    this.applyThemeAndAppearance();
  }

  getAll() {
    return JSON.parse(JSON.stringify(this.prefs));
  }

  setPersonality(personality) {
    if (['classic', 'playful', 'cozy', 'retro', 'minimal'].includes(personality)) {
      this.set('personality', personality);
    }
  }

  getPersonality() {
    return this.prefs.personality || 'classic';
  }

  setTheme(theme) {
    if (['classic', 'vintage', 'soft', 'playful', 'noir'].includes(theme)) {
      this.set('appearance.theme', theme);
    }
  }

  setAccentColor(color) {
    if (typeof color === 'string') {
      this.set('appearance.accentColor', color);
    }
  }

  completeOnboarding() {
    this.set('onboardingCompleted', true);
  }

  getFavorites(type) {
    return this.prefs.favorites[type] || [];
  }

  isFavorite(type, id) {
    const list = this.prefs.favorites[type] || [];
    return list.includes(id);
  }

  addFavorite(type, id) {
    if (!this.prefs.favorites[type]) this.prefs.favorites[type] = [];
    const list = this.prefs.favorites[type];
    if (!list.includes(id)) {
      list.push(id);
      this._save();
    }
  }

  removeFavorite(type, id) {
    if (!this.prefs.favorites[type]) return;
    const list = this.prefs.favorites[type];
    const index = list.indexOf(id);
    if (index >= 0) {
      list.splice(index, 1);
      this._save();
    }
  }

  toggleFavorite(type, id) {
    if (!this.prefs.favorites[type]) this.prefs.favorites[type] = [];
    const list = this.prefs.favorites[type];
    const index = list.indexOf(id);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(id);
    }
    this._save();
    return this.isFavorite(type, id);
  }

  addRecent(type, item) {
    if (!this.prefs.recents[type]) this.prefs.recents[type] = [];
    const list = this.prefs.recents[type];
    const key = typeof item === 'object' ? (item.id || item.emoji || item.name) : item;

    const filtered = list.filter(it => {
      const itKey = typeof it === 'object' ? (it.id || it.emoji || it.name) : it;
      return itKey !== key;
    });

    filtered.unshift(item);
    this.prefs.recents[type] = filtered.slice(0, 10);
    this._save();
  }

  recordSession(sessionData) {
    this.prefs.lastSession = {
      ...this.prefs.lastSession,
      ...sessionData,
      timestamp: Date.now(),
    };
    this._save();
  }

  getMessages() {
    const p = this.prefs.personality || 'classic';
    return PERSONALITY_MESSAGES[p] || PERSONALITY_MESSAGES.classic;
  }

  getGreeting() {
    const custom = this.prefs.profile.greeting;
    const name = this.prefs.profile.displayName;
    const booth = this.prefs.profile.boothName || 'CheesyBooth';

    if (name) {
      if (custom && custom.trim() && custom !== DEFAULT_PREFERENCES.profile.greeting) {
        return `${custom}, ${name} ✨`;
      }
      return `Welcome back, ${name} ✨`;
    }
    if (custom && custom.trim()) return custom;
    return `Welcome to ${booth}`;
  }

  applyThemeAndAppearance() {
    if (typeof document === 'undefined' || !document.documentElement) return;
    const theme = this.prefs.appearance.theme || 'classic';
    const accent = this.prefs.appearance.accentColor || '#C86D51';
    const anim = this.prefs.experience.animationIntensity || 'full';

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--color-primary', accent);

    if (document.body) {
      document.body.classList.toggle('reduced-motion', anim === 'reduced');
      document.body.classList.toggle('no-animations', anim === 'off');
    }
  }

  reset() {
    this.prefs = JSON.parse(JSON.stringify(DEFAULT_PREFERENCES));
    this._save();
    this.applyThemeAndAppearance();
  }

  exportJSON() {
    return JSON.stringify({
      app: 'SayCheese',
      exportDate: new Date().toISOString(),
      version: SCHEMA_VERSION,
      preferences: this.prefs,
    }, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON structure');
      const prefsToLoad = parsed.preferences || parsed;
      this.prefs = this._validate(prefsToLoad);
      this._save();
      this.applyThemeAndAppearance();
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify() {
    this._listeners.forEach((fn) => {
      try {
        fn(this.prefs);
      } catch (err) {
        console.error('Preference subscriber error:', err);
      }
    });
  }
}

export const preferenceManager = new PreferenceManager();
