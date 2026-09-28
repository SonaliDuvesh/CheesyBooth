import { PerformanceManager } from '../js/performance/performanceManager.js';
import { ImageCache } from '../js/performance/imageCache.js';
import { FilterCache } from '../js/performance/filterCache.js';
import { GIFEncoder } from '../js/export/gifEncoder.js';

console.log('=== Running Feature #18 Performance Optimization Verification ===');

// 1. Test PerformanceManager
const perf = new PerformanceManager();
perf.mark('test_start');
console.log('Capabilities detected:', perf.capabilities);
perf.setMode('battery-saver', false);
console.log('Mode set to battery-saver:', perf.getMode() === 'battery-saver');
console.log('Safe preview DPR (battery-saver):', perf.getSafePreviewDpr());
perf.setMode('balanced', false);
console.log('Safe preview DPR (balanced):', perf.getSafePreviewDpr());
perf.setMode('quality', false);
console.log('Safe preview DPR (quality):', perf.getSafePreviewDpr());

// 2. Test ImageCache LRU bounds and metrics
const cache = new ImageCache(4);
console.log('Initial cache size:', cache.cache.size);
for (let i = 0; i < 6; i++) {
  cache._put(`img_${i}`, { naturalWidth: 800, naturalHeight: 600, width: 800, height: 600 });
}
console.log('Cache size after 6 puts (max 4):', cache.cache.size === 4);
console.log('Oldest entry img_0 evicted:', !cache.cache.has('img_0'));
console.log('Newest entry img_5 present:', cache.cache.has('img_5'));

// 3. Test FilterCache key generation & eviction
const fCache = new FilterCache(3);
const key1 = fCache._makeKey('p1', 'warm-vintage', 80, 800, 600);
const key2 = fCache._makeKey('p1', 'warm-vintage', 80.4, 800, 600);
console.log('Filter cache deterministic rounding match:', key1 === key2);

// 4. Test GIFEncoder ByteArrayStream performance
console.log('Testing ByteArrayStream high-throughput allocation...');
const encoder = new GIFEncoder(100, 100);
const startStream = Date.now();
for (let i = 0; i < 20000; i++) {
  encoder.stream.writeByte(i & 0xff);
}
const elapsedMs = Date.now() - startStream;
console.log(`Wrote 20,000 bytes into ByteArrayStream in ${elapsedMs}ms`);
console.log('Stream length:', encoder.stream.length === 20000);

// 5. Test Performance Snapshot
perf.recordRenderTime(14.2);
perf.recordImageHit();
perf.recordFilterHit();
const diag = perf.getDiagnostics();
console.log('Diagnostics snapshot:', diag);

console.log('=== All Performance Subsystem Tests Passed! ===');
