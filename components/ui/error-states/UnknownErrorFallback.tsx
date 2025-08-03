import * as React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logError, setTag } from '@/lib/logging';
import type { ErrorContext } from '@/lib/telemetry/sentryClient';

export interface UnknownErrorFallbackProps {
  /**
   * Optional retry function to be called when the retry button is clicked
   */
  retry?: () => void;
  /**
   * Optional custom message to override the default message
   */
  messageOverride?: string;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * Title to display, defaults to "Something Went Wrong"
   */
  title?: string;
  /**
   * Whether to show the retry button
   */
  showRetry?: boolean;
  /**
   * Optional error details to display (in development mode)
   */
  errorDetails?: string;
  /**
   * Whether to show detailed error information
   */
  showDetails?: boolean;
  /**
   * Optional error object to log
   */
  error?: Error | unknown;
  /**
   * Optional context for error logging
   */
  context?: string;
}

/**
 * A fallback component to display when unknown or unexpected errors occur.
 * Provides a consistent UI for general error states with retry functionality.
 * 
 * @example
 * ```tsx
 * <UnknownErrorFallback 
 *   retry={() => refetch()} 
 *   messageOverride="An unexpected error occurred while loading the data."
 *   errorDetails={error.message}
 *   showDetails={process.env.NODE_ENV === 'development'}
 * />
 * ```
 */
export const UnknownErrorFallback = React.forwardRef<
  HTMLDivElement,
  UnknownErrorFallbackProps
>(({ 
  retry,
  messageOverride,
  className,
  title = "Something Went Wrong",
  showRetry = true,
  errorDetails,
  showDetails = false,
  error,
  context = 'UnknownErrorFallback',
 }, ref) => {
  const defaultMessage = "We encountered an unexpected error. This has been logged and our team has been notified.";
  
  // Log the error when the component mounts
  React.useEffect(() => {
    if (error !== undefined) {
      // Set tags for error tracking
      setTag('component', 'UnknownErrorFallback');
      setTag('errorType', 'fallbackComponent');
      
      // Prepare error context
      const errorContext: ErrorContext = {
        tags: {
          component: 'UnknownErrorFallback',
          errorType: 'fallbackComponent',
        },
        extra: {
          context,
          title,
          hasRetry: Boolean(retry),
          timestamp: new Date().toISOString(),
        },
      };
      
      // Log the error
      logError(error, context, errorContext);
    }
  }, [error, context, title, retry]);
  
  return (
    <Card 
      ref={ref} 
      className={cn(
        "w-full max-w-md mx-auto text-center border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {messageOverride ?? defaultMessage}
        </CardDescription>
        
        {showDetails && (errorDetails !== undefined && errorDetails !== '') && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-2">
              <Bug className="h-3 w-3" />
              Show Error Details
            </summary>
            <div className="mt-2 p-3 bg-muted/50 rounded-md border">
              <code className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
                {errorDetails}
              </code>
            </div>
          </details>
        )}
      </CardHeader>
      
      {showRetry && retry && (
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="gap-2 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
});

UnknownErrorFallback.displayName = 'UnknownErrorFallback';
