"use client";

import { Play, List, Grid, Search, Filter, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

import { EpisodeCard, AudioPlayer } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import type { Episode } from "@/lib/db/schema";
import { api } from "@/lib/trpc/client";

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "ready" | "generating" | "pending" | "failed";

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch episodes
  const {
    data: episodesData,
    isLoading: episodesLoading,
    error: episodesError,
  } = api.episodes.getAll.useQuery({
    limit: 50,
  });

  useEffect(() => {
    if (episodesData) {
      setEpisodes(episodesData.episodes);
      setIsLoading(false);
    }
    if (episodesError) {
      setError(episodesError.message);
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
    ready: episodes.filter((ep) => ep.status === "ready").length,
    generating: episodes.filter((ep) => ep.status === "generating").length,
    pending: episodes.filter((ep) => ep.status === "pending").length,
    failed: episodes.filter((ep) => ep.status === "failed").length,
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-base-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                  <Play className="w-8 h-8 text-primary" />
                  Episode Library
                </h1>
                <p className="text-base-content/70 mt-2">
                  Browse and play your generated podcast episodes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "primary" : "secondary"}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "primary" : "secondary"}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className={`stats shadow cursor-pointer transition-colors ${
                    statusFilter === status
                      ? "bg-primary text-primary-content"
                      : "bg-base-200"
                  }`}
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search episodes..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-base-content/50" />
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as FilterStatus)
                }
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
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          )}

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
            <div className="text-center py-12">
              <Play className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">
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
                <Button variant="primary" size="lg">
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
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onPlay={handlePlayEpisode}
                  onPause={handlePauseEpisode}
                  isCurrentlyPlaying={currentEpisode?.id === episode.id}
                  className={viewMode === "list" ? "max-w-none" : ""}
                />
              ))}
            </div>
          )}
        </div>

        {/* Global Audio Player - Fixed at bottom */}
        {currentEpisode && (
          <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 shadow-2xl z-50">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-primary">
                  <Volume2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Now Playing</span>
                </div>
                <div className="flex-1">
                  <AudioPlayer
                    episode={currentEpisode}
                    autoPlay={true}
                    onEpisodeEnd={handleEpisodeEnd}
                    className="shadow-none bg-transparent"
                  />
                </div>
                <Button
                  size="sm"
                  btnStyle="ghost"
                  onClick={() => setCurrentEpisode(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding to account for fixed player */}
        {currentEpisode && <div className="h-32"></div>}
      </div>
    </MainLayout>
  );
}
