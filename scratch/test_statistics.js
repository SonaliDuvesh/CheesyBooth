/**
 * Verification Suite for Feature #23 (Session Statistics)
 */

import { SessionStats } from '../js/statistics/statisticsModel.js';
import { StatisticsManager } from '../js/statistics/statisticsManager.js';
import { StatisticsRenderer } from '../js/statistics/statisticsRenderer.js';

console.log('=== Running Feature #23 Session Statistics Test Suite ===');

// 1. SessionStats Model Verification
const s = new SessionStats({ mode: 'rapid-fire', modeName: 'Rapid Fire', targetCount: 6, countdown: 2 });
console.assert(s.mode === 'rapid-fire', 'Mode set correctly');
console.assert(s.targetCount === 6, 'Target count set correctly');
s.capturedCount = 6;
s.retakesCount = 2;
s.deletedCount = 1;
s.filtersUsed.add('warm-vintage');
s.stickersCount = 4;
s.finish();

console.assert(s.isCompleted === true, 'Session finished');
console.assert(s.finalKeptCount === 5, 'Final kept count is 5 (6 - 1)');
console.assert(typeof s.durationSec === 'number', 'Duration calculated');

// JSON Serialization
const json = s.toJSON();
console.assert(json.mode === 'rapid-fire', 'JSON mode preserved');
console.assert(json.filtersUsed.includes('warm-vintage'), 'JSON filtersUsed preserved');

const restored = SessionStats.fromJSON(json);
console.assert(restored.id === s.id, 'Restored session ID match');
console.assert(restored.finalKeptCount === 5, 'Restored final kept count match');
console.assert(restored.filtersUsed.has('warm-vintage'), 'Restored filters match');

// Duration Formatting
console.assert(SessionStats.formatDuration(0) === '00:00', '0s formatted');
console.assert(SessionStats.formatDuration(42) === '00:42', '42s formatted');
console.assert(SessionStats.formatDuration(84) === '01:24', '84s formatted');

// 2. StatisticsManager Verification
const mgr = new StatisticsManager();
mgr.clearHistory();
console.assert(mgr.getRecentHistory().length === 0, 'History cleared initially');

mgr.startSession({ mode: 'classic', modeName: 'Classic Booth', targetCount: 4, countdown: 3 });
mgr.recordCapture();
mgr.recordCapture();
mgr.recordRetake();
mgr.recordDelete();
mgr.recordFilter('golden-hour');
mgr.recordSticker();
mgr.recordSticker();
mgr.recordSurprise();
mgr.recordEasterEgg('secret-shutter');
mgr.recordExport('png');

const finished = mgr.finishSession();
console.assert(finished !== null, 'Session finished via manager');
console.assert(finished.capturedCount === 2, 'Captured count is 2');
console.assert(finished.retakesCount === 1, 'Retake count is 1');
console.assert(finished.deletedCount === 1, 'Delete count is 1');
console.assert(finished.finalKeptCount === 1, 'Final kept count is 1');
console.assert(finished.filtersUsed.has('golden-hour'), 'Filter recorded');
console.assert(finished.stickersCount === 2, 'Stickers recorded');
console.assert(finished.surprisesCount === 1, 'Surprise recorded');
console.assert(finished.easterEggsFound.has('secret-shutter'), 'Easter egg recorded');
console.assert(finished.exportsCompleted === 1, 'Export recorded');

const history = mgr.getRecentHistory();
console.assert(history.length === 1, '1 session in history');
console.assert(history[0].id === finished.id, 'History entry matches finished session');

// 3. StatisticsRenderer HTML generation
const html = StatisticsRenderer.renderCardContent(finished);
console.assert(typeof html === 'string' && html.length > 0, 'HTML generated');
console.assert(html.includes('Session Complete'), 'Header present in HTML');
console.assert(html.includes('1 Retake'), 'Retake pill present');
console.assert(html.includes('2 Stickers Added'), 'Sticker count pill present');
console.assert(html.includes('1 Filter Explored'), 'Filter count pill present');
console.assert(html.includes('Booth Secret'), 'Secret pill present');

// Clean up
mgr.clearHistory();
console.assert(mgr.getRecentHistory().length === 0, 'History cleared');

console.log('=== All Feature #23 Session Statistics Tests Passed! ===');
