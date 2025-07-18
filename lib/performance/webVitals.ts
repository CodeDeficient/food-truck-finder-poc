/**
 * SOTA Core Web Vitals Monitoring Implementation
 * Tracks LCP, FID, CLS, FCP, and TTFB metrics for performance optimization
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB, type Metric } from 'web-vitals';

// Performance thresholds based on Google's Core Web Vitals standards
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
} as const;

export type MetricName = keyof typeof PERFORMANCE_THRESHOLDS;

export interface PerformanceMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

// In-memory storage for metrics (in production, send to analytics service)
const metricsStore: PerformanceMetric[] = [];

/**
 * Categorizes metric value based on thresholds
 */
function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Processes and stores a web vital metric
 */
function handleMetric(metric: Metric) {
  // Type-safe casting with validation
  const metricName = String((metric as { name: string }).name) as MetricName;
  const metricValue = Number((metric as { value: number }).value);

  const performanceMetric: PerformanceMetric = {
    name: metricName,
    value: metricValue,
    rating: getRating(metricName, metricValue),
    timestamp: Date.now(),
    url: globalThis.location.href,
    userAgent: navigator.userAgent,
  };

  // Store metric locally
  metricsStore.push(performanceMetric);

  // Send to analytics endpoint (non-blocking)
  sendMetricToAnalytics(performanceMetric).catch((error) => {
    console.warn('Failed to send metric to analytics:', error);
  });

  // Log performance issues
  if (performanceMetric.rating === 'poor') {
    console.warn(`Poor ${metricName} performance:`, {
      value: metricValue,
      threshold: PERFORMANCE_THRESHOLDS[metricName],
      url: performanceMetric.url,
    });
  }
}

/**
 * Sends metric data to analytics endpoint
 */
async function sendMetricToAnalytics(metric: PerformanceMetric): Promise<void> {
  try {
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    });
  } catch (error) {
    // Silently fail - don't impact user experience
    console.info('Analytics endpoint unavailable:', error);
  }
}

/**
 * Initializes Core Web Vitals monitoring
 * Call this in your app's root component or _app.tsx
 */
export function initWebVitalsMonitoring(): void {
  try {
    // Type-safe metric handlers with explicit casting
    const safeHandleMetric = (metric: Metric) => handleMetric(metric);

    getCLS(safeHandleMetric);
    getFCP(safeHandleMetric);
    getFID(safeHandleMetric);
    getLCP(safeHandleMetric);
    getTTFB(safeHandleMetric);
  } catch (error) {
    console.warn('Failed to initialize web vitals monitoring:', error);
  }
}

/**
 * Gets current performance metrics summary
 */
