// AI service types for summarization and content processing

export interface SummarizationRequest {
  content: ScrapedContentItem[];
  includeKeyPoints?: boolean;
  includeTakeaways?: boolean;
  options?: SummarizationOptions;
  source?: string;
  summaryStyle?: string;
  targetLength?: "long" | "medium" | "short";
  title?: string;
}

export interface SummarizationOptions {
  includeIntro?: boolean;
  includeOutro?: boolean;
  includeSpeakerNotes?: boolean;
  maxTokens?: number;
  style?: "casual" | "conversational" | "formal";
  targetLength?: "long" | "medium" | "short";
  temperature?: number;
}

export interface SummarizationResult {
  cost?: number;
  error?: string;
  estimatedDuration?: number; // in seconds
  keyPoints?: string[];
  metadata?: {
    model: string;
    processingTime: number;
    sourceCount: number;
  };
  success: boolean;
  summary?: string;
  takeaways?: string[];
  tokensUsed?: number;
  wordCount?: number;
}

export interface ScrapedContentItem {
  category?: string;
  content: string;
  contentHash: string;
  id: string;
  publishedAt?: Date;
  source: string;
  title: string;
  url?: string;
}

export interface TTSRequest {
  options?: TTSOptions;
  text: string;
}

export interface TTSOptions {
  format?: "aac" | "flac" | "mp3" | "opus" | "wav";
  gender?: "FEMALE" | "MALE" | "NEUTRAL"; // For Google TTS
  model?: "tts-1-hd" | "tts-1";
  pitch?: number; // -20.0 to 20.0 for Google TTS
  responseFormat?: "aac" | "flac" | "mp3" | "opus";
  speed?: number; // 0.25 to 4.0
  useSSML?: boolean; // For Google TTS SSML support
  voice?: "alloy" | "echo" | "fable" | "nova" | "onyx" | "shimmer" | string; // Allow any voice name for Google TTS
  volume?: number; // -96.0 to 16.0 dB for Google TTS
}

export interface TTSResult {
  audioBuffer?: Buffer;
  audioUrl?: string;
  cost?: number;
  duration?: number; // in seconds
  error?: string;
  fileSize?: number; // in bytes
  metadata?: {
    charactersProcessed: number;
    model: string;
    processingTime: number;
    voice: string;
  };
  success: boolean;
}

export interface GenerationRequest {
  options?: {
    description?: string;
    summarization?: SummarizationOptions;
    title?: string;
    tts?: TTSOptions;
  };
  sourceId: string;
}

export interface GenerationResult {
  audioUrl?: string;
  episodeId?: string;
  error?: string;
  processingTime?: number;
  steps?: {
    database: { episodeId?: string; error?: string; success: boolean };
    scraping: { error?: string; itemCount?: number; success: boolean };
    storage: { error?: string; fileSize?: number; success: boolean };
    summarization: {
      cost?: number;
      error?: string;
      success: boolean;
      wordCount?: number;
    };
    tts: { cost?: number; duration?: number; error?: string; success: boolean };
  };
  success: boolean;
  summary?: string;
  totalCost: number; // Remove optional to fix undefined issues
}

export interface CostTracking {
  charactersProcessed?: number;
  cost: number;
  model: string;
  requestId: string;
  service:
    | "anthropic"
    | "google-ai"
    | "google-tts"
    | "openai-gpt"
    | "openai-tts";
  timestamp: Date;
  tokensUsed?: number;
}

export interface AIServiceConfig {
  costTracking: {
    alertThreshold?: number;
    enabled: boolean;
    logToDatabase?: boolean;
  };
  openai: {
    apiKey: string;
    defaultModel?: string;
    maxRetries?: number;
    organization?: string;
    timeout?: number;
  };
}

