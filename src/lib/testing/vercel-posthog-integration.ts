/**
 * Vercel and PostHog Integration for Synthetic User Testing
 *
 * @business-context Enables automated canary testing on Vercel preview deployments
 *                   with PostHog feature flag control for safe rollouts. Validates
 *                   features before exposing to real users.
 * @decision-date 2024-01-22
 * @decision-by Development team for production-safe feature validation
 */

import { z } from "zod";

import {
  type AutomationConfig,
  CanaryAutomation,
} from "../../tests/synthetic/canary-automation";
import {
  type SyntheticTestReport,
  SyntheticUserTesting,
  SyntheticUserType,
  TestScenario,
} from "./synthetic-users";

/**
 * Vercel deployment context for testing
 */
export interface VercelDeploymentContext {
  branchName: string;
  commitSha: string;
  deploymentId: string;
  deploymentUrl: string;
  environment: "development" | "preview" | "production";
  isCanary: boolean;
}

/**
 * PostHog feature flag configuration for canary testing
 */
export interface PostHogCanaryConfig {
  description: string;
  enabledForSynthetic: boolean;
  flagKey: string;
  rolloutPercentage: number;
  targetGroups: string[];
}

/**
 * Canary validation criteria
 */
export interface CanaryValidationCriteria {
  criticalPaths: string[];
  maxAvgResponseTime: number; // milliseconds
  maxErrorRate: number; // 0-1
  minSuccessRate: number; // 0-1
  minTestDuration: number; // seconds
  requiredScenarios: TestScenario[];
}

/**
 * Canary test result with deployment context
 */
export interface CanaryTestResult {
  deploymentContext: VercelDeploymentContext;
  featureFlags: PostHogCanaryConfig[];
  recommendations: CanaryRecommendation[];
  testReport: SyntheticTestReport;
  timestamp: Date;
  validationResult: CanaryValidationResult;
}

export interface CanaryValidationResult {
  criteria: Record<
    string,
    { passed: boolean; threshold: number; value: number }
  >;
  passed: boolean;
  score: number; // 0-100
  summary: string;
}

export interface CanaryRecommendation {
  action: string;
  flagKey?: string;
  message: string;
  priority: "high" | "low" | "medium";
  type: "investigate" | "optimize" | "rollback" | "rollout";
}

/**
 * Main integration class for Vercel and PostHog synthetic testing
 */
export class VercelPostHogCanaryTesting {
  private canaryAutomation: CanaryAutomation;
  private posthogApiKey: string;
  private posthogProjectId: string;
  private syntheticTesting: SyntheticUserTesting;
  private vercelApiKey: string;

  constructor(config: {
    baseUrl?: string;
    posthogApiKey: string;
    posthogProjectId: string;
    vercelApiKey: string;
  }) {
    this.posthogApiKey = config.posthogApiKey;
    this.posthogProjectId = config.posthogProjectId;
    this.vercelApiKey = config.vercelApiKey;
    this.syntheticTesting = new SyntheticUserTesting(config.baseUrl);
    this.canaryAutomation = new CanaryAutomation({
      baseUrl: config.baseUrl || "http://localhost:3000",
      headless: true,
      recordVideo: false,
      retryAttempts: 2,
      screenshotOnFailure: true,
      slowMo: 0,
      timeout: 30000,
    });
  }

  /**
   * Execute automated canary rollout based on test results
   *
   * @business-context Automatically adjusts feature flag rollout percentages
   *                   based on canary test performance and validation criteria
   */
  async executeAutomatedRollout(
    canaryResult: CanaryTestResult,
    autoRolloutConfig: {
      enabled: boolean;
      incrementPercentage: number;
      maxRolloutPercentage: number;
      rollbackThreshold: number;
    }
  ): Promise<void> {
    if (!autoRolloutConfig.enabled) {
      console.log(
        "🔒 Automated rollout disabled. Manual intervention required."
      );
      return;
    }

    for (const recommendation of canaryResult.recommendations) {
      if (recommendation.type === "rollout" && recommendation.flagKey) {
        const currentFlag = canaryResult.featureFlags.find(
          (f) => f.flagKey === recommendation.flagKey
        );
        if (!currentFlag) continue;

        const newRolloutPercentage = Math.min(
          currentFlag.rolloutPercentage + autoRolloutConfig.incrementPercentage,
          autoRolloutConfig.maxRolloutPercentage
        );

        await this.updateFeatureFlagRollout(
          recommendation.flagKey,
          newRolloutPercentage
        );

        console.log(
          `🎯 Auto-increased rollout for ${recommendation.flagKey}: ` +
            `${currentFlag.rolloutPercentage}% → ${newRolloutPercentage}%`
        );
      } else if (recommendation.type === "rollback" && recommendation.flagKey) {
        await this.updateFeatureFlagRollout(recommendation.flagKey, 0);

        console.log(
          `🛑 Auto-disabled feature flag ${recommendation.flagKey} due to poor performance`
        );
      }
    }
  }

