
export const POSE_PROMPTS_BY_CATEGORY = {
  expression: [
    { id: 'exp_smile', text: 'Big bright smile! ✨', category: 'expression' },
    { id: 'exp_serious', text: 'Serious editorial face 🤨', category: 'expression' },
    { id: 'exp_surprise', text: 'Look genuinely surprised! 😮', category: 'expression' },
    { id: 'exp_sleepy', text: 'Sleepy cozy eyes 😴', category: 'expression' },
    { id: 'exp_wink', text: 'Flirty cute wink 😉', category: 'expression' },
    { id: 'exp_cool', text: 'Cool model smirk 😎', category: 'expression' },
    { id: 'exp_shocked', text: 'Dramatic jaw-drop! 😱', category: 'expression' },
    { id: 'exp_soft', text: 'Soft gentle smile 🌸', category: 'expression' },
  ],
  gesture: [
    { id: 'ges_peace', text: 'Classic peace sign ✌️', category: 'gesture' },
    { id: 'ges_heart', text: 'Heart with hands 🫶', category: 'gesture' },
    { id: 'ges_thumbs', text: 'Thumbs up superstar 👍', category: 'gesture' },
    { id: 'ges_kiss', text: 'Blow a sweet kiss 😘', category: 'gesture' },
    { id: 'ges_frame', text: 'Frame your face with hands 👐', category: 'gesture' },
    { id: 'ges_salute', text: 'Respectful salute 🫡', category: 'gesture' },
    { id: 'ges_fingergun', text: 'Finger gun snap 👉', category: 'gesture' },
    { id: 'ges_think', text: 'Deep philosopher chin tap 🤔', category: 'gesture' },
  ],
  movement: [
    { id: 'mov_turn', text: 'Turn around & glance back 💫', category: 'movement' },
    { id: 'mov_lean', text: 'Lean in close to camera 🔍', category: 'movement' },
    { id: 'mov_tilt', text: 'Dramatic head tilt 🎭', category: 'movement' },
    { id: 'mov_freeze', text: 'Freeze like a mannequin 🧊', category: 'movement' },
    { id: 'mov_away', text: 'Look away into distance 🌿', category: 'movement' },
    { id: 'mov_shrug', text: 'Playful shoulder shrug 🤷', category: 'movement' },
    { id: 'mov_hair', text: 'Sassy hair touch moment ✨', category: 'movement' },
  ],
  silly: [
    { id: 'sil_goofy', text: 'Goofy silly face 🤪', category: 'silly' },
    { id: 'sil_sus', text: 'Act suspicious 🕵️', category: 'silly' },
    { id: 'sil_famous', text: 'Pretend you are famous 🌟', category: 'silly' },
    { id: 'sil_villain', text: 'Best evil villain grin 🦹', category: 'silly' },
    { id: 'sil_roar', text: 'Tiny dinosaur roar 🦖', category: 'silly' },
    { id: 'sil_duck', text: 'Classic duck lips 🦆', category: 'silly' },
    { id: 'sil_robot', text: 'Robot freeze glitch 🤖', category: 'silly' },
  ],
  duo: [
    { id: 'duo_highfive', text: 'High-five mid-air freeze! ✋', category: 'duo' },
    { id: 'duo_back', text: 'Back-to-back action hero 🕶️', category: 'duo' },
    { id: 'duo_laugh', text: 'Look at each other and laugh 😂', category: 'duo' },
    { id: 'duo_hug', text: 'One big cozy hug 🫂', category: 'duo' },
    { id: 'duo_point', text: 'Point at your bestie 👉', category: 'duo' },
    { id: 'duo_mirror', text: 'Mirror each other’s pose 🪞', category: 'duo' },
    { id: 'duo_peek', text: 'Peek from behind shoulder 👀', category: 'duo' },
  ],
};

export const ALL_POSE_PROMPTS = Object.values(POSE_PROMPTS_BY_CATEGORY).flat();

