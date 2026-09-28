
import { storageManager } from '../storage/storageManager.js';
import { COLLAGE_LAYOUTS } from '../collage/layouts.js';
import { FILTER_PRESETS } from '../filters/filterPresets.js';

const SNAPSHOT_EXPIRY_MS = 24 * 60 * 60 * 1000; 
const MAX_BACKUP_SIZE_BYTES = 25 * 1024 * 1024; 
const SCHEMA_VERSION = 3;

export class RecoveryManager {
  constructor() {
    this._autosaveTimer = null;
    this._listeners = new Set();
    this.status = 'idle'; 
    this.lastSavedTimestamp = 0;
    this._setupMultiTabSync();
  }

  get isSaving() {
    return this.status === 'saving';
  }

  scheduleAutosave(statePayload) {
    if (this._autosaveTimer) {
      clearTimeout(this._autosaveTimer);
    }
    this._setStatus('saving');

    this._autosaveTimer = setTimeout(async () => {
      await this.saveImmediateCheckpoint(statePayload);
    }, 600);
  }

  async saveImmediateCheckpoint(statePayload) {
    if (this._autosaveTimer) {
      clearTimeout(this._autosaveTimer);
      this._autosaveTimer = null;
    }

    if (!statePayload) return { saved: false };
    this._setStatus('saving');

    try {
      const snapshot = this._buildSanitizedSnapshot(statePayload);
      await storageManager.saveRecoverySnapshot(snapshot);
      this.lastSavedTimestamp = Date.now();
      this._setStatus('saved');
      return {
        saved: true,
        source: 'active_session',
        timestamp: this.lastSavedTimestamp,
        photoCount: snapshot.photoCount,
      };
    } catch (err) {
      this._setStatus('error');
      return { saved: false, error: err?.message || 'Save failed' };
    }
  }

  _isValidImageData(data) {
    if (!data || typeof data !== 'string') return false;
    return data.startsWith('data:image/') || data.startsWith('blob:') || data.startsWith('http');
  }

  _buildSanitizedSnapshot(payload) {
    const rawPhotos = Array.isArray(payload.photos) ? payload.photos : [];
    const validPhotos = rawPhotos
      .filter(p => p && this._isValidImageData(p.imageData || p.dataUrl))
      .map((p, idx) => ({
        id: p.id || `photo_${Date.now()}_${idx}`,
        imageData: p.imageData || p.dataUrl || '',
        timestamp: p.timestamp || Date.now(),
        retakeCount: p.retakeCount || 0,
      }));

    const settings = payload.collageSettings || payload.settings || null;

    return {
      version: SCHEMA_VERSION,
      state: payload.viewState || payload.activeView || 'editing', 
      activeView: payload.activeView || payload.viewState || 'booth',
      photos: validPhotos,
      photoCount: validPhotos.length,
      targetCount: payload.targetCount || validPhotos.length || 4,
      funMode: payload.funMode || 'classic',
      countdown: payload.countdown || 3,
      collageSettings: settings ? JSON.parse(JSON.stringify(settings)) : null,
      settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
      updatedAt: Date.now(),
      timestamp: Date.now(),
    };
  }

  async clearRecoverySnapshot() {
    if (this._autosaveTimer) {
      clearTimeout(this._autosaveTimer);
      this._autosaveTimer = null;
    }
    await storageManager.clearRecoverySnapshot();
    this._setStatus('idle');
  }

  async clearInterruptedSession() {
    return await this.clearRecoverySnapshot();
  }

