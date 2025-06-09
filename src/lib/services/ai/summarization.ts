import OpenAI from "openai";
import { z } from "zod";

/**
 * Configuration for AI summarization service
 *
 * @business-context We use OpenAI GPT-4 for summarization to ensure high quality
 *                   podcast-friendly content. Cost is balanced by limiting max tokens
 *                   and using efficient prompts.
 * @decision-date 2024-01-22
 * @decision-by Product team after quality comparison testing
 */
const AI_CONFIG = {
  baseDelay: 1000, // 1 second base retry delay
  maxRetries: 3,
  maxTokens: 2000, // ~1600 words, optimal for 5-10 min TTS audio
  model: "gpt-4" as const,
  temperature: 0.3, // Consistent, factual tone
} as const;

/**
 * Pricing per 1K tokens (as of 2024-01-22)
 * @business-context Updated monthly from OpenAI pricing page
 */
const PRICING = {
  "gpt-4": {
    input: 0.03, // $0.03 per 1K input tokens
    output: 0.06, // $0.06 per 1K output tokens
  },
} as const;

/**
 * Validation schemas for summarization inputs and outputs
 */
const ContentSchema = z.object({
  content: z.string().min(100, "Content must be at least 100 characters"),
  publishedAt: z.date().optional(),
  source: z.string().min(1, "Source is required"),
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Valid URL is required"),
});

const SummarySchema = z.object({
  estimatedReadTime: z.number().positive(),
  keyPoints: z.array(z.string()).min(1).max(5),
  summary: z.string().min(50),
  title: z.string().min(1),
  ttsOptimizedContent: z.string().min(50),
});

export type ContentInput = z.infer<typeof ContentSchema>;
export type SummaryOutput = z.infer<typeof SummarySchema>;

/**
 * Cost tracking interface for summarization operations
 */
export interface SummarizationCost {
  inputCost: number;
  inputTokens: number;
  model: string;
  outputCost: number;
  outputTokens: number;
  timestamp: Date;
  totalCost: number;
  totalTokens: number;
}

/**
 * Error types for better error handling
 */
export class SummarizationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "API_ERROR"
      | "CONTENT_TOO_LONG"
      | "RETRY_EXHAUSTED"
      | "VALIDATION_ERROR",
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "SummarizationError";
  }
}

/**
 * AI Summarization Service
 *
 * Converts raw news content into podcast-friendly summaries optimized for TTS
 *
 * @business-context Creates engaging, conversational summaries that sound natural
 *                   when read by AI voice synthesis. Includes key points and
 *                   smooth transitions for better listener experience.
 */
