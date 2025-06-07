"use client";

import {
  Search,
  Filter,
  Grid,
  List,
  Play,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

import { EpisodeCard } from "@/components/features";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import ErrorBoundary from "@/components/ui/error-boundary";
import { EpisodeListSkeleton } from "@/components/ui/loading-skeleton";
import { api, handleTRPCError } from "@/lib/trpc/client";
import { sanitizeString } from "@/lib/utils/api-middleware";
import { usePerformanceTracking } from "@/lib/utils/performance";

export default function EpisodesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { trackInteraction } = usePerformanceTracking();

  const {
    data: episodesData,
    isLoading,
    error,
  } = api.episodes.getAll.useQuery({
    limit: 20,
  });

  const episodes = episodesData?.episodes || [];

  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch =
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || episode.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = episodes.reduce(
    (acc, episode) => {
      acc[episode.status] = (acc[episode.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusOptions = [
    { value: "all", label: "All Episodes", count: episodes.length },
    { value: "ready", label: "Ready", count: statusCounts.ready || 0 },
    {
      value: "generating",
      label: "Generating",
      count: statusCounts.generating || 0,
    },
    { value: "failed", label: "Failed", count: statusCounts.failed || 0 },
  ];

  // Handle errors
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-base-content mb-2">
              Failed to load episodes
            </h2>
            <p className="text-base-content/70 mb-4">
              {handleTRPCError(error)}
            </p>
            <Button onClick={() => window.location.reload()} className="gap-2">
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-base-content">
                All Episodes
              </h1>
              <p className="text-base-content/60">
                {episodes.length} episodes • {statusCounts.ready || 0} ready to
                play
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Play Latest
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search episodes..."
                    className="input input-bordered w-full pl-10"
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(sanitizeString(e.target.value))
                    }
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-base-content/50" />
                  <div className="flex flex-wrap gap-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`btn btn-sm ${
                          statusFilter === option.value
                            ? "btn-primary"
                            : "btn-ghost"
                        }`}
                        onClick={() => {
                          setStatusFilter(option.value);
                          trackInteraction("filter_episodes", option.value);
                        }}
                      >
                        {option.label}
                        <span className="badge badge-sm ml-1">
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center">
                  <div className="join">
                    <button
                      className={`join-item btn btn-sm ${
                        viewMode === "grid" ? "btn-active" : "btn-ghost"
                      }`}
                      onClick={() => {
                        setViewMode("grid");
                        trackInteraction("change_view_mode", "grid");
                      }}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      className={`join-item btn btn-sm ${
                        viewMode === "list" ? "btn-active" : "btn-ghost"
                      }`}
                      onClick={() => {
                        setViewMode("list");
                        trackInteraction("change_view_mode", "list");
                      }}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Episode Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
              <div className="stat-figure text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Ready Episodes</div>
              <div className="stat-value text-primary">
                {statusCounts.ready || 0}
              </div>
              <div className="stat-desc">Available for playback</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
              <div className="stat-figure text-warning">
                <Clock className="w-8 h-8" />
              </div>
              <div className="stat-title">In Progress</div>
              <div className="stat-value text-warning">
                {statusCounts.generating || 0}
              </div>
              <div className="stat-desc">Currently generating</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
              <div className="stat-figure text-info">
                <Play className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Plays</div>
              <div className="stat-value text-info">
                {episodes.reduce((sum, ep) => sum + ep.playCount, 0)}
              </div>
              <div className="stat-desc">Across all episodes</div>
            </div>
          </div>

          {/* Episodes Grid/List */}
          {isLoading && <EpisodeListSkeleton count={6} />}

          {!isLoading && filteredEpisodes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-base-content/50 mb-2">
                <Search className="w-12 h-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-base-content mb-2">
                No episodes found
              </h3>
              <p className="text-base-content/60">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No episodes have been generated yet"}
              </p>
            </div>
          )}

          {!isLoading && filteredEpisodes.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {filteredEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredEpisodes.length > 0 && (
            <div className="text-center py-6">
              <Button btnStyle="ghost" size="lg">
                Load More Episodes
              </Button>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}
