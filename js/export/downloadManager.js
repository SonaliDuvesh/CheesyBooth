
import { storageManager } from '../storage/storageManager.js';

export class DownloadManager {

  static sanitizeFilename(name, defaultBase = 'pocket-booth', extension = '.png') {
    let base = (name || '').trim();
    if (!base) {
      const dateStr = new Date().toISOString().slice(0, 10);
      base = `${defaultBase}-${dateStr}`;
    }

    const ext = extension.startsWith('.') ? extension : `.${extension}`;

    if (base.toLowerCase().endsWith(ext.toLowerCase())) {
      base = base.slice(0, -ext.length);
    }

    base = base.replace(/[/\\:*?"<>|\x00-\x1f\x80-\x9f]/g, '-');

    base = base.replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!base) base = `${defaultBase}-${Date.now()}`;

    base = base.slice(0, 90);

    return `${base}${ext}`;
  }

  static async downloadBlob(blob, filename, { useSaveFilePicker = false, mimeType = 'image/png' } = {}) {
    if (!blob) throw new Error('Cannot download empty blob.');

    if (useSaveFilePicker && typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Say Cheese Export File',
              accept: { [mimeType || blob.type || 'application/octet-stream']: [filename.slice(filename.lastIndexOf('.'))] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { success: true, method: 'filesystem' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, aborted: true };
        }

      }
    }

    const objectUrl = storageManager ? storageManager.createManagedObjectURL(blob) : URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = objectUrl;
    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      if (storageManager) {
        storageManager.revokeManagedObjectURL(objectUrl);
      } else if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(objectUrl);
      }
    }, 1500);

    return { success: true, method: 'anchor' };
  }
}
