
import { PrintRenderer } from './printRenderer.js';
import { PRINT_PRESETS } from './printPresets.js';
import { PAPER_SIZE_PRESETS, DPI_OPTIONS, PAPER_COLORS, MARGIN_PRESETS, BLEED_PRESETS, BORDER_STYLES } from './printSettings.js';
import { DownloadManager } from '../export/downloadManager.js';
import { ShareManager } from '../export/shareManager.js';
import { ExportCapabilityDetector } from '../export/exportFormats.js';

export class PrintManager {
  constructor(exportRenderer, collageRenderer) {
    this.exportRenderer = exportRenderer;
    this.collageRenderer = collageRenderer;
    this.printRenderer = new PrintRenderer(exportRenderer, collageRenderer);

    this.config = {
      paperPreset: 'photo_4x6', 
      customWidth: 4.0,
      customHeight: 6.0,
      customUnit: 'in', 
      dpi: 300,
      orientation: 'portrait', 
      fitMode: 'fill', 
      marginMm: 6,
      bleedMm: 0,
      paperColor: '#FFFFFF',
      borderStyle: 'none', 
      layoutMode: 'single', 
      stripCount: 2,
      copies: 1,
      filename: '',
      showSafeGuides: true,
      showTrimGuides: true,
      showBleedGuides: false,
    };

    this.state = {
      isPreparing: false,
      isPrinting: false,
      error: null,
      lastPrintBlob: null,
      lastFilename: '',
    };

    this._listeners = new Set();
    this.restorePreferences();
  }

