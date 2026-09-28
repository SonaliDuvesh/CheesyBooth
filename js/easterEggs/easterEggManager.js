
import { EASTER_EGGS, SECRET_STICKERS, EASTER_EGG_RARITY } from './easterEggRegistry.js';
import { EasterEggEffects } from './easterEggEffects.js';

const STORAGE_KEY_DISCOVERIES = 'say_cheese_easter_eggs';

export class EasterEggManager {
  constructor() {
    this._discovered = new Set();
    this._cooldowns = new Map();
    this._sessionTriggersCount = 0;
    this._maxPerSession = 3;

    this._keyHistory = [];
    this._shutterClicks = [];
    this._shutterHoldTimer = null;
    this._brandClicks = [];
    this._idleTimer = null;
    this._idleTimeoutMs = 45000;

    this._loadDiscoveries();
  }

  _loadDiscoveries() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY_DISCOVERIES);
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            list.forEach(id => this._discovered.add(id));
          }
        }
      }
    } catch (e) {}
  }

  _saveDiscoveries() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_DISCOVERIES, JSON.stringify(Array.from(this._discovered)));
      }
    } catch (e) {}
  }

  isDiscovered(eggId) {
    return this._discovered.has(eggId);
  }

  getDiscovered() {
    return Array.from(this._discovered);
  }

  clearDiscoveries() {
    this._discovered.clear();
    this._saveDiscoveries();
  }

  getUnlockedSecretStickers() {
    return SECRET_STICKERS.filter(s => this._discovered.has(s.secretId));
  }

  trigger(eggId, { force = false } = {}) {
    const egg = EASTER_EGGS.find(e => e.id === eggId);
    if (!egg) return false;

    const now = Date.now();
    const lastTrigger = this._cooldowns.get(eggId) || 0;

    if (!force && now - lastTrigger < egg.cooldownMs) {
      return false;
    }

    if (!force && egg.rarity !== EASTER_EGG_RARITY.COMMON && this._sessionTriggersCount >= this._maxPerSession) {
      return false;
    }

    this._cooldowns.set(eggId, now);
    this._sessionTriggersCount++;
    this._discovered.add(eggId);
    this._saveDiscoveries();

    try {
      switch (eggId) {
        case 'secret-shutter':
          EasterEggEffects.triggerShutterFlutter();
          break;
        case 'arcade-code':
          EasterEggEffects.triggerArcadeUnlock();
          break;
        case 'secret-brand':
          EasterEggEffects.triggerBrandSparkle();
          break;
        case 'idle-whisper':
          EasterEggEffects.triggerIdleWhisper();
          break;
        case 'golden-flash':
          EasterEggEffects.triggerGoldenFlash();
          break;
        case 'rare-message':
          EasterEggEffects.triggerRareMessage();
          break;
        case 'surprise-rare-roll':
          EasterEggEffects.triggerArcadeUnlock();
          break;
      }
      return true;
    } catch (err) {
      console.warn('Easter egg notice:', err);
      return false;
    }
  }

  initInteractionListeners() {
    if (typeof document === 'undefined') return;

    this._setupKeyboardListener();
    this._setupBrandListener();
    this._setupShutterListener();
    this._setupIdleTracker();
  }

  _setupKeyboardListener() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const secretWord = ['s', 'a', 'y', 'c', 'h', 'e', 'e', 's', 'e'];

    document.addEventListener('keydown', (e) => {

      const active = document.activeElement;
      if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;

      const key = e.key.toLowerCase();
      this._keyHistory.push(e.key);
      if (this._keyHistory.length > 20) this._keyHistory.shift();

      const recentKeys = this._keyHistory.slice(-konamiCode.length);
      const isKonami = konamiCode.every((k, i) => recentKeys[i] && recentKeys[i].toLowerCase() === k.toLowerCase());
      if (isKonami) {
        this.trigger('arcade-code', { force: true });
        this._keyHistory = [];
        return;
      }

      const recentWord = this._keyHistory.slice(-secretWord.length);
      const isWord = secretWord.every((k, i) => recentWord[i] && recentWord[i].toLowerCase() === k);
      if (isWord) {
        this.trigger('arcade-code', { force: true });
        this._keyHistory = [];
      }
    });
  }

  _setupBrandListener() {
    const brandTitle = document.getElementById('headerBrandTitle');
    const headerBrand = document.getElementById('headerBrand') || brandTitle;
    if (!headerBrand) return;

    headerBrand.addEventListener('click', () => {
      const now = Date.now();
      this._brandClicks.push(now);
      this._brandClicks = this._brandClicks.filter(t => now - t < 2500);

      if (this._brandClicks.length >= 5) {
        this._brandClicks = [];
        this.trigger('secret-brand', { force: true });
      }
    });
  }

  _setupShutterListener() {
    const btnShutter = document.getElementById('btnShutter');
    if (!btnShutter) return;

    btnShutter.addEventListener('click', () => {
      const now = Date.now();
      this._shutterClicks.push(now);
      this._shutterClicks = this._shutterClicks.filter(t => now - t < 2000);

      if (this._shutterClicks.length >= 5) {
        this._shutterClicks = [];
        this.trigger('secret-shutter', { force: true });
      }
    });

    const startHold = () => {
      this._shutterHoldTimer = setTimeout(() => {
        this.trigger('secret-shutter', { force: true });
        this._shutterHoldTimer = null;
      }, 650);
    };

    const cancelHold = () => {
      if (this._shutterHoldTimer) {
        clearTimeout(this._shutterHoldTimer);
        this._shutterHoldTimer = null;
      }
    };

    btnShutter.addEventListener('pointerdown', startHold);
    btnShutter.addEventListener('pointerup', cancelHold);
    btnShutter.addEventListener('pointerleave', cancelHold);
    btnShutter.addEventListener('pointercancel', cancelHold);
  }

  _setupIdleTracker() {
    const resetIdle = () => {
      if (this._idleTimer) clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(() => {
        const boothSection = document.getElementById('boothSection');
        if (boothSection && boothSection.classList.contains('active')) {
          this.trigger('idle-whisper');
        }
      }, this._idleTimeoutMs);
    };

    ['pointerdown', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, resetIdle, { passive: true });
    });

    resetIdle();
  }

  onPhotoCaptured() {
    const roll = Math.random();
    if (roll < 0.03) { 
      this.trigger('golden-flash');
    }
  }

  onSessionCompleted() {
    const roll = Math.random();
    if (roll < 0.10) { 
      this.trigger('rare-message');
    }
  }
}

export const easterEggManager = new EasterEggManager();
