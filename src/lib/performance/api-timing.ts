/**
 * API Timing and Performance Middleware
 * Tracks slow API routes and logs performance metrics
 *
 * SETUP:
 * 1. Add middleware to your Next.js app:
 *    // middleware.ts
 *    import { apiTimingMiddleware } from '@/lib/performance/api-timing';
 *    export const middleware = apiTimingMiddleware;
 *
 * 2. Or use decorator in API routes:
 *    export const GET = withApiTiming(myHandler, { slow: 1000 });
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { trackEvent } from '@/lib/analytics/provider';

export interface ApiTimingConfig {
  slow: number; // milliseconds threshold for "slow" API
  logAll: boolean; // log all requests or only slow ones
  capturePayload: boolean; // capture request/response payloads
  maxPayloadSize: number; // max bytes to capture
}

const DEFAULT_CONFIG: ApiTimingConfig = {
  slow: 1000, // 1 second
  logAll: false,
  capturePayload: false,
  maxPayloadSize: 1024, // 1KB
};

/**
 * Wrapper for API route handlers with timing metrics
 * @example
 * export const GET = withApiTiming(myHandler, { slow: 2000 });
 */
export const withApiTiming = <T extends (...args: any[]) => any>(
  handler: T,
  config: Partial<ApiTimingConfig> = {}
): T => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return (async (req: NextRequest, ...args: any[]) => {
    const startTime = performance.now();
    const method = req.method;
    const pathname = req.nextUrl.pathname;
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);

    let response: NextResponse;
    let error: Error | null = null;

    try {
      response = await handler(req, ...args);
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      response = NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const duration = performance.now() - startTime;
    const isSlow = duration > mergedConfig.slow;

    // Only log slow requests or if logAll is enabled
    if (isSlow || mergedConfig.logAll) {
      logApiTiming({
        method,
        pathname,
        duration,
        statusCode: response.status,
        isSlow,
        error,
        searchParams: mergedConfig.capturePayload ? searchParams : undefined,
        config: mergedConfig,
      });
    }

    // Add timing header to response
    const newResponse = new NextResponse(response.body, response);
    newResponse.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    newResponse.headers.set('X-Slow', isSlow ? 'true' : 'false');

    return newResponse;
  }) as T;
};

/**
 * Log API timing metrics
 */
const logApiTiming = (options: {
  method: string;
  pathname: string;
  duration: number;
  statusCode: number;
  isSlow: boolean;
  error: Error | null;
  searchParams?: Record<string, any>;
  config: ApiTimingConfig;
}) => {
  const {
    method,
    pathname,
    duration,
    statusCode,
    isSlow,
    error,
    searchParams,
    config,
  } = options;

  // Build log message
  const logLevel = isSlow ? 'warning' : 'info';
  const logMessage = `[API] ${method} ${pathname} - ${statusCode} - ${duration.toFixed(2)}ms`;

  // Log to console
  if (isSlow) {
    console.warn(logMessage);
  } else if (config.logAll) {
    console.log(logMessage);
  }

  // Send to Sentry if slow
  if (isSlow) {
    Sentry.captureMessage(logMessage, 'warning');
    Sentry.setContext('api_timing', {
      method,
      pathname,
      duration: parseFloat(duration.toFixed(2)),
      status: statusCode,
      query_params: searchParams,
    });
  }

  // Track to analytics
  trackEvent('api_request', {
    method,
    endpoint: pathname,
    duration: parseFloat(duration.toFixed(2)),
    status_code: statusCode,
    is_slow: isSlow,
    error_message: error?.message,
  });

  // Send alert if very slow (>5 seconds)
  if (duration > 5000) {
    Sentry.captureMessage(
      `Very slow API: ${method} ${pathname} took ${duration.toFixed(2)}ms`,
      'error'
    );
  }
};

/**
 * Middleware function for edge runtime
 * Can be used in middleware.ts
 */
