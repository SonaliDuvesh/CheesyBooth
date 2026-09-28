
import { SessionStats } from './statisticsModel.js';

export class StatisticsRenderer {

  static renderCardContent(session) {
    if (!session) return '';

    const durationStr = SessionStats.formatDuration(session.durationSec);
    const photoText = `${session.finalKeptCount} Photo${session.finalKeptCount !== 1 ? 's' : ''} Kept`;
    const retakesText = session.retakesCount > 0 ? ` · ${session.retakesCount} Retake${session.retakesCount !== 1 ? 's' : ''}` : '';

    const metrics = [];
    metrics.push(`
      <div class="stat-pill">
        <span class="stat-pill-icon">⏱️</span>
        <span class="stat-pill-text">${durationStr} Session Time</span>
      </div>
    `);

    if (session.stickersCount > 0 || session.textStickersCount > 0) {
      const totalStickers = session.stickersCount + session.textStickersCount;
      metrics.push(`
        <div class="stat-pill">
          <span class="stat-pill-icon">✨</span>
          <span class="stat-pill-text">${totalStickers} Sticker${totalStickers !== 1 ? 's' : ''} Added</span>
        </div>
      `);
    }

    if (session.filtersUsed.size > 0) {
      const filterCount = session.filtersUsed.size;
      metrics.push(`
        <div class="stat-pill">
          <span class="stat-pill-icon">🎨</span>
          <span class="stat-pill-text">${filterCount} Filter${filterCount !== 1 ? 's' : ''} Explored</span>
        </div>
      `);
    }

    if (session.easterEggsFound.size > 0) {
      const secretsCount = session.easterEggsFound.size;
      metrics.push(`
        <div class="stat-pill secret-pill">
          <span class="stat-pill-icon">✦</span>
          <span class="stat-pill-text">${secretsCount} Booth Secret${secretsCount !== 1 ? 's' : ''} Found!</span>
        </div>
      `);
    }

    if (session.surprisesCount > 0) {
      metrics.push(`
        <div class="stat-pill">
          <span class="stat-pill-icon">🎲</span>
          <span class="stat-pill-text">${session.surprisesCount} Surprise${session.surprisesCount !== 1 ? 's' : ''} Rolled</span>
        </div>
      `);
    }

    const totalAiUsage = (session.aiCaptionsGenerated || 0) + (session.aiSuggestionsUsed || 0) + (session.aiPhotoEnhancements || 0);
    if (totalAiUsage > 0) {
      metrics.push(`
        <div class="stat-pill">
          <span class="stat-pill-icon">✨</span>
          <span class="stat-pill-text">${totalAiUsage} AI Creative Idea${totalAiUsage !== 1 ? 's' : ''} Explored</span>
        </div>
      `);
    }

    return `
      <div class="session-card-header">
        <div class="session-card-badge">${session.modeName || 'Classic Booth'}</div>
        <h3 class="session-card-title">Session Complete ✦</h3>
        <p class="session-card-subtitle">${photoText}${retakesText}</p>
      </div>

      <div class="session-stats-grid">
        ${metrics.join('')}
      </div>
    `;
  }
}
