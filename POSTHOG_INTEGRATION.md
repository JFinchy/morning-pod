# PostHog Analytics Integration Guide

## Overview

This project uses PostHog for feature flags, analytics, and A/B testing. This guide covers how to use PostHog effectively in both client and server components.

## Table of Contents

- [Quick Start](#quick-start)
- [Client Components](#client-components)
- [Server Components](#server-components)
- [Feature Flags](#feature-flags)
- [Analytics Events](#analytics-events)
- [A/B Testing](#ab-testing)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Environment Setup

Add your PostHog credentials to `.env.local`:

```bash
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY="phc_your_project_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Basic Usage

```tsx
import { useFeatureFlag, useEventTracking } from "@/lib/feature-flags";

function MyComponent() {
  const isNewFeatureEnabled = useFeatureFlag("new-feature-enabled");
  const { track } = useEventTracking();

  const handleClick = () => {
    track("button-clicked", { component: "MyComponent" });
  };

  return (
    <div>
      {isNewFeatureEnabled && <NewFeature />}
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

## Client Components

### Feature Flags

Use the `useFeatureFlag` hook for single flags:

```tsx
import { useFeatureFlag } from "@/lib/feature-flags";

function EpisodeCard() {
  const showAdvancedPlayer = useFeatureFlag("advanced-player-enabled");

  return (
    <div className="episode-card">
      {showAdvancedPlayer ? <AdvancedPlayer /> : <BasicPlayer />}
    </div>
  );
}
```

Use `useFeatureFlags` for multiple flags:

```tsx
import { useFeatureFlags } from "@/lib/feature-flags";

function Dashboard() {
  const flags = useFeatureFlags([
    "premium-features-enabled",
    "ai-summarization-enabled",
    "analytics-dashboard-enabled",
  ]);

  return (
    <div>
      {flags["premium-features-enabled"] && <PremiumSection />}
      {flags["ai-summarization-enabled"] && <AITools />}
      {flags["analytics-dashboard-enabled"] && <Analytics />}
    </div>
  );
}
```

### Analytics Events

#### User Identification

```tsx
import { useUserIdentification } from "@/lib/feature-flags";

function LoginComponent() {
  const { identify } = useUserIdentification();

  const handleLogin = (user) => {
    identify({
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.tier,
      signupDate: user.createdAt,
    });
  };

  return <LoginForm onLogin={handleLogin} />;
}
```

#### Event Tracking

```tsx
import { useEventTracking } from "@/lib/feature-flags";

function EpisodePlayer({ episode }) {
  const { track } = useEventTracking();

  const handlePlay = () => {
    track("episode-played", {
      episodeId: episode.id,
      sourceId: episode.sourceId,
      position: 0,
    });
  };

  const handlePause = (position, watchTime) => {
    track("episode-paused", {
      episodeId: episode.id,
      position,
      watchTime,
    });
  };

  return (
    <div>
      <button onClick={handlePlay}>Play</button>
      <button onClick={() => handlePause(currentTime, totalWatchTime)}>
        Pause
      </button>
    </div>
  );
}
```

#### Specialized Analytics Hooks

```tsx
import {
  usePodcastAnalytics,
  usePlayerAnalytics,
  useFeatureFlagAnalytics,
} from "@/lib/feature-flags";

function PodcastGenerator() {
  const { trackGenerationStarted, trackGenerationCompleted } =
    usePodcastAnalytics();

  const generatePodcast = async (sourceId, sourceName) => {
    trackGenerationStarted(sourceId, sourceName, estimatedDuration);

    try {
      const result = await generatePodcastAPI(sourceId);
      trackGenerationCompleted(
        sourceId,
        sourceName,
        result.duration,
        result.audioLength,
        result.cost
      );
    } catch (error) {
      trackGenerationFailed(sourceId, sourceName, error.message);
    }
  };
}
```

### Page View Tracking

```tsx
import { usePageViewTracking } from "@/lib/feature-flags";

function EpisodesPage() {
  usePageViewTracking("/episodes");

  return <div>Episodes content...</div>;
}
```

### Error Tracking

```tsx
import { useErrorTracking } from "@/lib/feature-flags";

function MyComponent() {
  const { trackComponentError } = useErrorTracking("MyComponent");

  useEffect(() => {
    try {
      riskyOperation();
    } catch (error) {
      trackComponentError(error, "/current-page");
    }
  }, []);
}
```

## Server Components

### Feature Flag Evaluation

```tsx
import { evaluateFeatureFlag } from "@/lib/feature-flags";

async function ServerComponent() {
  const showBetaFeature = await evaluateFeatureFlag("beta-feature-enabled");

  return (
    <div>
      {showBetaFeature && <BetaFeature />}
      <MainContent />
    </div>
  );
}
```

### Batch Feature Flag Evaluation

```tsx
import { evaluateFeatureFlags } from "@/lib/feature-flags";

async function DashboardPage() {
  const flags = await evaluateFeatureFlags([
    "premium-content-enabled",
    "ai-features-enabled",
    "beta-ui-enabled",
  ]);

  return (
    <div>
      {flags["premium-content-enabled"] && <PremiumContent />}
      {flags["ai-features-enabled"] && <AISection />}
      {flags["beta-ui-enabled"] ? <BetaUI /> : <StandardUI />}
    </div>
  );
}
```

### Server-Side Analytics

```tsx
import { createAnalyticsService } from "@/lib/feature-flags";
import { getPostHogClient } from "@/lib/feature-flags/server";

async function trackServerEvent(userId: string, eventData: any) {
  const posthog = getPostHogClient();
  const analytics = createAnalyticsService(posthog);

  analytics.track("server-side-event", {
    userId,
    ...eventData,
    serverTimestamp: new Date().toISOString(),
  });

  // Don't forget to close the client
  await posthog.shutdownAsync();
}
```

## Feature Flags

### Flag Configuration

Feature flags are defined in `src/lib/feature-flags/config.ts`:

```typescript
export const FEATURE_FLAGS = {
  // Source Control
  "tldr-source-enabled": "TLDR Newsletter integration",
  "hacker-news-source-enabled": "Hacker News integration",
  "morning-brew-source-enabled": "Morning Brew integration",

  // AI Features
  "ai-summarization-enabled": "AI-powered content summarization",
  "openai-tts-enabled": "OpenAI text-to-speech",
  "google-tts-enabled": "Google Cloud text-to-speech",

  // Premium Features
  "premium-content-enabled": "Premium content access",
  "unlimited-generation-enabled": "Unlimited podcast generation",
} as const;
```

### Environment Overrides

Override flags locally with environment variables:

```bash
# .env.local
NEXT_PUBLIC_FLAG_AI_SUMMARIZATION_ENABLED=true
NEXT_PUBLIC_FLAG_PREMIUM_CONTENT_ENABLED=false
```

### Flag Hygiene

1. **Naming Convention**: Use kebab-case with descriptive names
2. **Documentation**: Always add descriptions in the config
3. **Lifecycle**: Remove flags after rollout completion
4. **Testing**: Test both enabled/disabled states

## Analytics Events

### Event Categories

#### User Events

- `user-signed-in` - User authentication
- `user-signed-out` - User logout
- `user-profile-updated` - Profile changes

#### Podcast Events

- `podcast-generation-started` - Generation initiated
- `podcast-generation-completed` - Generation finished
- `podcast-generation-failed` - Generation error
- `content-scraped` - Content extraction
- `content-summarized` - AI summarization
- `audio-generated` - TTS conversion

#### Player Events

- `episode-played` - Playback started
- `episode-paused` - Playback paused
- `episode-completed` - Episode finished
- `episode-downloaded` - Episode download

#### Feature Flag Events

- `feature-flag-evaluated` - Flag evaluation
- `experiment-viewed` - A/B test exposure
- `experiment-converted` - A/B test conversion

### Event Properties

Always include relevant context:

```typescript
// Good: Rich context
track("podcast-generation-completed", {
  sourceId: "tldr",
  sourceName: "TLDR Newsletter",
  duration: 32.5, // Generation time in seconds
  audioLength: 45, // Audio duration in seconds
  cost: 0.8, // Generation cost in USD
  model: "gpt-4", // AI model used
  voice: "alloy", // TTS voice
  qualityScore: 8.5, // Content quality (1-10)
});

// Bad: Minimal context
track("podcast-completed", { source: "tldr" });
```

## A/B Testing

### Setting Up Experiments

1. **Create Feature Flag** in PostHog dashboard
2. **Define Variants** (control vs test)
3. **Set Targeting Rules** (user properties, percentages)
4. **Implement Code** with flag checks

### Experiment Implementation

```tsx
import { useFeatureFlag, useFeatureFlagAnalytics } from "@/lib/feature-flags";

function EpisodeCard({ episode }) {
  const cardVariant = useFeatureFlag("episode-card-experiment");
  const { trackExperimentView, trackExperimentConversion } =
    useFeatureFlagAnalytics();

  useEffect(() => {
    // Track experiment exposure
    trackExperimentView("episode-card-experiment", cardVariant);
  }, [cardVariant]);

  const handleClick = () => {
    // Track conversion
    trackExperimentConversion("episode-card-experiment", cardVariant, "click");
  };

  // Render variant
  switch (cardVariant) {
    case "visual-heavy":
      return <VisualEpisodeCard episode={episode} onClick={handleClick} />;
    case "minimal":
      return <MinimalEpisodeCard episode={episode} onClick={handleClick} />;
    default:
      return <DefaultEpisodeCard episode={episode} onClick={handleClick} />;
  }
}
```

### Experiment Analysis

Track these metrics:

- **Exposure**: Users who saw the experiment
- **Conversion**: Users who completed target action
- **Secondary Metrics**: Engagement, retention, etc.

## Best Practices

### Performance

1. **Minimize Flag Calls**: Use `useFeatureFlags` for multiple flags
2. **Cache Results**: Flags are cached automatically
3. **Async Loading**: Handle loading states gracefully

```tsx
import { usePostHogReady } from "@/lib/feature-flags";

function MyComponent() {
  const isPostHogReady = usePostHogReady();
  const featureEnabled = useFeatureFlag("my-feature");

  if (!isPostHogReady) {
    return <LoadingSpinner />;
  }

  return featureEnabled ? <NewFeature /> : <OldFeature />;
}
```

### Error Handling

Always handle PostHog failures gracefully:

```tsx
function RobustComponent() {
  const featureEnabled = useFeatureFlag("new-feature");
  const { track } = useEventTracking();

  const handleAction = () => {
    try {
      track("action-performed", { component: "RobustComponent" });
    } catch (error) {
      // PostHog failure shouldn't break the app
      console.warn("Analytics tracking failed:", error);
    }

    // Continue with core functionality
    performCoreAction();
  };

  // Always provide fallback for feature flags
  return featureEnabled ? <NewUI /> : <OldUI />;
}
```

### Privacy & Compliance

1. **PII Handling**: Don't track sensitive personal information
2. **Consent**: Respect user privacy preferences
3. **Data Retention**: Configure appropriate retention periods

```tsx
const handleIdentify = (user) => {
  identify({
    userId: user.id, // ✅ Anonymous ID
    subscriptionTier: user.tier, // ✅ Non-PII metadata
    // email: user.email,      // ❌ Avoid PII unless necessary
    // ssn: user.ssn,          // ❌ Never track sensitive data
  });
};
```

## Testing

### Unit Tests

Test analytics functionality with mocks:

```typescript
import { describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "@/lib/feature-flags/analytics";

const mockPostHog = {
  identify: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
};

describe("AnalyticsService", () => {
  it("should track events correctly", () => {
    const analytics = new AnalyticsService(mockPostHog);

    analytics.track("episode-played", {
      episodeId: "ep-123",
      sourceId: "tldr",
    });

    expect(mockPostHog.capture).toHaveBeenCalledWith(
      "episode-played",
      expect.objectContaining({
        episodeId: "ep-123",
        sourceId: "tldr",
      })
    );
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
import { test, expect } from "@playwright/test";

test("should track podcast generation flow", async ({ page }) => {
  await page.goto("/generate");

  // Start generation
  await page.click('[data-testid="generate-button"]');

  // Verify analytics events (check network requests)
  const requests = [];
  page.on("request", (req) => {
    if (req.url().includes("posthog")) {
      requests.push(req);
    }
  });

  // Should track generation started
  expect(
    requests.some((req) =>
      req.postData()?.includes("podcast-generation-started")
    )
  ).toBe(true);
});
```

### Testing Internal Tools

Use the analytics dashboard at `/internal/analytics` to:

1. **Test Event Tracking**: Verify events are sent correctly
2. **Debug Integration**: Check PostHog connection status
3. **Validate Properties**: Ensure event data is complete

## Troubleshooting

### Common Issues

#### PostHog Not Loading

**Symptoms**: Events not tracking, flags returning defaults

**Solutions**:

1. Check environment variables are set correctly
2. Verify PostHog project key is valid
3. Check network connectivity and ad blockers
4. Look for console errors

```tsx
import { usePostHogReady } from "@/lib/feature-flags";

function DebugComponent() {
  const isReady = usePostHogReady();

  return <div>PostHog Status: {isReady ? "Ready" : "Loading..."}</div>;
}
```

#### Feature Flags Not Updating

**Symptoms**: Flags stuck on default values

**Solutions**:

1. Check flag configuration in PostHog dashboard
2. Verify targeting rules (user properties, percentages)
3. Clear browser cache/storage
4. Check environment overrides

#### Events Not Appearing

**Symptoms**: Events sent but not visible in PostHog

**Solutions**:

1. Check event properties are serializable
2. Verify PostHog project permissions
3. Look for rate limiting or filtering
4. Check event names match expectations

### Debug Mode

Enable debug logging in development:

```tsx
// Add to your app initialization
if (process.env.NODE_ENV === "development") {
  window.posthog?.debug();
}
```

### Environment Variables

Required environment variables:

```bash
# Required
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Optional
POSTHOG_PERSONAL_API_KEY=phx_your_api_key  # For server-side features
```

### Support Resources

- **PostHog Docs**: https://posthog.com/docs
- **Internal Dashboard**: `/internal/analytics`
- **Feature Flag Admin**: `/internal/feature-flags`
- **tRPC API Explorer**: `/api/trpc-ui`

---

## Quick Reference

### Essential Imports

```typescript
// Feature Flags
import { useFeatureFlag, useFeatureFlags } from "@/lib/feature-flags";

// Analytics
import { useEventTracking, usePodcastAnalytics } from "@/lib/feature-flags";

// User Management
import { useUserIdentification } from "@/lib/feature-flags";

// Server-side
import {
  evaluateFeatureFlag,
  createAnalyticsService,
} from "@/lib/feature-flags";
```

### Common Patterns

```typescript
// Feature flag with fallback
const isEnabled = useFeatureFlag('feature-name') ?? false;

// Event tracking with error handling
const { track } = useEventTracking();
const trackSafely = (event, props) => {
  try {
    track(event, props);
  } catch (error) {
    console.warn('Analytics failed:', error);
  }
};

// Conditional rendering
{useFeatureFlag('show-beta-ui') && <BetaComponent />}
```

This integration provides a robust foundation for feature flags, analytics, and experimentation in your podcast generation application.
