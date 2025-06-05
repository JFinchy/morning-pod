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
import {
  Episode,
  formatDuration,
  getStatusColor,
  getStatusText,
} from "@/lib/mock-data/episodes";

interface EpisodeCardProps {
  episode: Episode;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function EpisodeCard({
  episode,
  onPlay,
  onPause,
  className = "",
}: EpisodeCardProps) {
  const handlePlayPause = () => {
    if (episode.isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  return (
    <div
      className={`card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${className}`}
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
                className="flex items-center gap-2"
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
