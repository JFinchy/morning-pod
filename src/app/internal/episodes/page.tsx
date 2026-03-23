"use client";

import { Filter, Grid, List, Search } from "lucide-react";
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
type FilterStatus = "all" | "failed" | "generating" | "pending" | "ready";

export default function InternalEpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // Fetch episodes
  const { data: episodesData, error: episodesError } =
    api.episodes.getAll.useQuery({
      limit: 100, // Show more for admin
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
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-base-content">
                Episode Administration
              </h1>
              <p className="text-sm text-base-content/60">
                Monitor and manage all generated podcast content
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode("grid")}
                size="sm"
                variant={viewMode === "grid" ? "primary" : "secondary"}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                size="sm"
                variant={viewMode === "list" ? "primary" : "secondary"}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                className={`stats shadow cursor-pointer transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-primary-content"
                    : "bg-base-200"
                }`}
                key={status}
                onClick={() => setStatusFilter(status as FilterStatus)}
              >
                <div className="stat p-4">
                  <div className="stat-title text-xs opacity-70 uppercase font-bold tracking-wider">
                    {status}
                  </div>
                  <div className="stat-value text-2xl">{count}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                className="input input-bordered w-full pl-10 h-10"
                onChange={(e) => setSearchQuery(sanitizeString(e.target.value))}
                placeholder="Filter by title or content..."
                type="text"
                value={searchQuery}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-base-content/50" />
              <select
                className="select select-bordered select-sm h-10"
                onChange={(e) =>
                  setStatusFilter(e.target.value as FilterStatus)
                }
                value={statusFilter}
              >
                <option value="all">All Statuses</option>
                <option value="ready">Ready</option>
                <option value="generating">Generating</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <EpisodeListSkeleton count={8} />
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="text-center py-20 bg-base-200/30 rounded-2xl border-2 border-dashed border-base-300">
              <p className="text-base-content/50">
                No episodes found matching your filters.
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredEpisodes.map((episode) => (
                <EpisodeCard
                  episode={episode}
                  key={episode.id}
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
