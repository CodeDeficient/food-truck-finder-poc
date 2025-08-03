import { sentryClient, type ErrorContext } from '../telemetry/sentryClient';

// Determine the environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize Sentry if in production mode
if (isProduction) {
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn === undefined || sentryDsn === '') {
    throw new Error(
      'SENTRY_DSN environment variable is required in production but was not found. ' +
      'Please set SENTRY_DSN in your environment variables or .env.local file.'
    );
  }
  
  // Initialize Sentry client
  sentryClient.init(sentryDsn);
}

/**
 * Log error with context - uses console in dev, Sentry in production
 * @param error - The error to log
 * @param context - Optional context string
 * @param errorContext - Optional Sentry context (user, tags, extra data)
 */
export function logError(error: unknown, context?: string, errorContext?: ErrorContext): void {
  if (isProduction) {
    sentryClient.captureException(error, errorContext);
  } else {
    // In development, provide detailed console output
    const contextPrefix = (context !== undefined && context !== '') ? `[${context}]` : '';
    console.error(contextPrefix, error);
    
    // If error context is provided, log it for development debugging
    if (errorContext) {
      console.error('Error context:', errorContext);
    }
  }
}

/**
 * Log informational message
 * @param message - The message to log
 * @param level - Log level (info, warning, error)
 */
export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (isProduction) {
    sentryClient.captureMessage(message, level);
  } else {
    // Use appropriate console method based on level
    switch (level) {
      case 'error': {
        console.error(message);
        break;
      }
      case 'warning': {
        console.warn(message);
        break;
      }
      default: {
        // eslint-disable-next-line no-console
        console.info(message);
        break;
      }
    }
  }
}

/**
 * Log warning - convenience method for warning level messages
 * @param message - Warning message
 */
export function logWarning(message: string): void {
  logMessage(message, 'warning');
}

/**
 * Set user context for error tracking
 * @param user - User information
 */
export function setUserContext(user: { id?: string; email?: string }): void {
  if (isProduction) {
    sentryClient.setUser(user);
  } else if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.info('[Logger] User context set:', user);
  }
}

/**
 * Set tag for error tracking
 * @param key - Tag key
 * @param value - Tag value
 */
export function setTag(key: string, value: string): void {
  if (isProduction) {
    sentryClient.setTag(key, value);
  } else if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.info(`[Logger] Tag set: ${key} = ${value}`);
  }
}

