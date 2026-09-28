
import { PrintUnitConverter, PAPER_SIZE_PRESETS, PAPER_COLORS } from './printSettings.js';
import { getFilterCSS } from '../filters/filterPresets.js';
import { imageCache } from '../performance/imageCache.js';

export class PrintRenderer {
  constructor(exportRenderer, collageRenderer) {
    this.exportRenderer = exportRenderer;
    this.collageRenderer = collageRenderer;
  }

  calculateDimensions(config) {
    let widthIn = 4.0;
    let heightIn = 6.0;

    if (config.paperPreset === 'custom') {
      const unit = config.customUnit || 'in';
      widthIn = PrintUnitConverter.toInches(config.customWidth || 4, unit);
      heightIn = PrintUnitConverter.toInches(config.customHeight || 6, unit);
    } else {
      const preset = PAPER_SIZE_PRESETS.find(p => p.id === config.paperPreset) || PAPER_SIZE_PRESETS[2];
      widthIn = preset.widthIn;
      heightIn = preset.heightIn;
    }

    const orientation = config.orientation || 'portrait';
    if (orientation === 'landscape') {
      if (widthIn < heightIn) {
        const tmp = widthIn;
        widthIn = heightIn;
        heightIn = tmp;
      }
    } else if (orientation === 'portrait') {
      if (widthIn > heightIn) {
        const tmp = widthIn;
        widthIn = heightIn;
        heightIn = tmp;
      }
    } else if (orientation === 'square') {
      const minDim = Math.min(widthIn, heightIn);
      widthIn = minDim;
      heightIn = minDim;
    }

    const dpi = parseInt(config.dpi, 10) || 300;
    const paperWidthPx = PrintUnitConverter.toPixels(widthIn, dpi);
    const paperHeightPx = PrintUnitConverter.toPixels(heightIn, dpi);

    const marginMm = typeof config.marginMm === 'number' ? config.marginMm : 6;
    const marginPx = PrintUnitConverter.mmToPixels(marginMm, dpi);

    const bleedMm = typeof config.bleedMm === 'number' ? config.bleedMm : 0;
    const bleedPx = PrintUnitConverter.mmToPixels(bleedMm, dpi);

    const printableWidthPx = Math.max(100, paperWidthPx - marginPx * 2);
    const printableHeightPx = Math.max(100, paperHeightPx - marginPx * 2);

    const totalPixels = paperWidthPx * paperHeightPx;
    const estimatedRamMB = Math.round((totalPixels * 4) / (1024 * 1024) * 10) / 10;
    const isHighMemory = totalPixels > 24000000; 

    return {
      widthIn,
      heightIn,
      widthMm: Math.round(widthIn * 25.4 * 10) / 10,
      heightMm: Math.round(heightIn * 25.4 * 10) / 10,
      dpi,
      paperWidthPx,
      paperHeightPx,
      marginMm,
      marginPx,
      bleedMm,
      bleedPx,
      printableWidthPx,
      printableHeightPx,
      totalPixels,
      estimatedRamMB,
      isHighMemory,
    };
  }

  evaluateSourceQuality(photos, dims) {
    if (!photos || photos.length === 0) return { isLowRes: false, recommendation: '' };

    const sample = photos[0];
    let srcW = 1280;
    let srcH = 720;
    if (sample && sample.width && sample.height) {
      srcW = sample.width;
      srcH = sample.height;
    }

    const effectivePpi = Math.min(srcW / dims.widthIn, srcH / dims.heightIn);
    const isLowRes = effectivePpi < 160 && (dims.widthIn > 5 || dims.heightIn > 7);

    let recommendation = '';
    if (isLowRes) {
      recommendation = `Photo may appear softer at ${dims.widthIn}×${dims.heightIn} in. Recommended print size: 4 × 6 in.`;
    }

    return {
      isLowRes,
      effectivePpi: Math.round(effectivePpi),
      recommendation,
    };
  }

