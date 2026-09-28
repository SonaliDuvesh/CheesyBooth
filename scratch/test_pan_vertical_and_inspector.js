import assert from 'assert';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('🧪 Testing Pan Vertical (Y), Pan Horizontal (X), and Slot Inspector controls...');

let drawnCalls = [];
const mockCtx = {
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  clip: () => {},
  rect: () => {},
  roundRect: () => {},
  translate: (tx, ty) => {
    drawnCalls.push({ action: 'translate', tx, ty });
  },
  scale: (sx, sy) => {
    drawnCalls.push({ action: 'scale', sx, sy });
  },
  rotate: (rad) => {
    drawnCalls.push({ action: 'rotate', rad });
  },
  drawImage: (img, dx, dy, dw, dh) => {
    drawnCalls.push({ action: 'drawImage', dx, dy, dw, dh });
  },
  stroke: () => {}
};

const canvas = {
  width: 1200,
  height: 1600,
  getContext: () => mockCtx
};

const renderer = new CollageRenderer(canvas);
const mockPhoto = { imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' };
const mockSlot = { x: 50, y: 50, width: 400, height: 400, shape: 'rounded' };

// Mock _loadImage
renderer._loadImage = async () => ({ width: 800, height: 600 });

// 1. Test vertical panning when zoom is 1.0 (with -31% as in user's request)
drawnCalls = [];
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, { zoom: 1.0, panX: 10, panY: -31 }, mockCtx);

const translateCall = drawnCalls.find(c => c.action === 'translate');
assert(translateCall, 'Translate was called');
console.log('Translate coordinates:', translateCall);

// Center is 50 + 200 = 250
// PanX = 10% -> positive shift
assert(translateCall.tx > 250, 'Horizontal pan shifts right for +10%');
// PanY = -31% -> negative shift
assert(translateCall.ty < 250, 'Vertical pan shifts up for -31%');

// 2. Test rotation & flip
drawnCalls = [];
await renderer._drawPhotoToSlot(mockPhoto, mockSlot, { zoom: 1.2, panX: 0, panY: 0, rotation: 90, flipH: true }, mockCtx);
const rotateCall = drawnCalls.find(c => c.action === 'rotate');
const scaleCall = drawnCalls.find(c => c.action === 'scale');
assert(rotateCall && Math.abs(rotateCall.rad - (90 * Math.PI / 180)) < 0.001, 'Rotation applied at 90 deg');
assert(scaleCall && scaleCall.sx === -1, 'Flip H applied');

console.log('✅ Pan Vertical (Y) and inspector controls verified successfully!');
