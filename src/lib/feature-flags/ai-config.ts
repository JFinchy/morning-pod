/**
 * Feature flag configuration for AI services
 * Allows easy switching between providers and models for cost optimization
 */

export interface AIServiceConfig {
  // Content generation mode
  contentMode: "podcast" | "summary";

  // Budget controls
  dailyBudgetLimit?: number;

  // Cost optimization features
  enableCaching: boolean;

  enableContentFiltering: boolean;

  monthlyBudgetLimit?: number;
  // Summarization model selection
  summarizationModel: "gpt-3.5-turbo" | "gpt-4o-mini" | "gpt-4o";

  // TTS provider selection
  ttsProvider: "google-cloud" | "openai";
  // Voice style for conversational mode
  voiceStyle: "budget" | "professional" | "upbeat";
}

/**
 * Default AI configuration optimized for cost efficiency
 */
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  // Default to podcast mode for engagement
  contentMode: "podcast",

  // Conservative budget limits for POC
  dailyBudgetLimit: 5.0, // $5/day max

  // Enable basic optimizations
  enableCaching: true,

  enableContentFiltering: true,

  monthlyBudgetLimit: 100.0, // $100/month max
  // Default to cheapest model for POC
  summarizationModel: "gpt-4o-mini",

  // Default to Google Cloud TTS for cost savings
  ttsProvider: "google-cloud",
  // Use fun, uplifting voices like Upfirst podcast
  voiceStyle: "upbeat",
};

/**
 * Feature flag keys for PostHog integration
 */
export const AI_FEATURE_FLAGS = {
  // Content mode flags
  DEFAULT_TO_PODCAST: "default-to-podcast",
  // Budget control flags
  ENABLE_BUDGET_LIMITS: "enable-budget-limits",
  // Optimization flags
  ENABLE_CONTENT_CACHING: "enable-content-caching",

  ENABLE_QUALITY_FILTERING: "enable-quality-filtering",
  ENABLE_SUMMARY_MODE: "enable-summary-mode",

  STRICT_COST_CONTROLS: "strict-cost-controls",
  // TTS provider flags
  USE_GOOGLE_TTS: "use-google-tts",

  USE_GPT35_TURBO: "use-gpt35-turbo",
  USE_GPT4O: "use-gpt4o",

  // Model selection flags
  USE_GPT4O_MINI: "use-gpt4o-mini",
  USE_OPENAI_TTS: "use-openai-tts",

  USE_PROFESSIONAL_VOICES: "use-professional-voices",
  // Voice style flags
  USE_UPBEAT_VOICES: "use-upbeat-voices",
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
    "gpt-3.5-turbo": 0.008, // ~$0.008 per episode
    "gpt-4o": 0.05, // ~$0.05 per episode
    "gpt-4o-mini": 0.01, // ~$0.01 per episode (75% savings)
  },
  tts: {
    "google-cloud": 0.05, // ~$0.05 per episode (90% savings)
    openai: 0.45, // ~$0.45 per episode
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
  comparison: string;
  percentageSavings: number;
} {
  const currentCost = calculateEstimatedCost(config);
  const maxCost =
    COST_ESTIMATES.summarization["gpt-4o"] + COST_ESTIMATES.tts["openai"]; // $0.50

  const absoluteSavings = maxCost - currentCost;
  const percentageSavings = (absoluteSavings / maxCost) * 100;

  return {
    absoluteSavings,
    comparison: `$${currentCost.toFixed(3)} vs $${maxCost.toFixed(3)} (${percentageSavings.toFixed(0)}% savings)`,
    percentageSavings,
  };
}
