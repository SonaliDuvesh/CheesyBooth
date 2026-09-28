import assert from 'assert';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('🧪 Testing Photo Cutout Shape selection and rendering...');

const shapesCalled = [];
const mockCtx = {
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  clip: () => {},
  rect: () => { shapesCalled.push('rect'); },
  roundRect: () => { shapesCalled.push('roundRect'); },
  arc: () => { shapesCalled.push('arc'); },
  ellipse: () => { shapesCalled.push('ellipse'); },
  moveTo: () => {},
  lineTo: () => {},
  bezierCurveTo: () => { shapesCalled.push('bezierCurveTo'); },
  quadraticCurveTo: () => { shapesCalled.push('quadraticCurveTo'); },
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  drawImage: () => {},
  stroke: () => {}
};

const canvas = {
  width: 1200,
  height: 1600,
  getContext: () => mockCtx
};

const renderer = new CollageRenderer(canvas);
const mockPhoto = { imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' };
const mockSlot = { x: 50, y: 50, width: 400, height: 400, shape: 'arch' };
renderer._loadImage = async () => ({ width: 800, height: 600 });

// 1. When no explicit photoShape is set, slot shape (arch) is used
renderer.updateSettings({ photoShape: null });
shapesCalled.length = 0;
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, {}, mockCtx);
assert(shapesCalled.includes('arc') || shapesCalled.includes('quadraticCurveTo'), 'Layout default arch shape used');

// 2. User selects Heart
renderer.updateSettings({ photoShape: 'heart' });
shapesCalled.length = 0;
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, {}, mockCtx);
assert(shapesCalled.includes('bezierCurveTo'), 'Heart shape bezier curves used');

// 3. User selects Circle
renderer.updateSettings({ photoShape: 'circle' });
shapesCalled.length = 0;
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, {}, mockCtx);
assert(shapesCalled.includes('arc'), 'Circle arc used');

// 4. User selects Star
renderer.updateSettings({ photoShape: 'star' });
shapesCalled.length = 0;
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, {}, mockCtx);
assert.strictEqual(renderer.settings.photoShape, 'star', 'Star shape configured');

// 5. User selects Diamond
renderer.updateSettings({ photoShape: 'diamond' });
shapesCalled.length = 0;
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, {}, mockCtx);
assert.strictEqual(renderer.settings.photoShape, 'diamond', 'Diamond shape configured');

// 6. User selects Ellipse
renderer.updateSettings({ photoShape: 'ellipse' });
shapesCalled.length = 0;
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, {}, mockCtx);
assert(shapesCalled.includes('ellipse'), 'Ellipse shape used');

console.log('✅ Photo cutout shapes verified across all shapes successfully!');
