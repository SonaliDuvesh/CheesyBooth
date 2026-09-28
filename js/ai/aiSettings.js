
const STORAGE_KEY = 'say_cheese_ai_settings_v1';

export const DEFAULT_AI_SETTINGS = {
  enabled: true,                
  photoAiEnabled: false,         
  askBeforePhotoAi: true,       
  captionsEnabled: true,        
  poseSuggestionsEnabled: true, 
  themeSuggestionsEnabled: true,
  stickerSuggestionsEnabled: true, 
  collageSuggestionsEnabled: true, 
  providerType: 'local-simulation', 
  proxyEndpoint: '',            
};

export class AISettings {
  constructor() {
    this.settings = this._load();
    this._listeners = new Set();
  }

  _load() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...DEFAULT_AI_SETTINGS, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Failed to load AI settings from storage:', err);
    }
    return { ...DEFAULT_AI_SETTINGS };
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
      this._notify();
    } catch (err) {
      console.warn('Failed to save AI settings to storage:', err);
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.save();
  }

  update(partial = {}) {
    this.settings = { ...this.settings, ...partial };
    this.save();
  }

  reset() {
    this.settings = { ...DEFAULT_AI_SETTINGS };
    this.save();
  }

  isFeatureEnabled(featureName) {
    if (!this.settings.enabled) return false;
    switch (featureName) {
      case 'caption':
      case 'captions':
        return Boolean(this.settings.captionsEnabled);
      case 'pose':
      case 'poses':
        return Boolean(this.settings.poseSuggestionsEnabled);
      case 'theme':
      case 'themes':
        return Boolean(this.settings.themeSuggestionsEnabled);
      case 'sticker':
      case 'stickers':
        return Boolean(this.settings.stickerSuggestionsEnabled);
      case 'collage':
        return Boolean(this.settings.collageSuggestionsEnabled);
      case 'photo':
      case 'photoAi':
        return Boolean(this.settings.photoAiEnabled);
      default:
        return true;
    }
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notify() {
    for (const listener of this._listeners) {
      try {
        listener(this.settings);
      } catch (e) {
        console.error('Error in AI settings subscriber:', e);
      }
    }
  }
}

export const aiSettings = new AISettings();
