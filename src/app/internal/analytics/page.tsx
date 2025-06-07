"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import {
  useEventTracking,
  useFeatureFlagAnalytics,
  usePodcastAnalytics,
  usePlayerAnalytics,
  useUserIdentification,
} from "@/lib/feature-flags";

export default function AnalyticsPage() {
  const [testUserId] = useState(() => `test-user-${Date.now()}`);
  const [eventCount, setEventCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  // Analytics hooks
  const { identify, reset } = useUserIdentification();
  const {
    track,
    trackPageView,
    trackInteraction,
    trackError: _trackError,
    trackPerformance: _trackPerformance,
  } = useEventTracking();
  const {
    trackFeatureFlag: _trackFeatureFlag,
    trackExperimentView: _trackExperimentView,
    trackExperimentConversion: _trackExperimentConversion,
  } = useFeatureFlagAnalytics();
  const {
    trackGenerationStarted,
    trackGenerationCompleted,
    trackContentScraped,
    trackContentSummarized,
    trackAudioGenerated,
  } = usePodcastAnalytics();
  const {
    trackEpisodePlayed: _trackEpisodePlayed,
    trackEpisodePaused: _trackEpisodePaused,
    trackEpisodeCompleted: _trackEpisodeCompleted,
    trackEpisodeDownloaded: _trackEpisodeDownloaded,
  } = usePlayerAnalytics();

  // Test functions
  const testUserIdentification = () => {
    identify({
      userId: testUserId,
      email: "test@example.com",
      name: "Test User",
      subscriptionTier: "premium",
      signupDate: new Date().toISOString(),
      totalEpisodesGenerated: 5,
      preferredSources: ["tldr", "hacker-news"],
      preferredVoices: ["alloy", "nova"],
    });
    setLastEvent("User Identified");
    setEventCount((prev) => prev + 1);
  };

  const testBasicEvents = () => {
    track("user-signed-in", {
      userId: testUserId,
      email: "test@example.com",
      method: "email",
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
    trackGenerationStarted("tldr", "TLDR Newsletter", 30);
    trackContentScraped("tldr", "TLDR Newsletter", 5, 3.2);
    trackContentSummarized("tldr", 2500, 250, "gpt-4", 0.12, 8.5);
    trackAudioGenerated("tldr", 250, 45, "alloy", 0.68);
    trackGenerationCompleted("tldr", "TLDR Newsletter", 32.5, 45, 0.8);

    setLastEvent("Podcast Generation Flow");
    setEventCount((prev) => prev + 5);
  };

  const resetAnalytics = () => {
    reset();
    setLastEvent("Analytics Reset");
    setEventCount(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-base-300 pb-6">
        <h1 className="text-3xl font-bold text-base-content">
          Analytics Dashboard
        </h1>
        <p className="text-base-content/70 mt-2">
          Test and monitor PostHog analytics integration
        </p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              type="text"
              className="input input-bordered"
              value={testUserId}
              readOnly
            />
          </div>

          <div className="card-actions justify-end">
            <Button onClick={testUserIdentification} className="btn-primary">
              Identify User
            </Button>
            <Button onClick={resetAnalytics} className="btn-outline">
              Reset Session
            </Button>
          </div>
        </div>
      </div>

      {/* Event Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-secondary">Basic Events</h3>
            <p className="text-sm text-base-content/70">
              User authentication, page views, and interactions
            </p>
            <div className="card-actions">
              <Button
                onClick={testBasicEvents}
                className="btn-secondary btn-sm"
              >
                Test Basic Events
              </Button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-accent">Podcast Generation</h3>
            <p className="text-sm text-base-content/70">
              Complete podcast generation workflow analytics
            </p>
            <div className="card-actions">
              <Button onClick={testPodcastEvents} className="btn-accent btn-sm">
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
              <h4 className="font-semibold text-base-content">
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
