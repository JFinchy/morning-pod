import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  VercelPostHogCanaryTesting,
  runQuickCanaryValidation,
} from "../../../../lib/testing/vercel-posthog-integration";

/**
 * Canary Test Trigger API Endpoint
 *
 * @business-context Allows manual triggering of canary tests for deployment validation
 *                   and automated feature flag rollouts based on test results
 */

const triggerRequestSchema = z.object({
  deploymentUrl: z.string().url("Invalid deployment URL"),
  branchName: z.string().min(1, "Branch name is required"),
  featureFlags: z
    .array(
      z.object({
        flagKey: z.string(),
        rolloutPercentage: z.number().min(0).max(100),
        targetGroups: z.array(z.string()),
        description: z.string(),
        enabledForSynthetic: z.boolean().default(true),
      })
    )
    .optional()
    .default([]),
  testConfig: z
    .object({
      minDuration: z.number().default(5), // minutes
      maxFailureRate: z.number().default(0.05), // 5%
      requiredScenarios: z
        .array(z.string())
        .default(["EPISODE_GENERATION", "AUDIO_PLAYBACK", "NAVIGATION_FLOW"]),
      rolloutStrategy: z
        .enum(["conservative", "aggressive", "instant"])
        .default("conservative"),
    })
    .optional()
    .default({}),
});

