import assert from 'assert';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('🧪 Testing Custom Date & Footer Stamp rendering...');

let filledText = [];
const mockCtx = {
  save: () => {},
  restore: () => {},
  measureText: (txt) => ({ width: txt.length * 14 }),
  fillText: (text, x, y) => {
    filledText.push({ text, x, y, fillStyle: mockCtx.fillStyle, textAlign: mockCtx.textAlign, font: mockCtx.font });
  }
};

const canvas = {
  width: 1200,
  height: 1600,
  getContext: () => mockCtx
};

const renderer = new CollageRenderer(canvas);

// 1. Light frame with auto contrast
filledText = [];
renderer.updateSettings({
  frameColor: '#FAF6EE',
  showStamp: true,
  stampText: 'CHEESYBOOTH · 2026',
  textColor: 'auto',
  textAlign: 'center',
  padding: 16
});
renderer._drawStampFooter(1200, 1600, mockCtx);
assert(filledText.length > 0, 'Footer text was drawn');
assert.strictEqual(filledText[0].text, 'CHEESYBOOTH · 2026', 'Text content matches');
assert.strictEqual(filledText[0].fillStyle, '#292724', 'Light background gives dark charcoal text');
assert.strictEqual(filledText[0].textAlign, 'center', 'Center alignment applied');
assert(filledText[0].y > 1400 && filledText[0].y < 1580, 'Footer text placed in bottom footer zone');

// 2. Dark noir frame with auto contrast
filledText = [];
renderer.updateSettings({
  frameColor: '#292724',
  textColor: 'auto',
  textAlign: 'left'
});
renderer._drawStampFooter(1200, 1600, mockCtx);
assert.strictEqual(filledText[0].fillStyle, '#FAF6EE', 'Dark noir frame gives warm ivory contrast text');
assert.strictEqual(filledText[0].textAlign, 'left', 'Left alignment applied');
assert(filledText[0].x < 100, 'Left alignment positions near left margin');

// 3. Right alignment
filledText = [];
renderer.updateSettings({
  textAlign: 'right'
});
renderer._drawStampFooter(1200, 1600, mockCtx);
assert.strictEqual(filledText[0].textAlign, 'right', 'Right alignment applied');
assert(filledText[0].x > 1100, 'Right alignment positions near right margin');

console.log('✅ Custom Date & Footer Stamp verified successfully!');
