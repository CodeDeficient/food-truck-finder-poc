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
export declare function getBundleOptimizationRecommendations(): string[];
/**
 * Critical performance metrics for bundle optimization
 */
export interface PerformanceBudget {
    maxBundleSize: number;
    maxChunkSize: number;
    maxInitialLoad: number;
    maxAssetSize: number;
}
export declare const PERFORMANCE_BUDGETS: PerformanceBudget;
/**
 * Check if bundle meets performance budgets
 */
export declare function checkPerformanceBudget(analysis: Partial<BundleAnalysis>): {
    passed: boolean;
    violations: Array<{
        metric: string;
        actual: number;
        budget: number;
        severity: 'warning' | 'error';
    }>;
};
/**
 * Dynamic import utilities for code splitting
 */
export type DynamicImports = {
    [key: string]: () => Promise<any>;
};
/**
 * Optimized imports for common libraries
 */
export declare const OptimizedImports: {
    icons: {
        Menu: () => Promise<{
            Menu: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        }>;
        Search: () => Promise<{
            Search: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        }>;
        User: () => Promise<{
            User: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        }>;
        BarChart3: () => Promise<{
            BarChart3: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        }>;
        Settings: () => Promise<{
            Settings: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        }>;
        Database: () => Promise<{
            Database: React.ForwardRefExoticComponent<Omit<import("lucide-react").LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        }>;
    };
    ui: {
        Button: () => Promise<{
            Slot: React.ForwardRefExoticComponent<import("@radix-ui/react-slot").SlotProps & React.RefAttributes<HTMLElement>>;
        }>;
        Dialog: () => Promise<typeof import("@radix-ui/react-dialog")>;
        DropdownMenu: () => Promise<typeof import("@radix-ui/react-dropdown-menu")>;
    };
};
/**
 * Performance monitoring for bundle loading
 */
export declare class BundlePerformanceMonitor {
    private static loadTimes;
    /**
     * Track chunk load time
     */
    static trackChunkLoad(chunkName: string, startTime: number): void;
    /**
     * Get chunk load statistics
     */
    static getLoadStats(): Array<{
        chunk: string;
        loadTime: number;
    }>;
    /**
     * Get average load time
     */
    static getAverageLoadTime(): number;
}
/**
 * Code splitting helper for React components
 */
export declare function createLazyComponent<T extends React.ComponentType<any>>(importFn: () => Promise<{
    default: T;
}>, fallback?: React.ComponentType): (props: React.ComponentProps<T>) => React.JSX.Element;
/**
 * Bundle size recommendations based on current setup
 */
export declare function getProjectSpecificRecommendations(): Array<{
    category: string;
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
}>;
