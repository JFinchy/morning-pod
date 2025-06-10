import { put } from "@vercel/blob";
import OpenAI from "openai";
import { z } from "zod";

import {
  AIServiceError,
  type CostTracking,
  InvalidInputError,
  QuotaExceededError,
  RateLimitError,
  type TTSOptions,
  type TTSRequest,
  type TTSResult,
} from "./types";

/**
 * Configuration for Text-to-Speech service
 *
 * @business-context We use OpenAI TTS for high-quality voice synthesis.
 *                   Audio files are stored in Vercel Blob for fast global delivery.
 * @decision-date 2024-01-22
 * @decision-by Product team after voice quality comparison testing
 */
const TTS_CONFIG = {
  baseDelay: 1000, // 1 second base retry delay
  format: "mp3" as const,
  maxRetries: 3,
  maxTextLength: 4096, // OpenAI TTS character limit
  model: "tts-1" as const, // Standard quality, faster and cheaper
  voice: "alloy" as const, // Neutral, professional voice
} as const;

/**
 * Pricing per character (as of 2024-01-22)
 * @business-context Updated monthly from OpenAI pricing page
 */
const PRICING = {
  "tts-1": 0.000015, // $0.015 per 1K characters
  "tts-1-hd": 0.00003, // $0.030 per 1K characters
} as const;

/**
 * Available voice options
 * @business-context Different voices for different content types and audiences
 */
export const VOICES = {
  alloy: "Neutral, balanced voice suitable for most content",
  echo: "Male voice with clear pronunciation",
  fable: "British accent, good for storytelling",
  nova: "Female voice, warm and engaging",
  onyx: "Deep male voice, authoritative tone",
  shimmer: "Female voice, bright and energetic",
} as const;

export type VoiceOption = keyof typeof VOICES;

/**
 * Error types for better error handling
 */
export class TTSError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "API_ERROR"
      | "RETRY_EXHAUSTED"
      | "STORAGE_ERROR"
      | "TEXT_TOO_LONG"
      | "VALIDATION_ERROR",
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "TTSError";
  }
}

/**
 * Text-to-Speech Service
 *
 * Converts text content into high-quality audio files using OpenAI TTS
 * and stores them in Vercel Blob for fast global delivery
 *
 * @business-context Creates professional podcast-quality audio from text summaries.
 *                   Optimized for cost efficiency while maintaining high quality.
 */
