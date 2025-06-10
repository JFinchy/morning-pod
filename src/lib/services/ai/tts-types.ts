// Text-to-Speech Service Types for podcast audio generation
export type TTSProvider = "elevenlabs" | "google" | "local" | "openai";

export type VoiceType =
  // OpenAI voices
  | "alloy"
  | "antoni"
  | "bella"
  | "domi"
  | "echo"
  | "en-US-Wavenet-A"
  // Google voices (examples)
  | "en-US-Wavenet-B"
  | "en-US-Wavenet-C"
  | "fable"
  // ElevenLabs voices (examples)
  | "nova"
  | "onyx"
  | "rachel"
  | "shimmer";

export type AudioFormat = "flac" | "mp3" | "opus" | "wav";

export type AudioQuality = "hd" | "high" | "low" | "medium";

export interface TTSRequest {
  format?: AudioFormat;
  metadata?: {
    contentHash?: string;
    episodeId?: string;
    source?: string;
    title?: string;
  };
  pitch?: number; // -20 to 20 semitones
  provider?: TTSProvider;
  quality?: AudioQuality;
  speed?: number; // 0.25 to 4.0
  text: string;
  voice: VoiceType;
  volume?: number; // 0.0 to 1.0
}

export interface TTSResponse {
  audioSize: number; // bytes
  audioUrl: string;
  duration: number; // seconds
  format: AudioFormat;
  metadata: {
    cacheHit: boolean;
    contentHash: string;
    cost: number;
    processingTime: number;
    provider: TTSProvider;
    voice: VoiceType;
  };
  quality: AudioQuality;
  waveformData?: number[]; // For visualization
}

export interface TTSConfig {
  cacheExpirationDays: number;
  costLimits: {
    dailyLimit: number;
    monthlyLimit: number;
    perRequestLimit: number;
  };
  defaultFormat: AudioFormat;
  defaultQuality: AudioQuality;
  defaultSpeed: number;
  defaultVoice: VoiceType;
  enableCaching: boolean;
  maxFileSize: number; // MB
  provider: TTSProvider;
  qualitySettings: {
    bitRate: number;
    channels: number;
    sampleRate: number;
  };
}

export interface TTSMetrics {
  averageCostPerMinute: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  costByProvider: Record<TTSProvider, number>;
  failedRequests: number;
  last24Hours: {
    cost: number;
    duration: number;
    requests: number;
  };
  qualityDistribution: {
    hd: number;
    high: number;
    low: number;
    medium: number;
  };
  successfulRequests: number;
  totalCost: number;
  totalDuration: number; // seconds of audio generated
  totalRequests: number;
  totalSize: number; // bytes of audio generated
  usageByVoice: Record<VoiceType, number>;
}

export interface TTSHistory {
  error?: string;
  id: string;
  request: TTSRequest;
  response: null | TTSResponse;
  success: boolean;
  timestamp: Date;
}

export interface AudioCacheEntry {
  audioUrl: string;
  contentHash: string;
  metadata: {
    accessCount: number;
    createdAt: Date;
    duration: number;
    fileSize: number;
    format: AudioFormat;
    lastAccessed: Date;
    provider: TTSProvider;
    quality: AudioQuality;
    voice: VoiceType;
  };
}

export interface VoiceConfig {
  accent: string;
  costMultiplier: number;
  description: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  isAvailable: boolean;
  provider: TTSProvider;
  qualityRating: number; // 1-5
  voiceId: VoiceType;
}

export interface TTSError extends Error {
  code: string;
  provider?: TTSProvider;
  retryable: boolean;
}

// Configuration constants
export const DEFAULT_TTS_CONFIG: TTSConfig = {
  cacheExpirationDays: 30,
  costLimits: {
    dailyLimit: 10.0, // $10/day
    monthlyLimit: 100.0, // $100/month
    perRequestLimit: 2.0, // $2/request
  },
  defaultFormat: "mp3",
  defaultQuality: "medium",
  defaultSpeed: 1.0,
  defaultVoice: "alloy",
  enableCaching: true,
  maxFileSize: 25, // MB (OpenAI limit)
  provider: "openai",
  qualitySettings: {
    bitRate: 64000,
    channels: 1, // Mono for podcasts
    sampleRate: 22050,
  },
};

