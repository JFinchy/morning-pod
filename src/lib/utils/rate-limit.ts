import { NextRequest } from "next/server";

import { securityConfig } from "../config/security";

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for development/staging - use Redis in production)
const store = new Map<string, RateLimitEntry>();

/**
 * Simple rate limiting utility
 *
 * IMPORTANT: This uses in-memory storage which is reset on server restart.
 * For production environments, implement Redis-backed storage for persistence
 * and to support horizontal scaling across multiple server instances.
 */
export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs, keyGenerator = getDefaultKey } = options;

  return (req: NextRequest) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const entry = store.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      cleanupExpiredEntries();
    }

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    store.set(key, entry);

    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

function getDefaultKey(req: NextRequest): string {
  // Use IP address if available, fallback to user-agent
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
  return `rate_limit:${ip}`;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimit = rateLimit(securityConfig.rateLimit.api);

export const strictApiRateLimit = rateLimit(securityConfig.rateLimit.strict);

export const generationRateLimit = rateLimit(
  securityConfig.rateLimit.generation
);
