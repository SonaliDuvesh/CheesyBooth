import assert from 'assert';
import { COLLAGE_LAYOUTS, getLayoutsByCategory } from '../js/collage/layouts.js';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('🧪 Testing all Layout Architectures and Shape Cutout Synchronization...');

const canvas = {
  width: 1200,
  height: 1600,
  getContext: () => ({
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    rect: () => {},
    roundRect: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    ellipse: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    clip: () => {},
    drawImage: () => {},
    fillRect: () => {},
    fillText: () => {},
    stroke: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    measureText: () => ({ width: 100 })
  })
};

const renderer = new CollageRenderer(canvas);
const allLayoutIds = Object.keys(COLLAGE_LAYOUTS);

console.log(`Found ${allLayoutIds.length} layouts to test.`);

allLayoutIds.forEach((layoutId) => {
  const layout = COLLAGE_LAYOUTS[layoutId];
  assert(layout, `Layout ${layoutId} exists`);
  assert(typeof layout.calculateSlots === 'function', `Layout ${layoutId} has calculateSlots function`);

  // Test slot calculation for 1, 2, 4, and 8 photos
  [1, 2, 4, 8].forEach((count) => {
    const slots = layout.calculateSlots(1200, 1600, count, 16, 24);
    assert(Array.isArray(slots), `Slots returned as array for ${layoutId} with ${count} photos`);
    assert(slots.length >= 1, `At least 1 slot calculated for ${layoutId}`);

    slots.forEach((slot, idx) => {
      assert(typeof slot.x === 'number' && !isNaN(slot.x), `Slot ${idx} has valid x`);
      assert(typeof slot.y === 'number' && !isNaN(slot.y), `Slot ${idx} has valid y`);
      assert(typeof slot.width === 'number' && slot.width > 0, `Slot ${idx} has valid width`);
      assert(typeof slot.height === 'number' && slot.height > 0, `Slot ${idx} has valid height`);
    });
  });

  // Test renderer integration
  renderer.updateSettings({ layoutId });
  const computedSlots = renderer.calculatePhotoSlots(4);
  assert(computedSlots.length > 0, `Renderer computed slots for ${layoutId}`);
});

// Test Shape Layout Cutouts Priority
const shapeLayouts = [
  { id: 'circles-strip', expectedShape: 'circle' },
  { id: 'heart-mosaic', expectedShape: 'heart' },
  { id: 'star-quad', expectedShape: 'star' },
  { id: 'oval-portrait', expectedShape: 'ellipse' },
  { id: 'arch-gallery', expectedShape: 'arch' },
];

shapeLayouts.forEach(({ id, expectedShape }) => {
  renderer.updateSettings({ layoutId: id, photoShape: 'rounded' });
  const slots = renderer.calculatePhotoSlots(4);
  assert.strictEqual(slots[0].shape, expectedShape, `${id} slot has signature shape ${expectedShape}`);
});

console.log('✅ All layout architectures verified and functioning smoothly!');
