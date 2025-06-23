/**
 * SOTA Type Guards and Boolean Expression Utilities
 * Centralized utilities to eliminate duplicate boolean expression patterns
 * and improve type safety across the codebase
 */

// Canonical type guards utility file. Use this file for all type guard utilities.

// Type guard for non-null/undefined strings
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

// Type guard for non-null/undefined numbers
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}

// Type guard for non-null/undefined booleans
export function isValidBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// Type guard for non-null objects
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Safe string access with fallback
export function safeString(value: unknown, fallback = ''): string {
  return isNonEmptyString(value) ? value : fallback;
}

// Safe number access with fallback
export function safeNumber(value: unknown, fallback = 0): number {
  return isValidNumber(value) ? value : fallback;
}

// Safe boolean access with fallback
export function safeBoolean(value: unknown, fallback = false): boolean {
  return isValidBoolean(value) ? value : fallback;
}

// Safe object access with fallback
export function safeObject<T = Record<string, unknown>>(value: unknown, fallback = {} as T): T {
  return isNonNullObject(value) ? value as T : fallback;
}

// Centralized null/undefined checking patterns
export function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Safe array access
export function safeArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value as T[] : fallback;
}

// Safe property access for objects
export function safeProperty<T>(obj: unknown, key: string, fallback: T): T {
  if (isNonNullObject(obj) && key in obj) {
    const value = obj[key];
    return hasValue(value) ? value as T : fallback;
  }
  return fallback;
}

// Centralized error type checking
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// Safe error message extraction
export function safeErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (isError(error)) {
    return error.message;
  }
  if (isNonEmptyString(error)) {
    return error;
  }
  return fallback;
}