export const FUN_MODES = [
  {
    id: 'classic',
    name: 'Classic Booth',
    icon: '🪵',
    tagline: 'Authentic & Timeless',
    desc: 'The original cozy photobooth experience with your preferred settings.',
    suggestedCountdown: 5,
    energy: 'Relaxed',
    audioProfile: 'classic',
    behavior: {
      type: 'classic',
      allowRetake: true,
      showPrompts: false,
      interShotDelayMs: 700,
    },
    completionMessage: 'Your classic photo session is ready! 📸',
  },
  {
    id: 'rapid-fire',
    name: 'Rapid Fire',
    icon: '⚡',
    tagline: 'Fast & Spontaneous',
    desc: 'Blink-and-you-miss-it fast snaps with minimal delay between shots!',
    suggestedCountdown: 2,
    energy: 'High Energy',
    audioProfile: 'rapid',
    behavior: {
      type: 'rapid',
      allowRetake: true,
      countdownOverride: 2,
      interShotDelayMs: 350,
      showPrompts: false,
    },
    completionMessage: '⚡ That was FAST! Rapid fire session completed.',
  },
  {
    id: 'slow-cinematic',
    name: 'Slow & Cinematic',
    icon: '🎬',
    tagline: 'Calm & Intentional',
    desc: 'Gentle, meditative pacing with breathing cues and extra time to compose each shot.',
    suggestedCountdown: 5,
    energy: 'Gentle',
    audioProfile: 'soft',
    behavior: {
      type: 'cinematic',
      allowRetake: true,
      countdownOverride: 5,
      interShotDelayMs: 1100,
      cinematicIntro: true,
      showPrompts: false,
    },
    completionMessage: '🎬 Beautifully composed. A gentle cinematic memory.',
  },
  {
    id: 'pose-challenge',
    name: 'Pose Challenge',
    icon: '🎭',
    tagline: 'Creative & Structured',
    desc: 'Get a fresh, randomized pose challenge prompt before each shot.',
    suggestedCountdown: 5,
    energy: 'Playful',
    audioProfile: 'playful',
    behavior: {
      type: 'pose-challenge',
      allowRetake: true,
      showPrompts: true,
      promptCategories: ['expression', 'gesture', 'movement', 'silly'],
      interShotDelayMs: 800,
    },
    completionMessage: '🎭 Poses nailed! You aced the challenge.',
  },
  {
    id: 'mystery-pose',
    name: 'Mystery Pose',
    icon: '❓',
    tagline: 'Surprise Flash Reveal',
    desc: 'The prompt stays hidden behind "???" until 2 seconds before the shutter clicks!',
    suggestedCountdown: 5,
    energy: 'Thrilling',
    audioProfile: 'playful',
    behavior: {
      type: 'mystery',
      allowRetake: true,
      showPrompts: true,
      mysteryRevealSeconds: 2,
      promptCategories: ['expression', 'gesture', 'movement', 'silly'],
      interShotDelayMs: 800,
    },
    completionMessage: '❓ Survived the mystery! Incredible spontaneous reactions.',
  },
  {
    id: 'freeze-frame',
    name: 'Freeze Frame',
    icon: '🧊',
    tagline: 'Move... Then Freeze!',
    desc: 'Keep moving freely until the buzzer commands you to FREEZE!',
    suggestedCountdown: 5,
    energy: 'Exciting',
    audioProfile: 'playful',
    behavior: {
      type: 'freeze',
      allowRetake: true,
      freezeCueSeconds: 2,
      interShotDelayMs: 800,
      showPrompts: false,
    },
    completionMessage: '🧊 Frozen in time! Perfect timing on every shot.',
  },
  {
    id: 'duo-group',
    name: 'Duo & Group',
    icon: '👥',
    tagline: 'Better Together',
    desc: 'Tailored for 2+ people with wide framing, generous countdowns, and partner poses.',
    suggestedCountdown: 5,
    energy: 'Social',
    audioProfile: 'classic',
    behavior: {
      type: 'duo',
      allowRetake: true,
      showPrompts: true,
      promptCategories: ['duo', 'gesture', 'silly'],
      countdownOverride: 5,
      interShotDelayMs: 900,
    },
    completionMessage: '👥 Squad goals captured! Cherish these group memories.',
  },
  {
    id: 'reaction',
    name: 'Reaction Desk',
    icon: '😲',
    tagline: 'Dramatic Expressions',
    desc: 'Expressive emoji-driven emotional challenges from hysterical to poker face.',
    suggestedCountdown: 4,
    energy: 'Expressive',
    audioProfile: 'playful',
    behavior: {
      type: 'reaction',
      allowRetake: true,
      showPrompts: true,
      promptCategories: ['expression', 'silly'],
      interShotDelayMs: 800,
    },
    completionMessage: '😲 10/10 expressions! These faces belong in a museum.',
  },
  {
    id: 'countdown-chaos',
    name: 'Countdown Chaos',
    icon: '🎲',
    tagline: 'Unpredictable Timers',
    desc: 'Each shot has a completely randomized countdown (1s to 7s). Stay alert!',
    suggestedCountdown: 3,
    energy: 'Wild',
    audioProfile: 'playful',
    behavior: {
      type: 'chaos',
      allowRetake: true,
      randomTimers: [1, 2, 3, 5, 7],
      interShotDelayMs: 700,
      showPrompts: false,
    },
    completionMessage: '🎲 Chaos mastered! You handled every wild timer like a pro.',
  },
  {
    id: 'one-take',
    name: 'One-Take Pure',
    icon: '🎯',
    tagline: 'High Stakes · No Retakes',
    desc: 'Pure analog discipline. Retakes are disabled during capture-make every shot count!',
    suggestedCountdown: 4,
    energy: 'Focused',
    audioProfile: 'classic',
    behavior: {
      type: 'one-take',
      allowRetake: false,
      interShotDelayMs: 700,
      showPrompts: false,
    },
    completionMessage: '🎯 Pure authentic roll! Captured in one single take.',
  },
  {
    id: 'silent-booth',
    name: 'Silent Booth',
    icon: '🤫',
    tagline: 'Quiet & Discreet',
    desc: 'Mutes shutter and ticks for libraries, sleeping babies, and quiet spaces.',
    suggestedCountdown: 3,
    energy: 'Quiet',
    audioProfile: 'silent',
    behavior: {
      type: 'silent',
      allowRetake: true,
      silentAudio: true,
      interShotDelayMs: 700,
      showPrompts: false,
    },
    completionMessage: '🤫 Shhh... quiet session complete without a sound.',
  },
  {
    id: 'random-mix',
    name: 'Random Mix',
    icon: '✨',
    tagline: 'Surprise Variety',
    desc: 'Combines different modes per shot-you never know what the booth will throw at you next!',
    suggestedCountdown: 4,
    energy: 'Surprise',
    audioProfile: 'playful',
    behavior: {
      type: 'random-mix',
      allowRetake: true,
      subModes: ['rapid-fire', 'pose-challenge', 'mystery-pose', 'reaction', 'freeze-frame', 'countdown-chaos'],
      interShotDelayMs: 750,
    },
    completionMessage: '✨ The ultimate variety mix! Every single shot had its own flavor.',
  },
];

