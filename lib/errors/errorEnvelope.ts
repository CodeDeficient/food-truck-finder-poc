import { logError } from '../logging';

/**
 * Error envelope type for consistent error handling across the application
 */
export type ErrorEnvelope = {
  ok: false;
  message: string;
  stack?: string;
};

/**
 * Success envelope type for consistent success responses
 */
export type SuccessEnvelope<T> = {
  ok: true;
  data: T;
};

/**
 * Result type that can be either success or error
 */
export type Result<T> = SuccessEnvelope<T> | ErrorEnvelope;

/**
 * Create an error envelope from an unknown error
 */
export function logAndReturnError(err: unknown, context?: string): ErrorEnvelope {
  let message: string;
  let stack: string | undefined;

  if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
  } else if (typeof err === 'string') {
    message = err;
  } else {
    message = 'An unknown error occurred';
  }

  // Add context to the message if provided
  if (context) {
    message = `${context}: ${message}`;
  }

// Log the error for debugging
  logError(err, context);

  return {
    ok: false,
    message,
    stack,
  };
}

/**
 * Create a success envelope
 */
export function createSuccess<T>(data: T): SuccessEnvelope<T> {
  return {
    ok: true,
    data,
  };
}

/**
 * Type guard to check if result is error
 */
export function isError<T>(result: Result<T>): result is ErrorEnvelope {
  return !result.ok;
}

/**
 * Type guard to check if result is success
 */
export function isSuccess<T>(result: Result<T>): result is SuccessEnvelope<T> {
  return result.ok;
}
