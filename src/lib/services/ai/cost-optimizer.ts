import { createId } from "@paralleldrive/cuid2";
import { createHash } from "crypto";
import { z } from "zod";

// Types for cost optimization
export interface ContentComplexityAnalysis {
  confidence: number;
  factors: {
    requiredReasoning: number;
    sentenceComplexity: number;
    technicalTerms: number;
    topicDepth: number;
  };
  recommendedModel: "gpt-3.5-turbo" | "gpt-4o-mini" | "gpt-4o";
  score: number; // 1-10 scale
}

export interface CacheEntry {
  contentHash: string;
  id: string;
  metadata: {
    cost: number;
    createdAt: Date;
    expiresAt: Date;
    model: string;
    quality: number;
  };
  summary: string;
}

export interface CostBudget {
  current: {
    daily: number;
    monthly: number;
  };
  daily: number;
  monthly: number;
  perRequest: number;
}

export interface OptimizationResult {
  cacheHit?: CacheEntry;
  estimatedCost: number;
  qualityTrade: "minor" | "moderate" | "none";
  reason: string;
  recommendedModel: string;
  shouldProcess: boolean;
}

export class CostOptimizer {
  private cache = new Map<string, CacheEntry>();
  private dailyCost = 0;
  private monthlyCost = 0;

  constructor(
    private budget: CostBudget = {
      current: { daily: 0, monthly: 0 },
      daily: 5.0,
      monthly: 50.0,
      perRequest: 1.0,
    }
  ) {}

  /**
   * Cache a summary result
   */
  cacheSummary(
    content: string,
    summary: string,
    metadata: {
      cost: number;
      model: string;
      quality: number;
    }
  ): void {
    const contentHash = this.createContentHash(content);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48-hour cache

    const cacheEntry: CacheEntry = {
      contentHash,
      id: createId(),
      metadata: {
        ...metadata,
        createdAt: new Date(),
        expiresAt,
      },
      summary,
    };

    this.cache.set(contentHash, cacheEntry);

    // Track costs
    this.dailyCost += metadata.cost;
    this.monthlyCost += metadata.cost;
  }

  /**
   * Get current cost tracking
   */
  getCostSummary() {
    return {
      budget: this.budget,
      cacheHitRate: this.cache.size / (this.cache.size + 1), // Simplified
      daily: this.dailyCost,
      monthly: this.monthlyCost,
    };
  }

  /**
   * Analyze content and determine optimal processing strategy
   */
  async optimizeProcessing(
    content: string,
    options: {
      forceProcess?: boolean;
      maxCost?: number;
      requiredQuality?: "basic" | "premium" | "standard";
    } = {}
  ): Promise<OptimizationResult> {
    // 1. Check cache first
    const contentHash = this.createContentHash(content);
    const cacheEntry = this.cache.get(contentHash);

    if (cacheEntry && !this.isCacheExpired(cacheEntry)) {
      return {
        cacheHit: cacheEntry,
        estimatedCost: 0,
        qualityTrade: "none",
        reason: "Content found in cache",
        recommendedModel: cacheEntry.metadata.model,
        shouldProcess: false,
      };
    }

    // 2. Analyze content complexity
    const complexity = this.analyzeContentComplexity(content);

    // 3. Check budget constraints
    const budgetCheck = this.checkBudgetConstraints(
      complexity.recommendedModel
    );
    if (!budgetCheck.canAfford && !options.forceProcess) {
      return {
        estimatedCost: 0,
        qualityTrade: "moderate",
        reason: "Budget constraints - daily/monthly limit reached",
        recommendedModel: "gpt-3.5-turbo", // Fallback
        shouldProcess: false,
      };
    }

    // 4. Quality requirements vs cost optimization
    let finalModel = complexity.recommendedModel;
    let qualityTrade: "minor" | "moderate" | "none" = "none";

    if (options.requiredQuality === "basic" && complexity.score <= 6) {
      finalModel = "gpt-3.5-turbo";
      qualityTrade = "minor";
    } else if (
      options.requiredQuality === "standard" &&
      complexity.score <= 8
    ) {
      finalModel = "gpt-4o-mini";
      qualityTrade = "none";
    }

    // 5. Cost estimation
    const estimatedCost = this.estimateCost(content, finalModel);

    return {
      estimatedCost,
      qualityTrade,
      reason: `Content complexity: ${complexity.score}/10, Model: ${finalModel}`,
      recommendedModel: finalModel,
      shouldProcess: true,
    };
  }

