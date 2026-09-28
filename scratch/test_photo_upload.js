import { PhotoManager } from '../js/photos/photoManager.js';
import assert from 'assert';

console.log('🧪 Testing Photo Upload & Pre-clicked Images Support...');

const pm = new PhotoManager();

// 1. Initial State
assert.strictEqual(pm.count, 0, 'Initial photo count should be 0');

// 2. Upload multiple photos (e.g. 5 photos)
const sampleUploads = [
  { imageData: 'data:image/jpeg;base64,photo1', width: 1920, height: 1080 },
  { imageData: 'data:image/png;base64,photo2', width: 1200, height: 1200 },
  { imageData: 'data:image/webp;base64,photo3', width: 1080, height: 1350 },
  { imageData: 'data:image/jpeg;base64,photo4', width: 800, height: 600 },
  { imageData: 'data:image/jpeg;base64,photo5', width: 1600, height: 1200 },
];

for (const upload of sampleUploads) {
  pm.addPhoto(upload);
}

assert.strictEqual(pm.count, 5, 'Should have 5 uploaded photos');
pm.setTargetCount(pm.count);
assert.strictEqual(pm.targetCount, 5, 'Target count should adapt to 5');
assert.strictEqual(pm.isComplete, true, 'Session should be complete with uploaded photos');
console.log('✅ Multiple photo uploads verified');

// 3. Reordering uploaded photos
const firstId = pm.getAll()[0].id;
const secondId = pm.getAll()[1].id;
pm.reorderPhoto(0, 1);
assert.strictEqual(pm.getAll()[0].id, secondId, 'Photo at index 0 should now be the former second photo');
assert.strictEqual(pm.getAll()[1].id, firstId, 'Photo at index 1 should now be the former first photo');
console.log('✅ Reordering uploaded photos verified');

// 4. Deleting a photo
pm.deletePhoto(0);
assert.strictEqual(pm.count, 4, 'Photo count should decrease to 4 after deletion');
console.log('✅ Deleting uploaded photo verified');

// 5. Clearing photos for new upload batch
pm.clearPhotos();
assert.strictEqual(pm.count, 0, 'Clear photos should empty the manager');
console.log('✅ Clear photos verified');

console.log('\n🎉 ALL PHOTO UPLOAD TESTS PASSED SUCCESSFULLY!');
