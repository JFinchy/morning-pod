// Feature flags main exports
export {
  FEATURE_FLAGS,
  DEFAULT_FLAG_VALUES,
  getEnvironmentFlagOverrides,
} from "./config";
export type { FeatureFlagKey, FeatureFlagValue } from "./config";

// Client-side hooks and utilities
export {
  useFeatureFlag,
  useFeatureFlags,
  useAllFeatureFlags,
  usePostHogReady,
  checkFeatureFlag,
  evaluateFeatureFlag as evaluateFeatureFlagClient,
  useSourceFlags,
  usePremiumFlags,
} from "./client";

// Server-side utilities
export {
  evaluateFeatureFlag,
  evaluateFeatureFlags,
  evaluateFeatureFlagSync,
  getAllFeatureFlagsSync,
  getSourceFlags,
  getPremiumFlags,
  getEnabledSources,
  isPremiumContentEnabled,
  isAIEnabled,
  getAllowedTTSServices,
  closePostHogClient,
  getPostHogClient,
} from "./server";

// Provider and utilities
export { FeatureFlagProvider, identifyUser, resetUser } from "./provider";
export { PostHogClient } from "./posthog-client";

// Analytics and tracking
export * from "./analytics";
export * from "./analytics-hooks";

// Common utilities used by both client and server
export const FeatureFlagUtils = {
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

  getFeatureCost: (feature: string): number => {
    // Estimated costs for different features (in USD)
    const costs: Record<string, number> = {
      "ai-summarization-enabled": 0.01, // Per summarization
      "openai-tts-enabled": 0.015, // Per 1000 characters
      "google-tts-enabled": 0.016, // Per 1000 characters
      "premium-content-enabled": 0.005, // Per premium source access
    };
    return costs[feature] ?? 0;
  },
};
