
export class UpdateManager {
  constructor() {
    this._registration = null;
    this._waitingWorker = null;
    this._hasUpdate = false;
    this._listeners = new Set();
  }

  init(registration) {
    if (!registration) return;
    this._registration = registration;

    if (registration.waiting) {
      this._waitingWorker = registration.waiting;
      this._hasUpdate = true;
      this._notify();
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {

          this._waitingWorker = newWorker;
          this._hasUpdate = true;
          this._notify();
        }
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  hasUpdate() {
    return this._hasUpdate;
  }

  applyUpdate() {
    if (this._waitingWorker) {
      this._waitingWorker.postMessage({ action: 'skipWaiting' });
    }
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify() {
    const info = {
      hasUpdate: this._hasUpdate,
    };
    this._listeners.forEach(fn => {
      try { fn(info); } catch (e) {}
    });
  }
}

export const updateManager = new UpdateManager();
