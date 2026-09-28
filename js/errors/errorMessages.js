
import { ErrorCategory, ErrorSeverity } from './errorTypes.js';

export const ERROR_MESSAGES = {

  CAMERA_PERMISSION_DENIED: {
    userMessage: 'Camera access was blocked. Please enable camera permission in your browser settings to take photos.',
    actionLabel: 'Try Again',
    category: ErrorCategory.PERMISSION,
  },
  CAMERA_NOT_FOUND: {
    userMessage: 'No camera hardware was detected on this device. You can use the animated Demo Mode instead.',
    actionLabel: 'Use Demo Mode',
    category: ErrorCategory.CAMERA,
  },
  CAMERA_BUSY: {
    userMessage: 'The camera is currently in use by another application. Close other video apps and try again.',
    actionLabel: 'Try Again',
    category: ErrorCategory.CAMERA,
  },
  CAMERA_TIMEOUT: {
    userMessage: 'Camera initialization took longer than expected. Tap Retry or switch to Demo Mode.',
    actionLabel: 'Retry Camera',
    category: ErrorCategory.CAMERA,
  },
  CAMERA_STREAM_ENDED: {
    userMessage: 'The camera connection was interrupted. Reconnecting...',
    actionLabel: 'Restart Camera',
    category: ErrorCategory.CAMERA,
  },
  CAPTURE_FAILED: {
    userMessage: 'We couldn’t capture that photo. Your session is safe-tap shutter to try again.',
    actionLabel: 'Retake',
    category: ErrorCategory.CAMERA,
  },

  STORAGE_QUOTA_EXCEEDED: {
    userMessage: 'Device storage is almost full. Your current session is open, but saving backups is temporarily paused.',
    actionLabel: 'Manage Storage',
    category: ErrorCategory.STORAGE,
  },
  STORAGE_WRITE_FAILED: {
    userMessage: 'We couldn’t save your changes to local storage. Your current photo strip is still in memory.',
    actionLabel: 'Save Backup',
    category: ErrorCategory.STORAGE,
  },
  RECOVERY_CORRUPTED: {
    userMessage: 'The saved recovery session was incomplete or corrupted. Starting fresh...',
    actionLabel: 'Start Fresh',
    category: ErrorCategory.STORAGE,
  },
  IMPORT_INVALID_FILE: {
    userMessage: 'This file is not a valid Say Cheese backup or project format.',
    actionLabel: 'Choose Another File',
    category: ErrorCategory.VALIDATION,
  },

  IMAGE_DECODE_FAILED: {
    userMessage: 'This image could not be loaded. The format may be unsupported or the file is corrupted.',
    actionLabel: 'Choose Another',
    category: ErrorCategory.IMAGE,
  },
  IMAGE_TOO_LARGE: {
    userMessage: 'This photo exceeds the maximum recommended resolution for browser editing.',
    actionLabel: 'Try Smaller Image',
    category: ErrorCategory.IMAGE,
  },
  STICKER_LOAD_FAILED: {
    userMessage: 'We couldn’t load this sticker. The rest of your collage is completely safe.',
    actionLabel: 'Dismiss',
    category: ErrorCategory.IMAGE,
  },

  EXPORT_RENDER_FAILED: {
    userMessage: 'The selected resolution was too large for this device’s memory. Try High or Balanced resolution.',
    actionLabel: 'Adjust Settings',
    category: ErrorCategory.EXPORT,
  },
  EXPORT_FORMAT_UNSUPPORTED: {
    userMessage: 'This export format is not supported by your current browser. Try PNG or JPEG instead.',
    actionLabel: 'Switch to PNG',
    category: ErrorCategory.EXPORT,
  },
  DOWNLOAD_BLOCKED: {
    userMessage: 'Your browser prevented the download. Check your download permissions or use Share.',
    actionLabel: 'Share Instead',
    category: ErrorCategory.EXPORT,
  },
  CLIPBOARD_FAILED: {
    userMessage: 'Direct clipboard copy was blocked by the browser. Use Download Image instead.',
    actionLabel: 'Download Image',
    category: ErrorCategory.CLIPBOARD,
  },
  PRINT_UNSUPPORTED: {
    userMessage: 'Direct printing is not supported in this browser. You can save a high-res print sheet file (PNG) instead.',
    actionLabel: 'Save Print File',
    category: ErrorCategory.PRINT,
  },

  UNEXPECTED_ERROR: {
    userMessage: 'Something went wrong, but your work has been preserved in memory.',
    actionLabel: 'Dismiss',
    category: ErrorCategory.UNKNOWN,
  },
};

export function classifyError(error, fallbackCategory = ErrorCategory.UNKNOWN) {
  if (!error) {
    return { ...ERROR_MESSAGES.UNEXPECTED_ERROR };
  }

  const errName = error.name || '';
  const errMsg = (error.message || '').toLowerCase();

  if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errMsg.includes('permission denied')) {
    return { ...ERROR_MESSAGES.CAMERA_PERMISSION_DENIED };
  }
  if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError' || errMsg.includes('device not found')) {
    return { ...ERROR_MESSAGES.CAMERA_NOT_FOUND };
  }
  if (errName === 'NotReadableError' || errName === 'TrackStartError' || errMsg.includes('concurrently') || errMsg.includes('busy')) {
    return { ...ERROR_MESSAGES.CAMERA_BUSY };
  }
  if (errName === 'TimeoutError' || errMsg.includes('timeout')) {
    return { ...ERROR_MESSAGES.CAMERA_TIMEOUT };
  }

  if (errName === 'QuotaExceededError' || errName === 'NS_ERROR_DOM_QUOTA_REACHED' || errMsg.includes('quota')) {
    return { ...ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED };
  }

  if (errName === 'NotAllowedError' && errMsg.includes('clipboard')) {
    return { ...ERROR_MESSAGES.CLIPBOARD_FAILED };
  }
  if (errName === 'AbortError' || errMsg.includes('cancelled') || errMsg.includes('canceled') || errMsg.includes('aborted')) {
    return {
      userMessage: 'Operation was cancelled.',
      actionLabel: null,
      category: ErrorCategory.SHARE,
      severity: ErrorSeverity.INFO,
    };
  }

  if (errMsg.includes('out of memory') || errMsg.includes('allocation size') || errMsg.includes('canvas area')) {
    return { ...ERROR_MESSAGES.EXPORT_RENDER_FAILED };
  }

  if (fallbackCategory === ErrorCategory.EXPORT) {
    return { ...ERROR_MESSAGES.EXPORT_RENDER_FAILED };
  }
  if (fallbackCategory === ErrorCategory.PRINT) {
    return { ...ERROR_MESSAGES.PRINT_UNSUPPORTED };
  }
  if (fallbackCategory === ErrorCategory.IMAGE) {
    return { ...ERROR_MESSAGES.IMAGE_DECODE_FAILED };
  }

  return { ...ERROR_MESSAGES.UNEXPECTED_ERROR, userMessage: error.userMessage || ERROR_MESSAGES.UNEXPECTED_ERROR.userMessage };
}
