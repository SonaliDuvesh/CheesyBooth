
export const FILTER_PRESETS = {
  'original': {
    id: 'original',
    name: 'Original',
    category: 'Clean',
    description: 'Natural crisp capture without color alteration',
    defaultIntensity: 100,
    getFilterString: (intensity = 1.0) => 'none',
  },
  'warm-vintage': {
    id: 'warm-vintage',
    name: 'Warm Vintage',
    category: 'Vintage',
    description: 'Soft warmth + nostalgic faded film',
    defaultIntensity: 80,
    getFilterString: (intensity = 1.0) => {
      const sep = 0.22 * intensity;
      const con = 1 + 0.1 * intensity;
      const bri = 1 + 0.04 * intensity;
      const sat = 1 + 0.15 * intensity;
      return `sepia(${sep}) contrast(${con}) brightness(${bri}) saturate(${sat})`;
    },
  },
  'disposable': {
    id: 'disposable',
    name: 'Disposable',
    category: 'Vintage',
    description: 'Flashy, saturated 90s disposable camera aesthetic',
    defaultIntensity: 80,
    getFilterString: (intensity = 1.0) => {
      const con = 1 + 0.18 * intensity;
      const bri = 1 + 0.06 * intensity;
      const sat = 1 + 0.25 * intensity;
      const sep = 0.12 * intensity;
      return `contrast(${con}) brightness(${bri}) saturate(${sat}) sepia(${sep})`;
    },
  },
  'film-35mm': {
    id: 'film-35mm',
    name: '35mm Film',
    category: 'Film',
    description: 'Rich shadows & authentic analog negative tones',
    defaultIntensity: 80,
    getFilterString: (intensity = 1.0) => {
      const sep = 0.18 * intensity;
      const hue = -6 * intensity;
      const con = 1 + 0.15 * intensity;
      const sat = 1 + 0.1 * intensity;
      return `sepia(${sep}) hue-rotate(${hue}deg) contrast(${con}) saturate(${sat})`;
    },
  },
  'digicam': {
    id: 'digicam',
    name: 'Digicam',
    category: 'Digital',
    description: 'Early-2000s cyber digital camera vibrancy',
    defaultIntensity: 75,
    getFilterString: (intensity = 1.0) => {
      const sat = 1 + 0.35 * intensity;
      const con = 1 + 0.12 * intensity;
      const bri = 1 + 0.05 * intensity;
      return `saturate(${sat}) contrast(${con}) brightness(${bri})`;
    },
  },
  'nostalgia-90s': {
    id: 'nostalgia-90s',
    name: '90s Nostalgia',
    category: 'Vintage',
    description: 'Retro yellow-green tint & muted nostalgic tone',
    defaultIntensity: 75,
    getFilterString: (intensity = 1.0) => {
      const sep = 0.35 * intensity;
      const hue = -12 * intensity;
      const con = 1 - 0.05 * intensity;
      const sat = 1 + 0.2 * intensity;
      return `sepia(${sep}) hue-rotate(${hue}deg) contrast(${con}) saturate(${sat})`;
    },
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Warm',
    description: 'Luminous sunset warmth & amber glow',
    defaultIntensity: 75,
    getFilterString: (intensity = 1.0) => {
      const sep = 0.28 * intensity;
      const bri = 1 + 0.06 * intensity;
      const sat = 1 + 0.25 * intensity;
      const hue = -8 * intensity;
      return `sepia(${sep}) hue-rotate(${hue}deg) saturate(${sat}) brightness(${bri})`;
    },
  },
  'dreamy': {
    id: 'dreamy',
    name: 'Dreamy Bloom',
    category: 'Soft',
    description: 'Soft light, gentle bloom & ethereal glow',
    defaultIntensity: 65,
    getFilterString: (intensity = 1.0) => {
      const bri = 1 + 0.1 * intensity;
      const con = 1 - 0.08 * intensity;
      const sat = 1 + 0.12 * intensity;
      const sep = 0.08 * intensity;
      return `brightness(${bri}) contrast(${con}) saturate(${sat}) sepia(${sep})`;
    },
  },
  'soft-glow': {
    id: 'soft-glow',
    name: 'Soft Glow',
    category: 'Soft',
    description: 'Flattering skin tones with luminous contrast',
    defaultIntensity: 70,
    getFilterString: (intensity = 1.0) => {
      const bri = 1 + 0.08 * intensity;
      const con = 1 - 0.04 * intensity;
      const sat = 1 + 0.08 * intensity;
      return `brightness(${bri}) contrast(${con}) saturate(${sat})`;
    },
  },
  'classic-bw': {
    id: 'classic-bw',
    name: 'Classic B&W',
    category: 'Monochrome',
    description: 'Timeless high-contrast monochrome with deep blacks',
    defaultIntensity: 100,
    getFilterString: (intensity = 1.0) => {
      const gray = 1 * intensity;
      const con = 1 + 0.25 * intensity;
      const bri = 1 - 0.02 * intensity;
      return `grayscale(${gray}) contrast(${con}) brightness(${bri})`;
    },
  },
  'faded-bw': {
    id: 'faded-bw',
    name: 'Faded Noir',
    category: 'Monochrome',
    description: 'Soft matte silver grain & gentle grayscale',
    defaultIntensity: 90,
    getFilterString: (intensity = 1.0) => {
      const gray = 1 * intensity;
      const con = 1 - 0.08 * intensity;
      const bri = 1 + 0.06 * intensity;
      const sep = 0.1 * intensity;
      return `grayscale(${gray}) sepia(${sep}) contrast(${con}) brightness(${bri})`;
    },
  },
  'pastel-peach': {
    id: 'pastel-peach',
    name: 'Pastel Peach',
    category: 'Warm',
    description: 'Soft coral blush tones & dreamy highlights',
    defaultIntensity: 75,
    getFilterString: (intensity = 1.0) => {
      const sep = 0.15 * intensity;
      const sat = 1 + 0.28 * intensity;
      const hue = 345;
      const bri = 1 + 0.05 * intensity;
      return `sepia(${sep}) saturate(${sat}) hue-rotate(${hue}deg) brightness(${bri})`;
    },
  },
};

export function getFilterCSS(filterId, intensityPercent = 100) {
  const preset = FILTER_PRESETS[filterId] || FILTER_PRESETS['warm-vintage'] || FILTER_PRESETS['original'];
  const normalizedIntensity = Math.max(0, Math.min(100, intensityPercent)) / 100;
  return preset.getFilterString(normalizedIntensity);
}

export function getRandomFilterId(currentFilterId = null) {
  const keys = Object.keys(FILTER_PRESETS);
  const candidates = keys.filter(k => k !== currentFilterId);
  return candidates[Math.floor(Math.random() * candidates.length)] || 'warm-vintage';
}
