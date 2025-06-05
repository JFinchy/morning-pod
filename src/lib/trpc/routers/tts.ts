// tRPC router for Text-to-Speech service
import { z } from "zod";

import { ttsService } from "../../services/ai/tts-service";
import type { TTSRequest, TTSHistory } from "../../services/ai/tts-types";
import { createTRPCRouter, publicProcedure } from "../server";

export const ttsRouter = createTRPCRouter({
  // Generate audio from text
  generateAudio: publicProcedure
    .input(
      z.object({
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
        provider: z
          .enum(["openai", "google", "elevenlabs", "local"])
          .optional(),
        format: z.enum(["mp3", "wav", "flac", "opus"]).optional(),
        quality: z.enum(["low", "medium", "high", "hd"]).optional(),
        speed: z.number().min(0.25).max(4.0).optional(),
        pitch: z.number().min(-20).max(20).optional(),
        volume: z.number().min(0.0).max(1.0).optional(),
        metadata: z
          .object({
            title: z.string().optional(),
            source: z.string().optional(),
            episodeId: z.string().optional(),
            contentHash: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const request: TTSRequest = {
          text: input.text,
          voice: input.voice as any,
          provider: input.provider as any,
          format: input.format as any,
          quality: input.quality as any,
          speed: input.speed,
          pitch: input.pitch,
          volume: input.volume,
          metadata: input.metadata,
        };

        const result = await ttsService.generateAudio(request);

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "TTS generation failed",
          code: error.code || "UNKNOWN",
          retryable: error.retryable || false,
        };
      }
    }),

  // Get TTS metrics
  getMetrics: publicProcedure.query(async () => {
    try {
      const metrics = ttsService.getMetrics();
      return {
        success: true,
        metrics,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get TTS metrics",
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
          success: true,
          history: slicedHistory,
          total: fullHistory.length,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to get TTS history",
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
        success: false,
        error: error.message || "Failed to get supported voices",
      };
    }
  }),

  // Test TTS configuration
  testConfiguration: publicProcedure.mutation(async () => {
    try {
      const result = await ttsService.testConfiguration();
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "TTS configuration test failed",
      };
    }
  }),

  // Update TTS configuration
  updateConfig: publicProcedure
    .input(
      z.object({
        provider: z
          .enum(["openai", "google", "elevenlabs", "local"])
          .optional(),
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
        defaultFormat: z.enum(["mp3", "wav", "flac", "opus"]).optional(),
        defaultQuality: z.enum(["low", "medium", "high", "hd"]).optional(),
        defaultSpeed: z.number().min(0.25).max(4.0).optional(),
        enableCaching: z.boolean().optional(),
        cacheExpirationDays: z.number().min(1).max(365).optional(),
        costLimits: z
          .object({
            dailyLimit: z.number().min(0).optional(),
            monthlyLimit: z.number().min(0).optional(),
            perRequestLimit: z.number().min(0).optional(),
          })
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
          success: true,
          message: "TTS configuration updated successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to update TTS configuration",
        };
      }
    }),

  // Get current TTS configuration
  getConfig: publicProcedure.query(async () => {
    try {
      const config = ttsService.getConfig();
      return {
        success: true,
        config: {
          provider: config.provider,
          defaultVoice: config.defaultVoice,
          defaultFormat: config.defaultFormat,
          defaultQuality: config.defaultQuality,
          defaultSpeed: config.defaultSpeed,
          enableCaching: config.enableCaching,
          cacheExpirationDays: config.cacheExpirationDays,
          costLimits: config.costLimits,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get TTS configuration",
      };
    }
  }),

  // Get cache statistics
  getCacheStats: publicProcedure.query(async () => {
    try {
      const stats = ttsService.getCacheStats();
      return {
        success: true,
        cache: {
          size: stats.size,
          totalSize: stats.totalSize,
          entries: stats.entries.slice(0, 10).map((entry) => ({
            ...entry,
            metadata: {
              ...entry.metadata,
              createdAt: entry.metadata.createdAt.toISOString(),
              lastAccessed: entry.metadata.lastAccessed.toISOString(),
            },
          })),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get cache statistics",
      };
    }
  }),

  // Clear TTS cache
  clearCache: publicProcedure.mutation(async () => {
    try {
      await ttsService.clearCache();
      return {
        success: true,
        message: "TTS cache cleared successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to clear TTS cache",
      };
    }
  }),

  // Generate audio from summarized content (integration endpoint)
  generateFromSummary: publicProcedure
    .input(
      z.object({
        summaryText: z.string().min(1, "Summary text is required"),
        ttsOptimizedText: z.string().optional(),
        voice: z
          .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
          .default("alloy"),
        speed: z.number().min(0.25).max(4.0).default(1.0),
        format: z.enum(["mp3", "wav", "flac", "opus"]).default("mp3"),
        quality: z.enum(["low", "medium", "high", "hd"]).default("medium"),
        metadata: z
          .object({
            title: z.string().optional(),
            source: z.string().optional(),
            episodeId: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use TTS-optimized text if available, otherwise use regular summary
        const textToConvert = input.ttsOptimizedText || input.summaryText;

        const request: TTSRequest = {
          text: textToConvert,
          voice: input.voice as any,
          provider: "openai", // Default to OpenAI for now
          format: input.format as any,
          quality: input.quality as any,
          speed: input.speed,
          metadata: input.metadata,
        };

        const result = await ttsService.generateAudio(request);

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to generate audio from summary",
          code: error.code || "UNKNOWN",
          retryable: error.retryable || false,
        };
      }
    }),
});
