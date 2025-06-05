// Scraping service types and interfaces

export interface ScrapedContent {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  publishedAt: Date;
  source: string;
  category: string;
  tags: string[];
  contentHash: string;
}

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  category: string;
  rateLimit: number; // requests per minute
  timeout: number; // milliseconds
  retries: number;
  selectors?: {
    title?: string;
    content?: string;
    summary?: string;
    date?: string;
    url?: string;
  };
}

export interface ScrapingResult {
  success: boolean;
  content?: ScrapedContent[];
  error?: string;
  metadata: {
    scrapedAt: Date;
    source: string;
    itemsFound: number;
    processingTime: number;
  };
}

export interface ScrapingMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastScrapeTime: Date;
  itemsScraped: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected metrics: ScrapingMetrics;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastScrapeTime: new Date(),
      itemsScraped: 0,
    };
  }

  abstract scrape(): Promise<ScrapingResult>;

  abstract validateContent(content: any): boolean;

  abstract transformContent(rawContent: any): ScrapedContent[];

  // Rate limiting helper
  protected async rateLimit(): Promise<void> {
    const delayMs = (60 * 1000) / this.config.rateLimit;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // Content hash generation
  protected generateContentHash(content: string): string {
    return Buffer.from(content).toString("base64").substring(0, 16);
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

  // Get current metrics
  getMetrics(): ScrapingMetrics {
    return { ...this.metrics };
  }
}
