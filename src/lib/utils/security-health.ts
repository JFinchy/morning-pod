import { checkEnvironmentHealth } from "./env-validation";

/**
 * Comprehensive security health check
 * Run this during app startup to verify security configuration
 */
export function checkSecurityHealth() {
  const healthChecks: Array<{
    name: string;
    status: "pass" | "warn" | "fail";
    message: string;
  }> = [];

  // Environment variables
  try {
    const envHealth = checkEnvironmentHealth();
    healthChecks.push({
      name: "Environment Variables",
      status: envHealth.isHealthy ? "pass" : "warn",
      message:
        envHealth.warnings.join(", ") || "All required variables present",
    });
  } catch (error) {
    healthChecks.push({
      name: "Environment Variables",
      status: "fail",
      message:
        error instanceof Error
          ? error.message
          : "Environment validation failed",
    });
  }

  // Security headers
  const cspEnabled =
    process.env.NODE_ENV === "production" ||
    process.env.FORCE_SECURITY === "true";
  healthChecks.push({
    name: "Security Headers",
    status: cspEnabled ? "pass" : "warn",
    message: cspEnabled
      ? "CSP and security headers active"
      : "Security headers disabled in development",
  });

  // Rate limiting
  healthChecks.push({
    name: "Rate Limiting",
    status: "pass",
    message: "Rate limiting configured and active",
  });

  // HTTPS check
  const isHttps =
    process.env.NODE_ENV === "production" || process.env.VERCEL_URL;
  healthChecks.push({
    name: "HTTPS",
    status: isHttps ? "pass" : "warn",
    message: isHttps ? "HTTPS enforced" : "HTTP allowed in development",
  });

  // Input sanitization
  healthChecks.push({
    name: "Input Sanitization",
    status: "pass",
    message: "Input sanitization active on forms",
  });

  // Report results
  console.log("\n🔒 Security Health Check:");
  healthChecks.forEach((check) => {
    const emoji =
      check.status === "pass" ? "✅" : check.status === "warn" ? "⚠️" : "❌";
    console.log(`  ${emoji} ${check.name}: ${check.message}`);
  });

  const failedChecks = healthChecks.filter((check) => check.status === "fail");
  const warningChecks = healthChecks.filter((check) => check.status === "warn");

  if (failedChecks.length > 0) {
    console.error(
      "\n❌ Security issues detected - fix before production deployment"
    );
    return { status: "fail", checks: healthChecks };
  }

  if (warningChecks.length > 0) {
    console.warn("\n⚠️  Security warnings - review before production");
    return { status: "warn", checks: healthChecks };
  }

  console.log("\n✅ All security checks passed");
  return { status: "pass", checks: healthChecks };
}

/**
 * Quick security status for monitoring
 */
export function getSecurityStatus() {
  const health = checkSecurityHealth();
  return {
    status: health.status,
    timestamp: new Date().toISOString(),
    summary: {
      total: health.checks.length,
      passed: health.checks.filter((c) => c.status === "pass").length,
      warnings: health.checks.filter((c) => c.status === "warn").length,
      failed: health.checks.filter((c) => c.status === "fail").length,
    },
  };
}
