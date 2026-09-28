/**
 * Unit Test Suite for Feature #13: Privacy & Data Security
 */
import assert from 'node:assert/strict';

// Mock browser globals for Node.js test environment
globalThis.window = {
  addEventListener: () => {},
};
globalThis.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          translate: () => {},
          scale: () => {},
          drawImage: () => {},
          fillRect: () => {},
          beginPath: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {},
          roundRect: () => {},
          fillText: () => {},
          createLinearGradient: () => ({ addColorStop: () => {} }),
        }),
        toDataURL: () => 'data:image/jpeg;base64,mockJpegData',
        captureStream: () => ({
          getTracks: () => [{ stop: () => {} }],
        }),
      };
    }
    return {};
  },
};

globalThis.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (i) => Object.keys(store)[i] || null,
    get length() { return Object.keys(store).length; },
  };
})();

const NativeURL = globalThis.URL;
const createdObjectUrls = new Set();

class MockURL extends NativeURL {
  static createObjectURL(blob) {
    const url = `blob:http://localhost/${Math.random().toString(36).slice(2)}`;
    createdObjectUrls.add(url);
    return url;
  }
  static revokeObjectURL(url) {
    createdObjectUrls.delete(url);
  }
}
MockURL._created = createdObjectUrls;
globalThis.URL = MockURL;

globalThis.performance = { now: () => Date.now() };

// Import our modules
import { CameraManager } from '../js/camera/cameraManager.js';
import { StorageManager } from '../js/storage/storageManager.js';
import { PrivacyManager, FILE_LIMITS } from '../js/privacy/privacyManager.js';
import { PreferenceManager } from '../js/preferences/preferenceManager.js';

