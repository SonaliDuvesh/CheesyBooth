
import { EXPORT_FORMATS, RESOLUTION_PRESETS, EXPORT_PRESETS, ExportCapabilityDetector } from './exportFormats.js';
import { ExportRenderer } from './exportRenderer.js';
import { DownloadManager } from './downloadManager.js';
import { ShareManager } from './shareManager.js';
import { GIFEncoder } from './gifEncoder.js';
import { VideoExporter } from './videoExporter.js';
import { errorManager } from '../errors/errorManager.js';
import { ErrorCategory } from '../errors/errorTypes.js';

export class ExportManager {
  constructor(collageRenderer) {
    this.collageRenderer = collageRenderer;
    this.exportRenderer = new ExportRenderer(collageRenderer);

    this.config = {
      format: 'png', 
      resolutionPreset: 'high', 
      scale: 1.5,
      customWidth: 1800,
      customHeight: 2400,
      quality: 0.9,
      transparentBg: false,
      filename: '',
      batchMode: 'collage', 
      animatedFps: 10,
      animatedDuration: 2.5,
      useSaveFilePicker: false,
    };

    this.state = {
      isExporting: false,
      progress: 0,
      stage: 'idle', 
      stageMessage: '',
      lastExportedBlob: null,
      lastExportedFilename: '',
      error: null,
    };

    this._cancellationToken = null;
    this._listeners = new Set();
    this.restoreExportPreferences();
  }

  setFormat(formatId) {
    if (EXPORT_FORMATS[formatId.toUpperCase()] || formatId === 'jpeg' || formatId === 'png' || formatId === 'webp' || formatId === 'gif' || formatId === 'webm' || formatId === 'mp4') {
      this.config.format = formatId.toLowerCase();

      const fmt = this.getFormatDef(this.config.format);
      if (!fmt?.supportsTransparency) {
        this.config.transparentBg = false;
      }
      this._notify();
      this.saveExportPreferences();
    }
  }

  setResolutionPreset(presetId) {
    const preset = RESOLUTION_PRESETS.find(p => p.id === presetId);
    if (preset) {
      this.config.resolutionPreset = presetId;
      if (preset.scale !== null) {
        this.config.scale = preset.scale;
      }
      this._notify();
      this.saveExportPreferences();
    }
  }

  setCustomResolution(width, height) {
    this.config.resolutionPreset = 'custom';
    this.config.customWidth = Math.min(8000, Math.max(100, Math.round(width || 1200)));
    this.config.customHeight = Math.min(8000, Math.max(100, Math.round(height || 1600)));
    this.config.scale = null;
    this._notify();
    this.saveExportPreferences();
  }

  setQuality(qualityValue) {
    this.config.quality = Math.max(0.1, Math.min(1.0, parseFloat(qualityValue) || 0.85));
    this._notify();
    this.saveExportPreferences();
  }

  setTransparentBg(enabled) {
    const fmt = this.getFormatDef(this.config.format);
    this.config.transparentBg = fmt?.supportsTransparency ? !!enabled : false;
    this._notify();
  }

  setFilename(name) {
    this.config.filename = (name || '').trim();
    this._notify();
    this.saveExportPreferences();
  }

  setBatchMode(mode) {
    this.config.batchMode = mode === 'all_photos' ? 'all_photos' : 'collage';
    this._notify();
  }

  applyPreset(presetId) {
    const preset = EXPORT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    let targetFormat = preset.format;
    if (targetFormat === 'webp' && !ExportCapabilityDetector.isWebPSupported()) {
      targetFormat = preset.fallbackFormat || 'jpeg';
    }

    this.config.format = targetFormat;
    this.setResolutionPreset(preset.resolution);
    this.config.quality = preset.quality;
    this.config.transparentBg = preset.transparentBg;
    this._notify();
    this.saveExportPreferences();
  }

  getFormatDef(formatId = this.config.format) {
    return Object.values(EXPORT_FORMATS).find(f => f.id === formatId) || EXPORT_FORMATS.PNG;
  }

