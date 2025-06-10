/**
 * Security configuration
 */

const securityConfig = {
  // Allowed HTTP methods per endpoint type
  allowedMethods: {
    all: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    delete: ["DELETE"],
    read: ["GET", "HEAD"],
    write: ["POST", "PUT", "PATCH"],
  },

  // Content Security Policy
  csp: {
    // Development CSP (more permissive for debugging)
    development: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' https: data:",
      "script-src-elem 'self' 'unsafe-inline' https: data:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: wss: https:",
      "media-src 'self' https: blob:",
      "worker-src 'self' blob: https:",
      "child-src 'self' blob: https:",
    ],

    // Production CSP (stricter)
    production: [
      "default-src 'self'",
      "script-src 'self' https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://*.vercel-insights.com",
      "script-src-elem 'self' https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://*.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'", // DaisyUI requires this
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.vercel-analytics.com https://*.vercel-insights.com https://vitals.vercel-insights.com https://api.openai.com https://*.neon.tech",
      "media-src 'self' https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ],
  },

  // Rate limiting settings
  rateLimit: {
    // General API rate limit
    api: {
      maxRequests: process.env.NODE_ENV === "production" ? 100 : 1000,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },

    // Generation endpoint (costly operations)
    generation: {
      maxRequests: process.env.NODE_ENV === "production" ? 5 : 50,
      windowMs: 60 * 1000, // 1 minute
    },

    // Stricter limits for sensitive operations
    strict: {
      maxRequests: process.env.NODE_ENV === "production" ? 10 : 100,
      windowMs: 60 * 1000, // 1 minute
    },
  },

  // Request size limits
  requestLimits: {
    form: 512 * 1024, // 512KB for forms
    json: 1024 * 1024, // 1MB for JSON
    upload: 10 * 1024 * 1024, // 10MB for uploads (future)
  },
};

/**
 * Get appropriate CSP based on environment
 */
function getCSP() {
  const env = process.env.NODE_ENV;
  const cspRules =
    env === "production"
      ? securityConfig.csp.production
      : securityConfig.csp.development;

  return cspRules.join("; ");
}

export { getCSP, securityConfig };
