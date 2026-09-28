
import { LocalAIProvider, CustomProxyAIProvider, preparePhotoForAI } from './aiProvider.js';
import { aiSettings } from './aiSettings.js';

export class AIManager {
  constructor() {
    this.settings = aiSettings;
    this._provider = null;
    this._activeController = null;
    this._isRequestActive = false;
    this._lastRequestTimestamp = 0;
    this._cooldownMs = 250; 
    this._listeners = new Set();

    this._initProvider();
    this.settings.subscribe(() => this._initProvider());
  }

  _initProvider() {
    const providerType = this.settings.get('providerType');
    const proxyEndpoint = this.settings.get('proxyEndpoint');

    if (providerType === 'custom-proxy' && proxyEndpoint) {
      this._provider = new CustomProxyAIProvider(proxyEndpoint);
    } else {
      this._provider = new LocalAIProvider();
    }
  }

  get isEnabled() {
    return Boolean(this.settings.get('enabled'));
  }

  get isPhotoAiEnabled() {
    return Boolean(this.settings.get('enabled') && this.settings.get('photoAiEnabled'));
  }

  getStatus() {
    if (!this.isEnabled) return 'disabled';
    if (!navigator.onLine && this.settings.get('providerType') === 'custom-proxy') {
      return 'offline-local-fallback';
    }
    return 'available';
  }

  cancelActiveRequest() {
    if (this._activeController) {
      this._activeController.abort();
      this._activeController = null;
    }
    this._isRequestActive = false;
    this._notifyListeners({ type: 'cancelled' });
  }

  async _executeRequest(actionName, executeFn) {
    if (!this.isEnabled) {
      throw new Error('AI features are currently disabled in Settings.');
    }

    const now = Date.now();
    if (now - this._lastRequestTimestamp < this._cooldownMs) {
      await new Promise(r => setTimeout(r, this._cooldownMs - (now - this._lastRequestTimestamp)));
    }
    this._lastRequestTimestamp = Date.now();

    this.cancelActiveRequest();

    const controller = new AbortController();
    this._activeController = controller;
    this._isRequestActive = true;

    this._notifyListeners({ type: 'start', action: actionName });

    try {
      const result = await executeFn(controller.signal);
      this._isRequestActive = false;
      this._activeController = null;
      this._notifyListeners({ type: 'success', action: actionName, result });
      return result;
    } catch (err) {
      this._isRequestActive = false;
      this._activeController = null;

      if (err.name === 'AbortError') {
        this._notifyListeners({ type: 'aborted', action: actionName });
        return null;
      }

      console.warn(`AI Manager ${actionName} error:`, err);
      this._notifyListeners({ type: 'error', action: actionName, error: err });
      throw err;
    }
  }

  async generateCaptions({ style = 'cute', count = 3 } = {}) {
    if (!this.settings.isFeatureEnabled('caption')) {
      throw new Error('Caption generation is disabled.');
    }

    return this._executeRequest('generateCaptions', async (signal) => {
      const captions = await this._provider.generateCaptions({ style, count, signal });
      this.recordUsage('caption');
      return captions;
    });
  }

  async suggestPose({ category = 'all', groupSize = 1 } = {}) {
    if (!this.settings.isFeatureEnabled('pose')) {
      throw new Error('Pose suggestions are disabled.');
    }

    return this._executeRequest('suggestPose', async (signal) => {
      const pose = await this._provider.suggestPose({ category, groupSize, signal });
      this.recordUsage('suggestion');
      return pose;
    });
  }

  async suggestTheme({ currentMood = 'warm' } = {}) {
    if (!this.settings.isFeatureEnabled('theme')) {
      throw new Error('Theme suggestions are disabled.');
    }

    return this._executeRequest('suggestTheme', async (signal) => {
      const theme = await this._provider.suggestTheme({ currentMood, signal });
      this.recordUsage('suggestion');
      return theme;
    });
  }

  async suggestStickers({ mood = 'cute', count = 4 } = {}) {
    if (!this.settings.isFeatureEnabled('sticker')) {
      throw new Error('Sticker suggestions are disabled.');
    }

    return this._executeRequest('suggestStickers', async (signal) => {
      const stickers = await this._provider.suggestStickers({ mood, count, signal });
      this.recordUsage('suggestion');
      return stickers;
    });
  }

  async suggestCollageLayout({ photoCount = 4, style = 'classic' } = {}) {
    if (!this.settings.isFeatureEnabled('collage')) {
      throw new Error('Collage suggestions are disabled.');
    }

    return this._executeRequest('suggestCollageLayout', async (signal) => {
      const layout = await this._provider.suggestCollageLayout({ photoCount, style, signal });
      this.recordUsage('suggestion');
      return layout;
    });
  }

  async planSession({ mood = 'fun', groupSize = 1 } = {}) {
    return this._executeRequest('planSession', async (signal) => {
      const plan = await this._provider.planSession({ mood, groupSize, signal });
      this.recordUsage('suggestion');
      return plan;
    });
  }

  async analyzePhoto({ photoDataUrl } = {}) {
    if (!this.isPhotoAiEnabled) {
      throw new Error('Photo AI is disabled. Please enable it in Settings.');
    }
    if (!photoDataUrl) {
      throw new Error('No photo provided for analysis.');
    }

    return this._executeRequest('analyzePhoto', async (signal) => {
      const downscaled = await preparePhotoForAI(photoDataUrl);
      const result = await this._provider.analyzePhoto({ photoDataUrl: downscaled, signal });
      this.recordUsage('photoEnhancement');
      return result;
    });
  }

  recordUsage(metricType) {
    if (typeof window !== 'undefined' && window.__sayCheeseStats?.currentSession) {
      const s = window.__sayCheeseStats.currentSession;
      if (metricType === 'caption') {
        s.aiCaptionsGenerated = (s.aiCaptionsGenerated || 0) + 1;
      } else if (metricType === 'suggestion') {
        s.aiSuggestionsUsed = (s.aiSuggestionsUsed || 0) + 1;
      } else if (metricType === 'photoEnhancement') {
        s.aiPhotoEnhancements = (s.aiPhotoEnhancements || 0) + 1;
      }
    }
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notifyListeners(event) {
    for (const cb of this._listeners) {
      try {
        cb(event);
      } catch (e) {
        console.error('Error in AI Manager subscriber:', e);
      }
    }
  }
}

export const aiManager = new AIManager();
if (typeof window !== 'undefined') {
  window.__sayCheeseAI = aiManager;
}
