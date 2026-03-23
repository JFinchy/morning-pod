import Parser from "rss-parser";
import { ScrapingService } from "./scraping-service";
import {
  BaseScraper,
  type ScrapedContent,
  type ScraperConfig,
  type ScrapingResult,
} from "./types";

export interface RssScraperConfig extends ScraperConfig {
  feedUrl: string;
}

export class RssScraper extends BaseScraper {
  private parser: Parser;
  private feedUrl: string;
  private scrapingService: ScrapingService;

  constructor(config: RssScraperConfig) {
    super(config);
    this.parser = new Parser();
    this.feedUrl = config.feedUrl;
    this.scrapingService = new ScrapingService();
  }

  async scrape(): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      await this.rateLimit();

      const feed = await this.parser.parseURL(this.feedUrl);
      const content = await this.transformContentWithFullText(feed.items);

      const processingTime = Date.now() - startTime;
      this.updateMetrics(true, processingTime, content.length);

      return {
        content,
        metadata: {
          itemsFound: content.length,
          processingTime,
          scrapedAt: new Date(),
          source: this.config.name,
        },
        success: true,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(false, processingTime);

      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          itemsFound: 0,
          processingTime,
          scrapedAt: new Date(),
          source: this.config.name,
        },
        success: false,
      };
    }
  }

  async transformContentWithFullText(
    rawContent: any[]
  ): Promise<ScrapedContent[]> {
    const transformed: ScrapedContent[] = [];

    // Process top 5 items only to avoid long scraping times and rate limits
    const itemsToProcess = rawContent.slice(0, 5);

    for (const [index, item] of itemsToProcess.entries()) {
      const title = item.title || "Untitled";
      let content = item.contentSnippet || item.content || item.summary || "";
      const url = item.link || "";

      // If content is short, try to scrape the full article
      if (content.length < 300 && url) {
        try {
          console.log(
            `RssScraper: Content short for "${title}", fetching full text from ${url}`
          );
          const fullScraped = await this.scrapingService.scrapeUrl(url);
          content = fullScraped.content;
        } catch (e) {
          console.log(
            `RssScraper: Failed to fetch full text for ${url}, using snippet`
          );
        }
      }

      transformed.push({
        category: this.config.category,
        content: content,
        contentHash: this.generateContentHash(title + content),
        id: `${this.config.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${index}`,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: this.config.name,
        sourceId: this.config.sourceId,
        summary: item.contentSnippet || content.slice(0, 200),
        tags: item.categories || [],
        title: title.trim(),
        url: url,
      });
    }

    return transformed;
  }

  // Legacy method required by BaseScraper interface
  transformContent(rawContent: any[]): ScrapedContent[] {
    // This is now handled by the async version above, but we keep it for interface compliance
    return [];
  }

  // RSS items are already structured, validation is simpler
  validateContent(content: any): content is any {
    return !!(
      content &&
      content.title &&
      (content.contentSnippet || content.content)
    );
  }
}
