// Automated Test Suite for Feature #11 (Keyboard Accessibility)
import { keyboardManager } from '../js/accessibility/keyboardManager.js';
import fs from 'fs';
import path from 'path';

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

console.log('=== 1. Testing KeyboardManager Core API ===');
assert(keyboardManager !== undefined, 'KeyboardManager instance is defined');
assert(typeof keyboardManager.on === 'function', 'Action registration method on() exists');
assert(typeof keyboardManager.announce === 'function', 'Screen reader live announcement method exists');
assert(typeof keyboardManager.isTyping === 'function', 'Input context detector isTyping() exists');
assert(typeof keyboardManager.openModal === 'function', 'Modal focus trap openModal() exists');
assert(typeof keyboardManager.closeModal === 'function', 'Modal focus restore closeModal() exists');

console.log('\n=== 2. Testing Keyboard Handler Registration ===');
let spaceTriggered = false;
keyboardManager.on('space', () => { spaceTriggered = true; });
assert(keyboardManager.handlers.has('space'), 'space action registered successfully');

keyboardManager.handlers.get('space')();
assert(spaceTriggered === true, 'Registered handler executes on dispatch');

const testActions = ['help', 'undo', 'redo', 'escape', 'rotate', 'duplicate', 'delete', 'layer', 'stickerNudge'];
testActions.forEach(act => {
  keyboardManager.on(act, () => {});
  assert(keyboardManager.handlers.has(act), `Action "${act}" registered successfully`);
});

console.log('\n=== 3. Testing index.html Accessibility Markup ===');
const htmlContent = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
assert(htmlContent.includes('class="skip-link"'), 'Skip navigation link exists in index.html');
assert(htmlContent.includes('id="mainContent"'), 'Main content landmark (#mainContent) exists');
assert(htmlContent.includes('id="a11yAnnouncer"'), 'Screen reader announcer (#a11yAnnouncer) exists with aria-live');
assert(htmlContent.includes('id="keyboardHelpModal"'), 'Keyboard shortcuts cheat sheet modal exists');
assert(htmlContent.includes('id="btnKeyboardHelp"'), 'Header shortcut help button exists');
assert(htmlContent.includes('href="css/accessibility.css"'), 'accessibility.css stylesheet is linked');

console.log('\n=== 4. Testing accessibility.css Rules ===');
const cssContent = fs.readFileSync(path.resolve('./css/accessibility.css'), 'utf-8');
assert(cssContent.includes('.skip-link'), 'Skip link styles defined');
assert(cssContent.includes(':focus-visible'), 'High-contrast tactile :focus-visible rules defined');
assert(cssContent.includes('.kbd-badge'), 'Keyboard badge (.kbd-badge) styles defined');
assert(cssContent.includes('.sr-only'), 'Screen reader only utility defined');

console.log(`\n========================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
