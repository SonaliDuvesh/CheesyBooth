import { soundManager } from '../audio/soundManager.js';
import { CountdownManager } from './countdownManager.js';
import { posePromptManager } from './posePromptManager.js';
import { voiceTriggerManager } from './voiceTriggerManager.js';
import { getFunMode, getRandomPrompt, FUN_MODES } from '../modes/funModes.js';

export class SessionManager {
  constructor({ cameraManager, photoManager }) {
    this.camera = cameraManager;
    this.photos = photoManager;
    this.countdown = new CountdownManager();
    this.posePrompts = posePromptManager;
    this.voiceTrigger = voiceTriggerManager;

    this.countdownSeconds = 5;
    this.triggerMode = 'camera'; 
    this.currentMode = getFunMode('classic');
    this.usedPromptIds = new Set();
    this.sessionShotHistory = []; 

    this.state = 'idle'; 
    this.retakeIndex = -1; 
    this.isPaused = false;
    this._isProcessingCapture = false;
    this._interShotTimeout = null;
    this._currentShotMetadata = null;

    this.onStateChange = null;
    this.onCountdownTick = null;
    this.onFlashTrigger = null;
    this.onPosePrompt = null;
    this.onMysteryReveal = null;
    this.onFreezeCue = null;
    this.onPhotoCaptured = null;
    this.onVoiceStateChange = null;
    this.onVoiceTriggerDetected = null;
  }

  setCountdownDuration(seconds) {
    this.countdownSeconds = parseInt(seconds, 10) || 5;
  }

  setPosePromptMode(mode) {
    this.posePrompts.setMode(mode);
  }

  setMode(modeIdOrObj) {
    if (typeof modeIdOrObj === 'string') {
      this.currentMode = getFunMode(modeIdOrObj);
    } else if (modeIdOrObj && modeIdOrObj.id) {
      this.currentMode = modeIdOrObj;
    }
  }

