import {
  BaseScraper,
  type ScrapedContent,
  type ScraperConfig,
  type ScrapingResult,
} from "./types";

// Type for raw TLDR content before validation
interface RawTldrContent {
  content?: unknown;
  publishedAt?: unknown;
  summary?: unknown;
  title?: unknown;
  url?: unknown;
}

// Type for validated TLDR content
interface ValidatedTldrContent {
  content?: string;
  publishedAt?: Date;
  summary: string;
  title: string;
  url?: string;
}

export class TLDRScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      baseUrl: "https://tldr.tech",
      category: "technology",
      name: "TLDR Tech",
      rateLimit: 10, // 10 requests per minute
      retries: 3,
      selectors: {
        content: ".content, .body, article",
        date: ".date, time",
        summary: ".summary, .excerpt",
        title: "h1, .title",
        url: "a[href]",
      },
      timeout: 10000, // 10 seconds
    };
    super(config);
  }

  async scrape(): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      await this.rateLimit();

      // For now, we'll create mock data that simulates TLDR content
      // In a real implementation, this would fetch from their RSS/API
      const mockContent = this.generateMockTLDRContent();

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
    // Ensure we have an array to work with
    const contentArray = Array.isArray(rawContent) ? rawContent : [rawContent];

    return contentArray
      .filter((item: unknown): item is ValidatedTldrContent =>
        this.validateContent(item)
      )
      .map((item: ValidatedTldrContent, index: number) => ({
        category: this.config.category,
        content: item.content || item.summary,
        contentHash: this.generateContentHash(item.title + item.summary),
        id: `tldr-${Date.now()}-${index}`,
        publishedAt: item.publishedAt || new Date(),
        source: this.config.name,
        summary: item.summary.trim(),
        tags: this.extractTags(item.content || item.summary),
        title: item.title.trim(),
        url: item.url || `${this.config.baseUrl}/article/${index}`,
      }));
  }

  validateContent(content: unknown): content is ValidatedTldrContent {
    if (content === null || typeof content !== "object") {
      return false;
    }
    const item = content as RawTldrContent;
    return (
      "title" in item &&
      "summary" in item &&
      typeof item.title === "string" &&
      typeof item.summary === "string" &&
      item.title.length > 0 &&
      item.summary.length > 10
    );
  }

  private extractTags(content: string): string[] {
    const commonTechTerms = [
      "AI",
      "machine learning",
      "OpenAI",
      "GPT",
      "API",
      "developer",
      "Apple",
      "Microsoft",
      "Google",
      "Meta",
      "software",
      "hardware",
      "cloud",
      "cybersecurity",
      "blockchain",
      "cryptocurrency",
      "startup",
    ];

    const contentLower = content.toLowerCase();
    return commonTechTerms
      .filter((term) => contentLower.includes(term.toLowerCase()))
      .slice(0, 5); // Limit to 5 tags
  }

  private generateMockTLDRContent(): ScrapedContent[] {
    const mockArticles = [
      {
        content:
          "OpenAI today unveiled GPT-4 Turbo, marking a significant advancement in multimodal AI capabilities. The new model integrates vision processing with natural language understanding, allowing developers to build applications that can analyze and describe images with unprecedented accuracy. Key improvements include reduced latency, lower API costs, and enhanced reasoning capabilities across visual and textual inputs.",
        publishedAt: new Date(),
        summary:
          "OpenAI has announced GPT-4 Turbo, featuring enhanced vision capabilities and lower costs for developers. The new model can process images alongside text and offers improved performance.",
        title: "OpenAI Releases GPT-4 Turbo with Vision Capabilities",
        url: "https://tldr.tech/ai/2024/01/04/openai-gpt4-turbo-vision",
      },
      {
        content:
          "Apple's highly anticipated Vision Pro mixed reality headset will be available for pre-order starting February 2nd, with general availability beginning February 9th. The device, which starts at $3,499, represents Apple's first major new product category since the Apple Watch. The Vision Pro features dual 4K displays, spatial computing capabilities, and seamless integration with the Apple ecosystem.",
        publishedAt: new Date(),
        summary:
          "Apple announced that Vision Pro pre-orders will begin on February 2nd, with the device officially launching on February 9th. The mixed reality headset starts at $3,499.",
        title: "Apple Vision Pro Pre-Orders Start February 2nd",
        url: "https://tldr.tech/apple/2024/01/04/vision-pro-preorders",
      },
      {
        content:
          "Microsoft continues its aggressive AI integration strategy by expanding Copilot functionality across its Office suite. The AI assistant can now generate PowerPoint presentations, draft emails in Outlook, and summarize Teams meetings. This rollout represents Microsoft's commitment to embedding AI capabilities throughout its productivity ecosystem, potentially transforming how millions of users interact with office software.",
        publishedAt: new Date(),
        summary:
          "Microsoft is rolling out Copilot AI assistant integration to PowerPoint, Outlook, and Teams, bringing AI-powered features to millions of users worldwide.",
        title: "Microsoft Copilot Integration Expands to More Office Apps",
        url: "https://tldr.tech/microsoft/2024/01/04/copilot-office-expansion",
      },
    ];

    return this.transformContent(mockArticles);
  }
}
