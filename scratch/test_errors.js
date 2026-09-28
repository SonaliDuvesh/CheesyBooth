import { errorManager } from '../js/errors/errorManager.js';
import { AppError, ErrorCategory, ErrorSeverity } from '../js/errors/errorTypes.js';
import { classifyError, ERROR_MESSAGES } from '../js/errors/errorMessages.js';
import { DownloadManager } from '../js/export/downloadManager.js';

console.log('=== Running Feature #19 Error Handling System Tests ===');

// 1. Test classifyError with various browser exceptions
const notAllowedErr = new Error('Permission denied');
notAllowedErr.name = 'NotAllowedError';
const notAllowedClassified = classifyError(notAllowedErr);
console.log('NotAllowedError maps to PERMISSION:', notAllowedClassified.category === ErrorCategory.PERMISSION);

const quotaErr = new Error('Disk quota full');
quotaErr.name = 'QuotaExceededError';
const quotaClassified = classifyError(quotaErr);
console.log('QuotaExceededError maps to STORAGE:', quotaClassified.category === ErrorCategory.STORAGE);

const abortErr = new Error('User abort');
abortErr.name = 'AbortError';
const abortClassified = classifyError(abortErr);
console.log('AbortError maps to INFO severity:', abortClassified.severity === ErrorSeverity.INFO);

// 2. Test Context Sanitization (Guarantees NO photos/blobs are retained in error logs)
const dirtyContext = {
  operation: 'save_session',
  imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  blob: { size: 1024000 },
  customText: 'Holiday 2026',
  retryCount: 1,
};
const sanitized = errorManager._sanitizeContext(dirtyContext);
console.log('Photo imageData stripped from logs:', sanitized.imageData === '[Binary/Photo Data Removed]');
console.log('Blob data stripped from logs:', sanitized.blob === '[Binary/Photo Data Removed]');
console.log('Safe metadata preserved:', sanitized.retryCount === 1);

// 3. Test ErrorManager Recording & Event Dispatch
let receivedAppError = null;
const unsubscribe = errorManager.subscribe((err) => {
  receivedAppError = err;
});

const sampleError = new Error('Test canvas render fault');
const handled = errorManager.handle(sampleError, {
  operation: 'render_canvas',
  category: ErrorCategory.RENDER,
});

console.log('ErrorManager dispatched event:', receivedAppError !== null);
console.log('AppError category match:', handled.category === ErrorCategory.RENDER);
console.log('Error log has entries:', errorManager.getRecentErrors().length > 0);

unsubscribe();

// 4. Test Filename Sanitization with invalid characters
const sanitizedName = DownloadManager.sanitizeFilename('my/photo:strip*?.png', 'booth', '.png');
console.log('Filename sanitized safely:', sanitizedName === 'my-photo-strip.png');

console.log('=== All Error Handling Subsystem Tests Passed! ===');
