/**
 * API Handler Wrapper with Sentry Integration
 * Automatically captures errors from API routes and logs performance metrics
 *
 * USAGE:
 * export const POST = withSentryErrorHandler(async (req: Request) => {
 *   const data = await req.json();
 *   return Response.json({ data });
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { captureException, createBreadcrumb } from './config';

export interface ApiMetrics {
  statusCode: number;
  duration: number;
  method: string;
  path: string;
  cacheHit?: boolean;
  dbQueries?: number;
  externalApiCalls?: number;
}

/**
 * Higher-order function to wrap API route handlers with error handling
 */
export const withSentryErrorHandler = <T extends (...args: any[]) => any>(
  handler: T,
  options?: {
    captureRequest?: boolean;
    captureResponse?: boolean;
    timeout?: number;
  }
): T => {
  return (async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;

    // Add breadcrumb for request
    createBreadcrumb(
      'http.request',
      `${method} ${path}`,
      'info',
      {
        method,
        path,
        headers: Object.fromEntries(req.headers),
      }
    );

    try {
      // Add timeout if specified
      let response: NextResponse;

      if (options?.timeout) {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('API route timeout')),
            options.timeout
          )
        );

        response = (await Promise.race([
          handler(req, ...args),
          timeoutPromise,
        ])) as NextResponse;
      } else {
        response = await handler(req, ...args);
      }

      // Log success
      const duration = Date.now() - startTime;
      createBreadcrumb(
        'http.response',
        `${method} ${path} - ${response.status}`,
        'info',
        {
          status: response.status,
          duration,
        }
      );

      // Add performance metrics
      recordApiMetrics({
        statusCode: response.status,
        duration,
        method,
        path,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Capture error with context
      const err = error instanceof Error ? error : new Error(String(error));
      captureException(err, {
        request: {
          method,
          path,
          url: req.url,
        },
        duration,
      });

      // Log error breadcrumb
      createBreadcrumb(
        'http.error',
        `${method} ${path} - ${err.message}`,
        'error',
        {
          error: err.message,
          stack: err.stack,
          duration,
        }
      );

      // Return error response
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: err.message,
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
        { status: 500 }
      );
    }
  }) as T;
};

/**
 * Middleware to track all API requests
 */
export const apiMetricsMiddleware = (
  req: NextRequest,
  res: NextResponse
): NextResponse => {
  const startTime = Date.now();

  // Create a wrapper response that tracks the duration
  const originalClone = res.clone.bind(res);
  res.clone = function() {
    const duration = Date.now() - startTime;
    recordApiMetrics({
      statusCode: res.status,
      duration,
      method: req.method,
      path: req.nextUrl.pathname,
    });
    return originalClone();
  };

  return res;
};

/**
 * Record API metrics to Sentry
 */
const recordApiMetrics = (metrics: ApiMetrics) => {
  // Only record slow requests in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const slowThreshold = isDevelopment ? 2000 : 1000; // ms

  if (metrics.duration > slowThreshold) {
    Sentry.captureMessage(
      `Slow API request: ${metrics.method} ${metrics.path} (${metrics.duration}ms)`,
      'warning'
    );
  }

  // Record in Sentry transaction
  if (Sentry.getActiveSpan()) {
    Sentry.getActiveSpan()?.setData('api.metrics', metrics);
  }
};

/**
 * Wrapper for database operations with error tracking
 */
export const withDbErrorHandler = async <T,>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await operation();

    const duration = Date.now() - startTime;
    if (duration > 1000) {
      createBreadcrumb(
        'database.query',
        `${operationName} took ${duration}ms`,
        'warning'
      );
    }

    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    captureException(err, {
      database_operation: operationName,
      duration: Date.now() - startTime,
    });

    throw err;
  }
};

/**
 * Wrapper for external API calls with error tracking
 */
export const withExternalApiErrorHandler = async <T,>(
  operation: () => Promise<T>,
  serviceName: string,
  url: string
): Promise<T> => {
  const startTime = Date.now();

  try {
    createBreadcrumb(
      'external.api',
      `Calling ${serviceName}`,
      'debug',
      { service: serviceName, url }
    );

    const result = await operation();

    const duration = Date.now() - startTime;
    createBreadcrumb(
      'external.api',
      `${serviceName} responded successfully (${duration}ms)`,
      'info',
      { service: serviceName, duration }
    );

    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const duration = Date.now() - startTime;

    captureException(err, {
      external_service: serviceName,
      external_url: url,
      duration,
    });

    createBreadcrumb(
      'external.api.error',
      `${serviceName} failed: ${err.message}`,
      'error',
      { service: serviceName, error: err.message, duration }
    );

    throw err;
  }
};

/**
 * Utility to extract user information from request
 */
export const extractUserFromRequest = (req: NextRequest): string | undefined => {
  try {
    // Check for user ID in headers (passed by middleware)
    const userId = req.headers.get('x-user-id');
    return userId || undefined;
  } catch {
    return undefined;
  }
};

/**
 * Set user context from request
 */
export const setSentryUserFromRequest = (req: NextRequest) => {
  const userId = extractUserFromRequest(req);
  if (userId) {
    Sentry.setUser({
      id: userId,
    });
  }
};
