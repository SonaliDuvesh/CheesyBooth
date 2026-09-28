
import { storageManager } from '../storage/storageManager.js';
import { preferenceManager } from '../preferences/preferenceManager.js';

export const FILE_LIMITS = {
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, 
  MAX_GIF_SIZE_BYTES: 15 * 1024 * 1024,   
  MAX_DIMENSION: 4096,                    
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

export class PrivacyManager {
  constructor() {
    this.cameraState = 'inactive'; 
  }

  async validateImageFile(file) {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }

    const fileName = file.name || '';
    const lowerName = fileName.toLowerCase();
    const hasValidExt = FILE_LIMITS.ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
    if (!hasValidExt) {
      return {
        valid: false,
        error: `Unsupported file type for "${this.sanitizeText(fileName)}". Please select a JPG, PNG, WebP, or GIF image.`,
      };
    }

    if (file.type && !FILE_LIMITS.ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file format "${this.sanitizeText(file.type)}". Please select a valid photo or GIF.`,
      };
    }

    const isGif = file.type === 'image/gif' || lowerName.endsWith('.gif');
    const maxSize = isGif ? FILE_LIMITS.MAX_GIF_SIZE_BYTES : FILE_LIMITS.MAX_IMAGE_SIZE_BYTES;
    const maxMb = Math.round(maxSize / (1024 * 1024));

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File is too large to process safely in the browser (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${maxMb}MB.`,
      };
    }

    try {
      const dimensions = await this._verifyImageDecodable(file);
      if (dimensions.width > FILE_LIMITS.MAX_DIMENSION || dimensions.height > FILE_LIMITS.MAX_DIMENSION) {
        return {
          valid: false,
          error: `Image dimensions (${dimensions.width}×${dimensions.height}) exceed safe browser limit of ${FILE_LIMITS.MAX_DIMENSION}px.`,
        };
      }
      return { valid: true, isGif, dimensions };
    } catch (decodeErr) {
      return {
        valid: false,
        error: 'Could not decode image. The file may be corrupted or an unsupported format.',
      };
    }
  }

  _verifyImageDecodable(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        URL.revokeObjectURL(url);
        if (width > 0 && height > 0) {
          resolve({ width, height });
        } else {
          reject(new Error('Invalid image dimensions'));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file'));
      };
      img.src = url;
    });
  }

  validateRemoteUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      return { valid: false, error: 'URL cannot be empty.' };
    }

    const trimmed = urlString.trim();
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'Only secure HTTP/HTTPS URLs are allowed.' };
      }
      return { valid: true, cleanUrl: parsed.href };
    } catch (e) {
      return { valid: false, error: 'Please enter a valid web URL (e.g. https://example.com/sticker.png).' };
    }
  }

  sanitizeText(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async getLocalDataSummary() {
    const storageInfo = await storageManager.getStorageBreakdown();
    const prefs = preferenceManager.getAll();

    return {
      photos: {
        sessionCount: storageInfo.sessionCount,
        totalPhotos: storageInfo.totalPhotos,
        description: 'Captured booth photos stored in browser IndexedDB',
      },
      collages: {
        count: storageInfo.collageCount,
        description: 'Custom collage arrangements & memory prints',
      },
      projects: {
        count: storageInfo.projectCount || 0,
        description: 'Saved custom photobooth project prints',
      },
      preferences: {
        displayName: prefs.profile?.displayName || 'Not set',
        boothTitle: prefs.profile?.boothName || 'CheesyBooth',
        theme: prefs.appearance?.theme || 'classic',
        favoritesCount:
          (prefs.favorites?.layouts?.length || 0) +
          (prefs.favorites?.filters?.length || 0) +
          (prefs.favorites?.stickers?.length || 0),
        description: 'Personal booth setup stored in localStorage',
      },
      privacyStatus: {
        cloudUploads: 'Disabled (100% Client-Side)',
        tracking: 'Zero analytics or telemetry',
        microphone: 'Not requested (Audio is local Web Audio)',
        location: 'Not requested',
        storageHealth: storageInfo.storageHealth || 'healthy',
        isInMemory: storageInfo.isInMemory,
        storageEngine: storageInfo.dbEngine,
      },
    };
  }

  async deleteStoredPhotos() {
    await storageManager.clearAllSessions();
    return true;
  }

  async deleteSavedCollages() {
    await storageManager.clearAllCollages();
    return true;
  }

  resetPreferences() {
    preferenceManager.reset();
    return true;
  }

  async clearAllLocalData() {
    await storageManager.clearAllSayCheeseData();
    preferenceManager.reset();
    return true;
  }
}

export const privacyManager = new PrivacyManager();
