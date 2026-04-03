/**
 * PostHog Provider Wrapper for React applications
 * Initialize PostHog SDK and wrap app with analytics context
 *
 * SETUP INSTRUCTIONS:
 * 1. Install dependencies:
 *    npm install posthog-js
 *
 * 2. Use in your app root (e.g., app.tsx or _app.tsx):
 *    import { PostHogProvider } from '@/lib/analytics/provider';
 *
 *    export default function RootLayout({ children }) {
 *      return (
 *        <PostHogProvider>
 *          {children}
 *        </PostHogProvider>
 *      );
 *    }
 *
 * 3. Set environment variables in .env.local:
 *    NEXT_PUBLIC_POSTHOG_KEY=<your-key>
 *    NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
 *    NEXT_PUBLIC_ENV=development|staging|production
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { PostHog } from 'posthog-js';
import { AnalyticsProvider } from './hooks';
import { PostHogAnalytics, NoOpAnalytics } from './events';
import { getPostHogConfig } from './config';
import { IAnalyticsProvider } from './events';

// Initialize PostHog globally
let posthogInstance: PostHog | null = null;

const initializePostHog = (): PostHog | null => {
  // Only initialize in browser
  if (typeof window === 'undefined') {
    return null;
  }

  // Avoid re-initialization
  if (posthogInstance) {
    return posthogInstance;
  }

  try {
    // Dynamic import to avoid SSR issues
    const { posthog } = require('posthog-js');

    const environment = process.env.NEXT_PUBLIC_ENV || 'development';
    const config = getPostHogConfig(environment);

    if (!config.enabled) {
      console.log(
        '[Analytics] PostHog disabled - NEXT_PUBLIC_POSTHOG_KEY not set'
      );
      return null;
    }

    posthog.init(config.apiKey, {
      api_host: config.apiHost,
      capture_pageview: config.capturePageViews,
      capture_pageleave: true,
      persistence: config.persistence,
      secure_cookie: config.secureCookie,
      cross_origin_cookie_host: config.crossOriginCookieHost,
      enable_session_recording: config.sessionRecording.enabled,
      session_recording: {
        sample_rate: config.sessionRecording.sampleRate,
        minimum_duration_milliseconds: 0,
      },
      feature_flags: {
        poll_interval_seconds: Math.floor(config.featureFlags.pollIntervalMS / 1000),
      },
      autocapture: true,
      autocapture_opt_out_serverside_matching: false,
      opt_out_capturing_by_default: false,
      property_blacklist: [
        'password',
        'token',
        'apikey',
        'api_key',
        'secret',
        'credit_card',
        'creditcard',
        'ssn',
        'social_security_number',
      ],
    });

    posthogInstance = posthog;
    console.log('[Analytics] PostHog initialized successfully');

    return posthogInstance;
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error);
    return null;
  }
};

/**
 * Analytics Provider Component
 * Wraps app with PostHog context
 */
export const PostHogProvider = ({ children }: { children: ReactNode }) => {
  const [analyticsProvider, setAnalyticsProvider] = useState<IAnalyticsProvider>(
    new NoOpAnalytics()
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const posthog = initializePostHog();
    if (posthog) {
      setAnalyticsProvider(new PostHogAnalytics(posthog, true));
    } else {
      setAnalyticsProvider(new NoOpAnalytics());
    }
  }, []);

  // Don't render until client-side (avoid hydration mismatch)
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <AnalyticsProvider provider={analyticsProvider}>
      {children}
    </AnalyticsProvider>
  );
};

/**
 * Hook to get PostHog instance directly
 * Use only when you need low-level access to PostHog
 */
export const usePostHog = (): PostHog | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const { posthog } = require('posthog-js');
    return posthog || posthogInstance;
  } catch {
    return posthogInstance;
  }
};

/**
 * Function to update PostHog user properties
 * Call this after user identification
 */
export const updatePostHogUser = (
  userId: string,
  properties: Record<string, any>
): void => {
  const posthog = posthogInstance || initializePostHog();
  if (!posthog) {
    console.warn('[Analytics] PostHog not initialized');
    return;
  }

  try {
    posthog.identify(userId, {
      email: properties.email,
      name: properties.name,
      plan: properties.plan,
      signup_date: properties.signup_date,
      ...properties,
    });
  } catch (error) {
    console.error('[Analytics] Failed to update PostHog user:', error);
  }
};

/**
 * Function to track custom event
 * Call this from anywhere in your app
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
): void => {
  const posthog = posthogInstance || initializePostHog();
  if (!posthog) {
    console.warn('[Analytics] PostHog not initialized');
    return;
  }

  try {
    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
};

/**
 * Function to reset analytics on logout
 */
export const resetAnalytics = (): void => {
  const posthog = posthogInstance;
  if (!posthog) return;

  try {
    posthog.reset();
    console.log('[Analytics] Analytics reset on logout');
  } catch (error) {
    console.error('[Analytics] Failed to reset analytics:', error);
  }
};

/**
 * Export PostHog instance for server-side usage
 * (if using Node.js SDK)
 */
export const getPostHogInstance = (): PostHog | null => {
  return posthogInstance;
};
