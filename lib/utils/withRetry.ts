/**
 * Generic retry utility with exponential backoff
 * Provides resilient execution of operations that may fail transiently
 */

/**
 * Options for configuring retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  useJitter?: boolean;
  /** Function to determine if error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Function called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, nextDelayMs: number) => void;
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  /** The successful result, if any */
  data?: T;
  /** The final error, if operation failed */
  error?: unknown;
  /** Whether the operation succeeded */
  success: boolean;
  /** Number of attempts made */
  attempts: number;
  /** Total time taken in milliseconds */
  totalTimeMs: number;
}

/**
 * Default retry condition - retries on network errors, server errors, and timeouts
 */
function defaultShouldRetry(error: unknown, attempt: number): boolean {
  // Don't retry if we've exhausted attempts
  if (attempt >= 3) return false;
  
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Retry on HTTP errors that are likely transient
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 || status === 429 || status === 408;
  }
  
  // Retry on common error messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('aborted') ||
      message.includes('rate limit')
    );
  }
  
  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
  useJitter: boolean
): number {
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  const delayWithCap = Math.min(exponentialDelay, maxDelayMs);
  
  if (useJitter) {
    // Add ±10% jitter
    const jitterRange = delayWithCap * 0.1;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(0, delayWithCap + jitter);
  }
  
  return delayWithCap;
}

/**
 * Generic retry function with exponential backoff
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves to RetryResult
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const result = await withRetry(async () => {
 *   const response = await fetch('/api/data');
 *   if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *   return response.json();
 * });
 * 
 * if (result.success) {
 *   console.log('Data:', result.data);
 * } else {
 *   console.error('Failed after retries:', result.error);
 * }
 * 
 * // With custom options
 * const result = await withRetry(
 *   () => apiCall(),
 *   {
 *     maxAttempts: 5,
 *     initialDelayMs: 500,
 *     maxDelayMs: 10000,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Attempt ${attempt} failed, retrying in ${delay}ms`);
 *     }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    useJitter = true,
    shouldRetry = defaultShouldRetry,
    onRetry
  } = options;

  const startTime = Date.now();
  let lastError: unknown;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    
    try {
      const data = await operation();
      return {
        data,
        success: true,
        attempts: attempt,
        totalTimeMs: Date.now() - startTime
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt or if shouldRetry returns false
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        break;
      }
      
      // Calculate delay and wait before retry
      const delayMs = calculateDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier,
        useJitter
      );
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(error, attempt, delayMs);
      }
      
      await sleep(delayMs);
    }
  }

  return {
    error: lastError,
    success: false,
    attempts: attempt,
    totalTimeMs: Date.now() - startTime
  };
}

/**
 * Specialized retry function for HTTP requests
 * 
 * @example
 * ```typescript
 * const result = await withHttpRetry(async () => {
 *   const response = await fetch('/api/trucks');
 *   if (!response.ok) {
 *     throw new HttpError(response.status, response.statusText);
 *   }
 *   return response.json();
 * });
 * ```
 */
export async function withHttpRetry<T>(
  operation: () => Promise<T>,
  options: Omit<RetryOptions, 'shouldRetry'> & {
    /** Custom HTTP status codes to retry (default: 429, 500-599) */
    retryStatuses?: number[];
  } = {}
): Promise<RetryResult<T>> {
  const { retryStatuses = [429, 408, ...Array.from({ length: 100 }, (_, i) => 500 + i)], ...retryOptions } = options;
  
  return withRetry(operation, {
    ...retryOptions,
    shouldRetry: (error: unknown, attempt: number) => {
      if (attempt >= (retryOptions.maxAttempts ?? 3)) return false;
      
      // Retry on HTTP errors with specific status codes
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        return retryStatuses.includes(status);
      }
      
      // Retry on network/connection errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return true;
      }
      
      return false;
    }
  });
}

/**
 * HTTP Error class for better error handling
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message?: string
  ) {
    super(message || `HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

/**
 * Utility to create a fetch wrapper with retry logic
 * 
 * @example
 * ```typescript
 * const retryFetch = createRetryFetch({
 *   maxAttempts: 3,
 *   initialDelayMs: 1000
 * });
 * 
 * try {
 *   const response = await retryFetch('/api/trucks');
 *   const data = await response.json();
 * } catch (error) {
 *   console.error('Request failed after retries:', error);
 * }
 * ```
 */
export function createRetryFetch(options: RetryOptions = {}) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const result = await withHttpRetry(async () => {
      const response = await fetch(input, init);
      
      if (!response.ok) {
        throw new HttpError(response.status, response.statusText);
      }
      
      return response;
    }, options);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    throw result.error || new Error('Request failed after retries');
  };
}