async function runTests() {
  console.log('🧪 Starting Feature #13 (Privacy) Test Suite...\n');
  let passed = 0;

  function it(desc, fn) {
    try {
      fn();
      console.log(`  ✓ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${desc}`);
      console.error(err);
      process.exit(1);
    }
  }

  async function itAsync(desc, fn) {
    try {
      await fn();
      console.log(`  ✓ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${desc}`);
      console.error(err);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------
  // 1. Camera Manager & Stream Lifecycle Tests
  // -------------------------------------------------------------
  console.log('--- 1. Camera Manager & Lifecycle ---');

  it('CameraManager initializes in prompt state with zero active streams', () => {
    const fakeVideo = { srcObject: null, play: async () => {}, classList: { add: () => {}, remove: () => {} } };
    const cm = new CameraManager(fakeVideo);
    assert.equal(cm.isCameraActive, false);
    assert.equal(cm.hasPermission, false);
    assert.equal(cm.permissionState, 'prompt');
    assert.equal(cm.stream, null);
  });

  it('CameraManager stops media tracks and sets srcObject to null on stopCamera', () => {
    const fakeVideo = { srcObject: null, play: async () => {}, classList: { add: () => {}, remove: () => {} } };
    const cm = new CameraManager(fakeVideo);
    let trackStopped = false;
    cm.stream = {
      getTracks: () => [{ stop: () => { trackStopped = true; } }],
    };
    fakeVideo.srcObject = cm.stream;
    cm.isCameraActive = true;

    cm.stopCamera();
    assert.equal(trackStopped, true);
    assert.equal(cm.stream, null);
    assert.equal(fakeVideo.srcObject, null);
    assert.equal(cm.isCameraActive, false);
  });

  it('CameraManager pauseCamera releases stream and sets isPaused flag', () => {
    const fakeVideo = { srcObject: null, play: async () => {}, classList: { add: () => {}, remove: () => {} } };
    const cm = new CameraManager(fakeVideo);
    let trackStopped = false;
    cm.stream = {
      getTracks: () => [{ stop: () => { trackStopped = true; } }],
    };
    cm.isCameraActive = true;

    cm.pauseCamera();
    assert.equal(cm.isPaused, true);
    assert.equal(trackStopped, true);
    assert.equal(cm.isCameraActive, false);
  });

  it('CameraManager startDemoMode activates simulated mode with clear state', () => {
    const fakeVideo = { srcObject: null, play: async () => {}, classList: { add: () => {}, remove: () => {} } };
    const cm = new CameraManager(fakeVideo);
    let reportedStatus = null;
    cm.onStatusChange = (statusObj) => { reportedStatus = statusObj; };

    cm.startDemoMode();
    assert.equal(cm.isSimulated, true);
    assert.equal(cm.isCameraActive, true);
    assert.equal(cm.permissionState, 'simulated');
    assert.equal(reportedStatus?.status, 'simulated');
    cm.stopCamera();
  });

  // -------------------------------------------------------------
  // 2. Storage Manager & Granular Deletion Tests
  // -------------------------------------------------------------
  console.log('\n--- 2. Storage Manager & Object URL Lifecycle ---');

  await itAsync('StorageManager saves and loads photo sessions safely', async () => {
    const sm = new StorageManager();
    const photos = [
      { id: 'p1', imageData: 'data:image/jpeg;base64,abc1', timestamp: 100 },
      { id: 'p2', imageData: 'data:image/jpeg;base64,abc2', timestamp: 200 },
    ];
    await sm.saveSession('test_session_1', photos);
    const loaded = await sm.getSession('test_session_1');
    assert.equal(loaded.length, 2);
    assert.equal(loaded[0].id, 'p1');
  });

  await itAsync('StorageManager granularly clears only sessions without affecting collages', async () => {
    const sm = new StorageManager();
    await sm.saveSession('s1', [{ id: 'photo1' }]);
    await sm.saveCollage('c1', { title: 'My Collage' });

    let breakdown = await sm.getStorageBreakdown();
    assert.equal(breakdown.sessionCount, 1);
    assert.equal(breakdown.collageCount, 1);

    await sm.clearAllSessions();
    breakdown = await sm.getStorageBreakdown();
    assert.equal(breakdown.sessionCount, 0);
    assert.equal(breakdown.collageCount, 1); // Collages preserved!
  });

  await itAsync('StorageManager granularly clears collages without affecting sessions', async () => {
    const sm = new StorageManager();
    await sm.saveSession('s2', [{ id: 'photo2' }]);
    await sm.saveCollage('c2', { title: 'Another Collage' });

    await sm.clearAllCollages();
    const breakdown = await sm.getStorageBreakdown();
    assert.equal(breakdown.sessionCount, 1); // Sessions preserved!
    assert.equal(breakdown.collageCount, 0);
  });

  it('StorageManager manages object URL creation, tracking, and clean revocation', () => {
    const sm = new StorageManager();
    const mockBlob = {};
    const url1 = sm.createManagedObjectURL(mockBlob);
    const url2 = sm.createManagedObjectURL(mockBlob);

    assert.equal(sm._managedObjectURLs.has(url1), true);
    assert.equal(sm._managedObjectURLs.has(url2), true);

    sm.revokeManagedObjectURL(url1);
    assert.equal(sm._managedObjectURLs.has(url1), false);
    assert.equal(sm._managedObjectURLs.has(url2), true);

    sm.revokeAllObjectURLs();
    assert.equal(sm._managedObjectURLs.size, 0);
  });

  await itAsync('StorageManager clearAllSayCheeseData executes complete wipe across DB & storage', async () => {
    const sm = new StorageManager();
    await sm.saveSession('s3', [{ id: 'p3' }]);
    await sm.saveCollage('c3', { title: 'Print' });
    localStorage.setItem('say_cheese_custom_key', 'test_val');
    localStorage.setItem('unrelated_app_key', 'keep_me');

    await sm.clearAllSayCheeseData();

    const breakdown = await sm.getStorageBreakdown();
    assert.equal(breakdown.sessionCount, 0);
    assert.equal(breakdown.collageCount, 0);
    assert.equal(localStorage.getItem('say_cheese_custom_key'), null);
    assert.equal(localStorage.getItem('unrelated_app_key'), 'keep_me');
  });

  // -------------------------------------------------------------
  // 3. Privacy Manager & File Validation Tests
  // -------------------------------------------------------------
  console.log('\n--- 3. Privacy Manager & Validation ---');

  const pm = new PrivacyManager();

  it('PrivacyManager validates file extensions and rejects invalid formats', async () => {
    const invalidFile = { name: 'malware.exe', type: 'application/x-msdownload', size: 1024 };
    const res = await pm.validateImageFile(invalidFile);
    assert.equal(res.valid, false);
    assert.match(res.error, /Unsupported file type/);
  });

  it('PrivacyManager rejects oversized files exceeding maximum limits', async () => {
    const hugeFile = {
      name: 'large_photo.jpg',
      type: 'image/jpeg',
      size: FILE_LIMITS.MAX_IMAGE_SIZE_BYTES + 1024,
    };
    const res = await pm.validateImageFile(hugeFile);
    assert.equal(res.valid, false);
    assert.match(res.error, /too large/);
  });

  it('PrivacyManager validates remote URLs rejecting non-HTTP/HTTPS protocols', () => {
    const dangerousUrl = 'javascript:alert(1)';
    const res = pm.validateRemoteUrl(dangerousUrl);
    assert.equal(res.valid, false);

    const validUrl = 'https://example.com/cute-stamp.png';
    const validRes = pm.validateRemoteUrl(validUrl);
    assert.equal(validRes.valid, true);
    assert.equal(validRes.cleanUrl, 'https://example.com/cute-stamp.png');
  });

  it('PrivacyManager sanitizes user-entered strings against HTML injection', () => {
    const malicious = '<script>alert("xss")</script> & "quotes"';
    const clean = pm.sanitizeText(malicious);
    assert.equal(clean, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;quotes&quot;');
  });

  // -------------------------------------------------------------
  // 4. Preference Manager Import/Export Safety
  // -------------------------------------------------------------
  console.log('\n--- 4. Preferences Import/Export Safety ---');

  it('PreferenceManager exports sanitized JSON and imports valid configurations', () => {
    const prefMgr = new PreferenceManager();
    prefMgr.set('profile.displayName', 'Sonali');
    prefMgr.set('defaults.photoCount', 6);

    const json = prefMgr.exportJSON();
    assert.match(json, /"displayName": "Sonali"/);
    assert.match(json, /"photoCount": 6/);

    const freshMgr = new PreferenceManager();
    const imported = freshMgr.importJSON(json);
    assert.equal(imported, true);
    assert.equal(freshMgr.get('profile.displayName'), 'Sonali');
    assert.equal(freshMgr.get('defaults.photoCount'), 6);
  });

  it('PreferenceManager rejects malformed or malicious imported JSON payloads', () => {
    const prefMgr = new PreferenceManager();
    assert.equal(prefMgr.importJSON('not valid json {{{{'), false);
    assert.equal(prefMgr.importJSON('null'), false);
  });

  console.log(`\n🎉 All ${passed} Feature #13 Privacy tests passed successfully!\n`);
}

runTests();
