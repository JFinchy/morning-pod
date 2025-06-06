/**
 * Security configuration (TypeScript version)
 * Duplicated from /security.config.js for TypeScript compatibility
 */

export const securityConfig = {
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

    // Generation endpoint (costly operations)
    generation: {
      maxRequests: process.env.NODE_ENV === "production" ? 5 : 50,
      windowMs: 60 * 1000, // 1 minute
    },
  },

  // Content Security Policy
  csp: {
    // Development CSP (more permissive)
    development: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: https:",
    ],

    // Production CSP (stricter)
    production: [
      "default-src 'self'",
      "script-src 'self' https://*.vercel-analytics.com https://*.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'", // DaisyUI requires this
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.vercel-analytics.com https://*.vercel-insights.com https://api.openai.com https://*.neon.tech",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ],
  },

  // Input sanitization settings
  sanitization: {
    maxStringLength: 1000,
    allowedTags: [] as string[], // No HTML tags allowed
    stripHtml: true,
  },

  // CSRF settings
  csrf: {
    tokenLength: 32,
    cookieName: "csrf-token",
    headerName: "X-CSRF-Token",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Request size limits
  requestLimits: {
    json: 1024 * 1024, // 1MB for JSON
    form: 512 * 1024, // 512KB for forms
    upload: 10 * 1024 * 1024, // 10MB for uploads (future)
  },

  // Allowed HTTP methods per endpoint type
  allowedMethods: {
    read: ["GET", "HEAD"],
    write: ["POST", "PUT", "PATCH"],
    delete: ["DELETE"],
    all: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
  },
};

/**
 * Get appropriate CSP based on environment
 */
export function getCSP(): string {
  const env = process.env.NODE_ENV;
  const cspRules =
    env === "production"
      ? securityConfig.csp.production
      : securityConfig.csp.development;

  return cspRules.join("; ");
}

/**
 * Check if we're in a secure environment
 */
export function isSecureEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" || process.env.FORCE_HTTPS === "true"
  );
}
