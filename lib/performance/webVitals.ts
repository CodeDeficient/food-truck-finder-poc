/**
 * SOTA Core Web Vitals Monitoring Implementation
 * Tracks LCP, FID, CLS, FCP, and TTFB metrics for performance optimization
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals';

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
        latest: undefined,
        average: 0,
        rating: 'no-data',
        count: 0,
      };
    } else {
      const latest = metricData.at(-1);
      const average = metricData.reduce((sum, m) => sum + m.value, 0) / metricData.length;

      summary[name] = {
        latest: latest?.value ?? undefined,
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
