"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Play,
  Share,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Progress,
} from "@/components/ui";

/**
 * Generation request validation
 */
const GenerationRequestSchema = z.object({
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
  sourceUrl: z.string().url("Please enter a valid URL"),
  title: z.string().optional(),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .default("alloy"),
});

type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

/**
 * Voice options with descriptions
 */
const VOICE_OPTIONS = [
  { label: "Alloy - Neutral, professional", value: "alloy" },
  { label: "Echo - Warm, conversational", value: "echo" },
  { label: "Fable - Expressive, storytelling", value: "fable" },
  { label: "Onyx - Deep, authoritative", value: "onyx" },
  { label: "Nova - Bright, energetic", value: "nova" },
  { label: "Shimmer - Soft, gentle", value: "shimmer" },
] as const;

/**
 * Model options
 */
const MODEL_OPTIONS = [
  { label: "Standard Quality - Faster, lower cost", value: "tts-1" },
  { label: "HD Quality - Higher quality, 2x cost", value: "tts-1-hd" },
] as const;

/**
 * Generation progress stages
 */
interface GenerationProgress {
  cost?: number;
  details?: string;
  message: string;
  progress: number;
  stage:
    | "complete"
    | "error"
    | "generating_audio"
    | "saving"
    | "scraping"
    | "summarizing";
}

/**
 * Generated episode result
 */
interface GeneratedEpisode {
  audioUrl: string;
  cost: number;
  duration: number;
  id: string;
  summary: string;
  title: string;
}

interface GenerationModalProps {
  onEpisodeGenerated?: (episode: GeneratedEpisode) => void;
  trigger?: React.ReactNode;
}

/**
 * Generation Modal Component
 */
