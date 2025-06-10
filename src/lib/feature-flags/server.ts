import { PostHog } from "posthog-node";

import { type FeatureFlagKey, type FeatureFlagValue } from "./config";
import {
  DEFAULT_FLAG_VALUES,
  getEnvironmentFlagOverrides,
  SERVER_POSTHOG_CONFIG,
} from "./config";

// Server-side PostHog client (singleton)
let posthogClient: null | PostHog = null;

export function getPostHogClient(): null | PostHog {
  if (!SERVER_POSTHOG_CONFIG.enabled || !SERVER_POSTHOG_CONFIG.projectApiKey) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(SERVER_POSTHOG_CONFIG.projectApiKey, {
      host: SERVER_POSTHOG_CONFIG.host,
    });
  }

  return posthogClient;
}

/**
 * Server-side feature flag evaluation
 * Priority: PostHog -> Environment variables -> Default values
 */
export async function evaluateFeatureFlag(
  flagKey: FeatureFlagKey,
  userIdentifier?: string
): Promise<FeatureFlagValue> {
  // Environment overrides always take priority
  const envOverrides = getEnvironmentFlagOverrides();
  if (envOverrides[flagKey] !== undefined) {
    return envOverrides[flagKey]!;
  }

  // Try PostHog if configured
  const posthog = getPostHogClient();
  if (posthog && userIdentifier) {
    try {
      const flagValue = await posthog.getFeatureFlag(flagKey, userIdentifier);
      if (typeof flagValue === "boolean") {
        return flagValue;
      }
    } catch (error) {
      console.warn(
        `Failed to evaluate feature flag ${flagKey} from PostHog:`,
        error
      );
    }
  }

  // Fallback to default
  return DEFAULT_FLAG_VALUES[flagKey];
}

/**
 * Evaluate multiple feature flags at once
 */
export async function evaluateFeatureFlags(
  flagKeys: FeatureFlagKey[],
  userIdentifier?: string
): Promise<Partial<Record<FeatureFlagKey, FeatureFlagValue>>> {
  const results: Partial<Record<FeatureFlagKey, FeatureFlagValue>> = {};

  await Promise.all(
    flagKeys.map(async (key) => {
      results[key] = await evaluateFeatureFlag(key, userIdentifier);
    })
  );

  return results;
}

/**
 * Synchronous feature flag evaluation (no PostHog, only env + defaults)
 * Use when PostHog async evaluation is not possible
 */
export function evaluateFeatureFlagSync(
  flagKey: FeatureFlagKey
): FeatureFlagValue {
  const envOverrides = getEnvironmentFlagOverrides();
  return envOverrides[flagKey] ?? DEFAULT_FLAG_VALUES[flagKey];
}

/**
 * Get all feature flags synchronously (useful for server components)
 */
export function getAllFeatureFlagsSync(): Record<
  FeatureFlagKey,
  FeatureFlagValue
> {
  const envOverrides = getEnvironmentFlagOverrides();
  const result = {} as Record<FeatureFlagKey, FeatureFlagValue>;

  for (const [key, defaultValue] of Object.entries(DEFAULT_FLAG_VALUES)) {
    const flagKey = key as FeatureFlagKey;
    result[flagKey] = envOverrides[flagKey] ?? defaultValue;
  }

  return result;
}

/**
 * Server-side utility for source availability
 */
export async function getSourceFlags(
  userIdentifier?: string
): Promise<Partial<Record<FeatureFlagKey, FeatureFlagValue>>> {
  return evaluateFeatureFlags(
    [
      "tldr-source-enabled",
      "hacker-news-source-enabled",
      "morning-brew-source-enabled",
      "techcrunch-source-enabled",
    ],
    userIdentifier
  );
}

/**
 * Server-side utility for premium feature availability
 */
export async function getPremiumFlags(
  userIdentifier?: string
): Promise<Partial<Record<FeatureFlagKey, FeatureFlagValue>>> {
  return evaluateFeatureFlags(
    [
      "premium-tts-enabled",
      "ai-summarization-enabled",
      "openai-tts-enabled",
      "google-tts-enabled",
      "premium-content-enabled",
      "unlimited-generation-enabled",
    ],
    userIdentifier
  );
}

/**
 * Filter sources based on feature flags
 */
export async function getEnabledSources<T extends { id: string }>(
  sources: T[],
  userIdentifier?: string
): Promise<T[]> {
  const sourceFlags = await getSourceFlags(userIdentifier);

  return sources.filter((source) => {
    switch (source.id) {
      case "tldr":
        return sourceFlags["tldr-source-enabled"] ?? true;
      case "hacker-news":
        return sourceFlags["hacker-news-source-enabled"] ?? true;
      case "morning-brew":
        return sourceFlags["morning-brew-source-enabled"] ?? true;
      case "techcrunch":
        return sourceFlags["techcrunch-source-enabled"] ?? false;
      default:
        return true; // Unknown sources default to enabled
    }
  });
}

/**
 * Check if premium content is allowed
 */
export async function isPremiumContentEnabled(
  userIdentifier?: string
): Promise<boolean> {
  return evaluateFeatureFlag("premium-content-enabled", userIdentifier);
}

/**
 * Check if AI features are enabled
 */
export async function isAIEnabled(userIdentifier?: string): Promise<boolean> {
  const aiFlags = await evaluateFeatureFlags(
    ["ai-summarization-enabled", "premium-tts-enabled"],
    userIdentifier
  );

  return (
    (aiFlags["ai-summarization-enabled"] ?? false) &&
    (aiFlags["premium-tts-enabled"] ?? false)
  );
}

/**
 * Get allowed TTS services based on feature flags
 */
export async function getAllowedTTSServices(
  userIdentifier?: string
): Promise<string[]> {
  const ttsFlags = await evaluateFeatureFlags(
    ["openai-tts-enabled", "google-tts-enabled"],
    userIdentifier
  );

  const services: string[] = [];
  if (ttsFlags["openai-tts-enabled"]) services.push("openai");
  if (ttsFlags["google-tts-enabled"]) services.push("google");

  return services;
}

/**
 * Close PostHog client connection (useful for cleanup)
 */
export async function closePostHogClient(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
