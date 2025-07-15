/**
 * Bundle Size Analysis and Optimization Utilities
 * Provides insights and recommendations for bundle optimization
 */

import React from 'react';

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  recommendations: string[];
}

/**
 * Bundle optimization recommendations based on analysis
 */
export function getBundleOptimizationRecommendations(): string[] {
  const recommendations = [
    // Code splitting recommendations
    'Implement dynamic imports for admin dashboard components',
    'Split authentication components into separate chunks',
    'Lazy load chart components (Recharts) only when needed',

    // Tree shaking recommendations
    'Use named imports instead of default imports for UI libraries',
    'Remove unused Lucide React icons',
    'Optimize Radix UI imports to only include used components',

    // External dependencies optimization
    'Consider replacing Recharts with a lighter charting library for simple charts',
    'Use Next.js Image component instead of external image libraries',
    'Minimize Supabase client bundle size by importing only needed functions',

    // Performance optimizations
    'Enable gzip compression in production',
    'Use Next.js bundle analyzer to identify large dependencies',
    'Implement service worker for caching static assets',

    // Modern JavaScript features
    'Use ES2020+ features for smaller bundle sizes',
    'Enable Next.js experimental optimizePackageImports',
    'Consider using SWC minification for better performance',
  ];

  return recommendations;
}

/**
 * Critical performance metrics for bundle optimization
 */
export interface PerformanceBudget {
  maxBundleSize: number; // in KB
  maxChunkSize: number; // in KB
  maxInitialLoad: number; // in KB
  maxAssetSize: number; // in KB
}

export const PERFORMANCE_BUDGETS: PerformanceBudget = {
  maxBundleSize: 500, // 500KB total bundle
  maxChunkSize: 200, // 200KB per chunk
  maxInitialLoad: 300, // 300KB initial load
  maxAssetSize: 100, // 100KB per asset
};

/**
 * Check if bundle meets performance budgets
 */
