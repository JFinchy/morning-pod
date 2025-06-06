import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

/**
 * Set CSRF token in response cookies (use with NextResponse)
 */
export function setCSRFTokenInResponse(response: NextResponse): string {
  const token = generateCSRFToken();

  response.cookies.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Generate CSRF token for use in API routes
 */
export function createCSRFToken(): string {
  return generateCSRFToken();
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(req: NextRequest): boolean {
  const headerToken = req.headers.get("X-CSRF-Token");
  const cookieToken = req.cookies.get("csrf-token")?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  return headerToken === cookieToken;
}

/**
 * Middleware to add CSRF protection
 */
export function withCSRFProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Skip CSRF for GET requests
    if (req.method === "GET") {
      return handler(req);
    }

    if (!validateCSRFToken(req)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    return handler(req);
  };
}

/**
 * Client-side hook to get CSRF token
 */
export function getCSRFToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  // Get token from meta tag or cookie
  const metaToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  if (metaToken) {
    return metaToken;
  }

  // Fallback to cookie (for client-side reading)
  const cookieMatch = document.cookie.match(/csrf-token=([^;]+)/);
  return cookieMatch ? cookieMatch[1] : null;
}
