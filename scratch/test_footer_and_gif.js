import assert from 'assert';
import { GIFDecoder } from '../js/export/gifDecoder.js';
import { CollageRenderer } from '../js/collage/collageRenderer.js';

console.log('Testing GIF Decoder & Custom Date/Footer System...');

// 1. Test GIF Decoder with synthetic minimal 2-frame GIF
function createSample2FrameGIF() {
  // Minimal valid GIF89a with 2 frames
  // Header + LSD + GCT (2 colors: Black, White)
  const header = [
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
    0x02, 0x00, 0x02, 0x00,             // 2x2 px
    0x80, 0x00, 0x00,                   // GCT flag, 2 colors
    0x00, 0x00, 0x00,                   // Color 0: Black
    0xFF, 0xFF, 0xFF,                   // Color 1: White
  ];

  // Frame 1 Graphic Control Extension + Image Descriptor + LZW data
  const frame1 = [
    0x21, 0xF9, 0x04, 0x00, 0x0A, 0x00, 0x00, 0x00, // delay 100ms
    0x2C, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00, // 2x2 at (0,0)
    0x02, // LZW min code size 2
    0x02, 0x4C, 0x01, 0x00, // sub-block
  ];

  // Frame 2 Graphic Control Extension + Image Descriptor + LZW data
  const frame2 = [
    0x21, 0xF9, 0x04, 0x00, 0x0A, 0x00, 0x00, 0x00, // delay 100ms
    0x2C, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x02, 0x00, 0x00, // 2x2 at (0,0)
    0x02, // LZW min code size 2
    0x02, 0x4C, 0x01, 0x00, // sub-block
  ];

  const trailer = [0x3B]; // GIF trailer

  const allBytes = new Uint8Array([...header, ...frame1, ...frame2, ...trailer]);
  return allBytes;
}

// In node test environment, mock document.createElement('canvas')
globalThis.document = globalThis.document || {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 100,
        height: 100,
        getContext: () => ({
          createImageData: (w, h) => ({ data: new Uint8Array(w * h * 4) }),
          putImageData: () => {},
          drawImage: () => {},
          clearRect: () => {},
          measureText: () => ({ width: 50 }),
          save: () => {},
          restore: () => {},
          fillText: () => {},
          scale: () => {},
          translate: () => {},
          rotate: () => {},
        }),
      };
    }
    return {};
  },
};

const gifBytes = createSample2FrameGIF();
const frames = await GIFDecoder.decodeGIF(gifBytes);
console.log(`✅ Decoded GIF frames count: ${frames.length}`);
assert(Array.isArray(frames), 'Decoded frames should be an array');
assert(frames.length >= 1, 'Should decode at least 1 frame');

// 2. Test CollageRenderer Custom Date & Footer Settings
const canvasMock = document.createElement('canvas');
const renderer = new CollageRenderer(canvasMock);

// Default footer
assert(renderer.settings.showStamp === true, 'showStamp should default to true');
assert(renderer.settings.fontFamily === 'Space Grotesk', 'fontFamily should default to Space Grotesk');
assert(renderer.settings.textAlign === 'center', 'textAlign should default to center');

// Update footer text and properties
renderer.updateSettings({
  stampText: 'CHEESYBOOTH · 2026',
  textAlign: 'right',
  fontFamily: 'Playfair Display',
  textColor: '#C89D7C',
  showStamp: true,
});

assert.strictEqual(renderer.settings.stampText, 'CHEESYBOOTH · 2026');
assert.strictEqual(renderer.settings.textAlign, 'right');
assert.strictEqual(renderer.settings.fontFamily, 'Playfair Display');
assert.strictEqual(renderer.settings.textColor, '#C89D7C');

// Test Stamp Visibility Toggle
renderer.updateSettings({ showStamp: false });
assert.strictEqual(renderer.settings.showStamp, false);

console.log('✅ Custom Date & Footer Settings Verification Passed!');

// 3. Test GIF sticker animation detection
const sticker = await renderer.addSticker('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'gif');
assert(sticker !== null, 'Sticker should be created');
assert.strictEqual(renderer.hasAnimatedStickers(), true, 'hasAnimatedStickers should return true');

console.log('✅ ALL Custom Date/Footer and GIF Sticker Tests Passed! 🚀');