  async detectInterruptedSession() {
    try {
      const raw = await storageManager.getRecoverySnapshot();
      if (!raw || !Array.isArray(raw.photos) || raw.photos.length === 0) {
        return null;
      }

      const age = Date.now() - (raw.updatedAt || raw.timestamp || 0);
      if (age > SNAPSHOT_EXPIRY_MS) {
        await storageManager.clearRecoverySnapshot();
        return null;
      }

      const migrated = this._validateAndMigrateSnapshot(raw);
      if (migrated.photos.length === 0) {
        await storageManager.clearRecoverySnapshot();
        return null;
      }

      const timeAgoText = this._formatTimeAgo(migrated.updatedAt || migrated.timestamp);
      const layoutId = migrated.collageSettings?.layoutId || migrated.settings?.layoutId || 'vertical-strip';
      const filterId = migrated.collageSettings?.filter || migrated.settings?.filter || 'warm-vintage';
      const layoutObj = COLLAGE_LAYOUTS[layoutId] || COLLAGE_LAYOUTS['vertical-strip'];
      const filterObj = FILTER_PRESETS[filterId] || FILTER_PRESETS['warm-vintage'];

      const summary = {
        photoCount: migrated.photos.length,
        targetCount: migrated.targetCount || 4,
        viewState: migrated.state || migrated.activeView || 'review',
        timeAgoText,
        layoutName: layoutObj?.name || 'Classic Strip',
        filterName: filterObj?.name || 'Warm Vintage',
        funMode: migrated.funMode || 'classic',
      };

      return {
        hasInterrupted: true,
        snapshot: migrated,
        summary,
        ...migrated,
      };
    } catch (e) {
      return null;
    }
  }

  _validateAndMigrateSnapshot(raw) {
    const migrated = { ...raw, version: SCHEMA_VERSION };

    const validPhotos = (raw.photos || []).filter(p => p && this._isValidImageData(p.imageData || p.dataUrl));
    migrated.photos = validPhotos.map((p, idx) => ({
      id: p.id || `photo_${Date.now()}_${idx}`,
      imageData: p.imageData || p.dataUrl || '',
      timestamp: p.timestamp || Date.now(),
      retakeCount: p.retakeCount || 0,
    }));
    migrated.photoCount = validPhotos.length;

    const settings = migrated.collageSettings || migrated.settings || {};
    if (typeof settings === 'object') {

      if (!settings.layoutId || !COLLAGE_LAYOUTS[settings.layoutId]) {
        settings.layoutId = 'vertical-strip';
      }

      if (!settings.filter || !FILTER_PRESETS[settings.filter]) {
        settings.filter = 'warm-vintage';
      }

      if (typeof settings.spacing !== 'number' || isNaN(settings.spacing)) settings.spacing = 16;
      if (typeof settings.padding !== 'number' || isNaN(settings.padding)) settings.padding = 24;
      if (!Array.isArray(settings.stickers)) settings.stickers = [];

      migrated.collageSettings = settings;
      migrated.settings = settings;
    }

    return migrated;
  }

  _formatTimeAgo(timestamp) {
    if (!timestamp) return 'recently';
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    const diffHrs = Math.floor(diffMin / 60);
    return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
  }

