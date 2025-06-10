"use client";

import { Mic, Play } from "lucide-react";

import { type Episode } from "@/lib/mock-data/episodes";

interface EpisodeCardV2Props {
  episode?: Episode;
}

export function EpisodeCardV2({ episode }: EpisodeCardV2Props) {
  // Handle undefined episode data
  if (!episode) {
    return (
      <div className="card from-base-100 to-base-200 bg-gradient-to-br shadow-lg">
        <div className="card-body p-6">
          <div className="animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-base-300 h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-base-300 h-4 w-3/4 rounded" />
                <div className="bg-base-300 h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-base-300 h-3 w-full rounded" />
              <div className="bg-base-300 h-3 w-2/3 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card from-base-100 to-base-200 bg-gradient-to-br shadow-lg">
      <div className="card-body p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
            <Mic className="text-primary h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="card-title line-clamp-1 text-base">
              {episode.title}
            </h3>
            <p className="text-base-content/60 text-sm">{episode.sourceId}</p>
          </div>
        </div>
        <p className="text-base-content/80 mb-4 line-clamp-3 text-sm">
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
              <Play className="h-4 w-4" />
              Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
