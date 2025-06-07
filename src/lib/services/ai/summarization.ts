import { createId } from "@paralleldrive/cuid2";
import OpenAI from "openai";

import {
  SummarizationRequest,
  SummarizationResult,
  SummarizationOptions,
  ScrapedContentItem,
  AIServiceError,
  RateLimitError,
  QuotaExceededError,
  InvalidInputError,
  CostTracking,
} from "./types";

// OpenAI pricing (as of 2024) - update these as needed
const PRICING = {
  "gpt-4o": {
    input: 0.0025, // per 1K tokens
    output: 0.01, // per 1K tokens
  },
  "gpt-4o-mini": {
    input: 0.00015, // per 1K tokens
    output: 0.0006, // per 1K tokens
  },
} as const;

export class SummarizationService {
  private openai: OpenAI;
  private defaultModel: string = "gpt-4o-mini";
  private costTracker: CostTracking[] = [];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
  }

  /**
   * Summarize scraped content into podcast-format text
   */
  async summarize(request: SummarizationRequest): Promise<SummarizationResult> {
    const startTime = Date.now();
    const requestId = createId();

    try {
      // Validate input
      this.validateRequest(request);

      // Prepare content for summarization
      const contentText = this.prepareContent(request.content);
      const prompt = this.buildPrompt(contentText, request.options);

      // Call OpenAI API
      const completion = await this.callOpenAI(prompt, request.options);

      // Calculate costs
      const cost = this.calculateCost(completion.usage, this.defaultModel);

      // Track costs
      this.trackCost({
        service: "openai-gpt",
        model: this.defaultModel,
        tokensUsed: completion.usage?.total_tokens,
        cost,
        timestamp: new Date(),
        requestId,
      });

      const summary = completion.choices[0]?.message?.content;
      if (!summary) {
        throw new AIServiceError("No summary generated", "summarization");
      }

      // Estimate audio duration (average speaking rate: ~150 words per minute)
      const wordCount = summary.split(/\s+/).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

      return {
        success: true,
        summary,
        wordCount,
        estimatedDuration,
        cost,
        tokensUsed: completion.usage?.total_tokens,
        metadata: {
          model: this.defaultModel,
          processingTime: Date.now() - startTime,
          sourceCount: request.content.length,
        },
      };
    } catch (error) {
      console.error("Summarization error:", error);

      if (error instanceof AIServiceError) {
        return {
          success: false,
          error: error.message,
          metadata: {
            model: this.defaultModel,
            processingTime: Date.now() - startTime,
            sourceCount: request.content.length,
          },
        };
      }

      // Handle OpenAI specific errors
      if (error instanceof Error && "status" in error) {
        const aiError = this.handleOpenAIError(error as any);
        return {
          success: false,
          error: aiError.message,
          metadata: {
            model: this.defaultModel,
            processingTime: Date.now() - startTime,
            sourceCount: request.content.length,
          },
        };
      }

      return {
        success: false,
        error: "Unknown error occurred during summarization",
        metadata: {
          model: this.defaultModel,
          processingTime: Date.now() - startTime,
          sourceCount: request.content.length,
        },
      };
    }
  }

  /**
   * Get cost tracking data
   */
  getCostTracking(): CostTracking[] {
    return [...this.costTracker];
  }

  /**
   * Clear cost tracking data
   */
  clearCostTracking(): void {
    this.costTracker = [];
  }

  private validateRequest(request: SummarizationRequest): void {
    if (!request.content || request.content.length === 0) {
      throw new InvalidInputError("summarization", "No content provided");
    }

    if (request.content.length > 50) {
      throw new InvalidInputError(
        "summarization",
        "Too many content items (max 50)"
      );
    }

    // Check total content length
    const totalLength = request.content.reduce(
      (sum, item) => sum + item.content.length,
      0
    );
    if (totalLength > 100000) {
      // ~100k characters
      throw new InvalidInputError(
        "summarization",
        "Content too long (max 100k characters)"
      );
    }
  }

  private prepareContent(content: ScrapedContentItem[]): string {
    return content
      .map((item, index) => {
        return `
## Article ${index + 1}: ${item.title}
**Source:** ${item.source}
**Category:** ${item.category || "General"}
${item.url ? `**URL:** ${item.url}` : ""}

${item.content}

---
`;
      })
      .join("\n");
  }

  private buildPrompt(
    contentText: string,
    options?: SummarizationOptions
  ): string {
    const style = options?.style || "conversational";
    const targetLength = options?.targetLength || "medium";
    const includeIntro = options?.includeIntro ?? true;
    const includeOutro = options?.includeOutro ?? true;

    const lengthGuidance = {
      short: "100-150 words",
      medium: "200-300 words",
      long: "400-500 words",
    };

    const styleGuidance = {
      conversational:
        "Use a friendly, engaging tone as if speaking to a friend. Include natural transitions and conversational phrases.",
      formal:
        "Use a professional, news-anchor style tone. Be clear and authoritative.",
      casual:
        "Use a relaxed, informal tone. Feel free to use contractions and casual language.",
    };

    return `You are a podcast host creating a daily news summary. Transform the following news articles into a cohesive, engaging podcast script.

**Style:** ${styleGuidance[style]}
**Target Length:** ${lengthGuidance[targetLength]}
**Include Intro:** ${includeIntro ? "Yes" : "No"}
**Include Outro:** ${includeOutro ? "Yes" : "No"}

**Instructions:**
1. Create a flowing narrative that connects the stories naturally
2. Prioritize the most important and interesting stories
3. Use transitions between topics
4. Make it sound natural when spoken aloud
5. Include specific details and context where relevant
6. Avoid reading like a list of bullet points

${
  includeIntro
    ? `
**Intro Example:** "Good morning! Welcome to your daily news briefing. I'm here with the latest updates from the world of technology and beyond. Let's dive into what's happening today."
`
    : ""
}

${
  includeOutro
    ? `
**Outro Example:** "That's your news update for today. Stay informed, stay curious, and I'll see you tomorrow with more updates. Have a great day!"
`
    : ""
}

**News Articles to Summarize:**
${contentText}

**Podcast Script:**`;
  }

  private async callOpenAI(prompt: string, options?: SummarizationOptions) {
    const maxTokens = options?.maxTokens || 800;
    const temperature = options?.temperature || 0.7;

    return await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert podcast host and content creator. Your job is to transform news articles into engaging, natural-sounding podcast scripts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: 1,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    });
  }

  private calculateCost(usage: any, model: string): number {
    if (!usage || !PRICING[model as keyof typeof PRICING]) {
      return 0;
    }

    const pricing = PRICING[model as keyof typeof PRICING];
    const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * pricing.output;

    return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
  }

  private trackCost(tracking: CostTracking): void {
    this.costTracker.push(tracking);

    // Keep only last 100 entries to prevent memory issues
    if (this.costTracker.length > 100) {
      this.costTracker = this.costTracker.slice(-100);
    }
  }

  private handleOpenAIError(error: any): AIServiceError {
    switch (error.status) {
      case 429:
        const retryAfter = error.headers?.["retry-after"]
          ? parseInt(error.headers["retry-after"])
          : undefined;
        return new RateLimitError("summarization", retryAfter);

      case 402:
        return new QuotaExceededError("summarization");

      case 400:
        return new InvalidInputError("summarization", error.message);

      default:
        return new AIServiceError(
          `OpenAI API error: ${error.message}`,
          "summarization",
          error.code || "UNKNOWN",
          error.status ? error.status >= 500 : false
        );
    }
  }
}
