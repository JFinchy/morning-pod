"use client";

import { Clock, Headphones, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type Episode,
  formatDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/mock-data/episodes";

interface EpisodeCardV1Props {
  className?: string;
  episode?: Episode;
  onPause?: () => void;
  onPlay?: () => void;
}

export function EpisodeCardV1({
  className = "",
  episode,
  onPause,
  onPlay,
}: EpisodeCardV1Props) {
  // Handle undefined episode data
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
    if (episode.isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  return (
    <div
      className={`card bg-base-100 border-base-300 border shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="card-title text-base-content line-clamp-2 text-base font-semibold">
              {episode.title}
            </h3>
            <p className="text-base-content/60 mt-1 text-sm">
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
        <p className="text-base-content/80 mb-4 line-clamp-3 text-sm">
          {episode.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-base-content/60 flex items-center gap-4 text-xs">
            {episode.status === "ready" && (
              <>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(episode.duration)}</span>
                </div>
                {episode.playCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Headphones className="h-3 w-3" />
                    <span>{episode.playCount} plays</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Button */}
          {episode.status === "ready" ? (
            <Button
              btnStyle="ghost"
              className="h-8 w-8 p-0"
              onClick={handlePlayPause}
              size="sm"
            >
              {episode.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          ) : episode.status === "generating" ? (
            <div className="loading loading-spinner loading-sm" />
          ) : null}
        </div>

        {/* Progress Bar (if playing) */}
        {episode.isPlaying &&
          episode.progress !== undefined &&
          episode.progress > 0 && (
            <div className="mt-3">
              <div className="progress progress-primary h-1 w-full">
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
