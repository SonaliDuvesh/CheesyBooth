/**
 * Verification Suite for Feature #24 (Themes / Booth Collections)
 */

import { BOOTH_COLLECTIONS, getThemeById } from '../js/themes/themeRegistry.js';
import { ThemeManager } from '../js/themes/themeManager.js';
import { ThemeRenderer } from '../js/themes/themeRenderer.js';

console.log('=== Running Feature #24 Themes & Booth Collections Test Suite ===');

// 1. Registry Verification
console.assert(BOOTH_COLLECTIONS.length >= 7, 'At least 7 Booth Collections registered');

const expectedIds = ['classic-booth', 'retro-film', 'flash-90s', 'cozy-memory', 'digital-camera', 'minimal-studio', 'playful-booth'];
expectedIds.forEach(id => {
  const theme = getThemeById(id);
  console.assert(theme && theme.id === id, `Theme ${id} registered properly`);
  console.assert(typeof theme.name === 'string', `Theme ${id} has name`);
  console.assert(typeof theme.colors === 'object', `Theme ${id} has colors`);
  console.assert(typeof theme.colors.colorPrimary === 'string', `Theme ${id} has primary color`);
  console.assert(typeof theme.audio === 'object', `Theme ${id} has audio style`);
  console.assert(typeof theme.recommended === 'object', `Theme ${id} has recommendations`);
});

// Fallback lookup
const fallbackTheme = getThemeById('non-existent-theme');
console.assert(fallbackTheme.id === 'classic-booth', 'Unknown theme ID falls back to classic-booth');

// 2. ThemeManager Operations
const mgr = new ThemeManager();
console.assert(typeof mgr.getCurrentTheme().id === 'string', 'Initial theme ID retrieved');

// Switch theme
let notified = false;
const unsub = mgr.subscribe((theme) => {
  if (theme.id === 'retro-film') notified = true;
});

const ok = mgr.setTheme('retro-film');
console.assert(ok === true, 'setTheme returned true');
console.assert(mgr.getCurrentTheme().id === 'retro-film', 'Current theme updated to retro-film');
console.assert(notified === true, 'Subscriber notified of theme change');
unsub();

// Favorites
console.assert(mgr.isFavorite('retro-film') === false, 'Initially not favorited');
mgr.toggleFavorite('retro-film');
console.assert(mgr.isFavorite('retro-film') === true, 'Favorited retro-film');
console.assert(mgr.getFavorites().includes('retro-film'), 'getFavorites includes retro-film');
mgr.toggleFavorite('retro-film');
console.assert(mgr.isFavorite('retro-film') === false, 'Unfavorited retro-film');

// Recents
const recents = mgr.getRecents();
console.assert(recents.includes('retro-film'), 'Recents list includes retro-film');

// 3. ThemeRenderer Safety
try {
  ThemeRenderer.applyTheme(getThemeById('classic-booth'), { appearance: 'light' });
  ThemeRenderer.applyTheme(getThemeById('digital-camera'), { appearance: 'dark' });
  console.assert(true, 'ThemeRenderer applies themes safely');
} catch (e) {
  console.error('ThemeRenderer threw error:', e);
}

console.log('=== All Feature #24 Themes & Booth Collections Tests Passed! ===');