export const apiTimingMiddleware = async (
  req: NextRequest,
  res?: NextResponse
) => {
  const startTime = performance.now();

  // Skip non-API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return res;
  }

  const duration = performance.now() - startTime;

  // Add header to response
  if (res) {
    res.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  }

  return res;
};

/**
 * Track database query timing
 */
export const trackDatabaseQuery = async <T,>(
  query: () => Promise<T>,
  queryName: string
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await query();
    const duration = performance.now() - startTime;

    if (duration > 1000) {
      // Log slow queries
      console.warn(`[DB] Slow query: ${queryName} - ${duration.toFixed(2)}ms`);

      Sentry.captureMessage(
        `Slow database query: ${queryName} took ${duration.toFixed(2)}ms`,
        'warning'
      );

      trackEvent('slow_database_query', {
        query_name: queryName,
        duration: parseFloat(duration.toFixed(2)),
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));

    Sentry.captureException(err, {
      tags: {
        database_query: queryName,
        duration: parseFloat(duration.toFixed(2)),
      },
    });

    throw err;
  }
};

/**
 * Track external API calls
 */
export const trackExternalApiCall = async <T,>(
  call: () => Promise<T>,
  serviceName: string,
  endpoint: string
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await call();
    const duration = performance.now() - startTime;

    if (duration > 3000) {
      // Log slow external calls
      console.warn(
        `[EXTERNAL] Slow call to ${serviceName}: ${duration.toFixed(2)}ms`
      );

      trackEvent('slow_external_api_call', {
        service: serviceName,
        endpoint,
        duration: parseFloat(duration.toFixed(2)),
      });
    }

    trackEvent('external_api_call', {
      service: serviceName,
      endpoint,
      duration: parseFloat(duration.toFixed(2)),
      success: true,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));

    Sentry.captureException(err, {
      tags: {
        external_service: serviceName,
        endpoint,
        duration: parseFloat(duration.toFixed(2)),
      },
    });

    trackEvent('external_api_call', {
      service: serviceName,
      endpoint,
      duration: parseFloat(duration.toFixed(2)),
      success: false,
      error: err.message,
    });

    throw err;
  }
};

/**
 * Batch timing measurements
 * Useful for measuring multiple operations in a single request
 */
export class TimingBatcher {
  private timings: Record<string, number> = {};
  private startTimes: Record<string, number> = {};

  start(label: string): void {
    this.startTimes[label] = performance.now();
  }

  end(label: string): number {
    if (!this.startTimes[label]) {
      console.warn(`[Timing] No start time for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - this.startTimes[label];
    this.timings[label] = duration;
    delete this.startTimes[label];

    return duration;
  }

  getAll(): Record<string, number> {
    return { ...this.timings };
  }

  getTotalDuration(): number {
    return Object.values(this.timings).reduce((sum, val) => sum + val, 0);
  }

  report(endpoint: string): void {
    const slowTimings = Object.entries(this.timings)
      .filter(([, duration]) => duration > 100)
      .map(([label, duration]) => `${label}: ${duration.toFixed(2)}ms`)
      .join(', ');

    if (slowTimings) {
      console.warn(
        `[Timing] ${endpoint} slow operations: ${slowTimings}`
      );

      trackEvent('batch_timings', {
        endpoint,
        timings: this.timings,
        total_duration: parseFloat(this.getTotalDuration().toFixed(2)),
      });
    }
  }

  clear(): void {
    this.timings = {};
    this.startTimes = {};
  }
}

/**
 * Example usage:
 *
 * const timing = new TimingBatcher();
 *
 * export const GET = withApiTiming(async (req) => {
 *   timing.start('db_query');
 *   const data = await db.query();
 *   timing.end('db_query');
 *
 *   timing.start('external_api');
 *   const external = await fetch('https://api.example.com');
 *   timing.end('external_api');
 *
 *   timing.report(req.nextUrl.pathname);
 *
 *   return Response.json({ data, external });
 * }, { logAll: true });
 */
