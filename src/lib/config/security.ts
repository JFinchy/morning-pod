/**
 * Security configuration (TypeScript version)
 * Duplicated from /security.config.js for TypeScript compatibility
 */

export const securityConfig = {
  // Allowed HTTP methods per endpoint type
  allowedMethods: {
    all: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    delete: ["DELETE"],
    read: ["GET", "HEAD"],
    write: ["POST", "PUT", "PATCH"],
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

  // CSRF settings
  csrf: {
    cookieName: "csrf-token",
    headerName: "X-CSRF-Token",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    tokenLength: 32,
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

  // Input sanitization settings
  sanitization: {
    allowedTags: [] as string[], // No HTML tags allowed
    maxStringLength: 1000,
    stripHtml: true,
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