  setState(newState, extra = {}) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.state, {
        currentCount: this.photos.count,
        targetCount: this.photos.targetCount,
        retakeIndex: this.retakeIndex,
        isPaused: this.isPaused,
        mode: this.currentMode,
        triggerMode: this.triggerMode,
        sessionShotHistory: this.sessionShotHistory,
        currentShot: this._currentShotMetadata,
        ...extra,
      });
    }
  }

  startSession(options = {}) {
    if (this._isProcessingCapture) return;
    this.triggerMode = options.triggerMode || 'camera';
    this.clearInterShotTimer();
    this.countdown.cancel();
    if (this.voiceTrigger) this.voiceTrigger.stop();
    this.retakeIndex = -1;
    this.isPaused = false;
    this.photos.clearPhotos();
    this.posePrompts.resetSession();
    this.usedPromptIds.clear();
    this.sessionShotHistory = [];
    this._currentShotMetadata = null;
    this.setState('starting', { triggerMode: this.triggerMode });

    const prepDelay = this.triggerMode === 'voice' ? 300 : (this.currentMode.id === 'rapid-fire' ? 200 : 400);
    setTimeout(() => {
      this._runNextShotCycle();
    }, prepDelay);
  }

  startRetake(photoIndex, options = {}) {
    if (this._isProcessingCapture) return;
    if (this.currentMode.behavior && this.currentMode.behavior.allowRetake === false) {
      return false;
    }

    this.triggerMode = options.triggerMode || 'camera';
    this.clearInterShotTimer();
    this.countdown.cancel();
    if (this.voiceTrigger) this.voiceTrigger.stop();
    this.retakeIndex = photoIndex;
    this.isPaused = false;
    this.setState('starting', { triggerMode: this.triggerMode });

    setTimeout(() => {
      this._runNextShotCycle();
    }, 300);
    return true;
  }

  pauseSession() {
    if (this.state === 'countdown' || this.state === 'prompt' || this.state === 'starting' || this.state === 'listening') {
      this.isPaused = true;
      this.clearInterShotTimer();
      this.countdown.cancel();
      if (this.voiceTrigger) this.voiceTrigger.stop();
      this.setState('paused');
    }
  }

  resumeSession() {
    if (this.isPaused && this.state === 'paused') {
      this.isPaused = false;
      this.setState('starting', { triggerMode: this.triggerMode });
      setTimeout(() => {
        this._runNextShotCycle();
      }, 400);
    }
  }

  clearInterShotTimer() {
    if (this._interShotTimeout) {
      clearTimeout(this._interShotTimeout);
      this._interShotTimeout = null;
    }
  }

  _runNextShotCycle() {
    if (this.isPaused) return;

    if (this.retakeIndex === -1 && this.photos.isComplete) {
      if (this.voiceTrigger) this.voiceTrigger.stop();
      this.setState('review');
      return;
    }

    const currentIdx = this.retakeIndex >= 0 ? this.retakeIndex : this.photos.count;

    if (this.triggerMode === 'voice') {
      this._currentShotMetadata = {
        index: currentIdx,
        modeType: 'voice',
        prompt: 'Say "Say Cheese" 📸',
        countdown: 0,
        isMystery: false,
        isFreeze: false,
        mysteryRevealed: false,
        triggerMode: 'voice',
      };

      this.setState('listening', {
        triggerMode: 'voice',
        currentShotIndex: currentIdx,
        targetCount: this.photos.targetCount,
      });

      if (this.voiceTrigger) {
        this.voiceTrigger.onTrigger = (phrase) => {
          if (this.state !== 'listening' || this._isProcessingCapture) return;
          this.setState('triggered', { phrase, triggerMode: 'voice' });
          if (this.onVoiceTriggerDetected) {
            this.onVoiceTriggerDetected(phrase);
          }
          this._captureCurrentShot();
        };

        this.voiceTrigger.onStateChange = (vState, vMeta) => {
          if (this.onVoiceStateChange) {
            this.onVoiceStateChange(vState, vMeta);
          }
        };

        this.voiceTrigger.startListening({
          shotIndex: currentIdx + 1,
          targetCount: this.photos.targetCount,
        });
      }
      return;
    }

    const mode = this.currentMode;
    const behavior = mode.behavior || {};

    let activeType = behavior.type || 'classic';
    let shotPrompt = null;
    let shotCountdown = this.countdownSeconds;

    if (activeType === 'random-mix') {
      const subModes = behavior.subModes || ['rapid-fire', 'pose-challenge', 'mystery-pose', 'reaction', 'freeze-frame', 'countdown-chaos'];
      const chosenSubId = subModes[Math.floor(Math.random() * subModes.length)];
      const chosenSub = getFunMode(chosenSubId);
      activeType = chosenSub.behavior.type;
    }

    if (activeType === 'rapid') {
      shotCountdown = behavior.countdownOverride || 2;
      shotPrompt = null;
    } else if (activeType === 'cinematic') {
      shotCountdown = behavior.countdownOverride || 5;
      shotPrompt = 'Breathe and take your time... 🌿';
    } else if (activeType === 'chaos') {
      const timers = behavior.randomTimers || [1, 2, 3, 5, 7];
      shotCountdown = timers[Math.floor(Math.random() * timers.length)];
      shotPrompt = `Chaos Timer: ${shotCountdown}s! 🎲`;
    } else if (activeType === 'pose-challenge') {
      const p = getRandomPrompt(behavior.promptCategories || ['expression', 'gesture', 'movement', 'silly'], this.usedPromptIds);
      shotPrompt = p.text;
    } else if (activeType === 'mystery') {
      const p = getRandomPrompt(behavior.promptCategories || ['expression', 'gesture', 'movement', 'silly'], this.usedPromptIds);
      shotPrompt = p.text; 
    } else if (activeType === 'reaction') {
      const p = getRandomPrompt(['expression', 'silly'], this.usedPromptIds);
      shotPrompt = p.text;
    } else if (activeType === 'duo') {
      const p = getRandomPrompt(['duo', 'gesture', 'silly'], this.usedPromptIds);
      shotPrompt = p.text;
      shotCountdown = behavior.countdownOverride || 5;
    } else if (activeType === 'freeze') {
      shotPrompt = 'MOVE... MOVE... 🏃';
    } else {

      if (this.posePrompts.mode !== 'off') {
        shotPrompt = this.posePrompts.getNextPrompt(currentIdx, this.photos.targetCount);
      }
    }

    this._currentShotMetadata = {
      index: currentIdx,
      modeType: activeType,
      prompt: shotPrompt,
      countdown: shotCountdown,
      isMystery: activeType === 'mystery',
      isFreeze: activeType === 'freeze',
      mysteryRevealed: false,
    };

    if (shotPrompt && activeType !== 'rapid' && activeType !== 'freeze') {
      this.setState('prompt', { prompt: activeType === 'mystery' ? '❓ Mystery Pose coming...' : shotPrompt });
      if (this.onPosePrompt) {
        this.onPosePrompt(activeType === 'mystery' ? '❓ Mystery Pose coming...' : shotPrompt, currentIdx);
      }

      const promptReadDelay = activeType === 'cinematic' ? 1000 : 750;
      this._interShotTimeout = setTimeout(() => {
        this._startCountdownPhase(shotCountdown);
      }, promptReadDelay);
    } else {
      this._startCountdownPhase(shotCountdown);
    }
  }

  _startCountdownPhase(seconds) {
    if (this.isPaused) return;
    this.setState('countdown');

    const meta = this._currentShotMetadata;

    if (meta && meta.isFreeze) {
      if (this.onFreezeCue) this.onFreezeCue(false);
      if (this.onPosePrompt) this.onPosePrompt('MOVE AROUND... 🏃', meta.index);
    }

    this.countdown.startCountdown(seconds, {
      onTick: (remaining) => {
        if (this.onCountdownTick) this.onCountdownTick(remaining, seconds);

        if (meta && meta.isMystery && !meta.mysteryRevealed && remaining <= 2 && remaining > 0) {
          meta.mysteryRevealed = true;
          soundManager.playButtonClick();
          if (this.onMysteryReveal) this.onMysteryReveal(meta.prompt);
          if (this.onPosePrompt) this.onPosePrompt(`✨ REVEAL: ${meta.prompt}`, meta.index);
        }

        if (meta && meta.isFreeze && remaining <= 2 && remaining > 0) {
          if (this.onFreezeCue) this.onFreezeCue(true);
          if (this.onPosePrompt) this.onPosePrompt('🧊 FREEZE! HOLD STILL!', meta.index);
        }
      },
      onComplete: () => {
        this._captureCurrentShot();
      },
    });
  }

  _captureCurrentShot() {
    if (this._isProcessingCapture) return;
    this._isProcessingCapture = true;

    this.setState('capturing');

    if (this.onFlashTrigger) this.onFlashTrigger();

    if (this.currentMode.id !== 'silent-booth' && !this.currentMode.behavior?.silentAudio) {
      if (this.currentMode.audioProfile === 'soft') {
        soundManager.playButtonClick();
      } else {
        soundManager.playShutterSound();
      }
    }

    const frame = this.camera.captureFrame();
    const meta = this._currentShotMetadata || { index: this.photos.count, prompt: '', countdown: this.countdownSeconds };

    this.sessionShotHistory.push({
      shotIndex: meta.index,
      modeId: this.currentMode.id,
      modeName: this.currentMode.name,
      modeType: meta.modeType,
      prompt: meta.prompt || 'Classic',
      countdown: meta.countdown,
      timestamp: Date.now(),
    });

    const interShotDelay = this.currentMode.behavior?.interShotDelayMs || 700;

    if (this.retakeIndex >= 0) {

      this.photos.replacePhotoAt(this.retakeIndex, frame);
      const retakeTarget = this.retakeIndex;
      this.retakeIndex = -1;

      if (this.onPhotoCaptured) this.onPhotoCaptured(retakeTarget, frame);

      this.setState('captured');
      this._interShotTimeout = setTimeout(() => {
        this._isProcessingCapture = false;
        if (this.voiceTrigger) this.voiceTrigger.stop();
        this.setState('review');
      }, interShotDelay);
    } else {

      this.photos.addPhoto(frame);
      const capturedIdx = this.photos.count - 1;

      if (this.onPhotoCaptured) this.onPhotoCaptured(capturedIdx, frame);

      this.setState('captured');

      this._interShotTimeout = setTimeout(() => {
        this._isProcessingCapture = false;
        if (this.photos.isComplete) {
          if (this.voiceTrigger) this.voiceTrigger.stop();
          this.setState('review');
        } else {
          this._runNextShotCycle();
        }
      }, interShotDelay);
    }
  }

  snapImmediately() {
    if (this.state === 'countdown' || this.state === 'prompt') {
      this.clearInterShotTimer();
      this.countdown.cancel();
      this._captureCurrentShot();
    }
  }

  stopSession() {
    this.clearInterShotTimer();
    this.countdown.cancel();
    if (this.voiceTrigger) this.voiceTrigger.stop();
    this.retakeIndex = -1;
    this.isPaused = false;
    this._isProcessingCapture = false;
    this.setState('idle');
  }
}
