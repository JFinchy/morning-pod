"use client";

import { Grid, List, Play, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EpisodeCard } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import ErrorBoundary from "@/components/ui/error-boundary";
import { EpisodeListSkeleton } from "@/components/ui/loading-skeleton";
import { type Episode } from "@/lib/db/schema";
import { api, handleTRPCError } from "@/lib/trpc/client";
import { sanitizeString } from "@/lib/utils/api-middleware";

type ViewMode = "grid" | "list";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // Fetch episodes
  const { data: episodesData, error: episodesError } =
    api.episodes.getAll.useQuery(
      {
        limit: 50,
      },
      {
        refetchInterval: (query) => {
          // Check if any episode is currently generating or pending
          const hasInProgress = query.state.data?.episodes.some((ep) =>
            ["generating", "pending"].includes(ep.status)
          );
          // Refetch every 3 seconds if there are in-progress generations
          return hasInProgress ? 3000 : false;
        },
      }
    );

  useEffect(() => {
    if (episodesData) {
      // Show episodes that are ready or currently generating/pending
      setEpisodes(
        episodesData.episodes.filter((ep) =>
          ["ready", "generating", "pending", "failed"].includes(ep.status)
        )
      );
      setIsLoading(false);
    }
    if (episodesError) {
      setError(handleTRPCError(episodesError));
      setIsLoading(false);
    }
  }, [episodesData, episodesError]);

  // Filter episodes based on search
  const filteredEpisodes = episodes.filter((episode) => {
    const title = episode.title || "";
    const summary = episode.summary || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="min-h-screen bg-base-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
            <div className="container mx-auto px-6 py-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-base-content flex items-center gap-3">
                    <Play className="w-10 h-10 text-primary" />
                    My Episode Library
                  </h1>
                  <p className="text-lg text-base-content/60 mt-2 max-w-2xl">
                    Your personalized AI-generated podcasts. Listen to your
                    latest news summaries, deep dives, and daily briefings.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-base-200 p-1 rounded-lg">
                  <Button
                    onClick={() => setViewMode("grid")}
                    btnStyle={viewMode !== "grid" ? "ghost" : undefined}
                    variant={viewMode === "grid" ? "primary" : undefined}
                    className="h-9 px-4 rounded-full"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    btnStyle={viewMode !== "list" ? "ghost" : undefined}
                    variant={viewMode === "list" ? "primary" : undefined}
                    className="h-9 px-4 rounded-full"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                  <input
                    className="input input-bordered w-full pl-10 h-11"
                    onChange={(e) =>
                      setSearchQuery(sanitizeString(e.target.value))
                    }
                    placeholder="Search your library..."
                    type="text"
                    value={searchQuery}
                  />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && <EpisodeListSkeleton count={6} />}

            {/* Error State */}
            {error && (
              <div className="alert alert-error mb-6">
                <div>
                  <strong>Error loading episodes:</strong> {error}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredEpisodes.length === 0 && (
              <div className="text-center py-20 bg-base-200/30 rounded-2xl border-2 border-dashed border-base-300">
                <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-10 h-10 text-base-content/30" />
                </div>
                <h3 className="text-2xl font-semibold text-base-content mb-2">
                  {searchQuery
                    ? "No episodes match your search"
                    : "Your library is empty"}
                </h3>
                <p className="text-base-content/50 mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? "Try a different search term or browse your sources to generate new content."
                    : "Head over to your sources to start generating AI-powered podcast episodes from your favorite news."}
                </p>
                {!searchQuery && (
                  <Link href="/sources">
                    <Button className="w-full" btnStyle="outline">
                      Discover Sources
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Episodes Grid/List */}
            {!isLoading && !error && filteredEpisodes.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-4 max-w-4xl mx-auto"
                }
              >
                {filteredEpisodes.map((episode) => (
                  <EpisodeCard
                    className={
                      viewMode === "list"
                        ? "max-w-none"
                        : "hover:scale-[1.02] transition-transform duration-300"
                    }
                    episode={episode}
                    key={episode.id}
                    variant={viewMode === "list" ? "compact" : "default"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
