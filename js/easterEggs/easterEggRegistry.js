
export const EASTER_EGG_RARITY = {
  COMMON: 'common',       
  RARE: 'rare',           
  ULTRA_RARE: 'ultra_rare' 
};

export const SECRET_STICKERS = [
  { emoji: '🎟️', label: 'Golden Booth Ticket', secretId: 'secret-shutter' },
  { emoji: '🎞️', label: 'Vintage Film Roll', secretId: 'arcade-code' },
  { emoji: '📷', label: 'Classic Gold Camera', secretId: 'secret-brand' },
  { emoji: '👑', label: 'Photobooth Royalty', secretId: 'golden-flash' },
  { emoji: '🧀', label: 'The Big Cheese', secretId: 'rare-message' },
  { emoji: '💫', label: 'Cosmic Shutter', secretId: 'surprise-rare-roll' },
];

export const RARE_BOOTH_MESSAGES = [
  'The booth remembers your smile ✨',
  'That one was suspiciously good! ✦',
  'Pure photobooth magic in every frame 🎞️',
  'Tiny booth victory unlocked! 🧀',
  'You found the hidden heart of the machine 💛',
  'The camera saw that perfect pose 📸',
  'One more for the warm memory wall ✦',
];

export const EASTER_EGGS = [
  {
    id: 'secret-shutter',
    name: 'Mechanical Flutter Shutter',
    description: 'Rapid-tapping or long-pressing the shutter button releases a nostalgic flutter sound.',
    rarity: EASTER_EGG_RARITY.COMMON,
    cooldownMs: 20000,
    hint: 'Try tapping the shutter button rapidly or holding it down.',
  },
  {
    id: 'arcade-code',
    name: 'Retro Arcade Booth Mode',
    description: 'Entering classic arcade cheat codes unlocks retro photobooth sounds and secret stickers.',
    rarity: EASTER_EGG_RARITY.COMMON,
    cooldownMs: 30000,
    hint: 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight B A or typing "saycheese".',
  },
  {
    id: 'secret-brand',
    name: 'Heart of the Booth',
    description: 'Tapping the header branding 5 times reveals the booth\'s playful personality.',
    rarity: EASTER_EGG_RARITY.COMMON,
    cooldownMs: 25000,
    hint: 'Tap the Say Cheese logo 5 times in quick succession.',
  },
  {
    id: 'idle-whisper',
    name: 'Idle Booth Reverie',
    description: 'Leaving the booth idle allows the status indicator to pulse with warm nostalgic thoughts.',
    rarity: EASTER_EGG_RARITY.RARE,
    cooldownMs: 60000,
    hint: 'Leave the booth open and quiet for 45 seconds.',
  },
  {
    id: 'golden-flash',
    name: 'Golden Hour Flash',
    description: 'A rare golden shimmer accompanies a perfectly timed photo capture.',
    rarity: EASTER_EGG_RARITY.ULTRA_RARE,
    cooldownMs: 60000,
    probability: 0.03, 
    hint: 'Occurs rarely on photo capture.',
  },
  {
    id: 'rare-message',
    name: 'Secret Booth Wisdom',
    description: 'Rare nostalgic message displayed after completing a photo session.',
    rarity: EASTER_EGG_RARITY.RARE,
    cooldownMs: 45000,
    probability: 0.08, 
    hint: 'Occurs occasionally upon finishing a multi-shot session.',
  },
  {
    id: 'surprise-rare-roll',
    name: 'Collector\'s Vault Roll',
    description: 'Surprise Me rolls a secret curated combination with rare stickers and golden borders.',
    rarity: EASTER_EGG_RARITY.ULTRA_RARE,
    cooldownMs: 60000,
    probability: 0.04, 
    hint: 'A rare outcome of the Surprise Me randomizer.',
  },
];