  getEstimate(photos) {
    const isCustom = this.config.resolutionPreset === 'custom';
    const dims = this.exportRenderer.computeExportDimensions({
      scale: isCustom ? null : this.config.scale,
      width: isCustom ? this.config.customWidth : null,
      height: isCustom ? this.config.customHeight : null,
    });

    const isAnimated = this.config.format === 'gif' || this.config.format === 'webm' || this.config.format === 'mp4';
    const frameCount = isAnimated ? Math.round(this.config.animatedFps * this.config.animatedDuration) : 1;

    const estimatedSizeMB = ExportCapabilityDetector.estimateFileSizeMB(
      dims.width,
      dims.height,
      this.config.format,
      this.config.quality,
      isAnimated,
      frameCount
    );

    const totalPixels = dims.width * dims.height;

    const isHighMemory = totalPixels > 16000000 || (isAnimated && totalPixels > 4000000);

    const fmt = this.getFormatDef();
    const cleanFilename = DownloadManager.sanitizeFilename(
      this.config.filename || this.collageRenderer.settings.stampText,
      'pocket-booth',
      fmt.extension
    );

    return {
      width: dims.width,
      height: dims.height,
      aspectRatio: dims.width / dims.height,
      estimatedSizeMB,
      isHighMemory,
      totalPixels,
      filename: cleanFilename,
      formatDef: fmt,
    };
  }

  async exportCollage(photos) {
    if (!photos || photos.length === 0) {
      throw new Error('No photos captured to export.');
    }

    if (this.state.isExporting) {
      throw new Error('An export operation is already in progress.');
    }

    const token = { isCancelled: false };
    this._cancellationToken = token;

    this._setStage('preparing', 5, 'Preparing render workspace...');

    try {
      const estimate = this.getEstimate(photos);
      let exportBlob = null;
      let mimeType = estimate.formatDef.mimeType;

      if (this.config.format === 'gif') {
        exportBlob = await this._exportAnimatedGIF(photos, estimate, token);
      } else if (this.config.format === 'webm' || this.config.format === 'mp4') {
        const videoRes = await this._exportVideoClip(photos, estimate, token);
        exportBlob = videoRes.blob;
        mimeType = videoRes.mimeType;
      } else {
        exportBlob = await this._exportStaticImage(photos, estimate, token);
      }

      if (token.isCancelled) {
        this._setStage('cancelled', 0, 'Export cancelled.');
        return null;
      }

      this._setStage('complete', 100, 'Export complete!');
      this.state.lastExportedBlob = exportBlob;
      this.state.lastExportedFilename = estimate.filename;

      return {
        blob: exportBlob,
        filename: estimate.filename,
        dimensions: { width: estimate.width, height: estimate.height },
        format: this.config.format,
        mimeType,
      };
    } catch (err) {
      if (token.isCancelled) {
        this._setStage('cancelled', 0, 'Export cancelled.');
        return null;
      }
      this._setStage('error', 0, err?.message || 'Export failed.');
      errorManager.handle(err, {
        operation: 'export_collage',
        category: ErrorCategory.EXPORT,
        context: {
          format: this.config.format,
          resolution: this.config.resolutionPreset,
        },
      });
      throw err;
    } finally {
      this._cancellationToken = null;
      this.state.isExporting = false;
    }
  }

