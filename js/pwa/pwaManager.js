
import { installManager } from './installManager.js';
import { updateManager } from './updateManager.js';

export class PWAManager {
  constructor() {
    this.installManager = installManager;
    this.updateManager = updateManager;

    this.state = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isRegistered: false,
      isInstalled: installManager.isInstalled(),
      registration: null,
      error: null,
    };

    this._listeners = new Set();
    this._initNetworkMonitoring();
  }

  async init() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (document.readyState === 'complete') {
      await this._registerServiceWorker();
    } else {
      window.addEventListener('load', () => this._registerServiceWorker());
    }
  }

  async _registerServiceWorker() {
    try {

      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        scope: './',
      });

      this.state.isRegistered = true;
      this.state.registration = registration;
      this.updateManager.init(registration);
      this._notify();

      setInterval(() => {
        try {
          registration.update();
        } catch (e) {}
      }, 60 * 60 * 1000);
    } catch (err) {
      console.warn('PWA Service Worker registration notice:', err);
      this.state.error = err;
      this._notify();
    }
  }

  _initNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this._notify('online');
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this._notify('offline');
    });
  }

  getDiagnostics() {
    return {
      serviceWorkerSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      isRegistered: this.state.isRegistered,
      isOnline: this.state.isOnline,
      isInstalled: this.installManager.isInstalled(),
      isInstallable: this.installManager.isInstallable(),
      isIOS: this.installManager.isIOS(),
      hasUpdate: this.updateManager.hasUpdate(),
      displayMode: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
    };
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify(eventType = 'state_change') {
    const snapshot = {
      ...this.state,
      isInstalled: this.installManager.isInstalled(),
      isInstallable: this.installManager.isInstallable(),
      isIOS: this.installManager.isIOS(),
      hasUpdate: this.updateManager.hasUpdate(),
      eventType,
    };
    this._listeners.forEach(fn => {
      try { fn(snapshot); } catch (e) {}
    });
  }
}

export const pwaManager = new PWAManager();
