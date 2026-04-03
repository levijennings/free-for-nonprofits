/**
 * React hooks for analytics tracking
 * Use in components across all web products
 *
 * USAGE:
 * const { track, identify, pageView } = useAnalytics();
 * track('button_clicked', { button_id: 'submit' });
 */

'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { EventName, AllAnalyticsEvents, UserProperties } from './types';
import { IAnalyticsProvider, NoOpAnalytics } from './events';

// Create context for analytics provider
const AnalyticsContext = createContext<IAnalyticsProvider | null>(null);

/**
 * Analytics Provider Wrapper
 * Wrap your app with this component
 */
export const AnalyticsProvider = ({
  children,
  provider,
}: {
  children: ReactNode;
  provider: IAnalyticsProvider;
}) => {
  return (
    <AnalyticsContext.Provider value={provider}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Main hook for tracking events
 * @example
 * const { track } = useAnalytics();
 * track('button_clicked', { button_name: 'Submit' });
 */
export const useAnalytics = () => {
  const provider = useContext(AnalyticsContext);

  if (!provider) {
    console.warn(
      '[Analytics] useAnalytics called outside of AnalyticsProvider. Using no-op provider.'
    );
  }

  const analytics = provider || new NoOpAnalytics();

  const track = useCallback(
    <T extends EventName>(
      eventName: T,
      properties: T extends keyof AllAnalyticsEvents
        ? AllAnalyticsEvents[T]
        : never
    ) => {
      analytics.track(eventName, properties);
    },
    [analytics]
  );

  const identify = useCallback(
    (userId: string, properties: Partial<UserProperties>) => {
      analytics.identify(userId, properties);
    },
    [analytics]
  );

  const pageView = useCallback(
    (path: string, title?: string) => {
      analytics.pageView(path, title);
    },
    [analytics]
  );

  const group = useCallback(
    (groupType: string, groupKey: string) => {
      analytics.group(groupType, groupKey);
    },
    [analytics]
  );

  const isFeatureEnabled = useCallback(
    (featureName: string): boolean => {
      return analytics.isFeatureEnabled(featureName);
    },
    [analytics]
  );

  const reset = useCallback(() => {
    analytics.reset();
  }, [analytics]);

  return {
    track,
    identify,
    pageView,
    group,
    isFeatureEnabled,
    reset,
  };
};

/**
 * Hook to track page views automatically
 * @example
 * usePageView('/products', 'Products Page');
 */
export const usePageView = (path: string, title?: string) => {
  const { pageView } = useAnalytics();

  useEffect(() => {
    pageView(path, title);
  }, [path, title, pageView]);
};

/**
 * Hook to track user signup
 * @example
 * useTrackSignup('user@example.com', 'oauth');
 */
export const useTrackSignup = (
  email: string,
  signupMethod: 'email' | 'oauth' | 'invite'
) => {
  const { track } = useAnalytics();

  useEffect(() => {
    track('user_signup', {
      signup_method: signupMethod,
      email,
      referrer: document.referrer,
    });
  }, [email, signupMethod, track]);
};

/**
 * Hook to track when user identifies (logs in)
 * @example
 * useIdentifyUser('user-123', { email: 'user@example.com', plan: 'pro' });
 */
export const useIdentifyUser = (
  userId: string,
  properties?: Partial<UserProperties>
) => {
  const { identify } = useAnalytics();

  useEffect(() => {
    identify(userId, properties || {});
  }, [userId, properties, identify]);
};

/**
 * Hook to track errors that occur in components
 * @example
 * useErrorTracking();
 */
export const useErrorTracking = () => {
  const { track } = useAnalytics();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      track('error_occurred', {
        error_code: 'UNCAUGHT_ERROR',
        error_message: event.message,
        error_context: event.filename || 'unknown',
        severity: 'high',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      track('error_occurred', {
        error_code: 'UNHANDLED_REJECTION',
        error_message: String(event.reason),
        error_context: 'Promise rejection',
        severity: 'medium',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, [track]);
};

/**
 * Hook for feature flag checking
 * @example
 * const isNewUIEnabled = useFeatureFlag('new_ui');
 */
export const useFeatureFlag = (featureName: string): boolean => {
  const { isFeatureEnabled } = useAnalytics();
  return isFeatureEnabled(featureName);
};

/**
 * Hook to track element visibility (intersection observer)
 * @example
 * const ref = useTrackVisibility('hero_section');
 * return <div ref={ref}>...</div>;
 */
export const useTrackVisibility = (elementName: string) => {
  const { track } = useAnalytics();
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          track('page_view', {
            path: elementName,
            title: elementName,
          });
          observer.disconnect();
        }
      });

      observer.observe(node);
    },
    [elementName, track]
  );

  return ref;
};

/**
 * Hook for tracking time spent on page
 * @example
 * useTrackTimeOnPage('product_page', () => console.log('User spent X seconds'));
 */
export const useTrackTimeOnPage = (
  pageName: string,
  onLeave?: (timeSpent: number) => void
) => {
  const { track } = useAnalytics();

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onLeave?.(timeSpent);
      track('page_view', {
        path: pageName,
        title: pageName,
      });
    };
  }, [pageName, track, onLeave]);
};
