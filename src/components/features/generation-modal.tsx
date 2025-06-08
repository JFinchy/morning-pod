"use client";

import { X, Plus, Clock, CheckCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

// Type for available episodes from the tRPC getAvailableForGeneration endpoint
type AvailableEpisode = {
  id: string;
  title: string;
  source: string;
  description: string;
  publishedAt: string;
  estimatedDuration: string;
};

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerationModal({ isOpen, onClose }: GenerationModalProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStarted, setGenerationStarted] = useState(false);
  const router = useRouter();

  // Get available episodes for generation
  // TODO: Implement getAvailableForGeneration endpoint
  // const { data: availableEpisodes, isLoading: loadingAvailable } =
  //   api.episodes.getAvailableForGeneration.useQuery();
  const availableEpisodes: AvailableEpisode[] = [];
  const loadingAvailable = false;

  // Define the generate episode input type based on the tRPC schema
  type GenerateEpisodeInput = {
    episodeId: string;
  };

  // Define the generate episode response type based on the mock implementation
  type GenerateEpisodeResponse = {
    id: string;
    title: string;
    source: string;
    status: "generating";
    message: string;
  };

  // Generate episode mutation
  // TODO: Implement generate endpoint
  // const generateEpisode = api.episodes.generate.useMutation({
  const generateEpisode = {
    mutate: (data: GenerateEpisodeInput) => {
      console.log("Generate episode:", data);
      // Mock response for development
      const response: GenerateEpisodeResponse = {
        id: `ep-${Date.now()}`,
        title: "Mock Generated Episode",
        source: "Development",
        status: "generating",
        message: "Episode generation started successfully",
      };
      return Promise.resolve(response);
    },
    isLoading: false,
    error: null,
  };
  // Original mutation code (commented out until endpoints are implemented):
  /*
  const generateEpisode = api.episodes.generate.useMutation({
    onSuccess: (data: any) => {
      setGenerationStarted(true);
      setIsGenerating(false);
      // ... rest of success handler
    },
    onError: () => {
      setIsGenerating(false);
      // ... rest of error handler
    },
  });
  */

  const handleGenerate = () => {
    if (!selectedEpisode) return;

    setIsGenerating(true);
    generateEpisode.mutate({ episodeId: selectedEpisode });
  };

  const handleClose = () => {
    setSelectedEpisode(null);
    setGenerationStarted(false);
    setIsGenerating(false);
    onClose();
  };

  const goToEpisodes = () => {
    router.push("/episodes");
    handleClose();
  };

  // Loading state
  if (loadingAvailable) {
    return (
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent>
          <DialogTitle className="sr-only">Loading Episodes</DialogTitle>
          <div className="flex items-center justify-center p-8">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <span className="ml-3 text-base-content">
              Loading available episodes...
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No episodes available
  if (!availableEpisodes || availableEpisodes.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-xl font-bold text-base-content">
                Generate Episode
              </DialogTitle>
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-base-content mb-2">
                All Daily Episodes Created!
              </h3>
              <p className="text-base-content/70 mb-6">
                You&apos;ve generated all available episodes for today. Check
                back tomorrow for new content, or listen to your existing
                episodes.
              </p>
              <button onClick={goToEpisodes} className="btn btn-primary gap-2">
                <Play className="w-4 h-4" />
                Go to Episodes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Generation started confirmation
  if (generationStarted) {
    return (
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-xl font-bold text-base-content">
                Generation Started
              </DialogTitle>
              <button
                onClick={handleClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-base-content mb-2">
                Episode Creation Started
              </h3>
              <p className="text-base-content/70 mb-6">
                Your episode is being generated and could take a few minutes.
                Please check your Episodes section and refresh until it appears.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={goToEpisodes}
                  className="btn btn-primary gap-2"
                >
                  <Play className="w-4 h-4" />
                  Go to Episodes
                </button>
                <button onClick={handleClose} className="btn btn-ghost">
                  Close
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Episode selection
  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent size="xl">
        <div className="flex items-center justify-between mb-6">
          <DialogTitle className="text-xl font-bold text-base-content">
            Generate New Episode
          </DialogTitle>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-base-content/70 mb-6">
          Select an episode to generate from today&apos;s available content:
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
          {availableEpisodes.map((episode) => (
            <div
              key={episode.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedEpisode === episode.id
                  ? "border-primary bg-primary/10"
                  : "border-base-300 hover:border-base-400 hover:bg-base-200/50"
              }`}
              onClick={() => setSelectedEpisode(episode.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base-content mb-1">
                    {episode.title}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {episode.source}
                  </p>
                  <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                    {episode.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-base-content/60">
                    <span>Published {episode.publishedAt}</span>
                    <span>~{episode.estimatedDuration}</span>
                  </div>
                </div>

                {selectedEpisode === episode.id && (
                  <div className="ml-4">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary-content" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/60">
            {availableEpisodes.length} episode
            {availableEpisodes.length !== 1 ? "s" : ""} available
          </p>

          <div className="flex gap-3">
            <button onClick={handleClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedEpisode || isGenerating}
              className="btn btn-primary gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate Episode
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
