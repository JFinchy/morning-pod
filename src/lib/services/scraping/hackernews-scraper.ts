import {
  BaseScraper,
  ScraperConfig,
  ScrapingResult,
  ScrapedContent,
} from "./types";

// Type for raw Hacker News content before validation
interface RawHackerNewsContent {
  title?: unknown;
  summary?: unknown;
  content?: unknown;
  url?: unknown;
  publishedAt?: unknown;
  points?: unknown;
  comments?: unknown;
  id?: unknown;
}

// Type for validated Hacker News content
interface ValidatedHackerNewsContent {
  title: string;
  summary?: string;
  content?: string;
  url?: string;
  publishedAt?: Date;
  points?: number;
  comments?: number;
  id?: string | number;
}

export class HackerNewsScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: "Hacker News",
      baseUrl: "https://news.ycombinator.com",
      category: "technology",
      rateLimit: 30, // HN allows more frequent requests
      timeout: 8000,
      retries: 2,
      selectors: {
        title: ".titleline a",
        content: ".comment-tree, .toptext",
        summary: ".toptext",
        date: ".age",
        url: ".titleline a",
      },
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
        success: true,
        content: mockContent,
        metadata: {
          scrapedAt: new Date(),
          source: this.config.name,
          itemsFound: mockContent.length,
          processingTime,
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(false, processingTime);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          scrapedAt: new Date(),
          source: this.config.name,
          itemsFound: 0,
          processingTime,
        },
      };
    }
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

  transformContent(rawContent: unknown): ScrapedContent[] {
    const contentArray = Array.isArray(rawContent) ? rawContent : [rawContent];

    return contentArray
      .filter((item: unknown): item is ValidatedHackerNewsContent =>
        this.validateContent(item)
      )
      .map((item: ValidatedHackerNewsContent, index: number) => ({
        id: `hn-${Date.now()}-${index}`,
        title: String(item.title).trim(),
        summary: this.generateSummary(item),
        content: String(
          item.content || item.summary || `Discussion about: ${item.title}`
        ),
        url: String(
          item.url || `${this.config.baseUrl}/item?id=${item.id || index}`
        ),
        publishedAt: (item.publishedAt as Date) || new Date(),
        source: this.config.name,
        category: this.config.category,
        tags: this.extractHNTags(
          String(item.title),
          String(item.content || "")
        ),
        contentHash: this.generateContentHash(
          String(item.title) + String(item.summary || "")
        ),
      }));
  }

  private generateMockHNContent(): ScrapedContent[] {
    const mockStories = [
      {
        title: "Show HN: Built a real-time collaborative code editor in Rust",
        summary:
          "I spent the last 6 months building a collaborative code editor using Rust and WebAssembly. It supports real-time editing, syntax highlighting, and peer-to-peer synchronization.",
        content:
          "After being frustrated with existing collaborative coding tools, I decided to build my own using Rust for the backend and WebAssembly for the frontend. The project uses operational transforms for conflict resolution and WebRTC for peer-to-peer communication. Performance has been impressive with sub-10ms latency for most operations.",
        url: "https://news.ycombinator.com/item?id=12345",
        points: 342,
        comments: 89,
        publishedAt: new Date(),
      },
      {
        title: "NASA releases largest dataset of exoplanet observations",
        summary:
          "NASA's Kepler Space Telescope data archive now contains observations of over 5,000 confirmed exoplanets, including detailed atmospheric composition data.",
        content:
          "The space agency has made available the most comprehensive dataset of exoplanet observations to date. The release includes spectroscopic data from thousands of planetary systems, enabling researchers to study atmospheric compositions, orbital mechanics, and potentially habitable worlds. The dataset is being made freely available to the scientific community.",
        url: "https://news.ycombinator.com/item?id=12346",
        points: 198,
        comments: 45,
        publishedAt: new Date(),
      },
      {
        title: "PostgreSQL 16 introduces parallel query execution improvements",
        summary:
          "The latest PostgreSQL release features significant performance improvements for complex queries through enhanced parallel execution strategies.",
        content:
          "PostgreSQL 16 brings major improvements to parallel query processing, with new algorithms for join operations and aggregate functions. Benchmarks show up to 3x performance improvements for analytical workloads. The release also includes better memory management and improved query planning for large datasets.",
        url: "https://news.ycombinator.com/item?id=12347",
        points: 267,
        comments: 73,
        publishedAt: new Date(),
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
}
