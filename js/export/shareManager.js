
export class ShareManager {
  static isAvailable() {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  static canShareFile(file) {
    if (!this.isAvailable()) return false;
    if (typeof navigator.canShare !== 'function') return true;
    try {
      return navigator.canShare({ files: [file] });
    } catch (e) {
      return false;
    }
  }

  static async shareBlob(blob, filename, { title = 'CheesyBooth Photobooth Print', text = 'Captured with CheesyBooth ✨' } = {}) {
    if (!this.isAvailable()) {
      throw new Error('Web Share API is not supported on this device/browser.');
    }

    try {
      const file = new File([blob], filename, {
        type: blob.type || 'image/png',
        lastModified: Date.now(),
      });

      if (navigator.canShare && !navigator.canShare({ files: [file] })) {

        await navigator.share({ title, text });
        return { success: true, mode: 'text_only' };
      }

      await navigator.share({
        files: [file],
        title,
        text,
      });

      return { success: true, mode: 'file' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      throw err;
    }
  }
}