  /**
   * Execute comprehensive canary testing for a Vercel deployment
   *
   * @business-context Automatically validates new deployments with synthetic users
   *                   before exposing features to real users via feature flags
   */
  async executeCanaryTesting(
    deploymentContext: VercelDeploymentContext,
    featureFlags: PostHogCanaryConfig[],
    criteria: CanaryValidationCriteria
  ): Promise<CanaryTestResult> {
    console.log(
      `🚀 Starting canary testing for deployment: ${deploymentContext.deploymentId}`
    );

    // 1. Setup synthetic users for the deployment
    this.syntheticTesting = new SyntheticUserTesting(
      deploymentContext.deploymentUrl
    );
    this.syntheticTesting.createStandardUserProfiles();

    // 2. Configure PostHog feature flags for synthetic testing
    await this.configureFeatureFlagsForTesting(featureFlags);

    // 3. Execute synthetic user tests
    const testStart = Date.now();
    const testResults = await this.syntheticTesting.executeAllUserTests();
    const testDuration = Date.now() - testStart;

    // 4. Run browser automation tests
    await this.canaryAutomation.executeAutomatedTests(["chromium"]);

    // 5. Generate comprehensive test report
    const testReport = this.syntheticTesting.generateReport();

    // 6. Validate against criteria
    const validationResult = this.validateCanaryResults(
      testReport,
      criteria,
      testDuration
    );

    // 7. Generate recommendations
    const recommendations = this.generateCanaryRecommendations(
      validationResult,
      featureFlags,
      deploymentContext
    );

    // 8. Send results to PostHog for monitoring
    await this.reportCanaryResultsToPostHog({
      deploymentContext,
      featureFlags,
      testReport,
      validationResult,
    });

    const result: CanaryTestResult = {
      deploymentContext,
      featureFlags,
      recommendations,
      testReport,
      timestamp: new Date(),
      validationResult,
    };

    console.log(
      `✅ Canary testing completed. Score: ${validationResult.score}/100`
    );

    return result;
  }

