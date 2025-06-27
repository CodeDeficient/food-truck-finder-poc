'use client';

import { useEffect } from 'react';
import { initWebVitalsMonitoring } from '@/lib/performance/webVitals';

/**
 * Web Vitals Reporter Component
 * Initializes Core Web Vitals monitoring for the application
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Only initialize in browser environment
    if (globalThis.window != undefined) {
      initWebVitalsMonitoring();
    }
  }, []);

  // This component doesn't render anything

}
