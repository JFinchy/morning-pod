import {
  BaseScraper,
  ScraperConfig,
  ScrapingResult,
  ScrapedContent,
} from "./types";

export class TLDRScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: "TLDR Tech",
      baseUrl: "https://tldr.tech",
      category: "technology",
      rateLimit: 10, // 10 requests per minute
      timeout: 10000, // 10 seconds
      retries: 3,
      selectors: {
        title: "h1, .title",
        content: ".content, .body, article",
        summary: ".summary, .excerpt",
        date: ".date, time",
        url: "a[href]",
      },
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

  validateContent(content: any): boolean {
    return (
      content &&
      typeof content.title === "string" &&
      typeof content.summary === "string" &&
      content.title.length > 0 &&
      content.summary.length > 10
    );
  }

  transformContent(rawContent: any): ScrapedContent[] {
    if (!Array.isArray(rawContent)) {
      rawContent = [rawContent];
    }

    return rawContent
      .filter((item: any) => this.validateContent(item))
      .map((item: any, index: number) => ({
        id: `tldr-${Date.now()}-${index}`,
        title: item.title.trim(),
        summary: item.summary.trim(),
        content: item.content || item.summary,
        url: item.url || `${this.config.baseUrl}/article/${index}`,
        publishedAt: item.publishedAt || new Date(),
        source: this.config.name,
        category: this.config.category,
        tags: this.extractTags(item.content || item.summary),
        contentHash: this.generateContentHash(item.title + item.summary),
      }));
  }

  private generateMockTLDRContent(): ScrapedContent[] {
    const mockArticles = [
      {
        title: "OpenAI Releases GPT-4 Turbo with Vision Capabilities",
        summary:
          "OpenAI has announced GPT-4 Turbo, featuring enhanced vision capabilities and lower costs for developers. The new model can process images alongside text and offers improved performance.",
        content:
          "OpenAI today unveiled GPT-4 Turbo, marking a significant advancement in multimodal AI capabilities. The new model integrates vision processing with natural language understanding, allowing developers to build applications that can analyze and describe images with unprecedented accuracy. Key improvements include reduced latency, lower API costs, and enhanced reasoning capabilities across visual and textual inputs.",
        url: "https://tldr.tech/ai/2024/01/04/openai-gpt4-turbo-vision",
        publishedAt: new Date(),
      },
      {
        title: "Apple Vision Pro Pre-Orders Start February 2nd",
        summary:
          "Apple announced that Vision Pro pre-orders will begin on February 2nd, with the device officially launching on February 9th. The mixed reality headset starts at $3,499.",
        content:
          "Apple's highly anticipated Vision Pro mixed reality headset will be available for pre-order starting February 2nd, with general availability beginning February 9th. The device, which starts at $3,499, represents Apple's first major new product category since the Apple Watch. The Vision Pro features dual 4K displays, spatial computing capabilities, and seamless integration with the Apple ecosystem.",
        url: "https://tldr.tech/apple/2024/01/04/vision-pro-preorders",
        publishedAt: new Date(),
      },
      {
        title: "Microsoft Copilot Integration Expands to More Office Apps",
        summary:
          "Microsoft is rolling out Copilot AI assistant integration to PowerPoint, Outlook, and Teams, bringing AI-powered features to millions of users worldwide.",
        content:
          "Microsoft continues its aggressive AI integration strategy by expanding Copilot functionality across its Office suite. The AI assistant can now generate PowerPoint presentations, draft emails in Outlook, and summarize Teams meetings. This rollout represents Microsoft's commitment to embedding AI capabilities throughout its productivity ecosystem, potentially transforming how millions of users interact with office software.",
        url: "https://tldr.tech/microsoft/2024/01/04/copilot-office-expansion",
        publishedAt: new Date(),
      },
    ];

    return this.transformContent(mockArticles);
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
}
