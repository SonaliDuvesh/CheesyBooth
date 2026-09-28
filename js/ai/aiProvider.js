
import { LocalAiFallback } from './localAiFallback.js';
import {
  sanitizeText,
  isContentSafe,
  validateThemeSuggestion,
  validateSessionPlan,
  validateStickerSuggestions
} from './aiPrompts.js';

export async function preparePhotoForAI(photoDataUrl, maxDimension = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const downscaledDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      canvas.width = 0;
      canvas.height = 0;
      resolve(downscaledDataUrl);
    };
    img.onerror = (err) => reject(new Error('Failed to load image for AI processing: ' + err));
    img.src = photoDataUrl;
  });
}

export class AIProvider {
  constructor(name = 'base') {
    this.name = name;
  }

  async generateCaptions(options = {}) {
    throw new Error('Not implemented');
  }

  async suggestPose(options = {}) {
    throw new Error('Not implemented');
  }

  async suggestTheme(options = {}) {
    throw new Error('Not implemented');
  }

  async suggestStickers(options = {}) {
    throw new Error('Not implemented');
  }

  async suggestCollageLayout(options = {}) {
    throw new Error('Not implemented');
  }

  async planSession(options = {}) {
    throw new Error('Not implemented');
  }

  async analyzePhoto(options = {}) {
    throw new Error('Not implemented');
  }

  async enhancePhoto(options = {}) {
    throw new Error('Not implemented');
  }
}

export class LocalAIProvider extends AIProvider {
  constructor() {
    super('local-simulation');
  }

  async generateCaptions({ style = 'cute', count = 3, signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    await new Promise(r => setTimeout(r, 200));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const raw = LocalAiFallback.generateCaptions({ style, count });
    return raw.filter(isContentSafe).map(c => sanitizeText(c, 100));
  }

  async suggestPose({ category = 'all', groupSize = 1, signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 180));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const res = LocalAiFallback.suggestPose({ category, groupSize });
    return {
      text: sanitizeText(res.text, 80),
      category: res.category,
      tip: sanitizeText(res.tip, 120),
    };
  }

  async suggestTheme({ currentMood = 'warm', signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 220));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const res = LocalAiFallback.suggestTheme({ currentMood });
    return validateThemeSuggestion(res);
  }

  async suggestStickers({ mood = 'cute', count = 4, signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 150));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const res = LocalAiFallback.suggestStickers({ mood, count });
    return validateStickerSuggestions(res);
  }

  async suggestCollageLayout({ photoCount = 4, style = 'classic', signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 180));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    return LocalAiFallback.suggestCollageLayout({ photoCount, style });
  }

  async planSession({ mood = 'fun', groupSize = 1, signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 250));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const raw = LocalAiFallback.planSession({ mood, groupSize });
    return validateSessionPlan(raw);
  }

  async analyzePhoto({ photoDataUrl, signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 300));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    return LocalAiFallback.analyzePhotoLocally();
  }

  async enhancePhoto({ photoDataUrl, signal } = {}) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise(r => setTimeout(r, 350));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    return {
      filterId: 'warm-vintage',
      intensity: 85,
      adjustments: { contrast: 1.05, brightness: 1.02, saturation: 1.08 },
    };
  }
}

export class CustomProxyAIProvider extends AIProvider {
  constructor(endpoint = '') {
    super('custom-proxy');
    this.endpoint = endpoint;
    this.localFallback = new LocalAIProvider();
  }

  async generateCaptions(options = {}) {
    if (!this.endpoint || !navigator.onLine) {
      return this.localFallback.generateCaptions(options);
    }

    try {
      const resp = await fetch(`${this.endpoint}/caption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: options.style, count: options.count }),
        signal: options.signal,
      });

      if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
      const data = await resp.json();
      if (Array.isArray(data?.captions)) {
        return data.captions.filter(isContentSafe).map(c => sanitizeText(c, 100));
      }
      return this.localFallback.generateCaptions(options);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('Proxy request failed, falling back to local AI heuristics:', err);
      return this.localFallback.generateCaptions(options);
    }
  }

  async suggestPose(options = {}) {
    if (!this.endpoint || !navigator.onLine) return this.localFallback.suggestPose(options);
    try {
      const resp = await fetch(`${this.endpoint}/pose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: options.category, groupSize: options.groupSize }),
        signal: options.signal,
      });
      if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
      const data = await resp.json();
      if (data?.text) {
        return {
          text: sanitizeText(data.text, 80),
          category: data.category || 'expression',
          tip: sanitizeText(data.tip || '', 120),
        };
      }
      return this.localFallback.suggestPose(options);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return this.localFallback.suggestPose(options);
    }
  }

  async suggestTheme(options = {}) {
    if (!this.endpoint || !navigator.onLine) return this.localFallback.suggestTheme(options);
    try {
      const resp = await fetch(`${this.endpoint}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: options.currentMood }),
        signal: options.signal,
      });
      if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
      const data = await resp.json();
      const validated = validateThemeSuggestion(data);
      return validated || this.localFallback.suggestTheme(options);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return this.localFallback.suggestTheme(options);
    }
  }

  async suggestStickers(options = {}) {
    return this.localFallback.suggestStickers(options);
  }

  async suggestCollageLayout(options = {}) {
    return this.localFallback.suggestCollageLayout(options);
  }

  async planSession(options = {}) {
    if (!this.endpoint || !navigator.onLine) return this.localFallback.planSession(options);
    try {
      const resp = await fetch(`${this.endpoint}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: options.mood, groupSize: options.groupSize }),
        signal: options.signal,
      });
      if (!resp.ok) throw new Error(`Proxy error: ${resp.status}`);
      const data = await resp.json();
      const validated = validateSessionPlan(data);
      return validated || this.localFallback.planSession(options);
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return this.localFallback.planSession(options);
    }
  }

  async analyzePhoto(options = {}) {
    return this.localFallback.analyzePhoto(options);
  }

  async enhancePhoto(options = {}) {
    return this.localFallback.enhancePhoto(options);
  }
}