  async _exportStaticImage(photos, estimate, token) {
    this._setStage('rendering', 25, 'Rendering photo collage layers...');
    if (token.isCancelled) return null;

    const canvas = await this.exportRenderer.renderExportCanvas(photos, {
      scale: this.config.resolutionPreset === 'custom' ? null : this.config.scale,
      width: this.config.resolutionPreset === 'custom' ? this.config.customWidth : null,
      height: this.config.resolutionPreset === 'custom' ? this.config.customHeight : null,
      transparentBg: this.config.transparentBg,
    });

    if (token.isCancelled || !canvas) return null;

    this._setStage('encoding', 70, `Encoding ${estimate.formatDef.name}...`);

    return new Promise((resolve, reject) => {
      try {
        const quality = estimate.formatDef.supportsQuality ? this.config.quality : 1.0;
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error(`Failed to generate ${this.config.format.toUpperCase()} image blob.`));
            return;
          }
          this._setStage('finalizing', 95, 'Finalizing output image...');
          resolve(blob);
        }, estimate.formatDef.mimeType, quality);
      } catch (err) {
        reject(err);
      }
    });
  }

  async _exportAnimatedGIF(photos, estimate, token) {
    this._setStage('rendering', 15, 'Preparing animated frames...');
    if (token.isCancelled) return null;

    const highResCanvas = document.createElement('canvas');
    await this.collageRenderer.render(photos, 0, highResCanvas);

    const realAspect = highResCanvas.height / (highResCanvas.width || 1);
    const gifWidth = Math.min(540, Math.max(240, Math.round(estimate.width || highResCanvas.width)));
    const gifHeight = Math.round(gifWidth * realAspect);

    let targetDuration = this.config.animatedDuration || 2.5;
    if (this.collageRenderer.settings.stickers && this.collageRenderer.settings.stickers.length > 0) {
      let maxStickerDuration = 0;
      let hasMultiFrameSticker = false;
      for (const s of this.collageRenderer.settings.stickers) {
        if (s.frames && s.frames.length > 1) {
          hasMultiFrameSticker = true;
          const dur = s.frames.reduce((sum, f) => sum + (f.delay || 100), 0) / 1000;
          if (dur > maxStickerDuration) maxStickerDuration = dur;
        }
      }
      if (hasMultiFrameSticker && maxStickerDuration > 0) {
        targetDuration = Math.min(5.0, Math.max(1.5, Math.round(maxStickerDuration * 10) / 10));
      }
    }

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = gifWidth;
    frameCanvas.height = gifHeight;
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.imageSmoothingEnabled = true;
    frameCtx.imageSmoothingQuality = 'high';

    const encoder = new GIFEncoder(gifWidth, gifHeight);
    encoder.setDelay(Math.round(1000 / this.config.animatedFps));

    const totalFrames = Math.max(6, Math.round(this.config.animatedFps * targetDuration));
    const timeStep = targetDuration / totalFrames;

    for (let i = 0; i < totalFrames; i++) {
      if (token.isCancelled) return null;

      const time = i * timeStep;
      this._setStage('encoding', 20 + Math.round((i / totalFrames) * 70), `Encoding animated frame ${i + 1}/${totalFrames}...`);

      await this.collageRenderer.render(photos, time, highResCanvas);
      frameCtx.clearRect(0, 0, gifWidth, gifHeight);
      frameCtx.drawImage(highResCanvas, 0, 0, gifWidth, gifHeight);

      encoder.addFrame(frameCtx);

      await new Promise(r => setTimeout(r, 0));
    }

    if (token.isCancelled) return null;
    this._setStage('finalizing', 95, 'Assembling GIF89a animation palette...');
    return encoder.finish();
  }

  async _exportVideoClip(photos, estimate, token) {
    this._setStage('rendering', 15, 'Starting high-fps video stream...');
    if (token.isCancelled) return null;

    const highResCanvas = document.createElement('canvas');
    await this.collageRenderer.render(photos, 0, highResCanvas);

    const durationMs = Math.round(this.config.animatedDuration * 1000);

    let animationFrameId = null;
    const startTime = Date.now();

    const animateStream = () => {
      if (token.isCancelled) return;
      const elapsed = (Date.now() - startTime) / 1000;
      this.collageRenderer.render(photos, elapsed, highResCanvas);
      animationFrameId = requestAnimationFrame(animateStream);
    };

    animationFrameId = requestAnimationFrame(animateStream);

    try {
      return await VideoExporter.exportVideo(highResCanvas, {
        durationMs,
        fps: 30,
        preferredFormat: this.config.format,
        cancellationToken: token,
        onProgress: (percent) => {
          this._setStage('encoding', 20 + Math.round(percent * 0.75), `Recording video stream (${percent}%)...`);
        },
      });
    } finally {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  }

  async download(photos) {
    const result = await this.exportCollage(photos);
    if (!result || !result.blob) return null;

    await DownloadManager.downloadBlob(result.blob, result.filename, {
      useSaveFilePicker: this.config.useSaveFilePicker,
      mimeType: result.mimeType,
    });
    return result;
  }

  async copyToClipboard(photos) {
    if (!ExportCapabilityDetector.isClipboardItemSupported()) {
      throw new Error('Image copying to clipboard is not supported in this browser. Use Download instead.');
    }

    const origFmt = this.config.format;
    try {
      this.config.format = 'png';
      const result = await this.exportCollage(photos);
      if (!result || !result.blob) return false;

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': result.blob }),
      ]);
      return true;
    } finally {
      this.config.format = origFmt;
    }
  }

  async share(photos) {
    const result = await this.exportCollage(photos);
    if (!result || !result.blob) return null;

    return await ShareManager.shareBlob(result.blob, result.filename, {
      title: 'CheesyBooth Photobooth Print',
      text: 'Check out my photobooth print created with CheesyBooth ✨',
    });
  }

  async exportBatchSinglePhotos(photos) {
    if (!photos || photos.length === 0) return [];
    const token = { isCancelled: false };
    this._cancellationToken = token;

    const results = [];
    const total = photos.length;
    this._setStage('preparing', 10, `Preparing to export ${total} photos...`);

    const dateStr = new Date().toISOString().slice(0, 10);
    const baseName = this.config.filename || 'pocket-booth-snap';

    for (let i = 0; i < total; i++) {
      if (token.isCancelled) break;

      this._setStage('rendering', 15 + Math.round((i / total) * 75), `Exporting photo ${i + 1} of ${total}...`);
      const canvas = await this.exportRenderer.renderSinglePhotoCanvas(photos[i], {
        scale: this.config.scale || 1.0,
      });

      if (!canvas) continue;

      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', this.config.quality || 0.9));
      const filename = DownloadManager.sanitizeFilename(`${baseName}-${dateStr}-${i + 1}`, 'snap', '.jpg');

      await DownloadManager.downloadBlob(blob, filename, { mimeType: 'image/jpeg' });
      results.push({ blob, filename });
      await new Promise(r => setTimeout(r, 150));
    }

    this._setStage('complete', 100, `Exported ${results.length} photos.`);
    this._cancellationToken = null;
    return results;
  }

  cancelExport() {
    if (this._cancellationToken) {
      this._cancellationToken.isCancelled = true;
    }
    this._setStage('cancelled', 0, 'Export cancelled.');
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _setStage(stage, progress, message = '') {
    this.state.stage = stage;
    this.state.progress = progress;
    this.state.stageMessage = message;
    this.state.isExporting = stage !== 'idle' && stage !== 'complete' && stage !== 'error' && stage !== 'cancelled';
    this._notify();
  }

  _notify() {
    const snapshot = {
      config: { ...this.config },
      state: { ...this.state },
    };
    this._listeners.forEach(fn => {
      try {
        fn(snapshot);
      } catch (e) {}
    });
  }

  saveExportPreferences() {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        format: this.config.format,
        resolutionPreset: this.config.resolutionPreset,
        quality: this.config.quality,
        transparentBg: this.config.transparentBg,
      };
      localStorage.setItem('say_cheese_export_prefs', JSON.stringify(data));
    } catch (e) {}
  }

  restoreExportPreferences() {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem('say_cheese_export_prefs');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed) {
        if (parsed.format) this.config.format = parsed.format;
        if (parsed.resolutionPreset) this.setResolutionPreset(parsed.resolutionPreset);
        if (parsed.quality !== undefined) this.config.quality = parsed.quality;
        if (parsed.transparentBg !== undefined) this.config.transparentBg = parsed.transparentBg;
      }
    } catch (e) {}
  }
}