  async saveProject({ id, name, photos, settings, collageSettings, thumbnail, funMode }) {
    const cleanName = (name || 'Untitled Photobooth Print').slice(0, 80).trim();
    const projectId = id || `project_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const projectSettings = settings || collageSettings || {};

    const projectRecord = {
      id: projectId,
      name: cleanName,
      photos: (photos || []).map(p => ({
        id: p.id || `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        imageData: p.imageData || p.dataUrl || '',
        timestamp: p.timestamp || Date.now(),
      })),
      settings: JSON.parse(JSON.stringify(projectSettings)),
      collageSettings: JSON.parse(JSON.stringify(projectSettings)),
      thumbnail: thumbnail || '',
      funMode: funMode || 'classic',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storageManager.saveProject(projectRecord);
    return projectRecord;
  }

  async getAllProjects() {
    return await storageManager.getAllProjects();
  }

  async getProject(projectId) {
    return await storageManager.getProject(projectId);
  }

  async deleteProject(projectId) {
    return await storageManager.deleteProject(projectId);
  }

  async duplicateProject(projectId) {
    const original = await this.getProject(projectId);
    if (!original) return null;

    const copy = {
      ...original,
      id: `project_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: `${original.name} (Copy)`.slice(0, 80),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storageManager.saveProject(copy);
    return copy;
  }

  exportProjectBackup(projectData) {
    const settings = projectData.settings || projectData.collageSettings || {};
    const payload = {
      app: 'SayCheese',
      schema: 'say_cheese_project_backup',
      schemaVersion: SCHEMA_VERSION,
      version: 1,
      type: 'project_backup',
      exportedAt: new Date().toISOString(),
      project: {
        id: projectData.id || `proj_${Date.now()}`,
        name: projectData.name || 'Photobooth Backup Print',
        photos: projectData.photos || [],
        settings,
        collageSettings: settings,
        funMode: projectData.funMode || 'classic',
        thumbnail: projectData.thumbnail || '',
        createdAt: projectData.createdAt || Date.now(),
      },
    };

    return JSON.stringify(payload, null, 2);
  }

  validateBackupFile(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') {
      return { valid: false, error: 'Empty backup file.' };
    }

    if (jsonString.length > MAX_BACKUP_SIZE_BYTES) {
      return { valid: false, error: 'Backup file exceeds safe limit (max 25MB).' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Invalid JSON file structure.' };
      }

      if (parsed.app !== 'SayCheese' && parsed.schema !== 'say_cheese_project_backup' && !parsed.project && !parsed.photos) {
        return { valid: false, error: 'File is not a valid Say Cheese backup archive.' };
      }

      const project = parsed.project || parsed;
      const photos = Array.isArray(project.photos) ? project.photos : [];
      if (photos.length === 0) {
        return { valid: false, error: 'Backup contains no valid photo data.' };
      }

      return { valid: true, project };
    } catch (e) {
      return { valid: false, error: 'Corrupted backup file. JSON parsing failed.' };
    }
  }

  async importProjectBackup(jsonString) {
    const validation = this.validateBackupFile(jsonString);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const rawProject = validation.project;
    const newProjectId = `imported_${Date.now()}`;
    const rawSettings = rawProject.settings || rawProject.collageSettings || {};

    const safeSettings = {};
    for (const [k, v] of Object.entries(rawSettings)) {
      if (['__proto__', 'constructor', 'prototype'].includes(k)) continue;
      if (typeof v === 'string') {
        safeSettings[k] = v.slice(0, 100).replace(/<\/?[^>]+(>|$)/g, '');
      } else if (typeof v === 'number' || typeof v === 'boolean') {
        safeSettings[k] = v;
      }
    }

    const safeName = (rawProject.name || 'Imported Photobooth Print')
      .slice(0, 80)
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();

    const importedRecord = {
      id: newProjectId,
      name: safeName || 'Imported Photobooth Print',
      photos: (rawProject.photos || []).slice(0, 30).map(p => ({
        id: String(p.id || `photo_${Date.now()}`).slice(0, 50),
        imageData: (typeof p.imageData === 'string' ? p.imageData : (typeof p.dataUrl === 'string' ? p.dataUrl : '')),
        timestamp: Number.isFinite(p.timestamp) ? p.timestamp : Date.now(),
      })),
      settings: safeSettings,
      collageSettings: safeSettings,
      funMode: typeof rawProject.funMode === 'string' ? rawProject.funMode.slice(0, 40) : 'classic',
      thumbnail: typeof rawProject.thumbnail === 'string' ? rawProject.thumbnail : '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storageManager.saveProject(importedRecord);
    return { success: true, project: importedRecord };
  }

  async getStorageDiagnostics() {
    return await storageManager.checkStorageHealth();
  }

  _setupMultiTabSync() {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    try {
      window.addEventListener('storage', (e) => {
        if (e.key === 'say_cheese_last_recovery_sync') {
          this._notify();
        }
      });
    } catch (e) {}
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _setStatus(status) {
    this.status = status;
    this._notify();
  }

  _notify() {
    const payload = {
      status: this.status,
      isSaving: this.status === 'saving',
      error: this.status === 'error',
      lastSaved: this.status === 'saved' || !!this.lastSavedTimestamp,
      lastSavedTimestamp: this.lastSavedTimestamp,
    };
    this._listeners.forEach(fn => {
      try {
        fn(payload);
      } catch (e) {}
    });
  }
}

export const recoveryManager = new RecoveryManager();
