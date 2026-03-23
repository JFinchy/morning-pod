import textToSpeech, { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { BlobStorageService } from "../storage/blob";
import {
  AIServiceError,
  type CostTracking,
  InvalidInputError,
  type TTSOptions,
  type TTSRequest,
  type TTSResult,
} from "./types";

const TTS_CONFIG = {
  format: "MP3" as const,
  maxTextLength: 4900, // Google TTS limit is 5000 chars per synthesized request
  defaultVoice: "en-US-Journey-F",
} as const;

export const VOICES = {
  // Backwards compatibility for OpenAI voices
  alloy: "Neutral (Mapped to Journey Female)",
  echo: "Male (Mapped to Journey Male)",
  fable: "British (Mapped to News British Male)",
  nova: "Female (Mapped to Journey Female)",
  onyx: "Deep Male (Mapped to Journey Male)",
  shimmer: "Female (Mapped to Journey Female)",
  // Google Cloud Voices
  "en-US-Journey-D": "Journey Male",
  "en-US-Journey-F": "Journey Female",
  "en-US-Studio-O": "Studio Female",
  "en-US-Studio-M": "Studio Male",
} as const;

export type VoiceOption = keyof typeof VOICES;

// Maps OpenAI voice names to equivalent high-quality Google Cloud voices
const GOOGLE_VOICE_MAP: Record<string, { languageCode: string; name: string }> =
  {
    alloy: { languageCode: "en-US", name: "en-US-Journey-F" },
    echo: { languageCode: "en-US", name: "en-US-Journey-D" },
    fable: { languageCode: "en-GB", name: "en-GB-News-J" },
    nova: { languageCode: "en-US", name: "en-US-Journey-F" },
    onyx: { languageCode: "en-US", name: "en-US-Journey-D" },
    shimmer: { languageCode: "en-US", name: "en-US-Journey-F" },
  };

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

export class TTSService {
  private costTracker: CostTracking[] = [];
  private client: TextToSpeechClient;
  private storage: BlobStorageService;

  constructor(apiKey?: string) {
    // Note: apiKey is ignored here. We rely on Google Application Default Credentials
    // via GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CLOUD_PROJECT_ID in .env
    this.client = new TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    this.storage = new BlobStorageService();
  }

  static getConfig() {
    return TTS_CONFIG;
  }

  static getVoices() {
    return VOICES;
  }

  static getPricing() {
    return {
      "tts-1": 0.000016, // Approx mapping
      "tts-1-hd": 0.000016, // Approx mapping for Journey/Studio
    };
  }

  clearCostTracking(): void {
    this.costTracker = [];
  }

  async generateLongAudio(
    text: string,
    voice: VoiceOption | string = "alloy",
    model: string = "tts-1"
  ): Promise<TTSResult> {
    if (text.length <= TTS_CONFIG.maxTextLength) {
      return this.generateSpeech({
        options: { model: model as any, voice },
        text,
      });
    }

    const chunks = this.splitTextIntoChunks(text, TTS_CONFIG.maxTextLength);

    if (chunks.length > 20) {
      throw new TTSError("Text too long even after splitting", "TEXT_TOO_LONG");
    }

    const audioResults: TTSResult[] = [];
    let totalCost = 0;
    let totalDuration = 0;
    let totalFileSize = 0;

    for (const [i, chunk] of chunks.entries()) {
      const result = await this.generateSpeech({
        options: { model: model as any, voice },
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

    // Google Cloud doesn't provide concat out of box here easily without FFMPEG
    // In a real app we'd combine buffers. For MVP we return the first buffer/url
    // or concatenate the plain MP3 buffers. MP3 buffers can usually be concatenated natively.
    const combinedBuffer = Buffer.concat(
      audioResults.map((r) => r.audioBuffer as Buffer)
    );

    // Upload combined buffer
    const uploadResult = await this.storage.uploadAudio(
      combinedBuffer,
      `gen-long-${Date.now()}`,
      { contentType: "audio/mpeg" }
    );

    return {
      audioBuffer: combinedBuffer,
      audioUrl: uploadResult.success
        ? uploadResult.url
        : audioResults[0].audioUrl,
      cost: totalCost,
      duration: totalDuration,
      fileSize: totalFileSize,
      metadata: {
        charactersProcessed: text.length,
        model,
        processingTime: Date.now(),
        voice: voice as string,
      },
      success: true,
    };
  }

  async generateSpeech(request: TTSRequest): Promise<TTSResult> {
    const startTime = Date.now();

    try {
      this.validateRequest(request);

      let voiceName = request.options?.voice || "alloy";
      let languageCode = "en-US";

      // Map OpenAI voice names to Google Cloud voices
      if (GOOGLE_VOICE_MAP[voiceName]) {
        languageCode = GOOGLE_VOICE_MAP[voiceName].languageCode;
        voiceName = GOOGLE_VOICE_MAP[voiceName].name;
      } else if (voiceName.startsWith("en-GB")) {
        languageCode = "en-GB";
      } else if (voiceName.startsWith("en-AU")) {
        languageCode = "en-AU";
      }

      const gcpRequest = {
        input: { text: request.text },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding: "MP3" as const },
      };

      const [response] = await this.client.synthesizeSpeech(gcpRequest);

      if (!response.audioContent) {
        throw new TTSError(
          "No audio content returned from Google Cloud TTS",
          "API_ERROR"
        );
      }

      const audioBuffer = Buffer.from(response.audioContent);

      const uploadResult = await this.storage.uploadAudio(
        audioBuffer,
        `gen-${Date.now()}`,
        {
          contentType: "audio/mpeg",
        }
      );

      if (!uploadResult.success) {
        throw new TTSError(
          uploadResult.error || "Failed to upload audio to storage",
          "STORAGE_ERROR"
        );
      }

      const cost = this.calculateCost(request.text, voiceName);
      const wordCount = request.text.split(/\s+/u).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60);

      this.trackCost({
        charactersProcessed: request.text.length,
        cost,
        model: voiceName.includes("Journey") ? "journey" : "studio",
        requestId: `tts-${Date.now()}`,
        service: "google-tts",
        timestamp: new Date(),
      });

      return {
        audioBuffer,
        audioUrl: uploadResult.url || undefined,
        cost,
        duration: estimatedDuration,
        fileSize: audioBuffer.length,
        metadata: {
          charactersProcessed: request.text.length,
          model: "google-tts",
          processingTime: Date.now() - startTime,
          voice: request.options?.voice || "alloy",
        },
        success: true,
      };
    } catch (error) {
      console.error("TTS error:", error);

      return {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during TTS generation",
        metadata: {
          charactersProcessed: request.text.length,
          model: "google-tts",
          processingTime: Date.now() - startTime,
          voice: request.options?.voice || "alloy",
        },
        success: false,
      };
    }
  }

  getAvailableModels(): string[] {
    return ["tts-1", "tts-1-hd", "journey", "studio"];
  }

  getAvailableVoices(): string[] {
    return Object.keys(VOICES);
  }

  getCostTracking(): CostTracking[] {
    return [...this.costTracker];
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.listVoices({ languageCode: "en-US" });
      return true;
    } catch (error) {
      console.error("Google Cloud TTS Connection Error:", error);
      return false;
    }
  }

  private calculateCost(text: string, voiceName: string): number {
    // Pricing typically $0.000016 per char for Studio/Journey
    const pricePerChar =
      voiceName.includes("Journey") || voiceName.includes("Studio")
        ? 0.000016
        : 0.000004;
    return Math.round(text.length * pricePerChar * 10000) / 10000;
  }

  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";

    const sentences = text.split(/(?<=[!.?])\s+/u);

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          chunks.push(sentence.slice(0, maxLength));
          currentChunk = sentence.slice(maxLength);
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
    if (this.costTracker.length > 100) {
      this.costTracker = this.costTracker.slice(-100);
    }
  }

  private validateRequest(request: TTSRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new InvalidInputError("tts", "Text is required");
    }

    if (request.text.length > 100000) {
      throw new InvalidInputError("tts", "Text too long (max 100k characters)");
    }
  }
}

export function createTTSService(apiKey?: string): TTSService {
  return new TTSService(apiKey);
}
