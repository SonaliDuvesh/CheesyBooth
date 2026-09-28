
import { soundManager } from '../audio/soundManager.js';
import { browserSupport } from '../compatibility/browserSupport.js';

export class FeedbackManager {
  constructor() {
    this._toastTimeout = null;
    this._hapticsEnabled = true;
    this._initPreferences();
  }

  _initPreferences() {
    try {
      if (typeof localStorage !== 'undefined') {
        const hapticsPref = localStorage.getItem('say_cheese_haptics');
        if (hapticsPref !== null) {
          this._hapticsEnabled = hapticsPref === 'true';
        }
      }
    } catch (e) {}
  }

  setHapticsEnabled(enabled) {
    this._hapticsEnabled = Boolean(enabled);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('say_cheese_haptics', this._hapticsEnabled.toString());
      }
    } catch (e) {}
  }

  isHapticsEnabled() {
    return this._hapticsEnabled;
  }

  triggerHaptic(type = 'light') {
    if (!this._hapticsEnabled) return;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; 
    }

    const patterns = {
      light: 8,
      button: 12,
      snap: 5,
      shutter: [15, 30, 20],
      success: [10, 40, 15],
      toggle: 10,
    };

    const pattern = patterns[type] || 8;
    browserSupport.vibrate(pattern);
  }

  triggerShutterCapture() {
    soundManager.playShutterSound();
    this.triggerHaptic('shutter');
  }

  triggerCountdownTick(isFinal = false) {
    soundManager.playCountdownTick(isFinal);
    this.triggerHaptic(isFinal ? 'button' : 'light');
  }

  triggerButtonClick() {
    soundManager.playButtonClick();
    this.triggerHaptic('button');
  }

  triggerSnapFeedback() {
    soundManager.playSnapTick();
    this.triggerHaptic('snap');
  }

  triggerSuccess(message = '') {
    soundManager.playSuccessChime();
    this.triggerHaptic('success');
    if (message) {
      this.showToast(message, { type: 'success', duration: 2400 });
    }
  }

  showToast(message, { type = 'info', duration = 2500 } = {}) {
    if (typeof document === 'undefined') return;

    let toastEl = document.getElementById('microToast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'microToast';
      toastEl.className = 'micro-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }

    if (this._toastTimeout) {
      clearTimeout(this._toastTimeout);
      this._toastTimeout = null;
    }

    toastEl.textContent = message;
    toastEl.className = `micro-toast active toast-${type}`;

    this._toastTimeout = setTimeout(() => {
      toastEl.classList.remove('active');
      this._toastTimeout = null;
    }, duration);
  }

  showInlineStatus(targetElement, text, duration = 2000) {
    if (!targetElement) return;
    const prevText = targetElement.textContent;
    targetElement.textContent = text;
    targetElement.classList.add('inline-status-active');

    setTimeout(() => {
      targetElement.textContent = prevText;
      targetElement.classList.remove('inline-status-active');
    }, duration);
  }
}

export const feedbackManager = new FeedbackManager();
