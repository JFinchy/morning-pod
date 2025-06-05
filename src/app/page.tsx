import {
  Play,
  Plus,
  Clock,
  Zap,
  Globe,
  Headphones,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { EpisodeCard } from "@/components/features";
import { ApiTest } from "@/components/features/api-test";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  Episode,
  mockEpisodes,
  mockSources,
  mockGenerationStats,
} from "@/lib/mock-data";

import { HomeClientWrapper } from "./home-client-wrapper";

// Simple fallback function when DB is not available
async function getServerDataWithFallback() {
  try {
    // Try to import the server caller only when needed
    const { getServerApi } = await import("@/lib/trpc/server-api");
    const serverTrpc = await getServerApi();

    const [recentEpisodesData, activeSources, queueStats] = await Promise.all([
      serverTrpc.episodes.getAll({ limit: 3 }),
      serverTrpc.sources.getActive(),
      serverTrpc.queue.getStats(),
    ]);

    return {
      episodes: recentEpisodesData?.episodes || [],
      sources: activeSources || [],
      queueStats: queueStats || {
        totalInQueue: 0,
        currentlyProcessing: 0,
        successRate: 0,
      },
    };
  } catch (error) {
    console.warn("Database connection failed, using mock data:", error);
    // Return mock data when database is not available
    return {
      episodes: mockEpisodes.slice(0, 3),
      sources: mockSources.filter((s) => s.active),
      queueStats: mockGenerationStats,
    };
  }
}

export default async function Home() {
  // Fetch initial data on the server with fallback to mock data
  const {
    episodes: rawEpisodes,
    sources: activeSources,
    queueStats,
  } = await getServerDataWithFallback();

  // Convert to UI format (episodes are already in correct format if from mock data)
  const episodes = rawEpisodes as Episode[];

  const quickStats = [
    {
      label: "Episodes Today",
      value: episodes.filter((ep) => {
        const today = new Date();
        const epDate = new Date(ep.createdAt);
        return epDate.toDateString() === today.toDateString();
      }).length,
      icon: Headphones,
      color: "text-primary",
      change: "+2",
    },
    {
      label: "Active Sources",
      value: activeSources?.length || 0,
      icon: Globe,
      color: "text-success",
      change: null,
    },
    {
      label: "Queue Items",
      value: queueStats?.totalInQueue || 0,
      icon: Clock,
      color: "text-warning",
      change: queueStats?.currentlyProcessing
        ? `${queueStats.currentlyProcessing} processing`
        : null,
    },
    {
      label: "Success Rate",
      value: queueStats
        ? `${Math.round((queueStats.successRate || 0) * 100)}%`
        : "0%",
      icon: CheckCircle,
      color: "text-info",
      change: "Last 7 days",
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
            <Button variant="primary" size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Play Latest Episode
            </Button>
            <Button btnStyle="outline" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Generate New Episode
            </Button>
          </div>
        </div>

        {/* Quick Stats - Server Component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card bg-base-100 shadow-sm border border-base-300"
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
                <Button btnStyle="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {episodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
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
                <Button variant="primary">Generate Episode</Button>
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
