import * as React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DataMissingFallbackProps {
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
   * Title to display, defaults to "No Data Found"
   */
  title?: string;
  /**
   * Whether to show the retry button
   */
  showRetry?: boolean;
}

/**
 * A fallback component to display when data is missing or empty.
 * Provides a consistent UI for empty states with optional retry functionality.
 * 
 * @example
 * ```tsx
 * <DataMissingFallback 
 *   retry={() => refetch()} 
 *   messageOverride="No food trucks found in this area"
 * />
 * ```
 */
export const DataMissingFallback = React.forwardRef<
  HTMLDivElement,
  DataMissingFallbackProps
>(({
  retry,
  messageOverride,
  className,
  title = "No Data Found",
  showRetry = true,
  ...props
}, ref) => {
  const defaultMessage = "We couldn't find any data to display. This might be because there are no items available or they haven't been loaded yet.";
  
  return (
    <Card 
      ref={ref} 
      className={cn(
        "w-full max-w-md mx-auto text-center border-dashed border-2",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Database className="h-8 w-8 text-muted-foreground" />
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
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
});

DataMissingFallback.displayName = 'DataMissingFallback';
