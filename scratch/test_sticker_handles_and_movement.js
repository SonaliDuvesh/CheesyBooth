const fs = require('fs');
const assert = require('assert');

console.log('Testing Sticker Free Positioning & Ergonomic Handles...');

// 1. Check CSS styling for circular handles and no oval distortion
const collageCss = fs.readFileSync('css/collage.css', 'utf8');

assert(collageCss.includes('width: 26px !important;'), 'Handle width should be explicitly set with high specificity');
assert(collageCss.includes('aspect-ratio: 1 / 1 !important;'), 'Handle aspect-ratio must be 1/1 to prevent oval stretching');
assert(collageCss.includes('border-radius: 50% !important;'), 'Handle border-radius must be 50% for circular shape');
assert(collageCss.includes('top: -36px;'), 'Rotate handle must be positioned with a top stem offset');
assert(collageCss.includes('bottom: -13px;'), 'Resize handle must be located at bottom corner to avoid overlapping delete button');
assert(collageCss.includes('top: -13px;'), 'Delete button must be located at top-right corner');

// 2. Check JS app logic for independent free dragging and explicit bounding box
const appJs = fs.readFileSync('js/app.js', 'utf8');
assert(appJs.includes('node.style.width = `${boxW}px`'), 'Sticker node must have explicit width bounding box');
assert(appJs.includes('node.style.height = `${boxH}px`'), 'Sticker node must have explicit height bounding box');
assert(appJs.includes('Math.max(-0.05, Math.min(1.05, startStickerX + deltaX))'), 'Stickers must support full free positioning across canvas');
assert(appJs.includes("e.target.closest('.sticker-rotate-btn')"), 'Free drag must isolate rotate handle');

// 3. Check collageRenderer position boundaries
const rendererJs = fs.readFileSync('js/collage/collageRenderer.js', 'utf8');
assert(rendererJs.includes('Math.max(-0.05, Math.min(1.05, xPercent))'), 'Renderer must allow free positioning');

console.log('✅ All sticker movement, handle geometry, and circular styling tests passed successfully!');
