/**
 * Web Vitals Tracking
 * Captures Core Web Vitals and sends to PostHog and Sentry
 *
 * SETUP:
 * 1. Install: npm install web-vitals
 * 2. Use in your app.tsx or _app.tsx:
 *    import { trackWebVitals } from '@/lib/performance/web-vitals';
 *    trackWebVitals();
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';
import { trackEvent } from '@/lib/analytics/provider';
import * as Sentry from '@sentry/nextjs';

export interface WebVitalsMetrics {
  name: string; // LCP, FID, CLS, etc.
  value: number;
  delta: number;
  id: string;
  isFinal: boolean;
  rating: 'good' | 'ni' | 'poor'; // needs improvement
}

/**
 * Track Web Vitals using web-vitals library
 * Call this in your app root
 */
export const trackWebVitals = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Track Cumulative Layout Shift
  getCLS(handleWebVital);

  // Track Interaction to Next Paint
  getINP(handleWebVital);

  // Track First Contentful Paint
  getFCP(handleWebVital);

  // Track Largest Contentful Paint
  getLCP(handleWebVital);

  // Track Time to First Byte
  getTTFB(handleWebVital);

  // Track First Input Delay (deprecated, but useful for older browsers)
  if (getFID) {
    getFID(handleWebVital);
  }
};

/**
 * Handle individual Web Vital metric
 */
const handleWebVital = (metric: WebVitalsMetrics) => {
  const threshold = getThreshold(metric.name);
  const isGood = metric.value <= threshold;

  // Only track poor metrics or sample good ones (10%)
  if (!isGood || Math.random() < 0.1) {
    // Track to PostHog
    trackEvent(`web_vital_${metric.name.toLowerCase()}`, {
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      is_good: isGood,
      threshold,
      page_path: window.location.pathname,
      page_title: document.title,
      user_agent: navigator.userAgent,
      connection_type: getConnectionType(),
      device_memory: (navigator as any).deviceMemory,
      effective_type: getEffectiveType(),
    });

    // Track to Sentry
    if (!isGood) {
      Sentry.captureMessage(
        `Poor Web Vital: ${metric.name} = ${metric.value.toFixed(2)}ms`,
        'warning'
      );
      Sentry.setContext('web_vital', {
        metric: metric.name,
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        threshold,
      });
    }
  }
};

/**
 * Get threshold for each metric (in milliseconds or unitless)
 */
const getThreshold = (metricName: string): number => {
  const thresholds: Record<string, number> = {
    LCP: 2500, // Largest Contentful Paint - 2.5s
    FID: 100, // First Input Delay - 100ms
    INP: 200, // Interaction to Next Paint - 200ms
    CLS: 0.1, // Cumulative Layout Shift - unitless
    TTFB: 800, // Time to First Byte - 800ms
    FCP: 1800, // First Contentful Paint - 1.8s
  };

  return thresholds[metricName] || 0;
};

/**
 * Get connection type (4g, 3g, 2g, slow-2g)
 */
const getConnectionType = (): string => {
  if ('connection' in navigator) {
    return (navigator as any).connection.effectiveType;
  }
  return 'unknown';
};

/**
 * Get effective type from Navigator
 */
const getEffectiveType = (): string => {
  if ('connection' in navigator) {
    return (navigator as any).connection.effectiveType;
  }
  if ('mozConnection' in navigator) {
    return (navigator as any).mozConnection.effectiveType;
  }
  return 'unknown';
};

/**
 * Monitor and log performance entries
 */
export const trackPerformanceEntries = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  // Observe performance entries as they occur
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            trackNavigationTiming(entry);
          } else if (entry.entryType === 'resource') {
            trackResourceTiming(entry);
          } else if (entry.entryType === 'paint') {
            trackPaintTiming(entry);
          }
        }
      });

      observer.observe({
        entryTypes: ['navigation', 'resource', 'paint'],
        buffered: true,
      });
    } catch (error) {
      console.error('Failed to observe performance entries:', error);
    }
  }
};

/**
 * Track navigation timing metrics
 */
const trackNavigationTiming = (entry: any) => {
  const navigationTiming = {
    dns_duration: entry.domainLookupEnd - entry.domainLookupStart,
    tcp_duration: entry.connectEnd - entry.connectStart,
    ttfb: entry.responseStart - entry.requestStart,
    download_duration: entry.responseEnd - entry.responseStart,
    dom_interactive: entry.domInteractive - entry.fetchStart,
    dom_complete: entry.domComplete - entry.fetchStart,
    load_complete: entry.loadEventEnd - entry.fetchStart,
  };

  trackEvent('navigation_timing', navigationTiming);
};

/**
 * Track resource timing for external assets
 */
const trackResourceTiming = (entry: any) => {
  // Only track slow resources (>1s)
  const duration = entry.responseEnd - entry startTime;
  if (duration > 1000) {
    trackEvent('slow_resource', {
      url: entry.name,
      duration,
      resource_type: entry.initiatorType,
      size: entry.transferSize,
      decoded_size: entry.decodedBodySize,
    });
  }
};

/**
 * Track paint timing (FCP, LCP)
 */
const trackPaintTiming = (entry: any) => {
  trackEvent('paint_timing', {
    paint_name: entry.name,
    start_time: entry.startTime,
  });
};

/**
 * React hook for component performance monitoring
 * Measures how long components take to render
 */
export const useComponentPerformance = (componentName: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 100) {
      // Only log slow renders
      trackEvent('slow_component_render', {
        component_name: componentName,
        duration,
      });
    }
  };
};

/**
 * Track memory usage (if available)
 */
export const trackMemoryUsage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    trackEvent('memory_usage', {
      used_mb: memory.usedJSHeapSize / 1048576,
      limit_mb: memory.jsHeapSizeLimit / 1048576,
      external_mb: memory.totalExternalSize / 1048576,
    });
  }
};

/**
 * Throttle function calls to prevent excessive tracking
 */
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function (...args: any[]) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Monitor Core Web Vitals continuously
 * Called periodically during page lifecycle
 */
export const monitorCoreWebVitals = () => {
  // Run initial tracking
  trackWebVitals();
  trackPerformanceEntries();

  // Periodically check memory usage
  if ('memory' in performance) {
    const memoryCheck = throttle(trackMemoryUsage, 30000); // Every 30 seconds
    setInterval(() => {
      memoryCheck();
    }, 30000);
  }

  // Track page visibility changes
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      trackEvent('page_visibility_changed', {
        visible: !document.hidden,
      });
    });
  }
};

/**
 * Export metrics for testing or monitoring dashboard
 */
export const getPerformanceMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const nav = performance.getEntriesByType('navigation')[0] as any;
  if (!nav) return {};

  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    dom_interactive: nav.domInteractive - nav.fetchStart,
    dom_complete: nav.domComplete - nav.fetchStart,
    load_complete: nav.loadEventEnd - nav.fetchStart,
  };
};
