/**
 * Comprehensive Automated Test Suite for Feature #25: Optional AI Features
 */

import {
  sanitizeText,
  isContentSafe,
  validateThemeSuggestion,
  validateSessionPlan,
  validateStickerSuggestions
} from '../js/ai/aiPrompts.js';

import { LocalAiFallback, LOCAL_CAPTIONS_CATALOG } from '../js/ai/localAiFallback.js';
import { LocalAIProvider, CustomProxyAIProvider } from '../js/ai/aiProvider.js';
import { AISettings, DEFAULT_AI_SETTINGS } from '../js/ai/aiSettings.js';
import { AIManager } from '../js/ai/aiManager.js';
import { SessionStats } from '../js/statistics/statisticsModel.js';
import { StatisticsRenderer } from '../js/statistics/statisticsRenderer.js';
import { getAsyncPosePrompt } from '../js/modes/funModes.js';

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
  console.log('--- 1. Testing AI Prompts & Sanitization (aiPrompts.js) ---');
  {
    const dirty = '<script>alert("hack")</script>Hello "World" & <img src=x onerror=alert(1)>';
    const clean = sanitizeText(dirty);
    assert(!clean.includes('<script>'), 'Script tags stripped');
    assert(!clean.includes('onerror'), 'Attributes stripped');
    assert(clean.includes('&quot;World&quot;'), 'Quotes escaped safely');
    assert(clean.includes('&amp;'), 'Ampersand escaped');

    assert(!isContentSafe('this is hate speech'), 'Safety filter flags unsafe words');
    assert(isContentSafe('Soft smiles & sweet moments ✨'), 'Safety filter accepts clean text');

    const validTheme = validateThemeSuggestion({ themeId: 'retro-film', filterId: 'film-35mm', layoutId: 'film-strip' });
    assert(validTheme.themeId === 'retro-film', 'Valid theme ID accepted');
    assert(validTheme.filterId === 'film-35mm', 'Valid filter ID accepted');

    const fakeTheme = validateThemeSuggestion({ themeId: 'hallucinated-unicorn-galaxy', filterId: 'fake-filter' });
    assert(fakeTheme.themeId === 'classic-booth', 'Invalid theme falls back to classic-booth');
    assert(fakeTheme.filterId === 'warm-vintage', 'Invalid filter falls back to warm-vintage');

    const fakePlan = validateSessionPlan({ themeId: 'fake', modeId: 'fake', countdown: 99 });
    assert(fakePlan.themeId === 'classic-booth', 'Session plan invalid theme fallback');
    assert(fakePlan.modeId === 'classic', 'Session plan invalid mode fallback');
    assert(fakePlan.countdown === 3, 'Session plan invalid countdown fallback');

    const stickers = validateStickerSuggestions(['✨', '❤️', '<script>', 'nonexistent-huge-string-that-is-way-too-long']);
    assert(stickers.includes('✨'), 'Valid emoji sticker accepted');
    assert(!stickers.some(s => s.includes('<script>')), 'Malicious sticker string stripped');
  }

  console.log('\n--- 2. Testing Local AI Fallback Engine (localAiFallback.js) ---');
  {
    const styles = ['cute', 'funny', 'minimal', 'nostalgic', 'romantic', 'chaotic', 'retro', 'confident'];
    for (const style of styles) {
      const captions = LocalAiFallback.generateCaptions({ style, count: 3 });
      assert(captions.length === 3, `Generated 3 captions for style: ${style}`);
      assert(captions.every(c => typeof c === 'string' && c.length > 0), `All captions are valid strings for ${style}`);
    }

    const pose = LocalAiFallback.suggestPose({ groupSize: 2 });
    assert(typeof pose.text === 'string' && pose.text.length > 0, 'Pose text generated for duo');
    assert(typeof pose.tip === 'string', 'Pose tip provided');

    const theme = LocalAiFallback.suggestTheme({ currentMood: 'retro' });
    assert(theme.themeId === 'retro-film', 'Retro mood maps to retro-film theme');
    assert(theme.filterId === 'film-35mm', 'Retro mood maps to film-35mm filter');

    const stickers = LocalAiFallback.suggestStickers({ mood: 'cute', count: 4 });
    assert(stickers.length === 4, 'Suggested 4 stickers');

    const layout = LocalAiFallback.suggestCollageLayout({ photoCount: 4 });
    assert(['vertical-strip', 'grid-2x2', 'polaroid-quad', 'film-strip'].includes(layout.layoutId), 'Layout suggestion matches 4-photo options');

    const plan = LocalAiFallback.planSession({ mood: 'chaotic', groupSize: 1 });
    assert(plan.modeId === 'countdown-chaos', 'Chaotic mood plans countdown-chaos mode');
    assert(plan.filterId === 'disposable', 'Chaotic mood plans disposable filter');
  }

  console.log('\n--- 3. Testing AI Providers (aiProvider.js) ---');
  {
    const localProvider = new LocalAIProvider();
    const captions = await localProvider.generateCaptions({ style: 'cute', count: 2 });
    assert(captions.length === 2, 'Local provider returns 2 sanitized captions');

    // Test AbortController cancellation
    const controller = new AbortController();
    controller.abort();
    let aborted = false;
    try {
      await localProvider.generateCaptions({ signal: controller.signal });
    } catch (err) {
      if (err.name === 'AbortError') aborted = true;
    }
    assert(aborted, 'Provider respects AbortSignal cancellation');

    const proxyProvider = new CustomProxyAIProvider('http://127.0.0.1:9999/nonexistent-proxy');
    const proxyCaptions = await proxyProvider.generateCaptions({ style: 'funny', count: 2 });
    assert(proxyCaptions.length === 2, 'CustomProxyAIProvider falls back to local simulation on network failure');
  }

  console.log('\n--- 4. Testing AI Settings (aiSettings.js) ---');
  {
    const settings = new AISettings();
    assert(settings.get('enabled') === true, 'Master AI toggle default is true');
    assert(settings.get('photoAiEnabled') === false, 'Photo AI default is strictly FALSE');
    assert(settings.isFeatureEnabled('caption') === true, 'Captions enabled by default');

    settings.set('enabled', false);
    assert(settings.isFeatureEnabled('caption') === false, 'Disabling master switch disables caption feature');
    settings.set('enabled', true);
  }

  console.log('\n--- 5. Testing AI Manager (aiManager.js) ---');
  {
    const manager = new AIManager();
    assert(manager.isEnabled === true, 'Manager reports isEnabled');
    assert(manager.getStatus() === 'available', 'Manager status available');

    const captions = await manager.generateCaptions({ style: 'minimal', count: 3 });
    assert(captions.length === 3, 'Manager generates captions successfully');

    const plan = await manager.planSession({ mood: 'fun', groupSize: 2 });
    assert(plan.groupSize !== undefined || plan.photoCount === 4, 'Manager generated session plan');
  }

  console.log('\n--- 6. Testing Session Statistics & Fun Modes Integration ---');
  {
    const stats = new SessionStats();
    stats.aiCaptionsGenerated = 2;
    stats.aiSuggestionsUsed = 1;
    stats.finish();

    const json = stats.toJSON();
    assert(json.aiCaptionsGenerated === 2, 'AI caption count serialized in SessionStats');
    assert(json.aiSuggestionsUsed === 1, 'AI suggestion count serialized in SessionStats');

    const restored = SessionStats.fromJSON(json);
    assert(restored.aiCaptionsGenerated === 2, 'AI caption count deserialized');
    assert(restored.aiSuggestionsUsed === 1, 'AI suggestion count deserialized');

    const html = StatisticsRenderer.renderCardContent(restored);
    assert(html.includes('3 AI Creative Ideas Explored'), 'Statistics card displays AI activity pill');

    // Fun modes async pose prompt
    const prompt = await getAsyncPosePrompt(['expression'], 1);
    assert(typeof prompt.text === 'string' && prompt.text.length > 0, 'Async pose prompt returns valid prompt');
  }

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================`);
  if (failed > 0) process.exit(1);
}

runTests();
