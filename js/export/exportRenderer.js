
import { COLLAGE_LAYOUTS } from '../collage/layouts.js';
import { getFilterCSS } from '../filters/filterPresets.js';
import { imageCache } from '../performance/imageCache.js';

export class ExportRenderer {
  constructor(collageRenderer) {
    this.collageRenderer = collageRenderer;
    this._offscreenCanvas = null;
  }

  getBaseDimensions() {
    const settings = this.collageRenderer.settings;
    const aspect = settings.aspectRatio || 'strip';
    const layoutId = settings.layoutId || 'vertical-strip';

    let width = 1200;
    let height = 1600;

    if (aspect === '1:1') {
      width = 1400; height = 1400;
    } else if (aspect === '4:5') {
      width = 1200; height = 1500;
    } else if (aspect === '3:4') {
      width = 1200; height = 1600;
    } else if (aspect === '4:3') {
      width = 1600; height = 1200;
    } else if (aspect === '16:9') {
      width = 1600; height = 900;
    } else {

      if (layoutId === 'vertical-strip') {
        width = 700; height = 2200;
      } else if (layoutId === 'grid-2x2') {
        width = 1400; height = 1500;
      } else if (layoutId === 'horizontal-strip') {
        width = 2400; height = 750;
      } else if (layoutId === 'featured-3plus1') {
        width = 1400; height = 1500;
      } else if (layoutId === 'grid-2x3') {
        width = 1200; height = 1800;
      } else if (layoutId === 'film-vertical') {
        width = 720; height = 1800;
      } else if (layoutId === 'duo-editorial') {
        width = 1100; height = 1400;
      } else if (layoutId === 'trio-minimal') {
        width = 1300; height = 1300;
      } else if (layoutId === 'asymmetric-fun') {
        width = 1200; height = 1500;
      }
    }

    return { width, height, aspectRatio: width / height };
  }

  computeExportDimensions({ scale = 1.0, width, height } = {}) {
    const base = this.getBaseDimensions();

    if (width && height && !isNaN(width) && !isNaN(height)) {

      const clampedW = Math.min(8000, Math.max(100, Math.round(width)));
      const clampedH = Math.min(8000, Math.max(100, Math.round(height)));
      return { width: clampedW, height: clampedH, scale: clampedW / base.width };
    }

    const s = typeof scale === 'number' && scale > 0 ? scale : 1.0;
    const computedW = Math.round(base.width * s);
    const computedH = Math.round(base.height * s);
    return { width: computedW, height: computedH, scale: s };
  }

  async renderExportCanvas(photos, {
    scale = 1.0,
    width,
    height,
    timeOffset = 0,
    transparentBg = false,
  } = {}) {
    if (!photos || photos.length === 0) return null;

    const dims = this.computeExportDimensions({ scale, width, height });

    const masterCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    if (!masterCanvas) return null;

    const origFrameColor = this.collageRenderer.settings.frameColor;
    if (transparentBg) {
      this.collageRenderer.settings.frameColor = 'transparent';
    }

    try {
      await this.collageRenderer.render(photos, timeOffset, masterCanvas);
    } finally {
      if (transparentBg) {
        this.collageRenderer.settings.frameColor = origFrameColor;
      }
    }

    if (masterCanvas.width === dims.width && masterCanvas.height === dims.height && (transparentBg || (origFrameColor && origFrameColor !== 'transparent'))) {
      return masterCanvas;
    }

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = dims.width;
    exportCanvas.height = dims.height;

    const ctx = exportCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (!transparentBg) {
      ctx.fillStyle = (!origFrameColor || origFrameColor === 'transparent') ? '#FFFFFF' : origFrameColor;
      ctx.fillRect(0, 0, dims.width, dims.height);
    }

    ctx.drawImage(masterCanvas, 0, 0, dims.width, dims.height);
    return exportCanvas;
  }

  async renderSinglePhotoCanvas(photo, {
    scale = 1.0,
    targetWidth = 1200,
    filter = null,
    filterIntensity = null,
  } = {}) {
    if (!photo || !photo.imageData) return null;

    const img = await this._loadImage(photo.imageData);
    const activeFilter = filter || this.collageRenderer.settings.filter || 'warm-vintage';
    const activeIntensity = filterIntensity !== null ? filterIntensity : (this.collageRenderer.settings.filterIntensity || 80);

    const aspect = img.width / img.height;
    const w = Math.round(targetWidth * scale);
    const h = Math.round(w / aspect);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.filter = getFilterCSS(activeFilter, activeIntensity);
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = 'none';

    return canvas;
  }

  _loadImage(src) {
    return imageCache.load(src);
  }

  clearCache() {
    imageCache.clear();
  }
}
