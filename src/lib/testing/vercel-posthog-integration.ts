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
  SyntheticUserTesting,
  TestScenario,
  SyntheticUserType,
  type SyntheticTestReport,
} from "./synthetic-users";
import {
  CanaryAutomation,
  type AutomationConfig,
} from "../../tests/synthetic/canary-automation";

/**
 * Vercel deployment context for testing
 */
export interface VercelDeploymentContext {
  deploymentUrl: string;
  deploymentId: string;
  branchName: string;
  commitSha: string;
  environment: "preview" | "production" | "development";
  isCanary: boolean;
}

/**
 * PostHog feature flag configuration for canary testing
 */
export interface PostHogCanaryConfig {
  flagKey: string;
  rolloutPercentage: number;
  targetGroups: string[];
  description: string;
  enabledForSynthetic: boolean;
}

/**
 * Canary validation criteria
 */
export interface CanaryValidationCriteria {
  minSuccessRate: number; // 0-1
  maxErrorRate: number; // 0-1
  maxAvgResponseTime: number; // milliseconds
  minTestDuration: number; // seconds
  requiredScenarios: TestScenario[];
  criticalPaths: string[];
}

/**
 * Canary test result with deployment context
 */
export interface CanaryTestResult {
  deploymentContext: VercelDeploymentContext;
  featureFlags: PostHogCanaryConfig[];
  testReport: SyntheticTestReport;
  validationResult: CanaryValidationResult;
  timestamp: Date;
  recommendations: CanaryRecommendation[];
}

export interface CanaryValidationResult {
  passed: boolean;
  score: number; // 0-100
  criteria: Record<
    string,
    { passed: boolean; value: number; threshold: number }
  >;
  summary: string;
}

export interface CanaryRecommendation {
  type: "rollout" | "rollback" | "investigate" | "optimize";
  priority: "high" | "medium" | "low";
  message: string;
  action: string;
  flagKey?: string;
}

/**
 * Main integration class for Vercel and PostHog synthetic testing
 */
export class VercelPostHogCanaryTesting {
  private syntheticTesting: SyntheticUserTesting;
  private canaryAutomation: CanaryAutomation;
  private posthogApiKey: string;
  private posthogProjectId: string;
  private vercelApiKey: string;

