"use client";

import {
  AlertCircle,
  Clock,
  Download,
  Headphones,
  Heart,
  Loader2,
  MoreHorizontal,
  Music,
  Pause,
  Play,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type Episode } from "@/lib/db/schema";
import { useFavorites } from "@/lib/hooks/use-favorites";

interface EpisodeCardProps {
  className?: string;
  episode?: Episode;
  isCurrentlyPlaying?: boolean;
  onPause?: () => void;
  onPlay?: (episode: Episode) => void;
  variant?: "compact" | "default";
}

const formatDuration = (seconds: number) => {
  if (!seconds || seconds === 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready":
      return "success";
    case "generating":
      return "warning";
    case "pending":
      return "info";
    case "failed":
      return "error";
    default:
      return "neutral";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ready":
      return "Ready";
    case "generating":
      return "Generating";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};

export function EpisodeCard({
  className = "",
  episode,
  isCurrentlyPlaying = false,
  onPause,
  onPlay,
  variant = "default",
}: EpisodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Handle undefined episode data with loading skeleton
  if (!episode) {
    return (
      <div className="card bg-base-100 border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="animate-pulse space-y-2">
            <div className="bg-base-300 h-4 w-3/4 rounded" />
            <div className="bg-base-300 h-3 w-full rounded" />
            <div className="bg-base-300 h-3 w-2/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (isCurrentlyPlaying) {
      onPause?.();
    } else {
      onPlay?.(episode);
    }
  };

  const canPlay = episode.status === "ready" && episode.audioUrl;

  // Compact variant for list views
  if (variant === "compact") {
    return (
      <div className="hover:bg-base-200/50 hover:border-base-300 flex items-center gap-4 rounded-lg border border-transparent p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md">
        <div
          className={`h-12 w-2 flex-shrink-0 rounded-full ${
            episode.status === "ready"
              ? "bg-success"
              : episode.status === "generating"
                ? "bg-warning"
                : "bg-error"
          }`}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">{episode.title}</h3>
          <p className="text-base-content/60 line-clamp-1 text-xs">
            {episode.summary}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base-content/40 text-xs">
              {episode.sourceId || "Unknown source"}
            </span>
            <span
              className={`text-xs font-medium ${
                episode.status === "ready"
                  ? "text-success"
                  : episode.status === "generating"
                    ? "text-warning"
                    : "text-error"
              }`}
            >
              {getStatusText(episode.status)}
            </span>
          </div>
        </div>
        {canPlay && (
          <Button
            btnStyle="ghost"
            className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110 active:scale-95"
            onClick={handlePlayPause}
            size="sm"
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  // Default variant - enhanced with best features
  return (
    <div
      className={`card from-base-100 to-base-200 group overflow-hidden border-0 bg-gradient-to-br shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl ${
        isCurrentlyPlaying ? "ring-primary ring-2" : ""
      } ${className}`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="card-title text-base-content mr-2 line-clamp-2 flex-1 text-lg font-bold">
              {episode.title}
            </h3>
            <div
              className={`badge badge-${getStatusColor(episode.status)} badge-sm flex-shrink-0`}
            >
              {getStatusText(episode.status)}
            </div>
          </div>

          {/* Episode metadata */}
          <div className="text-base-content/60 mb-3 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(episode.duration || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>{episode.sourceId || "Unknown"}</span>
            </div>
            {episode.createdAt && (
              <span className="text-xs">
                {new Date(episode.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <p
            className={`text-base-content/80 text-sm leading-relaxed ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {episode.summary}
          </p>
          {episode.summary && episode.summary.length > 120 && (
            <button
              className="text-primary mt-1 text-xs font-medium hover:underline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Progress bar for generating episodes */}
        {episode.status === "generating" && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <Loader2 className="text-warning h-4 w-4 animate-spin" />
              <span className="text-warning text-sm font-medium">
                Generating episode...
              </span>
            </div>
            <progress
              className="progress progress-warning w-full"
              max="100"
              value={30}
            />
            <div className="text-base-content/60 mt-1 text-xs">
              30% complete
            </div>
          </div>
        )}

        {/* Error state */}
        {episode.status === "failed" && (
          <div className="alert alert-error mb-4 p-3">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Generation failed</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Main play/pause button */}
            <Button
              className="transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={!canPlay}
              onClick={handlePlayPause}
              size="sm"
              variant={canPlay ? "primary" : "secondary"}
            >
              {isCurrentlyPlaying ? (
                <Pause className="mr-1 h-4 w-4" />
              ) : (
                <Play className="mr-1 h-4 w-4" />
              )}
              {isCurrentlyPlaying ? "Pause" : "Play"}
            </Button>

            {/* Secondary actions */}
            {canPlay && (
              <>
                <Button
                  btnStyle="ghost"
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={() => toggleFavorite(episode.id)}
                  size="sm"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorite(episode.id)
                        ? "fill-error text-error"
                        : "text-base-content/60"
                    }`}
                  />
                </Button>

                <Button
                  btnStyle="ghost"
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  btnStyle="ghost"
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                  size="sm"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Episode stats */}
          <div className="text-base-content/50 flex items-center gap-3 text-xs">
            {episode.playCount && episode.playCount > 0 && (
              <div className="flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                <span>{episode.playCount}</span>
              </div>
            )}
            {episode.duration && episode.duration > 60 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Long</span>
              </div>
            )}
          </div>
        </div>

        {/* Audio waveform visualization (placeholder) */}
        {canPlay && isCurrentlyPlaying && (
          <div className="bg-base-300 relative mt-4 h-8 overflow-hidden rounded">
            <div className="bg-primary/20 absolute inset-0" />
            <div className="bg-primary/60 absolute top-0 left-0 h-full w-1/3 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base-content/60 font-mono text-xs">
                ♪♫♪ Playing ♪♫♪
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
