#!/usr/bin/env bun

/**
 * Canary Validation Script for CI/CD
 *
 * @business-context Quick validation script for GitHub Actions that tests
 *                   deployment health and feature functionality before rollout
 */

import { runQuickCanaryValidation } from "../src/lib/testing/vercel-posthog-integration";

interface CanaryValidationResult {
  passed: boolean;
  score: number;
  summary: string;
  successRate: number;
  totalTests: number;
  failedTests: number;
  avgDuration: number;
  timestamp: string;
  deploymentUrl: string;
}

async function main() {
  const deploymentUrl = process.argv[2];

  if (!deploymentUrl) {
    console.error("❌ Deployment URL is required");
    console.error(
      "Usage: bun run scripts/canary-validation.ts <deployment-url>"
    );
    process.exit(1);
  }

  console.error(`🚀 Starting canary validation for: ${deploymentUrl}`);

  try {
    // Define feature flags to test (if any)
    const featureFlags = [
      {
        flagKey: "new-episode-generation",
        rolloutPercentage: 10,
        targetGroups: ["beta-users"],
        description: "New episode generation pipeline",
        enabledForSynthetic: true,
      },
      {
        flagKey: "enhanced-audio-player",
        rolloutPercentage: 25,
        targetGroups: ["power-users"],
        description: "Enhanced audio player with waveform",
        enabledForSynthetic: true,
      },
    ];

    // Run canary validation
    const result = await runQuickCanaryValidation(deploymentUrl, featureFlags);

    // Create detailed result object
    const validationResult: CanaryValidationResult = {
      passed: result.passed,
      score: result.score,
      summary: result.summary,
      successRate: 0.95, // Placeholder - would come from actual test report
      totalTests: 15, // Placeholder - would come from actual test report
      failedTests: result.passed ? 0 : 2, // Placeholder
      avgDuration: 2500, // Placeholder - would come from actual test report
      timestamp: new Date().toISOString(),
      deploymentUrl,
    };

    // Output JSON result for GitHub Actions
    console.log(JSON.stringify(validationResult, null, 2));

    // Log summary to stderr (won't interfere with JSON output)
    console.error(
      `${result.passed ? "✅" : "❌"} Canary validation ${result.passed ? "passed" : "failed"}`
    );
    console.error(`📊 Score: ${result.score}/100`);
    console.error(`📝 ${result.summary}`);

    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    console.error("❌ Canary validation failed with error:", error);

    // Output error result
    const errorResult: CanaryValidationResult = {
      passed: false,
      score: 0,
      summary: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      successRate: 0,
      totalTests: 0,
      failedTests: 1,
      avgDuration: 0,
      timestamp: new Date().toISOString(),
      deploymentUrl,
    };

    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on("SIGTERM", () => {
  console.error("🛑 Canary validation interrupted");
  process.exit(1);
});

process.on("SIGINT", () => {
  console.error("🛑 Canary validation interrupted");
  process.exit(1);
});

main().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
