"use client";

import { Play } from "lucide-react";

import { type Episode } from "@/lib/mock-data/episodes";

interface EpisodeCardV3Props {
  episode?: Episode;
}

export function EpisodeCardV3({ episode }: EpisodeCardV3Props) {
  // Handle undefined episode data
  if (!episode) {
    return (
      <div className="hover:bg-base-200/50 flex items-center gap-4 rounded-lg p-4 transition-colors">
        <div className="bg-base-300 h-12 w-2 flex-shrink-0 animate-pulse rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="bg-base-300 h-4 w-3/4 rounded" />
          <div className="bg-base-300 h-3 w-full rounded" />
        </div>
        <div className="bg-base-300 h-8 w-8 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <div className="hover:bg-base-200/50 flex items-center gap-4 rounded-lg p-4 transition-colors">
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
            {episode.sourceId}
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
            {episode.status}
          </span>
        </div>
      </div>
      {episode.status === "ready" && (
        <button className="btn btn-circle btn-sm btn-ghost">
          <Play className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
