"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect, useState, useMemo } from "react";

import type { FeatureFlagKey, FeatureFlagValue } from "./config";
import { DEFAULT_FLAG_VALUES, getEnvironmentFlagOverrides } from "./config";

/**
 * Hook to get a single feature flag value
 */
export function useFeatureFlag(flagKey: FeatureFlagKey): FeatureFlagValue {
  const posthog = usePostHog();
  const [flagValue, setFlagValue] = useState<FeatureFlagValue>(() => {
    // Start with environment override or default
    const envOverrides = getEnvironmentFlagOverrides();
    return envOverrides[flagKey] ?? DEFAULT_FLAG_VALUES[flagKey];
  });

  useEffect(() => {
    if (!posthog) {
      return;
    }

    // Get initial value from PostHog
    const updateFlag = () => {
      // Priority: PostHog -> Environment -> Default
      const posthogValue = posthog.getFeatureFlag(flagKey);
      const envOverrides = getEnvironmentFlagOverrides();

      let finalValue: FeatureFlagValue;

      if (typeof posthogValue === "boolean") {
        finalValue = posthogValue;
      } else if (envOverrides[flagKey] !== undefined) {
        finalValue = envOverrides[flagKey]!;
      } else {
        finalValue = DEFAULT_FLAG_VALUES[flagKey];
      }

      setFlagValue(finalValue);
    };

    // Update immediately
    updateFlag();

    // Listen for flag changes
    posthog.onFeatureFlags(updateFlag);

    return () => {
      // PostHog doesn't provide a way to remove specific listeners
      // The component unmounting will handle cleanup
    };
  }, [posthog, flagKey]);

  return flagValue;
}

/**
 * Hook to get multiple feature flag values
 */
export function useFeatureFlags(
  flagKeys: FeatureFlagKey[]
): Partial<Record<FeatureFlagKey, FeatureFlagValue>> {
  const posthog = usePostHog();

  // Memoize the flagKeys array to prevent infinite re-renders
  const memoizedFlagKeys = useMemo(() => flagKeys, [flagKeys]);

  const [flagValues, setFlagValues] = useState<
    Partial<Record<FeatureFlagKey, FeatureFlagValue>>
  >(() => {
    const envOverrides = getEnvironmentFlagOverrides();
    const initial: Partial<Record<FeatureFlagKey, FeatureFlagValue>> = {};

    for (const key of memoizedFlagKeys) {
      initial[key] = envOverrides[key] ?? DEFAULT_FLAG_VALUES[key];
    }

    return initial;
  });

  useEffect(() => {
    if (!posthog) {
      return;
    }

    const updateFlags = () => {
      const envOverrides = getEnvironmentFlagOverrides();
      const newValues: Partial<Record<FeatureFlagKey, FeatureFlagValue>> = {};

      for (const key of memoizedFlagKeys) {
        const posthogValue = posthog.getFeatureFlag(key);

        if (typeof posthogValue === "boolean") {
          newValues[key] = posthogValue;
        } else if (envOverrides[key] !== undefined) {
          newValues[key] = envOverrides[key]!;
        } else {
          newValues[key] = DEFAULT_FLAG_VALUES[key];
        }
      }

      setFlagValues(newValues);
    };

    updateFlags();
    posthog.onFeatureFlags(updateFlags);

    return () => {
      // Cleanup handled by component unmounting
    };
  }, [posthog, memoizedFlagKeys]);

  return flagValues;
}

/**
 * Hook to check if PostHog is loaded and ready
 */
export function usePostHogReady(): boolean {
  const posthog = usePostHog();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!posthog) {
      setIsReady(false);
      return;
    }

    // Check if PostHog has loaded feature flags
    // We'll consider it ready if we can call getFeatureFlag without error
    try {
      posthog.getFeatureFlag("test");
      setIsReady(true);
    } catch {
      // Wait for feature flags to be loaded
      const checkReady = () => {
        try {
          posthog.getFeatureFlag("test");
          setIsReady(true);
        } catch {
          // Still not ready
        }
      };

      posthog.onFeatureFlags(checkReady);
    }
  }, [posthog]);

  return isReady;
}

/**
 * Hook to get all feature flags (useful for admin interfaces)
 * Memoized to prevent infinite re-renders
 */
export function useAllFeatureFlags(): Partial<
  Record<FeatureFlagKey, FeatureFlagValue>
> {
  const flagKeys = useMemo(
    () => Object.keys(DEFAULT_FLAG_VALUES) as FeatureFlagKey[],
    []
  );
  return useFeatureFlags(flagKeys);
}

/**
 * Utility function to check a feature flag synchronously
 * Only use this if you're sure PostHog is loaded
 */
export function checkFeatureFlag(
  posthog: ReturnType<typeof usePostHog>,
  flagKey: FeatureFlagKey
): FeatureFlagValue {
  if (!posthog) {
    const envOverrides = getEnvironmentFlagOverrides();
    return envOverrides[flagKey] ?? DEFAULT_FLAG_VALUES[flagKey];
  }

  const posthogValue = posthog.getFeatureFlag(flagKey);
  const envOverrides = getEnvironmentFlagOverrides();

  if (typeof posthogValue === "boolean") {
    return posthogValue;
  } else if (envOverrides[flagKey] !== undefined) {
    return envOverrides[flagKey]!;
  } else {
    return DEFAULT_FLAG_VALUES[flagKey];
  }
}

/**
 * Utility hook for source availability
 */
export function useSourceFlags() {
  const flagKeys = useMemo(
    () =>
      [
        "tldr-source-enabled",
        "hacker-news-source-enabled",
        "morning-brew-source-enabled",
        "techcrunch-source-enabled",
      ] as FeatureFlagKey[],
    []
  );

  return useFeatureFlags(flagKeys);
}

/**
 * Utility hook for premium feature availability
 */
export function usePremiumFlags() {
  return useFeatureFlags([
    "premium-tts-enabled",
    "ai-summarization-enabled",
    "openai-tts-enabled",
    "google-tts-enabled",
    "premium-content-enabled",
    "unlimited-generation-enabled",
  ] as FeatureFlagKey[]);
}

/**
 * Client-side feature flag evaluation without hooks (for use in non-React contexts)
 */
export function evaluateFeatureFlag(
  flag: FeatureFlagKey,
  posthog?: { getFeatureFlag: (flag: string) => unknown }
): FeatureFlagValue {
  if (!posthog) {
    return DEFAULT_FLAG_VALUES[flag];
  }

  const value = posthog.getFeatureFlag(flag);
  return typeof value === "boolean" ? value : DEFAULT_FLAG_VALUES[flag];
}
