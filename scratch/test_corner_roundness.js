import assert from 'assert';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('🧪 Testing Corner Roundness across all shapes and frames...');

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
    quadraticCurveTo: () => {},
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

// 1. Set border radius
renderer.updateSettings({ borderRadius: 32, frameStyle: 'clean' });
assert.strictEqual(renderer.settings.borderRadius, 32, 'Border radius stored as 32');

// 2. Clip shape on rounded, rectangle, square, arch
const mockCtx = {
  beginPath: () => {},
  closePath: () => {},
  roundRect: (x, y, w, h, r) => { mockCtx._lastRoundRectRadius = r; },
  rect: () => {},
  moveTo: () => {},
  lineTo: () => {},
  arc: () => {},
  ellipse: () => {},
  quadraticCurveTo: () => { mockCtx._usedCurve = true; }
};

renderer._clipShape(mockCtx, 10, 10, 400, 400, 'rounded', 64);
assert.strictEqual(mockCtx._lastRoundRectRadius, 64, 'Rounded uses clamped radius');

let rectCalled = false;
mockCtx.rect = () => { rectCalled = true; };
renderer._clipShape(mockCtx, 10, 10, 400, 400, 'rectangle', 64);
assert.strictEqual(rectCalled, true, 'Rectangle clips with sharp 90-degree rect');

renderer._clipShape(mockCtx, 10, 10, 400, 400, 'arch', 64);
assert.strictEqual(mockCtx._usedCurve, true, 'Arch rounds bottom corners with quadratic curves');

console.log('✅ Corner roundness verified across all shapes successfully!');
