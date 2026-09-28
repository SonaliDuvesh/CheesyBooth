
import { performanceManager } from './performanceManager.js';

export class ImageCache {
  constructor(maxItems = 32) {
    this.maxItems = maxItems;
    this.cache = new Map(); 
    this.pendingPromises = new Map();
    this.objectUrls = new Set();
  }

  async load(src) {
    if (src && typeof src === 'object') {
      src = src.imageData || src.dataUrl || src.url || src.src;
    }
    if (!src || typeof src !== 'string') {
      throw new Error('Invalid image source passed to ImageCache');
    }

    if (this.cache.has(src)) {
      const entry = this.cache.get(src);
      entry.lastUsed = Date.now();

      this.cache.delete(src);
      this.cache.set(src, entry);
      performanceManager.recordImageHit();
      return entry.image;
    }

    if (this.pendingPromises.has(src)) {
      return this.pendingPromises.get(src);
    }

    performanceManager.recordImageMiss();

    const promise = this._fetchAndDecode(src)
      .then((img) => {
        this.pendingPromises.delete(src);
        this._put(src, img);
        return img;
      })
      .catch((err) => {
        this.pendingPromises.delete(src);
        throw err;
      });

    this.pendingPromises.set(src, promise);
    return promise;
  }

  async _fetchAndDecode(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode()
            .then(() => resolve(img))
            .catch(() => resolve(img)); 
        } else {
          resolve(img);
        }
      };
      img.onerror = (e) => reject(new Error(`Failed to load image from source: ${src.substring(0, 40)}...`));
      img.src = src;
    });
  }

  _put(src, image) {
    const width = image.naturalWidth || image.width || 800;
    const height = image.naturalHeight || image.height || 600;
    const bytes = width * height * 4; 

    while (this.cache.size >= this.maxItems) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(src, {
      image,
      width,
      height,
      bytes,
      lastUsed: Date.now(),
    });
  }

  async createThumbnail(photoDataUrl, maxDimension = 320, quality = 0.85) {
    const img = await this.load(photoDataUrl);
    const origW = img.naturalWidth || img.width || 1200;
    const origH = img.naturalHeight || img.height || 960;

    let targetW = origW;
    let targetH = origH;
    const maxDim = Math.max(origW, origH);

    if (maxDim > maxDimension) {
      const scale = maxDimension / maxDim;
      targetW = Math.round(origW * scale);
      targetH = Math.round(origH * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const thumbUrl = canvas.toDataURL('image/jpeg', quality);

    canvas.width = 1;
    canvas.height = 1;
    return thumbUrl;
  }

  createManagedURL(blob) {
    if (!blob || typeof URL === 'undefined' || !URL.createObjectURL) return '';
    const url = URL.createObjectURL(blob);
    this.objectUrls.add(url);
    return url;
  }

  revokeManagedURL(url) {
    if (!url || typeof URL === 'undefined' || !URL.revokeObjectURL) return;
    if (this.objectUrls.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
      this.objectUrls.delete(url);
    }
  }

  clear() {
    this.cache.clear();
    this.pendingPromises.clear();
    for (const url of this.objectUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    }
    this.objectUrls.clear();
  }
}

export const imageCache = new ImageCache(32);
