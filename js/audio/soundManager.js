
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.volume = 0.8;
    this.soundStyle = 'classic'; 
    this._isUnlocked = false;
    this._attachUnlockListeners();
  }

  _attachUnlockListeners() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this._initContext();
      if (this.audioCtx && this.audioCtx.state === 'running') {
        this._isUnlocked = true;
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
        window.removeEventListener('touchstart', unlock, true);
      }
    };
    window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    window.addEventListener('keydown', unlock, { capture: true, passive: true });
    window.addEventListener('touchstart', unlock, { capture: true, passive: true });
  }

  _initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        try {
          this.audioCtx = new AudioContext();
        } catch (e) {

        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch (e) {}
    }
  }

  setVolume(percent) {
    this.volume = Math.max(0, Math.min(100, percent)) / 100;
  }

  setSoundStyle(style) {
    if (['classic', 'soft', 'retro'].includes(style)) {
      this.soundStyle = style;
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    return this.isMuted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playCountdownTick(isFinal = false) {
    if (this.isMuted || this.volume <= 0) return;
    this._initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      let freq = isFinal ? 880 : 587.33;
      let waveType = 'sine';

      if (this.soundStyle === 'soft') {
        freq = isFinal ? 659.25 : 440; 
        waveType = 'sine';
      } else if (this.soundStyle === 'retro') {
        freq = isFinal ? 1046.5 : 783.99; 
        waveType = 'triangle';
      }

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      const gainLevel = (isFinal ? 0.15 : 0.10) * this.volume;
      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.16);
    } catch (e) {
      console.warn('Audio tick failed:', e);
    }
  }

  playShutterSound() {
    if (this.isMuted || this.volume <= 0) return;
    this._initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      const bufferSize = this.audioCtx.sampleRate * 0.12;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(this.soundStyle === 'soft' ? 1000 : 1400, now);
      filter.Q.setValueAtTime(this.soundStyle === 'retro' ? 4 : 3, now);

      const gain = this.audioCtx.createGain();
      const gainVal = (this.soundStyle === 'soft' ? 0.18 : 0.3) * this.volume;
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.12);

      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      const mirrorGain = (this.soundStyle === 'soft' ? 0.15 : 0.25) * this.volume;
      oscGain.gain.setValueAtTime(mirrorGain, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio shutter failed:', e);
    }
  }

  playButtonClick() {
    if (this.isMuted || this.volume <= 0) return;
    this._initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.audioCtx.currentTime + 0.06);

      const popGain = 0.08 * this.volume;
      gain.gain.setValueAtTime(popGain, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.07);
    } catch (e) {

    }
  }

  playSnapTick() {
    if (this.isMuted || this.volume <= 0) return;
    this._initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(310, this.audioCtx.currentTime + 0.04);

      const snapGain = 0.05 * this.volume;
      gain.gain.setValueAtTime(snapGain, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  playSuccessChime() {
    if (this.isMuted || this.volume <= 0) return;
    this._initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99]; 
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const noteGain = 0.07 * this.volume;
        gain.gain.setValueAtTime(noteGain, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.16);
      });
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();
