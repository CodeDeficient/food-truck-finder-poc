/**
 * Unified Validation Error System
 * 
 * This module provides a standardized approach to validation error handling
 * across the application, including formatting, logging, and client notification.
 */

import { logError, logWarning } from '../logging';
import { toast } from '../../hooks/UseToast';

/**
 * Standard validation error payload structure
 */
export interface ValidationErrorPayload {
  code: string;
  message: string;
  path: string[];
  severity: 'error' | 'warn';
}

/**
 * Extended validation error with additional context
 */
export interface ValidationError extends ValidationErrorPayload {
  id: string;
  timestamp: string;
  context?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Validation error collection for multiple errors
 */
export interface ValidationErrorCollection {
  errors: ValidationError[];
  totalCount: number;
  errorCount: number;
  warningCount: number;
}

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a standardized validation error
 */
export function createValidationError(
  payload: ValidationErrorPayload,
  context?: string,
  userId?: string,
  sessionId?: string
): ValidationError {
  return {
    ...payload,
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    context,
    userId,
    sessionId,
  };
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  const pathStr = error.path.length > 0 ? ` at ${error.path.join('.')}` : '';
  const contextStr = error.context ? ` (${error.context})` : '';
  
  return `${error.message}${pathStr}${contextStr}`;
}

/**
 * Format multiple validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return formatValidationError(errors[0]);
  }
  
  const errorsByCode = errors.reduce((acc, error) => {
    if (!acc[error.code]) {
      acc[error.code] = [];
    }
    acc[error.code].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);
  
  const messages = Object.entries(errorsByCode).map(([code, codeErrors]) => {
    if (codeErrors.length === 1) {
      return formatValidationError(codeErrors[0]);
    }
    return `${code}: ${codeErrors.length} issues found`;
  });
  
  return messages.join('; ');
}

/**
 * Show validation error in client UI (Toast)
 */
export function showValidationErrorToast(error: ValidationError): void {
  const message = formatValidationError(error);
  
  if (error.severity === 'error') {
    toast({
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
      duration: 5000,
    });
  } else {
    toast({
      title: 'Validation Warning',
      description: message,
      variant: 'default',
      duration: 3000,
    });
  }
}

/**
 * Show multiple validation errors in client UI
 */
export function showValidationErrorsToast(errors: ValidationError[]): void {
  if (errors.length === 0) return;
  
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warn').length;
  
  let title = '';
  if (errorCount > 0 && warningCount > 0) {
    title = `${errorCount} Error${errorCount !== 1 ? 's' : ''} and ${warningCount} Warning${warningCount !== 1 ? 's' : ''}`;
  } else if (errorCount > 0) {
    title = `${errorCount} Validation Error${errorCount !== 1 ? 's' : ''}`;
  } else {
    title = `${warningCount} Validation Warning${warningCount !== 1 ? 's' : ''}`;
  }
  
  const message = formatValidationErrors(errors);
  const hasErrors = errorCount > 0;
  
  toast({
    title,
    description: message,
    variant: hasErrors ? 'destructive' : 'default',
    duration: hasErrors ? 7000 : 5000,
  });
}

/**
 * Log validation error to server (Sentry in production)
 */
export function logValidationError(error: ValidationError): void {
  const errorMessage = `Validation ${error.severity}: ${formatValidationError(error)}`;
  
  if (error.severity === 'error') {
    logError(new Error(errorMessage), 'ValidationError', {
      tags: {
        errorCode: error.code,
        severity: error.severity,
        path: error.path.join('.'),
      },
      extra: {
        errorId: error.id,
        timestamp: error.timestamp,
        context: error.context,
        userId: error.userId,
        sessionId: error.sessionId,
      },
    });
  } else {
    logWarning(errorMessage);
  }
}

/**
 * Log multiple validation errors
 */
export function logValidationErrors(errors: ValidationError[]): void {
  if (errors.length === 0) return;
  
  // Log each error individually for detailed tracking
  for (const error of errors) {
    logValidationError(error);
  }
  
  // Log summary for batch operations
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warn').length;
  
  if (errorCount > 0 || warningCount > 0) {
    const summaryMessage = `Validation batch completed: ${errorCount} errors, ${warningCount} warnings`;
    logWarning(summaryMessage);
  }
}

/**
 * Handle validation error with unified logging and client notification
 */
export function handleValidationError(
  payload: ValidationErrorPayload,
  options?: {
    context?: string;
    userId?: string;
    sessionId?: string;
    showToast?: boolean;
    logToServer?: boolean;
  }
): ValidationError {
  const error = createValidationError(
    payload,
    options?.context,
    options?.userId,
    options?.sessionId
  );
  
  // Log to server by default
  if (options?.logToServer !== false) {
    logValidationError(error);
  }
  
  // Show toast by default
  if (options?.showToast !== false) {
    showValidationErrorToast(error);
  }
  
  return error;
}

/**
 * Handle multiple validation errors
 */
export function handleValidationErrors(
  payloads: ValidationErrorPayload[],
  options?: {
    context?: string;
    userId?: string;
    sessionId?: string;
    showToast?: boolean;
    logToServer?: boolean;
  }
): ValidationError[] {
  const errors = payloads.map(payload =>
    createValidationError(
      payload,
      options?.context,
      options?.userId,
      options?.sessionId
    )
  );
  
  // Log to server by default
  if (options?.logToServer !== false) {
    logValidationErrors(errors);
  }
  
  // Show toast by default
  if (options?.showToast !== false) {
    showValidationErrorsToast(errors);
  }
  
  return errors;
}

/**
 * Create validation error collection from errors
 */
export function createValidationErrorCollection(errors: ValidationError[]): ValidationErrorCollection {
  return {
    errors,
    totalCount: errors.length,
    errorCount: errors.filter(e => e.severity === 'error').length,
    warningCount: errors.filter(e => e.severity === 'warn').length,
  };
}

/**
 * Common validation error codes and messages
 */
export const VALIDATION_CODES = {
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',
  INVALID_TYPE: 'INVALID_TYPE',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  DATA_INTEGRITY: 'DATA_INTEGRITY',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/**
 * Helper functions for common validation error types
 */
export const ValidationErrorHelpers = {
  requiredField: (fieldName: string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.REQUIRED_FIELD,
    message: `${fieldName} is required`,
    path: path.length > 0 ? path : [fieldName],
    severity: 'error',
  }),

  invalidFormat: (fieldName: string, expectedFormat: string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.INVALID_FORMAT,
    message: `${fieldName} has invalid format. Expected: ${expectedFormat}`,
    path: path.length > 0 ? path : [fieldName],
    severity: 'error',
  }),

  outOfRange: (fieldName: string, min: number | string, max: number | string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.OUT_OF_RANGE,
    message: `${fieldName} must be between ${min} and ${max}`,
    path: path.length > 0 ? path : [fieldName],
    severity: 'error',
  }),

  duplicateValue: (fieldName: string, value: string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.DUPLICATE_VALUE,
    message: `${fieldName} '${value}' already exists`,
    path: path.length > 0 ? path : [fieldName],
    severity: 'error',
  }),

  invalidType: (fieldName: string, expectedType: string, actualType: string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.INVALID_TYPE,
    message: `${fieldName} expected ${expectedType}, got ${actualType}`,
    path: path.length > 0 ? path : [fieldName],
    severity: 'error',
  }),

  businessRuleViolation: (rule: string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.BUSINESS_RULE_VIOLATION,
    message: `Business rule violation: ${rule}`,
    path,
    severity: 'error',
  }),

  dataIntegrityWarning: (message: string, path: string[] = []): ValidationErrorPayload => ({
    code: VALIDATION_CODES.DATA_INTEGRITY,
    message,
    path,
    severity: 'warn',
  }),
};
