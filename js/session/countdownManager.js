import { soundManager } from '../audio/soundManager.js';

export class CountdownManager {
  constructor() {
    this.timerId = null;
    this.isActive = false;
  }

  startCountdown(seconds, { onTick, onComplete, onCancel } = {}) {
    this.cancel();
    this.isActive = true;
    let remaining = seconds;

    soundManager.playCountdownTick(false);
    if (onTick) onTick(remaining);

    this.timerId = setInterval(() => {
      remaining -= 1;

      if (remaining > 0) {
        soundManager.playCountdownTick(false);
        if (onTick) onTick(remaining);
      } else {
        this.cancel();
        soundManager.playCountdownTick(true);
        if (onTick) onTick(0);
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  cancel() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isActive = false;
  }
}
