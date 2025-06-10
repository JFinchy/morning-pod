"use client";

import { usePostHog } from "posthog-js/react";
import { useCallback, useMemo } from "react";

import {
  type AnalyticsService,
  createAnalyticsService,
  type EventName,
  type EventProperties,
  type UserProperties,
} from "./analytics";

/**
 * Hook to get the analytics service instance
 */
export function useAnalytics(): AnalyticsService {
  const posthog = usePostHog();

  return useMemo(() => createAnalyticsService(posthog), [posthog]);
}

/**
 * Hook for user identification
 */
export function useUserIdentification() {
  const analytics = useAnalytics();

  const identify = useCallback(
    (properties: UserProperties) => {
      analytics.identify(properties);
    },
    [analytics]
  );

  const setUserProperties = useCallback(
    (properties: Partial<UserProperties>) => {
      analytics.setUserProperties(properties);
    },
    [analytics]
  );

  const reset = useCallback(() => {
    analytics.reset();
  }, [analytics]);

  return {
    identify,
    reset,
    setUserProperties,
  };
}

/**
 * Hook for event tracking
 */
export function useEventTracking() {
  const analytics = useAnalytics();

  const track = useCallback(
    <T extends EventName>(eventName: T, properties: EventProperties<T>) => {
      analytics.track(eventName, properties);
    },
    [analytics]
  );

  const trackPageView = useCallback(
    (page: string, properties?: Record<string, unknown>) => {
      analytics.trackPageView(page, properties);
    },
    [analytics]
  );

  const trackInteraction = useCallback(
    (
      component: string,
      action: string,
      variant?: string,
      properties?: Record<string, unknown>
    ) => {
      analytics.trackInteraction(component, action, variant, properties);
    },
    [analytics]
  );

  const trackError = useCallback(
    (
      error: Error | string,
      context?: {
        component?: string;
        page?: string;
        userId?: string;
      }
    ) => {
      analytics.trackError(error, context);
    },
    [analytics]
  );

  const trackPerformance = useCallback(
    (
      metric: string,
      value: number,
      context?: {
        component?: string;
        page?: string;
      }
    ) => {
      analytics.trackPerformance(metric, value, context);
    },
    [analytics]
  );

  return {
    track,
    trackError,
    trackInteraction,
    trackPageView,
    trackPerformance,
  };
}

/**
 * Hook for podcast-specific analytics
 */
export function usePodcastAnalytics() {
  const { track } = useEventTracking();

  const trackGenerationStarted = useCallback(
    (sourceId: string, sourceName: string, estimatedDuration?: number) => {
      track("podcast-generation-started", {
        estimatedDuration,
        sourceId,
        sourceName,
      });
    },
    [track]
  );

  const trackGenerationCompleted = useCallback(
    (
      sourceId: string,
      sourceName: string,
      duration: number,
      audioLength?: number,
      cost?: number
    ) => {
      track("podcast-generation-completed", {
        audioLength,
        cost,
        duration,
        sourceId,
        sourceName,
      });
    },
    [track]
  );

  const trackGenerationFailed = useCallback(
    (
      sourceId: string,
      sourceName: string,
      error: string,
      duration?: number
    ) => {
      track("podcast-generation-failed", {
        duration,
        error,
        sourceId,
        sourceName,
      });
    },
    [track]
  );

  const trackContentScraped = useCallback(
    (
      sourceId: string,
      sourceName: string,
      articlesCount: number,
      duration: number
    ) => {
      track("content-scraped", {
        articlesCount,
        duration,
        sourceId,
        sourceName,
      });
    },
    [track]
  );

  const trackContentSummarized = useCallback(
    (
      sourceId: string,
      wordCount: number,
      summaryLength: number,
      model: string,
      cost?: number,
      qualityScore?: number
    ) => {
      track("content-summarized", {
        cost,
        model,
        qualityScore,
        sourceId,
        summaryLength,
        wordCount,
      });
    },
    [track]
  );

  const trackAudioGenerated = useCallback(
    (
      sourceId: string,
      textLength: number,
      audioLength: number,
      voice: string,
      cost?: number
    ) => {
      track("audio-generated", {
        audioLength,
        cost,
        sourceId,
        textLength,
        voice,
      });
    },
    [track]
  );

  return {
    trackAudioGenerated,
    trackContentScraped,
    trackContentSummarized,
    trackGenerationCompleted,
    trackGenerationFailed,
    trackGenerationStarted,
  };
}

/**
 * Hook for player analytics
 */
export function usePlayerAnalytics() {
  const { track } = useEventTracking();

  const trackEpisodePlayed = useCallback(
    (episodeId: string, sourceId: string, position?: number) => {
      track("episode-played", {
        episodeId,
        position,
        sourceId,
      });
    },
    [track]
  );

  const trackEpisodePaused = useCallback(
    (episodeId: string, position: number, watchTime: number) => {
      track("episode-paused", {
        episodeId,
        position,
        watchTime,
      });
    },
    [track]
  );

  const trackEpisodeCompleted = useCallback(
    (
      episodeId: string,
      totalDuration: number,
      watchTime: number,
      completionRate: number
    ) => {
      track("episode-completed", {
        completionRate,
        episodeId,
        totalDuration,
        watchTime,
      });
    },
    [track]
  );

  const trackEpisodeDownloaded = useCallback(
    (episodeId: string, sourceId: string) => {
      track("episode-downloaded", {
        episodeId,
        sourceId,
      });
    },
    [track]
  );

  return {
    trackEpisodeCompleted,
    trackEpisodeDownloaded,
    trackEpisodePaused,
    trackEpisodePlayed,
  };
}

/**
 * Hook for feature flag analytics
 */
export function useFeatureFlagAnalytics() {
  const analytics = useAnalytics();

  const trackFeatureFlag = useCallback(
    (
      flagKey: string,
      flagValue: boolean | string,
      source: "default" | "environment" | "posthog"
    ) => {
      analytics.trackFeatureFlag(flagKey, flagValue, source);
    },
    [analytics]
  );

  const trackExperimentView = useCallback(
    (experimentKey: string, variant: string) => {
      analytics.trackExperimentView(experimentKey, variant);
    },
    [analytics]
  );

  const trackExperimentConversion = useCallback(
    (experimentKey: string, variant: string, conversionType: string) => {
      analytics.trackExperimentConversion(
        experimentKey,
        variant,
        conversionType
      );
    },
    [analytics]
  );

  return {
    trackExperimentConversion,
    trackExperimentView,
    trackFeatureFlag,
  };
}

/**
 * Hook for page view tracking (use in page components)
 */
export function usePageViewTracking(pageName: string) {
  const { trackPageView } = useEventTracking();

  // Track page view on mount
  useMemo(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
}

/**
 * Hook for automatic error tracking
 */
export function useErrorTracking(component?: string) {
  const { trackError } = useEventTracking();

  const trackComponentError = useCallback(
    (error: Error | string, page?: string) => {
      trackError(error, {
        component,
        page,
      });
    },
    [trackError, component]
  );

  return {
    trackComponentError,
  };
}