export const SUPPORTED_VOICES: VoiceConfig[] = [
  // OpenAI voices
  {
    accent: "American",
    costMultiplier: 1.0,
    description: "Balanced, clear voice suitable for professional content",
    displayName: "Alloy",
    gender: "neutral",
    isAvailable: true,
    provider: "openai",
    qualityRating: 4,
    voiceId: "alloy",
  },
  {
    accent: "American",
    costMultiplier: 1.0,
    description: "Deep, authoritative voice perfect for news content",
    displayName: "Echo",
    gender: "male",
    isAvailable: true,
    provider: "openai",
    qualityRating: 4,
    voiceId: "echo",
  },
  {
    accent: "British",
    costMultiplier: 1.0,
    description: "Sophisticated, storytelling voice",
    displayName: "Fable",
    gender: "male",
    isAvailable: true,
    provider: "openai",
    qualityRating: 4,
    voiceId: "fable",
  },
  {
    accent: "American",
    costMultiplier: 1.0,
    description: "Strong, confident voice for tech content",
    displayName: "Onyx",
    gender: "male",
    isAvailable: true,
    provider: "openai",
    qualityRating: 4,
    voiceId: "onyx",
  },
  {
    accent: "American",
    costMultiplier: 1.0,
    description: "Energetic, engaging voice for dynamic content",
    displayName: "Nova",
    gender: "female",
    isAvailable: true,
    provider: "openai",
    qualityRating: 4,
    voiceId: "nova",
  },
  {
    accent: "American",
    costMultiplier: 1.0,
    description: "Warm, friendly voice for conversational content",
    displayName: "Shimmer",
    gender: "female",
    isAvailable: true,
    provider: "openai",
    qualityRating: 4,
    voiceId: "shimmer",
  },
];

export const TTS_COST_PER_1K_CHARS: Record<TTSProvider, number> = {
  elevenlabs: 0.3, // Premium but higher quality
  google: 0.016, // Google Cloud TTS pricing
  local: 0.0, // Free but requires setup
  openai: 0.015, // $15 per 1M characters
};

export const AUDIO_FORMAT_SPECS: Record<
  AudioFormat,
  {
    compressionLevel: number;
    extension: string;
    mimeType: string;
    qualityRating: number;
  }
> = {
  flac: {
    compressionLevel: 6,
    extension: "flac",
    mimeType: "audio/flac",
    qualityRating: 5,
  },
  mp3: {
    compressionLevel: 8,
    extension: "mp3",
    mimeType: "audio/mpeg",
    qualityRating: 4,
  },
  opus: {
    compressionLevel: 9,
    extension: "opus",
    mimeType: "audio/opus",
    qualityRating: 4,
  },
  wav: {
    compressionLevel: 0,
    extension: "wav",
    mimeType: "audio/wav",
    qualityRating: 5,
  },
};

export const QUALITY_SETTINGS: Record<
  AudioQuality,
  {
    bitRate: number;
    qualityMultiplier: number;
    sampleRate: number;
  }
> = {
  hd: { bitRate: 192000, qualityMultiplier: 1.6, sampleRate: 48000 },
  high: { bitRate: 128000, qualityMultiplier: 1.3, sampleRate: 44100 },
  low: { bitRate: 32000, qualityMultiplier: 0.7, sampleRate: 16000 },
  medium: { bitRate: 64000, qualityMultiplier: 1.0, sampleRate: 22050 },
};

// Utility types for integration
export interface SummaryToTTSRequest {
  metadata: {
    episodeId?: string;
    source: string;
    title: string;
  };
  summaryResponse: {
    summary: string;
    ttsOptimized?: {
      estimatedDuration: number;
      pauseMarkers: string[];
      text: string;
    };
  };
  voiceConfig: {
    provider?: TTSProvider;
    speed?: number;
    voice: VoiceType;
  };
}

export interface PodcastEpisodeAudio {
  audioUrl: string;
  cost: number;
  duration: number;
  episodeId: string;
  fileSize: number;
  format: AudioFormat;
  generatedAt: Date;
  provider: TTSProvider;
  quality: AudioQuality;
  voice: VoiceType;
}
