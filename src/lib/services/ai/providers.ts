// AI Provider configuration and management
export interface AIProvider {
  apiKeyRequired: boolean;
  baseUrl?: string;
  id: string;
  models: AIModel[];
  name: string;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  type: "both" | "summarization" | "tts";
}

export interface AIModel {
  contextWindow?: number;
  costPer1kTokens?: number; // For summarization models
  costPerCharacter?: number; // For TTS models
  features: string[];
  id: string;
  maxTokens?: number;
  name: string;
  provider: string;
  quality: "basic" | "premium" | "standard";
  speed: "fast" | "medium" | "slow";
  type: "summarization" | "tts";
}

// Available AI Providers
export const AI_PROVIDERS: AIProvider[] = [
  {
    apiKeyRequired: true,
    id: "openai",
    models: [
      // Summarization Models
      {
        contextWindow: 128000,
        costPer1kTokens: 0.00015, // $0.15 per 1M tokens
        features: ["fast", "cost-effective", "good-quality"],
        id: "gpt-4o-mini",
        maxTokens: 16384,
        name: "GPT-4o Mini",
        provider: "openai",
        quality: "standard",
        speed: "fast",
        type: "summarization",
      },
      {
        contextWindow: 128000,
        costPer1kTokens: 0.005, // $5 per 1M tokens
        features: ["highest-quality", "advanced-reasoning", "multimodal"],
        id: "gpt-4o",
        maxTokens: 4096,
        name: "GPT-4o",
        provider: "openai",
        quality: "premium",
        speed: "medium",
        type: "summarization",
      },
      {
        contextWindow: 16385,
        costPer1kTokens: 0.0005, // $0.5 per 1M tokens
        features: ["very-fast", "cheapest", "reliable"],
        id: "gpt-3.5-turbo",
        maxTokens: 4096,
        name: "GPT-3.5 Turbo",
        provider: "openai",
        quality: "basic",
        speed: "fast",
        type: "summarization",
      },
      // TTS Models
      {
        costPerCharacter: 0.000015, // $15 per 1M characters
        features: ["fast", "natural-voices", "multiple-voices"],
        id: "tts-1",
        name: "TTS-1",
        provider: "openai",
        quality: "standard",
        speed: "fast",
        type: "tts",
      },
      {
        costPerCharacter: 0.00003, // $30 per 1M characters
        features: ["high-quality", "natural-voices", "multiple-voices"],
        id: "tts-1-hd",
        name: "TTS-1 HD",
        provider: "openai",
        quality: "premium",
        speed: "medium",
        type: "tts",
      },
    ],
    name: "OpenAI",
    rateLimit: {
      requestsPerMinute: 500,
      tokensPerMinute: 150000,
    },
    type: "both",
  },
  {
    apiKeyRequired: true,
    id: "anthropic",
    models: [
      {
        contextWindow: 200000,
        costPer1kTokens: 0.00025, // $0.25 per 1M tokens
        features: ["fast", "cost-effective", "large-context"],
        id: "claude-3-haiku",
        maxTokens: 4096,
        name: "Claude 3 Haiku",
        provider: "anthropic",
        quality: "standard",
        speed: "fast",
        type: "summarization",
      },
      {
        contextWindow: 200000,
        costPer1kTokens: 0.003, // $3 per 1M tokens
        features: ["high-quality", "large-context", "reasoning"],
        id: "claude-3-sonnet",
        maxTokens: 4096,
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        quality: "premium",
        speed: "medium",
        type: "summarization",
      },
    ],
    name: "Anthropic",
    rateLimit: {
      requestsPerMinute: 50,
      tokensPerMinute: 40000,
    },
    type: "summarization",
  },
  {
    apiKeyRequired: true,
    id: "google",
    models: [
      // Summarization
      {
        contextWindow: 1000000,
        costPer1kTokens: 0.000075, // $0.075 per 1M tokens
        features: ["very-fast", "huge-context", "multimodal"],
        id: "gemini-1.5-flash",
        maxTokens: 8192,
        name: "Gemini 1.5 Flash",
        provider: "google",
        quality: "standard",
        speed: "fast",
        type: "summarization",
      },
      {
        contextWindow: 2000000,
        costPer1kTokens: 0.00125, // $1.25 per 1M tokens
        features: ["high-quality", "massive-context", "multimodal"],
        id: "gemini-1.5-pro",
        maxTokens: 8192,
        name: "Gemini 1.5 Pro",
        provider: "google",
        quality: "premium",
        speed: "medium",
        type: "summarization",
      },
      // TTS
      {
        costPerCharacter: 0.000004, // $4 per 1M characters
        features: ["many-voices", "languages", "cost-effective"],
        id: "cloud-tts-standard",
        name: "Cloud TTS Standard",
        provider: "google",
        quality: "standard",
        speed: "fast",
        type: "tts",
      },
      {
        costPerCharacter: 0.000016, // $16 per 1M characters
        features: ["neural-voices", "high-quality", "natural"],
        id: "cloud-tts-wavenet",
        name: "Cloud TTS WaveNet",
        provider: "google",
        quality: "premium",
        speed: "medium",
        type: "tts",
      },
    ],
    name: "Google Cloud",
    rateLimit: {
      requestsPerMinute: 300,
      tokensPerMinute: 32000,
    },
    type: "both",
  },
];

