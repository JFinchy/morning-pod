// Text-to-Speech Service Types for podcast audio generation
export type TTSProvider = "openai" | "google" | "elevenlabs" | "local";

export type VoiceType =
  // OpenAI voices
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer"
  // Google voices (examples)
  | "en-US-Wavenet-A"
  | "en-US-Wavenet-B"
  | "en-US-Wavenet-C"
  // ElevenLabs voices (examples)
  | "rachel"
  | "domi"
  | "bella"
  | "antoni";

export type AudioFormat = "mp3" | "wav" | "flac" | "opus";

export type AudioQuality = "low" | "medium" | "high" | "hd";

export interface TTSRequest {
  text: string;
  voice: VoiceType;
  provider?: TTSProvider;
  format?: AudioFormat;
  quality?: AudioQuality;
  speed?: number; // 0.25 to 4.0
  pitch?: number; // -20 to 20 semitones
  volume?: number; // 0.0 to 1.0
  metadata?: {
    title?: string;
    source?: string;
    episodeId?: string;
    contentHash?: string;
  };
}

export interface TTSResponse {
  audioUrl: string;
  audioSize: number; // bytes
  duration: number; // seconds
  format: AudioFormat;
  quality: AudioQuality;
  metadata: {
    voice: VoiceType;
    provider: TTSProvider;
    cost: number;
    processingTime: number;
    contentHash: string;
    cacheHit: boolean;
  };
  waveformData?: number[]; // For visualization
}

export interface TTSConfig {
  provider: TTSProvider;
  defaultVoice: VoiceType;
  defaultFormat: AudioFormat;
  defaultQuality: AudioQuality;
  defaultSpeed: number;
  enableCaching: boolean;
  cacheExpirationDays: number;
  maxFileSize: number; // MB
  costLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    perRequestLimit: number;
  };
  qualitySettings: {
    sampleRate: number;
    bitRate: number;
    channels: number;
  };
}

export interface TTSMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  totalDuration: number; // seconds of audio generated
  totalSize: number; // bytes of audio generated
  cacheHitRate: number;
  averageProcessingTime: number;
  averageCostPerMinute: number;
  costByProvider: Record<TTSProvider, number>;
  usageByVoice: Record<VoiceType, number>;
  qualityDistribution: {
    low: number;
    medium: number;
    high: number;
    hd: number;
  };
  last24Hours: {
    requests: number;
    cost: number;
    duration: number;
  };
}

export interface TTSHistory {
  id: string;
  timestamp: Date;
  request: TTSRequest;
  response: TTSResponse | null;
  success: boolean;
  error?: string;
}

export interface AudioCacheEntry {
  contentHash: string;
  audioUrl: string;
  metadata: {
    voice: VoiceType;
    provider: TTSProvider;
    format: AudioFormat;
    quality: AudioQuality;
    createdAt: Date;
    lastAccessed: Date;
    accessCount: number;
    fileSize: number;
    duration: number;
  };
}

export interface VoiceConfig {
  provider: TTSProvider;
  voiceId: VoiceType;
  displayName: string;
  gender: "male" | "female" | "neutral";
  accent: string;
  description: string;
  costMultiplier: number;
  qualityRating: number; // 1-5
  isAvailable: boolean;
}

export interface TTSError extends Error {
  code: string;
  provider?: TTSProvider;
  retryable: boolean;
}

// Configuration constants
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  provider: "openai",
  defaultVoice: "alloy",
  defaultFormat: "mp3",
  defaultQuality: "medium",
  defaultSpeed: 1.0,
  enableCaching: true,
  cacheExpirationDays: 30,
  maxFileSize: 25, // MB (OpenAI limit)
  costLimits: {
    dailyLimit: 10.0, // $10/day
    monthlyLimit: 100.0, // $100/month
    perRequestLimit: 2.0, // $2/request
  },
  qualitySettings: {
    sampleRate: 22050,
    bitRate: 64000,
    channels: 1, // Mono for podcasts
  },
};

