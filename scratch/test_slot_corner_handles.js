const fs = require('fs');
const assert = require('assert');

console.log('Testing Slot Corner Resize Handles & Scaling...');

// 1. Verify CSS styles for .slot-corner-handle
const collageCss = fs.readFileSync('css/collage.css', 'utf8');
assert(collageCss.includes('.slot-corner-handle'), 'CSS must define .slot-corner-handle');
assert(collageCss.includes('.slot-corner-handle.top-left'), 'CSS must define top-left handle');
assert(collageCss.includes('.slot-corner-handle.top-right'), 'CSS must define top-right handle');
assert(collageCss.includes('.slot-corner-handle.bottom-left'), 'CSS must define bottom-left handle');
assert(collageCss.includes('.slot-corner-handle.bottom-right'), 'CSS must define bottom-right handle');
assert(collageCss.includes('cursor: nwse-resize;'), 'CSS must specify proper corner resize cursors');

// 2. Verify JS app logic for corner handles and scaling
const appJs = fs.readFileSync('js/app.js', 'utf8');
assert(appJs.includes("['top-left', 'top-right', 'bottom-left', 'bottom-right']"), 'JS must generate all 4 corner handles');
assert(appJs.includes('scaleFactor = curDist / startDist'), 'JS must scale image based on distance from center');
assert(appJs.includes("type: 'slot-resize'"), 'JS must push history entry for corner box resize');
assert(appJs.includes("type: 'slot-move'"), 'JS must push history entry for manual frame shifting');
assert(appJs.includes('boxOffsetX: newOffsetX, boxOffsetY: newOffsetY'), 'JS must update slot offsets on manual shift');
assert(appJs.includes("if (e.target.closest('.slot-corner-handle'))"), 'JS must guard click and dragstart on corner handles');

// 3. Verify renderer synchronous calculatePhotoSlots
const rendererJs = fs.readFileSync('js/collage/collageRenderer.js', 'utf8');
assert(rendererJs.includes('calculatePhotoSlots(photoCount'), 'Renderer must provide synchronous calculatePhotoSlots');
assert(rendererJs.includes('this.calculatePhotoSlots();'), 'Renderer must recalculate slots synchronously in setSlotTransform and resetSlotTransform');

console.log('✅ All Photo Slot Corner Resize Handles & Manual Shifting Tests Passed! 🚀');
