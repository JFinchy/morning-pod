// AI Summarization Service for podcast content generation
import OpenAI from "openai";

import {
  SummarizationRequest,
  SummarizationResponse,
  SummarizationConfig,
  SummarizationMetrics,
  SummarizationHistory,
  QualityAssessment,
  SummarizationError,
  DEFAULT_CONFIG,
  SUMMARY_WORD_TARGETS,
  SUPPORTED_PROVIDERS,
} from "./types";

export class SummarizationService {
  private openai: OpenAI | null = null;
  private config: SummarizationConfig;
  private metrics: SummarizationMetrics;
  private history: SummarizationHistory[] = [];

  constructor(config: Partial<SummarizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = this.initializeMetrics();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY && this.config.provider === "openai") {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  private initializeMetrics(): SummarizationMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
      averageProcessingTime: 0,
      averageQualityScore: 0,
      costByModel: {},
      qualityDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
      last24Hours: {
        requests: 0,
        cost: 0,
        averageQuality: 0,
      },
    };
  }

  /**
   * Main summarization method
   */
  async summarize(
    request: SummarizationRequest
  ): Promise<SummarizationResponse> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Validate input
      this.validateRequest(request);

      // Preprocess content
      const processedContent = this.preprocessContent(request.content);

      // Generate summary
      const summary = await this.generateSummary({
        ...request,
        content: processedContent,
      });

      // Assess quality
      const quality = await this.assessQuality(summary, request);

      // Check quality thresholds
      if (!this.meetsQualityThresholds(quality)) {
        throw new SummarizationError(
          "Summary does not meet quality thresholds",
          "QUALITY_THRESHOLD",
          this.config.provider
        );
      }

      // Generate TTS-optimized version
      const ttsOptimized = this.optimizeForTTS(summary);

      // Calculate metrics
      const processingTime = Date.now() - startTime;
      const cost = this.calculateCost(request.content, summary);

      const response: SummarizationResponse = {
        summary,
        keyPoints: request.includeKeyPoints
          ? this.extractKeyPoints(summary)
          : undefined,
        takeaways: request.includeTakeaways
          ? this.extractTakeaways(summary)
          : undefined,
        metadata: {
          originalLength: request.content.length,
          summaryLength: summary.length,
          compressionRatio: summary.length / request.content.length,
          processingTime,
          cost,
          model: this.config.model,
          quality,
        },
        ttsOptimized,
      };

      // Update metrics
      this.updateMetrics(response, true);

      // Add to history
      this.addToHistory(request, response, true);

      return response;
    } catch (error) {
      this.metrics.failedRequests++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.addToHistory(request, null, false, errorMessage);

      if (error instanceof SummarizationError) {
        throw error;
      }

      throw new SummarizationError(
        `Summarization failed: ${errorMessage}`,
        "UNKNOWN",
        this.config.provider
      );
    }
  }

  private validateRequest(request: SummarizationRequest): void {
    if (!request.content || request.content.trim().length === 0) {
      throw new SummarizationError("Content is required", "INVALID_INPUT");
    }

    if (request.content.length > 50000) {
      throw new SummarizationError(
        "Content too long (max 50,000 characters)",
        "INVALID_INPUT"
      );
    }

    if (!request.source || request.source.trim().length === 0) {
      throw new SummarizationError("Source is required", "INVALID_INPUT");
    }
  }

  private preprocessContent(content: string): string {
    // Remove excessive whitespace
    let processed = content.replace(/\s+/g, " ").trim();

    // Remove common article artifacts
    processed = processed.replace(/\[.*?\]/g, ""); // Remove [brackets]
    processed = processed.replace(/Advertisement|ADVERTISEMENT/g, ""); // Remove ads
    processed = processed.replace(/Continue reading.*/g, ""); // Remove "continue reading"
    processed = processed.replace(/Read more.*/g, ""); // Remove "read more"

    // Clean up quotes and apostrophes
    processed = processed.replace(/[""]/g, '"');
    processed = processed.replace(/['']/g, "'");

    return processed;
  }

  private async generateSummary(
    request: SummarizationRequest
  ): Promise<string> {
    if (!this.openai) {
      throw new SummarizationError(
        "OpenAI not initialized",
        "API_ERROR",
        "openai"
      );
    }

    const prompt = this.buildPrompt(request);
    const targetLength = SUMMARY_WORD_TARGETS[request.targetLength || "medium"];

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: "system", content: this.config.prompts.system },
          { role: "user", content: prompt },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const summary = completion.choices[0]?.message?.content;
      if (!summary) {
        throw new SummarizationError(
          "No summary generated",
          "API_ERROR",
          "openai"
        );
      }

      return summary.trim();
    } catch (error: any) {
      if (error.status === 429) {
        throw new SummarizationError(
          "Rate limit exceeded",
          "RATE_LIMIT",
          "openai"
        );
      }
      throw new SummarizationError(
        `OpenAI API error: ${error.message}`,
        "API_ERROR",
        "openai"
      );
    }
  }

  private buildPrompt(request: SummarizationRequest): string {
    const targetLength = SUMMARY_WORD_TARGETS[request.targetLength || "medium"];

    return this.config.prompts.user
      .replace("{source}", request.source)
      .replace("{title}", request.title || "Untitled")
      .replace("{content}", request.content)
      .replace("{summaryStyle}", request.summaryStyle || "conversational")
      .replace("{targetLength}", `${targetLength}`)
      .replace(
        "{includeKeyPoints}",
        request.includeKeyPoints ? "true" : "false"
      )
      .replace(
        "{includeTakeaways}",
        request.includeTakeaways ? "true" : "false"
      );
  }

  private async assessQuality(
    summary: string,
    request: SummarizationRequest
  ): Promise<{ coherence: number; relevance: number; readability: number }> {
    // For now, use heuristic-based quality assessment
    // In production, you might want to use AI-based assessment

    const coherence = this.assessCoherence(summary);
    const relevance = this.assessRelevance(summary, request.content);
    const readability = this.assessReadability(summary);

    return {
      coherence,
      relevance,
      readability,
    };
  }

  private assessCoherence(summary: string): number {
    // Simple heuristics for coherence
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Check for reasonable sentence length
    const avgSentenceLength =
      sentences.reduce((sum, s) => sum + s.split(" ").length, 0) /
      sentences.length;
    const lengthScore = Math.max(
      0,
      Math.min(1, (30 - Math.abs(avgSentenceLength - 15)) / 30)
    );

    // Check for transition words
    const transitionWords = [
      "however",
      "meanwhile",
      "furthermore",
      "additionally",
      "now",
      "then",
      "next",
    ];
    const hasTransitions = transitionWords.some((word) =>
      summary.toLowerCase().includes(word.toLowerCase())
    );
    const transitionScore = hasTransitions ? 0.8 : 0.6;

    return (lengthScore + transitionScore) / 2;
  }

  private assessRelevance(summary: string, originalContent: string): number {
    // Simple keyword overlap analysis
    const summaryWords = summary
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    const contentWords = originalContent
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);

    const summaryWordSet = new Set(summaryWords);
    const contentWordSet = new Set(contentWords);

    const intersection = new Set(
      [...summaryWordSet].filter((w) => contentWordSet.has(w))
    );
    const overlap = intersection.size / Math.min(summaryWordSet.size, 50); // Cap at 50 words

    return Math.min(1, overlap);
  }

  private assessReadability(summary: string): number {
    // Simple readability heuristics
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const words = summary.split(/\s+/);

    // Average words per sentence (target: 10-20)
    const avgWordsPerSentence = words.length / sentences.length;
    const sentenceLengthScore = Math.max(
      0,
      Math.min(1, (25 - Math.abs(avgWordsPerSentence - 15)) / 25)
    );

    // Check for conversational markers
    const conversationalMarkers = [
      "now",
      "so",
      "well",
      "you know",
      "let's",
      "here's",
    ];
    const hasMarkers = conversationalMarkers.some((marker) =>
      summary.toLowerCase().includes(marker.toLowerCase())
    );
    const conversationalScore = hasMarkers ? 0.8 : 0.6;

    return (sentenceLengthScore + conversationalScore) / 2;
  }

  private meetsQualityThresholds(quality: {
    coherence: number;
    relevance: number;
    readability: number;
  }): boolean {
    return (
      quality.coherence >= this.config.qualityThresholds.minCoherence &&
      quality.relevance >= this.config.qualityThresholds.minRelevance &&
      quality.readability >= this.config.qualityThresholds.minReadability
    );
  }

  private optimizeForTTS(
    summary: string
  ): SummarizationResponse["ttsOptimized"] {
    let ttsText = summary;

    // Add natural pauses
    ttsText = ttsText.replace(/\. /g, '. <break time="0.5s"/> ');
    ttsText = ttsText.replace(/\? /g, '? <break time="0.5s"/> ');
    ttsText = ttsText.replace(/! /g, '! <break time="0.5s"/> ');
    ttsText = ttsText.replace(/: /g, ': <break time="0.3s"/> ');
    ttsText = ttsText.replace(/; /g, '; <break time="0.3s"/> ');

    // Estimate duration (roughly 150 words per minute)
    const wordCount = summary.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / 150) * 60); // in seconds

    // Extract pause markers
    const pauseMarkers = (summary.match(/[.!?:;]/g) || []).map(
      (_, index) => `pause_${index}`
    );

    return {
      text: ttsText,
      estimatedDuration,
      pauseMarkers,
    };
  }

  private extractKeyPoints(summary: string): string[] {
    // Simple key point extraction (in production, might use more sophisticated NLP)
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Take the most important sentences (simple heuristic: longer sentences often contain key info)
    const keyPoints = sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 50) // Minimum length for key points
      .sort((a, b) => b.length - a.length) // Sort by length
      .slice(0, 5); // Take top 5

    return keyPoints;
  }

  private extractTakeaways(summary: string): string[] {
    // Simple takeaway extraction
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);

    // Look for actionable or forward-looking sentences
    const takeaways = sentences
      .filter((s) => {
        const lower = s.toLowerCase();
        return (
          lower.includes("should") ||
          lower.includes("will") ||
          lower.includes("expect") ||
          lower.includes("could") ||
          lower.includes("important") ||
          lower.includes("key")
        );
      })
      .map((s) => s.trim())
      .slice(0, 3); // Take top 3

    return takeaways;
  }

  private calculateCost(content: string, summary: string): number {
    const provider = SUPPORTED_PROVIDERS.find(
      (p) => p.name === this.config.provider
    );
    if (!provider) return 0;

    const costPerToken = provider.costPer1kTokens[this.config.model] || 0;

    // Rough token estimation (1 token ≈ 4 characters)
    const inputTokens = Math.ceil(content.length / 4);
    const outputTokens = Math.ceil(summary.length / 4);
    const totalTokens = inputTokens + outputTokens;

    return (totalTokens / 1000) * costPerToken;
  }

  private updateMetrics(
    response: SummarizationResponse,
    success: boolean
  ): void {
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.totalCost += response.metadata.cost;

      // Update model costs
      if (!this.metrics.costByModel[response.metadata.model]) {
        this.metrics.costByModel[response.metadata.model] = 0;
      }
      this.metrics.costByModel[response.metadata.model] +=
        response.metadata.cost;

      // Update quality distribution
      const overall =
        (response.metadata.quality.coherence +
          response.metadata.quality.relevance +
          response.metadata.quality.readability) /
        3;

      if (overall > 0.8) this.metrics.qualityDistribution.excellent++;
      else if (overall > 0.6) this.metrics.qualityDistribution.good++;
      else if (overall > 0.4) this.metrics.qualityDistribution.fair++;
      else this.metrics.qualityDistribution.poor++;

      // Update averages
      this.metrics.averageProcessingTime =
        (this.metrics.averageProcessingTime *
          (this.metrics.successfulRequests - 1) +
          response.metadata.processingTime) /
        this.metrics.successfulRequests;

      this.metrics.averageQualityScore =
        (this.metrics.averageQualityScore *
          (this.metrics.successfulRequests - 1) +
          overall) /
        this.metrics.successfulRequests;
    }
  }

  private addToHistory(
    request: SummarizationRequest,
    response: SummarizationResponse | null,
    success: boolean,
    error?: string
  ): void {
    const historyEntry: SummarizationHistory = {
      id: `sum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      request,
      response: response as SummarizationResponse,
      success,
      error,
    };

    this.history.push(historyEntry);

    // Keep only last 100 entries
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
  }

  /**
   * Public methods for accessing service data
   */

  getMetrics(): SummarizationMetrics {
    return { ...this.metrics };
  }

  getHistory(): SummarizationHistory[] {
    return [...this.history];
  }

  getConfig(): SummarizationConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<SummarizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeProviders(); // Reinitialize providers if needed
  }

  /**
   * Test method for validating configuration
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      const testRequest: SummarizationRequest = {
        content:
          "This is a test article about artificial intelligence and its impact on modern technology. AI systems are becoming increasingly sophisticated and are being deployed across various industries.",
        source: "test",
        title: "Test Article",
        contentType: "tech",
        summaryStyle: "brief",
        targetLength: "short",
      };

      await this.summarize(testRequest);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const summarizationService = new SummarizationService();
