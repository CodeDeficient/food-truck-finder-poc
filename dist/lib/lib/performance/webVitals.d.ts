/**
 * SOTA Core Web Vitals Monitoring Implementation
 * Tracks LCP, FID, CLS, FCP, and TTFB metrics for performance optimization
 */
export declare const PERFORMANCE_THRESHOLDS: {
    readonly LCP: {
        readonly good: 2500;
        readonly needsImprovement: 4000;
    };
    readonly FID: {
        readonly good: 100;
        readonly needsImprovement: 300;
    };
    readonly CLS: {
        readonly good: 0.1;
        readonly needsImprovement: 0.25;
    };
    readonly FCP: {
        readonly good: 1800;
        readonly needsImprovement: 3000;
    };
    readonly TTFB: {
        readonly good: 800;
        readonly needsImprovement: 1800;
    };
};
export type MetricName = keyof typeof PERFORMANCE_THRESHOLDS;
export interface PerformanceMetric {
    name: MetricName;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
    url: string;
    userAgent: string;
}
/**
 * Initializes Core Web Vitals monitoring
 * Call this in your app's root component or _app.tsx
 */
export declare function initWebVitalsMonitoring(): void;
/**
 * Gets current performance metrics summary
 */
export declare function getPerformanceMetrics(): {
    metrics: PerformanceMetric[];
    summary: Record<MetricName, {
        latest: number | null;
        average: number;
        rating: 'good' | 'needs-improvement' | 'poor' | 'no-data';
        count: number;
    }>;
};
/**
 * Performance budget checker
 */
export declare function checkPerformanceBudget(): {
    passed: boolean;
    violations: Array<{
        metric: MetricName;
        value: number;
        threshold: number;
        severity: 'warning' | 'critical';
    }>;
};
/**
 * Performance optimization suggestions based on metrics
 */
type PerformanceSuggestion = {
    metric: MetricName;
    issue: string;
    suggestions: string[];
    priority: 'high' | 'medium' | 'low';
};
/**
 * Generates a list of performance optimization suggestions based on Web Vitals metrics.
 * @example
 * getPerformanceOptimizationSuggestions()
 * [
 *   { name: 'Optimize LCP', priority: 'high' },
 *   { name: 'Improve FID', priority: 'medium' }
 * ]
 * @returns {PerformanceSuggestion[]} An array of performance suggestions sorted by priority.
 * @description
 *   - Analyzes performance metrics including LCP, FID, CLS, FCP, and TTFB.
 *   - Generates suggestions only for metrics rated as 'poor' or 'needs-improvement'.
 *   - Prioritizes suggestions based on urgency, sorting them by priority level.
 *   - Utilizes helper functions to generate specific suggestions for each metric type.
 */
export declare function getPerformanceOptimizationSuggestions(): PerformanceSuggestion[];
export {};
