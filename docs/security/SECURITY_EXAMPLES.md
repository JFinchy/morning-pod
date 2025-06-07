# Security Examples & Attack Prevention

## Real-World Attack Prevention Examples

### 1. Cross-Site Scripting (XSS) Prevention

**Without Protection:**

```javascript
// User enters: <script>alert('XSS')</script>
const searchQuery = userInput; // Dangerous!
```

**With Our Protection:**

```javascript
// Input sanitization removes dangerous characters
const searchQuery = sanitizeString(userInput);
// Result: "scriptalert('XSS')/script" - harmless text
```

**CSP Header Also Blocks:**

```javascript
// Even if XSS gets through, CSP prevents execution
"script-src 'self'"; // Only allow scripts from our domain
```

### 2. Clickjacking Prevention

**Attack Scenario:**
Malicious site embeds our app in invisible iframe to steal clicks.

**Our Protection:**

```javascript
"X-Frame-Options": "DENY" // Blocks ALL iframe embedding
"frame-ancestors 'none'"  // CSP equivalent
```

### 3. Rate Limiting in Action

**Attack Scenario:**
Attacker makes 1000 requests per second to crash our server.

**Our Protection:**

```javascript
// After 100 requests in 15 minutes:
{
  error: "Too many requests",
  retryAfter: 847, // seconds until reset
  status: 429
}
```

### 4. CSRF Attack Prevention

**Attack Scenario:**

```html
<!-- Malicious site tricks user into making requests -->
<img src="https://morning-pod.com/api/delete-account" />
```

**Our Protection:**

```javascript
// Requires CSRF token in header
"X-CSRF-Token": "abc123..." // Must match server-side token
// Without token = 403 Forbidden
```

## Security Headers Explained Simply

### Content Security Policy (CSP)

**What it does:** Controls what resources can load on your page.

**Real benefit:** Even if an attacker injects malicious code, CSP prevents it from running.

### X-Content-Type-Options: nosniff

**What it does:** Prevents browsers from guessing file types.

**Real benefit:** Stops attackers from uploading images that are actually JavaScript files.

### Referrer Policy

**What it does:** Controls what information is sent when users click links.

**Real benefit:** Protects user privacy and prevents data leakage.

## Performance Benefits

### Why Rate Limiting Helps Performance

1. **Prevents DoS attacks** that could crash the server
2. **Ensures fair resource usage** among all users
3. **Protects against runaway scripts** or bugs

### Performance Monitoring Benefits

1. **Identifies slow pages** before users complain
2. **Tracks Core Web Vitals** for SEO benefits
3. **Provides actionable insights** for optimization

## Testing Your Security

### 1. Test CSP Headers

```bash
# Check if headers are present
curl -I http://localhost:3000
```

### 2. Test Rate Limiting

```bash
# Make lots of requests quickly
for i in {1..101}; do
  curl http://localhost:3000/api/trpc/episodes.getAll
done
# Should get 429 error after 100 requests
```

### 3. Test XSS Protection

1. Try entering `<script>alert('test')</script>` in search
2. Should see harmless text, not popup

### 4. Test Clickjacking Protection

1. Try embedding site in iframe
2. Should be blocked by browser

## When You DON'T Need These

### Development Environment

- Rate limiting might be too strict
- CSP might block development tools
- CSRF protection might interfere with testing

**Solution:** Most protections check `NODE_ENV` and are more lenient in development.

### Simple Static Sites

- If no user input or APIs, some protections are overkill
- But headers are still good practice

## Upgrading for Production

### 1. Replace In-Memory Rate Limiting

```javascript
// Current (development)
const store = new Map(); // Lost on restart

// Production upgrade
const store = new Redis(); // Persistent storage
```

### 2. Add Real Authentication

```javascript
// Current (placeholder)
if (options.requireAuth) {
  // TODO: Check auth
}

// Future (with BetterAuth)
const session = await getSession(req);
if (!session) return unauthorized();
```

### 3. Environment-Specific CSP

```javascript
// Development: Allow more sources for hot reload
// Production: Strict policy

const csp = process.env.NODE_ENV === "production" ? strictCSP : developmentCSP;
```

## Why This Matters for Morning Pod

### 1. User Trust

- Users won't use an app that feels insecure
- Security headers show professionalism

### 2. SEO Benefits

- Google considers page security in rankings
- Performance monitoring helps with Core Web Vitals

### 3. Future-Proofing

- When we add user accounts, security foundation is ready
- When we scale up, rate limiting prevents abuse

### 4. Compliance

- Many security standards require these protections
- Good security practices from the start
