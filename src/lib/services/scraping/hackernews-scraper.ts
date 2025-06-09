import {
  BaseScraper,
  type ScrapedContent,
  type ScraperConfig,
  type ScrapingResult,
} from "./types";

// Type for raw Hacker News content before validation
interface RawHackerNewsContent {
  comments?: unknown;
  content?: unknown;
  id?: unknown;
  points?: unknown;
  publishedAt?: unknown;
  summary?: unknown;
  title?: unknown;
  url?: unknown;
}

// Type for validated Hacker News content
interface ValidatedHackerNewsContent {
  comments?: number;
  content?: string;
  id?: number | string;
  points?: number;
  publishedAt?: Date;
  summary?: string;
  title: string;
  url?: string;
}

export class HackerNewsScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      baseUrl: "https://news.ycombinator.com",
      category: "technology",
      name: "Hacker News",
      rateLimit: 30, // HN allows more frequent requests
      retries: 2,
      selectors: {
        content: ".comment-tree, .toptext",
        date: ".age",
        summary: ".toptext",
        title: ".titleline a",
        url: ".titleline a",
      },
      timeout: 8000,
    };
    super(config);
  }

  async scrape(): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      await this.rateLimit();

      // Mock data simulating top Hacker News stories
      const mockContent = this.generateMockHNContent();

      const processingTime = Date.now() - startTime;
      this.updateMetrics(true, processingTime, mockContent.length);

      return {
        content: mockContent,
        metadata: {
          itemsFound: mockContent.length,
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

  transformContent(rawContent: unknown): ScrapedContent[] {
    const contentArray = Array.isArray(rawContent) ? rawContent : [rawContent];

    return contentArray
      .filter((item: unknown): item is ValidatedHackerNewsContent =>
        this.validateContent(item)
      )
      .map((item: ValidatedHackerNewsContent, index: number) => ({
        category: this.config.category,
        content: String(
          item.content || item.summary || `Discussion about: ${item.title}`
        ),
        contentHash: this.generateContentHash(
          String(item.title) + String(item.summary || "")
        ),
        id: `hn-${Date.now()}-${index}`,
        publishedAt: (item.publishedAt as Date) || new Date(),
        source: this.config.name,
        summary: this.generateSummary(item),
        tags: this.extractHNTags(
          String(item.title),
          String(item.content || "")
        ),
        title: String(item.title).trim(),
        url: String(
          item.url || `${this.config.baseUrl}/item?id=${item.id || index}`
        ),
      }));
  }

  validateContent(content: unknown): content is ValidatedHackerNewsContent {
    if (content === null || typeof content !== "object") {
      return false;
    }
    const item = content as RawHackerNewsContent;
    return (
      "title" in item &&
      typeof item.title === "string" &&
      item.title.length > 5 &&
      (item.points !== undefined || item.comments !== undefined) // HN stories have points or comments
    );
  }

  private extractHNTags(title: string, content?: string): string[] {
    const text = `${title} ${content || ""}`.toLowerCase();
    const techTerms = [
      "rust",
      "javascript",
      "python",
      "golang",
      "typescript",
      "react",
      "vue",
      "database",
      "postgresql",
      "mysql",
      "mongodb",
      "redis",
      "docker",
      "kubernetes",
      "aws",
      "gcp",
      "azure",
      "machine learning",
      "ai",
      "blockchain",
      "crypto",
      "startup",
      "ipo",
      "funding",
      "open source",
      "github",
      "security",
      "privacy",
    ];

    return techTerms.filter((term) => text.includes(term)).slice(0, 4);
  }

  private generateMockHNContent(): ScrapedContent[] {
    const mockStories = [
      {
        comments: 89,
        content:
          "After being frustrated with existing collaborative coding tools, I decided to build my own using Rust for the backend and WebAssembly for the frontend. The project uses operational transforms for conflict resolution and WebRTC for peer-to-peer communication. Performance has been impressive with sub-10ms latency for most operations.",
        points: 342,
        publishedAt: new Date(),
        summary:
          "I spent the last 6 months building a collaborative code editor using Rust and WebAssembly. It supports real-time editing, syntax highlighting, and peer-to-peer synchronization.",
        title: "Show HN: Built a real-time collaborative code editor in Rust",
        url: "https://news.ycombinator.com/item?id=12345",
      },
      {
        comments: 45,
        content:
          "The space agency has made available the most comprehensive dataset of exoplanet observations to date. The release includes spectroscopic data from thousands of planetary systems, enabling researchers to study atmospheric compositions, orbital mechanics, and potentially habitable worlds. The dataset is being made freely available to the scientific community.",
        points: 198,
        publishedAt: new Date(),
        summary:
          "NASA's Kepler Space Telescope data archive now contains observations of over 5,000 confirmed exoplanets, including detailed atmospheric composition data.",
        title: "NASA releases largest dataset of exoplanet observations",
        url: "https://news.ycombinator.com/item?id=12346",
      },
      {
        comments: 73,
        content:
          "PostgreSQL 16 brings major improvements to parallel query processing, with new algorithms for join operations and aggregate functions. Benchmarks show up to 3x performance improvements for analytical workloads. The release also includes better memory management and improved query planning for large datasets.",
        points: 267,
        publishedAt: new Date(),
        summary:
          "The latest PostgreSQL release features significant performance improvements for complex queries through enhanced parallel execution strategies.",
        title: "PostgreSQL 16 introduces parallel query execution improvements",
        url: "https://news.ycombinator.com/item?id=12347",
      },
    ];

    return this.transformContent(mockStories);
  }

  private generateSummary(item: ValidatedHackerNewsContent): string {
    if (item.summary && typeof item.summary === "string") return item.summary;

    // Generate a basic summary from title and metadata
    const points = item.points ? `${item.points} points` : "";
    const comments = item.comments ? `${item.comments} comments` : "";
    const engagement = [points, comments].filter(Boolean).join(", ");

    return `${String(item.title)}${engagement ? ` (${engagement})` : ""}`;
  }
}
