"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import {
  useEventTracking,
  useFeatureFlagAnalytics,
  usePlayerAnalytics,
  usePodcastAnalytics,
  useUserIdentification,
} from "@/lib/feature-flags/analytics-hooks";

export default function AnalyticsPage() {
  const [testUserId] = useState(() => `test-user-${Date.now()}`);
  const [eventCount, setEventCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<null | string>(null);

  // Analytics hooks
  const { identify, reset } = useUserIdentification();
  const {
    track,
    trackInteraction,
    trackPageView,
    // TODO: Implement error tracking functionality
    // trackError: _trackError,
    // TODO: Implement performance tracking functionality
    // trackPerformance: _trackPerformance,
  } = useEventTracking();
  const {
    // TODO: Implement feature flag tracking functionality
    // trackFeatureFlag: _trackFeatureFlag,
    // TODO: Implement experiment view tracking functionality
    // trackExperimentView: _trackExperimentView,
    // TODO: Implement experiment conversion tracking functionality
    // trackExperimentConversion: _trackExperimentConversion,
  } = useFeatureFlagAnalytics();
  const {
    trackAudioGenerated,
    trackContentScraped,
    trackContentSummarized,
    trackGenerationCompleted,
    trackGenerationStarted,
  } = usePodcastAnalytics();
  const {
    // TODO: Implement episode played tracking functionality
    // trackEpisodePlayed: _trackEpisodePlayed,
    // TODO: Implement episode paused tracking functionality
    // trackEpisodePaused: _trackEpisodePaused,
    // TODO: Implement episode completed tracking functionality
    // trackEpisodeCompleted: _trackEpisodeCompleted,
    // TODO: Implement episode downloaded tracking functionality
    // trackEpisodeDownloaded: _trackEpisodeDownloaded,
  } = usePlayerAnalytics();

  // Test functions
  const testUserIdentification = () => {
    identify({
      email: "test@example.com",
      name: "Test User",
      preferredSources: ["tldr", "hacker-news"],
      preferredVoices: ["alloy", "nova"],
      signupDate: new Date().toISOString(),
      subscriptionTier: "premium",
      totalEpisodesGenerated: 5,
      userId: testUserId,
    });
    setLastEvent("User Identified");
    setEventCount((prev) => prev + 1);
  };

  const testBasicEvents = () => {
    track("user-signed-in", {
      email: "test@example.com",
      method: "email",
      userId: testUserId,
    });

    trackPageView("/internal/analytics", {
      testMode: true,
    });

    trackInteraction(
      "analytics-dashboard",
      "test-button-clicked",
      "basic-events"
    );

    setLastEvent("Basic Events");
    setEventCount((prev) => prev + 3);
  };

  const testPodcastEvents = () => {
    const testSource = "TLDR Newsletter";
    trackGenerationStarted("tldr", testSource, 30);
    trackContentScraped("tldr", testSource, 5, 3.2);
    trackContentSummarized("tldr", 2500, 250, "gpt-4", 0.12, 8.5);
    trackAudioGenerated("tldr", 250, 45, "alloy", 0.68);
    trackGenerationCompleted("tldr", testSource, 32.5, 45, 0.8);

    setLastEvent("Podcast Generation Flow");
    setEventCount((prev) => prev + 5);
  };

  const resetAnalytics = () => {
    reset();
    setLastEvent("Analytics Reset");
    setEventCount(0);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <div className="border-base-300 border-b pb-6">
        <h1 className="text-base-content text-3xl font-bold">
          Analytics Dashboard
        </h1>
        <p className="text-base-content/70 mt-2">
          Test and monitor PostHog analytics integration
        </p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">PostHog Status</div>
            <div
              className="stat-value text-success"
              data-testid="posthog-status"
            >
              Connected
            </div>
            <div className="stat-desc">Analytics ready</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Events Tracked</div>
            <div
              className="stat-value text-primary"
              data-testid="events-tracked"
            >
              {eventCount}
            </div>
            <div className="stat-desc">This session</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Last Event</div>
            <div className="stat-value text-sm" data-testid="last-event">
              {lastEvent || "None"}
            </div>
            <div className="stat-desc">Most recent</div>
          </div>
        </div>
      </div>

      {/* User Identification */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-primary">User Identification</h2>
          <p className="text-base-content/70">
            Test PostHog user identification and properties
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Test User ID</span>
            </label>
            <input
              className="input input-bordered"
              readOnly
              type="text"
              value={testUserId}
            />
          </div>

          <div className="card-actions justify-end">
            <Button className="btn-primary" onClick={testUserIdentification}>
              Identify User
            </Button>
            <Button className="btn-outline" onClick={resetAnalytics}>
              Reset Session
            </Button>
          </div>
        </div>
      </div>

      {/* Event Testing */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-secondary">Basic Events</h3>
            <p className="text-base-content/70 text-sm">
              User authentication, page views, and interactions
            </p>
            <div className="card-actions">
              <Button
                className="btn-secondary btn-sm"
                onClick={testBasicEvents}
              >
                Test Basic Events
              </Button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-accent">Podcast Generation</h3>
            <p className="text-base-content/70 text-sm">
              Complete podcast generation workflow analytics
            </p>
            <div className="card-actions">
              <Button className="btn-accent btn-sm" onClick={testPodcastEvents}>
                Test Podcast Flow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-primary">
            Analytics Integration Guide
          </h2>

          <div className="space-y-4">
            <div>
              <h4 className="text-base-content font-semibold">
                Client Components
              </h4>
              <div className="mockup-code text-xs">
                <pre data-prefix="$">
                  <code>
                    import {`{ useEventTracking }`} from
                    &apos;@/lib/feature-flags&apos;;
                  </code>
                </pre>
                <pre data-prefix="$">
                  <code>const {`{ track }`} = useEventTracking();</code>
                </pre>
                <pre data-prefix="$">
                  <code>
                    track(&apos;episode-played&apos;, {`{ episodeId: 'ep-1' }`}
                    );
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
