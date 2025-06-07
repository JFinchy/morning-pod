/**
 * Feature flag configuration for AI services
 * Allows easy switching between providers and models for cost optimization
 */

export interface AIServiceConfig {
  // Summarization model selection
  summarizationModel: "gpt-4o" | "gpt-4o-mini" | "gpt-3.5-turbo";

  // TTS provider selection
  ttsProvider: "openai" | "google-cloud";

  // Content generation mode
  contentMode: "podcast" | "summary";

  // Voice style for conversational mode
  voiceStyle: "upbeat" | "professional" | "budget";

  // Cost optimization features
  enableCaching: boolean;
  enableContentFiltering: boolean;

  // Budget controls
  dailyBudgetLimit?: number;
  monthlyBudgetLimit?: number;
}

/**
 * Default AI configuration optimized for cost efficiency
 */
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  // Default to cheapest model for POC
  summarizationModel: "gpt-4o-mini",

  // Default to Google Cloud TTS for cost savings
  ttsProvider: "google-cloud",

  // Default to podcast mode for engagement
  contentMode: "podcast",

  // Use fun, uplifting voices like Upfirst podcast
  voiceStyle: "upbeat",

  // Enable basic optimizations
  enableCaching: true,
  enableContentFiltering: true,

  // Conservative budget limits for POC
  dailyBudgetLimit: 5.0, // $5/day max
  monthlyBudgetLimit: 100.0, // $100/month max
};

/**
 * Feature flag keys for PostHog integration
 */
export const AI_FEATURE_FLAGS = {
  // Model selection flags
  USE_GPT4O_MINI: "use-gpt4o-mini",
  USE_GPT4O: "use-gpt4o",
  USE_GPT35_TURBO: "use-gpt35-turbo",

  // TTS provider flags
  USE_GOOGLE_TTS: "use-google-tts",
  USE_OPENAI_TTS: "use-openai-tts",

  // Content mode flags
  DEFAULT_TO_PODCAST: "default-to-podcast",
  ENABLE_SUMMARY_MODE: "enable-summary-mode",

  // Voice style flags
  USE_UPBEAT_VOICES: "use-upbeat-voices",
  USE_PROFESSIONAL_VOICES: "use-professional-voices",

  // Optimization flags
  ENABLE_CONTENT_CACHING: "enable-content-caching",
  ENABLE_QUALITY_FILTERING: "enable-quality-filtering",

  // Budget control flags
  ENABLE_BUDGET_LIMITS: "enable-budget-limits",
  STRICT_COST_CONTROLS: "strict-cost-controls",
} as const;

/**
 * Get AI configuration based on feature flags
 * Falls back to default config if flags aren't available
 */
export function getAIConfig(
  featureFlags: Record<string, boolean | string>
): AIServiceConfig {
  const config = { ...DEFAULT_AI_CONFIG };

  // Determine summarization model based on flags
  if (featureFlags[AI_FEATURE_FLAGS.USE_GPT4O]) {
    config.summarizationModel = "gpt-4o";
  } else if (featureFlags[AI_FEATURE_FLAGS.USE_GPT35_TURBO]) {
    config.summarizationModel = "gpt-3.5-turbo";
  } else {
    // Default to gpt-4o-mini for cost efficiency
    config.summarizationModel = "gpt-4o-mini";
  }

  // Determine TTS provider
  if (featureFlags[AI_FEATURE_FLAGS.USE_OPENAI_TTS]) {
    config.ttsProvider = "openai";
  } else {
    // Default to Google Cloud TTS for cost savings
    config.ttsProvider = "google-cloud";
  }

  // Determine content mode
  if (!featureFlags[AI_FEATURE_FLAGS.DEFAULT_TO_PODCAST]) {
    config.contentMode = "summary";
  }

  // Determine voice style
  if (featureFlags[AI_FEATURE_FLAGS.USE_PROFESSIONAL_VOICES]) {
    config.voiceStyle = "professional";
  } else {
    // Default to upbeat for fun, engaging podcasts
    config.voiceStyle = "upbeat";
  }

  // Optimization features
  config.enableCaching = Boolean(
    featureFlags[AI_FEATURE_FLAGS.ENABLE_CONTENT_CACHING] ?? true
  );
  config.enableContentFiltering = Boolean(
    featureFlags[AI_FEATURE_FLAGS.ENABLE_QUALITY_FILTERING] ?? true
  );

  return config;
}

/**
 * Cost estimates for different configurations (per episode)
 */
export const COST_ESTIMATES = {
  summarization: {
    "gpt-4o": 0.05, // ~$0.05 per episode
    "gpt-4o-mini": 0.01, // ~$0.01 per episode (75% savings)
    "gpt-3.5-turbo": 0.008, // ~$0.008 per episode
  },
  tts: {
    openai: 0.45, // ~$0.45 per episode
    "google-cloud": 0.05, // ~$0.05 per episode (90% savings)
  },
} as const;

/**
 * Calculate estimated cost per episode based on configuration
 */
export function calculateEstimatedCost(config: AIServiceConfig): number {
  const summarizationCost =
    COST_ESTIMATES.summarization[config.summarizationModel];
  const ttsCost = COST_ESTIMATES.tts[config.ttsProvider];

  return summarizationCost + ttsCost;
}

/**
 * Get cost savings compared to most expensive configuration
 */
export function getCostSavings(config: AIServiceConfig): {
  absoluteSavings: number;
  percentageSavings: number;
  comparison: string;
} {
  const currentCost = calculateEstimatedCost(config);
  const maxCost =
    COST_ESTIMATES.summarization["gpt-4o"] + COST_ESTIMATES.tts["openai"]; // $0.50

  const absoluteSavings = maxCost - currentCost;
  const percentageSavings = (absoluteSavings / maxCost) * 100;

  return {
    absoluteSavings,
    percentageSavings,
    comparison: `$${currentCost.toFixed(3)} vs $${maxCost.toFixed(3)} (${percentageSavings.toFixed(0)}% savings)`,
  };
}