export function GenerationModal({
  onEpisodeGenerated,
  trigger,
}: GenerationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<GenerationRequest>({
    model: "tts-1",
    sourceUrl: "",
    title: "",
    voice: "alloy",
  });
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedEpisode, setGeneratedEpisode] =
    useState<GeneratedEpisode | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedCost, setEstimatedCost] = useState<null | number>(null);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    try {
      GenerationRequestSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        for (const err of error.errors) {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        }
        setErrors(newErrors);
      }
      return false;
    }
  };

  /**
   * Estimate generation cost
   */
  const estimateCost = (url: string) => {
    if (!url) {
      setEstimatedCost(null);
      return;
    }

    const baseEstimate = formData.model === "tts-1-hd" ? 0.06 : 0.03;
    setEstimatedCost(baseEstimate);
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: keyof GenerationRequest, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "sourceUrl" || field === "model") {
      estimateCost(field === "sourceUrl" ? value : newFormData.sourceUrl);
    }
  };

  /**
   * Start episode generation
   */
  const startGeneration = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setProgress({
      message: "Starting generation...",
      progress: 0,
      stage: "scraping",
    });
    setGeneratedEpisode(null);

    try {
      const response = await fetch("/api/episodes/generate", {
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "progress") {
                setProgress({
                  cost: data.cost,
                  details: data.details,
                  message: data.message,
                  progress: data.progress,
                  stage: data.stage,
                });
              } else if (data.type === "complete") {
                setGeneratedEpisode(data.episode);
                setProgress({
                  cost: data.episode.cost,
                  message: "Episode generated successfully!",
                  progress: 100,
                  stage: "complete",
                });

                if (onEpisodeGenerated) {
                  onEpisodeGenerated(data.episode);
                }
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setProgress({
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Generation failed",
        progress: 0,
        stage: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Reset modal state
   */
  const resetModal = () => {
    setFormData({
      model: "tts-1",
      sourceUrl: "",
      title: "",
      voice: "alloy",
    });
    setProgress(null);
    setGeneratedEpisode(null);
    setErrors({});
    setEstimatedCost(null);
    setIsGenerating(false);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isGenerating) {
      setIsOpen(false);
      resetModal();
    }
  };

  /**
   * Get progress stage display info
   */
  const getStageInfo = (stage: GenerationProgress["stage"]) => {
    switch (stage) {
      case "scraping":
        return { color: "text-blue-600", label: "Scraping Content" };
      case "summarizing":
        return { color: "text-purple-600", label: "AI Summarization" };
      case "generating_audio":
        return { color: "text-green-600", label: "Generating Audio" };
      case "saving":
        return { color: "text-orange-600", label: "Saving Episode" };
      case "complete":
        return { color: "text-green-700", label: "Complete" };
      case "error":
        return { color: "text-red-600", label: "Error" };
      default:
        return { color: "text-gray-600", label: "Processing" };
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="btn btn-primary">Generate Episode</Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Generate New Episode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Article URL</span>
            </label>
            <input
              className={`input input-bordered w-full ${
                errors.sourceUrl ? "input-error" : ""
              }`}
              disabled={isGenerating}
              onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
              placeholder="https://example.com/article"
              type="url"
              value={formData.sourceUrl}
            />
            {errors.sourceUrl && (
              <p className="text-error text-sm">{errors.sourceUrl}</p>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">
                Custom Title (Optional)
              </span>
            </label>
            <input
              className="input input-bordered w-full"
              disabled={isGenerating}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Leave empty to auto-generate"
              type="text"
              value={formData.title}
            />
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Voice</span>
            </label>
            <select
              className="select select-bordered w-full"
              disabled={isGenerating}
              onChange={(e) => handleInputChange("voice", e.target.value)}
              value={formData.voice}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Quality</span>
            </label>
            <select
              className="select select-bordered w-full"
              disabled={isGenerating}
              onChange={(e) => handleInputChange("model", e.target.value)}
              value={formData.model}
            >
              {MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cost Estimation */}
          {estimatedCost && (
            <div className="alert alert-info">
              <span className="text-sm">
                Estimated cost: <strong>${estimatedCost.toFixed(3)}</strong>
              </span>
            </div>
          )}

          {/* Progress Display */}
          {progress && (
            <div className="bg-base-200 space-y-4 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress.stage === "error" ? (
                    <AlertCircle className="text-error h-5 w-5" />
                  ) : progress.stage === "complete" ? (
                    <CheckCircle className="text-success h-5 w-5" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  <span
                    className={`font-medium ${getStageInfo(progress.stage).color}`}
                  >
                    {getStageInfo(progress.stage).label}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {progress.progress}%
                </span>
              </div>

              <Progress className="w-full" value={progress.progress} />

              <div className="text-sm">
                <p>{progress.message}</p>
                {progress.details && (
                  <p className="mt-1 text-gray-500">{progress.details}</p>
                )}
                {progress.cost && (
                  <p className="mt-1 text-gray-500">
                    Cost so far: ${progress.cost.toFixed(3)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generated Episode Display */}
          {generatedEpisode && (
            <div className="bg-success/10 border-success/20 space-y-4 rounded-lg border p-4">
              <div className="text-success flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Episode Generated Successfully!
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold">
                    {generatedEpisode.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {generatedEpisode.summary.slice(0, 150)}...
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Duration: {Math.round(generatedEpisode.duration / 60)}m
                  </span>
                  <span>Cost: ${generatedEpisode.cost.toFixed(3)}</span>
                </div>

                <div className="flex gap-2">
                  <Button className="btn btn-primary btn-sm" size="sm">
                    <Play className="mr-1 h-4 w-4" />
                    Play
                  </Button>
                  <Button className="btn btn-outline btn-sm" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                  <Button className="btn btn-outline btn-sm" size="sm">
                    <Share className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              className="btn btn-outline"
              disabled={isGenerating}
              onClick={handleClose}
            >
              {isGenerating ? "Generating..." : "Cancel"}
            </Button>

            {!generatedEpisode && (
              <Button
                className="btn btn-primary"
                disabled={isGenerating || !formData.sourceUrl}
                onClick={startGeneration}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Episode"
                )}
              </Button>
            )}

            {generatedEpisode && (
              <Button
                className="btn btn-primary"
                onClick={() => {
                  resetModal();
                  setIsOpen(false);
                }}
              >
                Generate Another
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
