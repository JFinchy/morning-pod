import {
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Headphones,
  Play,
  Plus,
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
  console.warn("Using mock data for development");
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
    return queueStats.totalInQueue;
  };

  const getQueueItemsChange = () => {
    if (!queueStats) return null;
    return queueStats.currentlyProcessing
      ? `${queueStats.currentlyProcessing} processing`
      : null;
  };

  const getSuccessRateValue = () => {
    if (!queueStats) return "0%";
    return `${Math.round((queueStats.successRate || 0) * 100)}%`;
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
          <h1 className="text-3xl lg:text-4xl font-bold text-base-content mb-2">
            Welcome to Morning Pod
          </h1>
          <p className="text-lg lg:text-xl text-base-content/70 max-w-2xl mx-auto mb-3">
            AI-powered podcast generation from your favorite news sources. Stay
            informed with personalized audio content delivered daily.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="gap-2" size="lg" variant="primary">
              <Play className="w-5 h-5" />
              Play Latest Episode
            </Button>
            <GenerateEpisodeButton />
          </div>
        </div>

        {/* Quick Stats - Server Component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon as React.ComponentType<{
              className?: string;
            }>;
            return (
              <div
                className="card bg-base-100 shadow-sm border border-base-300"
                key={stat.label}
              >
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-base-content">
                        {stat.value}
                      </p>
                      {stat.change && (
                        <p className="text-xs text-base-content/70">
                          {stat.change}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full bg-base-200 flex items-center justify-center ${stat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Episodes - Server Component */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Episodes</h2>
              <Link href="/episodes">
                <Button btnStyle="ghost" className="gap-2" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {episodes.map((episode) => (
                  <EpisodeCard episode={episode} key={episode.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Headphones className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
                <h3 className="text-lg font-medium text-base-content mb-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sources Management */}
          <div className="card bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base-content">
                    News Sources
                  </h3>
                  <p className="text-sm text-base-content/60">
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
          <div className="card bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-base-content">
                    Generation Queue
                  </h3>
                  <p className="text-sm text-base-content/60">
                    {queueStats?.currentlyProcessing || 0} processing
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
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
            <HomeClientWrapper>
              <ApiTest />
            </HomeClientWrapper>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
