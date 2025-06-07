// AI Provider configuration and management
export interface AIProvider {
  id: string;
  name: string;
  type: "summarization" | "tts" | "both";
  models: AIModel[];
  apiKeyRequired: boolean;
  baseUrl?: string;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "summarization" | "tts";
  costPer1kTokens?: number; // For summarization models
  costPerCharacter?: number; // For TTS models
  maxTokens?: number;
  contextWindow?: number;
  quality: "basic" | "standard" | "premium";
  speed: "fast" | "medium" | "slow";
  features: string[];
}

// Available AI Providers
export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    type: "both",
    apiKeyRequired: true,
    rateLimit: {
      requestsPerMinute: 500,
      tokensPerMinute: 150000,
    },
    models: [
      // Summarization Models
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        provider: "openai",
        type: "summarization",
        costPer1kTokens: 0.00015, // $0.15 per 1M tokens
        maxTokens: 16384,
        contextWindow: 128000,
        quality: "standard",
        speed: "fast",
        features: ["fast", "cost-effective", "good-quality"],
      },
      {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "openai",
        type: "summarization",
        costPer1kTokens: 0.005, // $5 per 1M tokens
        maxTokens: 4096,
        contextWindow: 128000,
        quality: "premium",
        speed: "medium",
        features: ["highest-quality", "advanced-reasoning", "multimodal"],
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        type: "summarization",
        costPer1kTokens: 0.0005, // $0.5 per 1M tokens
        maxTokens: 4096,
        contextWindow: 16385,
        quality: "basic",
        speed: "fast",
        features: ["very-fast", "cheapest", "reliable"],
      },
      // TTS Models
      {
        id: "tts-1",
        name: "TTS-1",
        provider: "openai",
        type: "tts",
        costPerCharacter: 0.000015, // $15 per 1M characters
        quality: "standard",
        speed: "fast",
        features: ["fast", "natural-voices", "multiple-voices"],
      },
      {
        id: "tts-1-hd",
        name: "TTS-1 HD",
        provider: "openai",
        type: "tts",
        costPerCharacter: 0.00003, // $30 per 1M characters
        quality: "premium",
        speed: "medium",
        features: ["high-quality", "natural-voices", "multiple-voices"],
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    type: "summarization",
    apiKeyRequired: true,
    rateLimit: {
      requestsPerMinute: 50,
      tokensPerMinute: 40000,
    },
    models: [
      {
        id: "claude-3-haiku",
        name: "Claude 3 Haiku",
        provider: "anthropic",
        type: "summarization",
        costPer1kTokens: 0.00025, // $0.25 per 1M tokens
        maxTokens: 4096,
        contextWindow: 200000,
        quality: "standard",
        speed: "fast",
        features: ["fast", "cost-effective", "large-context"],
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        type: "summarization",
        costPer1kTokens: 0.003, // $3 per 1M tokens
        maxTokens: 4096,
        contextWindow: 200000,
        quality: "premium",
        speed: "medium",
        features: ["high-quality", "large-context", "reasoning"],
      },
    ],
  },
  {
    id: "google",
    name: "Google Cloud",
    type: "both",
    apiKeyRequired: true,
    rateLimit: {
      requestsPerMinute: 300,
      tokensPerMinute: 32000,
    },
    models: [
      // Summarization
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        provider: "google",
        type: "summarization",
        costPer1kTokens: 0.000075, // $0.075 per 1M tokens
        maxTokens: 8192,
        contextWindow: 1000000,
        quality: "standard",
        speed: "fast",
        features: ["very-fast", "huge-context", "multimodal"],
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        provider: "google",
        type: "summarization",
        costPer1kTokens: 0.00125, // $1.25 per 1M tokens
        maxTokens: 8192,
        contextWindow: 2000000,
        quality: "premium",
        speed: "medium",
        features: ["high-quality", "massive-context", "multimodal"],
      },
      // TTS
      {
        id: "cloud-tts-standard",
        name: "Cloud TTS Standard",
        provider: "google",
        type: "tts",
        costPerCharacter: 0.000004, // $4 per 1M characters
        quality: "standard",
        speed: "fast",
        features: ["many-voices", "languages", "cost-effective"],
      },
      {
        id: "cloud-tts-wavenet",
        name: "Cloud TTS WaveNet",
        provider: "google",
        type: "tts",
        costPerCharacter: 0.000016, // $16 per 1M characters
        quality: "premium",
        speed: "medium",
        features: ["neural-voices", "high-quality", "natural"],
      },
    ],
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
  model: AIModel;
  score: number;
  reasons: string[];
  estimatedCost: number;
}

export function recommendModels(
  type: "summarization" | "tts",
  criteria: {
    priority: "cost" | "quality" | "speed";
    maxCost?: number;
    contentLength?: number; // characters for TTS, tokens for summarization
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
      model,
      score,
      reasons,
      estimatedCost,
    };
  });

  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3); // Return top 3 recommendations
}

// Provider configuration for environment
export interface ProviderConfig {
  openai?: {
    apiKey: string;
    organization?: string;
  };
  anthropic?: {
    apiKey: string;
  };
  google?: {
    apiKey: string;
    projectId?: string;
  };
}

export function getProviderConfig(): ProviderConfig {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      organization: process.env.OPENAI_ORGANIZATION,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    },
    google: {
      apiKey: process.env.GOOGLE_AI_API_KEY || "",
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
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
