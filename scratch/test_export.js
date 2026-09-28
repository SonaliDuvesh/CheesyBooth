import assert from 'node:assert';
import {
  EXPORT_FORMATS,
  RESOLUTION_PRESETS,
  EXPORT_PRESETS,
  ExportCapabilityDetector,
} from '../js/export/exportFormats.js';
import { DownloadManager } from '../js/export/downloadManager.js';
import { ExportRenderer } from '../js/export/exportRenderer.js';
import { ExportManager } from '../js/export/exportManager.js';

console.log('🧪 Starting Test Suite: Feature #15 Advanced Export Options...');

// Mock LocalStorage & Canvas
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

class MockCollageRenderer {
  constructor() {
    this.settings = {
      layoutId: 'vertical-strip',
      aspectRatio: 'strip',
      frameColor: '#FAF6EE',
      frameStyle: 'clean',
      paperTexture: 'subtle',
      spacing: 16,
      padding: 24,
      borderRadius: 8,
      stampText: 'SAY CHEESE · 2026',
      showStamp: true,
      filter: 'warm-vintage',
      filterIntensity: 80,
      stickers: [],
      slotTransforms: {},
    };
  }

  async render(photos, timeOffset, targetCanvas) {
    if (targetCanvas) {
      targetCanvas.renderedWith = {
        photoCount: photos.length,
        timeOffset,
        frameColor: this.settings.frameColor,
      };
    }
  }
}

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
    }
  }

  // 1. Export Formats & Capability Detection
  console.log('\n--- Test Group 1: Formats & Capabilities ---');

  test('All primary static and animated export formats are configured', () => {
    assert(EXPORT_FORMATS.PNG, 'PNG format should be defined');
    assert(EXPORT_FORMATS.JPEG, 'JPEG format should be defined');
    assert(EXPORT_FORMATS.WEBP, 'WebP format should be defined');
    assert(EXPORT_FORMATS.GIF, 'GIF format should be defined');
    assert(EXPORT_FORMATS.WEBM, 'WebM format should be defined');
    assert(EXPORT_FORMATS.MP4, 'MP4 format should be defined');

    assert.strictEqual(EXPORT_FORMATS.PNG.supportsTransparency, true, 'PNG should support transparency');
    assert.strictEqual(EXPORT_FORMATS.JPEG.supportsTransparency, false, 'JPEG should not support transparency');
    assert.strictEqual(EXPORT_FORMATS.JPEG.supportsQuality, true, 'JPEG should support quality slider');
  });

  test('ExportCapabilityDetector correctly reports supported formats', () => {
    const supported = ExportCapabilityDetector.getSupportedFormats();
    assert(Array.isArray(supported), 'Supported formats should be an array');
    assert(supported.some(f => f.id === 'png'), 'PNG should always be supported');
    assert(supported.some(f => f.id === 'jpeg'), 'JPEG should always be supported');
  });

  // 2. Resolution Presets & Size Estimation
  console.log('\n--- Test Group 2: Resolution & Size Estimation ---');

  test('Resolution presets define correct scaling factors', () => {
    const standard = RESOLUTION_PRESETS.find(p => p.id === 'standard');
    const original = RESOLUTION_PRESETS.find(p => p.id === 'original');
    const high = RESOLUTION_PRESETS.find(p => p.id === 'high');
    const ultra = RESOLUTION_PRESETS.find(p => p.id === 'ultra');

    assert.strictEqual(standard.scale, 0.75);
    assert.strictEqual(original.scale, 1.0);
    assert.strictEqual(high.scale, 1.5);
    assert.strictEqual(ultra.scale, 2.0);
  });

  test('estimateFileSizeMB produces valid proportional file size estimates', () => {
    const sizeSmall = ExportCapabilityDetector.estimateFileSizeMB(800, 1000, 'jpeg', 0.6);
    const sizeLarge = ExportCapabilityDetector.estimateFileSizeMB(3000, 4000, 'jpeg', 0.95);
    const sizePNG = ExportCapabilityDetector.estimateFileSizeMB(1500, 2000, 'png', 1.0);
    const sizeGIF = ExportCapabilityDetector.estimateFileSizeMB(600, 800, 'gif', 0.8, true, 12);

    assert(sizeSmall > 0 && sizeSmall < sizeLarge, 'Small JPEG should be significantly smaller than large JPEG');
    assert(sizePNG > 0, 'PNG estimate should be positive');
    assert(sizeGIF > 0, 'GIF estimate should be positive');
  });

  // 3. Filename Sanitization & Download Manager
  console.log('\n--- Test Group 3: Download Manager & Filename Sanitization ---');

  test('sanitizeFilename removes illegal characters and handles custom extensions', () => {
    const dirty = 'My/Awesome:Photobooth*Strip? "2026"|<Test>';
    const clean = DownloadManager.sanitizeFilename(dirty, 'pocket-booth', '.png');
    assert(!/[/\\:*?"<>|]/.test(clean), 'Filename must not contain illegal characters');
    assert(clean.endsWith('.png'), 'Filename must end with .png');

    const withDuplicateExt = 'birthday-strip.jpg';
    const cleanExt = DownloadManager.sanitizeFilename(withDuplicateExt, 'pocket-booth', '.jpg');
    assert.strictEqual(cleanExt, 'birthday-strip.jpg', 'Should avoid duplicate extension like .jpg.jpg');

    const empty = '';
    const cleanEmpty = DownloadManager.sanitizeFilename(empty, 'pocket-booth', '.webp');
    assert(cleanEmpty.startsWith('pocket-booth-'), 'Empty name should fallback to default prefix with timestamp');
    assert(cleanEmpty.endsWith('.webp'), 'Empty name should append extension');
  });

  // 4. Export Renderer Dimensions & Scaling
  console.log('\n--- Test Group 4: Export Renderer Geometry ---');

  test('ExportRenderer calculates layout-aware base dimensions and target scale', () => {
    const mockCollage = new MockCollageRenderer();
    const renderer = new ExportRenderer(mockCollage);

    mockCollage.settings.layoutId = 'vertical-strip';
    mockCollage.settings.aspectRatio = 'strip';
    const baseStrip = renderer.getBaseDimensions();
    assert.strictEqual(baseStrip.width, 700);
    assert.strictEqual(baseStrip.height, 2200);

    const dimsHigh = renderer.computeExportDimensions({ scale: 1.5 });
    assert.strictEqual(dimsHigh.width, 1050);
    assert.strictEqual(dimsHigh.height, 3300);

    const dimsCustom = renderer.computeExportDimensions({ width: 2000, height: 3000 });
    assert.strictEqual(dimsCustom.width, 2000);
    assert.strictEqual(dimsCustom.height, 3000);

    // Test extreme bounding safeguard
    const dimsClamped = renderer.computeExportDimensions({ width: 50000, height: 50 });
    assert.strictEqual(dimsClamped.width, 8000, 'Max dimension must be clamped to 8000px');
    assert.strictEqual(dimsClamped.height, 100, 'Min dimension must be clamped to 100px');
  });

  // 5. Central Export Manager State, Presets, and Lifecycle
  console.log('\n--- Test Group 5: Export Coordinator Lifecycle ---');

  test('ExportManager applies one-click presets accurately', () => {
    const mockCollage = new MockCollageRenderer();
    const manager = new ExportManager(mockCollage);

    manager.applyPreset('quick_share');
    assert.strictEqual(manager.config.resolutionPreset, 'standard');
    assert.strictEqual(manager.config.scale, 0.75);

    manager.applyPreset('print_ready');
    assert.strictEqual(manager.config.format, 'png');
    assert.strictEqual(manager.config.resolutionPreset, 'ultra');
    assert.strictEqual(manager.config.scale, 2.0);
  });

  test('ExportManager generates accurate live estimate and memory alerts', () => {
    const mockCollage = new MockCollageRenderer();
    const manager = new ExportManager(mockCollage);

    const photos = [{ imageData: 'data:image/jpeg;base64,1' }, { imageData: 'data:image/jpeg;base64,2' }];
    manager.setFormat('png');
    manager.setResolutionPreset('high');

    const estimate = manager.getEstimate(photos);
    assert.strictEqual(estimate.width, 1050);
    assert.strictEqual(estimate.height, 3300);
    assert(estimate.estimatedSizeMB > 0);
    assert.strictEqual(estimate.isHighMemory, false);

    // Test high memory alert trigger (>16 Megapixels)
    manager.setCustomResolution(5000, 5000); // 25 Megapixels
    const highMemEstimate = manager.getEstimate(photos);
    assert.strictEqual(highMemEstimate.isHighMemory, true, 'Should trigger high memory warning for >16MP');
  });

  test('ExportManager cancellation token resets state properly', () => {
    const mockCollage = new MockCollageRenderer();
    const manager = new ExportManager(mockCollage);

    let reportedState = null;
    manager.subscribe((snapshot) => {
      reportedState = snapshot.state;
    });

    manager._setStage('rendering', 45, 'Rendering photo collage layers...');
    assert.strictEqual(manager.state.isExporting, true);
    assert.strictEqual(manager.state.progress, 45);

    manager.cancelExport();
    assert.strictEqual(manager.state.isExporting, false);
    assert.strictEqual(manager.state.stage, 'cancelled');
    assert(reportedState !== null);
  });

  test('ExportManager persists and restores user export settings in localStorage', () => {
    const mockCollage = new MockCollageRenderer();
    const manager1 = new ExportManager(mockCollage);

    manager1.setFormat('jpeg');
    manager1.setResolutionPreset('ultra');
    manager1.setQuality(0.82);

    const manager2 = new ExportManager(mockCollage);
    assert.strictEqual(manager2.config.format, 'jpeg');
    assert.strictEqual(manager2.config.resolutionPreset, 'ultra');
    assert.strictEqual(manager2.config.quality, 0.82);
  });

  console.log(`\n========================================`);
  console.log(`🎉 Feature #15 Tests Complete: ${passed}/${total} passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
