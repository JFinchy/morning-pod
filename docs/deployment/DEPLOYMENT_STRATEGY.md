# Deployment Strategy: Facebook-Inspired Canary Releases

## Overview

This document outlines our deployment strategy inspired by Facebook's 4-stage canary release approach, adapted for Vercel's free tier with cost-effective monitoring.

## Facebook's Original 4-Stage Approach

1. **Testing Environment** - Automated testing with health metrics
2. **Internal Employee Testing** - ~75,000 Facebook employees use pre-production builds
3. **Test Market** - Smaller regional rollout with metrics monitoring
4. **Full Production** - Complete rollout to all users

## Our Adapted Strategy (Cost-Effective)

### Single Environment with Progressive Rollout

Since we're using Vercel's free tier, we'll implement a **single production environment** with progressive feature flag roll-outs:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │ -> │   Staging/CI    │ -> │ Production 10%  │ -> │ Production 100% │
│                 │    │                 │    │ (Feature Flags) │    │ (Feature Flags) │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Stage 1: Development & Testing

- **Location**: Local development + CI/CD
- **Validation**:
  - Unit tests (`bun test`)
  - E2E tests (`bun test:e2e`)
  - Type checking (`bun type-check`)
  - Linting (`bun lint`)
- **Metrics**: Test coverage, build success rate

### Stage 2: Staging Deployment

- **Location**: Vercel Preview Deployment (automatic on PR)
- **Validation**:
  - Full test suite execution
  - Visual regression testing
  - Performance benchmarks
- **Metrics**: Core Web Vitals, error rates

### Stage 3: Canary Production (10% rollout)

- **Location**: Production with feature flags
- **Implementation**: PostHog feature flags for gradual rollout
- **Validation**:
  - Real user monitoring via Vercel Analytics
  - Error tracking via PostHog
  - Performance monitoring
- **Metrics**: Error rates, performance, user engagement

### Stage 4: Full Production (100% rollout)

- **Location**: Production
- **Validation**: Continued monitoring
- **Metrics**: Same as Stage 3 but at full scale

## Canary Deployment with Feature Flags

### Why Feature Flags Instead of Multiple Environments?

1. **Cost**: Vercel free tier limits to 1 production environment
2. **Control**: Instant rollback capabilities
3. **Granularity**: User-based, percentage-based, or geographic roll-outs
4. **Metrics**: Real production data while limiting blast radius

### Implementation with PostHog

```typescript
// Example canary rollout
const useNewFeature = useFeatureFlag('new-episode-player')
const canaryRollout = useFeatureFlag('canary-rollout-percentage') // 10%, 50%, 100%

if (useNewFeature && canaryRollout) {
  return <NewEpisodePlayerV2 />
} else {
  return <EpisodePlayerV1 />
}
```

## Version Management with Changesets

### Workflow

1. **Create Changeset**: `bun changeset`

   ```bash
   # Creates .changeset/[random-name].md describing changes
   # Developer specifies semver bump (patch/minor/major)
   ```

2. **Version Bump**: `bun changeset:version`

   ```bash
   # Updates package.json version
   # Generates CHANGELOG.md
   # Removes consumed changeset files
   ```

3. **Release**: `bun release`
   ```bash
   # Builds the application
   # Creates git tag
   # Triggers deployment pipeline
   ```

### Automation with GitHub Actions

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          publish: bun release
```

## Monitoring & Rollback Strategy

### Health Metrics to Monitor

1. **Error Rates**

   - JavaScript errors (PostHog)
   - API error rates (tRPC)
   - Failed requests

2. **Performance Metrics**

   - Core Web Vitals (Vercel Analytics)
   - Page load times
   - Time to Interactive

3. **User Engagement**
   - Feature usage (PostHog events)
   - User satisfaction scores
   - Conversion funnels

### Automated Rollback Triggers

```typescript
// Example monitoring logic
const errorRate = await getErrorRate('last-10-minutes')
const performanceScore = await getCoreWebVitals()

if (errorRate > 5% || performanceScore.fcp > 2000) {
  await rollbackFeatureFlag('new-feature')
  await sendAlert('Feature rolled back due to metrics threshold')
}
```

### Manual Rollback Process

1. **Immediate**: Disable feature flag in PostHog dashboard
2. **Code**: Revert commit and redeploy
3. **Version**: Create hotfix changeset if needed

## Cost Breakdown

- **Vercel**: Free tier (1 production environment)
- **PostHog**: Free tier (1M events/month)
- **GitHub Actions**: Free for public repos
- **Monitoring**: Built into Vercel Analytics (free)

## Benefits of This Approach

1. **Zero Infrastructure Costs**: Leverages free tiers effectively
2. **Real User Data**: Canary deployments use actual production traffic
3. **Instant Rollback**: Feature flags allow immediate reversion
4. **Gradual Roll-out**: Risk mitigation through percentage-based releases
5. **Comprehensive Monitoring**: Multiple data sources for health checks

## Testing Canaries with Synthetic Users

### 1. PostHog Person Profiles & Test Users

Create dedicated test user profiles in PostHog for canary testing:

```typescript
// src/lib/testing/synthetic-users.ts
export const SYNTHETIC_USER_IDS = [
  "test-user-001@morning-pod.com",
  "test-user-002@morning-pod.com",
  "canary-tester-001@morning-pod.com",
  "canary-tester-002@morning-pod.com",
  "qa-automation@morning-pod.com",
];

export const createSyntheticUser = (userId: string) => {
  posthog.identify(userId, {
    email: userId,
    name: `Test User ${userId.split("-")[2]}`,
    user_type: "synthetic",
    canary_eligible: true,
    created_at: new Date().toISOString(),
  });
};
```

### 2. Targeted Feature Flag Testing

```typescript
// Target synthetic users specifically for canary testing
const isCanaryUser = (userId: string) => {
  return (
    SYNTHETIC_USER_IDS.includes(userId) ||
    userId.includes("test-") ||
    userId.includes("canary-")
  );
};

