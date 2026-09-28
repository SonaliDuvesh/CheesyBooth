
import { FILTER_PRESETS } from '../filters/filterPresets.js';
import { COLLAGE_LAYOUTS } from '../collage/layouts.js';
import { FUN_MODES, getFunMode } from '../modes/funModes.js';
import { getAllBuiltInStickers } from '../stickers/stickerLibrary.js';
import { preferenceManager } from '../preferences/preferenceManager.js';

export function createSeededRandom(seed = Date.now()) {
  let s = typeof seed === 'number' ? seed : String(seed).split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
  return function() {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const STYLE_FAMILIES = {
  vintage: {
    id: 'vintage',
    name: 'Vintage Nostalgia',
    icon: '🎞️',
    filters: ['warm-vintage', 'film-35mm', 'classic-bw', 'faded-bw'],
    modes: ['classic', 'slow-cinematic', 'one-take', 'freeze-frame'],
    frameStyles: ['film', 'vintage', 'clean', 'polaroid'],
    frameColors: ['#FAF6EE', '#EFE8D8', '#2B2522', '#F4EAD4'],
    themes: ['vintage', 'classic'],
    fonts: ['Courier Prime', 'Space Grotesk', 'Playfair Display'],
    stickerTags: ['vintage', 'retro', 'cute', 'doodles'],
    captions: ['ANALOG MEMORY', 'ROLL NO. 04 · VINTAGE', 'PHOTO ARCHIVE', 'KEEP THIS ONE'],
  },
  cute_playful: {
    id: 'cute_playful',
    name: 'Candy Pop & Cute',
    icon: '🍭',
    filters: ['pastel-peach', 'soft-glow', 'dreamy', 'golden-hour'],
    modes: ['pose-challenge', 'reaction', 'duo-group', 'random-mix'],
    frameStyles: ['rounded', 'clean', 'polaroid'],
    frameColors: ['#FFF0F5', '#FFF8E7', '#F0F8FF', '#FAF6EE'],
    themes: ['playful', 'soft'],
    fonts: ['Space Grotesk', 'Playfair Display'],
    stickerTags: ['cute', 'animals', 'party'],
    captions: ['CUTE MEMORIES ✨', 'BEST DAY EVER 💖', 'SWEET MOMENTS', 'SMILE SQUAD 🌸'],
  },
  retro_digital: {
    id: 'retro_digital',
    name: '90s Cyber & Digicam',
    icon: '⚡',
    filters: ['digicam', 'disposable', 'nostalgia-90s'],
    modes: ['rapid-fire', 'countdown-chaos', 'mystery-pose'],
    frameStyles: ['clean', 'film', 'polaroid'],
    frameColors: ['#1A1A1A', '#FAF6EE', '#2D2235'],
    themes: ['noir', 'vintage'],
    fonts: ['Space Grotesk', 'Courier Prime'],
    stickerTags: ['doodles', 'party', 'cute'],
    captions: ['DIGITAL DREAMS ⚡', 'CYBER FLASH · 2004', 'LATE NIGHT SNAPS', 'RAPID ROLL'],
  },
  minimal_editorial: {
    id: 'minimal_editorial',
    name: 'Minimal & Editorial',
    icon: '◻️',
    filters: ['classic-bw', 'faded-bw', 'original', 'warm-vintage'],
    modes: ['slow-cinematic', 'classic', 'one-take'],
    frameStyles: ['clean', 'rounded', 'vintage'],
    frameColors: ['#FAF6EE', '#F0EFEA', '#1C1C1C'],
    themes: ['classic', 'noir'],
    fonts: ['Cinzel', 'Playfair Display', 'Space Grotesk'],
    stickerTags: ['doodles', 'vintage'],
    captions: ['MOMENTS', 'AUTUMN EDITORIAL', 'ARCHIVE 01', 'SIMPLE MEMORY'],
  },
};

export class RandomizerEngine {
  constructor() {
    this.lockedParams = {
      mode: false,
      photoCount: false,
      countdown: false,
      filter: false,
      layout: false,
      frameColor: false,
      frameStyle: false,
      aspectRatio: false,
    };
    this.currentLocks = {};
    this.recentSurprises = []; 
    this.maxHistory = 10;
  }

  setLock(paramKey, value) {
    if (value !== undefined && value !== null) {
      this.lockedParams[paramKey] = true;
      this.currentLocks[paramKey] = value;
    } else {
      this.lockedParams[paramKey] = false;
      delete this.currentLocks[paramKey];
    }
  }

  toggleLock(paramKey, currentValue) {
    this.lockedParams[paramKey] = !this.lockedParams[paramKey];
    if (this.lockedParams[paramKey]) {
      this.currentLocks[paramKey] = currentValue;
    } else {
      delete this.currentLocks[paramKey];
    }
    return this.lockedParams[paramKey];
  }

  isLocked(paramKey) {
    return Boolean(this.lockedParams[paramKey]);
  }

  clearLocks() {
    Object.keys(this.lockedParams).forEach(k => { this.lockedParams[k] = false; });
    this.currentLocks = {};
  }

  generateSessionSurprise(options = {}) {
    const seed = options.seed || Date.now();
    const rng = createSeededRandom(seed);
    const familyKeys = Object.keys(STYLE_FAMILIES);
    const family = STYLE_FAMILIES[familyKeys[Math.floor(rng() * familyKeys.length)]];

    let photoCount = this.isLocked('photoCount') ? this.currentLocks.photoCount : [2, 4, 6][Math.floor(rng() * 3)];

    let modeId = this.isLocked('mode') ? this.currentLocks.mode : family.modes[Math.floor(rng() * family.modes.length)];
    const modeObj = getFunMode(modeId);

    let countdown = this.isLocked('countdown') ? this.currentLocks.countdown : 3;
    if (!this.isLocked('countdown')) {
      if (modeObj.suggestedCountdown) {
        countdown = modeObj.suggestedCountdown;
      } else if (modeId === 'rapid-fire') {
        countdown = 2;
      } else if (modeId === 'slow-cinematic') {
        countdown = 5;
      } else {
        countdown = [3, 5][Math.floor(rng() * 2)];
      }
    }

    let filterId = this.isLocked('filter') ? this.currentLocks.filter : this._pickWeightedFilter(family, rng);

    let layoutId = this.isLocked('layout') ? this.currentLocks.layout : this._pickCompatibleLayout(photoCount, rng);

    let frameColor = this.isLocked('frameColor') ? this.currentLocks.frameColor : family.frameColors[Math.floor(rng() * family.frameColors.length)];
    let frameStyle = this.isLocked('frameStyle') ? this.currentLocks.frameStyle : family.frameStyles[Math.floor(rng() * family.frameStyles.length)];
    let fontFamily = family.fonts[Math.floor(rng() * family.fonts.length)];
    let stampText = family.captions[Math.floor(rng() * family.captions.length)];

    const result = {
      seed,
      family: family.id,
      familyName: family.name,
      familyIcon: family.icon,
      photoCount,
      modeId,
      modeName: modeObj.name,
      modeIcon: modeObj.icon,
      countdown,
      filterId,
      filterName: FILTER_PRESETS[filterId]?.name || filterId,
      layoutId,
      layoutName: COLLAGE_LAYOUTS[layoutId]?.name || layoutId,
      frameColor,
      frameStyle,
      fontFamily,
      stampText,
      timestamp: Date.now(),
    };

    this._recordSurprise(result);
    return result;
  }

  generateCollageSurprise(currentPhotoCount = 4, options = {}) {
    const seed = options.seed || Date.now();
    const rng = createSeededRandom(seed);
    const familyKeys = Object.keys(STYLE_FAMILIES);
    const family = STYLE_FAMILIES[familyKeys[Math.floor(rng() * familyKeys.length)]];

    let layoutId = this.isLocked('layout') ? this.currentLocks.layout : this._pickCompatibleLayout(currentPhotoCount, rng);

    let aspectRatio = this.isLocked('aspectRatio') ? this.currentLocks.aspectRatio : (currentPhotoCount === 4 && layoutId === 'vertical-strip' ? 'strip' : ['3:4', '1:1', '4:5', 'strip'][Math.floor(rng() * 4)]);

    let frameStyle = this.isLocked('frameStyle') ? this.currentLocks.frameStyle : family.frameStyles[Math.floor(rng() * family.frameStyles.length)];
    let frameColor = this.isLocked('frameColor') ? this.currentLocks.frameColor : family.frameColors[Math.floor(rng() * family.frameColors.length)];

    let spacing = Math.floor(rng() * 16) + 4; 
    let padding = Math.floor(rng() * 20) + 10; 
    let borderRadius = frameStyle === 'rounded' ? Math.floor(rng() * 16) + 12 : Math.floor(rng() * 8);

    let filterId = this.isLocked('filter') ? this.currentLocks.filter : this._pickWeightedFilter(family, rng);
    let filterIntensity = Math.floor(rng() * 30) + 70; 

    let fontFamily = family.fonts[Math.floor(rng() * family.fonts.length)];
    let stampText = family.captions[Math.floor(rng() * family.captions.length)];
    let textAlign = ['left', 'center', 'right'][Math.floor(rng() * 3)];

    const stickers = this._generateSafeStickerPlacements(family, rng);

    return {
      seed,
      family: family.id,
      familyName: family.name,
      familyIcon: family.icon,
      layoutId,
      aspectRatio,
      frameStyle,
      frameColor,
      spacing,
      padding,
      borderRadius,
      filterId,
      filterIntensity,
      fontFamily,
      stampText,
      textAlign,
      stickers,
    };
  }

  generateFilterSurprise() {
    const allFilterIds = Object.keys(FILTER_PRESETS);
    const favFilters = preferenceManager.getFavorites('filters') || [];

    if (favFilters.length > 0 && Math.random() < 0.6) {
      const chosen = favFilters[Math.floor(Math.random() * favFilters.length)];
      if (FILTER_PRESETS[chosen]) return chosen;
    }

    const available = allFilterIds.filter(f => f !== 'original');
    return available[Math.floor(Math.random() * available.length)] || 'warm-vintage';
  }

  generateStickerSurprise() {
    const favs = preferenceManager.getFavorites('stickers') || [];
    if (favs.length > 0 && Math.random() < 0.5) {
      const f = favs[Math.floor(Math.random() * favs.length)];
      if (typeof f === 'object') return f;
      return { emoji: f, label: f, type: 'emoji' };
    }

    const pool = getAllBuiltInStickers();
    const item = pool[Math.floor(Math.random() * pool.length)];
    return { emoji: item.emoji, label: item.label, type: 'emoji' };
  }

  rerollParameter(currentConfig, paramKey) {
    if (!currentConfig) return this.generateSessionSurprise();
    const family = STYLE_FAMILIES[currentConfig.family] || STYLE_FAMILIES.vintage;
    const rng = Math.random;
    const updated = { ...currentConfig };

    switch (paramKey) {
      case 'mode': {
        const otherModes = family.modes.filter(m => m !== currentConfig.modeId);
        const newModeId = otherModes.length > 0 ? otherModes[Math.floor(rng() * otherModes.length)] : family.modes[0];
        const modeObj = getFunMode(newModeId);
        updated.modeId = newModeId;
        updated.modeName = modeObj.name;
        updated.modeIcon = modeObj.icon;
        break;
      }
      case 'photoCount': {
        const counts = [2, 4, 6].filter(c => c !== currentConfig.photoCount);
        const newCount = counts[Math.floor(rng() * counts.length)];
        updated.photoCount = newCount;
        if (!this.isLocked('layout')) {
          const newLayout = this._pickCompatibleLayout(newCount, rng);
          updated.layoutId = newLayout;
          updated.layoutName = COLLAGE_LAYOUTS[newLayout]?.name || newLayout;
        }
        break;
      }
      case 'countdown': {
        const timers = [3, 5, 10].filter(t => t !== currentConfig.countdown);
        updated.countdown = timers[Math.floor(rng() * timers.length)] || 3;
        break;
      }
      case 'filter': {
        const newFilterId = this._pickWeightedFilter(family, rng);
        updated.filterId = newFilterId;
        updated.filterName = FILTER_PRESETS[newFilterId]?.name || newFilterId;
        break;
      }
      case 'layout': {
        const newLayoutId = this._pickCompatibleLayout(currentConfig.photoCount, rng);
        updated.layoutId = newLayoutId;
        updated.layoutName = COLLAGE_LAYOUTS[newLayoutId]?.name || newLayoutId;
        break;
      }
      case 'frameColor': {
        const otherColors = family.frameColors.filter(c => c !== currentConfig.frameColor);
        updated.frameColor = otherColors.length > 0 ? otherColors[Math.floor(rng() * otherColors.length)] : family.frameColors[0];
        break;
      }
    }

    return updated;
  }

  _pickWeightedFilter(family, rng) {
    const favs = preferenceManager.getFavorites('filters') || [];

    const roll = rng();
    if (roll < 0.5 && family.filters.length > 0) {
      return family.filters[Math.floor(rng() * family.filters.length)];
    } else if (roll < 0.8 && favs.length > 0) {
      return favs[Math.floor(rng() * favs.length)];
    } else {
      const all = Object.keys(FILTER_PRESETS);
      return all[Math.floor(rng() * all.length)];
    }
  }

  _pickCompatibleLayout(photoCount, rng) {
    const favs = preferenceManager.getFavorites('layouts') || [];
    const compatible = Object.keys(COLLAGE_LAYOUTS).filter(lId => {
      const l = COLLAGE_LAYOUTS[lId];
      if (photoCount === 2) return l.category === 'strips' || l.defaultSlotsCount === 2 || lId === 'duo-editorial';
      if (photoCount === 4) return l.defaultSlotsCount === 4 || lId === 'vertical-strip' || lId === 'grid-2x2' || lId === 'featured-3plus1';
      if (photoCount === 6) return l.defaultSlotsCount === 6 || lId === 'grid-2x3';
      return true;
    });

    const list = compatible.length > 0 ? compatible : ['vertical-strip', 'grid-2x2'];

    const favMatches = favs.filter(f => list.includes(f));
    if (favMatches.length > 0 && rng() < 0.4) {
      return favMatches[Math.floor(rng() * favMatches.length)];
    }

    return list[Math.floor(rng() * list.length)];
  }

  _generateSafeStickerPlacements(family, rng) {
    const count = rng() > 0.4 ? 1 : 2; 
    const placements = [];
    const pool = getAllBuiltInStickers();

    const safeAnchors = [
      { x: 0.12, y: 0.08, rot: -8 }, 
      { x: 0.88, y: 0.08, rot: 10 }, 
      { x: 0.15, y: 0.92, rot: 6 },  
      { x: 0.85, y: 0.92, rot: -12 },
    ];

    for (let i = 0; i < count; i++) {
      const anchor = safeAnchors[Math.floor(rng() * safeAnchors.length)];
      const item = pool[Math.floor(rng() * pool.length)];
      placements.push({
        id: `surprise_stamp_${Date.now()}_${i}`,
        type: 'emoji',
        emoji: item.emoji,
        label: item.label,
        xRatio: anchor.x,
        yRatio: anchor.y,
        rotation: anchor.rot,
        scale: 0.9 + rng() * 0.3,
        opacity: 0.95,
      });
    }

    return placements;
  }

  _recordSurprise(surprise) {
    this.recentSurprises.unshift(surprise);
    if (this.recentSurprises.length > this.maxHistory) {
      this.recentSurprises.pop();
    }
  }

  getLastSurprise() {
    return this.recentSurprises[0] || null;
  }
}

export const randomizerEngine = new RandomizerEngine();
