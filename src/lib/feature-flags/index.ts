// Analytics and tracking
export * from "./analytics";
export * from "./analytics-hooks";

// Client-side hooks and utilities
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

// Feature flags main exports
export type { FeatureFlagKey, FeatureFlagValue } from "./config";
export {
  DEFAULT_FLAG_VALUES,
  FEATURE_FLAGS,
  getEnvironmentFlagOverrides,
} from "./config";
export { PostHogClient } from "./posthog-client";

// Provider and utilities
export { FeatureFlagProvider, identifyUser, resetUser } from "./provider";
// Server-side utilities
export {
  closePostHogClient,
  evaluateFeatureFlag,
  evaluateFeatureFlags,
  evaluateFeatureFlagSync,
  getAllFeatureFlagsSync,
  getAllowedTTSServices,
  getEnabledSources,
  getPostHogClient,
  getPremiumFlags,
  getSourceFlags,
  isAIEnabled,
  isPremiumContentEnabled,
} from "./server";

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
