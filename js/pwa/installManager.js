
export class InstallManager {
  constructor() {
    this._deferredPrompt = null;
    this._isInstalled = this.checkIsInstalled();
    this._listeners = new Set();

    this._initListeners();
  }

  _initListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e) => {

      e.preventDefault();
      this._deferredPrompt = e;
      this._notify();
    });

    window.addEventListener('appinstalled', () => {
      this._deferredPrompt = null;
      this._isInstalled = true;
      this._notify();
    });

    try {
      const matchMediaStandalone = window.matchMedia('(display-mode: standalone)');
      matchMediaStandalone.addEventListener('change', (e) => {
        this._isInstalled = e.matches;
        this._notify();
      });
    } catch (e) {}
  }

  checkIsInstalled() {
    if (typeof window === 'undefined') return false;
    const isStandaloneDisplay = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = navigator.standalone === true;
    const isMinimalUI = window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches;
    return !!(isStandaloneDisplay || isIOSStandalone || isMinimalUI);
  }

  isInstallable() {
    return !!this._deferredPrompt && !this.isInstalled();
  }

  isInstalled() {
    return this._isInstalled || this.checkIsInstalled();
  }

  isIOS() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !(window && window.MSStream);
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
    return isAppleDevice && isSafari && !this.isInstalled();
  }

  async promptInstall() {
    if (!this._deferredPrompt) {
      if (this.isIOS()) {
        return { outcome: 'ios_guidance' };
      }
      return { outcome: 'unavailable' };
    }

    try {
      this._deferredPrompt.prompt();
      const choice = await this._deferredPrompt.userChoice;
      this._deferredPrompt = null;
      this._notify();
      return choice; 
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return { outcome: 'error', error: err };
    }
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify() {
    const status = {
      isInstallable: this.isInstallable(),
      isInstalled: this.isInstalled(),
      isIOS: this.isIOS(),
    };
    this._listeners.forEach(fn => {
      try { fn(status); } catch (e) {}
    });
  }
}

export const installManager = new InstallManager();
