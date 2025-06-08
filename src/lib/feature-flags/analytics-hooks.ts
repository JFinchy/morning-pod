"use client";

import { usePostHog } from "posthog-js/react";
import { useCallback, useMemo } from "react";

import {
  createAnalyticsService,
  type AnalyticsService,
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
    setUserProperties,
    reset,
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
      error: string | Error,
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
        page?: string;
        component?: string;
      }
    ) => {
      analytics.trackPerformance(metric, value, context);
    },
    [analytics]
  );

  return {
    track,
    trackPageView,
    trackInteraction,
    trackError,
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
        sourceId,
        sourceName,
        estimatedDuration,
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
        sourceId,
        sourceName,
        duration,
        audioLength,
        cost,
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
        sourceId,
        sourceName,
        error,
        duration,
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
        sourceId,
        sourceName,
        articlesCount,
        duration,
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
        sourceId,
        wordCount,
        summaryLength,
        model,
        cost,
        qualityScore,
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
        sourceId,
        textLength,
        audioLength,
        voice,
        cost,
      });
    },
    [track]
  );

  return {
    trackGenerationStarted,
    trackGenerationCompleted,
    trackGenerationFailed,
    trackContentScraped,
    trackContentSummarized,
    trackAudioGenerated,
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
        sourceId,
        position,
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
        episodeId,
        totalDuration,
        watchTime,
        completionRate,
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
    trackEpisodePlayed,
    trackEpisodePaused,
    trackEpisodeCompleted,
    trackEpisodeDownloaded,
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
      source: "posthog" | "environment" | "default"
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
    trackFeatureFlag,
    trackExperimentView,
    trackExperimentConversion,
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
    (error: string | Error, page?: string) => {
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
