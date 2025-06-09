/**
 * PostHog Analytics Service
 * Provides utilities for user identification, event tracking, and analytics
 */

import { type PostHog } from "posthog-js";

// Event types for type safety
export interface AnalyticsEvents {
  "audio-generated": {
    audioLength: number;
    cost?: number;
    sourceId: string;
    textLength: number;
    voice: string;
  };
  "component-interacted": {
    action: string;
    component: string;
    variant?: string;
  };
  // Content Events
  "content-scraped": {
    articlesCount: number;
    duration: number;
    sourceId: string;
    sourceName: string;
  };

  "content-summarized": {
    cost?: number;
    model: string;
    qualityScore?: number;
    sourceId: string;
    summaryLength: number;
    wordCount: number;
  };
  "episode-completed": {
    completionRate: number;
    episodeId: string;
    totalDuration: number;
    watchTime: number;
  };
  "episode-downloaded": {
    episodeId: string;
    sourceId: string;
  };

  "episode-paused": {
    episodeId: string;
    position: number;
    watchTime: number;
  };
  // Player Events
  "episode-played": {
    episodeId: string;
    position?: number;
    sourceId: string;
  };
  "error-occurred": {
    component?: string;
    error: string;
    page?: string;
    userId?: string;
  };

  "experiment-converted": {
    conversionType: string;
    experimentKey: string;
    variant: string;
  };
  "experiment-viewed": {
    experimentKey: string;
    variant: string;
  };
  // Feature Flag Events
  "feature-flag-evaluated": {
    flagKey: string;
    flagValue: boolean | string;
    source: "default" | "environment" | "posthog";
  };
  // UI Events
  "page-viewed": {
    page: string;
    referrer?: string;
  };

  // Performance Events
  "performance-metric": {
    component?: string;
    metric: string;
    page?: string;
    value: number;
  };
  "podcast-generation-completed": {
    audioLength?: number;
    cost?: number;
    duration: number;
    sourceId: string;
    sourceName: string;
  };
  "podcast-generation-failed": {
    duration?: number;
    error: string;
    sourceId: string;
    sourceName: string;
  };

  // Podcast Generation Events
  "podcast-generation-started": {
    estimatedDuration?: number;
    sourceId: string;
    sourceName: string;
  };
  "user-profile-updated": {
    fields: string[];
    userId: string;
  };
  // User events
  "user-signed-in": {
    email?: string;
    method: "email" | "magic-link" | "oauth";
    userId: string;
  };

  "user-signed-out": {
    sessionDuration?: number;
    userId: string;
  };
}

export type EventName = keyof AnalyticsEvents;
export type EventProperties<T extends EventName> = AnalyticsEvents[T];

/**
 * User properties for identification
 */
export interface UserProperties {
  email?: string;
  lastActiveDate?: string;
  name?: string;
  preferredSources?: string[];
  preferredVoices?: string[];
  signupDate?: string;
  subscriptionTier?: "free" | "premium";
  totalEpisodesGenerated?: number;
  totalListenTime?: number;
  userId: string;
}

/**
 * Analytics service class
 */
export class AnalyticsService {
  private posthog: null | PostHog;

  constructor(posthog: null | PostHog) {
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
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
    };

    this.posthog.capture(eventName, enrichedProperties);

    console.log(`Event tracked: ${eventName}`, enrichedProperties);
  }

  /**
   * Track error
   */
  trackError(
    error: Error | string,
    context?: {
      component?: string;
      page?: string;
      userId?: string;
    }
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;

    this.track("error-occurred", {
      component: context?.component,
      error: errorMessage,
      page: context?.page,
      userId: context?.userId,
    });
  }

  trackExperimentConversion(
    experimentKey: string,
    variant: string,
    conversionType: string
  ): void {
    this.track("experiment-converted", {
      conversionType,
      experimentKey,
      variant,
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

  /**
   * Track feature flag evaluation
   */
  trackFeatureFlag(
    flagKey: string,
    flagValue: boolean | string,
    source: "default" | "environment" | "posthog"
  ): void {
    this.track("feature-flag-evaluated", {
      flagKey,
      flagValue,
      source,
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
      action,
      component,
      variant,
      ...properties,
    });
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
   * Track performance metric
   */
  trackPerformance(
    metric: string,
    value: number,
    context?: {
      component?: string;
      page?: string;
    }
  ): void {
    this.track("performance-metric", {
      component: context?.component,
      metric,
      page: context?.page,
      value,
    });
  }
}

/**
 * Create analytics service instance
 */
export function createAnalyticsService(
  posthog: null | PostHog
): AnalyticsService {
  return new AnalyticsService(posthog);
}

/**
 * Analytics context for user identification
 */
export interface AnalyticsUser {
  email?: string;
  id: string;
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
    pathname: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    viewport: {
      height: window.innerHeight,
      width: window.innerWidth,
    },
  };
}