  async renderPrintSheet(photos, config, { isPreview = false, previewMaxDim = 600 } = {}) {
    if (!photos || photos.length === 0) return null;

    const dims = this.calculateDimensions(config);
    let renderW = dims.paperWidthPx;
    let renderH = dims.paperHeightPx;
    let scaleFactor = 1.0;

    if (isPreview) {
      const maxDim = Math.max(renderW, renderH);
      if (maxDim > previewMaxDim) {
        scaleFactor = previewMaxDim / maxDim;
        renderW = Math.round(renderW * scaleFactor);
        renderH = Math.round(renderH * scaleFactor);
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = renderW;
    canvas.height = renderH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = config.paperColor || '#FFFFFF';
    ctx.fillRect(0, 0, renderW, renderH);

    const marginPx = Math.round(dims.marginPx * scaleFactor);
    const printableW = Math.round(dims.printableWidthPx * scaleFactor);
    const printableH = Math.round(dims.printableHeightPx * scaleFactor);

    const layoutMode = config.layoutMode || 'single';

    if (layoutMode === 'multiple_strips') {
      await this._renderTwinStrips(photos, ctx, {
        x: marginPx,
        y: marginPx,
        width: printableW,
        height: printableH,
        stripCount: config.stripCount || 2,
        scaleFactor,
        fitMode: config.fitMode,
      });
    } else if (layoutMode === 'contact_sheet') {
      await this._renderContactSheet(photos, ctx, {
        x: marginPx,
        y: marginPx,
        width: printableW,
        height: printableH,
        scaleFactor,
      });
    } else {

      await this._renderSingleComposition(photos, ctx, {
        x: marginPx,
        y: marginPx,
        width: printableW,
        height: printableH,
        fitMode: config.fitMode || 'fill',
        borderStyle: config.borderStyle || 'none',
        scaleFactor,
      });
    }

    if (config.borderStyle && config.borderStyle !== 'none') {
      this._drawPrintBorder(ctx, config.borderStyle, {
        x: marginPx,
        y: marginPx,
        width: printableW,
        height: printableH,
        scaleFactor,
      });
    }

    if (isPreview) {
      this._drawPreviewGuides(ctx, renderW, renderH, marginPx, dims, scaleFactor, config);
    }

    return canvas;
  }

  async _renderSingleComposition(photos, ctx, { x, y, width, height, fitMode = 'fill' } = {}) {

    const baseArtworkCanvas = await this.exportRenderer.renderExportCanvas(photos, {
      scale: 1.5,
    });
    if (!baseArtworkCanvas) return;

    const artW = baseArtworkCanvas.width;
    const artH = baseArtworkCanvas.height;
    const artAspect = artW / artH;
    const targetAspect = width / height;

    let drawX = x;
    let drawY = y;
    let drawW = width;
    let drawH = height;
    let srcX = 0;
    let srcY = 0;
    let srcW = artW;
    let srcH = artH;

    if (fitMode === 'fit') {

      if (artAspect > targetAspect) {
        drawW = width;
        drawH = width / artAspect;
        drawY = y + (height - drawH) / 2;
      } else {
        drawH = height;
        drawW = height * artAspect;
        drawX = x + (width - drawW) / 2;
      }
    } else {

      if (artAspect > targetAspect) {
        srcW = artH * targetAspect;
        srcX = (artW - srcW) / 2;
      } else {
        srcH = artW / targetAspect;
        srcY = (artH - srcH) / 2;
      }
    }

    ctx.save();

    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.drawImage(baseArtworkCanvas, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  async _renderTwinStrips(photos, ctx, { x, y, width, height, stripCount = 2, scaleFactor = 1.0 } = {}) {

    const stripCanvas = await this.exportRenderer.renderExportCanvas(photos, { scale: 1.5 });
    if (!stripCanvas) return;

    const spacing = Math.round(8 * scaleFactor);
    const availableWidth = width - spacing * (stripCount - 1);
    const singleStripW = availableWidth / stripCount;
    const singleStripH = height;

    const artAspect = stripCanvas.width / stripCanvas.height;

    for (let i = 0; i < stripCount; i++) {
      const curX = x + i * (singleStripW + spacing);

      let drawW = singleStripW;
      let drawH = singleStripW / artAspect;
      let drawY = y + (singleStripH - drawH) / 2;

      if (drawH > singleStripH) {
        drawH = singleStripH;
        drawW = singleStripH * artAspect;
      }
      const centeredX = curX + (singleStripW - drawW) / 2;

      ctx.drawImage(stripCanvas, 0, 0, stripCanvas.width, stripCanvas.height, centeredX, drawY, drawW, drawH);

      if (i < stripCount - 1) {
        const cutX = curX + singleStripW + spacing / 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(41, 39, 36, 0.25)';
        ctx.setLineDash([4 * scaleFactor, 4 * scaleFactor]);
        ctx.lineWidth = Math.max(1, 1 * scaleFactor);
        ctx.beginPath();
        ctx.moveTo(cutX, y);
        ctx.lineTo(cutX, y + height);
        ctx.stroke();

        ctx.font = `${Math.round(10 * scaleFactor)}px sans-serif`;
        ctx.fillStyle = 'rgba(41, 39, 36, 0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('✂', cutX, y + height / 2);
        ctx.restore();
      }
    }
  }

  async _renderContactSheet(photos, ctx, { x, y, width, height, scaleFactor = 1.0 } = {}) {
    const total = photos.length;
    const cols = total <= 4 ? 2 : (total <= 6 ? 3 : 4);
    const rows = Math.ceil(total / cols);

    const cellSpacing = Math.round(12 * scaleFactor);
    const cellW = (width - cellSpacing * (cols - 1)) / cols;
    const cellH = (height - cellSpacing * (rows - 1)) / rows;

    const activeFilter = this.collageRenderer.settings.filter || 'warm-vintage';
    const activeIntensity = this.collageRenderer.settings.filterIntensity || 80;

    for (let i = 0; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellX = x + col * (cellW + cellSpacing);
      const cellY = y + row * (cellH + cellSpacing);

      const photo = photos[i];
      if (!photo || !photo.imageData) continue;

      const img = await this._loadImage(photo.imageData);
      const aspect = img.width / img.height;

      let drawW = cellW;
      let drawH = cellW / aspect;
      if (drawH > cellH - Math.round(18 * scaleFactor)) {
        drawH = cellH - Math.round(18 * scaleFactor);
        drawW = drawH * aspect;
      }
      const drawX = cellX + (cellW - drawW) / 2;
      const drawY = cellY + (cellH - Math.round(18 * scaleFactor) - drawH) / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cellX, cellY, cellW, cellH);

      ctx.save();
      ctx.filter = getFilterCSS(activeFilter, activeIntensity);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      ctx.strokeStyle = 'rgba(41, 39, 36, 0.12)';
      ctx.lineWidth = Math.max(1, 1 * scaleFactor);
      ctx.strokeRect(cellX, cellY, cellW, cellH);

      ctx.fillStyle = 'rgba(41, 39, 36, 0.65)';
      ctx.font = `bold ${Math.round(9 * scaleFactor)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`#${i + 1} · SAY CHEESE`, cellX + cellW / 2, cellY + cellH - Math.round(5 * scaleFactor));
    }
  }

  _drawPrintBorder(ctx, style, { x, y, width, height, scaleFactor = 1.0 }) {
    ctx.save();
    if (style === 'thin') {
      ctx.strokeStyle = 'rgba(41, 39, 36, 0.35)';
      ctx.lineWidth = Math.max(1, 1.5 * scaleFactor);
      ctx.strokeRect(x, y, width, height);
    } else if (style === 'classic') {
      ctx.strokeStyle = 'rgba(41, 39, 36, 0.3)';
      ctx.lineWidth = Math.max(1, 2 * scaleFactor);
      const offset = Math.round(6 * scaleFactor);
      ctx.strokeRect(x - offset, y - offset, width + offset * 2, height + offset * 2);
    } else if (style === 'photobooth') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.round(8 * scaleFactor);
      ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
  }

  _drawPreviewGuides(ctx, w, h, marginPx, dims, scaleFactor, config) {
    ctx.save();

    if (config.showSafeGuides !== false && marginPx > 0) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(marginPx, marginPx, w - marginPx * 2, h - marginPx * 2);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('SAFE AREA', marginPx + 4, marginPx + 11);
    }

    if (config.showTrimGuides !== false) {
      ctx.strokeStyle = 'rgba(200, 109, 81, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(1, 1, w - 2, h - 2);
    }

    if (config.showBleedGuides && dims.bleedPx > 0) {
      const bPx = Math.round(dims.bleedPx * scaleFactor);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(bPx, bPx, w - bPx * 2, h - bPx * 2);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(0, 0, w, bPx);
      ctx.fillRect(0, h - bPx, w, bPx);
      ctx.fillRect(0, bPx, bPx, h - bPx * 2);
      ctx.fillRect(w - bPx, bPx, bPx, h - bPx * 2);
    }

    ctx.restore();
  }

  _loadImage(src) {
    return imageCache.load(src);
  }

  clearCache() {
    imageCache.clear();
  }
}
