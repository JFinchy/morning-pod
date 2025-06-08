import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AnalyticsService,
  createAnalyticsService,
  getCommonEventProperties,
} from "@/lib/feature-flags/analytics";
import type { PostHog } from "posthog-js";

// Mock PostHog
const mockPostHog = {
  identify: vi.fn(),
  capture: vi.fn(),
  setPersonProperties: vi.fn(),
  reset: vi.fn(),
} as unknown as PostHog;

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    analyticsService = new AnalyticsService(mockPostHog);
  });

  describe("identify", () => {
    it("should identify user with PostHog", () => {
      const userProperties = {
        userId: "test-user-123",
        email: "test@example.com",
        name: "Test User",
        subscriptionTier: "premium" as const,
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

    it("should handle missing PostHog gracefully", () => {
      const serviceWithoutPostHog = new AnalyticsService(null);
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      serviceWithoutPostHog.identify({
        userId: "test-user",
        email: "test@example.com",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "PostHog not initialized - skipping identify"
      );
      consoleSpy.mockRestore();
    });
  });

  describe("track", () => {
    it("should track events with enriched properties", () => {
      const eventProperties = {
        episodeId: "ep-123",
        sourceId: "tldr",
        position: 30,
      };

      analyticsService.track("episode-played", eventProperties);

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "episode-played",
        expect.objectContaining({
          episodeId: "ep-123",
          sourceId: "tldr",
          position: 30,
          timestamp: expect.any(String),
        })
      );
    });

    it("should track podcast generation events", () => {
      const eventProperties = {
        sourceId: "tldr",
        sourceName: "TLDR Newsletter",
        duration: 32.5,
        audioLength: 45,
        cost: 0.8,
      };

      analyticsService.track("podcast-generation-completed", eventProperties);

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "podcast-generation-completed",
        expect.objectContaining(eventProperties)
      );
    });

    it("should track feature flag events", () => {
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

    it("should handle missing PostHog gracefully", () => {
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
    it("should set user properties", () => {
      const properties = {
        totalEpisodesGenerated: 10,
        preferredSources: ["tldr", "hacker-news"],
      };

      analyticsService.setUserProperties(properties);

      expect(mockPostHog.setPersonProperties).toHaveBeenCalledWith(properties);
    });
  });

  describe("reset", () => {
    it("should reset PostHog session", () => {
      analyticsService.reset();

      expect(mockPostHog.reset).toHaveBeenCalled();
    });
  });

  describe("convenience methods", () => {
    it("should track page views", () => {
      analyticsService.trackPageView("/episodes", { extra: "data" });

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "page-viewed",
        expect.objectContaining({
          page: "/episodes",
          extra: "data",
        })
      );
    });

    it("should track interactions", () => {
      analyticsService.trackInteraction(
        "episode-card",
        "play-button-clicked",
        "visual-heavy"
      );

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "component-interacted",
        expect.objectContaining({
          component: "episode-card",
          action: "play-button-clicked",
          variant: "visual-heavy",
        })
      );
    });

    it("should track errors", () => {
      const error = new Error("Test error");
      analyticsService.trackError(error, {
        component: "episode-player",
        page: "/episodes",
      });

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "error-occurred",
        expect.objectContaining({
          error: "Test error",
          component: "episode-player",
          page: "/episodes",
        })
      );
    });

    it("should track performance metrics", () => {
      analyticsService.trackPerformance("page-load-time", 1250, {
        page: "/episodes",
      });

      expect(mockPostHog.capture).toHaveBeenCalledWith(
        "performance-metric",
        expect.objectContaining({
          metric: "page-load-time",
          value: 1250,
          page: "/episodes",
        })
      );
    });

    it("should track experiments", () => {
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
          experimentKey: "episode-card-test",
          variant: "variant-a",
          conversionType: "click",
        })
      );
    });
  });
});

describe("createAnalyticsService", () => {
  it("should create analytics service with PostHog instance", () => {
    const service = createAnalyticsService(mockPostHog);
    expect(service).toBeInstanceOf(AnalyticsService);
  });

  it("should create analytics service with null PostHog", () => {
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
      value: "https://google.com",
      configurable: true,
    });

    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 Test Browser",
      configurable: true,
    });

    Object.defineProperty(window, "innerWidth", {
      value: 1920,
      configurable: true,
    });

    Object.defineProperty(window, "innerHeight", {
      value: 1080,
      configurable: true,
    });
  });

  it("should return common event properties in browser", () => {
    const properties = getCommonEventProperties();

    expect(properties).toEqual({
      url: "https://example.com/test",
      pathname: "/test",
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0 Test Browser",
      timestamp: expect.any(String),
      viewport: {
        width: 1920,
        height: 1080,
      },
    });
  });
});

describe("Event Type Safety", () => {
  it("should enforce correct event properties", () => {
    // This test ensures TypeScript compilation will catch type errors
    // In a real test environment, TypeScript would prevent incorrect usage

    const service = new AnalyticsService(mockPostHog);

    // Valid event
    service.track("episode-played", {
      episodeId: "ep-123",
      sourceId: "tldr",
      position: 30,
    });

    // Invalid event (would cause TypeScript error in real usage)
    // service.track("episode-played", { invalidProp: "value" });

    expect(mockPostHog.capture).toHaveBeenCalledTimes(1);
  });
});

describe("Analytics Integration Patterns", () => {
  it("should support complete podcast generation workflow tracking", () => {
    const service = new AnalyticsService(mockPostHog);

    // Simulate complete workflow
    service.track("podcast-generation-started", {
      sourceId: "tldr",
      sourceName: "TLDR Newsletter",
      estimatedDuration: 30,
    });

    service.track("content-scraped", {
      sourceId: "tldr",
      sourceName: "TLDR Newsletter",
      articlesCount: 5,
      duration: 3.2,
    });

    service.track("content-summarized", {
      sourceId: "tldr",
      wordCount: 2500,
      summaryLength: 250,
      model: "gpt-4",
      cost: 0.12,
      qualityScore: 8.5,
    });

    service.track("audio-generated", {
      sourceId: "tldr",
      textLength: 250,
      audioLength: 45,
      voice: "alloy",
      cost: 0.68,
    });

    service.track("podcast-generation-completed", {
      sourceId: "tldr",
      sourceName: "TLDR Newsletter",
      duration: 32.5,
      audioLength: 45,
      cost: 0.8,
    });

    expect(mockPostHog.capture).toHaveBeenCalledTimes(5);
  });

  it("should support player engagement tracking", () => {
    const service = new AnalyticsService(mockPostHog);

    service.track("episode-played", {
      episodeId: "ep-123",
      sourceId: "tldr",
      position: 0,
    });

    service.track("episode-paused", {
      episodeId: "ep-123",
      position: 15.5,
      watchTime: 15.5,
    });

    service.track("episode-completed", {
      episodeId: "ep-123",
      totalDuration: 45,
      watchTime: 43.2,
      completionRate: 0.96,
    });

    expect(mockPostHog.capture).toHaveBeenCalledTimes(3);
  });
});

describe("Analytics", () => {
  it("should be tested", () => {
    expect(true).toBe(true);
  });
});
