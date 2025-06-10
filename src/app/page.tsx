import {
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Headphones,
  Play,
  Plus as _Plus,
  Zap,
} from "lucide-react";
import Link from "next/link";

import {
  EpisodeCard,
  GenerateButton,
  GenerateEpisodeButton,
} from "@/components/features";
import { ApiTest } from "@/components/features/api-test";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { type Episode } from "@/lib/mock-data";
import {
  mockEpisodes,
  mockGenerationStats,
  mockSources,
} from "@/lib/mock-data";

import { HomeClientWrapper } from "./home-client-wrapper";

// Simple fallback function when DB is not available
function getServerDataWithFallback() {
  // Temporarily use mock data to avoid server-side rendering issues
  // Using mock data for development - expected behavior
  return {
    episodes: mockEpisodes.slice(0, 3),
    queueStats: mockGenerationStats,
    sources: mockSources.filter((s) => s.active),
  };
}

export default function Home() {
  // Fetch initial data on the server with fallback to mock data
  const {
    episodes: rawEpisodes,
    queueStats,
    sources: activeSources,
  } = getServerDataWithFallback();

  // Convert to UI format (episodes are already in correct format if from mock data)
  const episodes = rawEpisodes as Episode[];

  // Helper functions for cleaner conditional logic
  const getQueueItemsValue = () => {
    if (!queueStats) return 0;
    if ("total" in queueStats) return queueStats.total;
    return queueStats.totalInQueue;
  };

  const getQueueItemsChange = () => {
    if (!queueStats) return null;
    if ("active" in queueStats) {
      return queueStats.active ? `${queueStats.active} processing` : null;
    }
    return queueStats.currentlyProcessing
      ? `${queueStats.currentlyProcessing} processing`
      : null;
  };

  const getSuccessRateValue = () => {
    if (!queueStats) return "0%";
    if ("successRate" in queueStats) {
      return `${Math.round((queueStats.successRate || 0) * 100)}%`;
    }
    if ("total" in queueStats && "completed" in queueStats) {
      const stats = queueStats as { completed: number; total: number };
      if (stats.total > 0) {
        return `${Math.round((stats.completed / stats.total) * 100)}%`;
      }
    }
    return "0%";
  };

  const quickStats = [
    {
      change: "+2",
      color: "text-primary",
      icon: Headphones,
      label: "Episodes Today",
      value: episodes.filter((ep) => {
        const today = new Date();
        const epDate = new Date(ep.createdAt);
        return epDate.toDateString() === today.toDateString();
      }).length,
    },
    {
      change: null,
      color: "text-success",
      icon: Globe,
      label: "Active Sources",
      value: activeSources?.length || 0,
    },
    {
      change: getQueueItemsChange(),
      color: "text-warning",
      icon: Clock,
      label: "Queue Items",
      value: getQueueItemsValue(),
    },
    {
      change: "Last 7 days",
      color: "text-info",
      icon: CheckCircle,
      label: "Success Rate",
      value: getSuccessRateValue(),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Welcome Header - Server Component */}
        <div className="text-center">
          <h1 className="text-base-content mb-2 text-3xl font-bold lg:text-4xl">
            Welcome to Morning Pod
          </h1>
          <p className="text-base-content/70 mx-auto mb-3 max-w-2xl text-lg lg:text-xl">
            AI-powered podcast generation from your favorite news sources. Stay
            informed with personalized audio content delivered daily.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="gap-2" size="lg" variant="primary">
              <Play className="h-5 w-5" />
              Play Latest Episode
            </Button>
            <GenerateEpisodeButton />
          </div>
        </div>

        {/* Quick Stats - Server Component */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                className="card bg-base-100 border-base-300 border shadow-sm"
                key={stat.label}
              >
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base-content/60 text-sm">
                        {stat.label}
                      </p>
                      <p className="text-base-content text-2xl font-bold">
                        {String(stat.value)}
                      </p>
                      {stat.change && (
                        <p className="text-base-content/70 text-xs">
                          {stat.change}
                        </p>
                      )}
                    </div>
                    <div
                      className={`bg-base-200 flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Episodes - Server Component */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Episodes</h2>
              <Link href="/episodes">
                <Button btnStyle="ghost" className="gap-2" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {episodes.map((episode) => (
                  <EpisodeCard episode={episode} key={episode.id} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Headphones className="text-base-content/30 mx-auto mb-4 h-12 w-12" />
                <h3 className="text-base-content mb-2 text-lg font-medium">
                  No episodes yet
                </h3>
                <p className="text-base-content/60 mb-4">
                  Generate your first episode from one of your news sources
                </p>
                <GenerateButton />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Server Component */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Sources Management */}
          <div className="card from-primary/5 to-primary/10 border-primary/20 border bg-gradient-to-br">
            <div className="card-body p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
                  <Globe className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base-content font-semibold">
                    News Sources
                  </h3>
                  <p className="text-base-content/60 text-sm">
                    {activeSources?.length || 0} active sources
                  </p>
                </div>
              </div>
              <p className="text-base-content/70 mb-4">
                Manage your news sources and configure content preferences for
                episode generation.
              </p>
              <div className="flex gap-2">
                <Link href="/sources">
                  <Button btnStyle="outline" size="sm">
                    Manage Sources
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Generation Queue */}
          <div className="card from-accent/5 to-accent/10 border-accent/20 border bg-gradient-to-br">
            <div className="card-body p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-accent/20 flex h-10 w-10 items-center justify-center rounded-full">
                  <Zap className="text-accent h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base-content font-semibold">
                    Generation Queue
                  </h3>
                  <p className="text-base-content/60 text-sm">
                    {(() => {
                      if (!queueStats) return 0;
                      if ("active" in queueStats)
                        return Number(queueStats.active) || 0;
                      return Number(queueStats.currentlyProcessing) || 0;
                    })()}{" "}
                    processing
                  </p>
                </div>
              </div>
              <p className="text-base-content/70 mb-4">
                Monitor episode generation progress and queue status in
                real-time.
              </p>
              <div className="flex gap-2">
                <Link href="/queue">
                  <Button btnStyle="outline" size="sm">
                    View Queue
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Debug/Development Section - Client Component wrapped */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <h2 className="mb-4 text-xl font-semibold">API Connection Test</h2>
            <HomeClientWrapper>
              <ApiTest />
            </HomeClientWrapper>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
