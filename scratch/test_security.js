/**
 * Comprehensive Automated Test Suite for Feature #26: Security & Abuse Prevention
 */

import { SECURITY_LIMITS } from '../js/security/securityLimits.js';
import { sanitizeText, sanitizeFilename, sanitizeColor, safeDeepClone, safeAssign } from '../js/security/sanitizer.js';
import { InputValidator } from '../js/security/inputValidator.js';
import { SecurityManager, securityManager } from '../js/security/securityManager.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('--- 1. Testing Input & File Validation (inputValidator.js) ---');
  {
    // File size & format checks
    const fakeOversizedBlob = new Blob([new Uint8Array(16 * 1024 * 1024)], { type: 'image/jpeg' });
    const resOver = InputValidator.validateFile(fakeOversizedBlob, { maxSize: 15 * 1024 * 1024 });
    assert(!resOver.valid && resOver.error.includes('too large'), 'Oversized file rejected');

    const fakeValidBlob = new Blob(['sample data'], { type: 'image/png' });
    const resValid = InputValidator.validateFile(fakeValidBlob);
    assert(resValid.valid === true, 'Valid PNG file accepted');

    const fakeExeBlob = new Blob(['MZ...'], { type: 'application/x-msdownload' });
    const resExe = InputValidator.validateFile(fakeExeBlob);
    assert(!resExe.valid && resExe.error.includes('Unsupported'), 'Executable MIME type rejected');

    const emptyBlob = new Blob([], { type: 'image/png' });
    const resEmpty = InputValidator.validateFile(emptyBlob);
    assert(!resEmpty.valid && resEmpty.error.includes('empty'), 'Empty (0 byte) file rejected');
  }

  console.log('\n--- 2. Testing Image Bomb & Dimension Protection ---');
  {
    const resNormal = InputValidator.validateImageDimensions(1920, 1080);
    assert(resNormal.valid === true, 'Normal 1080p image allowed');

    const resHugeDim = InputValidator.validateImageDimensions(12000, 100);
    assert(!resHugeDim.valid && resHugeDim.error.includes('maximum allowable'), 'Image with width > 8192px rejected');

    const resBomb = InputValidator.validateImageDimensions(8000, 8000); // 64 MP > 36 MP limit
    assert(!resBomb.valid && resBomb.error.includes('too many pixels'), 'Decompression/Image bomb (64MP) rejected');

    const resInvalid = InputValidator.validateImageDimensions(-50, NaN);
    assert(!resInvalid.valid, 'NaN / negative dimensions rejected');
  }

  console.log('\n--- 3. Testing URL Validation & Protocol Allowlisting ---');
  {
    const jsUrl = InputValidator.validateUrl('javascript:alert("XSS")');
    assert(!jsUrl.valid && jsUrl.error.includes('protocol'), 'javascript: URL strictly blocked');

    const dataHtmlUrl = InputValidator.validateUrl('data:text/html,<script>alert(1)</script>');
    assert(!dataHtmlUrl.valid && dataHtmlUrl.error.includes('protocol'), 'data:text/html URL strictly blocked');

    const fileUrl = InputValidator.validateUrl('file:///etc/passwd');
    assert(!fileUrl.valid, 'file: protocol URL strictly blocked');

    const httpsUrl = InputValidator.validateUrl('https://example.com/cute-stamp.png');
    assert(httpsUrl.valid === true, 'https: URL allowed');

    const longUrl = InputValidator.validateUrl('https://example.com/' + 'a'.repeat(3000));
    assert(!longUrl.valid && longUrl.error.includes('exceeds maximum'), 'Oversized URL length rejected');
  }

  console.log('\n--- 4. Testing Sanitization (sanitizer.js) ---');
  {
    // Text sanitization
    const dirtyText = '<b onmouseover=alert(1)>Hello</b> <script>steal()</script>World\x00\x1F';
    const cleanText = sanitizeText(dirtyText);
    assert(!cleanText.includes('<script>') && !cleanText.includes('onmouseover'), 'Scripts and event handlers stripped');
    assert(cleanText.includes('Hello') && cleanText.includes('World'), 'Text content preserved');

    // Filename sanitization
    const dirtyFilename = '../../../etc/passwd.png';
    const safeFilename = sanitizeFilename(dirtyFilename);
    assert(!safeFilename.includes('..') && !safeFilename.includes('/'), 'Path traversal stripped from filename');

    const winReserved = sanitizeFilename('CON.png');
    assert(!winReserved.startsWith('CON'), 'Windows reserved filename CON sanitized safely');

    // CSS Color sanitization
    const validHex = sanitizeColor('#FAF6EE');
    assert(validHex === '#faf6ee', 'Valid hex color sanitized');

    const validRgb = sanitizeColor('rgba(200, 109, 81, 0.5)');
    assert(validRgb === 'rgba(200, 109, 81, 0.5)', 'Valid RGBA color sanitized');

    const maliciousCss = sanitizeColor('url(javascript:alert(1))', '#FAF6EE');
    assert(maliciousCss === '#FAF6EE', 'Malicious CSS expression sanitized to safe fallback');
  }

  console.log('\n--- 5. Testing Prototype Pollution Defense ---');
  {
    const pollutedPayload = JSON.parse('{"__proto__": {"isAdmin": true}, "title": "Safe"}');
    const cloned = safeDeepClone(pollutedPayload);
    assert(cloned.__proto__ === Object.prototype, '__proto__ key stripped by safeDeepClone');
    assert(({}).isAdmin === undefined, 'Global Object.prototype is NOT polluted');

    const target = {};
    safeAssign(target, { constructor: { prototype: { hacked: true } }, safeKey: 123 });
    assert(({}).hacked === undefined, 'safeAssign blocks prototype pollution');
    assert(target.safeKey === 123, 'safeAssign copies legitimate properties');
  }

  console.log('\n--- 6. Testing Numeric Constraint Validation ---');
  {
    const num = InputValidator.validateNumber('50', { min: 0, max: 100, fallback: 10 });
    assert(num === 50, 'Valid numeric string parsed');

    const over = InputValidator.validateNumber(999999, { min: 0, max: 100, fallback: 10 });
    assert(over === 100, 'Clamped to max limit');

    const nanNum = InputValidator.validateNumber(NaN, { min: 0, max: 100, fallback: 25 });
    assert(nanNum === 25, 'NaN falls back safely');

    const infNum = InputValidator.validateNumber(Infinity, { min: 0, max: 100, fallback: 25 });
    assert(infNum === 25, 'Non-finite Infinity falls back safely');
  }

  console.log('\n--- 7. Testing Concurrency Guards & Security Manager ---');
  {
    const manager = new SecurityManager();
    
    // Guarded operation
    let ran = false;
    await manager.runGuardedTask('testExport', async () => {
      ran = true;
    });
    assert(ran === true, 'Guarded task executed successfully');

    // Test rejection of duplicate concurrent task
    let caughtDuplicate = false;
    manager._activeGuardedTasks.add('busyTask');
    try {
      await manager.runGuardedTask('busyTask', async () => {});
    } catch (e) {
      caughtDuplicate = true;
    }
    assert(caughtDuplicate === true, 'Concurrent execution of same task guarded and prevented');
    manager._activeGuardedTasks.delete('busyTask');
  }

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================`);
  if (failed > 0) process.exit(1);
}

runTests();
