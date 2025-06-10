import { type PostHog } from "posthog-js";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  AnalyticsService,
  createAnalyticsService,
  getCommonEventProperties,
} from "@/lib/feature-flags/analytics";

// Mock PostHog
const mockPostHog = {
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  setPersonProperties: vi.fn(),
} as unknown as PostHog;

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    analyticsService = new AnalyticsService(mockPostHog);
  });

  describe("identify", () => {
    test("should identify user with PostHog", () => {
      const userProperties = {
        email: "test@example.com",
        name: "Test User",
        subscriptionTier: "premium" as const,
        userId: "test-user-123",
      };

      analyticsService.identify(userProperties);

      expect(mockPostHog.identify).toHaveBeenCalledWith("test-user-123", {
        email: "test@example.com",
        name: "Test User",
        subscriptionTier: "premium",
      });
      expect(mockPostHog.setPersonProperties).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        subscriptionTier: "premium",
      });
    });

    test("should handle missing PostHog gracefully", () => {
      const serviceWithoutPostHog = new AnalyticsService(null);
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      serviceWithoutPostHog.identify({
        email: "test@example.com",
        userId: "test-user",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "PostHog not initialized - skipping identify"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("track", () => {
    test("should track events with enriched properties", () => {
      const eventProperties = {
        episodeId: "ep-123",
        position: 30,
        sourceId: "tldr",
      };

      analyticsService.track("episode-played", eventProperties);

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "episode-played",
        expect.objectContaining({
          episodeId: "ep-123",
          position: 30,
          sourceId: "tldr",
          timestamp: expect.any(String),
        })
      );
    });

    test("should track podcast generation events", () => {
      const eventProperties = {
        audioLength: 45,
        cost: 0.8,
        duration: 32.5,
        sourceId: "tldr",
        sourceName: "TLDR Newsletter",
      };

      analyticsService.track("podcast-generation-completed", eventProperties);

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "podcast-generation-completed",
        expect.objectContaining(eventProperties)
      );
    });

    test("should track feature flag events", () => {
      analyticsService.trackFeatureFlag(
        "ai-summarization-enabled",
        true,
        "posthog"
      );

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "feature-flag-evaluated",
        expect.objectContaining({
          flagKey: "ai-summarization-enabled",
          flagValue: true,
          source: "posthog",
        })
      );
    });

    test("should handle missing PostHog gracefully", () => {
      const serviceWithoutPostHog = new AnalyticsService(null);
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      serviceWithoutPostHog.track("episode-played", {
        episodeId: "ep-123",
        sourceId: "tldr",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "PostHog not initialized - skipping event: episode-played"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("setUserProperties", () => {
    test("should set user properties", () => {
      const properties = {
        preferredSources: ["tldr", "hacker-news"],
        totalEpisodesGenerated: 10,
      };

      analyticsService.setUserProperties(properties);

      expect(mockPostHog.setPersonProperties).toHaveBeenCalledWith(properties);
    });
  });

  describe("reset", () => {
    test("should reset PostHog session", () => {
      analyticsService.reset();

      expect(mockPostHog.reset).toHaveBeenCalledWith();
    });
  });

  describe("convenience methods", () => {
    test("should track page views", () => {
      analyticsService.trackPageView("/episodes", { extra: "data" });

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "page-viewed",
        expect.objectContaining({
          extra: "data",
          page: "/episodes",
        })
      );
    });

    test("should track interactions", () => {
      analyticsService.trackInteraction(
        "episode-card",
        "play-button-clicked",
        "visual-heavy"
      );

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "component-interacted",
        expect.objectContaining({
          action: "play-button-clicked",
          component: "episode-card",
          variant: "visual-heavy",
        })
      );
    });

    test("should track errors", () => {
      const error = new Error("Test error");
      analyticsService.trackError(error, {
        component: "episode-player",
        page: "/episodes",
      });

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "error-occurred",
        expect.objectContaining({
          component: "episode-player",
          error: "Test error",
          page: "/episodes",
        })
      );
    });

    test("should track performance metrics", () => {
      analyticsService.trackPerformance("page-load-time", 1250, {
        page: "/episodes",
      });

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "performance-metric",
        expect.objectContaining({
          metric: "page-load-time",
          page: "/episodes",
          value: 1250,
        })
      );
    });

    test("should track experiments", () => {
      analyticsService.trackExperimentView("episode-card-test", "variant-a");
      analyticsService.trackExperimentConversion(
        "episode-card-test",
        "variant-a",
        "click"
      );

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "experiment-viewed",
        expect.objectContaining({
          experimentKey: "episode-card-test",
          variant: "variant-a",
        })
      );

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "experiment-converted",
        expect.objectContaining({
          conversionType: "click",
          experimentKey: "episode-card-test",
          variant: "variant-a",
        })
      );
    });
  });
});

