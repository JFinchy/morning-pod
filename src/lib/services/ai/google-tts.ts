import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { createId } from "@paralleldrive/cuid2";

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

// Google Cloud TTS pricing (as of 2024) - much cheaper than OpenAI
const GOOGLE_TTS_PRICING = {
  neural2: 0.000016, // $16 per 1M characters
  standard: 0.000004, // $4 per 1M characters
  wavenet: 0.000016, // $16 per 1M characters
} as const;

export interface ConversationalScript {
  lines: Array<{
    emphasis?: "normal" | "reduced" | "strong";
    pauseAfter?: number; // milliseconds
    speaker: "HOST_A" | "HOST_B";
    text: string;
  }>;
}

export interface GoogleTTSVoice {
  gender: "FEMALE" | "MALE" | "NEUTRAL";
  languageCode: string;
  name: string;
  naturalness: number; // 1-10 scale
  type: "neural2" | "standard" | "wavenet";
}

export class GoogleTTSService {
  private client: TextToSpeechClient;
  private costTracker: CostTracking[] = [];

  // Pre-selected voice pairs for conversational podcasts
  // Optimized for fun, uplifting tone like "Upfirst" podcast
  private readonly VOICE_PAIRS = {
    budget: {
      HOST_A: {
        gender: "MALE" as const,
        name: "en-US-Standard-B",
        type: "standard" as const,
      },
      HOST_B: {
        gender: "FEMALE" as const,
        name: "en-US-Standard-C",
        type: "standard" as const,
      },
    },
    professional: {
      HOST_A: {
        gender: "MALE" as const,
        name: "en-US-Neural2-J",
        type: "neural2" as const,
      },
      HOST_B: {
        gender: "FEMALE" as const,
        name: "en-US-Neural2-H",
        type: "neural2" as const,
      },
    },
    upbeat: {
      HOST_A: {
        gender: "MALE" as const,
        name: "en-US-Neural2-D",
        type: "neural2" as const,
      }, // Warm, friendly male voice
      HOST_B: {
        gender: "FEMALE" as const,
        name: "en-US-Neural2-F",
        type: "neural2" as const,
      }, // Bright, energetic female voice
    },
  };

  constructor() {
    if (
      !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      !process.env.GOOGLE_CLOUD_PROJECT_ID
    ) {
      throw new Error("Google Cloud credentials are required");
    }

    this.client = new TextToSpeechClient();
  }

