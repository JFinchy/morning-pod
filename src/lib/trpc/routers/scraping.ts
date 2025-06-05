import { z } from "zod";

import { ScraperManager } from "../../services/scraping/scraper-manager";
import { createTRPCRouter, publicProcedure } from "../server";

// Initialize the scraper manager
const scraperManager = new ScraperManager();

export const scrapingRouter = createTRPCRouter({
  // Scrape all enabled sources
  scrapeAll: publicProcedure.mutation(async () => {
    try {
      const result = await scraperManager.scrapeAll();
      return result;
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
        const result = await scraperManager.scrapeSource(input.source);
        return result;
      } catch (error) {
        throw new Error(
          `Failed to scrape ${input.source}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // Get cached content
  getCachedContent: publicProcedure.query(async () => {
    try {
      const content = scraperManager.getCachedContent();
      return {
        success: true,
        content,
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
          success: true,
          content,
          totalItems: content.length,
          source: input.source,
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
        success: true,
        metrics,
        sources: scraperManager.getAvailableScrapers(),
      };
    } catch (error) {
      throw new Error(
        `Failed to get metrics: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // Get available scrapers
  getAvailableScrapers: publicProcedure.query(async () => {
    try {
      const scrapers = scraperManager.getAvailableScrapers();
      return {
        success: true,
        scrapers,
        totalScrapers: scrapers.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to get available scrapers: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  // Update scraper configuration
  updateConfig: publicProcedure
    .input(
      z.object({
        enabledSources: z.array(z.string()).optional(),
        maxConcurrentScrapers: z.number().min(1).max(10).optional(),
        deduplicationEnabled: z.boolean().optional(),
        contentRetentionDays: z.number().min(1).max(30).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        scraperManager.updateConfig(input);
        return {
          success: true,
          message: "Scraper configuration updated successfully",
          availableScrapers: scraperManager.getAvailableScrapers(),
        };
      } catch (error) {
        throw new Error(
          `Failed to update configuration: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
