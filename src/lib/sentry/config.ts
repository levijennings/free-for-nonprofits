/**
 * Sentry Configuration - Base Setup (Stub Implementation)
 *
 * This is a stub implementation that provides the same interface as Sentry
 * but doesn't require the @sentry/nextjs package.
 *
 * To enable Sentry in production:
 * 1. npm install @sentry/nextjs
 * 2. Replace this file with the real Sentry config
 */

export interface SentryInitConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  ignoreErrors: string[];
  beforeSend?: (event: any, hint: any) => any | null;
  integrations?: any[];
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

    integrations: [],
  };
};

/**
 * Initialize Sentry for a Next.js app (Stub Implementation)
 * Call this in your app.tsx or layout.tsx
 */
export const initializeSentry = (config: SentryInitConfig) => {
  if (!config.dsn) {
    console.log(
      `[Sentry] Not initialized - DSN not set for ${config.environment}`
    );
    return;
  }

  // Stub implementation - does nothing
  console.log(
    `[Sentry] Stub initialized for ${config.environment} with release ${config.release}`
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
 * Sentry Hub for server-side error tracking (Stub)
 */
export const getSentryHub = () => {
  return null;
};

/**
 * Create breadcrumb for tracking user actions (Stub)
 */
export const createBreadcrumb = (
  category: string,
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  data?: Record<string, any>
) => {
  // Stub implementation
};

/**
 * Explicitly capture an exception (Stub)
 */
export const captureException = (
  error: Error | string,
  context?: Record<string, any>
) => {
  // Stub implementation
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, context);
  }
};

/**
 * Set user context (Stub)
 */
export const setSentryUser = (
  userId: string,
  email?: string,
  username?: string
) => {
  // Stub implementation
};

/**
 * Clear user context on logout (Stub)
 */
export const clearSentryUser = () => {
  // Stub implementation
};

/**
 * Set custom context (Stub)
 */
export const setSentryContext = (key: string, value: Record<string, any>) => {
  // Stub implementation
};
