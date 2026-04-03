/**
 * Sentry Configuration - Base Setup
 *
 * SETUP INSTRUCTIONS:
 * 1. Create Sentry projects for each product at sentry.io
 * 2. Install in each product: npm install @sentry/nextjs
 * 3. Set environment variables in each product's .env.local:
 *    - NEXT_PUBLIC_SENTRY_DSN_FFN=https://your-key@your-org.ingest.sentry.io/project-id
 *    - NEXT_PUBLIC_SENTRY_DSN_BB=https://your-key@your-org.ingest.sentry.io/project-id
 *    - NEXT_PUBLIC_SENTRY_DSN_CD=https://your-key@your-org.ingest.sentry.io/project-id
 *    - NEXT_PUBLIC_SENTRY_DSN_PB=https://your-key@your-org.ingest.sentry.io/project-id
 *    - NEXT_PUBLIC_ENV=development|staging|production
 */

import * as Sentry from '@sentry/nextjs';

export interface SentryInitConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  ignoreErrors: string[];
  beforeSend?: (event: Sentry.Event, hint: Sentry.EventHint) => Sentry.Event | null;
  integrations?: Array<Sentry.Integration | (() => Sentry.Integration)>;
}

/**
 * Get Sentry configuration for a specific product
 */
export const getSentryConfig = (
  productName: string,
  environment: string = process.env.NEXT_PUBLIC_ENV || 'development'
): SentryInitConfig => {
  const isProduction = environment === 'production';
  const isStaging = environment === 'staging';

  const dsnMap: Record<string, string> = {
    'free-for-nonprofits': process.env.NEXT_PUBLIC_SENTRY_DSN_FFN || '',
    'bud-badge': process.env.NEXT_PUBLIC_SENTRY_DSN_BB || '',
    'christian-developers': process.env.NEXT_PUBLIC_SENTRY_DSN_CD || '',
    'pocket-brew': process.env.NEXT_PUBLIC_SENTRY_DSN_PB || '',
  };

  return {
    dsn: dsnMap[productName] || '',
    environment,
    release: `${productName}@${process.env.NEXT_PUBLIC_RELEASE || '1.0.0'}`,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    profilesSampleRate: isProduction ? 0.05 : 0,
    ignoreErrors: [
      // Browser extensions
      'chrome-extension://',
      'moz-extension://',
      'safari-reader://',

      // Common client-side errors that don't need action
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'NetworkError',
      'Network request failed',
      'Script error',
      'Uncaught SyntaxError',
      'top.GLOBALS',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',

      // Browser plugin errors
      'originalCreateNotification',
      'canvas.contentDocument',
      '_getBytes',
      'JotformIFrameHeight',
    ],

    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request?.url) {
        event.request.url = sanitizeUrl(event.request.url);
      }

      // Filter error messages
      const errorMessage = event.message || '';
      if (shouldIgnoreError(errorMessage)) {
        return null;
      }

      // Remove breadcrumb URLs with sensitive data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data?.url) {
            breadcrumb.data.url = sanitizeUrl(breadcrumb.data.url);
          }
          return breadcrumb;
        });
      }

      return event;
    },

    integrations: [
      // Sentry integrations
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],
  };
};

/**
 * Initialize Sentry for a Next.js app
 * Call this in your app.tsx or layout.tsx
 */
export const initializeSentry = (config: SentryInitConfig) => {
  if (!config.dsn) {
    console.log(
      `[Sentry] Not initialized - DSN not set for ${config.environment}`
    );
    return;
  }

  Sentry.init({
    ...config,
    // Session replay
    replaysSessionSampleRate: config.environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
  });

  console.log(
    `[Sentry] Initialized for ${config.environment} with release ${config.release}`
  );
};

/**
 * Initialize Sentry for React Native (Pocket Brew)
 */
export const initializeSentryReactNative = (dsn: string, environment: string) => {
  if (!dsn) {
    console.log('[Sentry] Not initialized for React Native - DSN not set');
    return;
  }

  // This would use @sentry/react-native instead
  console.log(
    '[Sentry] React Native initialization would use @sentry/react-native'
  );
};

/**
 * Remove sensitive data from URLs
 */
const sanitizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);

    // Remove sensitive query parameters
    const sensitiveParams = [
      'password',
      'token',
      'apikey',
      'api_key',
      'secret',
      'session',
      'sessionid',
      'email',
      'phone',
      'credit_card',
      'stripe_token',
    ];

    sensitiveParams.forEach((param) => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    });

    return urlObj.toString();
  } catch {
    return '[INVALID_URL]';
  }
};

/**
 * Check if error should be ignored
 */
const shouldIgnoreError = (message: string): boolean => {
  const ignoredPatterns = [
    /ResizeObserver loop limit exceeded/i,
    /top\.GLOBALS is not defined/i,
    /canvas\.contentDocument is not defined/i,
    /NetworkError when attempting to fetch resource/i,
    /Script error\./i,
    /Non-Error promise rejection captured/i,
  ];

  return ignoredPatterns.some((pattern) => pattern.test(message));
};

/**
 * Sentry Hub for server-side error tracking
 */
export const getSentryHub = () => {
  return Sentry.getActiveScope();
};

/**
 * Create breadcrumb for tracking user actions
 */
export const createBreadcrumb = (
  category: string,
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  data?: Record<string, any>
) => {
  Sentry.captureMessage(message, level);

  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Explicitly capture an exception
 */
export const captureException = (
  error: Error | string,
  context?: Record<string, any>
) => {
  if (context) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Set user context
 */
export const setSentryUser = (
  userId: string,
  email?: string,
  username?: string
) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

/**
 * Clear user context on logout
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Set custom context
 */
export const setSentryContext = (key: string, value: Record<string, any>) => {
  Sentry.setContext(key, value);
};