  /**
   * Get deployment context from Vercel API
   */
  async getVercelDeploymentContext(
    deploymentId: string
  ): Promise<VercelDeploymentContext> {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.vercelApiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Vercel deployment: ${response.statusText}`
      );
    }

    const deployment = await response.json();

    return {
      branchName: deployment.meta?.githubCommitRef || "unknown",
      commitSha: deployment.meta?.githubCommitSha || "unknown",
      deploymentId: deployment.uid,
      deploymentUrl: deployment.url,
      environment: deployment.target || "preview",
      isCanary: deployment.meta?.canary || false,
    };
  }

  /**
   * Configure PostHog feature flags specifically for synthetic user testing
   *
   * @business-context Ensures synthetic users get proper feature flag values
   *                   for comprehensive testing without affecting real users
   */
  private async configureFeatureFlagsForTesting(
    flags: PostHogCanaryConfig[]
  ): Promise<void> {
    for (const flag of flags) {
      if (!flag.enabledForSynthetic) continue;

      try {
        // Create or update feature flag for synthetic testing
        await this.updatePostHogFeatureFlag({
          filters: {
            groups: [
              {
                properties: [
                  {
                    key: "email",
                    operator: "icontains",
                    value: "@synthetic.morning-pod.com", // Synthetic user emails
                  },
                ],
                rollout_percentage: 100, // Always enabled for synthetic users
              },
              {
                properties: [], // Real users
                rollout_percentage: flag.rolloutPercentage,
              },
            ],
          },
          key: flag.flagKey,
          name: `Canary: ${flag.description}`,
        });

        console.log(
          `🎯 Configured feature flag: ${flag.flagKey} (${flag.rolloutPercentage}% rollout)`
        );
      } catch (error) {
        console.error(
          `❌ Failed to configure feature flag ${flag.flagKey}:`,
          error
        );
      }
    }
  }

  /**
   * Generate actionable recommendations based on canary results
   */
  private generateCanaryRecommendations(
    validation: CanaryValidationResult,
    flags: PostHogCanaryConfig[],
    deployment: VercelDeploymentContext
  ): CanaryRecommendation[] {
    const recommendations: CanaryRecommendation[] = [];

    if (validation.passed && validation.score >= 90) {
      recommendations.push({
        action: "Increase feature flag rollout to 50-100%",
        flagKey: flags[0]?.flagKey,
        message: "Excellent canary results. Safe to increase rollout.",
        priority: "high",
        type: "rollout",
      });
    } else if (validation.passed && validation.score >= 80) {
      recommendations.push({
        action: "Increase feature flag rollout to 25-50%",
        flagKey: flags[0]?.flagKey,
        message: "Good canary results. Gradual rollout recommended.",
        priority: "medium",
        type: "rollout",
      });
    } else if (validation.score < 60) {
      recommendations.push({
        action: "Disable feature flags and investigate issues",
        flagKey: flags[0]?.flagKey,
        message: "Poor canary results. Immediate attention required.",
        priority: "high",
        type: "rollback",
      });
    } else {
      recommendations.push({
        action: "Review detailed test results and fix identified issues",
        message: "Mixed canary results. Further investigation needed.",
        priority: "medium",
        type: "investigate",
      });
    }

    // Performance-specific recommendations
    if (!validation.criteria.avgResponseTime.passed) {
      recommendations.push({
        action: "Optimize slow endpoints and review resource usage",
        message: "Performance issues detected in canary testing.",
        priority: "high",
        type: "optimize",
      });
    }

    // Error rate recommendations
    if (!validation.criteria.errorRate.passed) {
      recommendations.push({
        action: "Review error logs and fix critical bugs before rollout",
        message: "High error rate detected in canary testing.",
        priority: "high",
        type: "investigate",
      });
    }

    return recommendations;
  }

  /**
   * Report canary testing results to PostHog for monitoring and analysis
   */
  private async reportCanaryResultsToPostHog(data: {
    deploymentContext: VercelDeploymentContext;
    featureFlags: PostHogCanaryConfig[];
    testReport: SyntheticTestReport;
    validationResult: CanaryValidationResult;
  }): Promise<void> {
    try {
      const event = {
        distinct_id: `deployment_${data.deploymentContext.deploymentId}`,
        event: "canary_test_completed",
        properties: {
          avg_duration: data.testReport.summary.averageDuration,
          branch_name: data.deploymentContext.branchName,
          commit_sha: data.deploymentContext.commitSha,
          deployment_id: data.deploymentContext.deploymentId,
          deployment_url: data.deploymentContext.deploymentUrl,
          environment: data.deploymentContext.environment,
          failed_tests: data.testReport.summary.failedTests,
          feature_flags: data.featureFlags.map((f) => f.flagKey),
          is_canary: data.deploymentContext.isCanary,
          success_rate: data.testReport.summary.successRate,
          test_passed: data.validationResult.passed,
          test_score: data.validationResult.score,
          timestamp: new Date().toISOString(),
          total_tests: data.testReport.summary.totalTests,
        },
      };

      // Send to PostHog via API
      await this.sendEventToPostHog(event);

      console.log("📊 Canary results reported to PostHog for monitoring");
    } catch (error) {
      console.error("❌ Failed to report canary results to PostHog:", error);
    }
  }

  /**
   * Send event to PostHog for tracking
   */
  private async sendEventToPostHog(event: any): Promise<void> {
    const response = await fetch("https://app.posthog.com/capture/", {
      body: JSON.stringify({
        api_key: this.posthogApiKey,
        distinct_id: event.distinct_id,
        event: event.event,
        properties: event.properties,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send event to PostHog: ${response.statusText}`
      );
    }
  }

  /**
   * Update feature flag rollout percentage
   */
  private async updateFeatureFlagRollout(
    flagKey: string,
    percentage: number
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://app.posthog.com/api/projects/${this.posthogProjectId}/feature_flags/${flagKey}/`,
        {
          body: JSON.stringify({
            filters: {
              groups: [
                {
                  properties: [],
                  rollout_percentage: percentage,
                },
              ],
            },
          }),
          headers: {
            Authorization: `Bearer ${this.posthogApiKey}`,
            "Content-Type": "application/json",
          },
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update feature flag rollout: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error(`❌ Failed to update rollout for ${flagKey}:`, error);
    }
  }

  /**
   * Update PostHog feature flag configuration
   */
  private async updatePostHogFeatureFlag(config: {
    filters: any;
    key: string;
    name: string;
  }): Promise<void> {
    const response = await fetch(
      `https://app.posthog.com/api/projects/${this.posthogProjectId}/feature_flags/`,
      {
        body: JSON.stringify({
          active: true,
          filters: config.filters,
          key: config.key,
          name: config.name,
        }),
        headers: {
          Authorization: `Bearer ${this.posthogApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update PostHog feature flag: ${response.statusText}`
      );
    }
  }

  /**
   * Validate canary test results against defined criteria
   */
  private validateCanaryResults(
    report: SyntheticTestReport,
    criteria: CanaryValidationCriteria,
    testDuration: number
  ): CanaryValidationResult {
    const validations = {
      avgResponseTime: {
        passed: report.summary.averageDuration <= criteria.maxAvgResponseTime,
        threshold: criteria.maxAvgResponseTime,
        value: report.summary.averageDuration,
      },
      errorRate: {
        passed: 1 - report.summary.successRate <= criteria.maxErrorRate,
        threshold: criteria.maxErrorRate,
        value: 1 - report.summary.successRate,
      },
      requiredScenarios: {
        passed: criteria.requiredScenarios.every(
          (scenario) => report.scenarioBreakdown[scenario]?.total > 0
        ),
        threshold: criteria.requiredScenarios.length,
        value: Object.keys(report.scenarioBreakdown).length,
      },
      successRate: {
        passed: report.summary.successRate >= criteria.minSuccessRate,
        threshold: criteria.minSuccessRate,
        value: report.summary.successRate,
      },
      testDuration: {
        passed: testDuration >= criteria.minTestDuration * 1000,
        threshold: criteria.minTestDuration * 1000,
        value: testDuration,
      },
    };

    const passedCount = Object.values(validations).filter(
      (v) => v.passed
    ).length;
    const totalCount = Object.keys(validations).length;
    const score = Math.round((passedCount / totalCount) * 100);
    const passed = score >= 80; // 80% threshold for canary approval

    return {
      criteria: validations,
      passed,
      score,
      summary: passed
        ? `✅ Canary validation passed (${score}/100). Safe to rollout.`
        : `⚠️ Canary validation failed (${score}/100). Review required.`,
    };
  }
}

