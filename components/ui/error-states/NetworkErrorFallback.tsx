import * as React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NetworkErrorFallbackProps {
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
   * Title to display, defaults to "Connection Problem"
   */
  title?: string;
  /**
   * Whether to show the retry button
   */
  showRetry?: boolean;
  /**
   * Whether to show the offline icon instead of the regular network error icon
   */
  isOffline?: boolean;
}

/**
 * A fallback component to display when network errors occur.
 * Provides a consistent UI for network-related errors with retry functionality.
 * 
 * @example
 * ```tsx
 * <NetworkErrorFallback 
 *   retry={() => refetch()} 
 *   messageOverride="Unable to connect to the server. Please check your internet connection."
 *   isOffline={!navigator.onLine}
 * />
 * ```
 */
export const NetworkErrorFallback = React.forwardRef<
  HTMLDivElement,
  NetworkErrorFallbackProps
>(({
  retry,
  messageOverride,
  className,
  title = "Connection Problem",
  showRetry = true,
  isOffline = false,
  ...props
}, ref) => {
  const defaultMessage = isOffline 
    ? "You appear to be offline. Please check your internet connection and try again."
    : "We're having trouble connecting to our servers. This might be a temporary issue.";
  
  return (
    <Card 
      ref={ref} 
      className={cn(
        "w-full max-w-md mx-auto text-center border-destructive/20 bg-destructive/5",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          {isOffline ? (
            <WifiOff className="h-8 w-8 text-destructive" />
          ) : (
            <Wifi className="h-8 w-8 text-destructive" />
          )}
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {messageOverride ?? defaultMessage}
        </CardDescription>
      </CardHeader>
      {showRetry && retry && (
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        </CardContent>
      )}
    </Card>
  );
});

NetworkErrorFallback.displayName = 'NetworkErrorFallback';
