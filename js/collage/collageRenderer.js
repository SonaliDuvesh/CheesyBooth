import { COLLAGE_LAYOUTS } from './layouts.js';
import { GIFEncoder } from '../export/gifEncoder.js';
import { GIFDecoder } from '../export/gifDecoder.js';
import { VideoExporter } from '../export/videoExporter.js';
import { getFilterCSS } from '../filters/filterPresets.js';
import { imageCache } from '../performance/imageCache.js';
import { performanceManager } from '../performance/performanceManager.js';

export const STYLE_PRESETS = [
  {
    id: 'classic-booth',
    name: 'Classic Booth',
    icon: '🎞️',
    description: 'Timeless photobooth strip with warm cream paper and vintage glow',
    settings: {
      layoutId: 'vertical-strip',
      aspectRatio: 'strip',
      frameColor: '#FAF6EE',
      frameStyle: 'clean',
      paperTexture: 'subtle',
      spacing: 16,
      padding: 24,
      borderRadius: 8,
      filter: 'warm-vintage',
      filterIntensity: 80,
      textColor: '#292724',
      fontFamily: 'Space Grotesk',
    },
  },
  {
    id: 'vintage-film',
    name: 'Vintage 35mm',
    icon: '🎬',
    description: 'Dark cinema noir frame with 35mm sprocket holes & analog grain',
    settings: {
      layoutId: 'film-vertical',
      aspectRatio: 'strip',
      frameColor: '#292724',
      frameStyle: 'film',
      paperTexture: 'heavy',
      spacing: 12,
      padding: 28,
      borderRadius: 4,
      filter: 'film-35mm',
      filterIntensity: 85,
      textColor: '#FFFFFF',
      fontFamily: 'Courier Prime',
    },
  },
  {
    id: 'soft-memory',
    name: 'Soft Memory',
    icon: '🌸',
    description: 'Warm oatmeal aesthetic with soft corners and dreamy pastel tones',
    settings: {
      layoutId: 'grid-2x2',
      aspectRatio: '1:1',
      frameColor: '#EFE5D5',
      frameStyle: 'rounded',
      paperTexture: 'subtle',
      spacing: 18,
      padding: 28,
      borderRadius: 16,
      filter: 'soft-glow',
      filterIntensity: 75,
      textColor: '#292724',
      fontFamily: 'Playfair Display',
    },
  },
  {
    id: '90s-nostalgia',
    name: '90s Disposable',
    icon: '📸',
    description: 'Flashy vibrant 90s disposable look with peach warmth',
    settings: {
      layoutId: 'grid-2x2',
      aspectRatio: '1:1',
      frameColor: '#F4DDD4',
      frameStyle: 'clean',
      paperTexture: 'subtle',
      spacing: 14,
      padding: 22,
      borderRadius: 6,
      filter: 'disposable',
      filterIntensity: 90,
      textColor: '#5A2E20',
      fontFamily: 'Space Grotesk',
    },
  },
  {
    id: 'minimal-editorial',
    name: 'Editorial Mono',
    icon: '📰',
    description: 'High-contrast black & white duo with elegant framing and wide margins',
    settings: {
      layoutId: 'duo-editorial',
      aspectRatio: '4:5',
      frameColor: '#FAF6EE',
      frameStyle: 'vintage',
      paperTexture: 'subtle',
      spacing: 8,
      padding: 34,
      borderRadius: 2,
      filter: 'classic-bw',
      filterIntensity: 80,
      textColor: '#292724',
      fontFamily: 'Cinzel',
    },
  },
];