  /**
   * Generate conversational podcast audio from script
   */
  async generateConversationalAudio(
    script: ConversationalScript,
    options: {
      addPauses?: boolean;
      outputFormat?: "mp3" | "wav";
      voiceStyle?: "budget" | "professional" | "upbeat";
    } = {}
  ): Promise<{
    audioSegments?: Array<{
      audioBuffer: Buffer;
      duration: number;
      speaker: string;
    }>;
    error?: string;
    success: boolean;
    totalCost?: number;
    totalDuration?: number;
  }> {
    try {
      const voiceStyle = options.voiceStyle || "upbeat";
      const voices = this.VOICE_PAIRS[voiceStyle];
      const audioSegments = [];
      let totalCost = 0;
      let totalDuration = 0;

      for (const line of script.lines) {
        const voice = voices[line.speaker];
        if (!voice) {
          throw new Error(`Invalid speaker: ${line.speaker}`);
        }

        // Add SSML for better control
        const ssmlText = this.buildSSML(line.text, {
          emphasis: line.emphasis,
          pauseAfter: line.pauseAfter,
        });

        const audioResult = await this.synthesizeSpeech({
          options: {
            format: options.outputFormat || "mp3",
            gender: voice.gender,
            useSSML: true,
            voice: voice.name,
          },
          text: ssmlText,
        });

        if (audioResult.success && audioResult.audioBuffer) {
          audioSegments.push({
            audioBuffer: audioResult.audioBuffer,
            duration: audioResult.duration || 0,
            speaker: line.speaker,
          });

          totalCost += audioResult.cost || 0;
          totalDuration += audioResult.duration || 0;
        }
      }

      return {
        audioSegments,
        success: true,
        totalCost,
        totalDuration,
      };
    } catch (error) {
      console.error("Conversational audio generation error:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  /**
   * Generate conversational script from summary (integrates with your existing AI)
   */
  generateConversationalScript(summary: string): ConversationalScript {
    // This would typically use your Gemini/OpenAI service to generate the script
    // For now, here's a simple format converter
    const sentences = summary
      .split(/[!.?]+/u)
      .filter((s) => s.trim().length > 0);
    const lines = [];

    for (let i = 0; i < sentences.length; i++) {
      const speaker = i % 2 === 0 ? "HOST_A" : "HOST_B";
      const text = sentences[i].trim();

      if (text) {
        lines.push({
          pauseAfter: i < sentences.length - 1 ? 800 : 1500, // Pause between speakers
          speaker: speaker as "HOST_A" | "HOST_B",
          text,
        });
      }
    }

    return { lines };
  }

  /**
   * Get available voice pairs for conversations
   */
  getAvailableVoicePairs() {
    return Object.keys(this.VOICE_PAIRS);
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(): CostTracking[] {
    return [...this.costTracker];
  }

  /**
   * Generate single voice TTS (compatible with existing TTSService interface)
   */
  async synthesizeSpeech(request: TTSRequest): Promise<TTSResult> {
    const startTime = Date.now();
    const requestId = createId();

    try {
      this.validateRequest(request);

      const ssmlInput = request.options?.useSSML
        ? request.text
        : `<speak>${request.text}</speak>`;

      // Determine voice configuration
      const voiceConfig = this.getVoiceConfig(request.options);

      // Call Google Cloud TTS API
      const [response] = await this.client.synthesizeSpeech({
        audioConfig: {
          audioEncoding: voiceConfig.format === "wav" ? "LINEAR16" : "MP3",
          pitch: request.options?.pitch || 0.0,
          speakingRate: request.options?.speed || 1.0,
          volumeGainDb: request.options?.volume || 0.0,
        },
        input: { ssml: ssmlInput },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.gender,
        },
      });

      if (!response.audioContent) {
        throw new AIServiceError("No audio content generated", "tts");
      }

      const audioBuffer = Buffer.from(response.audioContent);

      // Calculate cost (much cheaper than OpenAI!)
      const cost = this.calculateCost(request.text, voiceConfig.type);

      // Estimate duration
      const wordCount = request.text.split(/\s+/u).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60); // 150 WPM

      // Track costs
      this.trackCost({
        charactersProcessed: request.text.length,
        cost,
        model: voiceConfig.name,
        requestId,
        service: "google-tts",
        timestamp: new Date(),
      });

      return {
        audioBuffer,
        cost,
        duration: estimatedDuration,
        fileSize: audioBuffer.length,
        metadata: {
          charactersProcessed: request.text.length,
          model: voiceConfig.name,
          processingTime: Date.now() - startTime,
          voice: voiceConfig.name,
        },
        success: true,
      };
    } catch (error) {
      console.error("Google TTS error:", error);

      return {
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          charactersProcessed: request.text.length,
          model: "google-tts",
          processingTime: Date.now() - startTime,
          voice: "unknown",
        },
        success: false,
      };
    }
  }

  /**
   * Build SSML for enhanced speech control
   */
  private buildSSML(
    text: string,
    options: {
      emphasis?: "normal" | "reduced" | "strong";
      pauseAfter?: number;
      rate?: "fast" | "medium" | "slow";
    } = {}
  ): string {
    let ssml = `<speak>`;

    // Add rate control
    if (options.rate && options.rate !== "medium") {
      ssml += `<prosody rate="${options.rate}">`;
    }

    // Add emphasis
    if (options.emphasis && options.emphasis !== "normal") {
      ssml += `<emphasis level="${options.emphasis}">`;
    }

    ssml += text;

    // Close emphasis
    if (options.emphasis && options.emphasis !== "normal") {
      ssml += `</emphasis>`;
    }

    // Close rate
    if (options.rate && options.rate !== "medium") {
      ssml += `</prosody>`;
    }

    // Add pause
    if (options.pauseAfter) {
      ssml += `<break time="${options.pauseAfter}ms"/>`;
    }

    ssml += `</speak>`;
    return ssml;
  }

  /**
   * Calculate cost (much cheaper than OpenAI!)
   */
  private calculateCost(
    text: string,
    voiceType: "neural2" | "standard" | "wavenet"
  ): number {
    const characterCount = text.length;
    const pricePerChar = GOOGLE_TTS_PRICING[voiceType];
    return characterCount * pricePerChar;
  }

  /**
   * Get voice configuration from options
   */
  private getVoiceConfig(options?: TTSOptions) {
    const voiceName = options?.voice || "en-US-Neural2-J";
    const gender = options?.gender || "MALE";
    const format = options?.format || "mp3";

    // Determine voice type from name
    let type: "neural2" | "standard" | "wavenet" = "standard";
    if (voiceName.includes("Neural2")) {
      type = "neural2";
    } else if (voiceName.includes("Wavenet")) {
      type = "wavenet";
    }

    return {
      format,
      gender: gender as "FEMALE" | "MALE" | "NEUTRAL",
      languageCode: "en-US",
      name: voiceName,
      type,
    };
  }

  /**
   * Track cost for analytics
   */
  private trackCost(tracking: CostTracking): void {
    this.costTracker.push(tracking);
  }

  /**
   * Validate TTS request
   */
  private validateRequest(request: TTSRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new InvalidInputError("tts", "No text provided");
    }

    if (request.text.length > 5000) {
      throw new InvalidInputError(
        "tts",
        "Text too long (max 5000 characters for Google TTS)"
      );
    }
  }
}
