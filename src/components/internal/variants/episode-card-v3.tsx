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
      <div className="flex items-center gap-4 p-4 hover:bg-base-200/50 rounded-lg transition-colors">
        <div className="w-2 h-12 bg-base-300 rounded-full flex-shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-base-300 rounded w-3/4" />
          <div className="h-3 bg-base-300 rounded w-full" />
        </div>
        <div className="w-8 h-8 bg-base-300 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-base-200/50 rounded-lg transition-colors">
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
          <Play className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
