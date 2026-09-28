
export const EXPORT_FORMATS = {
  PNG: {
    id: 'png',
    name: 'PNG (Lossless)',
    extension: '.png',
    mimeType: 'image/png',
    type: 'static',
    supportsTransparency: true,
    supportsQuality: false,
    description: 'Crisp, lossless image with transparent background support.',
  },
  JPEG: {
    id: 'jpeg',
    name: 'JPEG (Photo)',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    type: 'static',
    supportsTransparency: false,
    supportsQuality: true,
    description: 'Compact photo file with adjustable compression quality.',
  },
  WEBP: {
    id: 'webp',
    name: 'WebP (Modern)',
    extension: '.webp',
    mimeType: 'image/webp',
    type: 'static',
    supportsTransparency: true,
    supportsQuality: true,
    description: 'Modern web image format with high compression and transparency.',
  },
  GIF: {
    id: 'gif',
    name: 'Animated GIF',
    extension: '.gif',
    mimeType: 'image/gif',
    type: 'animated',
    supportsTransparency: false,
    supportsQuality: true,
    description: 'Looping animated GIF with animated stickers and photo effects.',
  },
  WEBM: {
    id: 'webm',
    name: 'WebM Video',
    extension: '.webm',
    mimeType: 'video/webm',
    type: 'video',
    supportsTransparency: false,
    supportsQuality: false,
    description: 'High-definition animated video clip for web and desktop.',
  },
  MP4: {
    id: 'mp4',
    name: 'MP4 Video',
    extension: '.mp4',
    mimeType: 'video/mp4',
    type: 'video',
    supportsTransparency: false,
    supportsQuality: false,
    description: 'Universally compatible video clip for social media and mobile.',
  },
};

export const RESOLUTION_PRESETS = [
  {
    id: 'standard',
    name: 'Standard (0.75×)',
    scale: 0.75,
    tagline: 'Fast share & lightweight messaging',
    badge: 'Fast',
  },
  {
    id: 'original',
    name: 'Original (1×)',
    scale: 1.0,
    tagline: 'Standard photobooth studio resolution',
    badge: 'Studio',
  },
  {
    id: 'high',
    name: 'High (1.5×)',
    scale: 1.5,
    tagline: 'Crisp retina & sharp screen displays',
    badge: 'Retina',
  },
  {
    id: 'ultra',
    name: 'Ultra (2.0× / 300 DPI)',
    scale: 2.0,
    tagline: 'Print-ready 300 DPI high-definition output',
    badge: '300 DPI',
  },
  {
    id: 'custom',
    name: 'Custom Dimensions',
    scale: null,
    tagline: 'Specify exact pixel width and height',
    badge: 'Custom',
  },
];

export const EXPORT_PRESETS = [
  {
    id: 'quick_share',
    name: '⚡ Quick Share',
    format: 'webp',
    fallbackFormat: 'jpeg',
    resolution: 'standard',
    quality: 0.8,
    transparentBg: false,
    description: 'Optimized for instant messaging and lightweight file size.',
  },
  {
    id: 'high_quality',
    name: '✨ High Quality',
    format: 'png',
    resolution: 'high',
    quality: 0.95,
    transparentBg: false,
    description: 'Maximum visual clarity and crisp detail for screens.',
  },
  {
    id: 'web_social',
    name: '🌐 Web / Social',
    format: 'jpeg',
    resolution: 'high',
    quality: 0.88,
    transparentBg: false,
    description: 'Balanced file size and high fidelity for Instagram & feeds.',
  },
  {
    id: 'print_ready',
    name: '🖨️ Print Ready',
    format: 'png',
    resolution: 'ultra',
    quality: 1.0,
    transparentBg: false,
    description: 'Ultra high-definition raster print canvas at 300 DPI intent.',
  },
];

export class ExportCapabilityDetector {
  static isWebPSupported() {
    if (typeof document === 'undefined') return true;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  static isWebMSupported() {
    if (typeof window === 'undefined' || !window.MediaRecorder) return false;
    return MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
           MediaRecorder.isTypeSupported('video/webm');
  }

  static isMP4Supported() {
    if (typeof window === 'undefined' || !window.MediaRecorder) return false;
    return MediaRecorder.isTypeSupported('video/mp4') ||
           MediaRecorder.isTypeSupported('video/mp4;codecs=avc1');
  }

  static isClipboardItemSupported() {
    return typeof navigator !== 'undefined' &&
           !!navigator.clipboard &&
           typeof navigator.clipboard.write === 'function' &&
           typeof window !== 'undefined' &&
           'ClipboardItem' in window;
  }

  static isWebShareSupported() {
    return typeof navigator !== 'undefined' &&
           typeof navigator.share === 'function';
  }

  static isCanShareFilesSupported() {
    return typeof navigator !== 'undefined' &&
           typeof navigator.canShare === 'function';
  }

  static isFileSystemAccessSupported() {
    return typeof window !== 'undefined' &&
           'showSaveFilePicker' in window;
  }

  static getSupportedFormats() {
    const list = [EXPORT_FORMATS.PNG, EXPORT_FORMATS.JPEG];
    if (this.isWebPSupported()) list.push(EXPORT_FORMATS.WEBP);
    list.push(EXPORT_FORMATS.GIF);
    if (this.isWebMSupported()) list.push(EXPORT_FORMATS.WEBM);
    if (this.isMP4Supported()) list.push(EXPORT_FORMATS.MP4);
    return list;
  }

  static estimateFileSizeMB(width, height, formatId, quality = 0.85, isAnimated = false, frameCount = 1) {
    const pixels = width * height;
    if (isAnimated || formatId === 'gif') {
      const frames = frameCount || 10;

      const bytes = pixels * 0.5 * frames * (quality * 0.8 + 0.2);
      return Math.max(0.1, Math.round((bytes / (1024 * 1024)) * 10) / 10);
    }

    if (formatId === 'video' || formatId === 'webm' || formatId === 'mp4') {

      const durationSec = 2.5;
      const bytes = (4000000 / 8) * durationSec;
      return Math.max(0.2, Math.round((bytes / (1024 * 1024)) * 10) / 10);
    }

    if (formatId === 'png') {

      const bytes = pixels * 2.2;
      return Math.max(0.1, Math.round((bytes / (1024 * 1024)) * 10) / 10);
    }

    if (formatId === 'webp') {

      const bytes = pixels * 0.4 * (quality * 0.9 + 0.1);
      return Math.max(0.05, Math.round((bytes / (1024 * 1024)) * 10) / 10);
    }

    const bytes = pixels * 0.6 * (quality * 0.9 + 0.1);
    return Math.max(0.05, Math.round((bytes / (1024 * 1024)) * 10) / 10);
  }
}
