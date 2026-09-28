
export class SessionStats {
  constructor({
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    startedAt = Date.now(),
    mode = 'classic',
    modeName = 'Classic Booth',
    targetCount = 4,
    countdown = 3,
  } = {}) {
    this.id = id;
    this.startedAt = startedAt;
    this.completedAt = null;
    this.durationSec = 0;

    this.mode = mode;
    this.modeName = modeName;
    this.targetCount = targetCount;
    this.countdown = countdown;

    this.capturedCount = 0;
    this.retakesCount = 0;
    this.deletedCount = 0;
    this.finalKeptCount = 0;

    this.filtersUsed = new Set();
    this.stickersCount = 0;
    this.textStickersCount = 0;
    this.layoutChangesCount = 0;
    this.lastLayout = 'vertical-strip';

    this.surprisesCount = 0;
    this.easterEggsFound = new Set();

    this.aiCaptionsGenerated = 0;
    this.aiSuggestionsUsed = 0;
    this.aiPhotoEnhancements = 0;

    this.exportsCompleted = 0;
    this.exportFormats = new Set();
    this.printsInitiated = 0;
    this.clipboardCopies = 0;
    this.sharesCompleted = 0;

    this.isCompleted = false;
    this.isAbandoned = false;
  }

  finish() {
    this.completedAt = Date.now();
    this.durationSec = Math.max(1, Math.round((this.completedAt - this.startedAt) / 1000));
    this.finalKeptCount = Math.max(0, this.capturedCount - this.deletedCount);
    this.isCompleted = true;
  }

  toJSON() {
    return {
      id: this.id,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      durationSec: this.durationSec,
      mode: this.mode,
      modeName: this.modeName,
      targetCount: this.targetCount,
      countdown: this.countdown,
      capturedCount: this.capturedCount,
      retakesCount: this.retakesCount,
      deletedCount: this.deletedCount,
      finalKeptCount: this.finalKeptCount,
      filtersUsed: Array.from(this.filtersUsed),
      stickersCount: this.stickersCount,
      textStickersCount: this.textStickersCount,
      layoutChangesCount: this.layoutChangesCount,
      lastLayout: this.lastLayout,
      surprisesCount: this.surprisesCount,
      easterEggsFound: Array.from(this.easterEggsFound),
      aiCaptionsGenerated: this.aiCaptionsGenerated || 0,
      aiSuggestionsUsed: this.aiSuggestionsUsed || 0,
      aiPhotoEnhancements: this.aiPhotoEnhancements || 0,
      exportsCompleted: this.exportsCompleted,
      exportFormats: Array.from(this.exportFormats),
      printsInitiated: this.printsInitiated,
      clipboardCopies: this.clipboardCopies,
      sharesCompleted: this.sharesCompleted,
      isCompleted: this.isCompleted,
    };
  }

  static fromJSON(json) {
    if (!json || typeof json !== 'object') return null;
    const stats = new SessionStats({
      id: json.id,
      startedAt: json.startedAt,
      mode: json.mode,
      modeName: json.modeName,
      targetCount: json.targetCount,
      countdown: json.countdown,
    });
    stats.completedAt = json.completedAt;
    stats.durationSec = json.durationSec || 0;
    stats.capturedCount = json.capturedCount || 0;
    stats.retakesCount = json.retakesCount || 0;
    stats.deletedCount = json.deletedCount || 0;
    stats.finalKeptCount = json.finalKeptCount || 0;
    stats.filtersUsed = new Set(json.filtersUsed || []);
    stats.stickersCount = json.stickersCount || 0;
    stats.textStickersCount = json.textStickersCount || 0;
    stats.layoutChangesCount = json.layoutChangesCount || 0;
    stats.lastLayout = json.lastLayout || 'vertical-strip';
    stats.surprisesCount = json.surprisesCount || 0;
    stats.easterEggsFound = new Set(json.easterEggsFound || []);
    stats.aiCaptionsGenerated = json.aiCaptionsGenerated || 0;
    stats.aiSuggestionsUsed = json.aiSuggestionsUsed || 0;
    stats.aiPhotoEnhancements = json.aiPhotoEnhancements || 0;
    stats.exportsCompleted = json.exportsCompleted || 0;
    stats.exportFormats = new Set(json.exportFormats || []);
    stats.printsInitiated = json.printsInitiated || 0;
    stats.clipboardCopies = json.clipboardCopies || 0;
    stats.sharesCompleted = json.sharesCompleted || 0;
    stats.isCompleted = Boolean(json.isCompleted);
    return stats;
  }

  static formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
