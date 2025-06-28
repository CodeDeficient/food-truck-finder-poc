declare module 'web-vitals' {
  export interface Metric {
    name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB';
    value: number;
    delta: number;
    id: string;
    entries: PerformanceEntry[];
    navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  }

  export function getCLS(onPerfEntry: (metric: Metric) => void): void;
  export function getFCP(onPerfEntry: (metric: Metric) => void): void;
  export function getFID(onPerfEntry: (metric: Metric) => void): void;
  export function getLCP(onPerfEntry: (metric: Metric) => void): void;
  export function getTTFB(onPerfEntry: (metric: Metric) => void): void;
}
