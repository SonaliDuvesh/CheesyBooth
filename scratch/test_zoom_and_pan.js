// Mock global DOM environment for Node
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement(tag) {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          save() {},
          restore() {},
          translate() {},
          scale() {},
          beginPath() {},
          arc() {},
          fill() {},
          stroke() {},
          fillRect() {},
          fillText() {},
          drawImage() {},
          createLinearGradient: () => ({ addColorStop() {} }),
        }),
        toDataURL: () => 'data:image/jpeg;base64,mock',
      };
    },
  };
}

import { CameraManager } from '../js/camera/cameraManager.js';
import assert from 'assert';

console.log('🧪 Testing CameraManager Zoom and Pan Functionality...');

// Mock video element
const dummyStyle = {
  setProperty(k, v) { this[k] = v; },
  transform: '',
};
const dummyVideo = {
  style: dummyStyle,
  classList: {
    contains(c) { return this[c] || false; },
    add(c) { this[c] = true; },
    remove(c) { this[c] = false; },
    toggle(c, force) { this[c] = force; }
  },
  setAttribute() {},
  videoWidth: 1280,
  videoHeight: 720,
  closest() { return null; }
};

const cm = new CameraManager(dummyVideo);

// 1. Initial State
assert.strictEqual(cm.getZoom(), 1.0, 'Initial zoom should be 1.0');
const initialPan = cm.getPan();
assert.strictEqual(initialPan.panX, 0, 'Initial panX should be 0');
assert.strictEqual(initialPan.panY, 0, 'Initial panY should be 0');
console.log('✅ Initial state verified');

// 2. Zoom In & Out
cm.zoomIn(0.4);
assert.strictEqual(cm.getZoom(), 1.4, 'Zoom in should increase zoom level to 1.4');
cm.zoomOut(0.2);
assert.strictEqual(cm.getZoom(), 1.2, 'Zoom out should decrease zoom level to 1.2');
console.log('✅ Zoom in/out verified');

// 3. Pan Setting & Clamping
cm.setPan(0.5, -0.8);
const pan1 = cm.getPan();
assert.strictEqual(pan1.panX, 0.5, 'PanX should be 0.5');
assert.strictEqual(pan1.panY, -0.8, 'PanY should be -0.8');

// Exceeding bounds should be clamped to [-1, 1]
cm.setPan(2.5, -3.0);
const clampedPan = cm.getPan();
assert.strictEqual(clampedPan.panX, 1.0, 'PanX clamped to 1.0');
assert.strictEqual(clampedPan.panY, -1.0, 'PanY clamped to -1.0');
console.log('✅ Pan clamping verified');

// 4. Pixel Panning
cm.setZoom(2.0); // at 2.0x zoom, maxPxX for 600px width = 300px
cm.resetPan();
assert.strictEqual(cm.getPan().panX, 0, 'Reset pan restores panX to 0');
assert.strictEqual(cm.getPan().panY, 0, 'Reset pan restores panY to 0');

cm.panByPixels(150, 100, 600, 400);
const pannedPx = cm.getPan();
assert(Math.abs(pannedPx.panX - 0.5) < 0.01, `PanX should be ~0.5 after +150px drag, got ${pannedPx.panX}`);
assert(Math.abs(pannedPx.panY - 0.5) < 0.01, `PanY should be ~0.5 after +100px drag, got ${pannedPx.panY}`);
console.log('✅ Pixel panning verified');

// 5. Reset Pan on Zoom Reset
cm.setZoom(1.0);
assert.strictEqual(cm.getPan().panX, 0, 'Zoom 1.0 resets panX to 0');
assert.strictEqual(cm.getPan().panY, 0, 'Zoom 1.0 resets panY to 0');
console.log('✅ Zoom reset pan clearing verified');

// 6. Capture Frame in Simulation Mode with Zoom & Pan
cm.setZoom(2.0);
cm.setPan(0.5, 0.5);
const frame = cm.captureFrame();
assert(frame && frame.imageData, 'Capture frame produces image data');
assert.strictEqual(frame.width, 1280, 'Captured frame maintains resolution');
console.log('✅ Capture frame with zoom & pan verified');

console.log('\n🎉 ALL ZOOM & PAN TESTS PASSED SUCCESSFULLY!');
