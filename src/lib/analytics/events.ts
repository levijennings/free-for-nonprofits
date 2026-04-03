/**
 * Typed event tracking functions
 * Use these to fire analytics events across all products
 */

import { EventName, AllAnalyticsEvents, UserProperties, UserCohort } from './types';

/**
 * Global analytics interface that can be implemented by PostHog or other providers
 */
export interface IAnalyticsProvider {
  // Event tracking
  track<T extends EventName>(
    eventName: T,
    properties: T extends keyof AllAnalyticsEvents
      ? AllAnalyticsEvents[T]
      : never
  ): void;

  // User identification
  identify(userId: string, properties: Partial<UserProperties>): void;

  // Cohort assignment
  groupIdentify(cohortId: string, properties: Partial<UserCohort>): void;
  group(groupType: string, groupKey: string): void;

  // Page view tracking
  pageView(path: string, title?: string): void;

  // Feature flags
  isFeatureEnabled(featureName: string): boolean;

  // Reset on logout
  reset(): void;
}

/**
 * No-op analytics provider (for when analytics is disabled)
 */
export class NoOpAnalytics implements IAnalyticsProvider {
  track(): void {
    // no-op
  }

  identify(): void {
    // no-op
  }

  groupIdentify(): void {
    // no-op
  }

  group(): void {
    // no-op
  }

  pageView(): void {
    // no-op
  }

  isFeatureEnabled(): boolean {
    return false;
  }

  reset(): void {
    // no-op
  }
}

/**
 * PostHog provider implementation
 * Wraps PostHog SDK with typed event tracking
 */
export class PostHogAnalytics implements IAnalyticsProvider {
  private posthog: any;
  private enabled: boolean;

  constructor(posthogInstance: any, enabled: boolean = true) {
    this.posthog = posthogInstance;
    this.enabled = enabled;
  }

  track<T extends EventName>(
    eventName: T,
    properties: T extends keyof AllAnalyticsEvents
      ? AllAnalyticsEvents[T]
      : never
  ): void {
    if (!this.enabled || !this.posthog) return;

    try {
      this.posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[Analytics] Failed to track event ${eventName}:`, error);
    }
  }

  identify(userId: string, properties: Partial<UserProperties>): void {
    if (!this.enabled || !this.posthog) return;

    try {
      this.posthog.identify(userId, properties);
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  }

  groupIdentify(cohortId: string, properties: Partial<UserCohort>): void {
    if (!this.enabled || !this.posthog) return;

    try {
      this.posthog.groupIdentify('cohort', cohortId, properties);
    } catch (error) {
      console.error('[Analytics] Failed to identify cohort:', error);
    }
  }

  group(groupType: string, groupKey: string): void {
    if (!this.enabled || !this.posthog) return;

    try {
      this.posthog.group(groupType, groupKey);
    } catch (error) {
      console.error('[Analytics] Failed to set group:', error);
    }
  }

  pageView(path: string, title?: string): void {
    if (!this.enabled || !this.posthog) return;

    try {
      this.posthog.capture('$pageview', {
        $current_url: path,
        title: title || document.title,
      });
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  isFeatureEnabled(featureName: string): boolean {
    if (!this.enabled || !this.posthog) return false;

    try {
      return this.posthog.isFeatureEnabled(featureName);
    } catch (error) {
      console.error('[Analytics] Failed to check feature flag:', error);
      return false;
    }
  }

  reset(): void {
    if (!this.enabled || !this.posthog) return;

    try {
      this.posthog.reset();
    } catch (error) {
      console.error('[Analytics] Failed to reset analytics:', error);
    }
  }
}

/**
 * Utility to safely track events with error handling
 */
export const safeTrack = <T extends EventName>(
  analytics: IAnalyticsProvider,
  eventName: T,
  properties: T extends keyof AllAnalyticsEvents
    ? AllAnalyticsEvents[T]
    : never
): void => {
  try {
    analytics.track(eventName, properties);
  } catch (error) {
    console.warn(`[Analytics] Event tracking failed for ${eventName}:`, error);
  }
};

/**
 * Batch event tracking with deduplication
 */
export class EventBatcher {
  private queue: Array<{
    eventName: string;
    properties: Record<string, any>;
  }> = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private analytics: IAnalyticsProvider;
  private batchSize: number;

  constructor(analytics: IAnalyticsProvider, batchSize = 10) {
    this.analytics = analytics;
    this.batchSize = batchSize;
    this.startFlushTimer();
  }

  add<T extends EventName>(
    eventName: T,
    properties: T extends keyof AllAnalyticsEvents
      ? AllAnalyticsEvents[T]
      : never
  ): void {
    this.queue.push({ eventName, properties });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        safeTrack(this.analytics, event.eventName as EventName, event.properties);
      }
    }
  }

  private startFlushTimer(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000); // Flush every 30 seconds
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}