describe("createAnalyticsService", () => {
  test("should create analytics service with PostHog instance", () => {
    const service = createAnalyticsService(mockPostHog);
    expect(service).toBeInstanceOf(AnalyticsService);
  });

  test("should create analytics service with null PostHog", () => {
    const service = createAnalyticsService(null);
    expect(service).toBeInstanceOf(AnalyticsService);
  });
});

describe("getCommonEventProperties", () => {
  beforeEach(() => {
    // Mock window/document for browser environment
    Object.defineProperty(window, "location", {
      value: {
        href: "https://example.com/test",
        pathname: "/test",
      },
      writable: true,
    });

    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://google.com",
    });

    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 Test Browser",
    });

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1920,
    });

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 1080,
    });
  });

  test("should return common event properties in browser", () => {
    const properties = getCommonEventProperties();

    expect(properties).toEqual({
      pathname: "/test",
      referrer: "https://google.com",
      timestamp: expect.any(String),
      url: "https://example.com/test",
      userAgent: "Mozilla/5.0 Test Browser",
      viewport: {
        height: 1080,
        width: 1920,
      },
    });
  });
});

describe("Event Type Safety", () => {
  test("should enforce correct event properties", () => {
    // This test ensures TypeScript compilation will catch type errors
    // In a real test environment, TypeScript would prevent incorrect usage

    const service = new AnalyticsService(mockPostHog);

    // Valid event
    service.track("episode-played", {
      episodeId: "ep-123",
      position: 30,
      sourceId: "tldr",
    });

    // Invalid event (would cause TypeScript error in real usage)
    // service.track("episode-played", { invalidProp: "value" });

    expect(mockPostHog.capture).toHaveBeenCalledTimes(1);
  });
});

describe("Analytics Integration Patterns", () => {
  test("should support complete podcast generation workflow tracking", () => {
    const service = new AnalyticsService(mockPostHog);

    // Simulate complete workflow
    service.track("podcast-generation-started", {
      estimatedDuration: 30,
      sourceId: "tldr",
      sourceName: "TLDR Newsletter",
    });

    service.track("content-scraped", {
      articlesCount: 5,
      duration: 3.2,
      sourceId: "tldr",
      sourceName: "TLDR Newsletter",
    });

    service.track("content-summarized", {
      cost: 0.12,
      model: "gpt-4",
      qualityScore: 8.5,
      sourceId: "tldr",
      summaryLength: 250,
      wordCount: 2500,
    });

    service.track("audio-generated", {
      audioLength: 45,
      cost: 0.68,
      sourceId: "tldr",
      textLength: 250,
      voice: "alloy",
    });

    service.track("podcast-generation-completed", {
      audioLength: 45,
      cost: 0.8,
      duration: 32.5,
      sourceId: "tldr",
      sourceName: "TLDR Newsletter",
    });

    expect(mockPostHog.capture).toHaveBeenCalledTimes(5);
  });

  test("should support player engagement tracking", () => {
    const service = new AnalyticsService(mockPostHog);

    service.track("episode-played", {
      episodeId: "ep-123",
      position: 0,
      sourceId: "tldr",
    });

    service.track("episode-paused", {
      episodeId: "ep-123",
      position: 15.5,
      watchTime: 15.5,
    });

    service.track("episode-completed", {
      completionRate: 0.96,
      episodeId: "ep-123",
      totalDuration: 45,
      watchTime: 43.2,
    });

    expect(mockPostHog.capture).toHaveBeenCalledTimes(3);
  });
});

describe("Analytics", () => {
  test("should be tested", () => {
    expect(true).toBeTruthy();
  });
});
