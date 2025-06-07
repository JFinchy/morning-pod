"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Progress,
} from "@/components/ui";
import {
  Loader2,
  Play,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { z } from "zod";

/**
 * Generation request validation
 */
const GenerationRequestSchema = z.object({
  sourceUrl: z.string().url("Please enter a valid URL"),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .default("alloy"),
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
  title: z.string().optional(),
});

type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

/**
 * Voice options with descriptions
 */
const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy - Neutral, professional" },
  { value: "echo", label: "Echo - Warm, conversational" },
  { value: "fable", label: "Fable - Expressive, storytelling" },
  { value: "onyx", label: "Onyx - Deep, authoritative" },
  { value: "nova", label: "Nova - Bright, energetic" },
  { value: "shimmer", label: "Shimmer - Soft, gentle" },
] as const;

/**
 * Model options
 */
const MODEL_OPTIONS = [
  { value: "tts-1", label: "Standard Quality - Faster, lower cost" },
  { value: "tts-1-hd", label: "HD Quality - Higher quality, 2x cost" },
] as const;

/**
 * Generation progress stages
 */
interface GenerationProgress {
  stage:
    | "scraping"
    | "summarizing"
    | "generating_audio"
    | "saving"
    | "complete"
    | "error";
  progress: number;
  message: string;
  details?: string;
  cost?: number;
}

/**
 * Generated episode result
 */
interface GeneratedEpisode {
  id: string;
  title: string;
  summary: string;
  audioUrl: string;
  duration: number;
  cost: number;
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
    sourceUrl: "",
    voice: "alloy",
    model: "tts-1",
    title: "",
  });
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedEpisode, setGeneratedEpisode] =
    useState<GeneratedEpisode | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

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
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
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
      stage: "scraping",
      progress: 0,
      message: "Starting generation...",
    });
    setGeneratedEpisode(null);

    try {
      const response = await fetch("/api/episodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
                  stage: data.stage,
                  progress: data.progress,
                  message: data.message,
                  details: data.details,
                  cost: data.cost,
                });
              } else if (data.type === "complete") {
                setGeneratedEpisode(data.episode);
                setProgress({
                  stage: "complete",
                  progress: 100,
                  message: "Episode generated successfully!",
                  cost: data.episode.cost,
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
        stage: "error",
        progress: 0,
        message: "Generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
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
      sourceUrl: "",
      voice: "alloy",
      model: "tts-1",
      title: "",
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
        return { label: "Scraping Content", color: "text-blue-600" };
      case "summarizing":
        return { label: "AI Summarization", color: "text-purple-600" };
      case "generating_audio":
        return { label: "Generating Audio", color: "text-green-600" };
      case "saving":
        return { label: "Saving Episode", color: "text-orange-600" };
      case "complete":
        return { label: "Complete", color: "text-green-700" };
      case "error":
        return { label: "Error", color: "text-red-600" };
      default:
        return { label: "Processing", color: "text-gray-600" };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="btn btn-primary">Generate Episode</Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              type="url"
              placeholder="https://example.com/article"
              className={`input input-bordered w-full ${
                errors.sourceUrl ? "input-error" : ""
              }`}
              value={formData.sourceUrl}
              onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
              disabled={isGenerating}
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
              type="text"
              placeholder="Leave empty to auto-generate"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Voice</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.voice}
              onChange={(e) => handleInputChange("voice", e.target.value)}
              disabled={isGenerating}
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
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              disabled={isGenerating}
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
            <div className="space-y-4 p-4 bg-base-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress.stage === "error" ? (
                    <AlertCircle className="w-5 h-5 text-error" />
                  ) : progress.stage === "complete" ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin" />
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

              <Progress value={progress.progress} className="w-full" />

              <div className="text-sm">
                <p>{progress.message}</p>
                {progress.details && (
                  <p className="text-gray-500 mt-1">{progress.details}</p>
                )}
                {progress.cost && (
                  <p className="text-gray-500 mt-1">
                    Cost so far: ${progress.cost.toFixed(3)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generated Episode Display */}
          {generatedEpisode && (
            <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Episode Generated Successfully!
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg">
                    {generatedEpisode.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
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
                  <Button size="sm" className="btn btn-primary btn-sm">
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                  <Button size="sm" className="btn btn-outline btn-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" className="btn btn-outline btn-sm">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleClose}
              disabled={isGenerating}
              className="btn btn-outline"
            >
              {isGenerating ? "Generating..." : "Cancel"}
            </Button>

            {!generatedEpisode && (
              <Button
                onClick={startGeneration}
                disabled={isGenerating || !formData.sourceUrl}
                className="btn btn-primary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Episode"
                )}
              </Button>
            )}

            {generatedEpisode && (
              <Button
                onClick={() => {
                  resetModal();
                  setIsOpen(false);
                }}
                className="btn btn-primary"
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