  setPaperPreset(presetId) {
    this.config.paperPreset = presetId;
    const preset = PAPER_SIZE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      if (preset.category === 'square') {
        this.config.orientation = 'square';
      } else if (preset.widthIn > preset.heightIn) {
        this.config.orientation = 'landscape';
      } else {
        this.config.orientation = 'portrait';
      }
    }
    this._notify();
    this.savePreferences();
  }

  setCustomDimensions(width, height, unit = 'in') {
    this.config.paperPreset = 'custom';
    this.config.customWidth = Math.max(0.5, Math.min(60, parseFloat(width) || 4));
    this.config.customHeight = Math.max(0.5, Math.min(60, parseFloat(height) || 6));
    this.config.customUnit = ['in', 'cm', 'mm'].includes(unit) ? unit : 'in';
    this._notify();
    this.savePreferences();
  }

  setDpi(dpiValue) {
    const dpi = parseInt(dpiValue, 10);
    if ([150, 300, 600].includes(dpi)) {
      this.config.dpi = dpi;
      this._notify();
      this.savePreferences();
    }
  }

  setOrientation(orientation) {
    if (['portrait', 'landscape', 'square'].includes(orientation)) {
      this.config.orientation = orientation;
      this._notify();
      this.savePreferences();
    }
  }

  setFitMode(mode) {
    if (['fill', 'fit', 'crop'].includes(mode)) {
      this.config.fitMode = mode;
      this._notify();
      this.savePreferences();
    }
  }

  setMarginMm(mm) {
    this.config.marginMm = Math.max(0, Math.min(50, parseFloat(mm) || 0));
    this._notify();
    this.savePreferences();
  }

  setBleedMm(mm) {
    this.config.bleedMm = Math.max(0, Math.min(25, parseFloat(mm) || 0));
    this._notify();
    this.savePreferences();
  }

  setPaperColor(colorHex) {
    this.config.paperColor = colorHex || '#FFFFFF';
    this._notify();
    this.savePreferences();
  }

  setBorderStyle(style) {
    if (['none', 'thin', 'classic', 'photobooth'].includes(style)) {
      this.config.borderStyle = style;
      this._notify();
      this.savePreferences();
    }
  }

  setLayoutMode(mode) {
    if (['single', 'multiple_strips', 'contact_sheet'].includes(mode)) {
      this.config.layoutMode = mode;
      this._notify();
      this.savePreferences();
    }
  }

  setCopies(count) {
    this.config.copies = Math.max(1, Math.min(20, parseInt(count, 10) || 1));
    this._notify();
  }

  setGuides({ showSafe, showTrim, showBleed }) {
    if (showSafe !== undefined) this.config.showSafeGuides = !!showSafe;
    if (showTrim !== undefined) this.config.showTrimGuides = !!showTrim;
    if (showBleed !== undefined) this.config.showBleedGuides = !!showBleed;
    this._notify();
  }

  applyPreset(presetId) {
    const preset = PRINT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.config.paperPreset = preset.paperPreset;
    this.config.dpi = preset.dpi;
    this.config.orientation = preset.orientation;
    this.config.fitMode = preset.fitMode;
    this.config.marginMm = preset.marginMm;
    this.config.bleedMm = preset.bleedMm;
    this.config.paperColor = preset.paperColor;
    this.config.borderStyle = preset.borderStyle;
    this.config.layoutMode = preset.layoutMode;
    if (preset.stripCount) this.config.stripCount = preset.stripCount;

    this._notify();
    this.savePreferences();
  }

  getEstimate(photos) {
    const dims = this.printRenderer.calculateDimensions(this.config);
    const quality = this.printRenderer.evaluateSourceQuality(photos, dims);

    const baseName = this.config.filename || this.collageRenderer.settings.stampText || 'say-cheese-print';
    const cleanFilename = DownloadManager.sanitizeFilename(
      `${baseName}-${dims.widthIn}x${dims.heightIn}in-${dims.dpi}dpi`,
      'say-cheese-print',
      '.png'
    );

    return {
      ...dims,
      ...quality,
      filename: cleanFilename,
    };
  }

  async generatePreviewCanvas(photos, previewMaxDim = 600) {
    return await this.printRenderer.renderPrintSheet(photos, this.config, {
      isPreview: true,
      previewMaxDim,
    });
  }

  async executeBrowserPrint(photos) {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      throw new Error('Direct printing is not supported in this browser environment.');
    }

    if (!photos || photos.length === 0) {
      throw new Error('No photos captured to print.');
    }

    this.state.isPrinting = true;
    this._notify();

    try {

      const printCanvas = await this.printRenderer.renderPrintSheet(photos, this.config, { isPreview: false });
      if (!printCanvas) throw new Error('Failed to generate print canvas.');

      let printContainer = document.getElementById('printDocumentContainer');
      if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'printDocumentContainer';
        document.body.appendChild(printContainer);
      }

      printContainer.innerHTML = '';

      const dataUrl = printCanvas.toDataURL('image/png', 1.0);
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Say Cheese Printable Sheet';
      img.className = 'print-rendered-sheet';
      printContainer.appendChild(img);

      const copies = this.config.copies || 1;
      for (let c = 1; c < copies; c++) {
        const copyImg = document.createElement('img');
        copyImg.src = dataUrl;
        copyImg.alt = 'Say Cheese Printable Sheet Copy';
        copyImg.className = 'print-rendered-sheet';
        printContainer.appendChild(copyImg);
      }

      await new Promise(r => setTimeout(r, 120)); 
      window.print();

      const cleanup = () => {
        if (printContainer) {
          printContainer.innerHTML = '';
        }
        this.state.isPrinting = false;
        this._notify();
        window.removeEventListener('afterprint', cleanup);
      };

      window.addEventListener('afterprint', cleanup);
      setTimeout(cleanup, 2500); 

      return { success: true };
    } catch (err) {
      this.state.isPrinting = false;
      this._notify();
      throw err;
    }
  }

  async savePrintFile(photos, { format = 'png', filename } = {}) {
    if (!photos || photos.length === 0) {
      throw new Error('No photos captured to save.');
    }

    const dims = this.printRenderer.calculateDimensions(this.config);
    const printCanvas = await this.printRenderer.renderPrintSheet(photos, this.config, { isPreview: false });
    if (!printCanvas) throw new Error('Failed to render print sheet canvas.');

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = format === 'jpeg' ? '.jpg' : '.png';

    const cleanFilename = DownloadManager.sanitizeFilename(
      filename || `${this.config.filename || 'say-cheese-print'}-${dims.widthIn}x${dims.heightIn}in-${dims.dpi}dpi`,
      'say-cheese-print',
      ext
    );

    const blob = await new Promise((resolve, reject) => {
      printCanvas.toBlob((b) => {
        if (!b) reject(new Error('Failed to encode print file Blob.'));
        else resolve(b);
      }, mimeType, 0.98);
    });

    await DownloadManager.downloadBlob(blob, cleanFilename, { mimeType });
    this.state.lastPrintBlob = blob;
    this.state.lastFilename = cleanFilename;

    return { blob, filename: cleanFilename, dimensions: dims };
  }

  async copyPrintImage(photos) {
    if (!ExportCapabilityDetector.isClipboardItemSupported()) {
      throw new Error('Image copying is not supported in this browser.');
    }

    const printCanvas = await this.printRenderer.renderPrintSheet(photos, this.config, { isPreview: false });
    if (!printCanvas) throw new Error('Failed to render print sheet canvas.');

    const blob = await new Promise(r => printCanvas.toBlob(r, 'image/png', 1.0));
    if (!blob) throw new Error('Failed to generate PNG blob for clipboard.');

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);

    return true;
  }

  async sharePrintSheet(photos) {
    const result = await this.savePrintFile(photos);
    if (!result || !result.blob) return null;

    return await ShareManager.shareBlob(result.blob, result.filename, {
      title: 'Say Cheese Photobooth Print Sheet',
      text: `Print-ready photobooth sheet (${this.config.customWidth || 4}×${this.config.customHeight || 6} in at ${this.config.dpi} DPI) ✨`,
    });
  }

  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  _notify() {
    const snapshot = {
      config: { ...this.config },
      state: { ...this.state },
    };
    this._listeners.forEach(fn => {
      try { fn(snapshot); } catch (e) {}
    });
  }

  savePreferences() {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        paperPreset: this.config.paperPreset,
        dpi: this.config.dpi,
        orientation: this.config.orientation,
        fitMode: this.config.fitMode,
        marginMm: this.config.marginMm,
        bleedMm: this.config.bleedMm,
        paperColor: this.config.paperColor,
        borderStyle: this.config.borderStyle,
        layoutMode: this.config.layoutMode,
      };
      localStorage.setItem('say_cheese_print_prefs', JSON.stringify(data));
    } catch (e) {}
  }

  restorePreferences() {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = localStorage.getItem('say_cheese_print_prefs');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed) {
        if (parsed.paperPreset) this.config.paperPreset = parsed.paperPreset;
        if (parsed.dpi) this.config.dpi = parsed.dpi;
        if (parsed.orientation) this.config.orientation = parsed.orientation;
        if (parsed.fitMode) this.config.fitMode = parsed.fitMode;
        if (parsed.marginMm !== undefined) this.config.marginMm = parsed.marginMm;
        if (parsed.bleedMm !== undefined) this.config.bleedMm = parsed.bleedMm;
        if (parsed.paperColor) this.config.paperColor = parsed.paperColor;
        if (parsed.borderStyle) this.config.borderStyle = parsed.borderStyle;
        if (parsed.layoutMode) this.config.layoutMode = parsed.layoutMode;
      }
    } catch (e) {}
  }
}
