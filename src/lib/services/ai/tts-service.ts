// Text-to-Speech Service for podcast audio generation
import { del, list, put } from "@vercel/blob";
import { createHash } from "crypto";
import OpenAI from "openai";

import {
  AUDIO_FORMAT_SPECS,
  type AudioCacheEntry,
  AudioFormat,
  AudioQuality,
  DEFAULT_TTS_CONFIG,
  QUALITY_SETTINGS,
  SUPPORTED_VOICES,
  TTS_COST_PER_1K_CHARS,
  type TTSConfig,
  type TTSHistory,
  type TTSMetrics,
  type TTSProvider,
  type TTSRequest,
  type TTSResponse,
  type VoiceType,
} from "./tts-types";

export class TTSService {
  private cache: Map<string, AudioCacheEntry> = new Map();
  private config: TTSConfig;
  private history: TTSHistory[] = [];
  private metrics: TTSMetrics;
  private openai: null | OpenAI = null;

  constructor(config: Partial<TTSConfig> = {}) {
    this.config = { ...DEFAULT_TTS_CONFIG, ...config };
    this.metrics = this.initializeMetrics();
    this.initializeProviders();
    this.loadCache();
  }

  async clearCache(): Promise<void> {
    // Delete all cached audio files
    for (const entry of this.cache.values()) {
      await this.deleteBlobFile(entry.audioUrl);
    }

    this.cache.clear();
  }

  /**
   * Main TTS generation method
   */
  async generateAudio(request: TTSRequest): Promise<TTSResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Validate request
      this.validateRequest(request);

      // Check cost limits
      this.checkCostLimits(request);

      // Generate content hash for caching
      const contentHash = this.generateContentHash(request);

      // Check cache first
      const cachedResult = await this.checkCache(contentHash);
      if (cachedResult) {
        this.updateMetricsFromCache(cachedResult);
        return cachedResult;
      }

      // Generate audio
      const audioData = await this.generateTTSAudio(request);

      // Upload to Vercel Blob storage
      const audioUrl = await this.uploadAudioToBlob(
        audioData,
        contentHash,
        request
      );

      // Calculate metadata
      const processingTime = Date.now() - startTime;
      const cost = this.calculateCost(
        request.text,
        request.provider || this.config.provider
      );
      const duration = this.estimateAudioDuration(
        request.text,
        request.speed || 1.0
      );

      const response: TTSResponse = {
        audioSize: audioData.byteLength,
        audioUrl,
        duration,
        format: request.format || this.config.defaultFormat,
        metadata: {
          cacheHit: false,
          contentHash,
          cost,
          processingTime,
          provider: request.provider || this.config.provider,
          voice: request.voice,
        },
        quality: request.quality || this.config.defaultQuality,
      };

      // Cache the result
      await this.cacheResult(contentHash, response, request);

      // Update metrics
      this.updateMetrics(response, request, true);

      // Add to history
      this.addToHistory(request, response, true);

