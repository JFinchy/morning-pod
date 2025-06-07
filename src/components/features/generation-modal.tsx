"use client";

import {
  X,
  Plus,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button, Dialog, DialogContent, DialogTrigger } from "@/components/ui";

interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface GenerationStep {
  name: string;
  status: "pending" | "active" | "completed" | "failed";
  message?: string;
}

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerationModal({ isOpen, onClose }: GenerationModalProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // Initial generation steps
  const initialSteps: GenerationStep[] = [
    { name: "Source Verification", status: "pending" },
    { name: "Content Scraping", status: "pending" },
    { name: "AI Summarization", status: "pending" },
    { name: "Text-to-Speech", status: "pending" },
    { name: "Audio Storage", status: "pending" },
    { name: "Database Save", status: "pending" },
  ];

  // Fetch available sources when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSources();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setSelectedSource("");
    setIsGenerating(false);
    setGenerationSteps(initialSteps);
    setGenerationResult(null);
    setError("");
  };

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/episodes/generate?action=sources");
      const data = await response.json();

      if (data.success) {
        setSources(data.sources);
        // Auto-select first source if available
        if (data.sources.length > 0) {
          setSelectedSource(data.sources[0].id);
        }
      } else {
        setError("Failed to load sources");
      }
    } catch (err) {
      setError("Network error loading sources");
      console.error("Error fetching sources:", err);
    }
  };

  const startGeneration = async () => {
    if (!selectedSource) {
      setError("Please select a news source");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGenerationResult(null);

    // Reset steps to pending
    setGenerationSteps(initialSteps);

    try {
      const response = await fetch("/api/episodes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: selectedSource,
        }),
      });

      const result = await response.json();
      setGenerationResult(result);

      if (result.success) {
        // Mark all steps as completed on success
        setGenerationSteps((steps) =>
          steps.map((step) => ({
            ...step,
            status: "completed",
            message: "Step completed successfully",
          }))
        );
      } else {
        // Handle partial completion and errors
        if (result.steps) {
          updateStepsFromResult(result.steps);
        }
        setError(result.error || "Generation failed");
      }
    } catch (err) {
      setError("Network error during generation");
      console.error("Generation error:", err);

      // Mark first step as failed
      setGenerationSteps((steps) =>
        steps.map((step, index) =>
          index === 0
            ? { ...step, status: "failed", message: "Network error" }
            : step
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStepsFromResult = (resultSteps: any) => {
    const stepMapping = {
      scraping: 0,
      summarization: 1,
      tts: 2,
      storage: 3,
      database: 4,
    };

    setGenerationSteps((steps) => {
      const newSteps = [...steps];

      Object.entries(resultSteps).forEach(
        ([stepName, stepResult]: [string, any]) => {
          const stepIndex = stepMapping[stepName as keyof typeof stepMapping];
          if (stepIndex !== undefined) {
            newSteps[stepIndex] = {
              ...newSteps[stepIndex],
              status: stepResult.success ? "completed" : "failed",
              message:
                stepResult.error ||
                (stepResult.success ? "Completed" : "Failed"),
            };
          }
        }
      );

      return newSteps;
    });
  };

  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-error" />;
      case "active":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-base-content/40" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-w-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                Generate New Episode
              </h2>
              <p className="text-base-content/70">
                Create an AI-powered podcast episode from your news sources
              </p>
            </div>
            <Button
              btnStyle="ghost"
              size="sm"
              onClick={onClose}
              className="btn-circle"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Source Selection */}
          {!isGenerating && !generationResult && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Select News Source
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                >
                  <option value="">Choose a news source...</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.category})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={startGeneration}
                  disabled={!selectedSource}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Generate Episode
                </Button>
                <Button btnStyle="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {(isGenerating || generationResult) && (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  Generation Progress
                </h3>
                <p className="text-sm text-base-content/70">
                  {isGenerating
                    ? "Processing your episode..."
                    : generationResult?.success
                      ? "Episode generated successfully!"
                      : "Generation completed with errors"}
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {generationSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      step.status === "completed"
                        ? "bg-success/10"
                        : step.status === "failed"
                          ? "bg-error/10"
                          : step.status === "active"
                            ? "bg-primary/10"
                            : "bg-base-200/50"
                    }`}
                  >
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <p className="font-medium text-base-content">
                        {step.name}
                      </p>
                      {step.message && (
                        <p className="text-sm text-base-content/70">
                          {step.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results */}
              {generationResult && (
                <div className="mt-6 p-4 bg-base-200/50 rounded-lg">
                  <h4 className="font-semibold text-base-content mb-2">
                    Generation Summary
                  </h4>
                  <div className="text-sm text-base-content/70 space-y-1">
                    {generationResult.success ? (
                      <>
                        <p>✅ Episode created successfully</p>
                        <p>
                          💰 Total cost: ${generationResult.totalCost || "0.00"}
                        </p>
                        {generationResult.episode && (
                          <p>🎧 Episode ID: {generationResult.episode.id}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p>❌ Generation failed: {generationResult.error}</p>
                        {generationResult.totalCost && (
                          <p>💰 Partial cost: ${generationResult.totalCost}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!isGenerating && (
                  <>
                    {generationResult?.success ? (
                      <Button variant="primary" onClick={onClose}>
                        View Episode
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          resetState();
                        }}
                      >
                        Try Again
                      </Button>
                    )}
                    <Button btnStyle="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
