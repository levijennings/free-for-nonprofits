/**
 * Health Check Endpoints for all products
 *
 * Basic endpoint: GET /api/health
 * Deep check endpoint: GET /api/health/deep
 *
 * SETUP:
 * 1. Create these files in each product:
 *    - free-for-nonprofits/src/app/api/health/route.ts
 *    - bud-badge/src/app/api/health/route.ts
 *    - christian-developers/src/app/api/health/route.ts
 *    - pocket-brew/app/api/health/route.ts (React Native backend)
 *
 * 2. Use the health check endpoints in your monitoring service:
 *    Better Uptime: https://yourapp.com/api/health
 *    Pingdom: https://yourapp.com/api/health/deep
 *
 * 3. Example curl commands:
 *    curl https://yourapp.com/api/health
 *    curl https://yourapp.com/api/health/deep
 */

import { NextRequest, NextResponse } from 'next/server';
import { withSentryErrorHandler } from '@/lib/sentry/api-handler';
import * as Sentry from '@sentry/nextjs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number; // seconds
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime: number; // ms
    };
    cache?: {
      status: 'up' | 'down';
      responseTime: number;
    };
    payment?: {
      status: 'up' | 'down';
      responseTime: number;
    };
    externalServices?: {
      [key: string]: {
        status: 'up' | 'down';
        responseTime: number;
      };
    };
  };
  errors?: string[];
}

const startTime = Date.now();

/**
 * Basic Health Check - GET /api/health
 * Returns quick status without deep checks
 */
export const GET = withSentryErrorHandler(
  async (req: NextRequest): Promise<NextResponse<HealthStatus>> => {
    const uptime = (Date.now() - startTime) / 1000;

    // Quick database check
    const dbStatus = await checkDatabase();

    const isHealthy = dbStatus.status === 'up';
    const status: HealthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_RELEASE || '1.0.0',
      uptime,
      checks: {
        database: dbStatus,
      },
    };

    const statusCode = isHealthy ? 200 : 503;
    return NextResponse.json(status, { status: statusCode });
  },
  { timeout: 10000 }
);

/**
 * Deep Health Check - GET /api/health/deep
 * Comprehensive health check including external services
 */
export const POST = withSentryErrorHandler(
  async (req: NextRequest): Promise<NextResponse<HealthStatus>> => {
    const uptime = (Date.now() - startTime) / 1000;
    const errors: string[] = [];

    // Database check
    const dbStatus = await checkDatabase().catch((error) => {
      errors.push(`Database check failed: ${error.message}`);
      return { status: 'down' as const, responseTime: 0 };
    });

    // Cache check (if using Redis)
    let cacheStatus;
    if (process.env.REDIS_URL) {
      cacheStatus = await checkCache().catch((error) => {
        errors.push(`Cache check failed: ${error.message}`);
        return { status: 'down' as const, responseTime: 0 };
      });
    }

    // Stripe check (if using Stripe)
    let paymentStatus;
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      paymentStatus = await checkStripe().catch((error) => {
        errors.push(`Stripe check failed: ${error.message}`);
        return { status: 'down' as const, responseTime: 0 };
      });
    }

    // External services check
    const externalServices = await checkExternalServices().catch((error) => {
      errors.push(`External services check failed: ${error.message}`);
      return {};
    });

    // Determine overall health
    const allHealthy =
      dbStatus.status === 'up' &&
      (!cacheStatus || cacheStatus.status === 'up') &&
      (!paymentStatus || paymentStatus.status === 'up');

    const status: HealthStatus = {
      status: allHealthy ? 'healthy' : errors.length > 0 ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_RELEASE || '1.0.0',
      uptime,
      checks: {
        database: dbStatus,
        ...(cacheStatus && { cache: cacheStatus }),
        ...(paymentStatus && { payment: paymentStatus }),
        ...(Object.keys(externalServices).length > 0 && {
          externalServices,
        }),
      },
      ...(errors.length > 0 && { errors }),
    };

    const statusCode = status.status === 'healthy' ? 200 : status.status === 'degraded' ? 206 : 503;
    return NextResponse.json(status, { status: statusCode });
  },
  { timeout: 30000 }
);

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{
  status: 'up' | 'down';
  responseTime: number;
}> {
  const startTime = Date.now();

  try {
    // Check Supabase connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
        {
          method: 'OPTIONS',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Database returned ${response.status}`);
      }
    }

    return {
      status: 'up',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { health_check: 'database' },
    });

    return {
      status: 'down',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check Redis cache connectivity
 */
async function checkCache(): Promise<{
  status: 'up' | 'down';
  responseTime: number;
}> {
  const startTime = Date.now();

  try {
    // If using Upstash Redis
    if (process.env.REDIS_REST_URL && process.env.REDIS_REST_TOKEN) {
      const response = await fetch(`${process.env.REDIS_REST_URL}/ping`, {
        headers: {
          Authorization: `Bearer ${process.env.REDIS_REST_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Redis returned ${response.status}`);
      }
    }

    return {
      status: 'up',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { health_check: 'cache' },
    });

    return {
      status: 'down',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check Stripe API connectivity
 */
async function checkStripe(): Promise<{
  status: 'up' | 'down';
  responseTime: number;
}> {
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe returned ${response.status}`);
    }

    return {
      status: 'up',
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { health_check: 'stripe' },
    });

    return {
      status: 'down',
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check external services (PostHog, Sentry, etc.)
 */
async function checkExternalServices(): Promise<
  Record<string, { status: 'up' | 'down'; responseTime: number }>
> {
  const checks: Record<string, { status: 'up' | 'down'; responseTime: number }> = {};

  // Check PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_HOST) {
    const startTime = Date.now();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/api/teams`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY}`,
          },
        }
      );

      checks.posthog = {
        status: response.ok ? 'up' : 'down',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      checks.posthog = {
        status: 'down',
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Check Sentry
  if (process.env.NEXT_PUBLIC_SENTRY_DSN_FFN) {
    const startTime = Date.now();
    try {
      const response = await fetch('https://sentry.io', {
        method: 'HEAD',
      });

      checks.sentry = {
        status: response.ok ? 'up' : 'down',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      checks.sentry = {
        status: 'down',
        responseTime: Date.now() - startTime,
      };
    }
  }

  return checks;
}
