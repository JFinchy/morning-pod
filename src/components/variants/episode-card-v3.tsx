"use client";

import {
  Play,
  Pause,
  Clock,
  Headphones,
  MoreHorizontal,
  Circle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Episode,
  formatDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/mock-data/episodes";

interface EpisodeCardV3Props {
  episode: Episode;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function EpisodeCardV3({
  episode,
  onPlay,
  onPause,
  className = "",
}: EpisodeCardV3Props) {
  const handlePlayPause = () => {
    if (episode.isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const getStatusIndicator = () => {
    switch (episode.status) {
      case "ready":
        return <Circle className="w-2 h-2 fill-success text-success" />;
      case "generating":
        return <div className="loading loading-spinner loading-xs"></div>;
      case "pending":
        return <Circle className="w-2 h-2 fill-warning text-warning" />;
      case "failed":
        return <Circle className="w-2 h-2 fill-error text-error" />;
      default:
        return <Circle className="w-2 h-2 fill-base-300 text-base-300" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 hover:bg-base-200/50 rounded-lg transition-colors group ${className}`}
    >
      {/* Status Indicator */}
      <div className="flex-shrink-0 flex items-center justify-center w-6">
        {getStatusIndicator()}
      </div>

      {/* Episode Indicator Bar */}
      <div className="w-1 h-12 bg-primary/30 rounded-full flex-shrink-0 relative overflow-hidden">
        {episode.isPlaying && episode.progress !== undefined && (
          <div
            className="absolute bottom-0 left-0 w-full bg-primary rounded-full transition-all duration-300"
            style={{ height: `${episode.progress}%` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title and Source */}
            <h3 className="font-semibold text-sm text-base-content truncate group-hover:text-primary transition-colors">
              {episode.title}
            </h3>
            <p className="text-xs text-base-content/60 truncate mt-0.5">
              {episode.source.name} • {episode.source.category}
            </p>

            {/* Summary (on larger screens) */}
            <p className="text-xs text-base-content/50 line-clamp-1 mt-1 hidden sm:block">
              {episode.summary}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex-shrink-0 text-right">
            {episode.status === "ready" && (
              <div className="flex items-center gap-3 text-xs text-base-content/60">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(episode.duration)}</span>
                </div>
                {episode.playCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    <span>{episode.playCount}</span>
                  </div>
                )}
              </div>
            )}

            {episode.status !== "ready" && (
              <div className="text-xs text-base-content/60">
                {getStatusText(episode.status)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {episode.status === "ready" ? (
          <Button
            size="sm"
            btnStyle="ghost"
            onClick={handlePlayPause}
            className="w-8 h-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
            title={episode.isPlaying ? "Pause" : "Play"}
          >
            {episode.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        ) : episode.status === "generating" ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="loading loading-spinner loading-sm"></div>
          </div>
        ) : null}

        {/* More Options */}
        <Button
          size="sm"
          btnStyle="ghost"
          className="w-8 h-8 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
