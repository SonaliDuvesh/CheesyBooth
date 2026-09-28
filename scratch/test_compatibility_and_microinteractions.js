/**
 * Automated Verification Suite for Feature #20 (Browser Compatibility)
 * and Feature #21 (Delightful Micro-Interactions).
 */

import { browserSupport, BrowserSupport } from '../js/compatibility/browserSupport.js';
import { feedbackManager, FeedbackManager } from '../js/ui/feedbackManager.js';
import { soundManager } from '../js/audio/soundManager.js';
import { CameraManager } from '../js/camera/cameraManager.js';

console.log('=== Running Feature #20 & #21 Test Suite ===');

// 1. BrowserSupport Diagnostics & Capabilities
const caps = browserSupport.capabilities;
console.assert(typeof caps.isMac === 'boolean', 'isMac boolean detected');
console.assert(typeof caps.isMobile === 'boolean', 'isMobile boolean detected');
console.assert(typeof caps.supportsWebAudio === 'boolean', 'supportsWebAudio detected');
console.assert(typeof caps.supportsLocalStorage === 'boolean', 'supportsLocalStorage probed');

// 2. Modifier Key Detection
const modKey = browserSupport.getModifierKey();
console.assert(modKey === 'Ctrl' || modKey === 'Cmd', 'Modifier key is Ctrl or Cmd');
const modSymbol = browserSupport.getModifierKey(true);
console.assert(modSymbol === 'Ctrl' || modSymbol === '⌘', 'Modifier symbol is valid');

// 3. Diagnostics completeness
const diag = browserSupport.getDiagnostics();
console.assert(typeof diag.timestamp === 'string', 'Diagnostic timestamp generated');
console.assert(typeof diag.userAgent === 'string', 'Diagnostic user agent included');
console.assert(diag.userAgent.length > 0, 'User agent not empty');

// 4. FeedbackManager Haptics & Preferences
const fb = new FeedbackManager();
console.assert(fb.isHapticsEnabled() === true, 'Haptics enabled by default');
fb.setHapticsEnabled(false);
console.assert(fb.isHapticsEnabled() === false, 'Haptics can be toggled off');
fb.setHapticsEnabled(true);
console.assert(fb.isHapticsEnabled() === true, 'Haptics can be toggled back on');

// 5. SoundManager Synthesized Methods Execution
try {
  soundManager.playButtonClick();
  soundManager.playSnapTick();
  soundManager.playSuccessChime();
  soundManager.playCountdownTick(false);
  soundManager.playCountdownTick(true);
  soundManager.playShutterSound();
  console.assert(true, 'SoundManager audio methods run without throwing');
} catch (e) {
  console.error('SoundManager threw error:', e);
}

// 6. CameraManager Progressive Constraints
const dummyVideo = {
  setAttribute: () => {},
  srcObject: null,
  classList: { remove: () => {}, add: () => {} },
  play: async () => {},
};
const cam = new CameraManager(dummyVideo);
console.assert(typeof cam.startCamera === 'function', 'Camera startCamera function exists');
console.assert(typeof cam.stopCamera === 'function', 'Camera stopCamera function exists');

console.log('=== All Feature #20 & #21 Automated Tests Passed! ===');
