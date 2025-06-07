/**
 * Unit tests for Cost Optimizer service
 */

import { describe, it, expect, beforeEach } from "vitest";

import { CostOptimizer } from "../../lib/services/ai/cost-optimizer";

describe("CostOptimizer", () => {
  let costOptimizer: CostOptimizer;

  beforeEach(() => {
    costOptimizer = new CostOptimizer();
  });

  describe("Content Processing Optimization", () => {
    it("should optimize processing for simple content", async () => {
      const content = "Simple news: The weather is nice today.";

      const result = await costOptimizer.optimizeProcessing(content);

      expect(result.shouldProcess).toBe(true);
      expect(result.recommendedModel).toBe("gpt-3.5-turbo"); // Simple content
      expect(result.estimatedCost).toBeGreaterThan(0);
      expect(result.qualityTrade).toBeDefined();
    });

    it("should recommend better models for complex content", async () => {
      const content =
        "Complex technical analysis of machine learning algorithms and their optimization in distributed neural network architectures for scalable AI infrastructure.";

      const result = await costOptimizer.optimizeProcessing(content);

      expect(result.shouldProcess).toBe(true);
      expect(["gpt-4o-mini", "gpt-4o"]).toContain(result.recommendedModel);
      expect(result.estimatedCost).toBeGreaterThan(0);
    });

    it("should handle budget constraints", async () => {
      const content = "Test content for budget constraints";

      // Create optimizer with very low budget
      const lowBudgetOptimizer = new CostOptimizer({
        daily: 0.001, // Very low budget
        monthly: 0.01,
        perRequest: 0.0001,
        current: { daily: 0, monthly: 0 },
      });

      const result = await lowBudgetOptimizer.optimizeProcessing(content);

      // Should either not process or recommend cheapest model
      if (!result.shouldProcess) {
        expect(result.reason).toContain("budget");
      } else {
        expect(result.recommendedModel).toBe("gpt-3.5-turbo");
      }
    });
  });

  describe("Caching", () => {
    it("should cache summary results", () => {
      const content = "Test content for caching";
      const summary = "Test summary";
      const metadata = { model: "gpt-4o-mini", cost: 0.01, quality: 0.9 };

      // Should not throw
      expect(() => {
        costOptimizer.cacheSummary(content, summary, metadata);
      }).not.toThrow();
    });

    it("should return cached results for same content", async () => {
      const content = "Cached content test";
      const summary = "Cached summary";
      const metadata = { model: "gpt-4o-mini", cost: 0.01, quality: 0.9 };

      // Cache the result
      costOptimizer.cacheSummary(content, summary, metadata);

      // Should find cached result
      const result = await costOptimizer.optimizeProcessing(content);

      expect(result.shouldProcess).toBe(false);
      expect(result.cacheHit).toBeDefined();
      expect(result.estimatedCost).toBe(0);
    });
  });

  describe("Cost Tracking", () => {
    it("should track costs through caching", () => {
      const metadata = { model: "gpt-4o-mini", cost: 0.05, quality: 0.9 };

      costOptimizer.cacheSummary("test content", "test summary", metadata);

      const costSummary = costOptimizer.getCostSummary();
      expect(costSummary.daily).toBe(0.05);
      expect(costSummary.monthly).toBe(0.05);
      expect(costSummary.budget).toBeDefined();
    });

    it("should reset daily costs", () => {
      const metadata = { model: "gpt-4o-mini", cost: 0.05, quality: 0.9 };
      costOptimizer.cacheSummary("test content", "test summary", metadata);

      costOptimizer.resetDailyCosts();

      const costSummary = costOptimizer.getCostSummary();
      expect(costSummary.daily).toBe(0);
      expect(costSummary.monthly).toBe(0.05); // Should still have monthly
    });

    it("should reset monthly costs", () => {
      const metadata = { model: "gpt-4o-mini", cost: 0.05, quality: 0.9 };
      costOptimizer.cacheSummary("test content", "test summary", metadata);

      costOptimizer.resetMonthlyCosts();

      const costSummary = costOptimizer.getCostSummary();
      expect(costSummary.monthly).toBe(0);
    });
  });
});
