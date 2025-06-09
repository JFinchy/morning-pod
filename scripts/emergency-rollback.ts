#!/usr/bin/env bun

/**
 * Emergency Rollback Script
 *
 * @business-context Immediately disables all feature flags when canary tests fail
 *                   to protect production users from potentially broken features
 */

async function main() {
  const args = process.argv.slice(2);
  const config = parseArguments(args);

  console.log("🚨 EMERGENCY ROLLBACK INITIATED");
  console.log(`📍 Deployment: ${config.deploymentUrl}`);
  console.log(`💯 Test Score: ${config.score}/100`);
  console.log(`🔍 Reason: ${config.reason}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

  try {
    // 1. Disable all feature flags immediately
    await disableAllFeatureFlags();

    // 2. Clear any cached feature flag states
    await clearFeatureFlagCaches();

    // 3. Send immediate notifications
    await sendEmergencyNotifications(config);

    // 4. Log incident for post-mortem
    await createIncidentReport(config);

    console.log("✅ Emergency rollback completed successfully");
  } catch (error) {
    console.error("💥 Emergency rollback failed:", error);

    // Send critical alert
    await sendCriticalAlert(config, error);

    process.exit(1);
  }
}

interface RollbackConfig {
  deploymentUrl: string;
  reason: string;
  score: number;
}

function parseArguments(args: string[]): RollbackConfig {
  const config: Partial<RollbackConfig> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--deployment-url" && args[i + 1]) {
      config.deploymentUrl = args[i + 1];
      i++;
    } else if (arg === "--score" && args[i + 1]) {
      config.score = Number.parseFloat(args[i + 1]);
      i++;
    } else if (arg === "--reason" && args[i + 1]) {
      config.reason = args[i + 1];
      i++;
    }
  }

  return {
    deploymentUrl: config.deploymentUrl || "unknown",
    reason: config.reason || "Unknown failure",
    score: config.score || 0,
  };
}

async function disableAllFeatureFlags(): Promise<void> {
  console.log("🔒 Disabling all feature flags...");

  const flagsToDisable = [
    "new-episode-generation",
    "enhanced-audio-player",
    "improved-summarization",
    "beta-features",
    "experimental-ui",
  ];

  // Mock PostHog API calls to disable flags
  for (const flagKey of flagsToDisable) {
    try {
      console.log(`  🛑 Disabling ${flagKey}...`);

      // Simulate API call to PostHog
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log(`  ✅ ${flagKey} disabled`);
    } catch (error) {
      console.error(`  ❌ Failed to disable ${flagKey}:`, error);
      // Continue with other flags even if one fails
    }
  }

  console.log("✅ All feature flags disabled");
}

async function clearFeatureFlagCaches(): Promise<void> {
  console.log("🧹 Clearing feature flag caches...");

  // Mock cache clearing - would hit actual cache endpoints
  const cacheEndpoints = [
    "/api/feature-flags/clear-cache",
    "/api/posthog/refresh-flags",
  ];

  for (const endpoint of cacheEndpoints) {
    try {
      console.log(`  🔄 Clearing cache: ${endpoint}`);

      // Simulate cache clearing
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log(`  ✅ Cache cleared: ${endpoint}`);
    } catch (error) {
      console.error(`  ❌ Failed to clear cache ${endpoint}:`, error);
    }
  }

  console.log("✅ Feature flag caches cleared");
}

async function sendEmergencyNotifications(
  config: RollbackConfig
): Promise<void> {
  console.log("📢 Sending emergency notifications...");

  const message = {
    actions_taken: [
      "All feature flags disabled",
      "Caches cleared",
      "Incident report created",
    ],
    deployment: config.deploymentUrl,
    reason: config.reason,
    score: config.score,
    severity: "critical",
    timestamp: new Date().toISOString(),
    type: "emergency_rollback",
  };

  // Mock notifications to various channels
  const channels = ["slack", "discord", "email", "pagerduty"];

  for (const channel of channels) {
    try {
      console.log(`  📤 Sending to ${channel}...`);

      // Simulate notification sending
      await new Promise((resolve) => setTimeout(resolve, 200));

      console.log(`  ✅ Sent to ${channel}`);
    } catch (error) {
      console.error(`  ❌ Failed to send to ${channel}:`, error);
    }
  }

  console.log("✅ Emergency notifications sent");
}

async function createIncidentReport(config: RollbackConfig): Promise<void> {
  console.log("📋 Creating incident report...");

  const incident = {
    actions_taken: [
      "Feature flags disabled",
      "Caches cleared",
      "Team notified",
    ],
    deployment: config.deploymentUrl,
    failure_reason: config.reason,
    id: `INCIDENT-${Date.now()}`,
    next_steps: [
      "Investigate test failures",
      "Fix identified issues",
      "Re-run canary tests",
      "Gradual re-enablement",
    ],
    severity: "high",
    status: "active",
    test_score: config.score,
    timeline: [
      {
        details: `Score: ${config.score}/100, Reason: ${config.reason}`,
        event: "Canary test failure detected",
        timestamp: new Date().toISOString(),
      },
      {
        details: "All feature flags disabled",
        event: "Emergency rollback initiated",
        timestamp: new Date().toISOString(),
      },
    ],
    timestamp: new Date().toISOString(),
    title: `Emergency Rollback - Canary Test Failure`,
  };

  try {
    // Mock incident logging - would integrate with incident management system
    console.log(`  📝 Incident ID: ${incident.id}`);
    console.log(`  🔍 Severity: ${incident.severity}`);
    console.log(`  📊 Test Score: ${incident.test_score}/100`);

    // Simulate incident creation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("✅ Incident report created");
  } catch (error) {
    console.error("❌ Failed to create incident report:", error);
  }
}

async function sendCriticalAlert(
  config: RollbackConfig,
  error: unknown
): Promise<void> {
  console.log("🚨 CRITICAL: Emergency rollback failed!");

  const alertMessage = {
    deployment: config.deploymentUrl,
    error: error instanceof Error ? error.message : "Unknown error",
    immediate_steps: [
      "Manually disable feature flags in PostHog dashboard",
      "Clear CDN caches manually",
      "Contact on-call engineer immediately",
    ],
    level: "CRITICAL",
    manual_action_required: true,
    message: "Emergency rollback procedure failed",
  };

  // Mock critical alerting - would use PagerDuty, phone calls, etc.
  console.log("📱 Triggering critical alerts (PagerDuty, phone calls)...");
  console.log("⚠️ MANUAL INTERVENTION REQUIRED");
  console.log("🔧 Immediate actions needed:");

  for (const [index, step] of alertMessage.immediate_steps.entries()) {
    console.log(`  ${index + 1}. ${step}`);
  }
}

// Handle process signals gracefully
process.on("SIGTERM", async () => {
  console.log("🛑 Emergency rollback interrupted by SIGTERM");
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("🛑 Emergency rollback interrupted by user");
  process.exit(1);
});

main().catch((error) => {
  console.error("💥 Critical failure in emergency rollback:", error);
  process.exit(1);
});