const useCanaryFeature = (featureName: string) => {
  const userId = getCurrentUserId();

  // Always enable for synthetic users
  if (isCanaryUser(userId)) {
    return true;
  }

  // Regular percentage rollout for real users
  return useFeatureFlag(featureName);
};
```

### 3. Automated Synthetic User Testing

```typescript
// src/tests/synthetic/canary-automation.ts
export class SyntheticUserTesting {
  async runCanaryTest(featureName: string) {
    const results = [];

    for (const userId of SYNTHETIC_USER_IDS) {
      const testResult = await this.simulateUserJourney(userId, featureName);
      results.push(testResult);
    }

    return this.analyzeResults(results);
  }

  async simulateUserJourney(userId: string, featureName: string) {
    // Set up synthetic user context
    posthog.identify(userId);

    const startTime = Date.now();
    const errors = [];

    try {
      // Simulate key user flows
      await this.visitHomepage();
      await this.browseEpisodes();
      await this.playEpisode();
      await this.useNewFeature(featureName);

      return {
        userId,
        success: true,
        duration: Date.now() - startTime,
        errors: [],
      };
    } catch (error) {
      return {
        userId,
        success: false,
        duration: Date.now() - startTime,
        errors: [error.message],
      };
    }
  }
}
```

### 4. Playwright E2E with Synthetic Users

```typescript
// src/tests/e2e/canary-synthetic.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Canary Feature Testing with Synthetic Users", () => {
  SYNTHETIC_USER_IDS.forEach((userId) => {
    test(`Canary test for ${userId}`, async ({ page }) => {
      // Set up synthetic user context
      await page.goto("/");
      await page.evaluate((id) => {
        window.posthog?.identify(id, { user_type: "synthetic" });
      }, userId);

      // Test new feature with synthetic user
      await page.reload(); // Reload to apply feature flags

      // Verify canary feature is enabled
      await expect(page.locator('[data-testid="new-feature"]')).toBeVisible();

      // Test feature functionality
      await page.click('[data-testid="new-feature-button"]');
      await expect(
        page.locator('[data-testid="success-indicator"]')
      ).toBeVisible();

      // Verify no console errors
      const logs = await page.evaluate(() => console.error.calls || []);
      expect(logs).toHaveLength(0);
    });
  });
});
```

### 5. Load Testing with Synthetic Traffic

```bash
# Install k6 for load testing
brew install k6

# Create synthetic load test
# src/tests/load/canary-load.js
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 10 }, // Steady state
    { duration: '2m', target: 0 },  // Ramp down
  ],
}

export default function() {
  // Simulate synthetic user requests
  const headers = {
    'X-Synthetic-User': 'canary-load-test',
    'User-Agent': 'K6-Synthetic-Test/1.0'
  }

  const response = http.get('https://your-app.vercel.app', { headers })

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'no errors in response': (r) => !r.body.includes('error'),
  })
}
```

### 6. Synthetic Monitoring Dashboard

```typescript
// src/lib/monitoring/synthetic-dashboard.ts
export class SyntheticMonitoring {
  async getSyntheticUserMetrics(timeRange: string = "1h") {
    const metrics = await posthog.query({
      kind: "EventsQuery",
      select: ["count()", "avg(duration)", "properties.$current_url"],
      where: [`properties.user_type = 'synthetic'`],
      interval: timeRange,
    });

    return {
      totalRequests: metrics.count,
      averageResponseTime: metrics.avg_duration,
      errorRate: await this.getSyntheticErrorRate(timeRange),
      topPages: metrics.properties.$current_url,
    };
  }

  async createSyntheticAlert(threshold: number) {
    const errorRate = await this.getSyntheticErrorRate("5m");

    if (errorRate > threshold) {
      await this.sendAlert({
        type: "synthetic_canary_failure",
        message: `Synthetic user error rate: ${errorRate}% exceeds threshold: ${threshold}%`,
        severity: "high",
      });
    }
  }
}
```

### 7. Integration with CI/CD

```yaml
# .github/workflows/canary-synthetic-tests.yml
name: Canary Synthetic Tests
on:
  deployment_status:
    environments: ["Production"]

jobs:
  synthetic-canary-tests:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Run Synthetic User Tests
        run: |
          bun test:e2e src/tests/e2e/canary-synthetic.spec.ts

      - name: Run Load Tests
        run: |
          k6 run src/tests/load/canary-load.js

      - name: Check Synthetic Metrics
        run: |
          bun run scripts/check-synthetic-metrics.ts
```

### Benefits of Synthetic User Testing

1. **Controlled Environment**: Predictable test scenarios
2. **No Real User Impact**: Safe to test risky features
3. **Automated Validation**: Continuous monitoring
4. **Early Detection**: Catch issues before real users
5. **Performance Baseline**: Consistent metrics tracking

## Getting Started

1. Install dependencies: `bun install`
2. Create your first changeset: `bun changeset`
3. Set up PostHog feature flags for canary rollout
4. Configure synthetic users and monitoring dashboards
5. Create first canary deployment with synthetic testing

## Commands Reference

```bash
# Changeset Management
bun changeset              # Create new changeset
bun changeset:version      # Bump version and generate changelog
bun changeset:status       # Check pending changesets
bun release                # Build and publish release

# Testing & Validation
bun test:all               # Run all tests
bun type-check             # TypeScript validation
bun lint:check             # Code quality checks

# Deployment
# Automatic via Vercel on git push to main
```
