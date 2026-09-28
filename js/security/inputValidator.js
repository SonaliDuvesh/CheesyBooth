
import { SECURITY_LIMITS } from './securityLimits.js';

export class InputValidator {

  static validateFile(file, {
    maxSize = SECURITY_LIMITS.MAX_IMAGE_FILE_SIZE,
    allowedMimes = SECURITY_LIMITS.ALLOWED_IMAGE_MIMES,
  } = {}) {
    if (!file || !(file instanceof Blob)) {
      return { valid: false, error: 'No file provided or invalid file object.' };
    }

    if (file.size > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return { valid: false, error: `File is too large (max ${maxMb}MB).` };
    }

    if (file.size === 0) {
      return { valid: false, error: 'File is empty (0 bytes).' };
    }

    if (file.type && allowedMimes && allowedMimes.length > 0) {
      const isAllowed = allowedMimes.some(mime => file.type.toLowerCase() === mime.toLowerCase());
      if (!isAllowed) {
        return { valid: false, error: `Unsupported file format (${file.type}). Supported: JPG, PNG, WebP, GIF.` };
      }
    }

    return { valid: true };
  }

  static validateImageDimensions(width, height) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return { valid: false, error: 'Invalid image dimensions.' };
    }

    if (width > SECURITY_LIMITS.MAX_IMAGE_DIMENSION || height > SECURITY_LIMITS.MAX_IMAGE_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions (${width}x${height}) exceed the maximum allowable size of ${SECURITY_LIMITS.MAX_IMAGE_DIMENSION}px.`,
      };
    }

    const totalPixels = width * height;
    if (totalPixels > SECURITY_LIMITS.MAX_IMAGE_PIXELS) {
      return {
        valid: false,
        error: `Image contains too many pixels (${Math.round(totalPixels / 1_000_000)}MP). Maximum is ${Math.round(SECURITY_LIMITS.MAX_IMAGE_PIXELS / 1_000_000)}MP to prevent memory exhaustion.`,
      };
    }

    return { valid: true };
  }

  static validateUrl(urlStr, {
    allowedProtocols = SECURITY_LIMITS.ALLOWED_IMAGE_PROTOCOLS,
    maxLength = SECURITY_LIMITS.MAX_URL_LENGTH,
  } = {}) {
    if (typeof urlStr !== 'string' || !urlStr.trim()) {
      return { valid: false, error: 'URL is required.' };
    }

    const trimmed = urlStr.trim();
    if (trimmed.length > maxLength) {
      return { valid: false, error: `URL length exceeds maximum limit of ${maxLength} characters.` };
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:text/html') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:')
    ) {
      return { valid: false, error: 'Unsupported or unsafe URL protocol.' };
    }

    try {

      if (lower.startsWith('data:image/')) {
        return { valid: true, protocol: 'data:', url: trimmed };
      }

      if (lower.startsWith('blob:')) {
        return { valid: true, protocol: 'blob:', url: trimmed };
      }

      const parsed = new URL(trimmed);
      if (!allowedProtocols.includes(parsed.protocol)) {
        return { valid: false, error: `Protocol "${parsed.protocol}" is not permitted.` };
      }

      return { valid: true, protocol: parsed.protocol, url: parsed.href };
    } catch (err) {
      return { valid: false, error: 'Malformed URL format.' };
    }
  }

  static validateNumber(value, { min = -Infinity, max = Infinity, fallback = 0, integer = false } = {}) {
    let num = Number(value);
    if (!Number.isFinite(num)) {
      return fallback;
    }
    if (num < min) num = min;
    if (num > max) num = max;
    return integer ? Math.round(num) : num;
  }

  static parseJSONSafely(rawStr, maxSize = SECURITY_LIMITS.MAX_IMPORT_FILE_SIZE) {
    if (typeof rawStr !== 'string') {
      return { success: false, error: 'Input must be a JSON string.' };
    }

    if (rawStr.length > maxSize) {
      return { success: false, error: 'JSON payload exceeds maximum allowed size.' };
    }

    try {
      const parsed = JSON.parse(rawStr);
      return { success: true, data: parsed };
    } catch (err) {
      return { success: false, error: 'Malformed JSON syntax: ' + err.message };
    }
  }
}
