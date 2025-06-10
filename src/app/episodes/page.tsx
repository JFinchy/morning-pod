"use client";

import { Filter, Grid, List, Play, Search, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AudioPlayer, EpisodeCard } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import ErrorBoundary from "@/components/ui/error-boundary";
import { EpisodeListSkeleton } from "@/components/ui/loading-skeleton";
import { type Episode } from "@/lib/db/schema";
import { api, handleTRPCError } from "@/lib/trpc/client";
import { sanitizeString } from "@/lib/utils/api-middleware";
import { usePerformanceTracking } from "@/lib/utils/performance";

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "failed" | "generating" | "pending" | "ready";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // Performance tracking
  const { trackInteraction: _trackInteraction, trackMetric: _trackMetric } =
    usePerformanceTracking();

  // Fetch episodes
  const {
    data: episodesData,
    error: episodesError,
    isLoading: _episodesLoading,
  } = api.episodes.getAll.useQuery({
    limit: 50,
  });

  useEffect(() => {
    if (episodesData) {
      setEpisodes(episodesData.episodes);
      setIsLoading(false);
    }
    if (episodesError) {
      setError(handleTRPCError(episodesError));
      setIsLoading(false);
    }
  }, [episodesData, episodesError]);

  // Filter episodes based on search and status
  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch =
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || episode.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePlayEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
  };

  const handlePauseEpisode = () => {
    setCurrentEpisode(null);
  };

  const handleEpisodeEnd = () => {
    // Auto-play next episode
    const currentIndex = filteredEpisodes.findIndex(
      (ep) => ep.id === currentEpisode?.id
    );
    if (currentIndex >= 0 && currentIndex < filteredEpisodes.length - 1) {
      const nextEpisode = filteredEpisodes[currentIndex + 1];
      if (nextEpisode.status === "ready" && nextEpisode.audioUrl) {
        setCurrentEpisode(nextEpisode);
      } else {
        setCurrentEpisode(null);
      }
    } else {
      setCurrentEpisode(null);
    }
  };

  const statusCounts = {
    all: episodes.length,
    failed: episodes.filter((ep) => ep.status === "failed").length,
    generating: episodes.filter((ep) => ep.status === "generating").length,
    pending: episodes.filter((ep) => ep.status === "pending").length,
    ready: episodes.filter((ep) => ep.status === "ready").length,
  };

  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="bg-base-100 min-h-screen">
          {/* Header */}
          <div className="from-primary/10 to-secondary/10 border-primary/20 border-b bg-gradient-to-r">
            <div className="container mx-auto px-6 py-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-base-content flex items-center gap-3 text-3xl font-bold">
                    <Play className="text-primary h-8 w-8" />
                    Episode Library
                  </h1>
                  <p className="text-base-content/70 mt-2">
                    Browse and play your generated podcast episodes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setViewMode("grid")}
                    size="sm"
                    variant={viewMode === "grid" ? "primary" : "secondary"}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    size="sm"
                    variant={viewMode === "list" ? "primary" : "secondary"}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    className={`stats cursor-pointer shadow transition-colors ${
                      statusFilter === status
                        ? "bg-primary text-primary-content"
                        : "bg-base-200"
                    }`}
                    key={status}
                    onClick={() => setStatusFilter(status as FilterStatus)}
                  >
                    <div className="stat">
                      <div className="stat-title text-xs opacity-70">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                      <div className="stat-value text-lg">{count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="container mx-auto px-6 py-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="text-base-content/50 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <input
                    className="input input-bordered w-full pl-10"
                    onChange={(e) =>
                      setSearchQuery(sanitizeString(e.target.value))
                    }
                    placeholder="Search episodes..."
                    type="text"
                    value={searchQuery}
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="text-base-content/50 h-4 w-4" />
                <select
                  className="select select-bordered"
                  onChange={(e) =>
                    setStatusFilter(e.target.value as FilterStatus)
                  }
                  value={statusFilter}
                >
                  <option value="all">All Episodes</option>
                  <option value="ready">Ready to Play</option>
                  <option value="generating">Generating</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
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
              <div className="py-12 text-center">
                <Play className="text-base-content/30 mx-auto mb-4 h-16 w-16" />
                <h3 className="text-base-content/70 mb-2 text-xl font-semibold">
                  {searchQuery || statusFilter !== "all"
                    ? "No episodes match your criteria"
                    : "No episodes yet"}
                </h3>
                <p className="text-base-content/50 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter settings"
                    : "Generate your first episode to get started"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button size="lg" variant="primary">
                    Generate Episode
                  </Button>
                )}
              </div>
            )}

            {/* Episodes Grid/List */}
            {!isLoading && !error && filteredEpisodes.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-4"
                }
              >
                {filteredEpisodes.map((episode) => (
                  <EpisodeCard
                    className={viewMode === "list" ? "max-w-none" : ""}
                    episode={episode}
                    isCurrentlyPlaying={currentEpisode?.id === episode.id}
                    key={episode.id}
                    onPause={handlePauseEpisode}
                    onPlay={handlePlayEpisode}
                    variant={viewMode === "list" ? "compact" : "default"}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Global Audio Player - Fixed at bottom */}
          {currentEpisode && (
            <div className="bg-base-100 border-base-300 fixed right-0 bottom-0 left-0 z-50 border-t shadow-2xl">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="text-primary flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Now Playing</span>
                  </div>
                  <div className="flex-1">
                    <AudioPlayer
                      autoPlay
                      className="bg-transparent shadow-none"
                      episode={currentEpisode}
                      onEpisodeEnd={handleEpisodeEnd}
                    />
                  </div>
                  <Button
                    btnStyle="ghost"
                    onClick={() => setCurrentEpisode(null)}
                    size="sm"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom padding to account for fixed player */}
          {currentEpisode && <div className="h-32" />}
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