// Error types for better error handling
export class AIServiceError extends Error {
  constructor(
    message: string,
    public service: "summarization" | "tts",
    public code?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export class RateLimitError extends AIServiceError {
  retryAfter?: number;

  constructor(service: "summarization" | "tts", retryAfter?: number) {
    super(`Rate limit exceeded for ${service}`, service, "RATE_LIMIT", true);
    this.retryAfter = retryAfter;
  }
}

export class QuotaExceededError extends AIServiceError {
  constructor(service: "summarization" | "tts") {
    super(`Quota exceeded for ${service}`, service, "QUOTA_EXCEEDED", false);
  }
}

export class InvalidInputError extends AIServiceError {
  constructor(service: "summarization" | "tts", details: string) {
    super(
      `Invalid input for ${service}: ${details}`,
      service,
      "INVALID_INPUT",
      false
    );
  }
}

export interface SummarizationResponse {
  keyPoints?: string[];
  metadata: {
    compressionRatio: number;
    cost: number;
    model: string;
    originalLength: number;
    processingTime: number;
    quality: {
      coherence: number; // 0-1 score
      readability: number; // 0-1 score
      relevance: number; // 0-1 score
    };
    summaryLength: number;
  };
  summary: string;
  takeaways?: string[];
  ttsOptimized: {
    estimatedDuration: number; // in seconds
    pauseMarkers: string[]; // Where to add pauses
    text: string; // Version optimized for text-to-speech
  };
}

export interface SummarizationConfig {
  maxTokens: number;
  model: string;
  prompts: {
    qualityCheck: string;
    system: string;
    user: string;
  };
  provider: "claude" | "local" | "openai";
  qualityThresholds: {
    minCoherence: number;
    minReadability: number;
    minRelevance: number;
  };
  retryConfig: {
    backoffMs: number;
    maxRetries: number;
  };
  temperature: number;
}

export interface SummarizationMetrics {
  averageProcessingTime: number;
  averageQualityScore: number;
  costByModel: Record<string, number>;
  failedRequests: number;
  last24Hours: {
    averageQuality: number;
    cost: number;
    requests: number;
  };
  qualityDistribution: {
    excellent: number; // >0.8
    fair: number; // 0.4-0.6
    good: number; // 0.6-0.8
    poor: number; // <0.4
  };
  successfulRequests: number;
  totalCost: number;
  totalRequests: number;
}

export interface SummarizationHistory {
  error?: string;
  id: string;
  request: SummarizationRequest;
  response: SummarizationResponse;
  success: boolean;
  timestamp: Date;
}

export interface QualityAssessment {
  coherence: number;
  feedback: string[];
  overall: number;
  readability: number;
  relevance: number;
}

export interface AIProvider {
  capabilities: {
    qualityAssessment: boolean;
    summarization: boolean;
    ttsOptimization: boolean;
  };
  costPer1kTokens: Record<string, number>;
  maxTokens: Record<string, number>;
  models: string[];
  name: string;
}

// Error types
// SummarizationError is now defined in ./summarization.ts

// Constants
export const DEFAULT_CONFIG: SummarizationConfig = {
  maxTokens: 2000,
  model: "gpt-4-turbo-preview",
  prompts: {
    qualityCheck: `Assess the quality of this podcast summary on a scale of 0-1 for:
1. Coherence: How well does it flow and make sense?
2. Relevance: How well does it capture the key information?
3. Readability: How natural does it sound for audio consumption?

Summary: {summary}

Provide scores and brief feedback.`,

    system: `You are an expert podcast content creator. Your task is to transform news articles and content into engaging, conversational summaries perfect for audio consumption.

Key requirements:
1. Write in a conversational, podcast-friendly tone
2. Use natural speech patterns with smooth transitions
3. Include context for listeners who may not be familiar with technical terms
4. Structure content with clear beginnings, middles, and ends
5. Add verbal cues like "Now," "Meanwhile," "Here's what's interesting"
6. Avoid long, complex sentences that are hard to follow when spoken
7. Include relevant background information when needed`,

    user: `Please summarize the following content for a podcast episode:

Source: {source}
Title: {title}
Content: {content}

Create a {summaryStyle} summary that:
- Is approximately {targetLength} words
- Flows naturally when spoken aloud
- Includes key insights and takeaways
- Uses conversational language suitable for audio
- Provides context for technical terms

{includeKeyPoints ? "Include 3-5 key points as bullet points." : ""}
{includeTakeaways ? "Include 2-3 actionable takeaways for listeners." : ""}`,
  },
  provider: "openai",
  qualityThresholds: {
    minCoherence: 0.7,
    minReadability: 0.6,
    minRelevance: 0.7,
  },
  retryConfig: {
    backoffMs: 1000,
    maxRetries: 3,
  },
  temperature: 0.3,
};

export const SUMMARY_WORD_TARGETS = {
  long: 300,
  medium: 200,
  short: 100,
} as const;

export const SUPPORTED_PROVIDERS: AIProvider[] = [
  {
    capabilities: {
      qualityAssessment: true,
      summarization: true,
      ttsOptimization: true,
    },
    costPer1kTokens: {
      "gpt-3.5-turbo": 0.002,
      "gpt-4": 0.06,
      "gpt-4-turbo-preview": 0.03,
    },
    maxTokens: {
      "gpt-3.5-turbo": 4096,
      "gpt-4": 4096,
      "gpt-4-turbo-preview": 4096,
    },
    models: ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"],
    name: "openai",
  },
  {
    capabilities: {
      qualityAssessment: true,
      summarization: true,
      ttsOptimization: true,
    },
    costPer1kTokens: {
      "claude-3-haiku": 0.0015,
      "claude-3-opus": 0.075,
      "claude-3-sonnet": 0.015,
    },
    maxTokens: {
      "claude-3-haiku": 4096,
      "claude-3-opus": 4096,
      "claude-3-sonnet": 4096,
    },
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    name: "claude",
  },
];
