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
      <div className="card bg-base-100 shadow-sm border-0">
        <div className="card-body p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-base-300 rounded w-3/4" />
            <div className="h-3 bg-base-300 rounded w-full" />
            <div className="h-3 bg-base-300 rounded w-2/3" />
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
      <div className="flex items-center gap-4 p-4 hover:bg-base-200/50 rounded-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-md border border-transparent hover:border-base-300">
        <div
          className={`w-2 h-12 rounded-full flex-shrink-0 ${
            episode.status === "ready"
              ? "bg-success"
              : episode.status === "generating"
                ? "bg-warning"
                : "bg-error"
          }`}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{episode.title}</h3>
          <p className="text-xs text-base-content/60 line-clamp-1">
            {episode.summary}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-base-content/40">
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
            className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-200 active:scale-95"
            onClick={handlePlayPause}
            size="sm"
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  // Default variant - enhanced with best features
  return (
    <div
      className={`card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 ${
        isCurrentlyPlaying ? "ring-2 ring-primary" : ""
      } ${className}`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="card-title text-lg font-bold text-base-content line-clamp-2 flex-1 mr-2">
              {episode.title}
            </h3>
            <div
              className={`badge badge-${getStatusColor(episode.status)} badge-sm flex-shrink-0`}
            >
              {getStatusText(episode.status)}
            </div>
          </div>

          {/* Episode metadata */}
          <div className="flex items-center gap-3 text-sm text-base-content/60 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(episode.duration || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Music className="w-4 h-4" />
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
              className="text-primary text-xs font-medium mt-1 hover:underline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Progress bar for generating episodes */}
        {episode.status === "generating" && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-warning" />
              <span className="text-sm font-medium text-warning">
                Generating episode...
              </span>
            </div>
            <progress
              className="progress progress-warning w-full"
              max="100"
              value={30}
            />
            <div className="text-xs text-base-content/60 mt-1">
              30% complete
            </div>
          </div>
        )}

        {/* Error state */}
        {episode.status === "failed" && (
          <div className="alert alert-error mb-4 p-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Generation failed</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto">
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
                <Pause className="w-4 h-4 mr-1" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
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
                    className={`w-4 h-4 ${
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
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  btnStyle="ghost"
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                  size="sm"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Episode stats */}
          <div className="flex items-center gap-3 text-xs text-base-content/50">
            {episode.playCount && episode.playCount > 0 && (
              <div className="flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                <span>{episode.playCount}</span>
              </div>
            )}
            {episode.duration && episode.duration > 60 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Long</span>
              </div>
            )}
          </div>
        </div>

        {/* Audio waveform visualization (placeholder) */}
        {canPlay && isCurrentlyPlaying && (
          <div className="mt-4 h-8 bg-base-300 rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/20" />
            <div className="absolute left-0 top-0 h-full bg-primary/60 transition-all duration-300 w-1/3" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono text-base-content/60">
                ♪♫♪ Playing ♪♫♪
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
