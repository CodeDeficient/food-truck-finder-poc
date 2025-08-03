/**
 * Sentry client for production error tracking and monitoring
 * This module provides a centralized interface for Sentry operations
 */

// Type definitions for better error handling
export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

// Mock Sentry client for development (placeholder implementation)
export class SentryClient {
  private static instance: SentryClient;
  private initialized = false;

  static getInstance(): SentryClient {
    if (!SentryClient.instance) {
      SentryClient.instance = new SentryClient();
    }
    return SentryClient.instance;
  }

  init(dsn: string): void {
    if (this.initialized) {
      return;
    }

    // In a real implementation, this would initialize Sentry
    // For now, this is a placeholder
    console.log(`Sentry initialized with DSN: ${dsn}`);
    this.initialized = true;
  }

  captureException(error: unknown, context?: ErrorContext): void {
    if (!this.initialized) {
      console.warn('Sentry not initialized. Falling back to console.error');
      console.error(error);
      return;
    }

    // Placeholder implementation - in production, this would send to Sentry
    console.error('Sentry would capture:', error, context);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized) {
      console.warn('Sentry not initialized. Falling back to console');
      console.log(message);
      return;
    }

    // Placeholder implementation - in production, this would send to Sentry
    console.log(`Sentry would capture message (${level}):`, message);
  }

  setUser(user: { id?: string; email?: string }): void {
    if (!this.initialized) {
      return;
    }

    // Placeholder implementation
    console.log('Sentry would set user:', user);
  }

  setTag(key: string, value: string): void {
    if (!this.initialized) {
      return;
    }

    // Placeholder implementation
    console.log(`Sentry would set tag ${key}:`, value);
  }
}

// Export singleton instance
export const sentryClient = SentryClient.getInstance();
