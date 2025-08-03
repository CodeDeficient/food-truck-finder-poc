import * as React from 'react';
import { TruckCardSkeleton } from './TruckCardSkeleton';
import { cn } from '@/lib/utils';

export interface TruckListSkeletonProps {
  /**
   * Number of skeleton cards to render
   */
  count?: number;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * Whether to render compact skeleton cards
   */
  compact?: boolean;
  /**
   * Grid layout configuration
   */
  layout?: 'grid' | 'list';
  /**
   * Number of columns for grid layout (responsive)
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * A skeleton component that renders multiple TruckCardSkeleton components
 * in a grid or list layout while truck data is loading.
 * 
 * @example
 * ```tsx
 * <TruckListSkeleton count={6} />
 * <TruckListSkeleton 
 *   count={9} 
 *   layout="grid" 
 *   columns={{ sm: 1, md: 2, lg: 3 }}
 *   compact
 * />
 * ```
 */
export const TruckListSkeleton = React.forwardRef<
  HTMLDivElement,
  TruckListSkeletonProps
>(({
  count = 6,
  className,
  compact = false,
  layout = 'grid',
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  ...props
}, ref) => {
  const getGridClasses = () => {
    if (layout === 'list') {
      return 'flex flex-col space-y-4';
    }
    
    const gridClasses = ['grid', 'gap-4'];
    
    // Build responsive grid classes
    if (columns.sm !== undefined) gridClasses.push(`grid-cols-${columns.sm}`);
    if (columns.md !== undefined) gridClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg !== undefined) gridClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl !== undefined) gridClasses.push(`xl:grid-cols-${columns.xl}`);
    
    return gridClasses.join(' ');
  };

  return (
    <div 
      ref={ref}
      className={cn(
        getGridClasses(),
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <TruckCardSkeleton
          key={index}
          compact={compact}
          className={layout === 'list' ? 'w-full' : undefined}
        />
      ))}
    </div>
  );
});

TruckListSkeleton.displayName = 'TruckListSkeleton';
