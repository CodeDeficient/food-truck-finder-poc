'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError, setTag } from '../lib/logging';
import type { ErrorContext } from '../lib/telemetry/sentryClient';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | undefined;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors using our centralized logging system, and displays a fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Set component context for error tracking
    setTag('errorBoundary', 'true');
    setTag('component', (errorInfo.componentStack !== undefined && errorInfo.componentStack !== '') ? 'React Component' : 'Unknown');

    // Prepare error context for Sentry
    const errorContext: ErrorContext = {
      tags: {
        errorBoundary: 'true',
        errorType: 'componentError',
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        timestamp: new Date().toISOString(),
      },
    };

    // Log the error using our centralized logging system
    logError(error, 'ErrorBoundary', errorContext);

    // Call the optional onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private renderErrorUI(): ReactNode {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.382 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Something went wrong
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>
                  We're sorry, but something unexpected happened. The error has been
                  logged and we'll look into it.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError === true) {
      // Render fallback UI if provided, otherwise render default error message
      if (this.props.fallback === undefined) {
        return this.renderErrorUI();
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

  return WrappedComponent;
}
