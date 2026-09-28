
import { SECURITY_LIMITS } from './securityLimits.js';
import { InputValidator } from './inputValidator.js';
import { sanitizeText, sanitizeFilename, sanitizeColor, safeDeepClone } from './sanitizer.js';

export class SecurityManager {
  constructor() {
    this._trackedObjectURLs = new Set();
    this._activeGuardedTasks = new Set();
    this.limits = SECURITY_LIMITS;
    this.validator = InputValidator;
  }

  createTrackedObjectURL(blob) {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return '';
    }
    try {
      const url = URL.createObjectURL(blob);
      this._trackedObjectURLs.add(url);
      return url;
    } catch (err) {
      console.warn('Failed to create Object URL:', err);
      return '';
    }
  }

  revokeTrackedObjectURL(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('blob:')) return;
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      try {
        URL.revokeObjectURL(url);
        this._trackedObjectURLs.delete(url);
      } catch (err) {
        console.warn('Error revoking Object URL:', err);
      }
    }
  }

  revokeAllTrackedObjectURLs() {
    for (const url of this._trackedObjectURLs) {
      this.revokeTrackedObjectURL(url);
    }
    this._trackedObjectURLs.clear();
  }

  async runGuardedTask(taskKey, taskFn, timeoutMs = SECURITY_LIMITS.OPERATION_TIMEOUT_MS) {
    if (this._activeGuardedTasks.has(taskKey)) {
      throw new Error(`An operation of type "${taskKey}" is already in progress. Please wait for it to finish.`);
    }

    this._activeGuardedTasks.add(taskKey);

    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation "${taskKey}" timed out after ${Math.round(timeoutMs / 1000)}s.`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([taskFn(), timeoutPromise]);
      return result;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      this._activeGuardedTasks.delete(taskKey);
    }
  }

  async loadSafeImage(sourceUrlOrBlob, { timeoutMs = SECURITY_LIMITS.REMOTE_FETCH_TIMEOUT_MS } = {}) {
    return new Promise((resolve, reject) => {
      let isSettled = false;
      let tempUrl = null;

      let src = '';
      if (sourceUrlOrBlob instanceof Blob) {
        tempUrl = this.createTrackedObjectURL(sourceUrlOrBlob);
        src = tempUrl;
      } else if (typeof sourceUrlOrBlob === 'string') {
        const urlValidation = InputValidator.validateUrl(sourceUrlOrBlob);
        if (!urlValidation.valid) {
          return reject(new Error(urlValidation.error));
        }
        src = urlValidation.url;
      } else {
        return reject(new Error('Invalid image source provided.'));
      }

      const img = new Image();
      if (!src.startsWith('data:') && !src.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }

      const timer = setTimeout(() => {
        if (isSettled) return;
        isSettled = true;
        img.src = '';
        if (tempUrl) this.revokeTrackedObjectURL(tempUrl);
        reject(new Error(`Image loading timed out (${Math.round(timeoutMs / 1000)}s).`));
      }, timeoutMs);

      img.onload = () => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);

        const dimCheck = InputValidator.validateImageDimensions(img.naturalWidth || img.width, img.naturalHeight || img.height);
        if (!dimCheck.valid) {
          if (tempUrl) this.revokeTrackedObjectURL(tempUrl);
          return reject(new Error(dimCheck.error));
        }

        resolve({ img, tempUrl });
      };

      img.onerror = (err) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        if (tempUrl) this.revokeTrackedObjectURL(tempUrl);
        reject(new Error('Failed to decode image data. Format may be corrupt or unsupported.'));
      };

      img.src = src;
    });
  }

  sanitizeText(text, maxLen) {
    return sanitizeText(text, maxLen);
  }

  sanitizeFilename(name, defaultName) {
    return sanitizeFilename(name, defaultName);
  }

  sanitizeColor(color, fallback) {
    return sanitizeColor(color, fallback);
  }

  safeDeepClone(obj) {
    return safeDeepClone(obj);
  }
}

export const securityManager = new SecurityManager();
if (typeof window !== 'undefined') {
  window.__sayCheeseSecurity = securityManager;
}
