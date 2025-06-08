import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { scrapedContent, type NewScrapedContent } from "@/lib/db/schema";

import { HackerNewsScraper } from "./hackernews-scraper";
import { MorningBrewScraper } from "./morningbrew-scraper";
import { TLDRScraper } from "./tldr-scraper";
import {
  BaseScraper,
  ScrapedContent,
  ScrapingResult,
  ScrapingMetrics,
} from "./types";

export interface ScraperManagerConfig {
  enabledSources: string[];
  maxConcurrentScrapers: number;
  deduplicationEnabled: boolean;
  contentRetentionDays: number;
  persistToDatabase: boolean;
}

export interface AggregatedScrapingResult {
  success: boolean;
  totalItems: number;
  uniqueItems: number;
  duplicatesRemoved: number;
  content: ScrapedContent[];
  sourceResults: Record<string, ScrapingResult>;
  metrics: Record<string, ScrapingMetrics>;
  aggregatedAt: Date;
}

export class ScraperManager {
  private scrapers: Map<string, BaseScraper>;
  private config: ScraperManagerConfig;
  private contentCache: Map<string, ScrapedContent>;

  constructor(config: Partial<ScraperManagerConfig> = {}) {
    this.config = {
      enabledSources: ["tldr", "hackernews", "morningbrew"],
      maxConcurrentScrapers: 3,
      deduplicationEnabled: true,
      contentRetentionDays: 7,
      persistToDatabase: true,
      ...config,
    };

    this.scrapers = new Map();
    this.contentCache = new Map();
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    // Initialize available scrapers
    const availableScrapers = {
      tldr: new TLDRScraper(),
      hackernews: new HackerNewsScraper(),
      morningbrew: new MorningBrewScraper(),
    };

    // Only enable configured sources
    for (const source of this.config.enabledSources) {
      if (availableScrapers[source as keyof typeof availableScrapers]) {
        this.scrapers.set(
          source,
          availableScrapers[source as keyof typeof availableScrapers]
        );
      }
    }
  }

  async scrapeAll(): Promise<AggregatedScrapingResult> {
    const sourceResults: Record<string, ScrapingResult> = {};
    const metrics: Record<string, ScrapingMetrics> = {};
    const allContent: ScrapedContent[] = [];

    try {
      // Run scrapers concurrently with limit
      const scraperEntries = Array.from(this.scrapers.entries());
      const chunks = this.chunkArray(
        scraperEntries,
        this.config.maxConcurrentScrapers
      );

      for (const chunk of chunks) {
        const promises = chunk.map(async ([source, scraper]) => {
          try {
            const result = await scraper.scrape();
            sourceResults[source] = result;
            metrics[source] = scraper.getMetrics();

            if (result.success && result.content) {
              allContent.push(...result.content);
            }
          } catch (error) {
            sourceResults[source] = {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
              metadata: {
                scrapedAt: new Date(),
                source,
                itemsFound: 0,
                processingTime: 0,
              },
            };
          }
        });

        await Promise.all(promises);
      }

      // Deduplicate content if enabled
      const { uniqueContent, duplicatesCount } = this.config
        .deduplicationEnabled
        ? this.deduplicateContent(allContent)
        : { uniqueContent: allContent, duplicatesCount: 0 };

      // Update content cache
      this.updateContentCache(uniqueContent);

      // Save to database if enabled
      if (this.config.persistToDatabase && uniqueContent.length > 0) {
        try {
          await this.saveContentToDatabase(uniqueContent);
        } catch (error) {
          console.error("Failed to save content to database:", error);
          // Continue execution - don't fail the entire scraping operation
        }
      }

      return {
        success: true,
        totalItems: allContent.length,
        uniqueItems: uniqueContent.length,
        duplicatesRemoved: duplicatesCount,
        content: uniqueContent,
        sourceResults,
        metrics,
        aggregatedAt: new Date(),
      };
    } catch {
      return {
        success: false,
        totalItems: 0,
        uniqueItems: 0,
        duplicatesRemoved: 0,
        content: [],
        sourceResults,
        metrics,
        aggregatedAt: new Date(),
      };
    }
  }

  async scrapeSource(sourceName: string): Promise<ScrapingResult> {
    const scraper = this.scrapers.get(sourceName);
    if (!scraper) {
      throw new Error(`Scraper not found for source: ${sourceName}`);
    }

    return await scraper.scrape();
  }

  private deduplicateContent(content: ScrapedContent[]): {
    uniqueContent: ScrapedContent[];
    duplicatesCount: number;
  } {
    const seen = new Set<string>();
    const uniqueContent: ScrapedContent[] = [];
    let duplicatesCount = 0;

    for (const item of content) {
      // Create a deduplication key based on title and content hash
      const dedupKey = `${item.title.toLowerCase().trim()}-${item.contentHash}`;

      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        uniqueContent.push(item);
      } else {
        duplicatesCount++;
      }
    }

    return { uniqueContent, duplicatesCount };
  }

  private updateContentCache(content: ScrapedContent[]): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.contentRetentionDays);

    // Remove old content from cache
    for (const [key, item] of this.contentCache.entries()) {
      if (item.publishedAt < cutoffDate) {
        this.contentCache.delete(key);
      }
    }

    // Add new content to cache
    for (const item of content) {
      this.contentCache.set(item.id, item);
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Get all cached content
  getCachedContent(): ScrapedContent[] {
    return Array.from(this.contentCache.values());
  }

  // Get content by source
  getContentBySource(source: string): ScrapedContent[] {
    return Array.from(this.contentCache.values()).filter((item) =>
      item.source.toLowerCase().includes(source.toLowerCase())
    );
  }

  // Get aggregated metrics across all scrapers
  getAggregatedMetrics(): Record<string, ScrapingMetrics> {
    const metrics: Record<string, ScrapingMetrics> = {};

    for (const [source, scraper] of this.scrapers.entries()) {
      metrics[source] = scraper.getMetrics();
    }

    return metrics;
  }

  // Update configuration
  updateConfig(newConfig: Partial<ScraperManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Re-initialize scrapers if enabled sources changed
    if (newConfig.enabledSources) {
      this.scrapers.clear();
      this.initializeScrapers();
    }
  }

  // Get available scrapers
  getAvailableScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }

  // Check if a source is enabled
  isSourceEnabled(source: string): boolean {
    return this.scrapers.has(source);
  }

  // Save content to database
  private async saveContentToDatabase(
    content: ScrapedContent[]
  ): Promise<void> {
    const contentToSave: NewScrapedContent[] = [];

    for (const item of content) {
      // Check if content already exists by hash
      const existing = await db
        .select({ id: scrapedContent.id })
        .from(scrapedContent)
        .where(eq(scrapedContent.contentHash, item.contentHash))
        .limit(1);

      if (existing.length === 0) {
        // Content doesn't exist, prepare for insertion
        contentToSave.push({
          title: item.title,
          summary: item.summary,
          content: item.content,
          url: item.url,
          publishedAt: item.publishedAt,
          source: item.source,
          category: item.category,
          tags: item.tags ? JSON.stringify(item.tags) : null,
          contentHash: item.contentHash,
          status: "raw",
          processingMetrics: JSON.stringify({
            scrapedAt: new Date(),
            source: item.source,
            category: item.category,
          }),
        });
      }
    }

    // Batch insert new content
    if (contentToSave.length > 0) {
      await db.insert(scrapedContent).values(contentToSave);
      console.log(
        `Saved ${contentToSave.length} new content items to database`
      );
    } else {
      console.log(
        "No new content to save - all items already exist in database"
      );
    }
  }
}
