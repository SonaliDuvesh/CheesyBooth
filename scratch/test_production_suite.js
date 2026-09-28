/**
 * Unified Production Engineering & Master Quality Assurance Suite (Feature #27)
 * Runs all automated subsystem test suites, verifies critical user journeys,
 * checks memory cleanup, validates offline PWA shell, and verifies release readiness.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const TEST_FILES = [
  'scratch/test_security.js',
  'scratch/test_ai.js',
  'scratch/test_themes.js',
  'scratch/test_statistics.js',
  'scratch/test_easter_eggs.js',
  'scratch/test_compatibility_and_microinteractions.js',
  'scratch/test_export.js',
  'scratch/test_errors.js',
  'scratch/test_performance.js',
  'scratch/test_privacy.js',
  'scratch/test_recovery.js',
  'scratch/test_randomizer.js',
  'scratch/test_keyboard_a11y.js',
  'scratch/test_mobile.js',
  'scratch/test_ux_refinements.js',
];

console.log('================================================================');
console.log('   SAY CHEESE - MASTER PRODUCTION QA & TEST SUITE (Feature #27)  ');
console.log('================================================================\n');

let totalSuitesPassed = 0;
let totalSuitesFailed = 0;

for (const testFile of TEST_FILES) {
  const fullPath = path.join(ROOT_DIR, testFile);
  const suiteName = path.basename(testFile, '.js');

  process.stdout.write(`• Executing [${suiteName}]... `);
  try {
    execSync(`node "${fullPath}"`, { cwd: ROOT_DIR, stdio: 'pipe' });
    console.log('✅ PASSED');
    totalSuitesPassed++;
  } catch (err) {
    console.log('❌ FAILED');
    console.error(`  Error in ${suiteName}:`, err.stderr ? err.stderr.toString() : err.message);
    totalSuitesFailed++;
  }
}

console.log('\n================================================================');
console.log(`   QA SUITE RESULTS: ${totalSuitesPassed}/${TEST_FILES.length} Test Suites Passed`);
console.log('================================================================\n');

if (totalSuitesFailed > 0) {
  console.error(`❌ Master QA run failed with ${totalSuitesFailed} failed suite(s).`);
  process.exit(1);
} else {
  console.log(`🎉 ALL ${TEST_FILES.length} AUTOMATED TEST SUITES PASSED WITH ZERO ERRORS.`);
  console.log('✨ Say Cheese is verified as Release Candidate (Production Ready).');
  process.exit(0);
}
