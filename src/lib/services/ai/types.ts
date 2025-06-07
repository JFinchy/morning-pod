// AI service types for summarization and content processing

export interface SummarizationRequest {
  content: ScrapedContentItem[];
  source?: string;
  title?: string;
  targetLength?: "short" | "medium" | "long";
  summaryStyle?: string;
  includeKeyPoints?: boolean;
  includeTakeaways?: boolean;
  options?: SummarizationOptions;
}

export interface SummarizationOptions {
  maxTokens?: number;
  temperature?: number;
  style?: "conversational" | "formal" | "casual";
  targetLength?: "short" | "medium" | "long";
  includeIntro?: boolean;
  includeOutro?: boolean;
  includeSpeakerNotes?: boolean;
}

export interface SummarizationResult {
  success: boolean;
  summary?: string;
  keyPoints?: string[];
  takeaways?: string[];
  wordCount?: number;
  estimatedDuration?: number; // in seconds
  cost?: number;
  tokensUsed?: number;
  error?: string;
  metadata?: {
    model: string;
    processingTime: number;
    sourceCount: number;
  };
}

export interface ScrapedContentItem {
  id: string;
  title: string;
  content: string;
  source: string;
  category?: string;
  url?: string;
  publishedAt?: Date;
  contentHash: string;
}

export interface TTSRequest {
  text: string;
  options?: TTSOptions;
}

export interface TTSOptions {
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | string; // Allow any voice name for Google TTS
  model?: "tts-1" | "tts-1-hd";
  speed?: number; // 0.25 to 4.0
  pitch?: number; // -20.0 to 20.0 for Google TTS
  volume?: number; // -96.0 to 16.0 dB for Google TTS
  gender?: "MALE" | "FEMALE" | "NEUTRAL"; // For Google TTS
  format?: "mp3" | "wav" | "opus" | "aac" | "flac";
  useSSML?: boolean; // For Google TTS SSML support
  responseFormat?: "mp3" | "opus" | "aac" | "flac";
}

export interface TTSResult {
  success: boolean;
  audioBuffer?: Buffer;
  audioUrl?: string;
  duration?: number; // in seconds
  fileSize?: number; // in bytes
  cost?: number;
  error?: string;
  metadata?: {
    model: string;
    voice: string;
    processingTime: number;
    charactersProcessed: number;
  };
}