export class SummarizationService {
  private costTracker: SummarizationCost[] = [];
  private openai: OpenAI;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new SummarizationError(
        "OpenAI API key is required",
        "VALIDATION_ERROR"
      );
    }

    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Get service configuration
   * @business-context Exposed for monitoring and debugging
   */
  static getConfig() {
    return AI_CONFIG;
  }

  /**
   * Get current pricing information
   * @business-context Exposed for cost monitoring and budgeting
   */
  static getPricing() {
    return PRICING;
  }

  /**
   * Clear cost tracking history
   * @business-context Used for periodic cleanup and memory management
   */
  clearCostHistory(): void {
    this.costTracker = [];
  }

  /**
   * Generate a podcast-friendly summary from content
   *
   * @business-context Creates summaries optimized for voice synthesis with
   *                   natural speech patterns, clear pronunciation cues,
   *                   and engaging narrative flow for podcast consumption.
   *
   * @param content - The content to summarize
   * @returns Promise with summary and cost tracking
   * @throws SummarizationError for validation or API failures
   */
  async generateSummary(content: ContentInput): Promise<{
    cost: SummarizationCost;
    summary: SummaryOutput;
  }> {
    // Validate input
    const validatedContent = ContentSchema.parse(content);

    // Check content length (approximate token count)
    const estimatedTokens = this.estimateTokens(validatedContent.content);
    if (estimatedTokens > 12000) {
      // Leave room for output tokens
      throw new SummarizationError(
        "Content too long for processing",
        "CONTENT_TOO_LONG"
      );
    }

    const prompt = this.buildSummarizationPrompt(validatedContent);

    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        const completion = await this.openai.chat.completions.create({
          max_tokens: AI_CONFIG.maxTokens,
          messages: [
            {
              content: `You are a professional podcast script writer specializing in tech news. 
                       Create engaging, conversational summaries optimized for AI voice synthesis.
                       Use natural speech patterns, clear pronunciation, and smooth transitions.`,
              role: "system",
            },
            {
              content: prompt,
              role: "user",
            },
          ],
          model: AI_CONFIG.model,
          response_format: { type: "json_object" },
          temperature: AI_CONFIG.temperature,
        });

        const { usage } = completion;
        if (!usage) {
          throw new SummarizationError(
            "No usage information returned",
            "API_ERROR"
          );
        }

        // Parse and validate response
        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
          throw new SummarizationError("No content in response", "API_ERROR");
        }

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseContent);
        } catch (parseError) {
          throw new SummarizationError(
            "Invalid JSON response from AI",
            "API_ERROR",
            parseError as Error
          );
        }

        const summary = SummarySchema.parse(parsedResponse);

        // Calculate costs
        const cost: SummarizationCost = {
          inputCost:
            (usage.prompt_tokens / 1000) * PRICING[AI_CONFIG.model].input,
          inputTokens: usage.prompt_tokens,
          model: AI_CONFIG.model,
          outputCost:
            (usage.completion_tokens / 1000) * PRICING[AI_CONFIG.model].output,
          outputTokens: usage.completion_tokens,
          timestamp: new Date(startTime),
          totalCost: 0, // Will be calculated below
          totalTokens: usage.total_tokens,
        };
        cost.totalCost = cost.inputCost + cost.outputCost;

        // Track cost for monitoring
        this.costTracker.push(cost);

        return { cost, summary };
      } catch (error) {
        lastError = error as Error;

        if (attempt === AI_CONFIG.maxRetries) {
          break;
        }

        // Exponential backoff delay
        const delay = AI_CONFIG.baseDelay * 2 ** (attempt - 1);
        await this.sleep(delay);
      }
    }

    throw new SummarizationError(
      `Failed after ${AI_CONFIG.maxRetries} attempts: ${lastError?.message}`,
      "RETRY_EXHAUSTED",
      lastError || undefined
    );
  }

  /**
   * Get cost tracking history
   * @business-context Provides cost analytics and budget monitoring
   */
  getCostHistory(): SummarizationCost[] {
    return [...this.costTracker];
  }

  /**
   * Get total costs for a date range
   * @business-context Used for budget reporting and cost analysis
   */
  getTotalCosts(
    startDate?: Date,
    endDate?: Date
  ): {
    requestCount: number;
    totalCost: number;
    totalTokens: number;
  } {
    let filteredCosts = this.costTracker;

    if (startDate) {
      filteredCosts = filteredCosts.filter(
        (cost) => cost.timestamp >= startDate
      );
    }

    if (endDate) {
      filteredCosts = filteredCosts.filter((cost) => cost.timestamp <= endDate);
    }

    return {
      requestCount: filteredCosts.length,
      totalCost: filteredCosts.reduce((sum, cost) => sum + cost.totalCost, 0),
      totalTokens: filteredCosts.reduce(
        (sum, cost) => sum + cost.totalTokens,
        0
      ),
    };
  }

  /**
   * Validate API key and connection
   *
   * @business-context Used during service initialization to ensure
   *                   configuration is correct before attempting operations
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Build the summarization prompt optimized for podcast content
   *
   * @business-context Creates structured prompts that guide AI to produce
   *                   content with natural speech flow, clear transitions,
   *                   and engaging narrative for audio consumption.
   */
  private buildSummarizationPrompt(content: ContentInput): string {
    const publishedDate =
      content.publishedAt?.toLocaleDateString() || "recently";

    return `
Please create a podcast-friendly summary of this article:

**Article Title:** ${content.title}
**Source:** ${content.source}
**Published:** ${publishedDate}
**URL:** ${content.url}

**Content:**
${content.content}

Create a JSON response with the following structure:
{
  "title": "Catchy, podcast-friendly title (60 chars max)",
  "summary": "3-paragraph summary with natural speech flow (200-300 words)",
  "keyPoints": ["3-5 key takeaways", "Clear and concise points"],
  "estimatedReadTime": 2,
  "ttsOptimizedContent": "Full script optimized for AI voice synthesis (400-600 words)"
}

**TTS Optimization Guidelines:**
- Use conversational tone with natural speech patterns
- Include smooth transitions between topics
- Avoid complex punctuation that affects pronunciation
- Add brief pauses with periods for natural rhythm
- Use "and" instead of "&", spell out numbers clearly
- Include engaging hooks and clear conclusions
- Make it sound like a human podcast host would deliver it

**Content Requirements:**
- Focus on the most newsworthy and interesting aspects
- Maintain accuracy while making it engaging
- Include context for technical terms
- Create a narrative flow that keeps listeners engaged
- End with a clear conclusion or call-to-action
`;
  }

  /**
   * Estimate token count for content (approximate)
   * @business-context Used to prevent API calls that exceed limits
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create summarization service instance
 *
 * @business-context Provides consistent service instantiation with
 *                   environment-based configuration and error handling
 */
export function createSummarizationService(
  apiKey?: string
): SummarizationService {
  return new SummarizationService(apiKey);
}
