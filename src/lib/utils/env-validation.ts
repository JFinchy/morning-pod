import { z } from "zod";

/**
 * Environment variable validation schema
 * Ensures critical configuration is present and valid
 */
const envSchema = z.object({
  CSRF_SECRET: z.string().optional(),

  // Feature flags
  FEATURE_FLAG_ENABLED: z.string().optional(),

  // NextAuth (when implemented)
  NEXTAUTH_SECRET: z.string().min(32).optional(),

  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // API Keys (optional for development with mock data)
  OPENAI_API_KEY: z.string().optional(),

  // Database (optional for development, required for production)
  POSTGRES_URL: z.string().optional(),
  // Security settings
  RATE_LIMIT_REDIS_URL: z.string().optional(),
});

/**
 * Production-specific validation (stricter requirements)
 */
const productionEnvSchema = envSchema.extend({
  NEXTAUTH_SECRET: z.string().min(32, "Auth secret required in production"),
  NEXTAUTH_URL: z.string().url("Valid auth URL required in production"),
  POSTGRES_URL: z.string().min(1, "Database URL required in production"),
});

/**
 * Validate environment variables based on current environment
 */
export function validateEnvironment() {
  try {
    const env = process.env.NODE_ENV;

    if (env === "production") {
      return productionEnvSchema.parse(process.env);
    }
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      for (const err of error.errors) {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      }

      if (process.env.NODE_ENV === "production") {
        console.error(
          "\n💡 Make sure all required environment variables are set in production"
        );
        process.exit(1);
      } else {
        console.warn(
          "\n⚠️  Some environment variables are missing (development mode continues)"
        );
      }
    }

    throw error;
  }
}

/**
 * Get validated environment variables
 */
export function getEnv() {
  return validateEnvironment();
}

/**
 * Check if we have all production requirements
 */
export function isProductionReady(): boolean {
  try {
    productionEnvSchema.parse(process.env);
    return true;
  } catch {
    return false;
  }
}

/**
 * Runtime environment check with helpful warnings
 */
export function checkEnvironmentHealth() {
  const env = getEnv();
  const warnings: string[] = [];

  // Database check
  if (!env.POSTGRES_URL) {
    warnings.push("No database URL - using mock data");
  }

  // API key check
  if (!env.OPENAI_API_KEY) {
    warnings.push("No OpenAI API key - AI features will be disabled");
  }

  // Auth check
  if (!env.NEXTAUTH_SECRET) {
    warnings.push("No auth secret - authentication will be disabled");
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    for (const warning of warnings) console.warn(`  - ${warning}`);
  }

  return {
    env,
    isHealthy: warnings.length === 0,
    warnings,
  };
}
