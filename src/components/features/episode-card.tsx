"use client";

import {
  Play,
  Pause,
  Clock,
  Headphones,
  Download,
  Share2,
  TrendingUp,
  Music,
  Loader2,
  AlertCircle,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Episode } from "@/lib/db/schema";
import { useFavorites } from "@/lib/hooks/use-favorites";

interface EpisodeCardProps {
  episode: Episode;
  onPlay?: (episode: Episode) => void;
  onPause?: () => void;
  isCurrentlyPlaying?: boolean;
  className?: string;
}

export function EpisodeCard({
  episode,
  onPlay,
  onPause,
  isCurrentlyPlaying = false,
  className = "",
}: EpisodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

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

  const handlePlayPause = () => {
    if (isCurrentlyPlaying) {
      onPause?.();
    } else {
      onPlay?.(episode);
    }
  };

  const canPlay = episode.status === "ready" && episode.audioUrl;

  return (
    <div
      className={`card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">
              Created {new Date(episode.createdAt).toLocaleDateString()}
            </p>
            {isCurrentlyPlaying && (
              <div className="flex items-center gap-1 text-primary text-xs">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Now Playing
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <p
            className={`text-sm text-base-content/70 leading-relaxed ${
              isExpanded ? "" : "line-clamp-3"
            }`}
          >
            {episode.summary}
          </p>
          {episode.summary.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:text-primary-focus mt-1 font-medium"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Episode Stats */}
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
            {episode.audioSize && (
              <div className="flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                <span className="font-medium">
                  {(episode.audioSize / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status-specific Content */}
        {episode.status === "generating" && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-warning" />
              <span className="text-sm text-warning font-medium">
                Audio is being generated...
              </span>
            </div>
          </div>
        )}

        {episode.status === "failed" && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-error" />
              <span className="text-sm text-error font-medium">
                Generation failed
              </span>
            </div>
          </div>
        )}

        {episode.status === "pending" && (
          <div className="mb-4 p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-info" />
              <span className="text-sm text-info font-medium">
                Queued for generation
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {canPlay ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handlePlayPause}
                className="flex items-center gap-2"
              >
                {isCurrentlyPlaying ? (
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
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Generating...
              </Button>
            ) : episode.status === "pending" ? (
              <Button size="sm" btnStyle="outline" disabled>
                <Clock className="w-3 h-3 mr-2" />
                Queued
              </Button>
            ) : episode.status === "failed" ? (
              <Button
                size="sm"
                variant="error"
                btnStyle="outline"
                onClick={() => {
                  // TODO: Implement retry functionality
                }}
              >
                <AlertCircle className="w-3 h-3 mr-2" />
                Retry
              </Button>
            ) : null}
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-1">
            <Button
              size="sm"
              btnStyle="ghost"
              className={`w-8 h-8 p-0 ${
                isFavorite(episode.id)
                  ? "text-error hover:text-error-focus"
                  : "text-base-content/50 hover:text-base-content"
              }`}
              title={
                isFavorite(episode.id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              onClick={() => toggleFavorite(episode.id)}
            >
              <Heart
                className={`w-3 h-3 ${
                  isFavorite(episode.id) ? "fill-current" : ""
                }`}
              />
            </Button>
            {canPlay && (
              <>
                <Button
                  size="sm"
                  btnStyle="ghost"
                  className="w-8 h-8 p-0"
                  title="Download"
                  onClick={() => {
                    if (episode.audioUrl) {
                      window.open(episode.audioUrl, "_blank");
                    }
                  }}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  btnStyle="ghost"
                  className="w-8 h-8 p-0"
                  title="Share"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // TODO: Add toast notification
                  }}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cost Information (for debugging/admin) */}
        {episode.generationCost && Number(episode.generationCost) > 0 && (
          <div className="mt-3 pt-3 border-t border-base-300">
            <span className="text-xs text-base-content/40">
              Generation cost: ${Number(episode.generationCost).toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