export function checkPerformanceBudget(analysis: Partial<BundleAnalysis>): {
  passed: boolean;
  violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    severity: 'warning' | 'error';
  }>;
} {
  const violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    severity: 'warning' | 'error';
  }> = [];

  // Check total bundle size
  if (
    analysis.totalSize != undefined &&
    analysis.totalSize > PERFORMANCE_BUDGETS.maxBundleSize * 1024
  ) {
    violations.push({
      metric: 'Total Bundle Size',
      actual: Math.round(analysis.totalSize / 1024),
      budget: PERFORMANCE_BUDGETS.maxBundleSize,
      severity: 'error',
    });
  }

  // Check individual chunk sizes
  if (analysis.chunks) {
    for (const chunk of analysis.chunks) {
      if (chunk.size > PERFORMANCE_BUDGETS.maxChunkSize * 1024) {
        violations.push({
          metric: `Chunk Size (${chunk.name})`,
          actual: Math.round(chunk.size / 1024),
          budget: PERFORMANCE_BUDGETS.maxChunkSize,
          severity: 'warning',
        });
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Dynamic import utilities for code splitting
 */
export const DynamicImports = {
  // Admin dashboard components
  AdminDashboard: () => import('@/app/admin/page'),
  FoodTruckManagement: () => import('@/app/admin/food-trucks/page'),
  Analytics: () => import('@/app/admin/analytics/page'),

  // Chart components (heavy dependencies)
  Charts: () => import('recharts'),

  // Authentication components
  LoginPage: () => import('@/app/login/page'),

  // Map components - commented out until component exists
  // MapDisplay: () => import('@/components/MapDisplay'),
};

/**
 * Optimized imports for common libraries
 */
export const OptimizedImports = {
  // Lucide React - use standard imports (tree-shaking handled by bundler)
  icons: {
    // Use regular lucide-react imports - modern bundlers handle tree-shaking
    Menu: () => import('lucide-react').then((mod) => ({ Menu: mod.Menu })),
    Search: () => import('lucide-react').then((mod) => ({ Search: mod.Search })),
    User: () => import('lucide-react').then((mod) => ({ User: mod.User })),
    BarChart3: () => import('lucide-react').then((mod) => ({ BarChart3: mod.BarChart3 })),
    Settings: () => import('lucide-react').then((mod) => ({ Settings: mod.Settings })),
    Database: () => import('lucide-react').then((mod) => ({ Database: mod.Database })),
  },

  // Radix UI - optimized imports
  ui: {
    Button: () => import('@radix-ui/react-slot').then((mod) => ({ Slot: mod.Slot })),
    Dialog: () => import('@radix-ui/react-dialog'),
    DropdownMenu: () => import('@radix-ui/react-dropdown-menu'),
  },
};

/**
 * Performance monitoring for bundle loading
 */
export class BundlePerformanceMonitor {
  private static loadTimes = new Map<string, number>();

  /**
   * Track chunk load time
   */
  static trackChunkLoad(chunkName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.loadTimes.set(chunkName, loadTime);

    // Log slow loading chunks
    if (loadTime > 1000) {
      // More than 1 second
      console.warn(`Slow chunk load detected: ${chunkName} took ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Get chunk load statistics
   */
  static getLoadStats(): Array<{ chunk: string; loadTime: number }> {
    return [...this.loadTimes.entries()].map(([chunk, loadTime]) => ({
      chunk,
      loadTime,
    }));
  }

  /**
   * Get average load time
   */
  static getAverageLoadTime(): number {
    const times = [...this.loadTimes.values()];
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }
}

/**
 * Code splitting helper for React components
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
) {
  const LazyComponent = React.lazy(importFn);

  /**
   * Wraps a lazy loaded component with performance monitoring.
   * @example
   * WrappedComponent(props);
   * Returns a React component wrapped with a Suspense fallback and performance tracking.
   * @param {React.ComponentProps<T>} props - The props for the wrapped lazy component.
   * @returns {React.ReactElement} A React element that wraps the lazy component within a Suspense fallback.
   * @description
   *   - Utilizes React's Suspense to handle lazy loading of components with a fallback UI.
   *   - Tracks the performance of the component chunk loading using BundlePerformanceMonitor.
   *   - Analyzes the load-time performance by capturing the start time at component mount.
   */
  return function WrappedComponent(props: React.ComponentProps<T>) {
    const startTime = performance.now();

    React.useEffect(() => {
      BundlePerformanceMonitor.trackChunkLoad(
        importFn.toString().slice(0, 50), // Use function string as identifier
        startTime,
      );
    }, []);

    return (
      <React.Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
        <LazyComponent {...(props as any)} />
      </React.Suspense>
    );
  };
}

/**
 * Bundle size recommendations based on current setup
 */
export function getProjectSpecificRecommendations(): Array<{
  category: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}> {
  return [
    {
      category: 'Code Splitting',
      priority: 'high',
      recommendations: [
        'Split admin dashboard into separate route chunks',
        'Lazy load Recharts components only when analytics page is accessed',
        'Dynamic import authentication components',
        'Separate map components into their own chunk',
      ],
    },
    {
      category: 'Dependency Optimization',
      priority: 'medium',
      recommendations: [
        'Use tree-shaking for Lucide React icons',
        'Optimize Radix UI imports to only include used components',
        'Consider lighter alternatives to heavy dependencies',
        'Use Next.js optimizePackageImports for @radix-ui',
      ],
    },
    {
      category: 'Asset Optimization',
      priority: 'medium',
      recommendations: [
        'Optimize images with Next.js Image component',
        'Use WebP/AVIF formats for better compression',
        'Implement proper caching headers for static assets',
        'Minimize CSS bundle size with unused CSS removal',
      ],
    },
    {
      category: 'Runtime Optimization',
      priority: 'low',
      recommendations: [
        'Implement service worker for caching',
        'Use compression middleware in production',
        'Enable HTTP/2 server push for critical resources',
        'Implement resource hints (preload, prefetch)',
      ],
    },
  ];
}