"use client";

import { Play, Mic } from "lucide-react";

import { Episode } from "@/lib/mock-data/episodes";

interface EpisodeCardV2Props {
  episode?: Episode;
}

export function EpisodeCardV2({ episode }: EpisodeCardV2Props) {
  // Handle undefined episode data
  if (!episode) {
    return (
      <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg">
        <div className="card-body p-6">
          <div className="animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-base-300"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-base-300 rounded w-3/4"></div>
                <div className="h-3 bg-base-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-base-300 rounded w-full"></div>
              <div className="h-3 bg-base-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg">
      <div className="card-body p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="card-title text-base line-clamp-1">
              {episode.title}
            </h3>
            <p className="text-sm text-base-content/60">{episode.sourceId}</p>
          </div>
        </div>
        <p className="text-sm text-base-content/80 line-clamp-3 mb-4">
          {episode.summary}
        </p>
        <div className="flex items-center justify-between">
          <div
            className={`badge ${
              episode.status === "ready"
                ? "badge-success"
                : episode.status === "generating"
                  ? "badge-warning"
                  : "badge-error"
            }`}
          >
            {episode.status}
          </div>
          {episode.status === "ready" && (
            <button className="btn btn-sm btn-primary">
              <Play className="w-4 h-4" />
              Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
