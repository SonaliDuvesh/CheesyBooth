
import { ALL_POSE_PROMPTS, POSE_PROMPTS_BY_CATEGORY } from '../modes/funModes.js';
import { BOOTH_COLLECTIONS } from '../themes/themeRegistry.js';
import { FILTER_PRESETS } from '../filters/filterPresets.js';
import { COLLAGE_LAYOUTS } from '../collage/layouts.js';
import { STICKER_PACKS } from '../stickers/stickerLibrary.js';

export const LOCAL_CAPTIONS_CATALOG = {
  cute: [
    'Caught a little sparkle ✨',
    'Forever looks good on us 🌸',
    'Soft smiles & sweet moments 💕',
    'Just a tiny bit obsessed 🎀',
    'Cherishing this little frame 🧸',
    'Pure warmth in one shot ✨',
    'Sweet moments made tangible 🍰',
    'Little rays of sunshine today 🍓',
    'Pocket full of happy memories 🌼',
    'Making ordinary days feel magical 🪄',
  ],
  funny: [
    'Proof that we actually went outside.',
    'Zero thoughts, just photobooth vibes ✌️',
    'We practiced this pose in the car 🚗',
    'Flash on. Problems off. ✨',
    'Documenting our chaotic chemistry 🧪',
    'Warning: highly spontaneous content ⚠️',
    '10/10 would take this photo again 📈',
    'Behind the scenes was even crazier 😂',
    'The countdown gave us zero warning ⏱️',
    'Professional photobooth enthusiasts 🏅',
  ],
  minimal: [
    'Moment.',
    'Captured.',
    'Here & now.',
    'Little memory.',
    'Quiet light.',
    'Golden hour.',
    'Stillness.',
    'Frame by frame.',
    'Pure presence.',
    'Silver & grain.',
  ],
  nostalgic: [
    'Somewhere between a memory and a moment.',
    'For future us, with love.',
    'Saved from the passing of time 🎞️',
    'A little piece of today.',
    'These will be the good old days 🍂',
    'Holding onto this afternoon ✨',
    'Etched into silver and grain 📽️',
    'Time stopped for four clicks 🕰️',
    'A soft polaroid of this year ☕',
    'Keep this in your jacket pocket 💌',
  ],
  romantic: [
    'My favorite face in every frame 💕',
    'You make every moment softer ✨',
    'Two hearts in a 4-strip 🫶',
    'Our little world in one snapshot 💫',
    'Always better together 🌸',
    'Written in photobooth light ✨',
    'Just you and me and this flash 💖',
    'The best memory on the roll 💌',
  ],
  chaotic: [
    'Completely unhinged and loving it 💥',
    'Energy levels: maximum chaos 🤪',
    'We survived the countdown barely ⏳',
    'Whatever happened here, we regret nothing ⚡',
    'Spontaneous combustion of pure joy 🎉',
    'No rehearsal. Just wild vibes 🔥',
    'The photobooth was not ready for this 🌪️',
  ],
  retro: [
    'Analog exposure · 35mm frame 🎞️',
    'Fresh from the photomaton bath 🎞️',
    '1994 called, they want their flash back 📸',
    'Grain, glow, and good company 📻',
    'Disposable camera magic ✨',
    'Vintage negative No. 24 🎞️',
    'Film rolled, memories sealed 📼',
  ],
  confident: [
    'Main character energy activated ✨',
    'Unapologetically radiant 💅',
    'Giving editorial magazine cover 🕶️',
    'Serving looks, taking names 🌟',
    'Effortless and iconic 🔥',
    'The camera clearly loves this angle 📸',
    'Confidence caught on 35mm film 💫',
  ],
};

export class LocalAiFallback {