type TriggerRequest = z.infer<typeof triggerRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = triggerRequestSchema.parse(body);

    // Validate environment variables
    const requiredEnvVars = {
      POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
      NEXT_PUBLIC_POSTHOG_PROJECT_ID:
        process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID,
      VERCEL_API_KEY: process.env.VERCEL_API_KEY,
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          missing: missingEnvVars,
        },
        { status: 500 }
      );
    }

    // Initialize integration
    const integration = new VercelPostHogCanaryTesting({
      posthogApiKey: requiredEnvVars.POSTHOG_PERSONAL_API_KEY!,
      posthogProjectId: requiredEnvVars.NEXT_PUBLIC_POSTHOG_PROJECT_ID!,
      vercelApiKey: requiredEnvVars.VERCEL_API_KEY!,
      baseUrl: validatedData.deploymentUrl,
    });

    // Generate test ID for tracking
    const testId = `canary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Start canary testing
    console.log(
      `🚀 Starting canary test ${testId} for ${validatedData.deploymentUrl}`
    );

    const testResult = await runCanaryTest(integration, validatedData, testId);

    // Return immediate response while continuing processing in background
    const response = {
      testId,
      status: "initiated",
      deploymentUrl: validatedData.deploymentUrl,
      branchName: validatedData.branchName,
      featureFlags: validatedData.featureFlags,
      testConfig: validatedData.testConfig,
      timestamp: new Date().toISOString(),
      estimatedDuration: `${validatedData.testConfig.minDuration || 5} minutes`,
      monitoringUrl: `/api/canary/status/${testId}`,
    };

    // Process test results in background
    processTestResultsInBackground(
      integration,
      testResult,
      validatedData,
      testId
    );

    return NextResponse.json(response, { status: 202 }); // Accepted
  } catch (error) {
    console.error("❌ Canary test trigger failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function runCanaryTest(
  integration: VercelPostHogCanaryTesting,
  config: TriggerRequest,
  testId: string
) {
  try {
    // Run quick canary validation
    const result = await runQuickCanaryValidation(
      config.deploymentUrl,
      config.featureFlags
    );

    console.log(
      `📊 Canary test ${testId} completed: ${result.passed ? "PASSED" : "FAILED"} (${result.score}/100)`
    );

    return {
      ...result,
      testId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ Canary test ${testId} failed:`, error);

    return {
      passed: false,
      score: 0,
      summary: `Test execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      testId,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function processTestResultsInBackground(
  integration: VercelPostHogCanaryTesting,
  testResult: any,
  config: TriggerRequest,
  testId: string
) {
  try {
    console.log(`🔄 Processing test results for ${testId} in background`);

    if (testResult.passed && testResult.score >= 85) {
      // Trigger automated rollout
      console.log(
        `🎯 Test passed with score ${testResult.score}/100. Starting automated rollout...`
      );

      await triggerAutomatedRollout(integration, config, testResult);
    } else {
      // Log failure and potentially trigger alerts
      console.log(
        `❌ Test failed with score ${testResult.score}/100. No rollout will be performed.`
      );

      await logTestFailure(testId, testResult, config);
    }
  } catch (error) {
    console.error(`💥 Background processing failed for ${testId}:`, error);
  }
}

async function triggerAutomatedRollout(
  integration: VercelPostHogCanaryTesting,
  config: TriggerRequest,
  testResult: any
) {
  try {
    // Determine rollout strategy based on test score
    const strategy = config.testConfig.rolloutStrategy || "conservative";

    console.log(`🚀 Starting ${strategy} rollout for ${config.branchName}`);

    // Mock automated rollout - would trigger actual rollout process
    const rolloutSteps = getRolloutSteps(strategy, testResult.score);

    for (const step of rolloutSteps) {
      console.log(`📈 Rolling out to ${step.percentage}% of users`);

      // Update feature flags
      for (const flag of config.featureFlags) {
        console.log(`  🎯 ${flag.flagKey}: ${step.percentage}%`);

        // Mock flag update - would use actual PostHog API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Monitor for the duration
      if (step.duration > 0) {
        console.log(`⏱️ Monitoring for ${step.duration} minutes...`);
        await new Promise((resolve) =>
          setTimeout(resolve, step.duration * 60 * 1000)
        );
      }
    }

    console.log("✅ Automated rollout completed successfully");
  } catch (error) {
    console.error("❌ Automated rollout failed:", error);
    throw error;
  }
}

async function logTestFailure(
  testId: string,
  testResult: any,
  config: TriggerRequest
) {
  // Log test failure for analysis
  console.log(`📝 Logging test failure for ${testId}`);

  const failureLog = {
    testId,
    deploymentUrl: config.deploymentUrl,
    branchName: config.branchName,
    score: testResult.score,
    summary: testResult.summary,
    error: testResult.error,
    timestamp: new Date().toISOString(),
    featureFlags: config.featureFlags,
  };

  // In a real implementation, this would be stored in a database
  console.log("Failure log:", JSON.stringify(failureLog, null, 2));
}

function getRolloutSteps(strategy: string, score: number) {
  if (strategy === "conservative" || score < 90) {
    return [
      { percentage: 5, duration: 15 },
      { percentage: 10, duration: 15 },
      { percentage: 25, duration: 30 },
      { percentage: 50, duration: 30 },
      { percentage: 100, duration: 0 },
    ];
  }

  if (strategy === "aggressive" && score >= 95) {
    return [
      { percentage: 10, duration: 10 },
      { percentage: 50, duration: 15 },
      { percentage: 100, duration: 0 },
    ];
  }

  if (strategy === "instant" && score >= 98) {
    return [{ percentage: 100, duration: 0 }];
  }

  // Default to conservative
  return getRolloutSteps("conservative", score);
}

export async function GET(request: NextRequest) {
  // Get current canary test status
  const { searchParams } = new URL(request.url);
  const testId = searchParams.get("testId");

  if (!testId) {
    return NextResponse.json(
      { error: "testId parameter is required" },
      { status: 400 }
    );
  }

  // Mock status response - would query actual test status
  const mockStatus = {
    testId,
    status: "completed",
    result: {
      passed: true,
      score: 92,
      summary: "All tests passed successfully",
    },
    rollout: {
      status: "in-progress",
      currentPercentage: 25,
      targetPercentage: 100,
      nextStep: "2024-01-22T15:30:00Z",
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(mockStatus);
}
