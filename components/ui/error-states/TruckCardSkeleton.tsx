import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface TruckCardSkeletonProps {
  /**
   * Additional CSS classes to apply to the skeleton card
   */
  className?: string;
  /**
   * Whether to show the compact version (smaller height)
   */
  compact?: boolean;
}

/**
 * A skeleton component that mimics the structure of a TruckCard while loading.
 * Provides a consistent loading state for truck card components.
 * 
 * @example
 * ```tsx
 * <TruckCardSkeleton />
 * <TruckCardSkeleton compact />
 * ```
 */
export const TruckCardSkeleton = React.forwardRef<
  HTMLDivElement,
  TruckCardSkeletonProps
>(({ className, compact = false, ...props }, ref) => {
  return (
    <Card 
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    >
      <CardHeader className="p-0">
        {/* Image skeleton */}
        <Skeleton className={cn(
          "w-full rounded-t-lg",
          compact ? "h-32" : "h-48"
        )} />
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Cuisine type skeleton */}
        <Skeleton className="h-4 w-1/2" />
        
        {/* Rating and reviews row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Star ratings */}
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-4 rounded-sm" />
              ))}
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Price */}
          <Skeleton className="h-5 w-12" />
        </div>
        
        {/* Operating hours or status */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {!compact && (
          <>
            {/* Additional details for full version */}
            <div className="pt-2 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

TruckCardSkeleton.displayName = 'TruckCardSkeleton';
