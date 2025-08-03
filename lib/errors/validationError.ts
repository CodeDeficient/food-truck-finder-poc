/**
 * Validation Error Management System
 * 
 * Provides standardized error shape, formatting, Sentry integration,
 * and UI toast notifications for validation failures.
 */

import { toast } from 'sonner';

// Standard validation error payload interface
export interface ValidationErrorPayload {
  code: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  value?: any;
  context?: Record<string, any>;
  timestamp: string;
  source: 'client' | 'api' | 'database' | 'pipeline';
}

// Aggregated validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorPayload[];
  warnings: ValidationErrorPayload[];
  summary: {
    errorCount: number;
    warningCount: number;
    criticalIssues: string[];
  };
}

// Error codes enum for consistency
export const ValidationErrorCodes = {
  // Field validation
  REQUIRED_FIELD: 'VALIDATION_001',
  INVALID_FORMAT: 'VALIDATION_002',
  OUT_OF_RANGE: 'VALIDATION_003',
  INVALID_TYPE: 'VALIDATION_004',
  
  // Cross-field validation
  CROSS_FIELD_MISMATCH: 'VALIDATION_101',
  TEMPORAL_INCONSISTENCY: 'VALIDATION_102',
  
  // Reference integrity
  FOREIGN_KEY_VIOLATION: 'VALIDATION_201',
  ORPHANED_RECORD: 'VALIDATION_202',
  CIRCULAR_REFERENCE: 'VALIDATION_203',
  
  // Business rules
  BUSINESS_RULE_VIOLATION: 'VALIDATION_301',
  POLICY_VIOLATION: 'VALIDATION_302',
  
  // System errors
  SCHEMA_VALIDATION_FAILED: 'VALIDATION_901',
  DATABASE_CONSTRAINT_VIOLATION: 'VALIDATION_902',
  SYSTEM_ERROR: 'VALIDATION_999'
} as const;

/**
 * Create a standardized validation error
 */
export function createValidationError(
  code: string,
  message: string,
  options: {
    field?: string;
    severity?: 'error' | 'warning' | 'info';
    value?: any;
    context?: Record<string, any>;
    source?: 'client' | 'api' | 'database' | 'pipeline';
  } = {}
): ValidationErrorPayload {
  return {
    code,
    field: options.field,
    message,
    severity: options.severity || 'error',
    value: options.value,
    context: options.context,
    timestamp: new Date().toISOString(),
    source: options.source || 'client'
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationErrorPayload[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    const error = errors[0];
    return error.field ? `${error.field}: ${error.message}` : error.message;
  }
  
  return `${errors.length} validation errors:\n${errors
    .map(error => `• ${error.field ? `${error.field}: ` : ''}${error.message}`)
    .join('\n')}`;
}

/**
 * Display validation errors as toast notifications
 */
export function showValidationToast(
  errors: ValidationErrorPayload[],
  options: {
    title?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  } = {}
) {
  if (errors.length === 0) return;
  
  const criticalErrors = errors.filter(e => e.severity === 'error');
  const warnings = errors.filter(e => e.severity === 'warning');
  
  if (criticalErrors.length > 0) {
    toast.error(options.title || 'Validation Failed', {
      description: formatValidationErrors(criticalErrors),
      duration: options.duration || 5000,
      action: options.action
    });
  }
  
  if (warnings.length > 0) {
    toast.warning('Validation Warnings', {
      description: formatValidationErrors(warnings),
      duration: options.duration || 3000
    });
  }
}

/**
 * Log validation errors to Sentry
 */
export function logValidationErrorsToSentry(
  errors: ValidationErrorPayload[],
  context: {
    userId?: string;
    operation?: string;
    entityType?: string;
    entityId?: string;
  } = {}
) {
  // Only log if we have Sentry available
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    const Sentry = (window as any).Sentry;
    
    errors.forEach(error => {
      Sentry.withScope((scope: any) => {
        scope.setTag('validation_code', error.code);
        scope.setTag('validation_severity', error.severity);
        scope.setTag('validation_source', error.source);
        
        if (error.field) scope.setTag('validation_field', error.field);
        if (context.userId) scope.setUser({ id: context.userId });
        if (context.operation) scope.setContext('operation', { name: context.operation });
        if (context.entityType) scope.setContext('entity', { 
          type: context.entityType, 
          id: context.entityId 
        });
        
        scope.setContext('validation_error', {
          ...error,
          context: error.context
        });
        
        if (error.severity === 'error') {
          Sentry.captureException(new Error(`Validation Error: ${error.message}`));
        } else {
          Sentry.captureMessage(`Validation ${error.severity}: ${error.message}`, error.severity);
        }
      });
    });
  }
}

/**
 * Comprehensive validation error handler
 */
export function handleValidationErrors(
  errors: ValidationErrorPayload[],
  options: {
    showToast?: boolean;
    logToSentry?: boolean;
    toastOptions?: Parameters<typeof showValidationToast>[1];
    sentryContext?: Parameters<typeof logValidationErrorsToSentry>[1];
  } = {}
): ValidationResult {
  const result: ValidationResult = {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    errors: errors.filter(e => e.severity === 'error'),
    warnings: errors.filter(e => e.severity === 'warning'),
    summary: {
      errorCount: errors.filter(e => e.severity === 'error').length,
      warningCount: errors.filter(e => e.severity === 'warning').length,
      criticalIssues: errors
        .filter(e => e.severity === 'error')
        .map(e => e.field ? `${e.field}: ${e.message}` : e.message)
    }
  };
  
  if (options.showToast !== false) {
    showValidationToast(errors, options.toastOptions);
  }
  
  if (options.logToSentry !== false) {
    logValidationErrorsToSentry(errors, options.sentryContext);
  }
  
  return result;
}

export default {
  createValidationError,
  formatValidationErrors,
  showValidationToast,
  logValidationErrorsToSentry,
  handleValidationErrors,
  ValidationErrorCodes
};
