// Scraping service types and interfaces

export interface ScrapedContent {
  category: string;
  content: string;
  contentHash: string;
  id: string;
  publishedAt: Date;
  source: string;
  summary: string;
  tags: string[];
  title: string;
  url: string;
}

export interface ScraperConfig {
  baseUrl: string;
  category: string;
  name: string;
  rateLimit: number; // requests per minute
  retries: number;
  selectors?: {
    content?: string;
    date?: string;
    summary?: string;
    title?: string;
    url?: string;
  };
  timeout: number; // milliseconds
}

export interface ScrapingResult {
  content?: ScrapedContent[];
  error?: string;
  metadata: {
    itemsFound: number;
    processingTime: number;
    scrapedAt: Date;
    source: string;
  };
  success: boolean;
}

export interface ScrapingMetrics {
  averageResponseTime: number;
  failedRequests: number;
  itemsScraped: number;
  lastScrapeTime: Date;
  successfulRequests: number;
  totalRequests: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected metrics: ScrapingMetrics;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.metrics = {
      averageResponseTime: 0,
      failedRequests: 0,
      itemsScraped: 0,
      lastScrapeTime: new Date(),
      successfulRequests: 0,
      totalRequests: 0,
    };
  }

  // Get current metrics
  getMetrics(): ScrapingMetrics {
    return { ...this.metrics };
  }

  abstract scrape(): Promise<ScrapingResult>;

  abstract transformContent(rawContent: unknown): ScrapedContent[];

  abstract validateContent(content: unknown): boolean;

  // Content hash generation
  protected generateContentHash(content: string): string {
    return Buffer.from(content).toString("base64").slice(0, 16);
  }

  // Rate limiting helper
  protected async rateLimit(): Promise<void> {
    const delayMs = (60 * 1000) / this.config.rateLimit;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // Metrics tracking
  protected updateMetrics(
    success: boolean,
    responseTime: number,
    itemCount: number = 0
  ): void {
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.itemsScraped += itemCount;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    const total = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (total - 1) + responseTime) / total;

    this.metrics.lastScrapeTime = new Date();
  }
}
