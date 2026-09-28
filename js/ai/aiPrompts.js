
import { BOOTH_COLLECTIONS } from '../themes/themeRegistry.js';
import { FILTER_PRESETS } from '../filters/filterPresets.js';
import { COLLAGE_LAYOUTS } from '../collage/layouts.js';
import { STICKER_PACKS } from '../stickers/stickerLibrary.js';

const UNSAFE_WORDS = [
  'kill', 'hate', 'nazi', 'racist', 'terror', 'bomb', 'suicide', 'nsfw', 'porn', 'xxx', 'slur'
];

export function sanitizeText(input, maxLength = 140) {
  if (typeof input !== 'string') return '';

  let clean = input.replace(/<\/?[^>]+(>|$)/g, '');

  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  clean = clean.replace(/\s+/g, ' ').trim();

  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength).trim() + '…';
  }
  return clean;
}

export function isContentSafe(text) {
  if (!text || typeof text !== 'string') return true;
  const lower = text.toLowerCase();
  for (const word of UNSAFE_WORDS) {
    if (lower.includes(word)) return false;
  }
  return true;
}

export function validateThemeSuggestion(suggestion) {
  if (!suggestion || typeof suggestion !== 'object') return null;
  const validThemeIds = BOOTH_COLLECTIONS.map(t => t.id);
  const themeId = suggestion.themeId && validThemeIds.includes(suggestion.themeId)
    ? suggestion.themeId
    : 'classic-booth';

  const validFilters = Object.keys(FILTER_PRESETS);
  const filterId = suggestion.filterId && validFilters.includes(suggestion.filterId)
    ? suggestion.filterId
    : 'warm-vintage';

  const validLayouts = Object.keys(COLLAGE_LAYOUTS);
  const layoutId = suggestion.layoutId && validLayouts.includes(suggestion.layoutId)
    ? suggestion.layoutId
    : 'vertical-strip';

  return {
    themeId,
    filterId,
    layoutId,
    tagline: sanitizeText(suggestion.tagline || 'Curated Photobooth Vibe', 60),
    reason: sanitizeText(suggestion.reason || 'Perfect match for this moment.', 120),
  };
}

export function validateSessionPlan(plan) {
  if (!plan || typeof plan !== 'object') return null;
  const validThemes = BOOTH_COLLECTIONS.map(t => t.id);
  const validFilters = Object.keys(FILTER_PRESETS);
  const validLayouts = Object.keys(COLLAGE_LAYOUTS);
  const validModes = ['classic', 'rapid-fire', 'slow-cinematic', 'pose-challenge', 'mystery-pose', 'duo-group', 'random-mix'];

  return {
    themeId: validThemes.includes(plan.themeId) ? plan.themeId : 'classic-booth',
    modeId: validModes.includes(plan.modeId) ? plan.modeId : 'classic',
    filterId: validFilters.includes(plan.filterId) ? plan.filterId : 'warm-vintage',
    layoutId: validLayouts.includes(plan.layoutId) ? plan.layoutId : 'vertical-strip',
    countdown: [2, 3, 5, 10].includes(plan.countdown) ? plan.countdown : 3,
    photoCount: [2, 4, 6].includes(plan.photoCount) ? plan.photoCount : 4,
    mood: sanitizeText(plan.mood || 'Fun', 30),
    title: sanitizeText(plan.title || 'Curated Session Plan', 60),
    description: sanitizeText(plan.description || 'A thoughtfully assembled setup for your photobooth roll.', 140),
  };
}

export function validateStickerSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) return [];
  const validPacks = STICKER_PACKS.map(p => p.id);
  const validStickers = new Set();
  STICKER_PACKS.forEach(p => p.stickers.forEach(s => validStickers.add(s.emoji)));

  return suggestions
    .filter(s => typeof s === 'string' && (validStickers.has(s) || validPacks.includes(s) || s.length <= 4))
    .slice(0, 6)
    .map(s => sanitizeText(s, 10));
}

export const AI_PROMPT_TEMPLATES = {
  caption: {
    system: 'You are a warm, charming, creative photobooth caption writer. Generate concise, memorable captions that capture authentic spontaneous moments.',
    styles: {
      cute: 'Sweet, gentle, adorable, aesthetic, heart-fluttering',
      funny: 'Playful, lighthearted, witty, self-aware humor',
      minimal: 'Ultra short, poetic, 2-4 words, quiet and sleek',
      nostalgic: 'Warm memories, sepia toned feeling, film nostalgia, passing time',
      romantic: 'Soft affection, date night sweetness, quiet love',
      chaotic: 'Spontaneous energy, wild laughter, unhinged joy',
      retro: '35mm analog grain, 90s disposable vibe, vintage cassette tape feel',
      confident: 'Bold, radiant, main character energy, cool editorial',
    },
  },
  pose: {
    system: 'You are a fun photobooth director giving quick, easy-to-do, expressive pose prompts for people in front of a camera.',
  },
  theme: {
    system: 'You are an aesthetic visual curator for photobooths. Recommend combinations of registered themes, analog filters, and collage layouts.',
  },
  sessionPlan: {
    system: 'Plan a complete photobooth experience tailored to group size and desired mood.',
  },
};
