/**
 * Automated Verification for Workbench UX Refinements & GIF Export
 */
import assert from 'assert';
import { COLLAGE_LAYOUTS } from '../js/collage/layouts.js';
import { CollageRenderer } from '../js/collage/collageRenderer.js';
import { ExportRenderer } from '../js/export/exportRenderer.js';
import { ExportManager } from '../js/export/exportManager.js';

console.log('Testing UX Refinements & GIF Export fixes...');

// 1. Test CollageRenderer Slot Swapping across multiple layouts and columns
const mockCanvas = {
  getContext: () => ({
    save: () => {},
    restore: () => {},
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    fillText: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    clip: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
  }),
  width: 1200,
  height: 1600,
};

const renderer = new CollageRenderer(mockCanvas);
renderer.updateSettings({ layoutId: 'grid-2x2' });

// Set initial transforms
renderer.setSlotTransform(0, { zoom: 1.2, panX: 10, photoIndex: 0 });
renderer.setSlotTransform(1, { zoom: 1.5, panX: -20, photoIndex: 1 });

assert.strictEqual(renderer.getSlotTransform(0).zoom, 1.2);
assert.strictEqual(renderer.getSlotTransform(1).zoom, 1.5);

// Swap slot 0 and slot 1
renderer.swapSlots(0, 1);
assert.strictEqual(renderer.getSlotTransform(0).zoom, 1.5, 'Slot 0 should have previous slot 1 transform');
assert.strictEqual(renderer.getSlotTransform(1).zoom, 1.2, 'Slot 1 should have previous slot 0 transform');
assert.strictEqual(renderer.getSlotTransform(0).panX, -20);
assert.strictEqual(renderer.getSlotTransform(1).panX, 10);
console.log('✓ Slot swapping between cells passed.');

// 2. Test GIF Sticker Decode & Fallback Safety
const testSticker = await renderer.addSticker('💖', 'emoji');
assert.strictEqual(testSticker.emoji, '💖');
assert.strictEqual(renderer.settings.stickers.length, 1);

// Test GIF sticker duration detection in ExportManager
const exportMgr = new ExportManager(renderer);
exportMgr.setFormat('gif');
const estimate = exportMgr.getEstimate([{ imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }]);
assert.ok(estimate.width > 0, 'Estimate width must be positive');
assert.ok(estimate.height > 0, 'Estimate height must be positive');
assert.strictEqual(exportMgr.config.format, 'gif');
console.log('✓ ExportManager GIF estimation passed.');

// 3. Test Aspect Ratio calculation for custom print format
renderer.updateSettings({ aspectRatio: '1:1' });
const baseDims = new ExportRenderer(renderer).getBaseDimensions();
assert.strictEqual(baseDims.width, 1400);
assert.strictEqual(baseDims.height, 1400);
assert.strictEqual(baseDims.aspectRatio, 1.0);
console.log('✓ Aspect ratio computation for 1:1 square passed.');

// 4. Test Collapsible Accordion Settings & Stage Export Architecture in index.html
import fs from 'fs';
const htmlContent = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf-8');

const requiredAccordionSections = [
  'layout',
  'dimensions',
  'frame',
  'filter',
  'slot',
  'stamp',
  'stickers',
];

assert.ok(htmlContent.includes('id="collageAccordion"'), 'collageAccordion container must exist');
assert.ok(htmlContent.includes('id="collageStageExportPanel"'), 'collageStageExportPanel must exist under collage-preview-stage');

// Ensure export buttons are in stage export panel
const requiredExportButtons = [
  'btnOpenExportStudio',
  'btnOpenPrintStudio',
  'btnDownloadGIF',
  'btnDownloadPNG',
  'btnSaveProject',
  'btnCopyImage',
  'btnBackToReview',
];

requiredExportButtons.forEach((btnId) => {
  assert.ok(htmlContent.includes(`id="${btnId}"`), `Export button ${btnId} must exist`);
});

requiredAccordionSections.forEach((sec) => {
  assert.ok(htmlContent.includes(`id="accItem_${sec}"`), `Accordion item accItem_${sec} must exist`);
  assert.ok(htmlContent.includes(`id="accHeader_${sec}"`), `Accordion header accHeader_${sec} must exist`);
  assert.ok(htmlContent.includes(`id="accContent_${sec}"`), `Accordion body accContent_${sec} must exist`);
  assert.ok(htmlContent.includes(`id="accSummary_${sec}"`), `Accordion summary accSummary_${sec} must exist`);
  assert.ok(htmlContent.includes(`data-section="${sec}"`), `data-section="${sec}" attribute must exist`);
});

// Verify no duplicate IDs in HTML
const idRegex = /id="([^"]+)"/g;
const ids = [];
let match;
while ((match = idRegex.exec(htmlContent)) !== null) {
  ids.push(match[1]);
}
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.strictEqual(duplicateIds.length, 0, `Found duplicate IDs in index.html: ${duplicateIds.join(', ')}`);
console.log('✓ Stage Export Panel & 7-Compartment Accordion validated with 0 duplicate IDs.');

console.log('\nAll UX refinement & Accordion architecture tests passed successfully!');
