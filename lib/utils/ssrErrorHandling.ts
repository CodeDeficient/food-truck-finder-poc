import { notFound, redirect } from 'next/navigation';
import { logError } from '@/lib/logging';
import type { ErrorContext } from '@/lib/telemetry/sentryClient';

/**
 * Types of SSR errors that can be handled gracefully
 */
export enum SSRErrorType {
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  SERVER_ERROR = 'server_error',
  VALIDATION_ERROR = 'validation_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout'
}

/**
 * Configuration for SSR error handling
 */
export interface SSRErrorConfig {
  /** Whether to log the error (default: true) */
  logError?: boolean;
  /** Additional context for error logging */
  errorContext?: ErrorContext;
  /** Custom error message for logging */
  customMessage?: string;
  /** Whether to use fallback error page instead of throwing */
  useFallback?: boolean;
}

/**
 * SSR Error class with additional metadata
 */
export class SSRError extends Error {
  constructor(
    public readonly type: SSRErrorType,
    public readonly statusCode: number,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'SSRError';
  }
}

/**
 * Determines error type from various error sources
 */
function determineErrorType(error: unknown): SSRErrorType {
  if (error instanceof SSRError) {
    return error.type;
  }

  // Check for HTTP status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    switch (status) {
      case 404:
        return SSRErrorType.NOT_FOUND;
      case 401:
        return SSRErrorType.UNAUTHORIZED;
      case 403:
        return SSRErrorType.FORBIDDEN;
      case 400:
      case 422:
        return SSRErrorType.VALIDATION_ERROR;
      default:
        return status >= 500 ? SSRErrorType.SERVER_ERROR : SSRErrorType.VALIDATION_ERROR;
    }
  }

  // Check error messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('not found') || message.includes('404')) {
      return SSRErrorType.NOT_FOUND;
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return SSRErrorType.UNAUTHORIZED;
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return SSRErrorType.FORBIDDEN;
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return SSRErrorType.TIMEOUT;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return SSRErrorType.NETWORK_ERROR;
    }
  }

  return SSRErrorType.SERVER_ERROR;
}

/**
 * Gracefully handle SSR errors with appropriate Next.js responses
 * 
 * @param error - The error to handle
 * @param config - Configuration for error handling
 * @returns Never returns (throws or redirects)
 * 
 * @example
 * ```typescript
 * // In a page component
 * export default async function TruckPage({ params }: { params: { id: string } }) {
 *   try {
 *     const truck = await FoodTruckService.getTruckById(params.id);
 *     return <TruckDetails truck={truck} />;
 *   } catch (error) {
 *     handleSSRError(error, {
 *       errorContext: { 
 *         tags: { truckId: params.id, page: 'truck-detail' }
 *       }
 *     });
 *   }
 * }
 * ```
 */
export function handleSSRError(error: unknown, config: SSRErrorConfig = {}): never {
  const {
    logError: shouldLog = true,
    errorContext,
    customMessage,
    useFallback = false
  } = config;

  const errorType = determineErrorType(error);
  const message = customMessage || (error instanceof Error ? error.message : 'Unknown error');

  // Log error if requested
  if (shouldLog) {
    logError(error, message, {
      ...errorContext,
      tags: {
        ...errorContext?.tags,
        errorType,
        component: 'SSR'
      }
    });
  }

  // Handle based on error type
  switch (errorType) {
    case SSRErrorType.NOT_FOUND:
      if (useFallback) {
        redirect('/error?type=not_found');
      }
      notFound();
      break;

    case SSRErrorType.UNAUTHORIZED:
      redirect('/login?error=unauthorized');
      break;

    case SSRErrorType.FORBIDDEN:
      redirect('/access-denied');
      break;

    case SSRErrorType.VALIDATION_ERROR:
      redirect('/error?type=validation&message=' + encodeURIComponent(message));
      break;

    case SSRErrorType.NETWORK_ERROR:
    case SSRErrorType.TIMEOUT:
      redirect('/error?type=network&message=' + encodeURIComponent('Service temporarily unavailable'));
      break;

    case SSRErrorType.SERVER_ERROR:
    default:
      redirect('/error?type=server&message=' + encodeURIComponent('Internal server error'));
      break;
  }
}

