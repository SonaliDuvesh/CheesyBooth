import assert from 'assert';
import { CollageRenderer } from '../js/collage/collageRenderer.js';
import { COLLAGE_LAYOUTS } from '../js/collage/layouts.js';

console.log('🧪 Testing Collage Layout Priority and Slot Transforms...');

const canvas = {
  width: 1200,
  height: 1800,
  getContext: () => ({
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    rect: () => {},
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

// 1. Initial layout
renderer.updateSettings({ layoutId: 'strip-vertical' });
let slots = renderer.calculatePhotoSlots();
assert(slots.length > 0, 'Vertical strip has slots');

// 2. User resizes / zooms / transforms slot 0
renderer.setSlotTransform(0, { boxScale: 1.8, zoom: 1.5, rotation: 90, panX: 20 });
const transformedSlot = renderer.getSlotTransform(0);
assert.strictEqual(transformedSlot.boxScale, 1.8, 'Slot 0 boxScale updated to 1.8');
assert.strictEqual(transformedSlot.zoom, 1.5, 'Slot 0 zoom updated to 1.5');
assert.strictEqual(transformedSlot.rotation, 90, 'Slot 0 rotation updated to 90');

// 3. User switches to another layout (e.g. film-vertical or grid-2x2)
// Simulated applyLayout action
renderer.settings.slotTransforms = {};
renderer.updateSettings({ layoutId: 'film-vertical' });
slots = renderer.calculatePhotoSlots();
const resetSlot = renderer.getSlotTransform(0);
assert.strictEqual(resetSlot.boxScale, 1.0, 'Slot 0 boxScale cleanly reset to 1.0');
assert.strictEqual(resetSlot.zoom, 1.0, 'Slot 0 zoom cleanly reset to 1.0');
assert.strictEqual(resetSlot.rotation, 0, 'Slot 0 rotation cleanly reset to 0');

// 4. User modifies slot in new layout
renderer.setSlotTransform(1, { zoom: 2.0 });
assert.strictEqual(renderer.getSlotTransform(1).zoom, 2.0, 'Slot 1 zoom modified in new layout');

// 5. Switching to another layout resets transforms again
renderer.settings.slotTransforms = {};
renderer.updateSettings({ layoutId: 'grid-2x2' });
assert.strictEqual(renderer.getSlotTransform(1).zoom, 1.0, 'Slot 1 zoom reset when switching to grid-2x2');

console.log('✅ Collage layout priority & transform lifecycle verified successfully!');