  /**
   * Reset daily costs (call this daily)
   */
  resetDailyCosts(): void {
    this.dailyCost = 0;
  }

  /**
   * Reset monthly costs (call this monthly)
   */
  resetMonthlyCosts(): void {
    this.monthlyCost = 0;
  }

  /**
   * Analyze content complexity to determine appropriate model
   */
  private analyzeContentComplexity(content: string): ContentComplexityAnalysis {
    const words = content.toLowerCase().split(/\s+/u);
    const sentences = content
      .split(/[!.?]+/u)
      .filter((s) => s.trim().length > 0);

    // Technical terms detection
    const technicalTerms = [
      "algorithm",
      "ai",
      "machine learning",
      "blockchain",
      "cryptocurrency",
      "quantum",
      "neural network",
      "api",
      "database",
      "server",
      "protocol",
      "framework",
      "architecture",
      "infrastructure",
      "scalability",
      "optimization",
    ];
    const technicalScore =
      (words.filter((word) =>
        technicalTerms.some((term) => word.includes(term))
      ).length /
        words.length) *
      10;

    // Sentence complexity (average words per sentence)
    const avgWordsPerSentence = words.length / sentences.length;
    const complexityScore = Math.min((avgWordsPerSentence - 10) / 5, 10);

    // Topic depth (content length and structure)
    const depthScore = Math.min((content.length / 2000) * 5, 10);

    // Reasoning requirements (questions, conditional statements)
    const reasoningIndicators =
      /"why"|"how"|"what if"|"because"|"therefore"|"however"|"meanwhile"/gi;
    const reasoningMatches = (content.match(reasoningIndicators) || []).length;
    const reasoningScore = Math.min((reasoningMatches / 10) * 10, 10);

    const factors = {
      requiredReasoning: Math.round(reasoningScore),
      sentenceComplexity: Math.round(complexityScore),
      technicalTerms: Math.round(technicalScore),
      topicDepth: Math.round(depthScore),
    };

    const totalScore =
      factors.technicalTerms * 0.3 +
      factors.sentenceComplexity * 0.2 +
      factors.topicDepth * 0.2 +
      factors.requiredReasoning * 0.3;

    let recommendedModel: "gpt-3.5-turbo" | "gpt-4o-mini" | "gpt-4o";
    if (totalScore <= 4) {
      recommendedModel = "gpt-3.5-turbo";
    } else if (totalScore <= 7) {
      recommendedModel = "gpt-4o-mini";
    } else {
      recommendedModel = "gpt-4o";
    }

    return {
      confidence: Math.min(1.0, totalScore / 10),
      factors,
      recommendedModel,
      score: Math.round(totalScore),
    };
  }

  /**
   * Check if we can afford to process with given model
   */
  private checkBudgetConstraints(model: string): {
    canAfford: boolean;
    remainingDaily: number;
    remainingMonthly: number;
  } {
    const estimatedCost = this.estimateCost("average content", model);

    return {
      canAfford:
        this.dailyCost + estimatedCost <= this.budget.daily &&
        this.monthlyCost + estimatedCost <= this.budget.monthly &&
        estimatedCost <= this.budget.perRequest,
      remainingDaily: this.budget.daily - this.dailyCost,
      remainingMonthly: this.budget.monthly - this.monthlyCost,
    };
  }

  /**
   * Create content hash for caching
   */
  private createContentHash(content: string): string {
    return createHash("sha256")
      .update(content.trim().toLowerCase())
      .digest("hex")
      .slice(0, 16);
  }

  /**
   * Estimate cost for processing content with specific model
   */
  private estimateCost(content: string, model: string): number {
    const tokenCount = content.length / 4; // Rough approximation: 4 chars = 1 token

    const pricing = {
      "gpt-3.5-turbo": 0.0005, // per 1K tokens
      "gpt-4o": 0.0025,
      "gpt-4o-mini": 0.00015,
    };

    return (
      (tokenCount / 1000) * (pricing[model as keyof typeof pricing] || 0.001)
    );
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(entry: CacheEntry): boolean {
    return new Date() > entry.metadata.expiresAt;
  }
}
