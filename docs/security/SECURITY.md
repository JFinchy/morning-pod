# Security Implementation Guide

## Overview

This document explains the security measures implemented in the Morning Pod application as part of Task 7.1: Security & Performance.

## Security Headers

### What They Do

Security headers protect against common web vulnerabilities by instructing browsers on how to handle our content.

### Implementation (`next.config.js`)

```javascript
// Security headers configuration
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",                    // Only load resources from same origin
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Allow scripts (Next.js needs these)
    "style-src 'self' 'unsafe-inline'",     // Allow inline styles (DaisyUI needs this)
    "img-src 'self' data: https:",          // Allow images from same origin, data URLs, HTTPS
    "connect-src 'self' https://*.vercel-analytics.com", // API connections
  ].join("; ")
}
```

**Why Each Header Matters:**

1. **X-Frame-Options: DENY** - Prevents clickjacking attacks by blocking iframe embedding
2. **X-Content-Type-Options: nosniff** - Prevents MIME type confusion attacks
3. **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information leakage
4. **X-XSS-Protection: 1; mode=block** - Legacy XSS protection (modern CSP is better)
5. **Content-Security-Policy** - Most important - prevents XSS by controlling resource loading
6. **Permissions-Policy** - Disables unnecessary browser APIs (camera, microphone, etc.)

## Rate Limiting

### What It Prevents

- Denial of Service (DoS) attacks
- Brute force attacks
- API abuse
- Resource exhaustion

### Implementation (`src/lib/utils/rate-limit.ts`)

```typescript
// Basic rate limiting: 100 requests per 15 minutes per IP
export const apiRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});
```

**How It Works:**

1. Tracks requests by IP address in memory
2. Blocks requests when limit exceeded
3. Provides clear error messages with retry information
4. Automatically cleans up expired entries

**Limitations:**

- Uses in-memory storage (lost on restart)
- For production, should use Redis or similar persistent store

## CSRF Protection

### What It Prevents

Cross-Site Request Forgery attacks where malicious sites make requests on behalf of users.

### Implementation (`src/lib/utils/csrf.ts`)

**How It Works:**

1. Server generates unique token per session
2. Token stored in HTTP-only cookie
3. Client must include token in request headers
4. Server validates token matches

**Example Usage:**

```typescript
// Generate token (server-side)
const token = setCSRFToken();

// Validate request (middleware)
if (!validateCSRFToken(req)) {
  return error(403, "Invalid CSRF token");
}
```

## Input Sanitization

### What It Prevents

- Cross-Site Scripting (XSS) attacks
- SQL injection (when combined with parameterized queries)
- Data corruption

### Implementation (`src/lib/utils/api-middleware.ts`)

```typescript
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential XSS characters
    .trim()
    .slice(0, 1000); // Limit length
}
```

**Applied To:**

- Search inputs in the episodes page
- Form submissions (when forms are added)
- API request data

## API Middleware

### What It Provides

Consistent security application across all API endpoints.

### Implementation (`src/lib/utils/api-middleware.ts`)

```typescript
const handler = withApiMiddleware(
  async (req: NextRequest) => {
    // Your API logic here
  },
  {
    rateLimit: true, // Apply rate limiting
    requireAuth: false, // Auth check (when implemented)
    validateInput: schema, // Input validation (when needed)
  }
);
```

**Benefits:**

- Automatic rate limiting
- Consistent error responses
- Easy to apply to any API route
- Extensible for future security needs

## Performance Monitoring

### What It Tracks

- Page load times
- Core Web Vitals (LCP, FID, CLS)
- Time to First Byte
- Performance bottlenecks

### Implementation (`src/lib/utils/performance-audit.ts`)

**Metrics Collected:**

1. **Largest Contentful Paint (LCP)** - Loading performance
2. **First Input Delay (FID)** - Interactivity
3. **Cumulative Layout Shift (CLS)** - Visual stability

**Usage:**

```typescript
// Enable in development
enablePerformanceMonitoring();

// Get metrics programmatically
const metrics = collectPerformanceMetrics();
const recommendations = getPerformanceRecommendations(metrics);
```

## Current Limitations & Future Improvements

### Rate Limiting

- **Current:** In-memory storage (development-friendly)
- **Production:** Should use Redis for persistence and horizontal scaling

### Authentication

- **Current:** Placeholder structure only
- **Future:** Implement BetterAuth integration

### CSRF Protection

- **Current:** Basic token-based protection
- **Future:** Integrate with authentication system

### Input Validation

- **Current:** Basic string sanitization
- **Future:** Comprehensive Zod schema validation

## Security Best Practices Followed

1. **Defense in Depth** - Multiple layers of protection
2. **Principle of Least Privilege** - Minimal necessary permissions
3. **Fail Secure** - Deny by default, allow explicitly
4. **Input Validation** - Never trust user input
5. **Output Encoding** - Prevent XSS in responses

## Testing Security

### Manual Testing

1. Try to embed site in iframe (should be blocked)
2. Attempt XSS payloads in search (should be sanitized)
3. Make rapid API requests (should be rate limited)

### Automated Testing

```bash
# Check security headers
curl -I http://localhost:3000

# Test rate limiting
for i in {1..101}; do curl http://localhost:3000/api/trpc; done
```

## Production Considerations

### Environment Variables

```bash
# Set these in production
NODE_ENV=production
RATE_LIMIT_REDIS_URL=redis://...
CSRF_SECRET=your-secret-key
```

### Monitoring

- Set up alerts for rate limit violations
- Monitor CSP violation reports
- Track performance metrics
- Log security events

### Updates

- Regularly update dependencies
- Review and update CSP policies
- Rotate CSRF secrets
- Monitor security advisories
