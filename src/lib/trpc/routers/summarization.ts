// tRPC router for AI summarization service
import { z } from "zod";

import { summarizationService } from "../../services/ai/summarization-service";
import type {
  SummarizationRequest,
  SummarizationHistory,
} from "../../services/ai/types";
import { createTRPCRouter, publicProcedure } from "../server";

export const summarizationRouter = createTRPCRouter({
  // Summarize content
  summarizeContent: publicProcedure
    .input(
      z.object({
        content: z.string().min(1, "Content is required"),
        source: z.string().min(1, "Source is required"),
        title: z.string().optional(),
        url: z.string().url().optional(),
        contentType: z
          .enum(["news", "tech", "business", "general"])
          .default("general"),
        summaryStyle: z
          .enum(["brief", "detailed", "conversational"])
          .default("conversational"),
        targetLength: z.enum(["short", "medium", "long"]).default("medium"),
        includeKeyPoints: z.boolean().default(false),
        includeTakeaways: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const request: SummarizationRequest = {
          content: input.content,
          source: input.source,
          title: input.title,
          url: input.url,
          contentType: input.contentType,
          summaryStyle: input.summaryStyle,
          targetLength: input.targetLength,
          includeKeyPoints: input.includeKeyPoints,
          includeTakeaways: input.includeTakeaways,
        };

        const result = await summarizationService.summarize(request);

        return {
          success: true,
          data: result,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Summarization failed",
          code: error.code || "UNKNOWN",
        };
      }
    }),

  // Get summarization metrics
  getMetrics: publicProcedure.query(async () => {
    try {
      const metrics = summarizationService.getMetrics();
      return {
        success: true,
        metrics,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get metrics",
      };
    }
  }),

  // Get summarization history
  getHistory: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const fullHistory = summarizationService.getHistory();
        const slicedHistory = fullHistory
          .slice(input.offset, input.offset + input.limit)
          .map((entry: SummarizationHistory) => ({
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
          error: error.message || "Failed to get history",
        };
      }
    }),

  // Test configuration
  testConfiguration: publicProcedure.mutation(async () => {
    try {
      const result = await summarizationService.testConfiguration();
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Configuration test failed",
      };
    }
  }),

  // Update configuration
  updateConfig: publicProcedure
    .input(
      z.object({
        provider: z.enum(["openai", "claude", "local"]).optional(),
        model: z.string().optional(),
        maxTokens: z.number().min(100).max(4000).optional(),
        temperature: z.number().min(0).max(2).optional(),
        qualityThresholds: z
          .object({
            minCoherence: z.number().min(0).max(1).optional(),
            minRelevance: z.number().min(0).max(1).optional(),
            minReadability: z.number().min(0).max(1).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Filter out undefined values from qualityThresholds
        const updateData: any = { ...input };
        if (input.qualityThresholds) {
          updateData.qualityThresholds = Object.fromEntries(
            Object.entries(input.qualityThresholds).filter(
              ([_, value]) => value !== undefined
            )
          );
        }

        summarizationService.updateConfig(updateData);
        return {
          success: true,
          message: "Configuration updated successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to update configuration",
        };
      }
    }),

  // Get current configuration
  getConfig: publicProcedure.query(async () => {
    try {
      const config = summarizationService.getConfig();
      return {
        success: true,
        config: {
          provider: config.provider,
          model: config.model,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
          qualityThresholds: config.qualityThresholds,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get configuration",
      };
    }
  }),

  // Summarize scraped content (integration with scraping service)
  summarizeScrapedContent: publicProcedure
    .input(
      z.object({
        contentId: z.string(),
        options: z
          .object({
            summaryStyle: z
              .enum(["brief", "detailed", "conversational"])
              .default("conversational"),
            targetLength: z.enum(["short", "medium", "long"]).default("medium"),
            includeKeyPoints: z.boolean().default(true),
            includeTakeaways: z.boolean().default(true),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // This would integrate with the scraping service to get content
        // For now, return a placeholder response
        return {
          success: false,
          error: "Integration with scraping service not yet implemented",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || "Failed to summarize scraped content",
        };
      }
    }),
});