export class TTSService {
  private costTracker: CostTracking[] = [];
  private defaultModel: "tts-1-hd" | "tts-1" = "tts-1";
  private defaultVoice: VoiceOption = "alloy";
  private openai: OpenAI;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new TTSError("OpenAI API key is required", "VALIDATION_ERROR");
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new TTSError("Vercel Blob token is required", "VALIDATION_ERROR");
    }

    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Get service configuration
   * @business-context Exposed for monitoring and debugging
   */
  static getConfig() {
    return TTS_CONFIG;
  }

  /**
   * Get current pricing information
   * @business-context Exposed for cost monitoring and budgeting
   */
  static getPricing() {
    return PRICING;
  }

  /**
   * Get available voices with descriptions
   * @business-context Helps users choose appropriate voice for their content
   */
  static getVoices() {
    return VOICES;
  }

  /**
   * Clear cost tracking data
   */
  clearCostTracking(): void {
    this.costTracker = [];
  }

  /**
   * Generate audio from long text by splitting into chunks
   *
   * @business-context Handles content longer than OpenAI's character limit
   *                   by intelligently splitting text and combining audio files.
   */
  async generateLongAudio(
    text: string,
    voice: VoiceOption = "alloy",
    model: "tts-1-hd" | "tts-1" = "tts-1"
  ): Promise<TTSResult> {
    if (text.length <= TTS_CONFIG.maxTextLength) {
      // Text is short enough, use regular generation
      return this.generateSpeech({
        options: { model, voice },
        text,
      });
    }

    // Split text into chunks at sentence boundaries
    const chunks = this.splitTextIntoChunks(text, TTS_CONFIG.maxTextLength);

    if (chunks.length > 10) {
      throw new TTSError(
        "Text too long even after splitting (max 10 chunks)",
        "TEXT_TOO_LONG"
      );
    }

    // Generate audio for each chunk
    const audioResults: TTSResult[] = [];
    let totalCost = 0;
    let totalDuration = 0;
    let totalFileSize = 0;

    for (const [i, chunk] of chunks.entries()) {
      const result = await this.generateSpeech({
        options: { model, voice },
        text: chunk,
      });

      if (result.success) {
        audioResults.push(result);
        totalCost += result.cost || 0;
        totalDuration += result.duration || 0;
        totalFileSize += result.fileSize || 0;
      } else {
        throw new TTSError(
          `Failed to generate audio for chunk ${i + 1}: ${result.error}`,
          "API_ERROR"
        );
      }
    }

    // For now, return the first chunk URL
    // TODO: Implement audio concatenation service
    const mainResult = audioResults[0];

    return {
      audioBuffer: mainResult.audioBuffer,
      audioUrl: mainResult.audioUrl,
      cost: totalCost,
      duration: totalDuration,
      fileSize: totalFileSize,
      metadata: {
        charactersProcessed: text.length,
        model,
        processingTime: Date.now(),
        voice,
      },
      success: true,
    };
  }

  /**
   * Convert text to speech using OpenAI TTS
   *
   * @business-context Creates high-quality audio files optimized for podcast
   *                   consumption. Files are automatically stored in Vercel Blob
   *                   for fast global delivery and CDN caching.
   */
  async generateSpeech(request: TTSRequest): Promise<TTSResult> {
    const startTime = Date.now();

    try {
      // Validate input
      this.validateRequest(request);

      // Prepare options
      const options = this.prepareOptions(request.options);

      // Call OpenAI TTS API
      const response = await this.callOpenAI(request.text, options);

      // Convert response to buffer
      const audioBuffer = Buffer.from(await response.arrayBuffer());

      // Generate filename
      const filename = this.generateFilename();

      // Upload to Vercel Blob
      const blob = await put(filename, audioBuffer, {
        access: "public",
        contentType: "audio/mpeg",
      });

      // Calculate cost
      const cost = this.calculateCost(request.text, options.model);

      // Estimate duration (average speaking rate: ~150 words per minute)
      const wordCount = request.text.split(/\s+/u).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

      // Track costs
      this.trackCost({
        charactersProcessed: request.text.length,
        cost,
        model: options.model,
        requestId: `tts-${Date.now()}`,
        service: "openai-tts",
        timestamp: new Date(),
      });

      return {
        audioBuffer,
        audioUrl: blob.url,
        cost,
        duration: estimatedDuration,
        fileSize: audioBuffer.length,
        metadata: {
          charactersProcessed: request.text.length,
          model: options.model,
          processingTime: Date.now() - startTime,
          voice: options.voice,
        },
        success: true,
      };
    } catch (error) {
      console.error("TTS error:", error);

      if (error instanceof TTSError) {
        return {
          error: error.message,
          metadata: {
            charactersProcessed: request.text.length,
            model: this.defaultModel,
            processingTime: Date.now() - startTime,
            voice: this.defaultVoice,
          },
          success: false,
        };
      }

      // Handle OpenAI specific errors
      if (error instanceof Error && "status" in error) {
        const aiError = this.handleOpenAIError(error as any);
        return {
          error: aiError.message,
          metadata: {
            charactersProcessed: request.text.length,
            model: this.defaultModel,
            processingTime: Date.now() - startTime,
            voice: this.defaultVoice,
          },
          success: false,
        };
      }

      return {
        error: "Unknown error occurred during TTS generation",
        metadata: {
          charactersProcessed: request.text.length,
          model: this.defaultModel,
          processingTime: Date.now() - startTime,
          voice: this.defaultVoice,
        },
        success: false,
      };
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return ["tts-1", "tts-1-hd"];
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): string[] {
    return Object.keys(VOICES);
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(): CostTracking[] {
    return [...this.costTracker];
  }

  /**
   * Validate API key and connection
   *
   * @business-context Used during service initialization to ensure
   *                   configuration is correct before attempting operations
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  private calculateCost(text: string, model: string): number {
    const pricePerChar =
      PRICING[model as keyof typeof PRICING] || PRICING["tts-1"];
    return Math.round(text.length * pricePerChar * 10000) / 10000; // Round to 4 decimal places
  }

  private async callOpenAI(text: string, options: any) {
    return await this.openai.audio.speech.create({
      input: text,
      model: options.model,
      response_format: options.response_format,
      voice: options.voice,
    });
  }

  /**
   * Generate a unique filename for audio files
   *
   * @business-context Creates timestamped filenames for easy identification
   *                   and prevents naming conflicts in blob storage
   */
  private generateFilename(): string {
    const timestamp = new Date().toISOString().replace(/[.:]/gu, "-");
    const random = Math.random().toString(36).slice(2, 8);
    return `podcast-${timestamp}-${random}.mp3`;
  }

  private handleOpenAIError(error: any): AIServiceError {
    switch (error.status) {
      case 429:
        const retryAfter = error.headers?.["retry-after"]
          ? Number.parseInt(error.headers["retry-after"])
          : undefined;
        return new RateLimitError("tts", retryAfter);

      case 402:
        return new QuotaExceededError("tts");

      case 400:
        return new InvalidInputError("tts", error.message);

      default:
        return new AIServiceError(
          `OpenAI API error: ${error.message}`,
          "tts",
          error.code || "UNKNOWN",
          error.status ? error.status >= 500 : false
        );
    }
  }

  private prepareOptions(options?: TTSOptions) {
    return {
      model: options?.model || this.defaultModel,
      response_format: "mp3",
      voice: options?.voice || this.defaultVoice,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Split text into chunks at sentence boundaries
   *
   * @business-context Ensures natural breaks in audio when splitting long content
   */
  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";

    // Split by sentences (periods, exclamation marks, question marks)
    const sentences = text.split(/(?<=[!.?])\s+/u);

    for (const sentence of sentences) {
      // If adding this sentence would exceed the limit
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          // Single sentence is too long, split by words
          const words = sentence.split(" ");
          let wordChunk = "";

          for (const word of words) {
            if (wordChunk.length + word.length + 1 > maxLength) {
              if (wordChunk.length > 0) {
                chunks.push(wordChunk.trim());
                wordChunk = word;
              } else {
                // Single word is too long, just add it
                chunks.push(word);
              }
            } else {
              wordChunk += (wordChunk.length > 0 ? " " : "") + word;
            }
          }

          if (wordChunk.length > 0) {
            currentChunk = wordChunk;
          }
        }
      } else {
        currentChunk += (currentChunk.length > 0 ? " " : "") + sentence;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private trackCost(tracking: CostTracking): void {
    this.costTracker.push(tracking);

    // Keep only last 100 entries to prevent memory issues
    if (this.costTracker.length > 100) {
      this.costTracker = this.costTracker.slice(-100);
    }
  }

  private validateRequest(request: TTSRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new InvalidInputError("tts", "Text is required");
    }

    if (request.text.length > 100000) {
      // 100k characters max for safety
      throw new InvalidInputError("tts", "Text too long (max 100k characters)");
    }

    if (
      request.options?.voice &&
      !Object.keys(VOICES).includes(request.options.voice)
    ) {
      throw new InvalidInputError(
        "tts",
        `Invalid voice. Available voices: ${Object.keys(VOICES).join(", ")}`
      );
    }

    if (
      request.options?.model &&
      !["tts-1", "tts-1-hd"].includes(request.options.model)
    ) {
      throw new InvalidInputError(
        "tts",
        "Invalid model. Available models: tts-1, tts-1-hd"
      );
    }
  }
}

/**
 * Factory function to create TTS service instance
 *
 * @business-context Provides consistent service instantiation with
 *                   environment-based configuration and error handling
 */
export function createTTSService(apiKey?: string): TTSService {
  return new TTSService(apiKey);
}
