import assert from 'node:assert';
import { recoveryManager } from '../js/recovery/recoveryManager.js';
import { storageManager } from '../js/storage/storageManager.js';

console.log('🧪 Starting Test Suite: Feature #14 Data & Recovery...');

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
  }
  postMessage() {}
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

globalThis.BroadcastChannel = MockBroadcastChannel;

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
    }
  }

  // 1. Debounced Autosave & Immediate Checkpoints
  console.log('\n--- Test Group 1: Autosave & Checkpoints ---');

  await testAsync('scheduleAutosave schedules and executes a checkpoint', async () => {
    let notifiedStatus = null;
    const unsub = recoveryManager.subscribe((status) => {
      notifiedStatus = status;
    });

    const sessionData = {
      activeView: 'collage',
      photos: [
        { imageData: 'data:image/jpeg;base64,sample1', timestamp: Date.now() },
        { imageData: 'data:image/jpeg;base64,sample2', timestamp: Date.now() }
      ],
      settings: { layoutId: 'vertical-strip', filter: 'warm-vintage' },
      funMode: 'classic'
    };

    recoveryManager.scheduleAutosave(sessionData);
    assert.strictEqual(recoveryManager.isSaving, true, 'isSaving should be true immediately upon schedule');

    // Wait for debounce timeout
    await new Promise(r => setTimeout(r, 700));

    assert.strictEqual(recoveryManager.isSaving, false, 'isSaving should be false after save completes');
    assert(recoveryManager.lastSavedTimestamp > 0, 'lastSavedTimestamp should be updated');
    assert(notifiedStatus !== null, 'Subscriber should be notified of status change');
    unsub();
  });

  await testAsync('saveImmediateCheckpoint saves state immediately without debounce delay', async () => {
    const sessionData = {
      activeView: 'review',
      photos: [
        { imageData: 'data:image/jpeg;base64,photoA', timestamp: Date.now() }
      ],
      settings: { layoutId: 'grid-2x2', filter: 'mono-noir' },
      funMode: 'arcade'
    };

    const result = await recoveryManager.saveImmediateCheckpoint(sessionData);
    assert.strictEqual(result.saved, true, 'Immediate checkpoint should return saved: true');
    assert.strictEqual(result.source, 'active_session');

    // Check storageManager snapshot
    const savedSnapshot = await storageManager.getRecoverySnapshot();
    assert(savedSnapshot !== null, 'Snapshot should be saved to storageManager');
    assert.strictEqual(savedSnapshot.activeView, 'review');
    assert.strictEqual(savedSnapshot.photos.length, 1);
  });

  // 2. Interrupted Session Detection & Partial Recovery
  console.log('\n--- Test Group 2: Interrupted Session Detection & Recovery ---');

  await testAsync('detectInterruptedSession retrieves valid unexpired session', async () => {
    const interrupted = await recoveryManager.detectInterruptedSession();
    assert(interrupted !== null, 'Interrupted session should be detected');
    assert.strictEqual(interrupted.photos.length, 1);
    assert.strictEqual(interrupted.activeView, 'review');
    assert.strictEqual(interrupted.settings.layoutId, 'grid-2x2');
  });

  await testAsync('detectInterruptedSession ignores expired sessions (>24 hours)', async () => {
    const oldSnapshot = {
      id: 'active_recovery',
      timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
      updatedAt: Date.now() - (25 * 60 * 60 * 1000),
      activeView: 'collage',
      photos: [{ imageData: 'data:image/jpeg;base64,old' }]
    };
    await storageManager.saveRecoverySnapshot(oldSnapshot);

    const detected = await recoveryManager.detectInterruptedSession();
    assert.strictEqual(detected, null, 'Expired snapshot should be ignored and cleared');
  });

  await testAsync('detectInterruptedSession performs partial recovery on damaged photos', async () => {
    const partiallyDamagedSnapshot = {
      id: 'active_recovery',
      timestamp: Date.now(),
      updatedAt: Date.now(),
      activeView: 'collage',
      photos: [
        { imageData: 'data:image/jpeg;base64,valid1', timestamp: Date.now() },
        { imageData: 'corrupted-non-image-string', timestamp: Date.now() }, // Bad image data
        null, // Damaged element
        { imageData: 'data:image/png;base64,valid2', timestamp: Date.now() }
      ],
      settings: { layoutId: 'non-existent-layout-id', filter: 'invalid-filter' }
    };
    await storageManager.saveRecoverySnapshot(partiallyDamagedSnapshot);

    const recovered = await recoveryManager.detectInterruptedSession();
    assert(recovered !== null, 'Should recover valid photos');
    assert.strictEqual(recovered.photos.length, 2, 'Should salvage 2 valid photos');
    assert.strictEqual(recovered.settings.layoutId, 'vertical-strip', 'Should fallback invalid layout safely');
    assert.strictEqual(recovered.settings.filter, 'warm-vintage', 'Should fallback invalid filter safely');
  });

  await testAsync('clearInterruptedSession removes the snapshot', async () => {
    await recoveryManager.clearInterruptedSession();
    const detected = await recoveryManager.detectInterruptedSession();
    assert.strictEqual(detected, null, 'Session should be cleared');
  });

  // 3. Saved Projects CRUD & Duplication
  console.log('\n--- Test Group 3: Saved Projects Management ---');

  let testProjectId = null;

  await testAsync('saveProject creates a new saved project', async () => {
    const projectData = {
      name: 'Summer Festival 2026',
      photos: [
        { imageData: 'data:image/jpeg;base64,fest1', timestamp: Date.now() },
        { imageData: 'data:image/jpeg;base64,fest2', timestamp: Date.now() }
      ],
      settings: {
        layoutId: 'film-vertical',
        aspectRatio: '3:4',
        frameColor: '#ffeedd',
        stickers: [{ id: 's1', emoji: '✨', xRatio: 0.5, yRatio: 0.5 }]
      },
      funMode: 'duo'
    };

    const saved = await recoveryManager.saveProject(projectData);
    assert(saved.id, 'Project should have an ID');
    assert.strictEqual(saved.name, 'Summer Festival 2026');
    assert.strictEqual(saved.photos.length, 2);
    testProjectId = saved.id;
  });

  await testAsync('getProject and getAllProjects retrieve saved projects', async () => {
    const proj = await recoveryManager.getProject(testProjectId);
    assert(proj !== null, 'Should retrieve project by ID');
    assert.strictEqual(proj.name, 'Summer Festival 2026');

    const all = await recoveryManager.getAllProjects();
    assert(Array.isArray(all), 'Projects should be an array');
    assert(all.length >= 1, 'Should have at least 1 project');
  });

  await testAsync('duplicateProject clones project with unique name and ID', async () => {
    const duplicated = await recoveryManager.duplicateProject(testProjectId);
    assert(duplicated !== null, 'Duplicated project should exist');
    assert.notStrictEqual(duplicated.id, testProjectId, 'Duplicated project should have new ID');
    assert.strictEqual(duplicated.name, 'Summer Festival 2026 (Copy)');
    assert.strictEqual(duplicated.photos.length, 2);
  });

  // 4. Backup Export & Safe Validated Import
  console.log('\n--- Test Group 4: Project Backup Export & Import ---');

  let backupJsonString = null;

  await testAsync('exportProjectBackup generates valid JSON payload with schema metadata', async () => {
    const proj = await recoveryManager.getProject(testProjectId);
    backupJsonString = recoveryManager.exportProjectBackup(proj);
    assert(typeof backupJsonString === 'string', 'Backup should be a string');

    const parsed = JSON.parse(backupJsonString);
    assert.strictEqual(parsed.schema, 'say_cheese_project_backup');
    assert.strictEqual(parsed.version, 1);
    assert(parsed.project !== undefined, 'Backup should contain project payload');
  });

  test('validateBackupFile correctly validates legitimate backup and rejects corrupted JSON', () => {
    const valid = recoveryManager.validateBackupFile(backupJsonString);
    assert.strictEqual(valid.valid, true, 'Valid backup should pass validation');

    const invalidSchema = JSON.stringify({ schema: 'unknown', data: 123 });
    const resultInvalid = recoveryManager.validateBackupFile(invalidSchema);
    assert.strictEqual(resultInvalid.valid, false, 'Invalid schema should fail validation');

    const garbage = 'not-json-content-at-all';
    const resultGarbage = recoveryManager.validateBackupFile(garbage);
    assert.strictEqual(resultGarbage.valid, false, 'Garbage text should fail validation');
  });

  await testAsync('importProjectBackup securely imports valid project backup', async () => {
    const importResult = await recoveryManager.importProjectBackup(backupJsonString);
    assert.strictEqual(importResult.success, true, 'Import should succeed');
    assert(importResult.project.id, 'Imported project should have an ID');
    assert.strictEqual(importResult.project.name, 'Summer Festival 2026');
  });

  await testAsync('deleteProject removes specified project', async () => {
    const success = await recoveryManager.deleteProject(testProjectId);
    assert.strictEqual(success, true, 'Delete should return true');
    const proj = await recoveryManager.getProject(testProjectId);
    assert.strictEqual(proj, null, 'Deleted project should not be found');
  });

  // 5. Storage Health Diagnostics
  console.log('\n--- Test Group 5: Storage Diagnostics ---');

  await testAsync('getStorageDiagnostics reports storage health and fallback engine', async () => {
    const diag = await recoveryManager.getStorageDiagnostics();
    assert.strictEqual(typeof diag.health, 'string', 'Storage diagnostics should report health string');
    assert.strictEqual(typeof diag.usageBytes, 'number', 'Storage diagnostics should report usageBytes number');
    assert.strictEqual(typeof diag.quotaBytes, 'number', 'Storage diagnostics should report quotaBytes number');
    assert.strictEqual(typeof diag.percentUsed, 'number', 'Storage diagnostics should report percentUsed number');
  });

  console.log(`\n========================================`);
  console.log(`🎉 Feature #14 Tests Complete: ${passed}/${total} passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
