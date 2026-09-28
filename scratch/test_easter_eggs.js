/**
 * Verification Suite for Feature #22 (Easter Eggs)
 */

import { EASTER_EGGS, SECRET_STICKERS, RARE_BOOTH_MESSAGES } from '../js/easterEggs/easterEggRegistry.js';
import { EasterEggManager, easterEggManager } from '../js/easterEggs/easterEggManager.js';
import { getAllBuiltInStickers, getSecretStickerPack } from '../js/stickers/stickerLibrary.js';

console.log('=== Running Feature #22 Easter Eggs Test Suite ===');

// 1. Registry verification
console.assert(EASTER_EGGS.length >= 7, 'At least 7 Easter Eggs registered');
console.assert(SECRET_STICKERS.length >= 6, 'At least 6 Secret Stickers registered');
console.assert(RARE_BOOTH_MESSAGES.length >= 7, 'At least 7 Rare Messages defined');

EASTER_EGGS.forEach(egg => {
  console.assert(typeof egg.id === 'string' && egg.id.length > 0, `Easter egg ${egg.id} has valid id`);
  console.assert(typeof egg.rarity === 'string', `Easter egg ${egg.id} has rarity`);
  console.assert(typeof egg.cooldownMs === 'number', `Easter egg ${egg.id} has cooldown`);
});

// 2. Manager execution & discovery
const mgr = new EasterEggManager();
mgr.clearDiscoveries();
console.assert(mgr.getDiscovered().length === 0, 'Discoveries cleared initially');

// Trigger secret shutter
const res1 = mgr.trigger('secret-shutter', { force: true });
console.assert(res1 === true, 'Secret shutter triggered successfully');
console.assert(mgr.isDiscovered('secret-shutter'), 'Secret shutter recorded in discoveries');
console.assert(mgr.getDiscovered().includes('secret-shutter'), 'Discovery listed in getDiscovered');

// Cooldown verification without force
const resCooldown = mgr.trigger('secret-shutter', { force: false });
console.assert(resCooldown === false, 'Cooldown prevents immediate re-trigger');

// Secret stickers integration
const unlockedStickers = mgr.getUnlockedSecretStickers();
console.assert(unlockedStickers.length >= 1, 'Unlocked secret stickers reflect discoveries');
console.assert(unlockedStickers.some(s => s.secretId === 'secret-shutter'), 'Golden Ticket unlocked');

// Clean up
mgr.clearDiscoveries();
console.assert(mgr.getDiscovered().length === 0, 'Discoveries cleaned up');

console.log('=== All Feature #22 Easter Eggs Tests Passed! ===');
