
import { SessionStats } from './statisticsModel.js';

const STORAGE_KEY_STATS = 'say_cheese_session_stats';
const STORAGE_KEY_STATS_ENABLED = 'say_cheese_stats_enabled';
const MAX_STORED_SESSIONS = 50;

export class StatisticsManager {
  constructor() {
    this.currentSession = null;
    this._history = [];
    this._historyEnabled = true;
    this._loadHistory();
  }

  _loadHistory() {
    try {
      if (typeof localStorage !== 'undefined') {
        const enabled = localStorage.getItem(STORAGE_KEY_STATS_ENABLED);
        if (enabled !== null) {
          this._historyEnabled = enabled === 'true';
        }

        const raw = localStorage.getItem(STORAGE_KEY_STATS);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            this._history = list.map(item => SessionStats.fromJSON(item)).filter(Boolean);
          }
        }
      }
    } catch (e) {
      this._history = [];
    }
  }

  _saveHistory() {
    if (!this._historyEnabled) return;
    try {
      if (typeof localStorage !== 'undefined') {
        const bounded = this._history.slice(-MAX_STORED_SESSIONS);
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(bounded.map(s => s.toJSON())));
      }
    } catch (e) {}
  }

  setHistoryEnabled(enabled) {
    this._historyEnabled = Boolean(enabled);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_STATS_ENABLED, this._historyEnabled.toString());
      }
    } catch (e) {}
    if (!this._historyEnabled) {
      this.clearHistory();
    }
  }

  isHistoryEnabled() {
    return this._historyEnabled;
  }

  clearHistory() {
    this._history = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_STATS);
      }
    } catch (e) {}
  }

  getRecentHistory(limit = 20) {
    return [...this._history].reverse().slice(0, limit);
  }

  startSession({ mode = 'classic', modeName = 'Classic Booth', targetCount = 4, countdown = 3 } = {}) {
    this.currentSession = new SessionStats({
      mode,
      modeName,
      targetCount,
      countdown,
    });
    return this.currentSession;
  }

  recordCapture() {
    if (!this.currentSession) return;
    this.currentSession.capturedCount++;
  }

  recordRetake() {
    if (!this.currentSession) return;
    this.currentSession.retakesCount++;
  }

  recordDelete() {
    if (!this.currentSession) return;
    this.currentSession.deletedCount++;
  }

  recordFilter(filterId) {
    if (!this.currentSession || !filterId) return;
    this.currentSession.filtersUsed.add(filterId);
  }

  recordSticker() {
    if (!this.currentSession) return;
    this.currentSession.stickersCount++;
  }

  recordTextSticker() {
    if (!this.currentSession) return;
    this.currentSession.textStickersCount++;
  }

  recordLayoutChange(layoutId) {
    if (!this.currentSession) return;
    this.currentSession.layoutChangesCount++;
    if (layoutId) this.currentSession.lastLayout = layoutId;
  }

  recordSurprise() {
    if (!this.currentSession) return;
    this.currentSession.surprisesCount++;
  }

  recordEasterEgg(eggId) {
    if (!this.currentSession || !eggId) return;
    this.currentSession.easterEggsFound.add(eggId);
  }

  recordExport(format = 'png') {
    if (!this.currentSession) return;
    this.currentSession.exportsCompleted++;
    this.currentSession.exportFormats.add(format);
    this._saveHistory();
  }

  recordPrint() {
    if (!this.currentSession) return;
    this.currentSession.printsInitiated++;
    this._saveHistory();
  }

  recordCopy() {
    if (!this.currentSession) return;
    this.currentSession.clipboardCopies++;
    this._saveHistory();
  }

  recordShare() {
    if (!this.currentSession) return;
    this.currentSession.sharesCompleted++;
    this._saveHistory();
  }

  finishSession() {
    if (!this.currentSession) return null;
    this.currentSession.finish();
    if (this._historyEnabled) {
      this._history.push(this.currentSession);
      this._saveHistory();
    }
    return this.currentSession;
  }
}

export const statisticsManager = new StatisticsManager();
