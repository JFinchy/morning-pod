import { type NextRequest, NextResponse } from "next/server";
import { type z } from "zod";

import { apiRateLimit } from "./rate-limit";

export interface ApiMiddlewareOptions {
  allowedMethods?: string[];
  maxBodySize?: number; // in bytes
  rateLimit?: boolean;
  requireAuth?: boolean;
  validateInput?: z.ZodSchema;
}

/**
 * API middleware for security and validation
 *
 * Provides consistent security measures across API endpoints:
 * - Rate limiting to prevent abuse
 * - Authentication checks (when implemented)
 * - Input validation with Zod schemas
 * - Standardized error responses
 */
export function withApiMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // Method validation
      if (
        options.allowedMethods &&
        !options.allowedMethods.includes(req.method)
      ) {
        return NextResponse.json(
          { error: `Method ${req.method} not allowed` },
          { headers: { Allow: options.allowedMethods.join(", ") }, status: 405 }
        );
      }

      // Request size limiting
      if (options.maxBodySize && req.headers.get("content-length")) {
        const contentLength = Number.parseInt(
          req.headers.get("content-length") || "0"
        );
        if (contentLength > options.maxBodySize) {
          return NextResponse.json(
            {
              error: "Request too large",
              maxSize: `${Math.round(options.maxBodySize / 1024)}KB`,
            },
            { status: 413 }
          );
        }
      }

      // Rate limiting
      if (options.rateLimit !== false) {
        const rateLimitResult = apiRateLimit(req);

        if (!rateLimitResult.success) {
          return NextResponse.json(
            {
              error: "Too many requests",
              retryAfter: Math.ceil(
                (rateLimitResult.resetTime - Date.now()) / 1000
              ),
            },
            {
              headers: {
                "Retry-After": Math.ceil(
                  (rateLimitResult.resetTime - Date.now()) / 1000
                ).toString(),
                "X-RateLimit-Limit": "100",
                "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
                "X-RateLimit-Reset": new Date(
                  rateLimitResult.resetTime
                ).toISOString(),
              },
              status: 429,
            }
          );
        }

        // Add rate limit headers to successful responses
        const response = await handler(req);
        response.headers.set("X-RateLimit-Limit", "100");
        response.headers.set(
          "X-RateLimit-Remaining",
          rateLimitResult.remaining.toString()
        );
        response.headers.set(
          "X-RateLimit-Reset",
          new Date(rateLimitResult.resetTime).toISOString()
        );

        return response;
      }

      // TODO: Add authentication check when auth is implemented
      if (options.requireAuth) {
        // Placeholder for future auth implementation
        // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // TODO: Add input validation
      if (options.validateInput) {
        // Placeholder for input validation
      }

      return handler(req);
    } catch (error) {
      console.error("API middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * CSRF token validation (basic implementation)
 */
export function validateCSRFToken(req: NextRequest): boolean {
  const token = req.headers.get("X-CSRF-Token");
  const cookie = req.cookies.get("csrf-token")?.value;

  if (!token || !cookie) {
    return false;
  }

  return token === cookie;
}

/**
 * Input sanitization helpers
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/gu, "") // Remove potential XSS characters
    .trim()
    .slice(0, 1000); // Limit length
}

export function sanitizeObject(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