export class CollageRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.settings = {
      layoutId: 'vertical-strip',
      aspectRatio: 'strip', 
      frameColor: '#FAF6EE',
      textColor: '#292724',
      fontFamily: 'Space Grotesk',
      textAlign: 'center',
      frameStyle: 'clean', 
      paperTexture: 'subtle', 
      spacing: 16,
      padding: 24,
      borderRadius: 8,
      stampText: 'CHEESYBOOTH · ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      showStamp: true,
      filter: 'warm-vintage',
      filterIntensity: 80,
      photoShape: 'rounded', 
      slotTransforms: {}, 
      stickers: [], 
    };
    this._lastComputedSlots = [];
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.slotTransforms) {
      this.settings.slotTransforms = { ...newSettings.slotTransforms };
    }
  }

  getSettingsSnapshot() {
    return {
      ...this.settings,
      slotTransforms: JSON.parse(JSON.stringify(this.settings.slotTransforms || {})),
      stickers: (this.settings.stickers || []).map(s => ({ ...s })),
    };
  }

  restoreSettingsSnapshot(snapshot) {
    if (!snapshot) return;
    this.settings = {
      ...snapshot,
      slotTransforms: JSON.parse(JSON.stringify(snapshot.slotTransforms || {})),
      stickers: (snapshot.stickers || []).map(s => ({ ...s })),
    };
  }

  hasAnimatedStickers() {
    return (this.settings.stickers && this.settings.stickers.length > 0);
  }

  hasGifStickers() {
    return !!(this.settings.stickers && this.settings.stickers.some(s => s.frames && s.frames.length > 1));
  }

  getCanvasDimensions(photoCount = (this._lastPhotoCount || 4)) {
    const count = photoCount || 4;
    const aspect = this.settings.aspectRatio || 'strip';

    let canvasWidth = 1200;
    let canvasHeight = 1600;

    if (aspect === '1:1') {
      canvasWidth = 1400;
      canvasHeight = 1400;
    } else if (aspect === '4:5') {
      canvasWidth = 1200;
      canvasHeight = 1500;
    } else if (aspect === '3:4') {
      canvasWidth = 1200;
      canvasHeight = 1600;
    } else if (aspect === '4:3') {
      canvasWidth = 1600;
      canvasHeight = 1200;
    } else if (aspect === '16:9') {
      canvasWidth = 1600;
      canvasHeight = 900;
    } else {
      if (this.settings.layoutId === 'vertical-strip' || this.settings.layoutId === 'film-vertical' || this.settings.layoutId === 'circles-strip') {
        canvasWidth = 700;
        canvasHeight = Math.max(1600, Math.min(6000, count * 480 + 200));
      } else if (this.settings.layoutId === 'horizontal-strip') {
        canvasHeight = 750;
        canvasWidth = Math.max(1600, Math.min(8000, count * 500 + 200));
      } else if (this.settings.layoutId === 'grid-2x2' || this.settings.layoutId === 'heart-mosaic' || this.settings.layoutId === 'star-quad') {
        const cols = count >= 25 ? 5 : (count >= 16 ? 4 : (count >= 9 ? 3 : 2));
        const rows = Math.ceil(count / cols);
        canvasWidth = Math.max(1200, cols * 450);
        canvasHeight = Math.max(1200, rows * 450 + 100);
      } else if (this.settings.layoutId === 'featured-3plus1') {
        canvasWidth = 1400;
        canvasHeight = count > 8 ? 1800 : 1500;
      } else if (this.settings.layoutId === 'grid-2x3') {
        const cols = count >= 25 ? 5 : (count >= 16 ? 4 : (count >= 9 ? 3 : 2));
        const rows = Math.ceil(count / cols);
        canvasWidth = Math.max(1200, cols * 450);
        canvasHeight = Math.max(1500, rows * 480 + 100);
      } else if (this.settings.layoutId === 'duo-editorial' || this.settings.layoutId === 'oval-portrait' || this.settings.layoutId === 'arch-gallery') {
        const rows = Math.ceil(count / (count >= 10 ? 3 : 2));
        canvasWidth = 1200;
        canvasHeight = Math.max(1400, rows * 550);
      } else if (this.settings.layoutId === 'trio-minimal') {
        canvasWidth = 1300;
        canvasHeight = count > 4 ? 1600 : 1300;
      } else if (this.settings.layoutId === 'asymmetric-fun') {
        const cols = count >= 15 ? 4 : (count >= 8 ? 3 : 2);
        const rows = Math.ceil(count / cols);
        canvasWidth = Math.max(1200, cols * 450);
        canvasHeight = Math.max(1500, rows * 480);
      } else {
        canvasWidth = 1200;
        canvasHeight = 1600;
      }
    }

    return { width: canvasWidth, height: canvasHeight };
  }

  calculatePhotoSlots(photoCount = (this._lastPhotoCount || 4)) {
    const layout = COLLAGE_LAYOUTS[this.settings.layoutId] || COLLAGE_LAYOUTS['vertical-strip'];
    const count = photoCount || 4;
    this._lastPhotoCount = count;

    const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimensions(count);
    if (this.canvas && (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight)) {
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
    }

    const padding = (this.settings.padding !== undefined ? this.settings.padding : 16) * 2;
    const spacing = (this.settings.spacing !== undefined ? this.settings.spacing : 12) * 2;
    const stampExtraHeight = this.settings.showStamp ? 70 : 0;
    const polaroidExtraBottom = this.settings.frameStyle === 'polaroid' ? 90 : 0;

    const baseSlots = layout.calculateSlots(
      canvasWidth,
      canvasHeight - stampExtraHeight - polaroidExtraBottom,
      count,
      spacing,
      padding
    );

    const slots = baseSlots.map((baseSlot, i) => {
      const transform = this.getSlotTransform(i);
      const boxScale = transform.boxScale !== undefined ? transform.boxScale : 1.0;
      const offsetX = transform.boxOffsetX || 0;
      const offsetY = transform.boxOffsetY || 0;

      if (boxScale === 1.0 && offsetX === 0 && offsetY === 0) {
        return { ...baseSlot, canvasWidth, canvasHeight };
      }

      const origCenterX = baseSlot.x + baseSlot.width / 2;
      const origCenterY = baseSlot.y + baseSlot.height / 2;
      const newWidth = Math.max(30, Math.round(baseSlot.width * boxScale));
      const newHeight = Math.max(30, Math.round(baseSlot.height * boxScale));
      const newX = Math.round(origCenterX - newWidth / 2 + offsetX);
      const newY = Math.round(origCenterY - newHeight / 2 + offsetY);

      return {
        ...baseSlot,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        canvasWidth,
        canvasHeight,
      };
    });

    this._lastComputedSlots = slots;
    return slots;
  }

  getLastComputedSlots() {
    if (!this._lastComputedSlots || this._lastComputedSlots.length === 0) {
      this.calculatePhotoSlots();
    }
    return this._lastComputedSlots || [];
  }

  getSlotTransform(slotIndex) {
    return (this.settings.slotTransforms && this.settings.slotTransforms[slotIndex]) || {
      photoIndex: slotIndex,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: null,
      boxScale: 1.0,
      boxOffsetX: 0,
      boxOffsetY: 0,
    };
  }

  setSlotTransform(slotIndex, transform) {
    if (!this.settings.slotTransforms) this.settings.slotTransforms = {};
    const existing = this.getSlotTransform(slotIndex);
    this.settings.slotTransforms[slotIndex] = { ...existing, ...transform };
    this.calculatePhotoSlots();
  }

  resetSlotTransform(slotIndex) {
    if (!this.settings.slotTransforms) this.settings.slotTransforms = {};
    this.settings.slotTransforms[slotIndex] = {
      photoIndex: slotIndex,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: null,
      boxScale: 1.0,
      boxOffsetX: 0,
      boxOffsetY: 0,
    };
    this.calculatePhotoSlots();
  }

  swapSlots(slotIndexA, slotIndexB) {
    if (!this.settings.slotTransforms) this.settings.slotTransforms = {};
    const trA = this.getSlotTransform(slotIndexA);
    const trB = this.getSlotTransform(slotIndexB);

    this.settings.slotTransforms[slotIndexA] = { ...trB };
    this.settings.slotTransforms[slotIndexB] = { ...trA };
  }

  applyStylePreset(presetId) {
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    if (!preset) return null;
    this.updateSettings(preset.settings);
    return preset;
  }

  generateSurpriseCollage(currentLayoutId) {
    const layouts = Object.keys(COLLAGE_LAYOUTS);
    const colors = ['#FAF6EE', '#EFE5D5', '#F4DDD4', '#E2E8DC', '#C86D51', '#292724'];
    const frameStyles = ['clean', 'film', 'polaroid', 'vintage', 'rounded'];
    const filters = ['warm-vintage', 'disposable', 'film-35mm', 'digicam', 'golden-hour', 'dreamy', 'soft-glow', 'nostalgia-90s', 'classic-bw', 'pastel-peach'];

    const randomLayout = layouts[Math.floor(Math.random() * layouts.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomFrameStyle = randomLayout.includes('film') ? 'film' : frameStyles[Math.floor(Math.random() * frameStyles.length)];
    const randomFilter = filters[Math.floor(Math.random() * filters.length)];
    const isDark = randomColor === '#292724' || randomColor === '#C86D51';

    const surpriseConfig = {
      layoutId: randomLayout,
      frameColor: randomColor,
      frameStyle: randomFrameStyle,
      filter: randomFilter,
      textColor: isDark ? '#FFFFFF' : '#292724',
      spacing: Math.floor(Math.random() * 16) + 10,
      padding: Math.floor(Math.random() * 16) + 18,
      borderRadius: Math.floor(Math.random() * 12) + 4,
    };

    this.updateSettings(surpriseConfig);
    return surpriseConfig;
  }

  async render(photos, timeOffset = 0, targetCanvas = this.canvas) {
    if (!photos || photos.length === 0) return;
    const renderStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const layout = COLLAGE_LAYOUTS[this.settings.layoutId] || COLLAGE_LAYOUTS['vertical-strip'];
    const photoCount = photos.length;
    const ctx = targetCanvas.getContext('2d');

    const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimensions(photoCount);

    if (targetCanvas.width !== canvasWidth || targetCanvas.height !== canvasHeight) {
      targetCanvas.width = canvasWidth;
      targetCanvas.height = canvasHeight;
    }

    const padding = this.settings.padding * 2;
    const spacing = this.settings.spacing * 2;
    const stampExtraHeight = this.settings.showStamp ? 70 : 0;
    const polaroidExtraBottom = this.settings.frameStyle === 'polaroid' ? 90 : 0;

    ctx.fillStyle = this.settings.frameColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    this._drawFrameDecorations(canvasWidth, canvasHeight, ctx);

    if (this.settings.paperTexture !== 'none') {
      const isHeavy = this.settings.paperTexture === 'heavy';
      this._drawSubtlePaperGrain(canvasWidth, canvasHeight, ctx, timeOffset, isHeavy);
    }

    const slots = this.calculatePhotoSlots(photoCount);

    for (let i = 0; i < Math.min(slots.length, photoCount); i++) {
      const slot = slots[i];
      const slotTransform = this.getSlotTransform(i);
      const photoIdx = (slotTransform.photoIndex !== undefined && slotTransform.photoIndex < photos.length) 
        ? slotTransform.photoIndex 
        : i;
      const photo = photos[photoIdx] || photos[i];
      if (photo) {
        await this._drawPhotoToSlot(photo, slot, slotTransform, ctx);
      }
    }

    if (this.settings.showStamp !== false && this.settings.stampText) {
      this._drawStampFooter(canvasWidth, canvasHeight, ctx);
    }

    await this._drawStickers(canvasWidth, canvasHeight, ctx, timeOffset);

    if (typeof performance !== 'undefined') {
      performanceManager.recordRenderTime(performance.now() - renderStartTime);
    }
  }

  _drawFrameDecorations(width, height, ctx = this.ctx) {
    ctx.save();
    const style = this.settings.frameStyle || 'clean';

    if (style === 'film') {

      const isDark = this.settings.frameColor === '#292724' || this.settings.frameColor === '#000000';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(41, 39, 36, 0.18)';
      const holeW = 16;
      const holeH = 24;
      const holeRadius = 4;
      const stepY = 48;

      for (let y = 30; y < height - 30; y += stepY) {

        ctx.beginPath();
        ctx.roundRect(14, y, holeW, holeH, holeRadius);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(width - 14 - holeW, y, holeW, holeH, holeRadius);
        ctx.fill();
      }

      ctx.fillStyle = isDark ? '#E5A93C' : '#8A5D18';
      ctx.font = 'bold 12px "Courier Prime", monospace';
      ctx.fillText('▶ 24A', 40, height - 20);
      ctx.fillText('KODAK PORTRA 400', width - 160, height - 20);
    } else if (style === 'vintage') {

      ctx.strokeStyle = 'rgba(41, 39, 36, 0.2)';
      ctx.lineWidth = 2;
      const pad = 12;
      ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
      ctx.strokeRect(pad + 6, pad + 6, width - (pad + 6) * 2, height - (pad + 6) * 2);
    } else if (style === 'polaroid') {

      ctx.fillStyle = 'rgba(0,0,0,0.02)';
      ctx.fillRect(10, 10, width - 20, height - 20);
    }
    ctx.restore();
  }

  _clipShape(ctx, x, y, width, height, shape = 'rounded', radius = 8) {
    ctx.beginPath();
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;
    const clampedRadius = Math.max(0, Math.min(Math.min(width, height) / 2, radius));

    switch (shape) {
      case 'circle': {
        const r = Math.min(rx, ry);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        break;
      }
      case 'ellipse': {
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        break;
      }
      case 'heart': {
        const topCurveHeight = ry * 0.6;
        ctx.moveTo(cx, cy + ry * 0.85);
        ctx.bezierCurveTo(
          cx - rx * 0.98, cy + ry * 0.2,
          cx - rx * 0.98, cy - ry * 0.75,
          cx, cy - topCurveHeight * 0.25
        );
        ctx.bezierCurveTo(
          cx + rx * 0.98, cy - ry * 0.75,
          cx + rx * 0.98, cy + ry * 0.2,
          cx, cy + ry * 0.85
        );
        ctx.closePath();
        break;
      }
      case 'star': {
        const spikes = 5;
        const outerRadius = Math.min(rx, ry);
        const innerRadius = outerRadius * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
          rot += step;
          ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        break;
      }
      case 'arch': {
        const archH = Math.min(rx, height * 0.5);
        const bRadius = Math.min(clampedRadius, height - archH);
        ctx.moveTo(x, y + height - bRadius);
        ctx.lineTo(x, y + archH);
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(cx, y + archH, rx, archH, 0, Math.PI, 0, false);
        } else {
          ctx.arc(cx, y + archH, rx, Math.PI, 0, false);
        }
        ctx.lineTo(x + width, y + height - bRadius);
        if (bRadius > 0) {
          ctx.quadraticCurveTo(x + width, y + height, x + width - bRadius, y + height);
          ctx.lineTo(x + bRadius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - bRadius);
        } else {
          ctx.lineTo(x + width, y + height);
          ctx.lineTo(x, y + height);
        }
        ctx.closePath();
        break;
      }
      case 'diamond': {
        ctx.moveTo(cx, y);
        ctx.lineTo(x + width, cy);
        ctx.lineTo(cx, y + height);
        ctx.lineTo(x, cy);
        ctx.closePath();
        break;
      }
      case 'square':
      case 'rectangle': {
        ctx.rect(x, y, width, height);
        break;
      }
      case 'rounded':
      default: {
        const effRadius = Math.max(0, clampedRadius);
        if (effRadius > 0) {
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, width, height, effRadius);
          } else {
            const r = effRadius;
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + width - r, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + r);
            ctx.lineTo(x + width, y + height - r);
            ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
            ctx.lineTo(x + r, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
          }
        } else {
          ctx.rect(x, y, width, height);
        }
        break;
      }
    }
  }

  async _drawPhotoToSlot(photo, slot, transform = {}, ctx = this.ctx) {
    const img = await this._loadImage(photo.imageData);
    const { x, y, width, height } = slot;
    const radius = (this.settings.borderRadius !== undefined ? this.settings.borderRadius : 8) * 2;
    const activeShape = slot.shape || this.settings.photoShape || 'rounded';

    const zoom = transform.zoom || 1.0;
    const panX = transform.panX || 0;
    const panY = transform.panY || 0;
    const rotation = transform.rotation || 0;
    const flipH = transform.flipH || false;
    const flipV = transform.flipV || false;
    const slotFilter = transform.filter || this.settings.filter;

    ctx.save();

    this._clipShape(ctx, x, y, width, height, activeShape, radius);
    ctx.clip();

    const coverScale = Math.max(width / img.width, height / img.height) * Math.max(0.5, zoom || 1.0);
    const drawW = img.width * coverScale;
    const drawH = img.height * coverScale;

    const normPanX = (typeof panX === 'number' && Math.abs(panX) > 1) ? panX / 100 : (panX || 0);
    const normPanY = (typeof panY === 'number' && Math.abs(panY) > 1) ? panY / 100 : (panY || 0);

    const panRangeX = Math.max(Math.abs(drawW - width), drawW * 0.5);
    const panRangeY = Math.max(Math.abs(drawH - height), drawH * 0.5);

    const shiftX = normPanX * panRangeX;
    const shiftY = normPanY * panRangeY;

    ctx.translate(x + width / 2 + shiftX, y + height / 2 + shiftY);
    if (flipH || flipV) {
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    }
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    this._applyFilterEffects(slotFilter, ctx);

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    ctx.save();
    this._clipShape(ctx, x, y, width, height, activeShape, radius);
    ctx.strokeStyle = 'rgba(41, 39, 36, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  _applyFilterEffects(filterName, ctx = this.ctx) {
    const intensity = this.settings.filterIntensity !== undefined ? this.settings.filterIntensity : 80;
    ctx.filter = getFilterCSS(filterName, intensity);
  }

  _isDarkColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') return false;
    let hex = hexColor.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 140;
  }

  _drawStampFooter(canvasWidth, canvasHeight, ctx = this.ctx) {
    if (!this.settings.stampText || !this.settings.stampText.trim()) return;
    ctx.save();
    const isDarkBg = this._isDarkColor(this.settings.frameColor);
    ctx.fillStyle = (this.settings.textColor && this.settings.textColor !== 'auto')
      ? this.settings.textColor
      : (isDarkBg ? '#FAF6EE' : '#292724');

    const fontFam = this.settings.fontFamily || 'Space Grotesk';
    const textUpper = this.settings.stampText.toUpperCase();

    const padding = (this.settings.padding !== undefined ? this.settings.padding : 16) * 2;
    const maxTextWidth = Math.max(100, canvasWidth - padding * 2 - 32);

    let fontSize = Math.max(18, Math.min(36, Math.round(canvasWidth * 0.024)));
    ctx.font = `bold ${fontSize}px "${fontFam}", sans-serif`;
    let measured = ctx.measureText(textUpper).width;
    while (measured > maxTextWidth && fontSize > 10) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px "${fontFam}", sans-serif`;
      measured = ctx.measureText(textUpper).width;
    }

    const polaroidExtraBottom = this.settings.frameStyle === 'polaroid' ? 90 : 0;
    const footerZoneH = 70 + polaroidExtraBottom;
    ctx.textBaseline = 'middle';
    const textY = Math.round(canvasHeight - padding - (footerZoneH / 2));

    const align = this.settings.textAlign || this.settings.footerAlignment || 'center';
    ctx.textAlign = align;
    try {
      ctx.letterSpacing = fontSize > 14 ? '2.5px' : '1px';
    } catch (e) {}

    let textX = canvasWidth / 2;
    if (align === 'left') {
      textX = padding + 16;
    } else if (align === 'right') {
      textX = canvasWidth - padding - 16;
    }

    ctx.fillText(textUpper, textX, textY);
    ctx.restore();
  }

  async _drawStickers(canvasWidth, canvasHeight, ctx = this.ctx, time = 0) {
    if (!this.settings.stickers || this.settings.stickers.length === 0) return;

    const visibleStickers = this.settings.stickers.filter(s => !s.hidden);

    for (let index = 0; index < visibleStickers.length; index++) {
      const s = visibleStickers[index];
      ctx.save();

      const opacity = s.opacity !== undefined ? Math.max(0, Math.min(1, s.opacity)) : 1.0;
      ctx.globalAlpha = opacity;

      const posX = s.x * canvasWidth;
      const posY = s.y * canvasHeight;
      ctx.translate(posX, posY);

      const scaleX = s.flipX ? -1 : 1;
      const scaleY = s.flipY ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      let dynamicScale = 1.0;
      let dynamicRotation = s.rotation || 0;
      const isMultiFrameGif = s.frames && s.frames.length > 1;

      if (time > 0 && !isMultiFrameGif && s.type !== 'gif' && s.type !== 'image') {
        if (s.emoji === '✨' || s.emoji === '⭐️') {
          dynamicScale = 1.0 + Math.sin(time * 6 + index * 1.5) * 0.18;
          dynamicRotation += Math.sin(time * 4 + index) * 8;
        } else if (s.emoji === '❤️' || s.emoji === '💖' || s.emoji === '💌') {
          dynamicScale = 1.0 + Math.sin(time * 8 + index) * 0.14;
        } else if (s.emoji === '🎀' || s.emoji === '🌸' || s.emoji === '🦋' || s.emoji === '🎈') {
          dynamicRotation += Math.sin(time * 3 + index * 2) * 12;
          dynamicScale = 1.0 + Math.cos(time * 4) * 0.08;
        }
      }

      if (dynamicRotation) {
        ctx.rotate((dynamicRotation * Math.PI) / 180);
      }

      let drewFrame = false;
      if (s.frames && s.frames.length > 0) {
        const totalDuration = s.frames.reduce((sum, f) => sum + (f.delay || 100), 0) || 1000;
        const curTimeMs = (time * 1000) % totalDuration;
        let acc = 0;
        let currentFrame = s.frames[0];
        for (const f of s.frames) {
          acc += (f.delay || 100);
          if (curTimeMs < acc) {
            currentFrame = f;
            break;
          }
        }
        if (currentFrame && currentFrame.canvas) {
          const fw = currentFrame.canvas.width || 1;
          const fh = currentFrame.canvas.height || 1;
          const aspect = s.aspectRatio || (fw / fh);
          const baseSize = (s.size || 64) * 2 * dynamicScale;
          const drawW = aspect >= 1 ? baseSize * aspect : baseSize;
          const drawH = aspect >= 1 ? baseSize : baseSize / aspect;
          ctx.drawImage(currentFrame.canvas, -drawW / 2, -drawH / 2, drawW, drawH);
          drewFrame = true;
        }
      }

      if (!drewFrame && (s.type === 'image' || s.type === 'gif') && s.imgSrc) {
        try {
          const img = await this._loadImage(s.imgSrc);
          if (img) {
            const iw = img.naturalWidth || img.width || 1;
            const ih = img.naturalHeight || img.height || 1;
            const aspect = s.aspectRatio || (iw / ih);
            const baseSize = (s.size || 64) * 2 * dynamicScale;
            const drawW = aspect >= 1 ? baseSize * aspect : baseSize;
            const drawH = aspect >= 1 ? baseSize : baseSize / aspect;
            ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
            drewFrame = true;
          }
        } catch (e) {
          console.warn('Failed to draw custom sticker image:', e);
        }
      } else if (!drewFrame) {
        const fontSize = Math.round((s.size || 54) * dynamicScale);
        ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.emoji || '✨', 0, 0);
      }
      ctx.restore();
    }
  }

  async addSticker(emojiOrText, type = 'emoji', options = {}) {
    const id = 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const scatterX = (Math.random() - 0.5) * 0.35;
    const scatterY = (Math.random() - 0.5) * 0.35;
    const rotation = (Math.random() - 0.5) * 16;

    const isDataUriOrUrl = typeof emojiOrText === 'string' && (emojiOrText.startsWith('data:') || emojiOrText.startsWith('http://') || emojiOrText.startsWith('https://') || emojiOrText.startsWith('blob:'));
    const isGif = type === 'gif' || (isDataUriOrUrl && (emojiOrText.startsWith('data:image/gif') || emojiOrText.toLowerCase().includes('.gif')));
    const isImage = isGif || type === 'image' || isDataUriOrUrl;

    let frames = null;
    let aspectRatio = 1.0;
    if (isImage) {
      try {
        frames = await GIFDecoder.decodeGIF(emojiOrText);
        if (frames && frames.length > 0 && frames[0].canvas) {
          aspectRatio = frames[0].canvas.width / frames[0].canvas.height;
        }
      } catch (e) {
        console.warn('GIF frame decode fallback:', e);
      }
      if (!frames || frames.length <= 1) {
        try {
          const img = await this._loadImage(emojiOrText);
          if (img && img.naturalWidth && img.naturalHeight) {
            aspectRatio = img.naturalWidth / img.naturalHeight;
          }
        } catch (e) {}
      }
    }

    const newSticker = {
      id,
      type: isGif ? 'gif' : (isImage ? 'image' : type),
      emoji: isImage ? (isGif ? '🎞️ GIF' : '🖼️ Stamp') : emojiOrText,
      imgSrc: isImage ? emojiOrText : null,
      frames,
      aspectRatio,
      x: options.x !== undefined ? options.x : Math.max(0.12, Math.min(0.88, 0.5 + scatterX)),
      y: options.y !== undefined ? options.y : Math.max(0.12, Math.min(0.88, 0.5 + scatterY)),
      size: options.size !== undefined ? options.size : (isImage ? 70 : 54),
      rotation: options.rotation !== undefined ? options.rotation : rotation,
      opacity: options.opacity !== undefined ? options.opacity : 1.0,
      flipX: options.flipX || false,
      flipY: options.flipY || false,
      locked: options.locked || false,
      hidden: options.hidden || false,
    };

    if (!this.settings.stickers) {
      this.settings.stickers = [];
    }
    this.settings.stickers.push(newSticker);
    return newSticker;
  }

  removeSticker(stickerId) {
    if (!this.settings.stickers) return;
    this.settings.stickers = this.settings.stickers.filter((s) => s.id !== stickerId);
  }

  duplicateSticker(stickerId) {
    if (!this.settings.stickers) return null;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (!sticker) return null;

    const newId = 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const duplicated = {
      ...sticker,
      id: newId,
      x: Math.min(0.92, (sticker.x || 0.5) + 0.04),
      y: Math.min(0.92, (sticker.y || 0.5) + 0.04),
      locked: false,
    };
    this.settings.stickers.push(duplicated);
    return duplicated;
  }

  flipSticker(stickerId, axis = 'x') {
    if (!this.settings.stickers) return;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (!sticker) return;
    if (axis === 'x') sticker.flipX = !sticker.flipX;
    if (axis === 'y') sticker.flipY = !sticker.flipY;
  }

  setStickerOpacity(stickerId, opacity) {
    if (!this.settings.stickers) return;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker) {
      sticker.opacity = Math.max(0.05, Math.min(1.0, opacity));
    }
  }

  toggleStickerLock(stickerId) {
    if (!this.settings.stickers) return false;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker) {
      sticker.locked = !sticker.locked;
      return sticker.locked;
    }
    return false;
  }

  toggleStickerHidden(stickerId) {
    if (!this.settings.stickers) return false;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker) {
      sticker.hidden = !sticker.hidden;
      return sticker.hidden;
    }
    return false;
  }

  reorderStickerLayer(stickerId, direction) {
    if (!this.settings.stickers) return;
    const idx = this.settings.stickers.findIndex((s) => s.id === stickerId);
    if (idx === -1) return;

    const [item] = this.settings.stickers.splice(idx, 1);
    if (direction === 'front') {
      this.settings.stickers.push(item);
    } else if (direction === 'back') {
      this.settings.stickers.unshift(item);
    } else if (direction === 'up') {
      const newIdx = Math.min(this.settings.stickers.length, idx + 1);
      this.settings.stickers.splice(newIdx, 0, item);
    } else if (direction === 'down') {
      const newIdx = Math.max(0, idx - 1);
      this.settings.stickers.splice(newIdx, 0, item);
    }
  }

  clearStickers() {
    this.settings.stickers = [];
  }

  updateStickerPosition(stickerId, xPercent, yPercent) {
    if (!this.settings.stickers) return;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker && !sticker.locked) {
      sticker.x = Math.max(-0.05, Math.min(1.05, xPercent));
      sticker.y = Math.max(-0.05, Math.min(1.05, yPercent));
    }
  }

  updateStickerSize(stickerId, newSize) {
    if (!this.settings.stickers) return;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker && !sticker.locked) {
      sticker.size = Math.max(20, Math.min(220, newSize));
    }
  }

  updateStickerRotation(stickerId, newRotation) {
    if (!this.settings.stickers) return;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker && !sticker.locked) {
      sticker.rotation = (newRotation % 360 + 360) % 360;
    }
  }

  updateStickerTransform(stickerId, { x, y, size, rotation, opacity, flipX, flipY, locked, hidden }) {
    if (!this.settings.stickers) return;
    const sticker = this.settings.stickers.find((s) => s.id === stickerId);
    if (sticker) {
      if (x !== undefined && !sticker.locked) sticker.x = Math.max(0.02, Math.min(0.98, x));
      if (y !== undefined && !sticker.locked) sticker.y = Math.max(0.02, Math.min(0.98, y));
      if (size !== undefined && !sticker.locked) sticker.size = Math.max(20, Math.min(220, size));
      if (rotation !== undefined && !sticker.locked) sticker.rotation = (rotation % 360 + 360) % 360;
      if (opacity !== undefined) sticker.opacity = Math.max(0.05, Math.min(1.0, opacity));
      if (flipX !== undefined) sticker.flipX = flipX;
      if (flipY !== undefined) sticker.flipY = flipY;
      if (locked !== undefined) sticker.locked = locked;
      if (hidden !== undefined) sticker.hidden = hidden;
    }
  }

  _drawSubtlePaperGrain(width, height, ctx = this.ctx, time = 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(41, 39, 36, 0.015)';
    const seed = Math.floor(time * 10);
    for (let i = 0; i < 350; i++) {
      const rx = ((Math.sin(i * 99 + seed) * 10000) % 1 + 1) % 1 * width;
      const ry = ((Math.cos(i * 33 + seed) * 10000) % 1 + 1) % 1 * height;
      ctx.fillRect(rx, ry, 2, 2);
    }
    ctx.restore();
  }

  _loadImage(src) {
    return imageCache.load(src);
  }

  exportAsBlob() {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
    });
  }

  async exportAsGIF(photos, { fps = 10, durationSec, width = 480, onProgress } = {}) {
    if (!photos || photos.length === 0) return null;

    let targetDuration = durationSec;
    if (!targetDuration) {
      let maxStickerDuration = 0;
      let hasMultiFrameSticker = false;
      if (this.settings.stickers && this.settings.stickers.length > 0) {
        for (const s of this.settings.stickers) {
          if (s.frames && s.frames.length > 1) {
            hasMultiFrameSticker = true;
            const dur = s.frames.reduce((sum, f) => sum + (f.delay || 100), 0) / 1000;
            if (dur > maxStickerDuration) maxStickerDuration = dur;
          }
        }
      }
      if (hasMultiFrameSticker && maxStickerDuration > 0) {
        targetDuration = Math.min(5.0, Math.max(1.5, Math.round(maxStickerDuration * 10) / 10));
      } else {
        targetDuration = 2.0; 
      }
    }

    const highResCanvas = document.createElement('canvas');
    await this.render(photos, 0, highResCanvas);

    const aspectRatio = highResCanvas.height / highResCanvas.width;
    const gifWidth = Math.min(500, width || 480);
    const gifHeight = Math.round(gifWidth * aspectRatio);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = gifWidth;
    frameCanvas.height = gifHeight;
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.imageSmoothingEnabled = true;
    frameCtx.imageSmoothingQuality = 'high';

    const encoder = new GIFEncoder(gifWidth, gifHeight);
    encoder.setDelay(Math.round(1000 / fps));

    const totalFrames = Math.max(6, Math.round(fps * targetDuration));
    const timeStep = targetDuration / totalFrames;

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const time = frameIndex * timeStep;

      await this.render(photos, time, highResCanvas);

      frameCtx.clearRect(0, 0, gifWidth, gifHeight);
      frameCtx.drawImage(highResCanvas, 0, 0, gifWidth, gifHeight);

      encoder.addFrame(frameCtx);

      if (onProgress) {
        onProgress(Math.round(((frameIndex + 1) / totalFrames) * 100));
      }
      await new Promise(r => setTimeout(r, 0));
    }

    const gifBlob = encoder.finish();
    return gifBlob;
  }

  async downloadGIF(photos, filename = 'pocket-booth-animated.gif', onProgress) {
    const blob = await this.exportAsGIF(photos, { fps: 10, onProgress });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async downloadImage(filename = 'pocket-booth-print.png') {
    const blob = await this.exportAsBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async copyToClipboard() {
    try {
      const blob = await this.exportAsBlob();
      if (!blob || !navigator.clipboard || !navigator.clipboard.write) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    } catch (e) {
      console.warn('Clipboard write failed:', e);
      return false;
    }
  }
}
