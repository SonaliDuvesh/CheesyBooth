// Automated Test Suite for Feature #9 (Randomization / Surprise Me)
import { createSeededRandom, STYLE_FAMILIES, RandomizerEngine } from '../js/randomizer/randomizer.js';
import { FILTER_PRESETS } from '../js/filters/filterPresets.js';
import { COLLAGE_LAYOUTS } from '../js/collage/layouts.js';
import { FUN_MODES } from '../js/modes/funModes.js';

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

console.log('=== 1. Testing Seeded PRNG ===');
const rng1 = createSeededRandom(12345);
const rng2 = createSeededRandom(12345);
const val1a = rng1();
const val1b = rng1();
const val2a = rng2();
const val2b = rng2();
assert(val1a === val2a && val1b === val2b, 'Seeded PRNG produces identical deterministic sequence for same seed');

console.log('\n=== 2. Testing Style Families Integrity ===');
const families = Object.keys(STYLE_FAMILIES);
assert(families.length === 4, `Expected 4 curated style families, found ${families.length}`);
['vintage', 'cute_playful', 'retro_digital', 'minimal_editorial'].forEach(fId => {
  const f = STYLE_FAMILIES[fId];
  assert(Boolean(f), `Style family ${fId} is defined`);
  assert(f.filters.length > 0, `Style family ${fId} has filters`);
  assert(f.modes.length > 0, `Style family ${fId} has modes`);
  assert(f.frameStyles.length > 0, `Style family ${fId} has frame styles`);
  assert(f.frameColors.length > 0, `Style family ${fId} has frame colors`);
});

console.log('\n=== 3. Testing Session Surprise Generation ===');
const engine = new RandomizerEngine();
for (let i = 0; i < 20; i++) {
  const surprise = engine.generateSessionSurprise({ seed: 1000 + i });
  assert([2, 4, 6].includes(surprise.photoCount), `Photo count is valid (2, 4, or 6): ${surprise.photoCount}`);
  assert(Boolean(FILTER_PRESETS[surprise.filterId]), `Filter is valid: ${surprise.filterId}`);
  assert(Boolean(COLLAGE_LAYOUTS[surprise.layoutId]), `Layout is valid: ${surprise.layoutId}`);
  assert(Boolean(STYLE_FAMILIES[surprise.family]), `Family is valid: ${surprise.family}`);
  assert(surprise.countdown > 0, `Countdown is positive: ${surprise.countdown}s`);
}

console.log('\n=== 4. Testing Lock System ===');
engine.clearLocks();
assert(!engine.isLocked('mode'), 'Initial state: mode is unlocked');

// Lock photo count to 6 and filter to 'film-35mm'
engine.setLock('photoCount', 6);
engine.setLock('filter', 'film-35mm');
assert(engine.isLocked('photoCount'), 'photoCount is locked');
assert(engine.isLocked('filter'), 'filter is locked');

for (let i = 0; i < 10; i++) {
  const s = engine.generateSessionSurprise({ seed: 5000 + i });
  assert(s.photoCount === 6, `Locked photoCount retained as 6 (got ${s.photoCount})`);
  assert(s.filterId === 'film-35mm', `Locked filter retained as film-35mm (got ${s.filterId})`);
}

// Toggle lock
const toggled = engine.toggleLock('filter', 'film-35mm');
assert(!toggled && !engine.isLocked('filter'), 'toggleLock successfully unlocked filter');

console.log('\n=== 5. Testing Individual Parameter Rerolls ===');
const baseSetup = engine.generateSessionSurprise({ seed: 42 });
const rerolledTimer = engine.rerollParameter(baseSetup, 'countdown');
assert(rerolledTimer.modeId === baseSetup.modeId, 'Reroll countdown preserved modeId');
assert(rerolledTimer.photoCount === baseSetup.photoCount, 'Reroll countdown preserved photoCount');

const rerolledFilter = engine.rerollParameter(baseSetup, 'filter');
assert(Boolean(FILTER_PRESETS[rerolledFilter.filterId]), `Rerolled filter is valid: ${rerolledFilter.filterId}`);

console.log('\n=== 6. Testing Collage Surprise Generation & Safe Stickers ===');
const collageSurprise = engine.generateCollageSurprise(4, { seed: 999 });
assert(Boolean(COLLAGE_LAYOUTS[collageSurprise.layoutId]), `Collage layout is valid: ${collageSurprise.layoutId}`);
assert(['3:4', '1:1', '4:5', 'strip'].includes(collageSurprise.aspectRatio), `Aspect ratio is valid: ${collageSurprise.aspectRatio}`);
assert(collageSurprise.spacing >= 4 && collageSurprise.spacing <= 20, `Spacing is in safe bounds (4-20): ${collageSurprise.spacing}`);
assert(collageSurprise.padding >= 10 && collageSurprise.padding <= 30, `Padding is in safe bounds (10-30): ${collageSurprise.padding}`);
assert(Array.isArray(collageSurprise.stickers), 'Stickers array generated');
collageSurprise.stickers.forEach(st => {
  assert(st.xRatio !== undefined && st.yRatio !== undefined, 'Sticker has relative placement ratios');
  // Confirm safe anchors (near corners/edges)
  assert((st.xRatio <= 0.25 || st.xRatio >= 0.75) && (st.yRatio <= 0.25 || st.yRatio >= 0.75), `Sticker placed in safe margin/corner: (${st.xRatio}, ${st.yRatio})`);
});

console.log('\n=== 7. Testing Filter & Sticker Surprises ===');
const fSurprise = engine.generateFilterSurprise();
assert(Boolean(FILTER_PRESETS[fSurprise]), `Standalone filter surprise is valid: ${fSurprise}`);

const sSurprise = engine.generateStickerSurprise();
assert(Boolean(sSurprise.emoji), `Standalone sticker surprise has emoji: ${sSurprise.emoji}`);

console.log(`\n========================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