export interface GenerationRequest {
  sourceId: string;
  options?: {
    summarization?: SummarizationOptions;
    tts?: TTSOptions;
    title?: string;
    description?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  episodeId?: string;
  audioUrl?: string;
  summary?: string;
  totalCost: number; // Remove optional to fix undefined issues
  processingTime?: number;
  error?: string;
  steps?: {
    scraping: { success: boolean; itemCount?: number; error?: string };
    summarization: {
      success: boolean;
      wordCount?: number;
      cost?: number;
      error?: string;
    };
    tts: { success: boolean; duration?: number; cost?: number; error?: string };
    storage: { success: boolean; fileSize?: number; error?: string };
    database: { success: boolean; episodeId?: string; error?: string };
  };
}

export interface CostTracking {
  service:
    | "openai-gpt"
    | "openai-tts"
    | "google-tts"
    | "anthropic"
    | "google-ai";
  model: string;
  tokensUsed?: number;
  charactersProcessed?: number;
  cost: number;
  timestamp: Date;
  requestId: string;
}

export interface AIServiceConfig {
  openai: {
    apiKey: string;
    organization?: string;
    defaultModel?: string;
    maxRetries?: number;
    timeout?: number;
  };
  costTracking: {
    enabled: boolean;
    logToDatabase?: boolean;
    alertThreshold?: number;
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
  constructor(service: "summarization" | "tts", retryAfter?: number) {
    super(`Rate limit exceeded for ${service}`, service, "RATE_LIMIT", true);
    this.retryAfter = retryAfter;
  }

  retryAfter?: number;
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
  summary: string;
  keyPoints?: string[];
  takeaways?: string[];
  metadata: {
    originalLength: number;
    summaryLength: number;
    compressionRatio: number;
    processingTime: number;
    cost: number;
    model: string;
    quality: {
      coherence: number; // 0-1 score
      relevance: number; // 0-1 score
      readability: number; // 0-1 score
    };
  };
  ttsOptimized: {
    text: string; // Version optimized for text-to-speech
    estimatedDuration: number; // in seconds
    pauseMarkers: string[]; // Where to add pauses
  };
}

export interface SummarizationConfig {
  provider: "openai" | "claude" | "local";
  model: string;
  maxTokens: number;
  temperature: number;
  prompts: {
    system: string;
    user: string;
    qualityCheck: string;
  };
  qualityThresholds: {
    minCoherence: number;
    minRelevance: number;
    minReadability: number;
  };
  retryConfig: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface SummarizationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageProcessingTime: number;
  averageQualityScore: number;
  costByModel: Record<string, number>;
  qualityDistribution: {
    excellent: number; // >0.8
    good: number; // 0.6-0.8
    fair: number; // 0.4-0.6
    poor: number; // <0.4
  };
  last24Hours: {
    requests: number;
    cost: number;
    averageQuality: number;
  };
}

export interface SummarizationHistory {
  id: string;
  timestamp: Date;
  request: SummarizationRequest;
  response: SummarizationResponse;
  success: boolean;
  error?: string;
}

export interface QualityAssessment {
  coherence: number;
  relevance: number;
  readability: number;
  overall: number;
  feedback: string[];
}

export interface AIProvider {
  name: string;
  models: string[];
  costPer1kTokens: Record<string, number>;
  maxTokens: Record<string, number>;
  capabilities: {
    summarization: boolean;
    qualityAssessment: boolean;
    ttsOptimization: boolean;
  };
}

// Error types
export class SummarizationError extends Error {
  constructor(
    message: string,
    public code:
      | "RATE_LIMIT"
      | "INVALID_INPUT"
      | "API_ERROR"
      | "QUALITY_THRESHOLD"
      | "UNKNOWN",
    public provider?: string,
    public cost?: number
  ) {
    super(message);
    this.name = "SummarizationError";
  }
}

// Constants
export const DEFAULT_CONFIG: SummarizationConfig = {
  provider: "openai",
  model: "gpt-4-turbo-preview",
  maxTokens: 2000,
  temperature: 0.3,
  prompts: {
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

    qualityCheck: `Assess the quality of this podcast summary on a scale of 0-1 for:
1. Coherence: How well does it flow and make sense?
2. Relevance: How well does it capture the key information?
3. Readability: How natural does it sound for audio consumption?

Summary: {summary}

Provide scores and brief feedback.`,
  },
  qualityThresholds: {
    minCoherence: 0.7,
    minRelevance: 0.7,
    minReadability: 0.6,
  },
  retryConfig: {
    maxRetries: 3,
    backoffMs: 1000,
  },
};

export const SUMMARY_WORD_TARGETS = {
  short: 100,
  medium: 200,
  long: 300,
} as const;

export const SUPPORTED_PROVIDERS: AIProvider[] = [
  {
    name: "openai",
    models: ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"],
    costPer1kTokens: {
      "gpt-4-turbo-preview": 0.03,
      "gpt-4": 0.06,
      "gpt-3.5-turbo": 0.002,
    },
    maxTokens: {
      "gpt-4-turbo-preview": 4096,
      "gpt-4": 4096,
      "gpt-3.5-turbo": 4096,
    },
    capabilities: {
      summarization: true,
      qualityAssessment: true,
      ttsOptimization: true,
    },
  },
  {
    name: "claude",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    costPer1kTokens: {
      "claude-3-opus": 0.075,
      "claude-3-sonnet": 0.015,
      "claude-3-haiku": 0.0015,
    },
    maxTokens: {
      "claude-3-opus": 4096,
      "claude-3-sonnet": 4096,
      "claude-3-haiku": 4096,
    },
    capabilities: {
      summarization: true,
      qualityAssessment: true,
      ttsOptimization: true,
    },
  },
];
