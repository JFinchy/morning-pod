import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { type NewScrapedContent, scrapedContent } from "@/lib/db/schema";

import { HackerNewsScraper } from "./hackernews-scraper";
import { MorningBrewScraper } from "./morningbrew-scraper";
import { TLDRScraper } from "./tldr-scraper";
import { RssScraper } from "./rss-scraper";
import {
  type BaseScraper,
  type ScrapedContent,
  type ScrapingMetrics,
  type ScrapingResult,
} from "./types";

export interface ScraperManagerConfig {
  contentRetentionDays: number;
  deduplicationEnabled: boolean;
  enabledSources: string[];
  maxConcurrentScrapers: number;
  persistToDatabase: boolean;
}

export interface AggregatedScrapingResult {
  aggregatedAt: Date;
  content: ScrapedContent[];
  duplicatesRemoved: number;
  metrics: Record<string, ScrapingMetrics>;
  sourceResults: Record<string, ScrapingResult>;
  success: boolean;
  totalItems: number;
  uniqueItems: number;
}

export class ScraperManager {
  private config: ScraperManagerConfig;
  private contentCache: Map<string, ScrapedContent>;
  private scrapers: Map<string, BaseScraper>;

  constructor(config: Partial<ScraperManagerConfig> = {}) {
    this.config = {
      contentRetentionDays: 7,
      deduplicationEnabled: true,
      enabledSources: ["tldr", "hackernews", "morningbrew"],
      maxConcurrentScrapers: 3,
      persistToDatabase: true,
      ...config,
    };

    this.scrapers = new Map();
    this.contentCache = new Map();
    this.initializeScrapers();
  }

  // Get aggregated metrics across all scrapers
  getAggregatedMetrics(): Record<string, ScrapingMetrics> {
    const metrics: Record<string, ScrapingMetrics> = {};

    for (const [source, scraper] of this.scrapers.entries()) {
      metrics[source] = scraper.getMetrics();
    }

    return metrics;
  }

  // Get available scrapers
  getAvailableScrapers(): string[] {
    return [...this.scrapers.keys()];
  }

  // Get all cached content
  getCachedContent(): ScrapedContent[] {
    return [...this.contentCache.values()];
  }

  // Get content by source
  getContentBySource(source: string): ScrapedContent[] {
    return [...this.contentCache.values()].filter((item) =>
      item.source.toLowerCase().includes(source.toLowerCase())
    );
  }

  // Check if a source is enabled
  isSourceEnabled(source: string): boolean {
    return this.scrapers.has(source);
  }

  async scrapeAll(): Promise<AggregatedScrapingResult> {
    const sourceResults: Record<string, ScrapingResult> = {};
    const metrics: Record<string, ScrapingMetrics> = {};
    const allContent: ScrapedContent[] = [];

    try {
      // Run scrapers concurrently with limit
      const scraperEntries = [...this.scrapers.entries()];
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
              error: error instanceof Error ? error.message : "Unknown error",
              metadata: {
                itemsFound: 0,
                processingTime: 0,
                scrapedAt: new Date(),
                source,
              },
              success: false,
            };
          }
        });

        await Promise.all(promises);
      }

      // Deduplicate content if enabled
      const { duplicatesCount, uniqueContent } = this.config
        .deduplicationEnabled
        ? this.deduplicateContent(allContent)
        : { duplicatesCount: 0, uniqueContent: allContent };

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
        aggregatedAt: new Date(),
        content: uniqueContent,
        duplicatesRemoved: duplicatesCount,
        metrics,
        sourceResults,
        success: true,
        totalItems: allContent.length,
        uniqueItems: uniqueContent.length,
      };
    } catch {
      return {
        aggregatedAt: new Date(),
        content: [],
        duplicatesRemoved: 0,
        metrics,
        sourceResults,
        success: false,
        totalItems: 0,
        uniqueItems: 0,
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

  // Update configuration
  updateConfig(newConfig: Partial<ScraperManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Re-initialize scrapers if enabled sources changed
    if (newConfig.enabledSources) {
      this.scrapers.clear();
      this.initializeScrapers();
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private deduplicateContent(content: ScrapedContent[]): {
    duplicatesCount: number;
    uniqueContent: ScrapedContent[];
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

    return { duplicatesCount, uniqueContent };
  }

  private initializeScrapers(): void {
    // Initialize available scrapers
    const availableScrapers: Record<string, BaseScraper> = {
      hackernews: new RssScraper({
        baseUrl: "https://news.ycombinator.com",
        category: "technology",
        name: "Hacker News",
        sourceId: "hacker-news",
        rateLimit: 10,
        retries: 3,
        selectors: {},
        timeout: 10000,
        feedUrl: "https://news.ycombinator.com/rss",
      }),
      morningbrew: new RssScraper({
        baseUrl: "https://morningbrew.com",
        category: "business",
        name: "Morning Brew",
        sourceId: "morning-brew",
        rateLimit: 10,
        retries: 3,
        selectors: {},
        timeout: 10000,
        feedUrl: "https://www.morningbrew.com/feed.xml",
      }),
      tldr: new RssScraper({
        baseUrl: "https://tldr.tech",
        category: "technology",
        name: "TLDR Tech",
        sourceId: "tldr",
        rateLimit: 10,
        retries: 3,
        selectors: {},
        timeout: 10000,
        feedUrl: "https://tldr.tech/api/rss/tech",
      }),
    };

    // Only enable configured sources
    for (const source of this.config.enabledSources) {
      if (availableScrapers[source]) {
        this.scrapers.set(source, availableScrapers[source]);
      }
    }
  }

  // Save content to database
  private async saveContentToDatabase(
    content: ScrapedContent[]
  ): Promise<void> {
    const contentToSave: NewScrapedContent[] = [];

    for (const item of content) {
      // Check if content already exists by hash
      const existing = await db
        .select({
          id: scrapedContent.id,
          contentHash: scrapedContent.contentHash,
        })
        .from(scrapedContent)
        .where(eq(scrapedContent.contentHash, item.contentHash))
        .limit(1);

      if (existing.length === 0) {
        console.log(
          `ScraperManager: New content detected: "${item.title.slice(0, 30)}..." hash=${item.contentHash.slice(0, 10)}`
        );
        // Content doesn't exist, prepare for insertion
        contentToSave.push({
          category: item.category,
          content: item.content,
          contentHash: item.contentHash,
          processingMetrics: JSON.stringify({
            category: item.category,
            scrapedAt: new Date(),
            source: item.source,
          }),
          publishedAt: item.publishedAt,
          source: item.source,
          sourceId: item.sourceId,
          status: "raw",
          summary: item.summary,
          tags: item.tags ? JSON.stringify(item.tags) : null,
          title: item.title,
          url: item.url,
        });
      } else {
        console.log(
          `ScraperManager: Duplicate skipped: "${item.title.slice(0, 30)}..." hash=${item.contentHash.slice(0, 10)} matches ID=${existing[0].id}`
        );
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
}
