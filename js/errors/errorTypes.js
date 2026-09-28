
export const ErrorCategory = {
  CAMERA: 'CAMERA',
  PERMISSION: 'PERMISSION',
  STORAGE: 'STORAGE',
  IMAGE: 'IMAGE',
  RENDER: 'RENDER',
  EXPORT: 'EXPORT',
  PRINT: 'PRINT',
  NETWORK: 'NETWORK',
  PWA: 'PWA',
  VALIDATION: 'VALIDATION',
  SESSION: 'SESSION',
  CLIPBOARD: 'CLIPBOARD',
  SHARE: 'SHARE',
  UNKNOWN: 'UNKNOWN',
};

export const ErrorSeverity = {
  INFO: 'INFO',       
  WARNING: 'WARNING', 
  ERROR: 'ERROR',     
  FATAL: 'FATAL',     
};

export class AppError extends Error {

  constructor({
    message,
    category = ErrorCategory.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    userMessage,
    actionLabel,
    action,
    recoverable = true,
    cause,
    context = {},
  } = {}) {
    super(message || userMessage || 'An unexpected error occurred.');
    this.name = 'AppError';
    this.category = category;
    this.severity = severity;
    this.userMessage = userMessage || this.message;
    this.actionLabel = actionLabel;
    this.action = action;
    this.recoverable = recoverable;
    this.cause = cause;
    this.context = context;
    this.timestamp = Date.now();
  }
}
