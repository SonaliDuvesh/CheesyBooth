
export class VoiceTriggerManager {
  constructor() {
    const SpeechRecognitionClass = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
      : null;

    this.SpeechRecognitionClass = SpeechRecognitionClass;
    this.isSupported = Boolean(SpeechRecognitionClass);

    this.recognition = null;
    this.state = 'idle'; 
    this._isLocked = false; 
    this._isExplicitlyStopped = true;
    this._lastTriggerTime = 0;
    this._debounceMs = 1200;

    this.triggerRegex = /\b(say\s+)?(che+s+e+|chee+z+e*|chee+se|chees|smile|snap|cheese\s+please)\b/i;

    this.onStateChange = null;
    this.onTrigger = null;
    this.onError = null;
  }

  checkSupport() {
    return this.isSupported;
  }

  setState(newState, metadata = {}) {
    this.state = newState;
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.state, metadata);
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      const err = new Error('Speech recognition is not supported in this browser.');
      err.code = 'NOT_SUPPORTED';
      throw err;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (err) {
        const error = new Error('Microphone permission denied.');
        error.code = err.name === 'NotAllowedError' ? 'PERMISSION_DENIED' : 'MIC_ERROR';
        throw error;
      }
    }
    return true;
  }

  async startListening(options = {}) {
    if (!this.isSupported) {
      this.setState('error', { reason: 'not_supported' });
      if (typeof this.onError === 'function') {
        this.onError('not_supported', 'Speech recognition is not supported in this browser.');
      }
      return false;
    }

    this._isExplicitlyStopped = false;
    this._isLocked = false;

    if (!this.recognition) {
      this._initRecognition();
    }

    try {
      this.setState('listening', options);
      this.recognition.start();
      return true;
    } catch (e) {

      if (e.name !== 'InvalidStateError') {
        console.warn('Voice recognition start error:', e);
      }
      return true;
    }
  }

  _initRecognition() {
    if (!this.SpeechRecognitionClass) return;

    try {
      const recognition = new this.SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (!this._isExplicitlyStopped) {
          this.setState('listening');
        }
      };

      recognition.onresult = (event) => {
        if (this._isLocked || this._isExplicitlyStopped) return;

        const now = Date.now();
        if (now - this._lastTriggerTime < this._debounceMs) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          for (let j = 0; j < result.length; j++) {
            const transcript = result[j].transcript.trim().toLowerCase();
            if (this.triggerRegex.test(transcript)) {
              this._handleTrigger(transcript);
              return;
            }
          }
        }
      };

      recognition.onerror = (event) => {
        if (this._isExplicitlyStopped) return;

        if (event.error === 'not-allowed') {
          this.setState('error', { reason: 'permission_denied' });
          if (typeof this.onError === 'function') {
            this.onError('permission_denied', 'Microphone access was denied.');
          }
        } else if (event.error === 'no-speech') {

        } else if (event.error !== 'aborted') {
          console.warn('Voice recognition error:', event.error);
        }
      };

      recognition.onend = () => {

        if (!this._isExplicitlyStopped && !this._isLocked) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      this.recognition = recognition;
    } catch (err) {
      console.warn('Could not initialize SpeechRecognition:', err);
      this.isSupported = false;
    }
  }

  _handleTrigger(transcript) {
    if (this._isLocked) return;
    this._isLocked = true;
    this._lastTriggerTime = Date.now();
    this.setState('triggered', { phrase: transcript });

    if (typeof this.onTrigger === 'function') {
      this.onTrigger(transcript);
    }
  }

  rearm(options = {}) {
    this._isLocked = false;
    if (!this._isExplicitlyStopped) {
      this.setState('listening', options);
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    }
  }

  stop() {
    this._isExplicitlyStopped = true;
    this._isLocked = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.setState('idle');
  }

  abort() {
    this._isExplicitlyStopped = true;
    this._isLocked = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
    this.setState('idle');
  }
}

export const voiceTriggerManager = new VoiceTriggerManager();
