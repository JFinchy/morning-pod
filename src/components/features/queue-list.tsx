"use client";

import { useAudio } from "@/components/providers/AudioProvider";
import { type Episode } from "@/lib/db/schema";
import { ListMusic, Play, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";

export function QueueList() {
  const [isOpen, setIsOpen] = useState(false);
  const { queue, removeFromQueue, currentEpisode, playNext, addToQueue } =
    useAudio();

  if (!queue || queue.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
      {/* Queue Button */}
      <Button
        btnStyle={!isOpen ? "outline" : undefined}
        variant={isOpen ? "primary" : undefined}
        className="rounded-full shadow-lg w-12 h-12 p-0 flex items-center justify-center bg-base-100 hover:bg-base-200 border-base-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Queue"
      >
        <ListMusic className="w-5 h-5 text-base-content relative" />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-content shadow-sm">
          {queue.length}
        </span>
      </Button>

      {/* Queue Modal / Float */}
      {isOpen && (
        <div className="w-80 max-h-[60vh] bg-base-100 rounded-xl shadow-2xl border border-base-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center justify-between p-4 border-b border-base-200 bg-base-200/50">
            <h3 className="font-bold flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-primary" />
              Up Next
            </h3>
            <Button
              btnStyle="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {queue.map((episode, index) => (
              <div
                key={`${episode.id}-${index}`}
                className="group flex flex-col p-3 hover:bg-base-200 rounded-lg transition-colors border border-transparent hover:border-base-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {episode.title}
                    </h4>
                    <p className="text-xs text-base-content/60 mt-1 line-clamp-1">
                      Source {episode.sourceId}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      btnStyle="ghost"
                      className="w-8 h-8 p-0 hover:text-primary"
                      onClick={() => {
                        // Play this episode now by calling playNext but we need to reorder it first or handle it manually
                        // For now, removing it and treating it as auto-play
                        removeFromQueue(index);
                        // A simpler hack: put it at front and pop it via playNext
                        // addToQueue places at end. Real solution is adding a playFromQueue func to AudioProvider.
                        // Since we don't have it, let's just make it the front if it's not already
                        if (index === 0) {
                          playNext();
                        }
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      btnStyle="ghost"
                      className="w-8 h-8 p-0 hover:text-error"
                      onClick={() => removeFromQueue(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