/**
 * Wrapper for safe SSR data fetching with automatic error handling
 * 
 * @param operation - Async operation to perform
 * @param config - Error handling configuration
 * @returns The result of the operation or handles error gracefully
 * 
 * @example
 * ```typescript
 * export default async function TruckPage({ params }: { params: { id: string } }) {
 *   const truck = await withSSRErrorHandling(
 *     () => FoodTruckService.getTruckById(params.id),
 *     {
 *       errorContext: { 
 *         tags: { truckId: params.id, operation: 'getTruckById' }
 *       }
 *     }
 *   );
 * 
 *   return <TruckDetails truck={truck} />;
 * }
 * ```
 */
export async function withSSRErrorHandling<T>(
  operation: () => Promise<T>,
  config: SSRErrorConfig = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleSSRError(error, config);
  }
}

/**
 * Create a typed error for SSR contexts
 * 
 * @param type - Type of SSR error
 * @param message - Error message
 * @param statusCode - HTTP status code (optional)
 * @param originalError - Original error that caused this (optional)
 * @returns SSRError instance
 * 
 * @example
 * ```typescript
 * if (!truck) {
 *   throw createSSRError(
 *     SSRErrorType.NOT_FOUND, 
 *     `Truck with ID ${id} not found`,
 *     404
 *   );
 * }
 * ```
 */
export function createSSRError(
  type: SSRErrorType,
  message: string,
  statusCode?: number,
  originalError?: unknown
): SSRError {
  const status = statusCode ?? getStatusCodeForErrorType(type);
  return new SSRError(type, status, message, originalError);
}

/**
 * Get default HTTP status code for error type
 */
function getStatusCodeForErrorType(type: SSRErrorType): number {
  switch (type) {
    case SSRErrorType.NOT_FOUND:
      return 404;
    case SSRErrorType.UNAUTHORIZED:
      return 401;
    case SSRErrorType.FORBIDDEN:
      return 403;
    case SSRErrorType.VALIDATION_ERROR:
      return 400;
    case SSRErrorType.NETWORK_ERROR:
    case SSRErrorType.TIMEOUT:
      return 503;
    case SSRErrorType.SERVER_ERROR:
    default:
      return 500;
  }
}

/**
 * Utility to safely handle truck fetching in SSR context
 * 
 * @param truckId - ID of the truck to fetch
 * @param fetcher - Function to fetch the truck data
 * @returns Truck data or handles error gracefully
 * 
 * @example
 * ```typescript
 * export default async function TruckPage({ params }: { params: { id: string } }) {
 *   const truck = await handleTruckFetch(
 *     params.id,
 *     (id) => FoodTruckService.getTruckById(id)
 *   );
 * 
 *   return <TruckDetails truck={truck} />;
 * }
 * ```
 */
export async function handleTruckFetch<T>(
  truckId: string,
  fetcher: (id: string) => Promise<T>
): Promise<T> {
  return withSSRErrorHandling(
    async () => {
      const truck = await fetcher(truckId);
      
      if (!truck) {
        throw createSSRError(
          SSRErrorType.NOT_FOUND,
          `Food truck with ID "${truckId}" not found`,
          404
        );
      }
      
      return truck;
    },
    {
      errorContext: {
        tags: {
          operation: 'handleTruckFetch',
          truckId
        }
      }
    }
  );
}

/**
 * Utility to safely handle admin operations in SSR context
 * 
 * @param operation - Admin operation to perform
 * @param operationName - Name of the operation for logging
 * @returns Operation result or handles error gracefully
 * 
 * @example
 * ```typescript
 * export default async function AdminDashboard() {
 *   const dashboardData = await handleAdminOperation(
 *     () => AdminService.getDashboardData(),
 *     'getDashboardData'
 *   );
 * 
 *   return <Dashboard data={dashboardData} />;
 * }
 * ```
 */
export async function handleAdminOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return withSSRErrorHandling(
    operation,
    {
      errorContext: {
        tags: {
          operation: 'handleAdminOperation',
          operationName,
          context: 'admin'
        }
      }
    }
  );
}

/**
 * Error boundary wrapper for page components
 * Use this to wrap page components that might throw SSR errors
 * 
 * @param WrappedComponent - Page component to wrap
 * @returns Wrapped component with error handling
 * 
 * @example
 * ```typescript
 * const SafeTruckPage = withSSRErrorBoundary(TruckPage);
 * export default SafeTruckPage;
 * ```
 */
export function withSSRErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const ComponentWithErrorBoundary = (props: P) => {
    // This is for client-side rendering only
    // SSR errors should be handled in the component itself using the utilities above
    return <WrappedComponent {...props} />;
  };

  ComponentWithErrorBoundary.displayName = `withSSRErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithErrorBoundary;
}
