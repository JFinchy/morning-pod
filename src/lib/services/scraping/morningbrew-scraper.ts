import {
  BaseScraper,
  type ScrapedContent,
  type ScraperConfig,
  type ScrapingResult,
} from "./types";

// Type for raw Morning Brew content before validation
interface RawMorningBrewContent {
  content?: unknown;
  publishedAt?: unknown;
  summary?: unknown;
  title?: unknown;
  url?: unknown;
}

// Type for validated Morning Brew content
interface ValidatedMorningBrewContent {
  content?: string;
  publishedAt?: Date;
  summary: string;
  title: string;
  url?: string;
}

export class MorningBrewScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      baseUrl: "https://morningbrew.com",
      category: "business",
      name: "Morning Brew",
      rateLimit: 15, // Moderate rate limiting
      retries: 3,
      selectors: {
        content: ".content, .article-body",
        date: ".date, .timestamp",
        summary: ".summary, .excerpt, .lead",
        title: "h1, .headline",
        url: "a.article-link",
      },
      timeout: 12000,
    };
    super(config);
  }

  async scrape(): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      await this.rateLimit();

      // Mock data simulating Morning Brew content
      const mockContent = this.generateMockBrewContent();

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
      .filter((item: unknown): item is ValidatedMorningBrewContent =>
        this.validateContent(item)
      )
      .map((item: ValidatedMorningBrewContent, index: number) => ({
        category: this.config.category,
        content: String(item.content || item.summary),
        contentHash: this.generateContentHash(
          String(item.title) + String(item.summary)
        ),
        id: `brew-${Date.now()}-${index}`,
        publishedAt: (item.publishedAt as Date) || new Date(),
        source: this.config.name,
        summary: String(item.summary).trim(),
        tags: this.extractBusinessTags(
          String(item.title),
          String(item.content || item.summary)
        ),
        title: String(item.title).trim(),
        url: String(item.url || `${this.config.baseUrl}/daily/${index}`),
      }));
  }

  validateContent(content: unknown): content is ValidatedMorningBrewContent {
    if (content === null || typeof content !== "object") {
      return false;
    }
    const item = content as RawMorningBrewContent;
    return (
      "title" in item &&
      "summary" in item &&
      typeof item.title === "string" &&
      typeof item.summary === "string" &&
      item.title.length > 10 &&
      item.summary.length > 20 // Business content tends to be longer
    );
  }

  private extractBusinessTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const businessTerms = [
      "market cap",
      "revenue",
      "profit",
      "earnings",
      "ipo",
      "merger",
      "acquisition",
      "fed",
      "federal reserve",
      "interest rates",
      "inflation",
      "recession",
      "gdp",
      "stock market",
      "s&p 500",
      "nasdaq",
      "dow jones",
      "cryptocurrency",
      "bitcoin",
      "ethereum",
      "fintech",
      "banking",
      "venture capital",
      "private equity",
      "startup",
      "valuation",
      "funding",
      "investment",
      "retail",
      "e-commerce",
      "manufacturing",
      "energy",
      "oil",
      "renewable",
      "real estate",
      "healthcare",
    ];

    return businessTerms.filter((term) => text.includes(term)).slice(0, 5);
  }

  private generateMockBrewContent(): ScrapedContent[] {
    const mockArticles = [
      {
        content:
          "Nvidia's meteoric rise continues as the company officially crossed the $2 trillion market cap threshold, joining Apple and Microsoft in this exclusive club. The surge is primarily attributed to unprecedented demand for AI infrastructure, with data centers scrambling to secure Nvidia's H100 and A100 chips. CEO Jensen Huang described the current moment as 'the iPhone moment for AI,' emphasizing how every industry is racing to integrate artificial intelligence capabilities.",
        publishedAt: new Date(),
        summary:
          "Nvidia became the third company to reach a $2 trillion market capitalization, driven by explosive demand for AI chips. The semiconductor giant's revenue grew 265% year-over-year in Q4 2023.",
        title: "Nvidia's Market Cap Hits $2 Trillion as AI Demand Soars",
        url: "https://morningbrew.com/daily/2024/01/04/nvidia-2-trillion",
      },
      {
        content:
          "In a carefully worded statement, Federal Reserve Chair Jerome Powell suggested that monetary policy could become less restrictive this year if economic conditions continue to evolve as expected. Markets rallied on the news, with the S&P 500 gaining 1.2% in after-hours trading. The central bank emphasized that rate decisions will remain data-dependent, with upcoming employment and inflation reports serving as key indicators.",
        publishedAt: new Date(),
        summary:
          "The Federal Reserve indicated it may cut interest rates three times in 2024, signaling confidence that inflation is moving toward the 2% target without triggering a recession.",
        title: "Federal Reserve Signals Three Rate Cuts This Year",
        url: "https://morningbrew.com/daily/2024/01/04/fed-rate-cuts",
      },
      {
        content:
          "WeWork officially completed its Chapter 11 bankruptcy process, emerging as a significantly smaller company focused on profitable markets. The restructuring eliminated $4 billion in debt and allowed the company to reject unfavorable leases in expensive markets like New York and San Francisco. New CEO David Tolley emphasized a 'back-to-basics' approach, focusing on operational efficiency rather than rapid expansion.",
        publishedAt: new Date(),
        summary:
          "The co-working giant emerged from bankruptcy with a dramatically reduced footprint, closing 40% of its locations and renegotiating lease terms on remaining properties.",
        title: "WeWork Completes Bankruptcy Restructuring",
        url: "https://morningbrew.com/daily/2024/01/04/wework-bankruptcy-complete",
      },
      {
        content:
          "The suite of spot Bitcoin ETFs approved by the SEC in January has transformed institutional access to cryptocurrency. BlackRock's IBIT fund led inflows with $400 million in a single day, while Fidelity's FBTC followed closely with $380 million. The surge represents a validation of crypto as a mainstream asset class, with financial advisors reporting increased client interest in Bitcoin exposure through traditional brokerage accounts.",
        publishedAt: new Date(),
        summary:
          "Newly approved Bitcoin exchange-traded funds attracted unprecedented investor interest, with combined daily inflows exceeding $1 billion for the first time since launching.",
        title: "Bitcoin ETFs See Record $1B Daily Inflows",
        url: "https://morningbrew.com/daily/2024/01/04/bitcoin-etf-inflows",
      },
    ];

    return this.transformContent(mockArticles);
  }
}