export const SUPPORTED_VOICES: VoiceConfig[] = [
  // OpenAI voices
  {
    provider: "openai",
    voiceId: "alloy",
    displayName: "Alloy",
    gender: "neutral",
    accent: "American",
    description: "Balanced, clear voice suitable for professional content",
    costMultiplier: 1.0,
    qualityRating: 4,
    isAvailable: true,
  },
  {
    provider: "openai",
    voiceId: "echo",
    displayName: "Echo",
    gender: "male",
    accent: "American",
    description: "Deep, authoritative voice perfect for news content",
    costMultiplier: 1.0,
    qualityRating: 4,
    isAvailable: true,
  },
  {
    provider: "openai",
    voiceId: "fable",
    displayName: "Fable",
    gender: "male",
    accent: "British",
    description: "Sophisticated, storytelling voice",
    costMultiplier: 1.0,
    qualityRating: 4,
    isAvailable: true,
  },
  {
    provider: "openai",
    voiceId: "onyx",
    displayName: "Onyx",
    gender: "male",
    accent: "American",
    description: "Strong, confident voice for tech content",
    costMultiplier: 1.0,
    qualityRating: 4,
    isAvailable: true,
  },
  {
    provider: "openai",
    voiceId: "nova",
    displayName: "Nova",
    gender: "female",
    accent: "American",
    description: "Energetic, engaging voice for dynamic content",
    costMultiplier: 1.0,
    qualityRating: 4,
    isAvailable: true,
  },
  {
    provider: "openai",
    voiceId: "shimmer",
    displayName: "Shimmer",
    gender: "female",
    accent: "American",
    description: "Warm, friendly voice for conversational content",
    costMultiplier: 1.0,
    qualityRating: 4,
    isAvailable: true,
  },
];

export const TTS_COST_PER_1K_CHARS: Record<TTSProvider, number> = {
  openai: 0.015, // $15 per 1M characters
  google: 0.016, // Google Cloud TTS pricing
  elevenlabs: 0.3, // Premium but higher quality
  local: 0.0, // Free but requires setup
};

export const AUDIO_FORMAT_SPECS: Record<
  AudioFormat,
  {
    mimeType: string;
    extension: string;
    compressionLevel: number;
    qualityRating: number;
  }
> = {
  mp3: {
    mimeType: "audio/mpeg",
    extension: "mp3",
    compressionLevel: 8,
    qualityRating: 4,
  },
  wav: {
    mimeType: "audio/wav",
    extension: "wav",
    compressionLevel: 0,
    qualityRating: 5,
  },
  flac: {
    mimeType: "audio/flac",
    extension: "flac",
    compressionLevel: 6,
    qualityRating: 5,
  },
  opus: {
    mimeType: "audio/opus",
    extension: "opus",
    compressionLevel: 9,
    qualityRating: 4,
  },
};

export const QUALITY_SETTINGS: Record<
  AudioQuality,
  {
    bitRate: number;
    sampleRate: number;
    qualityMultiplier: number;
  }
> = {
  low: { bitRate: 32000, sampleRate: 16000, qualityMultiplier: 0.7 },
  medium: { bitRate: 64000, sampleRate: 22050, qualityMultiplier: 1.0 },
  high: { bitRate: 128000, sampleRate: 44100, qualityMultiplier: 1.3 },
  hd: { bitRate: 192000, sampleRate: 48000, qualityMultiplier: 1.6 },
};

// Utility types for integration
export interface SummaryToTTSRequest {
  summaryResponse: {
    summary: string;
    ttsOptimized?: {
      text: string;
      estimatedDuration: number;
      pauseMarkers: string[];
    };
  };
  voiceConfig: {
    voice: VoiceType;
    speed?: number;
    provider?: TTSProvider;
  };
  metadata: {
    title: string;
    source: string;
    episodeId?: string;
  };
}

export interface PodcastEpisodeAudio {
  episodeId: string;
  audioUrl: string;
  duration: number;
  fileSize: number;
  voice: VoiceType;
  provider: TTSProvider;
  quality: AudioQuality;
  format: AudioFormat;
  generatedAt: Date;
  cost: number;
}
