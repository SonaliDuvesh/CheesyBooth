// Automated Test Suite for Feature #10 (Mobile Experience)
import { mobileManager } from '../js/mobile/mobileManager.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== 1. Testing MobileManager Initialization & Feature Detection ===');
assert(mobileManager !== undefined, 'MobileManager is initialized');
assert(typeof mobileManager.vibrate === 'function', 'Haptic vibrate function exists');
assert(typeof mobileManager.sharePhotoOrCollage === 'function', 'Native share helper exists');
assert(typeof mobileManager.canTriggerShutter === 'function', 'Shutter debounce validator exists');
assert(typeof mobileManager.attachSwipe === 'function', 'Swipe gesture recognizer exists');
assert(typeof mobileManager.createPinchRotateTracker === 'function', 'Pinch-rotate tracker exists');

console.log('\n=== 2. Testing Shutter Debounce (Double-Tap Prevention) ===');
const firstClick = mobileManager.canTriggerShutter(500);
assert(firstClick === true, 'First shutter tap is immediately allowed');

const rapidSecondClick = mobileManager.canTriggerShutter(500);
assert(rapidSecondClick === false, 'Rapid immediate second tap is prevented by debounce');

// Wait 550ms and verify shutter is enabled again
await new Promise(resolve => setTimeout(resolve, 550));
const allowedThirdClick = mobileManager.canTriggerShutter(500);
assert(allowedThirdClick === true, 'Shutter tap after cooldown interval is allowed');

console.log('\n=== 3. Testing Haptics Graceful Degradation ===');
let hapticsThrew = false;
try {
  mobileManager.hapticTap();
  mobileManager.hapticCountdownTick();
  mobileManager.hapticShutterSnap();
  mobileManager.hapticSuccess();
  mobileManager.hapticError();
} catch (e) {
  hapticsThrew = true;
}
assert(!hapticsThrew, 'Haptic helpers safely degrade on non-mobile/unsupported environments');

console.log('\n=== 4. Testing Native Share Graceful Fallback ===');
const shareRes = await mobileManager.sharePhotoOrCollage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
assert(shareRes.success === false && (shareRes.reason === 'unsupported' || shareRes.error !== undefined), 'Share correctly reports status on environments without navigator.share');

console.log(`\n========================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
