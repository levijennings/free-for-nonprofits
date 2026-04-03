/**
 * PostHog Configuration
 * Environment-based setup for dev/staging/production
 *
 * SETUP INSTRUCTIONS:
 * 1. Install: npm install posthog-js
 * 2. Set environment variables:
 *    - NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-api-key>
 *    - NEXT_PUBLIC_POSTHOG_HOST=<your-posthog-instance-url>
 *    - NEXT_PUBLIC_ENV=development|staging|production
 * 3. For React Native (Pocket Brew):
 *    - npm install posthog-react-native
 *    - Also set EXPO_PUBLIC_POSTHOG_KEY in .env.local
 */

export interface PostHogConfig {
  apiKey: string;
  apiHost: string;
  enabled: boolean;
  capturePageViews: boolean;
  captureNetworkTiming: boolean;
  sessionRecording: {
    enabled: boolean;
    sampleRate: number; // 0-1
  };
  featureFlags: {
    enabled: boolean;
    pollIntervalMS: number;
  };
  persistence: 'localStorage' | 'memory';
  secureCookie: boolean;
  crossOriginCookieHost?: string;
}

export const getPostHogConfig = (environment: string): PostHogConfig => {
  const isProduction = environment === 'production';
  const isStaging = environment === 'staging';
  const isDevelopment = environment === 'development';

  return {
    apiKey:
      process.env.NEXT_PUBLIC_POSTHOG_KEY ||
      'phc_' + (isDevelopment ? 'test' : 'invalid'),
    apiHost:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ||
      'https://app.posthog.com',
    enabled: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
    capturePageViews: true,
    captureNetworkTiming: true,
    sessionRecording: {
      enabled: isProduction || isStaging, // Only in staging/prod
      sampleRate: isProduction ? 0.1 : 0.5, // 10% in prod, 50% in staging
    },
    featureFlags: {
      enabled: true,
      pollIntervalMS: isProduction ? 60000 : 10000, // Poll every 1min in prod, 10s in dev
    },
    persistence: isProduction ? 'localStorage' : 'memory',
    secureCookie: isProduction,
    crossOriginCookieHost: isProduction
      ? '.dvlmnt.com' // Adjust to your domain
      : undefined,
  };
};

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number; // 0-1
  profilesSampleRate: number; // 0-1
  enabled: boolean;
  ignoreErrors: string[];
  beforeSend?: (event: any, hint: any) => any;
}

export const getSentryConfig = (
  environment: string,
  productName: string
): SentryConfig => {
  const isProduction = environment === 'production';

  const dsnMap: Record<string, string> = {
    'free-for-nonprofits': process.env.NEXT_PUBLIC_SENTRY_DSN_FFN || '',
    'bud-badge': process.env.NEXT_PUBLIC_SENTRY_DSN_BB || '',
    'christian-developers': process.env.NEXT_PUBLIC_SENTRY_DSN_CD || '',
    'pocket-brew': process.env.NEXT_PUBLIC_SENTRY_DSN_PB || '',
  };

  return {
    dsn: dsnMap[productName] || '',
    environment,
    // Capture all transactions in dev, 10% in production
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    // Capture all profiles in dev, 5% in production
    profilesSampleRate: isProduction ? 0.05 : 1.0,
    enabled: Boolean(dsnMap[productName]),
    // Ignore known client-side errors that don't need action
    ignoreErrors: [
      'chrome-extension://',
      'moz-extension://',
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'NetworkError',
      'Script error',
      'Uncaught SyntaxError',
    ],
    // Custom before send hook to filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive query parameters
      if (event.request?.url) {
        event.request.url = event.request.url.replace(
          /([?&])(password|token|apikey|api_key|secret)=[^&]*/gi,
          '$1$2=REDACTED'
        );
      }

      // Filter out very common errors
      if (hint.originalException) {
        const message = String(hint.originalException);
        if (
          message.includes('ResizeObserver') ||
          message.includes('top.GLOBALS')
        ) {
          return null; // Don't send
        }
      }

      return event;
    },
  };
};

export interface AnalyticsConfig {
  posthog: PostHogConfig;
  sentry: SentryConfig;
  enabled: boolean;
}

export const getAnalyticsConfig = (
  environment: string,
  productName: string
): AnalyticsConfig => {
  return {
    posthog: getPostHogConfig(environment),
    sentry: getSentryConfig(environment, productName),
    enabled:
      Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY) ||
      Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN_FFN) ||
      Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN_BB) ||
      Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN_CD) ||
      Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN_PB),
  };
};