export function getPerformanceMetrics(): {
  metrics: PerformanceMetric[];
  summary: Record<
    MetricName,
    {
      latest: number | null;
      average: number;
      rating: 'good' | 'needs-improvement' | 'poor' | 'no-data';
      count: number;
    }
  >;
} {
  const summary = {} as Record<
    MetricName,
    {
      latest: number | null;
      average: number;
      rating: 'good' | 'needs-improvement' | 'poor' | 'no-data';
      count: number;
    }
  >;

  // Initialize summary for all metrics
  for (const metricName of Object.keys(PERFORMANCE_THRESHOLDS)) {
    const name = metricName as MetricName;
    const metricData = metricsStore.filter((m) => m.name === name);

    if (metricData.length === 0) {
      summary[name] = {
        latest: null,
        average: 0,
        rating: 'no-data',
        count: 0,
      };
    } else {
      const latest = metricData.at(-1);
      const average = metricData.reduce((sum, m) => sum + m.value, 0) / metricData.length;

      summary[name] = {
        latest: latest?.value ?? null,
        average: Math.round(average),
        rating: getRating(name, average),
        count: metricData.length,
      };
    }
  }

  return {
    metrics: [...metricsStore],
    summary,
  };
}

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(): {
  passed: boolean;
  violations: Array<{
    metric: MetricName;
    value: number;
    threshold: number;
    severity: 'warning' | 'critical';
  }>;
} {
  const { summary } = getPerformanceMetrics();
  const violations: Array<{
    metric: MetricName;
    value: number;
    threshold: number;
    severity: 'warning' | 'critical';
  }> = [];

  for (const [metricName, data] of Object.entries(summary)) {
    const name = metricName as MetricName;
    if (data.latest == undefined) continue;

    const thresholds = PERFORMANCE_THRESHOLDS[name];

    if (data.latest > thresholds.needsImprovement) {
      violations.push({
        metric: name,
        value: data.latest,
        threshold: thresholds.needsImprovement,
        severity: 'critical',
      });
    } else if (data.latest > thresholds.good) {
      violations.push({
        metric: name,
        value: data.latest,
        threshold: thresholds.good,
        severity: 'warning',
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

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
 * Generates a list of suggestions to improve Largest Contentful Paint (LCP).
 * @example
 * getLCPSuggestions({ latest: 3000 })
 * Returns an array with LCP improvement suggestions when the latest LCP is 3000ms.
 * @param {Object} data - Contains performance metrics data.
 * @param {number|null} data.latest - The latest LCP measure in milliseconds.
 * @returns {PerformanceSuggestion[]} An array of performance suggestions for optimizing LCP.
 * @description
 *   - The function assumes the LCP target is less than 2500ms.
 *   - Suggestions focus on optimizing various aspects like image loading, server response, and resource preloading.
 */
function getLCPSuggestions(data: { latest: number | null }): PerformanceSuggestion[] {
  return [
    {
      metric: 'LCP',
      issue: `Largest Contentful Paint is ${data.latest}ms (target: <2500ms)`,
      suggestions: [
        'Optimize images with Next.js Image component',
        'Implement lazy loading for non-critical content',
        'Use CDN for static assets',
        'Optimize server response times',
        'Preload critical resources',
      ],
      priority: 'high',
    },
  ];
}

/**
 * Generates suggestions to improve First Input Delay (FID) performance.
 * @example
 * getFIDSuggestions({ latest: 150 })
 * [
 *   {
 *     metric: 'FID',
 *     issue: 'First Input Delay is 150ms (target: <100ms)',
 *     suggestions: [
 *       'Reduce JavaScript bundle size',
 *       'Implement code splitting',
 *       'Use web workers for heavy computations',
 *       'Optimize third-party scripts',
 *       'Defer non-critical JavaScript',
 *     ],
 *     priority: 'high',
 *   },
 * ]
 * @param {Object} data - Contains the latest FID measurement.
 * @param {number|null} data.latest - The latest FID metric value.
 * @returns {PerformanceSuggestion[]} A list of suggestions to improve FID.
 * @description
 *   - Suggests actionable improvements if FID exceeds target threshold.
 *   - Provides solutions focusing on JS optimizations.
 */
function getFIDSuggestions(data: { latest: number | null }): PerformanceSuggestion[] {
  return [
    {
      metric: 'FID',
      issue: `First Input Delay is ${data.latest}ms (target: <100ms)`,
      suggestions: [
        'Reduce JavaScript bundle size',
        'Implement code splitting',
        'Use web workers for heavy computations',
        'Optimize third-party scripts',
        'Defer non-critical JavaScript',
      ],
      priority: 'high',
    },
  ];
}

/**
 * Generates performance suggestions based on Cumulative Layout Shift (CLS) data.
 * @example
 * getCLSSuggestions({ latest: 0.25 })
 * // Returns array of suggestions indicating the CLS value and recommendations on improving it.
 * @param {{ latest: number | null }} data - Object containing the latest CLS measurement.
 * @returns {PerformanceSuggestion[]} An array of performance suggestions to address CLS issues.
 * @description
 *   - Suggests best practices to reduce CLS, aiming for a value below 0.1.
 *   - Prioritizes medium concern for updates that could improve visual stability.
 *   - Incorporates practical strategies for developers focusing on layout changes.
 */
function getCLSSuggestions(data: { latest: number | null }): PerformanceSuggestion[] {
  return [
    {
      metric: 'CLS',
      issue: `Cumulative Layout Shift is ${data.latest} (target: <0.1)`,
      suggestions: [
        'Set explicit dimensions for images and videos',
        'Reserve space for dynamic content',
        'Use CSS aspect-ratio for responsive images',
        'Avoid inserting content above existing content',
        'Use transform animations instead of layout changes',
      ],
      priority: 'medium',
    },
  ];
}

/**
* Generates suggestions to improve the First Contentful Paint performance metric.
* @example
* getFCPSuggestions({ latest: 2000 })
* Returns an array with suggestions to optimize FCP targeting <1800ms.
* @param {Object} data - Contains performance metric values.
* @param {number|null} data.latest - Latest measured FCP value in milliseconds.
* @returns {PerformanceSuggestion[]} Array of suggestions for improving FCP metric.
* @description
*   - Suggests optimizations related to the rendering path and resource loading.
*   - Provides actions with a medium priority level to improve website performance.
*/
function getFCPSuggestions(data: { latest: number | null }): PerformanceSuggestion[] {
  return [
    {
      metric: 'FCP',
      issue: `First Contentful Paint is ${data.latest}ms (target: <1800ms)`,
      suggestions: [
        'Optimize critical rendering path',
        'Inline critical CSS',
        'Minimize render-blocking resources',
        'Use resource hints (preload, prefetch)',
        'Optimize web fonts loading',
      ],
      priority: 'medium',
    },
  ];
}

/**
 * Generates suggestions to improve Time to First Byte (TTFB) performance based on the latest measurement.
 * @example
 * getTTFBSuggestions({ latest: 950 })
 * [
 *   {
 *     metric: 'TTFB',
 *     issue: 'Time to First Byte is 950ms (target: <800ms)',
 *     suggestions: [
 *       'Optimize server response times',
 *       'Use CDN for global distribution',
 *       'Implement server-side caching',
 *       'Optimize database queries',
 *       'Use edge computing for dynamic content'
 *     ],
 *     priority: 'high'
 *   }
 * ]
 * @param {Object} data - An object containing the latest TTFB measurement.
 * @param {number|null} data.latest - The latest TTFB value in milliseconds or null if not available.
 * @returns {PerformanceSuggestion[]} An array containing performance improvement suggestions for TTFB.
 * @description
 *   - The function assumes a target TTFB of under 800ms.
 *   - Generates a high-priority performance suggestion report.
 */
function getTTFBSuggestions(data: { latest: number | null }): PerformanceSuggestion[] {
  return [
    {
      metric: 'TTFB',
      issue: `Time to First Byte is ${data.latest}ms (target: <800ms)`,
      suggestions: [
        'Optimize server response times',
        'Use CDN for global distribution',
        'Implement server-side caching',
        'Optimize database queries',
        'Use edge computing for dynamic content',
      ],
      priority: 'high',
    },
  ];
}

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
export function getPerformanceOptimizationSuggestions(): PerformanceSuggestion[] {
  const { summary } = getPerformanceMetrics();
  let allSuggestions: PerformanceSuggestion[] = [];

  for (const [metricName, data] of Object.entries(summary)) {
    const name = metricName as MetricName;
    if (data.rating === 'poor' || data.rating === 'needs-improvement') {
      switch (name) {
        case 'LCP': {
          allSuggestions = [...allSuggestions, ...getLCPSuggestions(data)];
          break;
        }
        case 'FID': {
          allSuggestions = [...allSuggestions, ...getFIDSuggestions(data)];
          break;
        }
        case 'CLS': {
          allSuggestions = [...allSuggestions, ...getCLSSuggestions(data)];
          break;
        }
        case 'FCP': {
          allSuggestions = [...allSuggestions, ...getFCPSuggestions(data)];
          break;
        }
        case 'TTFB': {
          allSuggestions = [...allSuggestions, ...getTTFBSuggestions(data)];
          break;
        }
      }
    }
  }

  return allSuggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
