import { createId } from "@paralleldrive/cuid2";
import OpenAI from "openai";

import {
  TTSRequest,
  TTSResult,
  TTSOptions,
  AIServiceError,
  RateLimitError,
  QuotaExceededError,
  InvalidInputError,
  CostTracking,
} from "./types";

// OpenAI TTS pricing (as of 2024) - update these as needed
const TTS_PRICING = {
  "tts-1": 0.015, // per 1K characters
  "tts-1-hd": 0.03, // per 1K characters
} as const;

export class TTSService {
  private openai: OpenAI;
  private defaultModel: "tts-1" | "tts-1-hd" = "tts-1";
  private defaultVoice:
    | "alloy"
    | "echo"
    | "fable"
    | "onyx"
    | "nova"
    | "shimmer" = "alloy";
  private costTracker: CostTracking[] = [];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }

  /**
   * Convert text to speech using OpenAI TTS
   */
  async generateSpeech(request: TTSRequest): Promise<TTSResult> {
    const startTime = Date.now();
    const requestId = createId();

    try {
      // Validate input
      this.validateRequest(request);

      // Prepare options
      const options = this.prepareOptions(request.options);

      // Call OpenAI TTS API
      const response = await this.callOpenAI(request.text, options);

      // Convert response to buffer
      const audioBuffer = Buffer.from(await response.arrayBuffer());

      // Calculate cost
      const cost = this.calculateCost(request.text, options.model);

      // Estimate duration (average speaking rate: ~150 words per minute)
      const wordCount = request.text.split(/\s+/).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

      // Track costs
      this.trackCost({
        service: "openai-tts",
        model: options.model,
        charactersProcessed: request.text.length,
        cost,
        timestamp: new Date(),
        requestId,
      });

      return {
        success: true,
        audioBuffer,
        duration: estimatedDuration,
        fileSize: audioBuffer.length,
        cost,
        metadata: {
          model: options.model,
          voice: options.voice,
          processingTime: Date.now() - startTime,
          charactersProcessed: request.text.length,
        },
      };
    } catch (error) {
      console.error("TTS error:", error);

      if (error instanceof AIServiceError) {
        return {
          success: false,
          error: error.message,
          metadata: {
            model: this.defaultModel,
            voice: this.defaultVoice,
            processingTime: Date.now() - startTime,
            charactersProcessed: request.text.length,
          },
        };
      }

      // Handle OpenAI specific errors
      if (error instanceof Error && "status" in error) {
        const aiError = this.handleOpenAIError(error as any);
        return {
          success: false,
          error: aiError.message,
          metadata: {
            model: this.defaultModel,
            voice: this.defaultVoice,
            processingTime: Date.now() - startTime,
            charactersProcessed: request.text.length,
          },
        };
      }

      return {
        success: false,
        error: "Unknown error occurred during TTS generation",
        metadata: {
          model: this.defaultModel,
          voice: this.defaultVoice,
          processingTime: Date.now() - startTime,
          charactersProcessed: request.text.length,
        },
      };
    }
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(): CostTracking[] {
    return [...this.costTracker];
  }

  /**
   * Clear cost tracking data
   */
  clearCostTracking(): void {
    this.costTracker = [];
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): string[] {
    return ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return ["tts-1", "tts-1-hd"];
  }

  private validateRequest(request: TTSRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new InvalidInputError("tts", "No text provided");
    }

    if (request.text.length > 4096) {
      throw new InvalidInputError("tts", "Text too long (max 4096 characters)");
    }

    // Check for valid voice if provided
    if (
      request.options?.voice &&
      !this.getAvailableVoices().includes(request.options.voice)
    ) {
      throw new InvalidInputError(
        "tts",
        `Invalid voice: ${request.options.voice}`
      );
    }

    // Check for valid model if provided
    if (
      request.options?.model &&
      !this.getAvailableModels().includes(request.options.model)
    ) {
      throw new InvalidInputError(
        "tts",
        `Invalid model: ${request.options.model}`
      );
    }

    // Check speed range
    if (
      request.options?.speed &&
      (request.options.speed < 0.25 || request.options.speed > 4.0)
    ) {
      throw new InvalidInputError("tts", "Speed must be between 0.25 and 4.0");
    }
  }

  private prepareOptions(options?: TTSOptions) {
    return {
      model: options?.model || this.defaultModel,
      voice: options?.voice || this.defaultVoice,
      speed: options?.speed || 1.0,
      response_format: options?.responseFormat || "mp3",
    };
  }

  private async callOpenAI(text: string, options: any) {
    return await this.openai.audio.speech.create({
      model: options.model,
      voice: options.voice,
      input: text,
      speed: options.speed,
      response_format: options.response_format,
    });
  }

  private calculateCost(text: string, model: string): number {
    const pricing = TTS_PRICING[model as keyof typeof TTS_PRICING];
    if (!pricing) {
      return 0;
    }

    const characterCount = text.length;
    const cost = (characterCount / 1000) * pricing;

    return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
  }

  private trackCost(tracking: CostTracking): void {
    this.costTracker.push(tracking);

    // Keep only last 100 entries to prevent memory issues
    if (this.costTracker.length > 100) {
      this.costTracker = this.costTracker.slice(-100);
    }
  }

  private handleOpenAIError(error: any): AIServiceError {
    switch (error.status) {
      case 429:
        const retryAfter = error.headers?.["retry-after"]
          ? parseInt(error.headers["retry-after"])
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
}
