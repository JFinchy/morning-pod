"use client";

import {
  Play,
  Pause,
  Clock,
  Headphones,
  Download,
  Share2,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { type Episode } from "@/lib/mock-data/episodes";
import {
  formatDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/mock-data/episodes";

interface EpisodeCardProps {
  episode?: Episode;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  variant?: "default" | "compact";
}

export function EpisodeCard({
  episode,
  onPlay,
  onPause,
  className = "",
  variant = "default",
}: EpisodeCardProps) {
  // Handle undefined episode data with loading skeleton
  if (!episode) {
    return (
      <div className="card bg-base-100 shadow-sm border-0">
        <div className="card-body p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-base-300 rounded w-3/4"></div>
            <div className="h-3 bg-base-300 rounded w-full"></div>
            <div className="h-3 bg-base-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }
  const handlePlayPause = () => {
    if (episode.isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

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
              {episode.source?.name || episode.sourceId}
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
        {episode.status === "ready" && (
          <Button
            size="sm"
            btnStyle="ghost"
            onClick={handlePlayPause}
            className="h-8 w-8 p-0 hover:scale-110 transition-transform duration-200 active:scale-95"
          >
            {episode.isPlaying ? (
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
      className={`card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 ${className}`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="card-title text-lg font-bold text-base-content line-clamp-2 mb-2">
            {episode.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">
              {episode.source?.name || `Source ${episode.sourceId}`}
            </p>
            <div className={`badge badge-${getStatusColor(episode.status)}`}>
              {getStatusText(episode.status)}
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-base-content/70 line-clamp-3 mb-4 leading-relaxed">
          {episode.summary}
        </p>

        {/* Progress Bar (if playing) */}
        {episode.isPlaying &&
          episode.progress !== undefined &&
          episode.progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-base-content/60 mb-1">
                <span>Playing...</span>
                <span>{episode.progress}%</span>
              </div>
              <div className="progress progress-primary w-full h-2">
                <div
                  className="progress-bar transition-all duration-300"
                  style={{ width: `${episode.progress}%` }}
                />
              </div>
            </div>
          )}

        {/* Stats */}
        {episode.status === "ready" && (
          <div className="flex items-center gap-6 mb-4 text-xs text-base-content/60">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {formatDuration(episode.duration)}
              </span>
            </div>
            {episode.playCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4" />
                <span className="font-medium">{episode.playCount} plays</span>
              </div>
            )}
            {episode.playCount > 50 && (
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Popular</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {episode.status === "ready" ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handlePlayPause}
                className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 active:scale-95"
              >
                {episode.isPlaying ? (
                  <>
                    <Pause className="w-3 h-3" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Play
                  </>
                )}
              </Button>
            ) : episode.status === "generating" ? (
              <Button size="sm" btnStyle="outline" disabled>
                <div className="loading loading-spinner loading-xs mr-2"></div>
                Generating...
              </Button>
            ) : null}
          </div>

          {/* Secondary Actions */}
          {episode.status === "ready" && (
            <div className="flex gap-1">
              <Button
                size="sm"
                btnStyle="ghost"
                className="w-8 h-8 p-0"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                btnStyle="ghost"
                className="w-8 h-8 p-0"
                title="Share"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
