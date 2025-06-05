"use client";

import { X, Plus, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { api } from "@/lib/trpc/client";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AvailableEpisode {
  id: string;
  title: string;
  source: string;
  description: string;
  publishedAt: string;
  estimatedDuration: string;
}

export function GenerationModal({ isOpen, onClose }: GenerationModalProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStarted, setGenerationStarted] = useState(false);
  const router = useRouter();

  // Get available episodes for generation
  const { data: availableEpisodes, isLoading: loadingAvailable } =
    api.episodes.getAvailableForGeneration.useQuery();

  // Generate episode mutation
  const generateEpisode = api.episodes.generate.useMutation({
    onSuccess: (data: any) => {
      setGenerationStarted(true);
      setIsGenerating(false);

      // Show success toast after a simulated delay
      setTimeout(() => {
        toast.custom(
          (t: any) => (
            <div
              className={`bg-success text-success-content px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all ${
                t.visible
                  ? "animate-in fade-in slide-in-from-top-2"
                  : "animate-out fade-out slide-out-to-top-2"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">Episode Ready!</p>
                <p className="text-sm opacity-90">{data.title}</p>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push(`/episodes/${data.id}`);
                  onClose();
                }}
                className="btn btn-sm btn-success-content"
              >
                <Play className="w-3 h-3 mr-1" />
                Listen
              </button>
            </div>
          ),
          { duration: 8000 }
        );
      }, 3000); // Simulate 3 second generation time
    },
    onError: () => {
      setIsGenerating(false);
      toast.custom(
        (t: any) => (
          <div
            className={`bg-error text-error-content px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all ${
              t.visible
                ? "animate-in fade-in slide-in-from-top-2"
                : "animate-out fade-out slide-out-to-top-2"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-medium">Generation Failed</p>
              <p className="text-sm opacity-90">Please try again later</p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="btn btn-sm btn-ghost"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    },
  });

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
