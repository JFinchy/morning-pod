// tRPC router for Text-to-Speech service
import { z } from "zod";

import { ttsService } from "../../services/ai/tts-service";
import { type TTSHistory, type TTSRequest } from "../../services/ai/tts-types";
import { createTRPCRouter, publicProcedure } from "../server";

export const ttsRouter = createTRPCRouter({
  // Clear TTS cache
  clearCache: publicProcedure.mutation(async () => {
    try {
      await ttsService.clearCache();
      return {
        message: "TTS cache cleared successfully",
        success: true,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to clear TTS cache",
        success: false,
      };
    }
  }),

  // Generate audio from text
  generateAudio: publicProcedure
    .input(
      z.object({
        format: z.enum(["mp3", "wav", "flac", "opus"]).optional(),
        metadata: z
          .object({
            contentHash: z.string().optional(),
            episodeId: z.string().optional(),
            source: z.string().optional(),
            title: z.string().optional(),
          })
          .optional(),
        pitch: z.number().min(-20).max(20).optional(),
        provider: z
          .enum(["openai", "google", "elevenlabs", "local"])
          .optional(),
        quality: z.enum(["low", "medium", "high", "hd"]).optional(),
        speed: z.number().min(0.25).max(4.0).optional(),
        text: z
          .string()
          .min(1, "Text is required")
          .max(4096, "Text too long (max 4,096 characters)"),
        voice: z.enum([
          "alloy",
          "echo",
          "fable",
          "onyx",
          "nova",
          "shimmer",
          "en-US-Wavenet-A",
          "en-US-Wavenet-B",
          "en-US-Wavenet-C",
          "rachel",
          "domi",
          "bella",
          "antoni",
        ]),
        volume: z.number().min(0.0).max(1.0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const request: TTSRequest = {
          format: input.format as any,
          metadata: input.metadata,
          pitch: input.pitch,
          provider: input.provider as any,
          quality: input.quality as any,
          speed: input.speed,
          text: input.text,
          voice: input.voice as any,
          volume: input.volume,
        };

        const result = await ttsService.generateAudio(request);

        return {
          data: result,
          success: true,
        };
      } catch (error) {
        return {
          code: (error as { code?: string }).code || "UNKNOWN",
          error:
            error instanceof Error ? error.message : "TTS generation failed",
          retryable: (error as { retryable?: boolean }).retryable || false,
          success: false,
        };
      }
    }),

  // Generate audio from summarized content (integration endpoint)
  generateFromSummary: publicProcedure
    .input(
      z.object({
        format: z.enum(["mp3", "wav", "flac", "opus"]).default("mp3"),
        metadata: z
          .object({
            episodeId: z.string().optional(),
            source: z.string().optional(),
            title: z.string().optional(),
          })
          .optional(),
        quality: z.enum(["low", "medium", "high", "hd"]).default("medium"),
        speed: z.number().min(0.25).max(4.0).default(1.0),
        summaryText: z.string().min(1, "Summary text is required"),
        ttsOptimizedText: z.string().optional(),
        voice: z
          .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
          .default("alloy"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use TTS-optimized text if available, otherwise use regular summary
        const textToConvert = input.ttsOptimizedText || input.summaryText;

        const request: TTSRequest = {
          format: input.format as any,
          metadata: input.metadata,
          provider: "openai", // Default to OpenAI for now
          quality: input.quality as any,
          speed: input.speed,
          text: textToConvert,
          voice: input.voice as any,
        };

        const result = await ttsService.generateAudio(request);

        return {
          data: result,
          success: true,
        };
      } catch (error: any) {
        return {
          code: error.code || "UNKNOWN",
          error: error.message || "Failed to generate audio from summary",
          retryable: error.retryable || false,
          success: false,
        };
      }
    }),

  // Get cache statistics
  getCacheStats: publicProcedure.query(async () => {
    try {
      const stats = ttsService.getCacheStats();
      return {
        cache: {
          entries: stats.entries.slice(0, 10).map((entry) => ({
            ...entry,
            metadata: {
              ...entry.metadata,
              createdAt: entry.metadata.createdAt.toISOString(),
              lastAccessed: entry.metadata.lastAccessed.toISOString(),
            },
          })),
          size: stats.size,
          totalSize: stats.totalSize,
        },
        success: true,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get cache statistics",
        success: false,
      };
    }
  }),

  // Get current TTS configuration
  getConfig: publicProcedure.query(async () => {
    try {
      const config = ttsService.getConfig();
      return {
        config: {
          cacheExpirationDays: config.cacheExpirationDays,
          costLimits: config.costLimits,
          defaultFormat: config.defaultFormat,
          defaultQuality: config.defaultQuality,
          defaultSpeed: config.defaultSpeed,
          defaultVoice: config.defaultVoice,
          enableCaching: config.enableCaching,
          provider: config.provider,
        },
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.message || "Failed to get TTS configuration",
        success: false,
      };
    }
  }),

  // Get TTS history
  getHistory: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const fullHistory = ttsService.getHistory();
        const slicedHistory = fullHistory
          .slice(input.offset, input.offset + input.limit)
          .map((entry: TTSHistory) => ({
            ...entry,
            // Convert dates to strings for JSON serialization
            timestamp: entry.timestamp.toISOString(),
          }));

        return {
          history: slicedHistory,
          success: true,
          total: fullHistory.length,
        };
      } catch (error: any) {
        return {
          error: error.message || "Failed to get TTS history",
          success: false,
        };
      }
    }),

  // Get TTS metrics
  getMetrics: publicProcedure.query(async () => {
    try {
      const metrics = ttsService.getMetrics();
      return {
        metrics,
        success: true,
      };
    } catch (error: any) {
      return {
        error: error.message || "Failed to get TTS metrics",
        success: false,
      };
    }
  }),

  // Get supported voices
  getSupportedVoices: publicProcedure.query(async () => {
    try {
      const voices = ttsService.getSupportedVoices();
      return {
        success: true,
        voices,
      };
    } catch (error: any) {
      return {
        error: error.message || "Failed to get supported voices",
        success: false,
      };
    }
  }),

  // Test TTS configuration
  testConfiguration: publicProcedure.mutation(async () => {
    try {
      const result = await ttsService.testConfiguration();
      return {
        error: result.error,
        success: result.success,
      };
    } catch (error: any) {
      return {
        error: error.message || "TTS configuration test failed",
        success: false,
      };
    }
  }),

  // Update TTS configuration
  updateConfig: publicProcedure
    .input(
      z.object({
        cacheExpirationDays: z.number().min(1).max(365).optional(),
        costLimits: z
          .object({
            dailyLimit: z.number().min(0).optional(),
            monthlyLimit: z.number().min(0).optional(),
            perRequestLimit: z.number().min(0).optional(),
          })
          .optional(),
        defaultFormat: z.enum(["mp3", "wav", "flac", "opus"]).optional(),
        defaultQuality: z.enum(["low", "medium", "high", "hd"]).optional(),
        defaultSpeed: z.number().min(0.25).max(4.0).optional(),
        defaultVoice: z
          .enum([
            "alloy",
            "echo",
            "fable",
            "onyx",
            "nova",
            "shimmer",
            "en-US-Wavenet-A",
            "en-US-Wavenet-B",
            "en-US-Wavenet-C",
            "rachel",
            "domi",
            "bella",
            "antoni",
          ])
          .optional(),
        enableCaching: z.boolean().optional(),
        provider: z
          .enum(["openai", "google", "elevenlabs", "local"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Filter out undefined values
        const updateData: any = Object.fromEntries(
          Object.entries(input).filter(([_, value]) => value !== undefined)
        );

        ttsService.updateConfig(updateData);
        return {
          message: "TTS configuration updated successfully",
          success: true,
        };
      } catch (error: any) {
        return {
          error: error.message || "Failed to update TTS configuration",
          success: false,
        };
      }
    }),
});
