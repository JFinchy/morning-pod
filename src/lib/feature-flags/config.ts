// Feature flag configuration
// This file is used by both client and server code, so we keep it pure TypeScript

export const FEATURE_FLAGS = {
  // Premium features
  "premium-tts-enabled": false,
  "ai-summarization-enabled": false,
  "openai-tts-enabled": false,
  "google-tts-enabled": false,

  // Source availability
  "tldr-source-enabled": true,
  "hacker-news-source-enabled": true,
  "morning-brew-source-enabled": false,
  "techcrunch-source-enabled": false,

  // Content tiers
  "premium-content-enabled": false,
  "free-content-enabled": true,

  // Generation limits
  "high-daily-limits-enabled": false,
  "unlimited-generation-enabled": false,

  // UI features
  "advanced-player-enabled": false,
  "real-time-queue-enabled": true,
  "visual-episode-cards-enabled": true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = boolean;

// PostHog configuration (client-side only)
export const POSTHOG_CONFIG = {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  projectApiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
  // Only enable PostHog in production or when explicitly enabled
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_POSTHOG_ENABLED === "true",
  options: {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only" as const,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
  },
};

// Server-side PostHog configuration
export const SERVER_POSTHOG_CONFIG = {
  host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
  projectApiKey: process.env.POSTHOG_PROJECT_API_KEY || "",
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.POSTHOG_ENABLED === "true",
};

// Default flag values for fallback/development
export const DEFAULT_FLAG_VALUES: Record<FeatureFlagKey, boolean> = {
  // Premium features - default to enabled for development
  "premium-tts-enabled": true,
  "ai-summarization-enabled": true,
  "openai-tts-enabled": true,
  "google-tts-enabled": true,

  // Sources - all enabled by default
  "tldr-source-enabled": true,
  "hacker-news-source-enabled": true,
  "morning-brew-source-enabled": true,
  "techcrunch-source-enabled": false, // Currently inactive in mock data

  // Content tiers - both enabled by default
  "premium-content-enabled": true,
  "free-content-enabled": true,

  // Generation limits - conservative defaults
  "high-daily-limits-enabled": false,
  "unlimited-generation-enabled": false,

  // UI features - enabled by default
  "advanced-player-enabled": true,
  "real-time-queue-enabled": true,
  "visual-episode-cards-enabled": true,
};

// Feature flag evaluation priority:
// 1. PostHog remote flags (if configured)
// 2. Environment variable overrides
// 3. Default values
export function getEnvironmentFlagOverrides(): Partial<
  Record<FeatureFlagKey, boolean>
> {
  return {
    // Premium features
    "premium-tts-enabled": process.env.PREMIUM_TTS_ENABLED === "true",
    "ai-summarization-enabled": process.env.AI_SUMMARIZATION_ENABLED === "true",
    "openai-tts-enabled": process.env.OPENAI_TTS_ENABLED === "true",

    // Sources
    "tldr-source-enabled": process.env.TLDR_SOURCE_ENABLED !== "false",
    "hacker-news-source-enabled":
      process.env.HACKER_NEWS_SOURCE_ENABLED !== "false",
    "morning-brew-source-enabled":
      process.env.MORNING_BREW_SOURCE_ENABLED !== "false",
    "techcrunch-source-enabled":
      process.env.TECHCRUNCH_SOURCE_ENABLED === "true",
  };
}