/**
 * Factory function for easy instantiation with environment variables
 */
export function createVercelPostHogCanaryTesting(
  baseUrl?: string
): VercelPostHogCanaryTesting {
  const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const posthogProjectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
  const vercelApiKey = process.env.VERCEL_API_KEY;

  if (!posthogApiKey) {
    throw new Error(
      "POSTHOG_PERSONAL_API_KEY environment variable is required"
    );
  }
  if (!posthogProjectId) {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_ID environment variable is required"
    );
  }
  if (!vercelApiKey) {
    throw new Error("VERCEL_API_KEY environment variable is required");
  }

  return new VercelPostHogCanaryTesting({
    baseUrl,
    posthogApiKey,
    posthogProjectId,
    vercelApiKey,
  });
}

/**
 * Quick canary validation for CI/CD pipelines
 *
 * @business-context Provides a simple interface for GitHub Actions to validate
 *                   deployments before promoting them to production
 */
export async function runQuickCanaryValidation(
  deploymentUrl: string,
  featureFlags: PostHogCanaryConfig[] = []
): Promise<{ passed: boolean; score: number; summary: string }> {
  const canaryTesting = createVercelPostHogCanaryTesting(deploymentUrl);

  const deploymentContext: VercelDeploymentContext = {
    branchName: process.env.GITHUB_HEAD_REF || "main",
    commitSha: process.env.GITHUB_SHA || "unknown",
    deploymentId: "quick-validation",
    deploymentUrl,
    environment: "preview",
    isCanary: true,
  };

  const criteria: CanaryValidationCriteria = {
    criticalPaths: ["/episodes", "/queue", "/sources"],
    maxAvgResponseTime: 5000,
    maxErrorRate: 0.05,
    minSuccessRate: 0.95,
    minTestDuration: 30,
    requiredScenarios: [
      TestScenario.NAVIGATION_FLOW,
      TestScenario.EPISODE_GENERATION,
      TestScenario.AUDIO_PLAYBACK,
    ],
  };

  const result = await canaryTesting.executeCanaryTesting(
    deploymentContext,
    featureFlags,
    criteria
  );

  return {
    passed: result.validationResult.passed,
    score: result.validationResult.score,
    summary: result.validationResult.summary,
  };
}