// Provider utility functions
export function getProvider(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === providerId);
}

export function getModel(modelId: string): AIModel | undefined {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find((m) => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getModelsByType(type: "summarization" | "tts"): AIModel[] {
  return AI_PROVIDERS.flatMap((provider) =>
    provider.models.filter((model) => model.type === type)
  );
}

export function getModelsByProvider(
  providerId: string,
  type?: "summarization" | "tts"
): AIModel[] {
  const provider = getProvider(providerId);
  if (!provider) return [];

  return type
    ? provider.models.filter((m) => m.type === type)
    : provider.models;
}

// Cost calculation utilities
export function calculateSummarizationCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = getModel(modelId);
  if (!model || !model.costPer1kTokens) return 0;

  const totalTokens = inputTokens + outputTokens;
  return (totalTokens / 1000) * model.costPer1kTokens;
}

export function calculateTTSCost(
  modelId: string,
  characterCount: number
): number {
  const model = getModel(modelId);
  if (!model || !model.costPerCharacter) return 0;

  return characterCount * model.costPerCharacter;
}

// Model recommendation system
export interface ModelRecommendation {
  estimatedCost: number;
  model: AIModel;
  reasons: string[];
  score: number;
}

export function recommendModels(
  type: "summarization" | "tts",
  criteria: {
    contentLength?: number; // characters for TTS, tokens for summarization
    maxCost?: number;
    priority: "cost" | "quality" | "speed";
  }
): ModelRecommendation[] {
  const models = getModelsByType(type);

  const recommendations: ModelRecommendation[] = models.map((model) => {
    let score = 0;
    const reasons: string[] = [];
    let estimatedCost = 0;

    // Calculate estimated cost
    if (criteria.contentLength) {
      if (type === "summarization" && model.costPer1kTokens) {
        estimatedCost = (criteria.contentLength / 1000) * model.costPer1kTokens;
      } else if (type === "tts" && model.costPerCharacter) {
        estimatedCost = criteria.contentLength * model.costPerCharacter;
      }
    }

    // Score based on priority
    switch (criteria.priority) {
      case "cost":
        if (model.quality === "basic") score += 30;
        if (model.speed === "fast") score += 20;
        if (estimatedCost < (criteria.maxCost || Infinity)) score += 40;
        reasons.push("Optimized for cost");
        break;

      case "quality":
        if (model.quality === "premium") score += 50;
        if (model.quality === "standard") score += 30;
        reasons.push("High quality output");
        break;

      case "speed":
        if (model.speed === "fast") score += 50;
        if (model.speed === "medium") score += 30;
        reasons.push("Fast processing");
        break;
    }

    // Bonus points for features
    if (model.features.includes("cost-effective")) score += 10;
    if (model.features.includes("fast")) score += 10;
    if (model.features.includes("high-quality")) score += 15;

    return {
      estimatedCost,
      model,
      reasons,
      score,
    };
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3); // Return top 3 recommendations
}

// Provider configuration for environment
export interface ProviderConfig {
  anthropic?: {
    apiKey: string;
  };
  google?: {
    apiKey: string;
    projectId?: string;
  };
  openai?: {
    apiKey: string;
    organization?: string;
  };
}

export function getProviderConfig(): ProviderConfig {
  return {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY || "",
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      organization: process.env.OPENAI_ORGANIZATION,
    },
  };
}

export function isProviderConfigured(providerId: string): boolean {
  const config = getProviderConfig();

  switch (providerId) {
    case "openai":
      return !!config.openai?.apiKey;
    case "anthropic":
      return !!config.anthropic?.apiKey;
    case "google":
      return !!config.google?.apiKey;
    default:
      return false;
  }
}
