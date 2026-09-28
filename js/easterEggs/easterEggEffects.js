
import { soundManager } from '../audio/soundManager.js';
import { feedbackManager } from '../ui/feedbackManager.js';
import { SECRET_STICKERS, RARE_BOOTH_MESSAGES } from './easterEggRegistry.js';

export class EasterEggEffects {
  static triggerShutterFlutter() {

    soundManager.playButtonClick();
    setTimeout(() => soundManager.playSnapTick(), 80);
    setTimeout(() => soundManager.playSnapTick(), 160);
    setTimeout(() => soundManager.playSuccessChime(), 260);

    feedbackManager.triggerHaptic('snap');
    feedbackManager.showToast('✦ Secret Shutter Flutter Unlocked! 🎟️', { type: 'success', duration: 3000 });
  }

  static triggerArcadeUnlock() {
    soundManager.playSuccessChime();
    feedbackManager.triggerHaptic('success');
    feedbackManager.showToast('🕹️ Retro Arcade Mode Unlocked! 🎞️', { type: 'success', duration: 3200 });

    const headerTitle = document.getElementById('headerBrandTitle');
    if (headerTitle) {
      headerTitle.classList.add('secret-sparkle-active');
      setTimeout(() => headerTitle.classList.remove('secret-sparkle-active'), 2500);
    }
  }

  static triggerBrandSparkle() {
    soundManager.playSuccessChime();
    feedbackManager.triggerHaptic('light');
    feedbackManager.showToast('💛 You found the booth\'s secret heart! 📷', { type: 'success', duration: 3000 });

    const headerBrand = document.getElementById('headerBrand');
    if (headerBrand) {
      headerBrand.classList.add('secret-sparkle-active');
      setTimeout(() => headerBrand.classList.remove('secret-sparkle-active'), 2000);
    }
  }

  static triggerIdleWhisper() {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    if (!statusText || !statusDot) return;

    const randomMsg = RARE_BOOTH_MESSAGES[Math.floor(Math.random() * RARE_BOOTH_MESSAGES.length)];
    const originalText = statusText.textContent;

    statusDot.classList.add('idle-whisper-dot');
    statusText.textContent = randomMsg;
    statusText.classList.add('inline-status-active');

    setTimeout(() => {
      statusDot.classList.remove('idle-whisper-dot');
      statusText.textContent = originalText;
      statusText.classList.remove('inline-status-active');
    }, 5000);
  }

  static triggerGoldenFlash() {
    const flash = document.getElementById('flashLayer');
    if (flash) {
      flash.classList.add('golden-flash-active');
      setTimeout(() => flash.classList.remove('golden-flash-active'), 350);
    }
    soundManager.playSuccessChime();
    feedbackManager.showToast('✦ Golden Hour Moment Captured! 👑', { type: 'success', duration: 2500 });
  }

  static triggerRareMessage() {
    const msg = RARE_BOOTH_MESSAGES[Math.floor(Math.random() * RARE_BOOTH_MESSAGES.length)];
    feedbackManager.showToast(msg, { type: 'success', duration: 3000 });
  }
}
