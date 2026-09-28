
import { SECRET_STICKERS } from '../easterEggs/easterEggRegistry.js';

export const STICKER_PACKS = [
  {
    id: 'cute',
    name: 'Cute & Aesthetic',
    icon: '✨',
    stickers: [
      { emoji: '✨', label: 'Sparkles' },
      { emoji: '❤️', label: 'Heart' },
      { emoji: '💖', label: 'Sparkling Heart' },
      { emoji: '🎀', label: 'Ribbon' },
      { emoji: '🌸', label: 'Cherry Blossom' },
      { emoji: '⭐️', label: 'Star' },
      { emoji: '🧸', label: 'Teddy Bear' },
      { emoji: '🍓', label: 'Strawberry' },
      { emoji: '🍀', label: 'Four Leaf Clover' },
      { emoji: '🦋', label: 'Butterfly' },
      { emoji: '💌', label: 'Love Letter' },
      { emoji: '🎈', label: 'Balloon' },
      { emoji: '🌼', label: 'Daisy' },
      { emoji: '🧁', label: 'Cupcake' },
    ],
  },
  {
    id: 'animals',
    name: 'Sweet Animals',
    icon: '🐱',
    stickers: [
      { emoji: '🐱', label: 'Cat' },
      { emoji: '🐰', label: 'Bunny' },
      { emoji: '🐻', label: 'Bear' },
      { emoji: '🐶', label: 'Dog' },
      { emoji: '🐸', label: 'Frog' },
      { emoji: '🐼', label: 'Panda' },
      { emoji: '🦊', label: 'Fox' },
      { emoji: '🐥', label: 'Chick' },
      { emoji: '🦄', label: 'Unicorn' },
      { emoji: '🐾', label: 'Paws' },
    ],
  },
  {
    id: 'food',
    name: 'Cafe & Sweet Treats',
    icon: '☕',
    stickers: [
      { emoji: '☕', label: 'Coffee' },
      { emoji: '🍒', label: 'Cherries' },
      { emoji: '🎂', label: 'Birthday Cake' },
      { emoji: '🍪', label: 'Cookie' },
      { emoji: '🍦', label: 'Soft Serve Ice Cream' },
      { emoji: '🍩', label: 'Donut' },
      { emoji: '🧋', label: 'Boba Milk Tea' },
      { emoji: '🍕', label: 'Pizza' },
      { emoji: '🥐', label: 'Croissant' },
      { emoji: '🍑', label: 'Peach' },
    ],
  },
  {
    id: 'doodles',
    name: 'Doodles & Retro',
    icon: '✦',
    stickers: [
      { emoji: '✦', label: 'Four-Point Star' },
      { emoji: '★', label: 'Solid Star' },
      { emoji: '〰️', label: 'Wavy Line' },
      { emoji: '➳', label: 'Cute Arrow' },
      { emoji: '💬', label: 'Speech Bubble' },
      { emoji: '⚡', label: 'Flash Bolt' },
      { emoji: '🎞️', label: 'Film Strip' },
      { emoji: '📸', label: 'Vintage Camera' },
      { emoji: '✌️', label: 'Peace Sign' },
      { emoji: '💫', label: 'Dizzy Star' },
    ],
  },
  {
    id: 'party',
    name: 'Party & Celebration',
    icon: '🎉',
    stickers: [
      { emoji: '🎉', label: 'Party Popper' },
      { emoji: '🥳', label: 'Party Face' },
      { emoji: '🎁', label: 'Gift Box' },
      { emoji: '💐', label: 'Bouquet' },
      { emoji: '🎃', label: 'Jack-o-Lantern' },
      { emoji: '🎄', label: 'Holiday Tree' },
      { emoji: '🍾', label: 'Champagne' },
      { emoji: '🥂', label: 'Glasses Clink' },
    ],
  },
];

export function getSecretStickerPack() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('say_cheese_easter_eggs');
      const discoveredIds = raw ? JSON.parse(raw) : [];
      const unlocked = SECRET_STICKERS.filter(s => discoveredIds.includes(s.secretId));
      if (unlocked.length > 0) {
        return {
          id: 'secret_vault',
          name: '✦ Secret Vault',
          icon: '✨',
          stickers: unlocked,
        };
      }
    }
  } catch (e) {}
  return null;
}

export function getAllBuiltInStickers() {
  const list = [];
  const allPacks = [...STICKER_PACKS];
  const secretPack = getSecretStickerPack();
  if (secretPack) allPacks.push(secretPack);

  for (const pack of allPacks) {
    for (const item of pack.stickers) {
      list.push({ ...item, packId: pack.id, packName: pack.name });
    }
  }
  return list;
}

export function getRandomSticker() {
  const all = getAllBuiltInStickers();
  return all[Math.floor(Math.random() * all.length)];
}

const STORAGE_KEY_FAVS = 'saycheese_sticker_favs';
const STORAGE_KEY_RECENTS = 'saycheese_sticker_recents';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isFavorite(emojiOrSource) {
  const favs = getFavorites();
  return favs.some((f) => f.emoji === emojiOrSource || f.imgSrc === emojiOrSource || f.label === emojiOrSource);
}

export function toggleFavorite(stickerItem) {
  const favs = getFavorites();
  const key = stickerItem.emoji || stickerItem.imgSrc || stickerItem.label;
  const idx = favs.findIndex((f) => f.emoji === key || f.imgSrc === key || f.label === key);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push({
      emoji: stickerItem.emoji || '✨',
      label: stickerItem.label || stickerItem.emoji || 'Sticker',
      imgSrc: stickerItem.imgSrc || null,
      type: stickerItem.type || (stickerItem.imgSrc ? 'image' : 'emoji'),
    });
  }
  try {
    localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favs));
  } catch (e) {}
  return idx === -1;
}

export function getRecents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addRecent(stickerItem) {
  const recents = getRecents();
  const key = stickerItem.emoji || stickerItem.imgSrc || stickerItem.label;
  const filtered = recents.filter((r) => r.emoji !== key && r.imgSrc !== key);
  filtered.unshift({
    emoji: stickerItem.emoji || '✨',
    label: stickerItem.label || stickerItem.emoji || 'Sticker',
    imgSrc: stickerItem.imgSrc || null,
    type: stickerItem.type || (stickerItem.imgSrc ? 'image' : 'emoji'),
  });
  if (filtered.length > 16) filtered.pop();
  try {
    localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(filtered));
  } catch (e) {}
}

export function searchStickers(query) {
  if (!query || !query.trim()) return getAllBuiltInStickers();
  const q = query.toLowerCase().trim();
  const all = getAllBuiltInStickers();
  return all.filter((s) => {
    return (s.label && s.label.toLowerCase().includes(q)) ||
           (s.emoji && s.emoji.includes(q)) ||
           (s.packName && s.packName.toLowerCase().includes(q));
  });
}
