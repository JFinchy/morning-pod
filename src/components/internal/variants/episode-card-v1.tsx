"use client";

import { Play, Pause, Clock, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Episode,
  formatDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/mock-data/episodes";

interface EpisodeCardV1Props {
  episode?: Episode;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function EpisodeCardV1({
  episode,
  onPlay,
  onPause,
  className = "",
}: EpisodeCardV1Props) {
  // Handle undefined episode data
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

  return (
    <div
      className={`card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="card-title text-base font-semibold line-clamp-2 text-base-content">
              {episode.title}
            </h3>
            <p className="text-sm text-base-content/60 mt-1">
              {episode.source?.name}
            </p>
          </div>

          {/* Status Badge */}
          <div
            className={`badge badge-${getStatusColor(episode.status)} badge-sm`}
          >
            {getStatusText(episode.status)}
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-base-content/80 line-clamp-3 mb-4">
          {episode.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-base-content/60">
            {episode.status === "ready" && (
              <>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(episode.duration)}</span>
                </div>
                {episode.playCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    <span>{episode.playCount} plays</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Button */}
          {episode.status === "ready" ? (
            <Button
              size="sm"
              btnStyle="ghost"
              onClick={handlePlayPause}
              className="h-8 w-8 p-0"
            >
              {episode.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          ) : episode.status === "generating" ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : null}
        </div>

        {/* Progress Bar (if playing) */}
        {episode.isPlaying &&
          episode.progress !== undefined &&
          episode.progress > 0 && (
            <div className="mt-3">
              <div className="progress progress-primary w-full h-1">
                <div
                  className="progress-bar"
                  style={{ width: `${episode.progress}%` }}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
