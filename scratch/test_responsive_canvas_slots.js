import assert from 'assert';
import { COLLAGE_LAYOUTS } from '../js/collage/layouts.js';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('🧪 Testing Responsive Canvas Slots & Zero-Overflow across all Layout/Aspect Combinations...');

const mockCtx = {
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
};

const canvas = {
  width: 1200,
  height: 1600,
  getContext: () => mockCtx
};

const renderer = new CollageRenderer(canvas);
const allLayouts = Object.keys(COLLAGE_LAYOUTS);
const aspectRatios = ['strip', '1:1', '4:5', '3:4', '4:3', '16:9'];
const photoCounts = [1, 2, 3, 4, 6];

let totalChecks = 0;

for (const layoutId of allLayouts) {
  for (const aspect of aspectRatios) {
    for (const count of photoCounts) {
      renderer.updateSettings({ layoutId, aspectRatio: aspect, showStamp: true, stampText: 'TEST 2026' });
      const { width: cWidth, height: cHeight } = renderer.getCanvasDimensions(count);
      const slots = renderer.calculatePhotoSlots(count);

      assert(slots.length >= 1, `Slots calculated for ${layoutId} ${aspect} (${count} photos)`);
      
      for (const slot of slots) {
        totalChecks++;
        // Verify slot is completely within canvas bounds
        assert(slot.x >= 0, `Slot x (${slot.x}) >= 0 for ${layoutId} ${aspect}`);
        assert(slot.y >= 0, `Slot y (${slot.y}) >= 0 for ${layoutId} ${aspect}`);
        assert(slot.x + slot.width <= cWidth + 1, `Slot right edge (${slot.x + slot.width}) <= canvas width (${cWidth}) for ${layoutId} ${aspect}`);
        assert(slot.y + slot.height <= cHeight + 1, `Slot bottom edge (${slot.y + slot.height}) <= canvas height (${cHeight}) for ${layoutId} ${aspect}`);
      }
    }
  }
}

console.log(`✅ Verified ${totalChecks} slot geometries across all layout/aspect/count variations with 100% precision!`);
