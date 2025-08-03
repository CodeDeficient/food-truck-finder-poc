/**
 * Configuration options for the retry utility
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Whether to use jitter (default: true) */
  useJitter?: boolean;
  /** Custom retry condition function */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The result data if successful */
  data?: T;
  /** The final error if unsuccessful */
  error?: unknown;
  /** Number of attempts made */
  attempts: number;
  /** Total time spent in milliseconds */
  totalTimeMs: number;
}

/**
 * HTTP Error class
 */
export class HttpError extends Error {
  public statusText: string;
  
  constructor(public status: number, statusText: string, message?: string) {
    super(message || `HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
    this.statusText = statusText;
  }
}

/**
 * Error types that should be retried by default
 */
const DEFAULT_RETRY_CONDITIONS = [
  // Network errors
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  
  // HTTP status codes that should be retried
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

/**
 * Default retry condition function
 */
function defaultShouldRetry(error: unknown, attempt: number): boolean {
  // Don't retry after max attempts
  if (attempt >= 3) return false;

  // Check for network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for network error codes
    if (DEFAULT_RETRY_CONDITIONS.some(code => 
      typeof code === 'string' ? message.includes(code.toLowerCase()) : false
    )) {
      return true;
    }
    
    // Check for timeout errors
    if (message.includes('timeout') || message.includes('aborted')) {
      return true;
    }
  }

  // Check for HTTP errors with retry-able status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    return DEFAULT_RETRY_CONDITIONS.includes(status);
  }

  // Check for fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const jitterMultiplier = 1 + (Math.random() - 0.5) * 2 * jitter;
  const delayWithJitter = exponentialDelay * jitterMultiplier;
  
  return Math.min(delayWithJitter, maxDelay);
}

/**
 * Generic retry utility with exponential backoff
 * 
 * @param operation - The async operation to retry
 * @param config - Retry configuration options
 * @returns Promise that resolves with a RetryResult containing success/error info
 * 
 * @example
 * ```typescript
 * const result = await withRetry(async () => {
 *   const response = await fetch('/api/data');
 *   if (!response.ok) {
 *     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 *   }
 *   return response.json();
 * }, {
 *   maxAttempts: 3,
 *   initialDelayMs: 1000,
 *   onRetry: (error, attempt, delay) => {
 *     console.log(`Retry attempt ${attempt} after ${delay}ms:`, error.message);
 *   }
 * });
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    useJitter = true,
    shouldRetry = defaultShouldRetry,
    onRetry
  } = config;

  const startTime = Date.now();
  let lastError: unknown;
  let attempts = 0;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts = attempt;
    try {
      const data = await operation();
      return {
        success: true,
        data,
        attempts,
        totalTimeMs: Date.now() - startTime
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt or if retry condition is not met
      if (attempt === maxAttempts || !shouldRetry(error, attempt)) {
        break;
      }
      
      // Calculate delay for next retry
      const delay = calculateDelay(
        attempt, // Use 1-based indexing for delay calculation
        initialDelayMs,
        maxDelayMs,
        backoffMultiplier,
        useJitter ? 0.1 : 0
      );
      
      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt - 1, delay);
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Return failure result
  return {
    success: false,
    error: lastError,
    attempts,
    totalTimeMs: Date.now() - startTime
  };
}

/**
 * Pre-configured retry utility for API calls
 */
export const withApiRetry = <T>(operation: () => Promise<T>) =>
  withRetry(operation, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error, attempt) => {
      // Retry on network errors and 5xx status codes
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        return status >= 500 || status === 429;
      }
      return defaultShouldRetry(error, attempt);
    }
  });

/**
 * Pre-configured retry utility for database operations
 */
export const withDbRetry = <T>(operation: () => Promise<T>) =>
  withRetry(operation, {
    maxAttempts: 5,
    initialDelay: 500,
    maxDelay: 5000,
    shouldRetry: (error, attempt) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        // Retry on connection errors but not on data validation errors
        return message.includes('connection') || 
               message.includes('timeout') ||
               message.includes('pool');
      }
      return false;
    }
  });

/**
 * HTTP retry configuration
 */
export interface HttpRetryConfig extends Omit<RetryConfig, 'shouldRetry'> {
  /** HTTP status codes to retry (default: [408, 429, 500, 502, 503, 504]) */
  retryStatuses?: number[];
}

/**
 * Pre-configured retry utility for HTTP operations
 */
export const withHttpRetry = <T>(operation: () => Promise<T>, config: HttpRetryConfig = {}) => {
  const { retryStatuses = [408, 429, 500, 502, 503, 504], ...retryConfig } = config;
  
  return withRetry(operation, {
    ...retryConfig,
    shouldRetry: (error, attempt) => {
      // Check for HTTP errors with retry-able status codes
      if (error instanceof HttpError) {
        return retryStatuses.includes(error.status);
      }
      
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        return retryStatuses.includes(status);
      }
      
      // Check for network errors
      return defaultShouldRetry(error, attempt);
    }
  });
};

/**
 * Create a fetch function with retry capabilities
 */
export function createRetryFetch(config: HttpRetryConfig = {}) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const result = await withHttpRetry(async () => {
      const response = await fetch(input, init);
      
      if (!response.ok) {
        throw new HttpError(response.status, response.statusText);
      }
      
      return response;
    }, config);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data!;
  };
}

export default withRetry;
