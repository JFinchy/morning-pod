/**
 * PostHog Analytics Service
 * Provides utilities for user identification, event tracking, and analytics
 */

import type { PostHog } from "posthog-js";

// Event types for type safety
export interface AnalyticsEvents {
  // User events
  "user-signed-in": {
    userId: string;
    email?: string;
    method: "email" | "oauth" | "magic-link";
  };
  "user-signed-out": {
    userId: string;
    sessionDuration?: number;
  };
  "user-profile-updated": {
    userId: string;
    fields: string[];
  };

  // Podcast Generation Events
  "podcast-generation-started": {
    sourceId: string;
    sourceName: string;
    estimatedDuration?: number;
  };
  "podcast-generation-completed": {
    sourceId: string;
    sourceName: string;
    duration: number;
    audioLength?: number;
    cost?: number;
  };
  "podcast-generation-failed": {
    sourceId: string;
    sourceName: string;
    error: string;
    duration?: number;
  };

  // Content Events
  "content-scraped": {
    sourceId: string;
    sourceName: string;
    articlesCount: number;
    duration: number;
  };
  "content-summarized": {
    sourceId: string;
    wordCount: number;
    summaryLength: number;
    model: string;
    cost?: number;
    qualityScore?: number;
  };
  "audio-generated": {
    sourceId: string;
    textLength: number;
    audioLength: number;
    voice: string;
    cost?: number;
  };

  // Player Events
  "episode-played": {
    episodeId: string;
    sourceId: string;
    position?: number;
  };
  "episode-paused": {
    episodeId: string;
    position: number;
    watchTime: number;
  };
  "episode-completed": {
    episodeId: string;
    totalDuration: number;
    watchTime: number;
    completionRate: number;
  };
  "episode-downloaded": {
    episodeId: string;
    sourceId: string;
  };

  // Feature Flag Events
  "feature-flag-evaluated": {
    flagKey: string;
    flagValue: boolean | string;
    source: "posthog" | "environment" | "default";
  };
  "experiment-viewed": {
    experimentKey: string;
    variant: string;
  };
  "experiment-converted": {
    experimentKey: string;
    variant: string;
    conversionType: string;
  };

  // UI Events
  "page-viewed": {
    page: string;
    referrer?: string;
  };
  "component-interacted": {
    component: string;
    action: string;
    variant?: string;
  };
  "error-occurred": {
    error: string;
    component?: string;
    page?: string;
    userId?: string;
  };

  // Performance Events
  "performance-metric": {
    metric: string;
    value: number;
    page?: string;
    component?: string;
  };
}

export type EventName = keyof AnalyticsEvents;
export type EventProperties<T extends EventName> = AnalyticsEvents[T];

/**
 * User properties for identification
 */
export interface UserProperties {
  userId: string;
  email?: string;
  name?: string;
  subscriptionTier?: "free" | "premium";
  signupDate?: string;
  lastActiveDate?: string;
  totalEpisodesGenerated?: number;
  totalListenTime?: number;
  preferredSources?: string[];
  preferredVoices?: string[];
}

/**
 * Analytics service class
 */
export class AnalyticsService {
  private posthog: PostHog | null;

  constructor(posthog: PostHog | null) {
    this.posthog = posthog;
  }

  /**
   * Identify a user with PostHog
   */
  identify(properties: UserProperties): void {
    if (!this.posthog) {
      console.warn("PostHog not initialized - skipping identify");
      return;
    }

    const { userId, ...userProps } = properties;

    this.posthog.identify(userId, userProps);

    // Also set user properties for session
    this.posthog.setPersonProperties(userProps);

    console.log("User identified:", userId, userProps);
  }

  /**
   * Track an analytics event
   */
  track<T extends EventName>(
    eventName: T,
    properties: EventProperties<T>
  ): void {
    if (!this.posthog) {
      console.warn(`PostHog not initialized - skipping event: ${eventName}`);
      return;
    }

    // Add common properties
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    this.posthog.capture(eventName, enrichedProperties);

    console.log(`Event tracked: ${eventName}`, enrichedProperties);
  }

  /**
   * Set user properties without re-identifying
   */
  setUserProperties(properties: Partial<UserProperties>): void {
    if (!this.posthog) {
      console.warn("PostHog not initialized - skipping setUserProperties");
      return;
    }

    this.posthog.setPersonProperties(properties);
  }

  /**
   * Reset user session (on logout)
   */
  reset(): void {
    if (!this.posthog) {
      console.warn("PostHog not initialized - skipping reset");
      return;
    }

    this.posthog.reset();
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: Record<string, unknown>): void {
    this.track("page-viewed", {
      page,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      ...properties,
    });
  }

  /**
   * Track component interaction
   */
  trackInteraction(
    component: string,
    action: string,
    variant?: string,
    properties?: Record<string, unknown>
  ): void {
    this.track("component-interacted", {
      component,
      action,
      variant,
      ...properties,
    });
  }

  /**
   * Track error
   */
  trackError(
    error: string | Error,
    context?: {
      component?: string;
      page?: string;
      userId?: string;
    }
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;

    this.track("error-occurred", {
      error: errorMessage,
      component: context?.component,
      page: context?.page,
      userId: context?.userId,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(
    metric: string,
    value: number,
    context?: {
      page?: string;
      component?: string;
    }
  ): void {
    this.track("performance-metric", {
      metric,
      value,
      page: context?.page,
      component: context?.component,
    });
  }

  /**
   * Track feature flag evaluation
   */
  trackFeatureFlag(
    flagKey: string,
    flagValue: boolean | string,
    source: "posthog" | "environment" | "default"
  ): void {
    this.track("feature-flag-evaluated", {
      flagKey,
      flagValue,
      source,
    });
  }

  /**
   * Track experiment events
   */
  trackExperimentView(experimentKey: string, variant: string): void {
    this.track("experiment-viewed", {
      experimentKey,
      variant,
    });
  }

  trackExperimentConversion(
    experimentKey: string,
    variant: string,
    conversionType: string
  ): void {
    this.track("experiment-converted", {
      experimentKey,
      variant,
      conversionType,
    });
  }
}

/**
 * Create analytics service instance
 */
export function createAnalyticsService(
  posthog: PostHog | null
): AnalyticsService {
  return new AnalyticsService(posthog);
}

/**
 * Analytics context for user identification
 */
export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  tier?: "free" | "premium";
}

/**
 * Utility to get common event properties
 */
export function getCommonEventProperties() {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}
