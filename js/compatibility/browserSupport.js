
export class BrowserSupport {
  constructor() {
    this._capabilities = null;
    this._wakeLockSentinel = null;
    this._initCapabilities();
  }

  _initCapabilities() {
    const isBrowser = typeof window !== 'undefined';
    const nav = typeof navigator !== 'undefined' ? navigator : {};

    const isMac = isBrowser && /Mac|iPhone|iPad|iPod/i.test(nav.platform || nav.userAgent || '');
    const isIOS = isBrowser && /iPhone|iPad|iPod/i.test(nav.userAgent || '');
    const isAndroid = isBrowser && /Android/i.test(nav.userAgent || '');
    const isMobile = isIOS || isAndroid || (isBrowser && /Mobile/i.test(nav.userAgent || ''));
    const isTouch = isBrowser && ('ontouchstart' in window || (nav.maxTouchPoints && nav.maxTouchPoints > 0));

    let supportsLocalStorage = false;
    try {
      if (isBrowser && window.localStorage) {
        const testKey = '__saycheese_compat_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        supportsLocalStorage = true;
      }
    } catch (e) {
      supportsLocalStorage = false;
    }

    let supportsIndexedDB = false;
    try {
      supportsIndexedDB = isBrowser && 'indexedDB' in window && window.indexedDB !== null;
    } catch (e) {
      supportsIndexedDB = false;
    }

    const supportsCamera = isBrowser && !!(nav.mediaDevices && typeof nav.mediaDevices.getUserMedia === 'function');
    const supportsWebAudio = isBrowser && !!(window.AudioContext || window.webkitAudioContext);
    const supportsMediaRecorder = isBrowser && typeof window.MediaRecorder === 'function';
    const supportsWakeLock = isBrowser && 'wakeLock' in nav && typeof nav.wakeLock.request === 'function';
    const supportsVibration = isBrowser && typeof nav.vibrate === 'function';

    const supportsClipboard = isBrowser && !!(nav.clipboard && typeof nav.clipboard.write === 'function');
    const supportsClipboardImage = supportsClipboard && typeof window.ClipboardItem !== 'undefined';
    const supportsShare = isBrowser && typeof nav.share === 'function';
    const supportsShareFiles = isBrowser && typeof nav.canShare === 'function';

    const supportsOffscreenCanvas = typeof OffscreenCanvas === 'function';
    const supportsImageBitmap = typeof createImageBitmap === 'function';
    const supportsFileSystemAccess = isBrowser && typeof window.showSaveFilePicker === 'function';
    const supportsResizeObserver = typeof ResizeObserver === 'function';
    const supportsIntersectionObserver = typeof IntersectionObserver === 'function';
    const supportsServiceWorker = isBrowser && 'serviceWorker' in nav;
    const supportsCaches = isBrowser && 'caches' in window;

    let supportsWebP = false;
    try {
      if (isBrowser) {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
          supportsWebP = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
      }
    } catch (e) {
      supportsWebP = false;
    }

    this._capabilities = {
      isMac,
      isIOS,
      isAndroid,
      isMobile,
      isTouch,
      supportsLocalStorage,
      supportsIndexedDB,
      supportsCamera,
      supportsWebAudio,
      supportsMediaRecorder,
      supportsWakeLock,
      supportsVibration,
      supportsClipboard,
      supportsClipboardImage,
      supportsShare,
      supportsShareFiles,
      supportsOffscreenCanvas,
      supportsImageBitmap,
      supportsFileSystemAccess,
      supportsResizeObserver,
      supportsIntersectionObserver,
      supportsServiceWorker,
      supportsCaches,
      supportsWebP,
    };
  }

  get capabilities() {
    if (!this._capabilities) {
      this._initCapabilities();
    }
    return this._capabilities;
  }

  getModifierKey(useSymbol = false) {
    if (this.capabilities.isMac) {
      return useSymbol ? '⌘' : 'Cmd';
    }
    return 'Ctrl';
  }

  async safeClipboardWriteImage(blob, textFallback = 'Say Cheese Photo') {
    if (!this.capabilities.supportsClipboardImage || !blob) {
      if (this.capabilities.supportsClipboard && textFallback) {
        await navigator.clipboard.writeText(textFallback);
        return { success: true, mode: 'text' };
      }
      throw new Error('Clipboard image writing is not supported in this browser.');
    }

    try {
      const item = new window.ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      return { success: true, mode: 'image' };
    } catch (err) {

      if (this.capabilities.supportsClipboard && textFallback) {
        try {
          await navigator.clipboard.writeText(textFallback);
          return { success: true, mode: 'text' };
        } catch (textErr) {}
      }
      throw err;
    }
  }

  async safeShare({ title = 'Say Cheese', text = 'Check out my photobooth print!', files = [], url = '' } = {}) {
    if (!this.capabilities.supportsShare) {
      return { supported: false };
    }

    const shareData = { title, text };
    if (url) shareData.url = url;

    if (files && files.length > 0 && this.capabilities.supportsShareFiles) {
      try {
        if (navigator.canShare({ files })) {
          shareData.files = files;
        }
      } catch (e) {}
    }

    try {
      await navigator.share(shareData);
      return { supported: true, shared: true };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { supported: true, shared: false, cancelled: true };
      }
      throw err;
    }
  }

  async requestWakeLock() {
    if (!this.capabilities.supportsWakeLock || this._wakeLockSentinel) return;
    try {
      this._wakeLockSentinel = await navigator.wakeLock.request('screen');
      this._wakeLockSentinel.addEventListener('release', () => {
        this._wakeLockSentinel = null;
      });
    } catch (e) {
      this._wakeLockSentinel = null;
    }
  }

  releaseWakeLock() {
    if (this._wakeLockSentinel) {
      try {
        this._wakeLockSentinel.release();
      } catch (e) {}
      this._wakeLockSentinel = null;
    }
  }

  vibrate(pattern = 10) {
    if (this.capabilities.supportsVibration) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  getDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      ...this.capabilities,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
  }
}

export const browserSupport = new BrowserSupport();
