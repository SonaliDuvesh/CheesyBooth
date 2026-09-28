
import { DownloadManager } from './downloadManager.js';

export class VideoExporter {
  static getSupportedVideoMimeTypes() {
    if (typeof window === 'undefined' || !window.MediaRecorder) return [];
    const candidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ];
    return candidates.filter(type => MediaRecorder.isTypeSupported(type));
  }

  static getBestMimeType(preferredFormat = 'webm') {
    if (typeof window === 'undefined' || !window.MediaRecorder) return 'video/webm';

    if (preferredFormat === 'mp4') {
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) return 'video/mp4;codecs=avc1';
      if (MediaRecorder.isTypeSupported('video/mp4')) return 'video/mp4';
    }

    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) return 'video/webm;codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/webm')) return 'video/webm';
    if (MediaRecorder.isTypeSupported('video/mp4')) return 'video/mp4';
    return 'video/webm';
  }

  static async exportVideo(canvas, {
    durationMs = 2500,
    fps = 30,
    preferredFormat = 'webm',
    onProgress,
    cancellationToken,
  } = {}) {
    if (!canvas || !canvas.captureStream || typeof window === 'undefined' || !window.MediaRecorder) {
      throw new Error('MediaRecorder or Canvas captureStream not supported in this browser.');
    }

    const stream = canvas.captureStream(fps);
    const mimeType = this.getBestMimeType(preferredFormat);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 4500000, 
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      let progressInterval = null;
      let durationTimeout = null;
      const startTime = Date.now();

      const cleanup = () => {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        if (durationTimeout) {
          clearTimeout(durationTimeout);
          durationTimeout = null;
        }
        try {
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {}
      };

      mediaRecorder.onstop = () => {
        cleanup();
        if (cancellationToken && cancellationToken.isCancelled) {
          reject(new Error('Export was cancelled.'));
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        resolve({ blob, mimeType });
      };

      mediaRecorder.onerror = (e) => {
        cleanup();
        reject(e);
      };

      if (onProgress) {
        progressInterval = setInterval(() => {
          if (cancellationToken && cancellationToken.isCancelled) {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            return;
          }
          const elapsed = Date.now() - startTime;
          const percent = Math.min(98, Math.round((elapsed / durationMs) * 100));
          onProgress(percent);
        }, 100);
      }

      mediaRecorder.start(250); 

      durationTimeout = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, durationMs);
    });
  }

  static async downloadVideo(blob, filename = 'pocket-booth-clip.webm') {
    return await DownloadManager.downloadBlob(blob, filename, { mimeType: blob.type });
  }
}
