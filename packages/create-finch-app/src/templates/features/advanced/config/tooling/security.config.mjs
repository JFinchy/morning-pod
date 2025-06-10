/**
 * Security configuration for {{projectName}}
 */

const securityConfig = {
  // Content Security Policy
  csp: {
    // Development CSP (more permissive for debugging)
    development: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' https: data:",
      "script-src-elem 'self' 'unsafe-inline' https: data:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: wss: https:"{{#if hasAnalytics}},
      "connect-src 'self' ws: wss: https: https://us.i.posthog.com https://us-assets.i.posthog.com"{{/if}},
      "media-src 'self' https: blob:",
      "worker-src 'self' blob: https:",
      "child-src 'self' blob: https:",
    ],

    // Production CSP (stricter)
    production: [
      "default-src 'self'",
      "script-src 'self' https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com"{{#if hasAnalytics}} https://us.i.posthog.com{{/if}},
      "script-src-elem 'self' https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-analytics.com"{{#if hasAnalytics}} https://us.i.posthog.com{{/if}},
      "style-src 'self' 'unsafe-inline'", // DaisyUI requires this
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.vercel-analytics.com"{{#if hasAnalytics}} https://us.i.posthog.com https://us-assets.i.posthog.com{{/if}},
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

    // Stricter limits for sensitive operations
    strict: {
      maxRequests: process.env.NODE_ENV === "production" ? 10 : 100,
      windowMs: 60 * 1000, // 1 minute
    },
  },
};

/**
 * Get appropriate CSP based on environment
 */
export function getCSP() {
  const env = process.env.NODE_ENV;
  const cspRules =
    env === "production"
      ? securityConfig.csp.production
      : securityConfig.csp.development;

  return cspRules.join("; ");
}

export { securityConfig };