  static generateCaptions({ style = 'cute', count = 3 } = {}) {
    const validStyle = LOCAL_CAPTIONS_CATALOG[style] ? style : 'cute';
    const pool = [...LOCAL_CAPTIONS_CATALOG[validStyle]];

    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, pool.length));
  }

  static suggestPose({ category = 'all', groupSize = 1 } = {}) {
    let pool = [];
    if (groupSize >= 2) {
      pool = POSE_PROMPTS_BY_CATEGORY.duo || [];
    } else if (category && category !== 'all' && POSE_PROMPTS_BY_CATEGORY[category]) {
      pool = POSE_PROMPTS_BY_CATEGORY[category];
    } else {
      pool = ALL_POSE_PROMPTS;
    }

    const item = pool[Math.floor(Math.random() * pool.length)] || ALL_POSE_PROMPTS[0];
    return {
      text: item.text,
      category: item.category || 'expression',
      tip: groupSize >= 2 ? 'Coordinate your pose with your partner before the shutter!' : 'Relax your shoulders and look right into the lens ✨',
    };
  }

  static suggestTheme({ currentMood = 'warm' } = {}) {
    const moodMap = {
      warm: { themeId: 'classic-booth', filterId: 'warm-vintage', layoutId: 'vertical-strip', tagline: 'Warm Ivory & Walnut Photobooth' },
      retro: { themeId: 'retro-film', filterId: 'film-35mm', layoutId: 'film-strip', tagline: '35mm Darkroom Perforations' },
      playful: { themeId: 'playful-booth', filterId: 'pastel-peach', layoutId: 'duo-strip', tagline: 'Sunny Pastel & Confetti Pop' },
      flash: { themeId: 'flash-90s', filterId: 'disposable', layoutId: 'polaroid-quad', tagline: '90s Disposable Camera Flash' },
      cozy: { themeId: 'cozy-memory', filterId: 'dreamy', layoutId: 'classic-2x2', tagline: 'Oatmeal Paper & Gentle Moments' },
      digital: { themeId: 'digital-camera', filterId: 'digicam', layoutId: 'grid-2x3', tagline: 'Y2K Cyber Digicam Glow' },
      minimal: { themeId: 'minimal-studio', filterId: 'classic-bw', layoutId: 'editorial-strip', tagline: 'Editorial High Contrast Noir' },
    };

    const chosen = moodMap[currentMood] || moodMap.warm;
    const themeObj = BOOTH_COLLECTIONS.find(t => t.id === chosen.themeId) || BOOTH_COLLECTIONS[0];

    return {
      themeId: chosen.themeId,
      themeName: themeObj.name,
      filterId: chosen.filterId,
      filterName: FILTER_PRESETS[chosen.filterId]?.name || 'Warm Vintage',
      layoutId: chosen.layoutId,
      layoutName: COLLAGE_LAYOUTS[chosen.layoutId]?.name || 'Classic Strip',
      tagline: chosen.tagline,
      reason: `Assembled for a cozy, authentic ${currentMood} aesthetic.`,
    };
  }

  static suggestStickers({ mood = 'cute', count = 4 } = {}) {
    let packId = 'cute';
    if (mood === 'retro') packId = 'doodles';
    else if (mood === 'playful') packId = 'party';
    else if (mood === 'cozy') packId = 'food';

    const pack = STICKER_PACKS.find(p => p.id === packId) || STICKER_PACKS[0];
    const emojis = pack.stickers.map(s => s.emoji);
    const shuffled = [...emojis].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static suggestCollageLayout({ photoCount = 4, style = 'classic' } = {}) {
    const layoutRecommendations = {
      2: ['duo-strip', 'classic-2x2', 'vertical-strip'],
      3: ['vertical-strip', 'editorial-strip', 'film-strip'],
      4: ['vertical-strip', 'grid-2x2', 'polaroid-quad', 'film-strip'],
      6: ['grid-2x3', 'film-strip', 'vertical-strip'],
    };

    const candidates = layoutRecommendations[photoCount] || layoutRecommendations[4];
    const chosenId = candidates[Math.floor(Math.random() * candidates.length)];
    const layout = COLLAGE_LAYOUTS[chosenId] || COLLAGE_LAYOUTS['vertical-strip'];

    return {
      layoutId: chosenId,
      name: layout.name,
      category: layout.category,
      aspectRatio: layout.aspectRatio,
      reason: `Optimized aspect framing for a ${photoCount}-photo print session.`,
    };
  }

  static planSession({ mood = 'fun', groupSize = 1 } = {}) {
    const moodKey = mood.toLowerCase();
    let themeId = 'classic-booth';
    let modeId = 'classic';
    let filterId = 'warm-vintage';
    let layoutId = 'vertical-strip';
    let countdown = 3;
    let photoCount = 4;
    let title = 'Classic Memory Session';
    let description = 'A timeless 4-shot photobooth roll with warm analog tones.';

    if (groupSize >= 2) {
      modeId = 'duo-group';
      countdown = 5;
      photoCount = 4;
      title = 'Squad Duo Session';
      description = 'Generous 5-second countdown with partner pose prompts and side-by-side framing.';
    } else if (moodKey.includes('chaotic') || moodKey.includes('wild')) {
      themeId = 'flash-90s';
      modeId = 'countdown-chaos';
      filterId = 'disposable';
      layoutId = 'polaroid-quad';
      countdown = 3;
      title = 'Flash Chaos Roll';
      description = 'Unpredictable random countdowns with saturated 90s disposable camera flash.';
    } else if (moodKey.includes('romantic') || moodKey.includes('love')) {
      themeId = 'cozy-memory';
      modeId = 'slow-cinematic';
      filterId = 'dreamy';
      layoutId = 'classic-2x2';
      countdown = 5;
      photoCount = 4;
      title = 'Gentle Romance Roll';
      description = 'Meditative 5s pacing, soft rounded corners, and gentle luminous bloom.';
    } else if (moodKey.includes('nostalgic') || moodKey.includes('retro')) {
      themeId = 'retro-film';
      modeId = 'pose-challenge';
      filterId = 'film-35mm';
      layoutId = 'film-strip';
      countdown = 4;
      title = '35mm Darkroom Challenge';
      description = 'Analog film strip perforations with creative vintage pose prompts.';
    } else if (moodKey.includes('fun') || moodKey.includes('playful')) {
      themeId = 'playful-booth';
      modeId = 'pose-challenge';
      filterId = 'pastel-peach';
      layoutId = 'grid-2x2';
      countdown = 3;
      title = 'Playful Pop Session';
      description = 'Upbeat energy, colorful pastels, and interactive pose challenges.';
    }

    return {
      themeId,
      modeId,
      filterId,
      layoutId,
      countdown,
      photoCount,
      mood,
      title,
      description,
    };
  }

  static analyzePhotoLocally(imageElementOrCanvas) {
    return {
      recommendedFilter: 'warm-vintage',
      suggestedAspect: '4:5',
      compositionTip: 'Rule of thirds: Center your subject or align with the upper third line.',
      brightnessAssessment: 'Optimal lighting detected.',
    };
  }
}
