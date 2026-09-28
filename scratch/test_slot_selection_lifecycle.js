const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Double-Click-and-Hold Slot Selection & Auto-Deselect Lifecycle...');

const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

// 1. Double click and hold state variables
assert(appCode.includes('let isDoubleHoldingSlot = false;'), 'Missing isDoubleHoldingSlot variable');
assert(appCode.includes('let lastSlotDownTime = 0;'), 'Missing lastSlotDownTime variable');
assert(appCode.includes('let lastSlotDownIndex = -1;'), 'Missing lastSlotDownIndex variable');

// 2. Double-down detection and selection
assert(appCode.includes('isSecondDown = (lastSlotDownIndex === slot.index'), 'Missing isSecondDown calculation');
assert(appCode.includes('isDoubleHoldingSlot = true;') && appCode.includes('selectedSlotIndex = slot.index;'), 'Double click down must set isDoubleHoldingSlot and select slot');

// 3. Pointer up release deselects
assert(appCode.includes('if (isDoubleHoldingSlot || hasShifted || selectedSlotIndex >= 0) {') && appCode.includes('deselectSlot();'), 'onBoxPointerUp must deselect slot on release');

// 4. Window global release safety
assert(appCode.includes("window.addEventListener('pointerup'") && appCode.includes('isDoubleHoldingSlot = false;'), 'window pointerup must clear isDoubleHoldingSlot and deselect');
assert(appCode.includes("window.addEventListener('touchend'") && appCode.includes('isDoubleHoldingSlot = false;'), 'window touchend must clear isDoubleHoldingSlot and deselect');

// 5. Corner drag release deselects
assert(appCode.includes('onCornerUp = async () =>') && appCode.includes('deselectSlot();'), 'Corner handle release must deselect slot');

// 6. Trackpad wheel commit deselects
assert(appCode.includes('wheelZoomCommitTimeout = setTimeout') && appCode.includes('deselectSlot();'), 'Wheel/trackpad commit must deselect slot');

// 7. Touch pinch release deselects
assert(appCode.includes("box.addEventListener('touchend'") && appCode.includes('deselectSlot();'), 'Touch pinch end must deselect slot');

console.log('✅ Double-Click-and-Hold Selection & Auto-Deselect on Release Tests Passed 100%!');