  constructor(config: {
    posthogApiKey: string;
    posthogProjectId: string;
    vercelApiKey: string;
    baseUrl?: string;
  }) {
    this.posthogApiKey = config.posthogApiKey;
    this.posthogProjectId = config.posthogProjectId;
    this.vercelApiKey = config.vercelApiKey;
    this.syntheticTesting = new SyntheticUserTesting(config.baseUrl);
    this.canaryAutomation = new CanaryAutomation({
      headless: true,
      baseUrl: config.baseUrl || "http://localhost:3000",
      timeout: 30000,
      screenshotOnFailure: true,
      recordVideo: false,
      slowMo: 0,
      retryAttempts: 2,
    });
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
      testReport,
      validationResult,
      featureFlags,
    });

    const result: CanaryTestResult = {
      deploymentContext,
      featureFlags,
      testReport,
      validationResult,
      timestamp: new Date(),
      recommendations,
    };

    console.log(
      `✅ Canary testing completed. Score: ${validationResult.score}/100`
    );

    return result;
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
          key: flag.flagKey,
          name: `Canary: ${flag.description}`,
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
   * Validate canary test results against defined criteria
   */
  private validateCanaryResults(
    report: SyntheticTestReport,
    criteria: CanaryValidationCriteria,
    testDuration: number
  ): CanaryValidationResult {
    const validations = {
      successRate: {
        passed: report.summary.successRate >= criteria.minSuccessRate,
        value: report.summary.successRate,
        threshold: criteria.minSuccessRate,
      },
      errorRate: {
        passed: 1 - report.summary.successRate <= criteria.maxErrorRate,
        value: 1 - report.summary.successRate,
        threshold: criteria.maxErrorRate,
      },
      avgResponseTime: {
        passed: report.summary.averageDuration <= criteria.maxAvgResponseTime,
        value: report.summary.averageDuration,
        threshold: criteria.maxAvgResponseTime,
      },
      testDuration: {
        passed: testDuration >= criteria.minTestDuration * 1000,
        value: testDuration,
        threshold: criteria.minTestDuration * 1000,
      },
      requiredScenarios: {
        passed: criteria.requiredScenarios.every(
          (scenario) => report.scenarioBreakdown[scenario]?.total > 0
        ),
        value: Object.keys(report.scenarioBreakdown).length,
        threshold: criteria.requiredScenarios.length,
      },
    };

    const passedCount = Object.values(validations).filter(
      (v) => v.passed
    ).length;
    const totalCount = Object.keys(validations).length;
    const score = Math.round((passedCount / totalCount) * 100);
    const passed = score >= 80; // 80% threshold for canary approval

    return {
      passed,
      score,
      criteria: validations,
      summary: passed
        ? `✅ Canary validation passed (${score}/100). Safe to rollout.`
        : `⚠️ Canary validation failed (${score}/100). Review required.`,
    };
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
        type: "rollout",
        priority: "high",
        message: "Excellent canary results. Safe to increase rollout.",
        action: "Increase feature flag rollout to 50-100%",
        flagKey: flags[0]?.flagKey,
      });
    } else if (validation.passed && validation.score >= 80) {
      recommendations.push({
        type: "rollout",
        priority: "medium",
        message: "Good canary results. Gradual rollout recommended.",
        action: "Increase feature flag rollout to 25-50%",
        flagKey: flags[0]?.flagKey,
      });
    } else if (validation.score < 60) {
      recommendations.push({
        type: "rollback",
        priority: "high",
        message: "Poor canary results. Immediate attention required.",
        action: "Disable feature flags and investigate issues",
        flagKey: flags[0]?.flagKey,
      });
    } else {
      recommendations.push({
        type: "investigate",
        priority: "medium",
        message: "Mixed canary results. Further investigation needed.",
        action: "Review detailed test results and fix identified issues",
      });
    }

    // Performance-specific recommendations
    if (!validation.criteria.avgResponseTime.passed) {
      recommendations.push({
        type: "optimize",
        priority: "high",
        message: "Performance issues detected in canary testing.",
        action: "Optimize slow endpoints and review resource usage",
      });
    }

    // Error rate recommendations
    if (!validation.criteria.errorRate.passed) {
      recommendations.push({
        type: "investigate",
        priority: "high",
        message: "High error rate detected in canary testing.",
        action: "Review error logs and fix critical bugs before rollout",
      });
    }

    return recommendations;
  }

  /**
   * Report canary testing results to PostHog for monitoring and analysis
   */
  private async reportCanaryResultsToPostHog(data: {
    deploymentContext: VercelDeploymentContext;
    testReport: SyntheticTestReport;
    validationResult: CanaryValidationResult;
    featureFlags: PostHogCanaryConfig[];
  }): Promise<void> {
    try {
      const event = {
        event: "canary_test_completed",
        distinct_id: `deployment_${data.deploymentContext.deploymentId}`,
        properties: {
          deployment_id: data.deploymentContext.deploymentId,
          deployment_url: data.deploymentContext.deploymentUrl,
          branch_name: data.deploymentContext.branchName,
          commit_sha: data.deploymentContext.commitSha,
          environment: data.deploymentContext.environment,
          is_canary: data.deploymentContext.isCanary,
          test_score: data.validationResult.score,
          test_passed: data.validationResult.passed,
          success_rate: data.testReport.summary.successRate,
          total_tests: data.testReport.summary.totalTests,
          failed_tests: data.testReport.summary.failedTests,
          avg_duration: data.testReport.summary.averageDuration,
          feature_flags: data.featureFlags.map((f) => f.flagKey),
          timestamp: new Date().toISOString(),
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
   * Update PostHog feature flag configuration
   */
  private async updatePostHogFeatureFlag(config: {
    key: string;
    name: string;
    filters: any;
  }): Promise<void> {
    const response = await fetch(
      `https://app.posthog.com/api/projects/${this.posthogProjectId}/feature_flags/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.posthogApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: config.key,
          name: config.name,
          filters: config.filters,
          active: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update PostHog feature flag: ${response.statusText}`
      );
    }
  }

  /**
   * Send event to PostHog for tracking
   */
  private async sendEventToPostHog(event: any): Promise<void> {
    const response = await fetch("https://app.posthog.com/capture/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: this.posthogApiKey,
        event: event.event,
        properties: event.properties,
        distinct_id: event.distinct_id,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send event to PostHog: ${response.statusText}`
      );
    }
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
      maxRolloutPercentage: number;
      incrementPercentage: number;
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
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.posthogApiKey}`,
            "Content-Type": "application/json",
          },
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
      deploymentUrl: deployment.url,
      deploymentId: deployment.uid,
      branchName: deployment.meta?.githubCommitRef || "unknown",
      commitSha: deployment.meta?.githubCommitSha || "unknown",
      environment: deployment.target || "preview",
      isCanary: deployment.meta?.canary || false,
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
    posthogApiKey,
    posthogProjectId,
    vercelApiKey,
    baseUrl,
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
    deploymentUrl,
    deploymentId: "quick-validation",
    branchName: process.env.GITHUB_HEAD_REF || "main",
    commitSha: process.env.GITHUB_SHA || "unknown",
    environment: "preview",
    isCanary: true,
  };

  const criteria: CanaryValidationCriteria = {
    minSuccessRate: 0.95,
    maxErrorRate: 0.05,
    maxAvgResponseTime: 5000,
    minTestDuration: 30,
    requiredScenarios: [
      TestScenario.NAVIGATION_FLOW,
      TestScenario.EPISODE_GENERATION,
      TestScenario.AUDIO_PLAYBACK,
    ],
    criticalPaths: ["/episodes", "/queue", "/sources"],
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
