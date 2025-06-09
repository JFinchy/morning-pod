// Feature flag configuration
// This file is used by both client and server code, so we keep it pure TypeScript

export const FEATURE_FLAGS = {
  // UI features
  "advanced-player-enabled": false,
  "ai-summarization-enabled": false,
  "free-content-enabled": true,
  "google-tts-enabled": false,

  "hacker-news-source-enabled": true,
  // Generation limits
  "high-daily-limits-enabled": false,
  "morning-brew-source-enabled": false,
  "openai-tts-enabled": false,

  // Content tiers
  "premium-content-enabled": false,
  // Premium features
  "premium-tts-enabled": false,

  "real-time-queue-enabled": true,
  "techcrunch-source-enabled": false,

  // Source availability
  "tldr-source-enabled": true,
  "unlimited-generation-enabled": false,
  "visual-episode-cards-enabled": true,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue = boolean;

// PostHog configuration (client-side only)
export const POSTHOG_CONFIG = {
  // Only enable PostHog in production or when explicitly enabled
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_POSTHOG_ENABLED === "true",
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  options: {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    person_profiles: "identified_only" as const,
  },
  projectApiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
};

// Server-side PostHog configuration
export const SERVER_POSTHOG_CONFIG = {
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.POSTHOG_ENABLED === "true",
  host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
  projectApiKey: process.env.POSTHOG_PROJECT_API_KEY || "",
};

// Default flag values for fallback/development
export const DEFAULT_FLAG_VALUES: Record<FeatureFlagKey, boolean> = {
  // UI features - enabled by default
  "advanced-player-enabled": true,
  "ai-summarization-enabled": true,
  "free-content-enabled": true,
  "google-tts-enabled": true,

  "hacker-news-source-enabled": true,
  // Generation limits - conservative defaults
  "high-daily-limits-enabled": false,
  "morning-brew-source-enabled": true,
  "openai-tts-enabled": true,

  // Content tiers - both enabled by default
  "premium-content-enabled": true,
  // Premium features - default to enabled for development
  "premium-tts-enabled": true,

  "real-time-queue-enabled": true,
  "techcrunch-source-enabled": false, // Currently inactive in mock data

  // Sources - all enabled by default
  "tldr-source-enabled": true,
  "unlimited-generation-enabled": false,
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
    "ai-summarization-enabled": process.env.AI_SUMMARIZATION_ENABLED === "true",
    "hacker-news-source-enabled":
      process.env.HACKER_NEWS_SOURCE_ENABLED !== "false",
    "morning-brew-source-enabled":
      process.env.MORNING_BREW_SOURCE_ENABLED !== "false",

    "openai-tts-enabled": process.env.OPENAI_TTS_ENABLED === "true",
    // Premium features
    "premium-tts-enabled": process.env.PREMIUM_TTS_ENABLED === "true",
    "techcrunch-source-enabled":
      process.env.TECHCRUNCH_SOURCE_ENABLED === "true",
    // Sources
    "tldr-source-enabled": process.env.TLDR_SOURCE_ENABLED !== "false",
  };
}
