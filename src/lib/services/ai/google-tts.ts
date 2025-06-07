import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { createId } from "@paralleldrive/cuid2";

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

// Google Cloud TTS pricing (as of 2024) - much cheaper than OpenAI
const GOOGLE_TTS_PRICING = {
  standard: 0.000004, // $4 per 1M characters
  wavenet: 0.000016, // $16 per 1M characters
  neural2: 0.000016, // $16 per 1M characters
} as const;

export interface ConversationalScript {
  lines: Array<{
    speaker: "HOST_A" | "HOST_B";
    text: string;
    emphasis?: "normal" | "strong" | "reduced";
    pauseAfter?: number; // milliseconds
  }>;
}

export interface GoogleTTSVoice {
  name: string;
  languageCode: string;
  gender: "MALE" | "FEMALE" | "NEUTRAL";
  type: "standard" | "wavenet" | "neural2";
  naturalness: number; // 1-10 scale
}

export class GoogleTTSService {
  private client: TextToSpeechClient;
  private costTracker: CostTracking[] = [];

  // Pre-selected voice pairs for conversational podcasts
  // Optimized for fun, uplifting tone like "Upfirst" podcast
  private readonly VOICE_PAIRS = {
    upbeat: {
      HOST_A: {
        name: "en-US-Neural2-D",
        gender: "MALE" as const,
        type: "neural2" as const,
      }, // Warm, friendly male voice
      HOST_B: {
        name: "en-US-Neural2-F",
        gender: "FEMALE" as const,
        type: "neural2" as const,
      }, // Bright, energetic female voice
    },
    professional: {
      HOST_A: {
        name: "en-US-Neural2-J",
        gender: "MALE" as const,
        type: "neural2" as const,
      },
      HOST_B: {
        name: "en-US-Neural2-H",
        gender: "FEMALE" as const,
        type: "neural2" as const,
      },
    },
    budget: {
      HOST_A: {
        name: "en-US-Standard-B",
        gender: "MALE" as const,
        type: "standard" as const,
      },
      HOST_B: {
        name: "en-US-Standard-C",
        gender: "FEMALE" as const,
        type: "standard" as const,
      },
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
      voiceStyle?: "upbeat" | "professional" | "budget";
      outputFormat?: "mp3" | "wav";
      addPauses?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    audioSegments?: Array<{
      speaker: string;
      audioBuffer: Buffer;
      duration: number;
    }>;
    totalCost?: number;
    totalDuration?: number;
    error?: string;
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
          text: ssmlText,
          options: {
            voice: voice.name,
            gender: voice.gender,
            format: options.outputFormat || "mp3",
            useSSML: true,
          },
        });

        if (audioResult.success && audioResult.audioBuffer) {
          audioSegments.push({
            speaker: line.speaker,
            audioBuffer: audioResult.audioBuffer,
            duration: audioResult.duration || 0,
          });

          totalCost += audioResult.cost || 0;
          totalDuration += audioResult.duration || 0;
        }
      }

      return {
        success: true,
        audioSegments,
        totalCost,
        totalDuration,
      };
    } catch (error) {
      console.error("Conversational audio generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
        input: { ssml: ssmlInput },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.gender,
        },
        audioConfig: {
          audioEncoding: voiceConfig.format === "wav" ? "LINEAR16" : "MP3",
          speakingRate: request.options?.speed || 1.0,
          pitch: request.options?.pitch || 0.0,
          volumeGainDb: request.options?.volume || 0.0,
        },
      });

      if (!response.audioContent) {
        throw new AIServiceError("No audio content generated", "tts");
      }

      const audioBuffer = Buffer.from(response.audioContent);

      // Calculate cost (much cheaper than OpenAI!)
      const cost = this.calculateCost(request.text, voiceConfig.type);

      // Estimate duration
      const wordCount = request.text.split(/\s+/).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60); // 150 WPM

      // Track costs
      this.trackCost({
        service: "google-tts",
        model: voiceConfig.name,
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
          model: voiceConfig.name,
          voice: voiceConfig.name,
          processingTime: Date.now() - startTime,
          charactersProcessed: request.text.length,
        },
      };
    } catch (error) {
      console.error("Google TTS error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          model: "google-tts",
          voice: "unknown",
          processingTime: Date.now() - startTime,
          charactersProcessed: request.text.length,
        },
      };
    }
  }

  /**
   * Build SSML for enhanced speech control
   */
  private buildSSML(
    text: string,
    options: {
      emphasis?: "normal" | "strong" | "reduced";
      pauseAfter?: number;
      rate?: "slow" | "medium" | "fast";
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
   * Get voice configuration from options
   */
  private getVoiceConfig(options?: TTSOptions) {
    const voiceName = options?.voice || "en-US-Neural2-J";
    const gender = options?.gender || "MALE";
    const format = options?.format || "mp3";

    // Determine voice type from name
    let type: "standard" | "wavenet" | "neural2" = "standard";
    if (voiceName.includes("Neural2")) {
      type = "neural2";
    } else if (voiceName.includes("Wavenet")) {
      type = "wavenet";
    }

    return {
      name: voiceName,
      languageCode: "en-US",
      gender: gender as "MALE" | "FEMALE" | "NEUTRAL",
      type,
      format,
    };
  }

  /**
   * Calculate cost (much cheaper than OpenAI!)
   */
  private calculateCost(
    text: string,
    voiceType: "standard" | "wavenet" | "neural2"
  ): number {
    const characterCount = text.length;
    const pricePerChar = GOOGLE_TTS_PRICING[voiceType];
    return characterCount * pricePerChar;
  }

  /**
   * Track cost for analytics
   */
  private trackCost(tracking: CostTracking): void {
    this.costTracker.push(tracking);
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(): CostTracking[] {
    return [...this.costTracker];
  }

  /**
   * Get available voice pairs for conversations
   */
  getAvailableVoicePairs() {
    return Object.keys(this.VOICE_PAIRS);
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

  /**
   * Generate conversational script from summary (integrates with your existing AI)
   */
  generateConversationalScript(summary: string): ConversationalScript {
    // This would typically use your Gemini/OpenAI service to generate the script
    // For now, here's a simple format converter
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const lines = [];

    for (let i = 0; i < sentences.length; i++) {
      const speaker = i % 2 === 0 ? "HOST_A" : "HOST_B";
      const text = sentences[i].trim();

      if (text) {
        lines.push({
          speaker: speaker as "HOST_A" | "HOST_B",
          text,
          pauseAfter: i < sentences.length - 1 ? 800 : 1500, // Pause between speakers
        });
      }
    }

    return { lines };
  }
}