      return response;
    } catch (error) {
      this.metrics.failedRequests++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.addToHistory(request, null, false, errorMessage);

      if (error instanceof TTSError) {
        throw error;
      }

      throw new TTSError(
        `TTS generation failed: ${errorMessage}`,
        "UNKNOWN",
        request.provider || this.config.provider,
        false
      );
    }
  }

  getCacheStats(): {
    entries: AudioCacheEntry[];
    size: number;
    totalSize: number;
  } {
    const entries = [...this.cache.values()];
    return {
      entries: entries.sort(
        (a, b) =>
          b.metadata.lastAccessed.getTime() - a.metadata.lastAccessed.getTime()
      ),
      size: entries.length,
      totalSize: entries.reduce(
        (sum, entry) => sum + entry.metadata.fileSize,
        0
      ),
    };
  }

  getConfig(): TTSConfig {
    return { ...this.config };
  }

  getHistory(): TTSHistory[] {
    return [...this.history];
  }

  getMetrics(): TTSMetrics {
    return { ...this.metrics };
  }

  getSupportedVoices(): typeof SUPPORTED_VOICES {
    return SUPPORTED_VOICES.filter((voice) => voice.isAvailable);
  }

  /**
   * Test method for validating configuration
   */
  async testConfiguration(): Promise<{ error?: string; success: boolean }> {
    try {
      const testRequest: TTSRequest = {
        format: "mp3",
        provider: this.config.provider,
        quality: "medium",
        text: "This is a test of the text-to-speech system. If you can hear this, the configuration is working correctly.",
        voice: this.config.defaultVoice,
      };

      const response = await this.generateAudio(testRequest);

      // Clean up test file
      await this.deleteBlobFile(response.audioUrl);

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeProviders(); // Reinitialize providers if needed
  }

  private addToHistory(
    request: TTSRequest,
    response: null | TTSResponse,
    success: boolean,
    error?: string
  ): void {
    const historyEntry: TTSHistory = {
      error,
      id: `tts_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      request,
      response,
      success,
      timestamp: new Date(),
    };

    this.history.push(historyEntry);

    // Keep only last 100 entries
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
  }

  private async cacheResult(
    contentHash: string,
    response: TTSResponse,
    request: TTSRequest
  ): Promise<void> {
    if (!this.config.enableCaching) return;

    const cacheEntry: AudioCacheEntry = {
      audioUrl: response.audioUrl,
      contentHash,
      metadata: {
        accessCount: 1,
        createdAt: new Date(),
        duration: response.duration,
        fileSize: response.audioSize,
        format: response.format,
        lastAccessed: new Date(),
        provider: response.metadata.provider,
        quality: response.quality,
        voice: response.metadata.voice,
      },
    };

    this.cache.set(contentHash, cacheEntry);

    // TODO: Persist cache to database in production
  }

  private calculateCost(text: string, provider: TTSProvider): number {
    const charCount = text.length;
    const costPer1kChars = TTS_COST_PER_1K_CHARS[provider] || 0;
    return (charCount / 1000) * costPer1kChars;
  }

  private async checkCache(contentHash: string): Promise<null | TTSResponse> {
    if (!this.config.enableCaching) return null;

    const cached = this.cache.get(contentHash);
    if (!cached) return null;

    // Check if cache entry is expired
    const expirationDate = new Date(cached.metadata.createdAt);
    expirationDate.setDate(
      expirationDate.getDate() + this.config.cacheExpirationDays
    );

    if (new Date() > expirationDate) {
      // Remove expired cache entry
      this.cache.delete(contentHash);
      await this.deleteBlobFile(cached.audioUrl);
      return null;
    }

    // Update access statistics
    cached.metadata.lastAccessed = new Date();
    cached.metadata.accessCount++;

    return {
      audioSize: cached.metadata.fileSize,
      audioUrl: cached.audioUrl,
      duration: cached.metadata.duration,
      format: cached.metadata.format,
      metadata: {
        cacheHit: true,
        contentHash,
        cost: 0, // No cost for cache hit
        processingTime: 0,
        provider: cached.metadata.provider,
        voice: cached.metadata.voice,
      },
      quality: cached.metadata.quality,
    };
  }

  private checkCostLimits(request: TTSRequest): void {
    const provider = request.provider || this.config.provider;
    const estimatedCost = this.calculateCost(request.text, provider);

    if (estimatedCost > this.config.costLimits.perRequestLimit) {
      throw new TTSError(
        `Request cost ($${estimatedCost.toFixed(4)}) exceeds per-request limit ($${this.config.costLimits.perRequestLimit})`,
        "COST_LIMIT_EXCEEDED",
        provider,
        false
      );
    }

    if (
      this.metrics.last24Hours.cost + estimatedCost >
      this.config.costLimits.dailyLimit
    ) {
      throw new TTSError(
        "Daily cost limit exceeded",
        "COST_LIMIT_EXCEEDED",
        provider,
        false
      );
    }
  }

  private async deleteBlobFile(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.warn("Failed to delete blob file:", error);
    }
  }

  private estimateAudioDuration(text: string, speed: number): number {
    // Rough estimation: average speaking rate is 150-160 words per minute
    const wordCount = text.split(/\s+/u).length;
    const baseDurationMinutes = wordCount / 155; // words per minute
    const adjustedDuration = baseDurationMinutes / speed; // adjust for speed
    return Math.ceil(adjustedDuration * 60); // convert to seconds
  }

  private generateContentHash(request: TTSRequest): string {
    const hashInput = JSON.stringify({
      format: request.format || this.config.defaultFormat,
      pitch: request.pitch || 0,
      provider: request.provider || this.config.provider,
      quality: request.quality || this.config.defaultQuality,
      speed: request.speed || 1.0,
      text: request.text,
      voice: request.voice,
    });

    return createHash("sha256").update(hashInput).digest("hex");
  }

  private async generateOpenAIAudio(request: TTSRequest): Promise<ArrayBuffer> {
    if (!this.openai) {
      throw new TTSError(
        "OpenAI TTS not initialized",
        "API_ERROR",
        "openai",
        false
      );
    }

    try {
      const response = await this.openai.audio.speech.create({
        input: request.text,
        model: "tts-1", // or 'tts-1-hd' for higher quality
        response_format: request.format || "mp3",
        speed: request.speed || 1.0,
        voice: request.voice as any, // OpenAI voice types
      });

      return await response.arrayBuffer();
    } catch (error: any) {
      if (error.status === 429) {
        throw new TTSError("Rate limit exceeded", "RATE_LIMIT", "openai", true);
      }
      if (error.status === 400) {
        throw new TTSError(
          "Invalid request parameters",
          "INVALID_INPUT",
          "openai",
          false
        );
      }
      if (error.status === 401) {
        throw new TTSError("Invalid API key", "AUTH_ERROR", "openai", false);
      }

      throw new TTSError(
        `OpenAI TTS API error: ${error.message}`,
        "API_ERROR",
        "openai",
        error.status >= 500
      );
    }
  }

  /**
   * Public methods for accessing service data
   */

  private async generateTTSAudio(request: TTSRequest): Promise<ArrayBuffer> {
    const provider = request.provider || this.config.provider;

    switch (provider) {
      case "openai":
        return this.generateOpenAIAudio(request);
      case "google":
        throw new TTSError(
          "Google TTS not yet implemented",
          "NOT_IMPLEMENTED",
          provider,
          false
        );
      case "elevenlabs":
        throw new TTSError(
          "ElevenLabs TTS not yet implemented",
          "NOT_IMPLEMENTED",
          provider,
          false
        );
      case "local":
        throw new TTSError(
          "Local TTS not yet implemented",
          "NOT_IMPLEMENTED",
          provider,
          false
        );
      default:
        throw new TTSError(
          `Unsupported TTS provider: ${provider}`,
          "INVALID_PROVIDER",
          provider,
          false
        );
    }
  }

  private initializeMetrics(): TTSMetrics {
    return {
      averageCostPerMinute: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      costByProvider: {
        elevenlabs: 0,
        google: 0,
        local: 0,
        openai: 0,
      },
      failedRequests: 0,
      last24Hours: {
        cost: 0,
        duration: 0,
        requests: 0,
      },
      qualityDistribution: {
        hd: 0,
        high: 0,
        low: 0,
        medium: 0,
      },
      successfulRequests: 0,
      totalCost: 0,
      totalDuration: 0,
      totalRequests: 0,
      totalSize: 0,
      usageByVoice: {} as Record<VoiceType, number>,
    };
  }

  private initializeProviders(): void {
    // Initialize OpenAI TTS if API key is available
    if (process.env.OPENAI_API_KEY && this.config.provider === "openai") {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  private async loadCache(): Promise<void> {
    // In a production app, this would load from a persistent cache
    // For now, we'll use in-memory cache that resets on restart
    try {
      // TODO: Load cache from database or Redis
      console.log("TTS cache initialized (in-memory)");
    } catch (error) {
      console.warn("Failed to load TTS cache:", error);
    }
  }

  private updateMetrics(
    response: TTSResponse,
    request: TTSRequest,
    success: boolean
  ): void {
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.totalCost += response.metadata.cost;
      this.metrics.totalDuration += response.duration;
      this.metrics.totalSize += response.audioSize;

      // Update provider costs
      this.metrics.costByProvider[response.metadata.provider] +=
        response.metadata.cost;

      // Update voice usage
      if (!this.metrics.usageByVoice[response.metadata.voice]) {
        this.metrics.usageByVoice[response.metadata.voice] = 0;
      }
      this.metrics.usageByVoice[response.metadata.voice]++;

      // Update quality distribution
      this.metrics.qualityDistribution[response.quality]++;

      // Update averages
      this.metrics.averageProcessingTime =
        (this.metrics.averageProcessingTime *
          (this.metrics.successfulRequests - 1) +
          response.metadata.processingTime) /
        this.metrics.successfulRequests;

      if (this.metrics.totalDuration > 0) {
        this.metrics.averageCostPerMinute =
          (this.metrics.totalCost / this.metrics.totalDuration) * 60;
      }

      // Update 24-hour metrics
      this.metrics.last24Hours.requests++;
      this.metrics.last24Hours.cost += response.metadata.cost;
      this.metrics.last24Hours.duration += response.duration;
    }

    // Update cache hit rate
    if (this.metrics.totalRequests > 0) {
      const cacheHits = [...this.cache.values()].reduce(
        (sum, entry) => sum + entry.metadata.accessCount - 1,
        0
      );
      this.metrics.cacheHitRate = cacheHits / this.metrics.totalRequests;
    }
  }

  /**
   * Cache management methods
   */

  private updateMetricsFromCache(response: TTSResponse): void {
    this.metrics.totalRequests++; // Already incremented, but keeping for consistency
    this.metrics.successfulRequests++;

    // Update cache hit rate
    const cacheHits = [...this.cache.values()].reduce(
      (sum, entry) => sum + entry.metadata.accessCount - 1,
      0
    );
    this.metrics.cacheHitRate = cacheHits / this.metrics.totalRequests;
  }

  private async uploadAudioToBlob(
    audioData: ArrayBuffer,
    contentHash: string,
    request: TTSRequest
  ): Promise<string> {
    try {
      const format = request.format || this.config.defaultFormat;
      const filename = `tts/${contentHash}.${AUDIO_FORMAT_SPECS[format].extension}`;

      const blob = await put(filename, audioData, {
        access: "public",
        contentType: AUDIO_FORMAT_SPECS[format].mimeType,
      });

      return blob.url;
    } catch (error) {
      throw new TTSError(
        `Failed to upload audio file: ${error instanceof Error ? error.message : "Unknown error"}`,
        "STORAGE_ERROR",
        undefined,
        true
      );
    }
  }

  private validateRequest(request: TTSRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new TTSError("Text is required", "INVALID_INPUT", undefined, false);
    }

    if (request.text.length > 4096) {
      throw new TTSError(
        "Text too long (max 4,096 characters for OpenAI)",
        "INVALID_INPUT",
        undefined,
        false
      );
    }

    if (request.speed && (request.speed < 0.25 || request.speed > 4.0)) {
      throw new TTSError(
        "Speed must be between 0.25 and 4.0",
        "INVALID_INPUT",
        undefined,
        false
      );
    }

    const voice = SUPPORTED_VOICES.find((v) => v.voiceId === request.voice);
    if (!voice || !voice.isAvailable) {
      throw new TTSError(
        `Voice ${request.voice} is not available`,
        "INVALID_INPUT",
        undefined,
        false
      );
    }
  }
}

// Create TTSError class
class TTSError extends Error implements TTSError {
  constructor(
    message: string,
    public code: string,
    public provider?: TTSProvider,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "TTSError";
  }
}

// Export singleton instance
export const ttsService = new TTSService();
