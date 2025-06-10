import { z } from "zod";

import { ScraperManager } from "../../services/scraping/scraper-manager";
import { createTRPCRouter, publicProcedure } from "../server";

// Initialize the scraper manager
const scraperManager = new ScraperManager();

export const scrapingRouter = createTRPCRouter({
  // Get available scrapers
  getAvailableScrapers: publicProcedure.query(async () => {
    try {
      const scrapers = scraperManager.getAvailableScrapers();
      return {
        scrapers,
        success: true,
        totalScrapers: scrapers.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to get available scrapers: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // Get cached content
  getCachedContent: publicProcedure.query(async () => {
    try {
      const content = scraperManager.getCachedContent();
      return {
        content,
        success: true,
        totalItems: content.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to get cached content: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // Get content by source
  getContentBySource: publicProcedure
    .input(
      z.object({
        source: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const content = scraperManager.getContentBySource(input.source);
        return {
          content,
          source: input.source,
          success: true,
          totalItems: content.length,
        };
      } catch (error) {
        throw new Error(
          `Failed to get content for ${input.source}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // Get scraping metrics
  getMetrics: publicProcedure.query(async () => {
    try {
      const metrics = scraperManager.getAggregatedMetrics();
      return {
        metrics,
        sources: scraperManager.getAvailableScrapers(),
        success: true,
      };
    } catch (error) {
      throw new Error(
        `Failed to get metrics: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // Scrape all enabled sources
  scrapeAll: publicProcedure.mutation(async () => {
    try {
      return await scraperManager.scrapeAll();
    } catch (error) {
      throw new Error(
        `Failed to scrape content: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // Scrape a specific source
  scrapeSource: publicProcedure
    .input(
      z.object({
        source: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await scraperManager.scrapeSource(input.source);
      } catch (error) {
        throw new Error(
          `Failed to scrape ${input.source}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // Update scraper configuration
  updateConfig: publicProcedure
    .input(
      z.object({
        contentRetentionDays: z.number().min(1).max(30).optional(),
        deduplicationEnabled: z.boolean().optional(),
        enabledSources: z.array(z.string()).optional(),
        maxConcurrentScrapers: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        scraperManager.updateConfig(input);
        return {
          availableScrapers: scraperManager.getAvailableScrapers(),
          message: "Scraper configuration updated successfully",
          success: true,
        };
      } catch (error) {
        throw new Error(
          `Failed to update configuration: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
