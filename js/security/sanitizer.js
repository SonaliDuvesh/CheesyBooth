
import { SECURITY_LIMITS } from './securityLimits.js';

const POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeText(input, maxLength = SECURITY_LIMITS.MAX_TEXT_LENGTH) {
  if (typeof input !== 'string') return '';

  let clean = input
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  clean = clean.replace(/\s+/g, ' ').trim();

  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength).trim();
  }
  return clean;
}

export function sanitizeFilename(rawName, defaultName = 'say-cheese-photo') {
  if (typeof rawName !== 'string' || !rawName.trim()) {
    return defaultName;
  }

  let clean = rawName
    .replace(/\.\.+/g, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim();

  const reservedRegex = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
  if (reservedRegex.test(clean) || clean.length === 0) {
    clean = defaultName;
  }

  if (clean.length > 64) {
    clean = clean.slice(0, 64).trim();
  }

  return clean;
}

export function sanitizeColor(colorStr, fallback = '#FAF6EE') {
  if (typeof colorStr !== 'string') return fallback;
  const trimmed = colorStr.trim().toLowerCase();

  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(trimmed)) {
    return trimmed;
  }

  if (/^rgba?\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)(?:\s*,\s*([01]?\.?\d*))?\s*\)$/.test(trimmed)) {
    return trimmed;
  }

  if (/^hsla?\(\s*(\d{1,3}(?:deg|rad|turn)?)\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)(?:\s*,\s*([01]?\.?\d*))?\s*\)$/.test(trimmed)) {
    return trimmed;
  }

  const SAFE_NAMED_COLORS = new Set([
    'transparent', 'white', 'black', 'ivory', 'linen', 'wheat', 'beige',
    'charcoal', 'cream', 'peachpuff', 'mistyrose', 'lavender', 'seashell',
    'whitesmoke', 'gainsboro', 'lightgray', 'silver', 'darkgray', 'gray', 'dimgray'
  ]);
  if (SAFE_NAMED_COLORS.has(trimmed)) {
    return trimmed;
  }

  return fallback;
}

export function safeDeepClone(source) {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  if (Array.isArray(source)) {
    return source.map(item => safeDeepClone(item));
  }

  const cleanObj = {};
  for (const key of Object.keys(source)) {
    if (POLLUTION_KEYS.has(key)) continue;
    cleanObj[key] = safeDeepClone(source[key]);
  }
  return cleanObj;
}

export function safeAssign(target, source) {
  if (!target || typeof target !== 'object' || !source || typeof source !== 'object') {
    return target;
  }
  for (const key of Object.keys(source)) {
    if (POLLUTION_KEYS.has(key)) continue;
    target[key] = source[key];
  }
  return target;
}