export function getFunMode(modeId) {
  return FUN_MODES.find(m => m.id === modeId) || FUN_MODES[0];
}

export function getRandomPrompt(categories = ['expression', 'gesture', 'movement', 'silly'], usedIds = new Set()) {
  let pool = [];
  categories.forEach(cat => {
    if (POSE_PROMPTS_BY_CATEGORY[cat]) {
      pool.push(...POSE_PROMPTS_BY_CATEGORY[cat]);
    }
  });

  if (pool.length === 0) pool = ALL_POSE_PROMPTS;

  let available = pool.filter(p => !usedIds.has(p.id));
  if (available.length === 0) {
    usedIds.clear();
    available = pool;
  }

  const selected = available[Math.floor(Math.random() * available.length)];
  if (selected) {
    usedIds.add(selected.id);
    return selected;
  }
  return { id: 'fallback', text: 'Smile for the camera! ✨', category: 'expression' };
}

export async function getAsyncPosePrompt(categories = ['expression', 'gesture', 'movement', 'silly'], groupSize = 1, usedIds = new Set()) {
  if (typeof window !== 'undefined' && window.__sayCheeseAI?.isEnabled && window.__sayCheeseAI.settings?.isFeatureEnabled('pose')) {
    try {
      const primaryCategory = categories[0] || 'all';
      const aiPose = await window.__sayCheeseAI.suggestPose({ category: primaryCategory, groupSize });
      if (aiPose && aiPose.text) {
        return {
          id: `ai_${Date.now()}`,
          text: aiPose.text,
          category: aiPose.category || 'expression',
          isAiGenerated: true,
        };
      }
    } catch (e) {

    }
  }
  return getRandomPrompt(categories, usedIds);
}
