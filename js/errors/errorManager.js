
import { AppError, ErrorCategory, ErrorSeverity } from './errorTypes.js';
import { classifyError } from './errorMessages.js';

export class ErrorManager {
  constructor() {
    this.errorLog = [];
    this.maxLogs = 20;
    this.listeners = new Set();
    this.isGlobalInitialized = false;
  }

  initGlobalHandlers() {
    if (this.isGlobalInitialized || typeof window === 'undefined') return;
    this.isGlobalInitialized = true;

    window.addEventListener('error', (event) => {

      if (!event.error && !event.message) return;
      const error = event.error || new Error(event.message || 'Unknown script error');
      this.handle(error, {
        operation: 'global_script_error',
        severity: ErrorSeverity.ERROR,
        source: event.filename,
        lineno: event.lineno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason || new Error('Unhandled Promise rejection');
      this.handle(reason, {
        operation: 'unhandled_promise_rejection',
        severity: ErrorSeverity.ERROR,
      });
    });
  }

  handle(rawError, context = {}) {
    let appError;

    if (rawError instanceof AppError) {
      appError = rawError;
    } else {
      const classified = classifyError(rawError, context.category || ErrorCategory.UNKNOWN);
      appError = new AppError({
        message: rawError?.message || 'Error occurred',
        category: context.category || classified.category,
        severity: context.severity || classified.severity || ErrorSeverity.ERROR,
        userMessage: context.userMessage || classified.userMessage,
        actionLabel: context.actionLabel !== undefined ? context.actionLabel : classified.actionLabel,
        action: context.action,
        recoverable: context.recoverable !== false,
        cause: rawError,
        context: this._sanitizeContext(context),
      });
    }

    this._recordError(appError);
    this._logDevNotice(appError);
    this._notifyListeners(appError);

    return appError;
  }

  _sanitizeContext(context) {
    const safe = {};
    for (const [k, v] of Object.entries(context || {})) {
      if (k === 'imageData' || k === 'blob' || k === 'frames' || k === 'photos') {
        safe[k] = '[Binary/Photo Data Removed]';
      } else if (typeof v === 'string' && (v.startsWith('data:') || v.startsWith('blob:'))) {
        safe[k] = '[Data URL Removed]';
      } else if (typeof v === 'function') {
        safe[k] = '[Function]';
      } else {
        safe[k] = v;
      }
    }
    return safe;
  }

  _recordError(appError) {
    this.errorLog.push({
      timestamp: appError.timestamp,
      name: appError.name,
      category: appError.category,
      severity: appError.severity,
      userMessage: appError.userMessage,
      internalMessage: appError.message,
      context: appError.context,
    });
    if (this.errorLog.length > this.maxLogs) {
      this.errorLog.shift();
    }
  }

  _logDevNotice(appError) {
    if (appError.severity === ErrorSeverity.INFO) return;
    const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isDev) {
      console.warn(`[SayCheese Error] [${appError.category}] ${appError.userMessage}`, {
        raw: appError.cause || appError.message,
        context: appError.context,
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notifyListeners(appError) {
    for (const listener of this.listeners) {
      try {
        listener(appError);
      } catch (err) {
        console.error('Error in errorManager listener:', err);
      }
    }
  }

  async wrapAsync(operationName, fn, fallbackValue = null, options = {}) {
    try {
      return await fn();
    } catch (err) {
      this.handle(err, { operation: operationName, ...options });
      return fallbackValue;
    }
  }

  getRecentErrors() {
    return [...this.errorLog];
  }

  clearErrors() {
    this.errorLog = [];
  }
}

export const errorManager = new ErrorManager();

if (typeof window !== 'undefined') {
  window.__sayCheeseErrors = errorManager;
}
