import { errorManager } from '../errors/errorManager.js';
import { ErrorCategory } from '../errors/errorTypes.js';

const DB_NAME = 'PocketBoothDB';
const DB_VERSION = 3;
const STORE_SESSIONS = 'saved_sessions';
const STORE_COLLAGES = 'saved_collages';
const STORE_RECOVERY = 'recovery_snapshots';
const STORE_PROJECTS = 'saved_projects';

export class StorageManager {
  constructor() {
    this.db = null;
    this.isInMemory = false;
    this._memorySessions = new Map();
    this._memoryCollages = new Map();
    this._memoryRecovery = new Map();
    this._memoryProjects = new Map();
    this._managedObjectURLs = new Set();
    this._initPromise = this._initDB();
  }

  async _initDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isInMemory = true;
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
            db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_COLLAGES)) {
            db.createObjectStore(STORE_COLLAGES, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_RECOVERY)) {
            db.createObjectStore(STORE_RECOVERY, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
            db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
          }
        };

        request.onsuccess = (e) => {
          this.db = e.target.result;
          this.isInMemory = false;
          resolve(this.db);
        };

        request.onerror = () => {
          this.isInMemory = true;
          resolve(null);
        };

        request.onblocked = () => {
          this.isInMemory = true;
          resolve(null);
        };
      } catch (e) {
        this.isInMemory = true;
        resolve(null);
      }
    });
  }

  async _ensureDB() {
    if (this.db) return this.db;
    return await this._initPromise;
  }

  async saveSession(sessionId = 'latest_session', photos = []) {
    await this._ensureDB();

    const sanitizedPhotos = Array.isArray(photos)
      ? photos.map((p, idx) => ({
          id: p.id || `photo_${Date.now()}_${idx}`,
          imageData: p.imageData || p.dataUrl || '',
          timestamp: p.timestamp || Date.now(),
          retakeCount: p.retakeCount || 0,
        }))
      : [];

    const record = {
      version: 3,
      id: sessionId,
      photos: sanitizedPhotos,
      photoCount: sanitizedPhotos.length,
      savedAt: Date.now(),
    };

    if (this.isInMemory || !this.db) {
      this._memorySessions.set(sessionId, record);
      return true;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_SESSIONS, 'readwrite');
        const store = tx.objectStore(STORE_SESSIONS);
        store.put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => {
          this._memorySessions.set(sessionId, record);
          resolve(true);
        };
      } catch (e) {
        this._memorySessions.set(sessionId, record);
        resolve(true);
      }
    });
  }

  async loadLatestSession() {
    return await this.getSession('latest_session');
  }

  async getSession(sessionId = 'latest_session') {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      const rec = this._memorySessions.get(sessionId);
      return rec ? rec.photos : null;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_SESSIONS, 'readonly');
        const store = tx.objectStore(STORE_SESSIONS);
        const req = store.get(sessionId);
        req.onsuccess = () => resolve(req.result ? req.result.photos : null);
        req.onerror = () => {
          const rec = this._memorySessions.get(sessionId);
          resolve(rec ? rec.photos : null);
        };
      } catch (e) {
        const rec = this._memorySessions.get(sessionId);
        resolve(rec ? rec.photos : null);
      }
    });
  }

  async getAllSessions() {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      return Array.from(this._memorySessions.values());
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_SESSIONS, 'readonly');
        const store = tx.objectStore(STORE_SESSIONS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(Array.from(this._memorySessions.values()));
      } catch (e) {
        resolve(Array.from(this._memorySessions.values()));
      }
    });
  }

  async deleteSession(sessionId = 'latest_session') {
    await this._ensureDB();
    this._memorySessions.delete(sessionId);

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_SESSIONS, 'readwrite');
        const store = tx.objectStore(STORE_SESSIONS);
        store.delete(sessionId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async clearAllSessions() {
    await this._ensureDB();
    this._memorySessions.clear();

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_SESSIONS, 'readwrite');
        const store = tx.objectStore(STORE_SESSIONS);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async saveRecoverySnapshot(snapshot) {
    await this._ensureDB();
    const record = {
      version: 3,
      id: 'active_recovery',
      timestamp: Date.now(),
      ...snapshot,
    };

    if (this.isInMemory || !this.db) {
      this._memoryRecovery.set('active_recovery', record);
      return true;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_RECOVERY, 'readwrite');
        const store = tx.objectStore(STORE_RECOVERY);
        store.put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => {
          this._memoryRecovery.set('active_recovery', record);
          resolve(true);
        };
      } catch (e) {
        this._memoryRecovery.set('active_recovery', record);
        resolve(true);
      }
    });
  }

  async getRecoverySnapshot() {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      return this._memoryRecovery.get('active_recovery') || null;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_RECOVERY, 'readonly');
        const store = tx.objectStore(STORE_RECOVERY);
        const req = store.get('active_recovery');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(this._memoryRecovery.get('active_recovery') || null);
      } catch (e) {
        resolve(this._memoryRecovery.get('active_recovery') || null);
      }
    });
  }

  async clearRecoverySnapshot() {
    await this._ensureDB();
    this._memoryRecovery.delete('active_recovery');

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_RECOVERY, 'readwrite');
        const store = tx.objectStore(STORE_RECOVERY);
        store.delete('active_recovery');
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async saveProject(project) {
    await this._ensureDB();
    const projectId = project.id || `project_${Date.now()}`;
    const record = {
      version: 3,
      id: projectId,
      name: (project.name || 'Untitled Photobooth Print').slice(0, 80).trim(),
      photos: project.photos || [],
      collageSettings: project.collageSettings || {},
      thumbnail: project.thumbnail || '',
      createdAt: project.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (this.isInMemory || !this.db) {
      this._memoryProjects.set(projectId, record);
      return projectId;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        store.put(record);
        tx.oncomplete = () => resolve(projectId);
        tx.onerror = () => {
          this._memoryProjects.set(projectId, record);
          resolve(projectId);
        };
      } catch (e) {
        this._memoryProjects.set(projectId, record);
        resolve(projectId);
      }
    });
  }

  async getProject(projectId) {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      return this._memoryProjects.get(projectId) || null;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.get(projectId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(this._memoryProjects.get(projectId) || null);
      } catch (e) {
        resolve(this._memoryProjects.get(projectId) || null);
      }
    });
  }

  async getAllProjects() {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      return Array.from(this._memoryProjects.values());
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_PROJECTS, 'readonly');
        const store = tx.objectStore(STORE_PROJECTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(Array.from(this._memoryProjects.values()));
      } catch (e) {
        resolve(Array.from(this._memoryProjects.values()));
      }
    });
  }

  async deleteProject(projectId) {
    await this._ensureDB();
    this._memoryProjects.delete(projectId);

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        store.delete(projectId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async clearAllProjects() {
    await this._ensureDB();
    this._memoryProjects.clear();

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_PROJECTS, 'readwrite');
        const store = tx.objectStore(STORE_PROJECTS);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async saveCollage(collageId, collageData) {
    await this._ensureDB();
    const id = collageId || `collage_${Date.now()}`;
    const record = {
      version: 3,
      id,
      data: collageData,
      savedAt: Date.now(),
    };

    if (this.isInMemory || !this.db) {
      this._memoryCollages.set(id, record);
      return id;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_COLLAGES, 'readwrite');
        const store = tx.objectStore(STORE_COLLAGES);
        store.put(record);
        tx.oncomplete = () => resolve(id);
        tx.onerror = () => {
          this._memoryCollages.set(id, record);
          resolve(id);
        };
      } catch (e) {
        this._memoryCollages.set(id, record);
        resolve(id);
      }
    });
  }

  async getCollage(collageId) {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      const rec = this._memoryCollages.get(collageId);
      return rec ? rec.data : null;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_COLLAGES, 'readonly');
        const store = tx.objectStore(STORE_COLLAGES);
        const req = store.get(collageId);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => {
          const rec = this._memoryCollages.get(collageId);
          resolve(rec ? rec.data : null);
        };
      } catch (e) {
        const rec = this._memoryCollages.get(collageId);
        resolve(rec ? rec.data : null);
      }
    });
  }

  async getAllCollages() {
    await this._ensureDB();

    if (this.isInMemory || !this.db) {
      return Array.from(this._memoryCollages.values());
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_COLLAGES, 'readonly');
        const store = tx.objectStore(STORE_COLLAGES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(Array.from(this._memoryCollages.values()));
      } catch (e) {
        resolve(Array.from(this._memoryCollages.values()));
      }
    });
  }

  async deleteCollage(collageId) {
    await this._ensureDB();
    this._memoryCollages.delete(collageId);

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_COLLAGES, 'readwrite');
        const store = tx.objectStore(STORE_COLLAGES);
        store.delete(collageId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async clearAllCollages() {
    await this._ensureDB();
    this._memoryCollages.clear();

    if (this.isInMemory || !this.db) return true;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(STORE_COLLAGES, 'readwrite');
        const store = tx.objectStore(STORE_COLLAGES);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async checkStorageHealth() {
    let health = 'healthy';
    let usageBytes = 0;
    let quotaBytes = 0;
    let percentUsed = 0;

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        usageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
        if (quotaBytes > 0) {
          percentUsed = Math.round((usageBytes / quotaBytes) * 100);
          if (percentUsed > 85) {
            health = 'limited';
          }
        }
      } catch (e) {
        health = this.isInMemory ? 'limited' : 'healthy';
      }
    } else if (this.isInMemory) {
      health = 'limited';
    }

    return {
      health,
      percentUsed,
      usageBytes,
      quotaBytes,
      isInMemory: this.isInMemory,
      dbEngine: this.isInMemory ? 'In-Memory (Session only)' : 'IndexedDB (Local Browser)',
    };
  }

  async getStorageBreakdown() {
    const sessions = await this.getAllSessions();
    const collages = await this.getAllCollages();
    const projects = await this.getAllProjects();

    let totalPhotos = 0;
    sessions.forEach(s => {
      if (Array.isArray(s.photos)) totalPhotos += s.photos.length;
    });

    const health = await this.checkStorageHealth();

    return {
      sessionCount: sessions.length,
      totalPhotos,
      collageCount: collages.length,
      projectCount: projects.length,
      isInMemory: this.isInMemory,
      storageHealth: health.health,
      percentUsed: health.percentUsed,
      dbEngine: health.dbEngine,
    };
  }

  createManagedObjectURL(blob) {
    if (!blob || typeof URL === 'undefined' || !URL.createObjectURL) return '';
    const url = URL.createObjectURL(blob);
    this._managedObjectURLs.add(url);
    return url;
  }

  revokeManagedObjectURL(url) {
    if (!url || typeof URL === 'undefined' || !URL.revokeObjectURL) return;
    if (this._managedObjectURLs.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
      this._managedObjectURLs.delete(url);
    }
  }

  revokeAllObjectURLs() {
    if (typeof URL === 'undefined' || !URL.revokeObjectURL) return;
    for (const url of this._managedObjectURLs) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    }
    this._managedObjectURLs.clear();
  }

  async clearAllSayCheeseData() {
    await this.clearAllSessions();
    await this.clearAllCollages();
    await this.clearRecoverySnapshot();
    await this.clearAllProjects();
    this.revokeAllObjectURLs();

    if (typeof localStorage !== 'undefined') {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('say_cheese_') || k.startsWith('pocket_booth_'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }

    return true;
  }
}

export const storageManager = new StorageManager();
