
import { getFilterCSS } from '../filters/filterPresets.js';
import { performanceManager } from './performanceManager.js';
import { imageCache } from './imageCache.js';

export class FilterCache {
  constructor(maxEntries = 24) {
    this.maxEntries = maxEntries;
    this.cache = new Map(); 
  }

  _makeKey(sourceKey, filterId, intensity, targetWidth, targetHeight) {
    const roundedIntensity = Math.round(intensity || 80);
    return `${sourceKey}_${filterId || 'none'}_${roundedIntensity}_${targetWidth || 0}x${targetHeight || 0}`;
  }

  async getFilteredImage(photo, filterId, intensity = 80, targetWidth = 0, targetHeight = 0) {
    if (!photo || !photo.imageData) return null;

    if (!filterId || filterId === 'original') {
      return await imageCache.load(photo.imageData);
    }

    const sourceKey = photo.id || (photo.imageData.length > 64 ? photo.imageData.substring(0, 64) : photo.imageData);
    const key = this._makeKey(sourceKey, filterId, intensity, targetWidth, targetHeight);

    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      entry.lastUsed = Date.now();

      this.cache.delete(key);
      this.cache.set(key, entry);
      performanceManager.recordFilterHit();
      return entry.canvas;
    }

    performanceManager.recordFilterMiss();

    const img = await imageCache.load(photo.imageData);
    const srcW = targetWidth > 0 ? targetWidth : (img.naturalWidth || img.width || 1200);
    const srcH = targetHeight > 0 ? targetHeight : (img.naturalHeight || img.height || 960);

    const canvas = document.createElement('canvas');
    canvas.width = srcW;
    canvas.height = srcH;
    const ctx = canvas.getContext('2d');

    ctx.filter = getFilterCSS(filterId, intensity);
    ctx.drawImage(img, 0, 0, srcW, srcH);
    ctx.filter = 'none';

    while (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      const oldEntry = this.cache.get(oldestKey);
      if (oldEntry && oldEntry.canvas) {
        oldEntry.canvas.width = 1;
        oldEntry.canvas.height = 1;
      }
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      canvas,
      width: srcW,
      height: srcH,
      lastUsed: Date.now(),
    });

    return canvas;
  }

  invalidatePhoto(photoId) {
    if (!photoId) return;
    for (const key of this.cache.keys()) {
      if (key.startsWith(photoId)) {
        const entry = this.cache.get(key);
        if (entry && entry.canvas) {
          entry.canvas.width = 1;
          entry.canvas.height = 1;
        }
        this.cache.delete(key);
      }
    }
  }

  clear() {
    for (const entry of this.cache.values()) {
      if (entry && entry.canvas) {
        entry.canvas.width = 1;
        entry.canvas.height = 1;
      }
    }
    this.cache.clear();
  }
}

export const filterCache = new FilterCache(24);
