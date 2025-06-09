// Client-only feature flag exports
// This file avoids importing server-side dependencies

// Client-side analytics service factory
export type {
  AnalyticsEvents,
  AnalyticsService,
  AnalyticsUser,
  EventName,
  EventProperties,
  UserProperties,
} from "./analytics";
export { createAnalyticsService } from "./analytics";

// Analytics and tracking (client-only)
export * from "./analytics-hooks";

// Client-side hooks and utilities only
export {
  checkFeatureFlag,
  evaluateFeatureFlag as evaluateFeatureFlagClient,
  useAllFeatureFlags,
  useFeatureFlag,
  useFeatureFlags,
  usePostHogReady,
  usePremiumFlags,
  useSourceFlags,
} from "./client";
// Feature flags configuration
export type { FeatureFlagKey, FeatureFlagValue } from "./config";
export {
  DEFAULT_FLAG_VALUES,
  FEATURE_FLAGS,
  getEnvironmentFlagOverrides,
} from "./config";
export { PostHogClient } from "./posthog-client";
// Provider and utilities (client-safe)
export { FeatureFlagProvider, identifyUser, resetUser } from "./provider";

// Common utilities used by both client and server
export const FeatureFlagUtils = {
  getFeatureCost: (feature: string): number => {
    // Estimated costs for different features (in USD)
    const costs: Record<string, number> = {
      "ai-summarization-enabled": 0.01, // Per summarization
      "google-tts-enabled": 0.016, // Per 1000 characters
      "openai-tts-enabled": 0.015, // Per 1000 characters
      "premium-content-enabled": 0.005, // Per premium source access
    };
    return costs[feature] ?? 0;
  },

  isPremiumFeature: (feature: string): boolean => {
    const premiumFeatures = [
      "premium-tts-enabled",
      "ai-summarization-enabled",
      "openai-tts-enabled",
      "premium-content-enabled",
      "unlimited-generation-enabled",
    ];
    return premiumFeatures.includes(feature);
  },

  isSourceEnabled: (
    sourceId: string,
    flags: Record<string, boolean>
  ): boolean => {
    switch (sourceId) {
      case "tldr":
        return flags["tldr-source-enabled"] ?? true;
      case "hacker-news":
        return flags["hacker-news-source-enabled"] ?? true;
      case "morning-brew":
        return flags["morning-brew-source-enabled"] ?? true;
      case "techcrunch":
        return flags["techcrunch-source-enabled"] ?? false;
      default:
        return true;
    }
  },
};
