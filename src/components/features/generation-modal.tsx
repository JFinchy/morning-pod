"use client";

import {
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink,
  Loader2,
  Play,
  Search,
  Share,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { useFeatureFlag } from "@/lib/feature-flags/client";
import { api } from "@/lib/trpc/client";
import { useAudio } from "../providers/AudioProvider";

/**
 * Generation request validation with enhanced validation
 */
const GenerationRequestSchema = z.object({
  model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
  sourceId: z.string().optional(),
  sourceUrl: z.string().url("Please enter a valid URL"),
  title: z.string().optional(),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .default("alloy"),
});

type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

/**
 * Voice options with descriptions and feature flag awareness
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
 * Model options with feature flag awareness
 */
const MODEL_OPTIONS = [
  { label: "Standard Quality - Fast and efficient", value: "tts-1" },
  { label: "HD Quality - Premium audio", value: "tts-1-hd" },
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
  voice: string;
}

interface GenerationModalProps {
  autoStart?: boolean;
  initialSource?: any;
  onEpisodeGenerated?: (episode: GeneratedEpisode) => void;
  trigger?: React.ReactNode;
}

/**
 * Generation Modal Component with Enhanced Features
 *
 * @business-context Enhanced modal for progressive rollout via PostHog
 *                   feature flags. Includes source selection, real-time
 *                   validation, and improved progress tracking.
 * @decision-date 2024-01-15
 * @decision-by Product team for enhanced user experience
 */
export function GenerationModal({
  autoStart = false,
  initialSource,
  onEpisodeGenerated,
  trigger,
}: GenerationModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<GenerationRequest>({
    model: "tts-1",
    sourceId: initialSource?.id || "",
    sourceUrl: initialSource?.url || "",
    title: "",
    voice: "alloy",
  });
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedEpisode, setGeneratedEpisode] =
    useState<GeneratedEpisode | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedCost, setEstimatedCost] = useState<null | number>(null);

  // Enhanced state for source selection
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [sourceSearch, setSourceSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState<any>(
    initialSource || null
  );

  const { playEpisode } = useAudio();

  // Initialize cost if initial source is provided
  useEffect(() => {
    if (initialSource?.url) {
      estimateCost(initialSource.url);
    }
  }, [initialSource]);

  // Handle auto-start
  useEffect(() => {
    if (
      isOpen &&
      autoStart &&
      formData.sourceUrl &&
      !isGenerating &&
      !generatedEpisode &&
      !progress
    ) {
      startGeneration();
    }
  }, [isOpen]);

  // Feature flags
  const premiumTtsEnabled = useFeatureFlag("premium-tts-enabled");
  const realTimeQueueEnabled = useFeatureFlag("real-time-queue-enabled");
  const advancedPlayerEnabled = useFeatureFlag("advanced-player-enabled");

  // Fetch available sources
  const { data: sources, isLoading: sourcesLoading } =
    api.sources.getActive.useQuery();
  const { data: sourcesByCategory } = api.sources.getByCategory.useQuery();

  // Filtered sources for search
  const filteredSources = useMemo(() => {
    if (!sources) return [];
    if (!sourceSearch) return sources;

    return sources.filter(
      (source) =>
        source.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
        source.category.toLowerCase().includes(sourceSearch.toLowerCase()) ||
        source.url.toLowerCase().includes(sourceSearch.toLowerCase())
    );
  }, [sources, sourceSearch]);

  /**
   * Enhanced form validation with real-time feedback
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
   * Real-time validation on input change
   */
  useEffect(() => {
    if (formData.sourceUrl) {
      // Debounced validation
      const timer = setTimeout(() => {
        try {
          GenerationRequestSchema.pick({ sourceUrl: true }).parse({
            sourceUrl: formData.sourceUrl,
          });
          setErrors((prev) => ({ ...prev, sourceUrl: "" }));
        } catch (error) {
          if (error instanceof z.ZodError) {
            const urlError = error.errors.find(
              (e) => e.path[0] === "sourceUrl"
            );
            if (urlError) {
              setErrors((prev) => ({ ...prev, sourceUrl: urlError.message }));
            }
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.sourceUrl]);

  /**
   * Enhanced cost estimation with premium features
   */
  const estimateCost = (url: string, model: string = formData.model) => {
    if (!url) {
      setEstimatedCost(null);
      return;
    }

    // Base cost calculation with premium multipliers
    let baseEstimate = model === "tts-1-hd" ? 0.06 : 0.03;

    // Premium TTS adjustment
    if (premiumTtsEnabled && model === "tts-1-hd") {
      baseEstimate *= 1.5; // Premium quality multiplier
    }

    setEstimatedCost(baseEstimate);
  };

  /**
   * Handle source selection
   */
  const handleSourceSelect = (source: any) => {
    setSelectedSource(source);
    setFormData((prev) => ({
      ...prev,
      sourceId: source.id,
      sourceUrl: source.url,
    }));
    setShowSourceSelector(false);
    estimateCost(source.url);
  };

  /**
   * Handle form input changes with enhanced validation
   */
  const handleInputChange = (field: keyof GenerationRequest, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear errors for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Update cost estimation
    if (field === "sourceUrl" || field === "model") {
      estimateCost(
        field === "sourceUrl" ? value : newFormData.sourceUrl,
        newFormData.model
      );
    }
  };

  /**
   * Enhanced generation with WebSocket support and detailed progress
   * Uses mock endpoint during development to avoid AI costs
   */
  const startGeneration = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setProgress({
      details: "Setting up secure connection and validating source",
      message: "Initializing generation pipeline...",
      progress: 0,
      stage: "scraping",
    });
    setGeneratedEpisode(null);

    try {
      // Enhanced request with additional context
      const sourceId =
        formData.sourceId || (formData.sourceUrl ? "manual-entry" : "");

      const enhancedRequest = {
        ...formData,
        sourceId,
        featureFlags: {
          advancedPlayer: advancedPlayerEnabled,
          premiumTts: premiumTtsEnabled,
          realTimeQueue: realTimeQueueEnabled,
        },
        metadata: {
          selectedSourceName: selectedSource?.name,
          sourceId,
          timestamp: new Date().toISOString(),
        },
      };

      // Use mock API endpoint in development to avoid AI costs
      // This will use our NASA mock audio file
      const apiEndpoint =
        process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === "true"
          ? "/api/episodes/mocks/generate-mock" // Use the moved mock endpoint
          : "/api/episodes/generate";

      console.log(
        `Using API endpoint: ${apiEndpoint} (MOCKING: ${process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === "true" ? "ENABLED" : "DISABLED"})`
      );

      const response = await fetch(apiEndpoint, {
        body: JSON.stringify({
          ...enhancedRequest,
          sourceId,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Feature-Flags": JSON.stringify(enhancedRequest.featureFlags),
        },
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

      // Enhanced progress tracking with detailed stages
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
                  details:
                    data.details ||
                    getDetailedProgressMessage(data.stage, data.progress),
                  message: data.message,
                  progress: data.progress,
                  stage: data.stage,
                });
              } else if (data.type === "complete") {
                const episodeData = data.data || data.episode || {};
                const cost = episodeData.totalCost ?? episodeData.cost ?? 0;
                const duration = episodeData.duration ?? 0;

                setGeneratedEpisode({
                  ...episodeData,
                  cost,
                  id: episodeData.episodeId || episodeData.id,
                });

                setProgress({
                  cost,
                  details: `Generated ${Math.round(duration / 60)}m episode: ${episodeData.title || "New Episode"}`,
                  message: "Episode generated successfully!",
                  progress: 100,
                  stage: "complete",
                });

                // Sync UI state
                router.refresh();

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
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        message: "Generation failed",
        progress: 0,
        stage: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Get detailed progress messages for better UX
   */
  const getDetailedProgressMessage = (
    stage: GenerationProgress["stage"],
    progress: number
  ): string => {
    switch (stage) {
      case "scraping":
        if (progress < 30) return "Fetching article content...";
        if (progress < 70) return "Parsing and cleaning content...";
        return "Validating content quality...";
      case "summarizing":
        if (progress < 40) return "Analyzing article structure...";
        if (progress < 80) return "Generating AI summary...";
        return "Optimizing summary for audio...";
      case "generating_audio":
        if (progress < 25) return "Preparing text for synthesis...";
        if (progress < 75) return "Converting text to speech...";
        return "Processing audio quality...";
      case "saving":
        if (progress < 50) return "Uploading audio file...";
        return "Finalizing episode metadata...";
      default:
        return "Processing...";
    }
  };

  /**
   * Reset modal state
   */
  const resetModal = () => {
    setFormData({
      model: "tts-1",
      sourceId: "",
      sourceUrl: "",
      title: "",
      voice: "alloy",
    });
    setProgress(null);
    setGeneratedEpisode(null);
    setErrors({});
    setEstimatedCost(null);
    setIsGenerating(false);
    setShowSourceSelector(false);
    setSourceSearch("");
    setSelectedSource(null);
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

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Generate New Episode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Selection Enhancement */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Content Source</span>
              <span className="label-text-alt text-xs text-base-content/60">
                Choose from curated sources or enter custom URL
              </span>
            </label>

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  className={`input input-bordered w-full ${
                    errors.sourceUrl ? "input-error" : ""
                  }`}
                  disabled={isGenerating}
                  onChange={(e) =>
                    handleInputChange("sourceUrl", e.target.value)
                  }
                  placeholder={
                    selectedSource
                      ? selectedSource.name
                      : "https://example.com/article or select from sources"
                  }
                  type="url"
                  value={formData.sourceUrl}
                />
                {selectedSource && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>Using {selectedSource.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>

              <Button
                className="btn btn-outline btn-sm"
                disabled={isGenerating || sourcesLoading}
                onClick={() => setShowSourceSelector(true)}
                type="button"
              >
                <Search className="w-4 h-4" />
                Browse
              </Button>
            </div>

            {errors.sourceUrl && (
              <p className="text-error text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.sourceUrl}
              </p>
            )}

            {/* Real-time URL validation feedback */}
            {formData.sourceUrl && !errors.sourceUrl && (
              <p className="text-success text-sm flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid source URL detected
              </p>
            )}
          </div>

          {/* Enhanced Title Input with Auto-suggestions */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">
                Custom Title (Optional)
              </span>
              <span className="label-text-alt text-xs text-base-content/60">
                AI will generate if empty
              </span>
            </label>
            <input
              className="input input-bordered w-full"
              disabled={isGenerating}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Leave empty for AI-generated title"
              type="text"
              value={formData.title}
            />
          </div>

          {/* Enhanced Voice Selection with Preview */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Voice Selection</span>
              <span className="label-text-alt text-xs text-base-content/60">
                {premiumTtsEnabled
                  ? "Premium voices available"
                  : "Standard voices"}
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              disabled={isGenerating}
              onChange={(e) => handleInputChange("voice", e.target.value)}
              value={formData.voice}
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.value} value={voice.value}>
                  {voice.label}{" "}
                  {premiumTtsEnabled && voice.value === "nova"
                    ? "✨ Premium"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Enhanced Model Selection with Feature Flag Support */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-medium">Audio Quality</span>
              <span className="label-text-alt text-xs text-base-content/60">
                Higher quality = better audio, higher cost
              </span>
            </label>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((model) => (
                <label
                  className="label cursor-pointer justify-start gap-3"
                  key={model.value}
                >
                  <input
                    checked={formData.model === model.value}
                    className="radio radio-primary"
                    disabled={
                      isGenerating ||
                      (!premiumTtsEnabled && model.value === "tts-1-hd")
                    }
                    name="model"
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    type="radio"
                    value={model.value}
                  />
                  <div>
                    <span className="label-text font-medium">
                      {model.label}
                    </span>
                    {!premiumTtsEnabled && model.value === "tts-1-hd" && (
                      <span className="badge badge-outline badge-sm ml-2">
                        Premium
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Enhanced Cost Estimation with Breakdown */}
          {estimatedCost && (
            <div className="alert alert-info">
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-sm font-medium">
                    Estimated cost: <strong>${estimatedCost.toFixed(3)}</strong>
                  </span>
                  {premiumTtsEnabled && formData.model === "tts-1-hd" && (
                    <p className="text-xs mt-1 opacity-75">
                      Includes premium quality processing
                    </p>
                  )}
                </div>
                {realTimeQueueEnabled && (
                  <div className="badge badge-primary badge-sm">Real-time</div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Progress Display with Detailed Stages */}
          {progress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{progress.message}</span>
                <span className="text-sm text-base-content/60">
                  {Math.round(progress.progress)}%
                </span>
              </div>

              <Progress className="w-full" value={progress.progress} />

              {progress.details && (
                <div className="flex items-start gap-2 p-3 bg-base-200 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin mt-0.5 text-primary" />
                  <div className="text-sm text-base-content/80">
                    {progress.details}
                  </div>
                </div>
              )}

              {progress.cost && (
                <div className="text-xs text-base-content/60">
                  Current cost: ${progress.cost.toFixed(3)}
                </div>
              )}
            </div>
          )}

          {/* Enhanced Generated Episode Results */}
          {generatedEpisode && (
            <div className="space-y-4 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-success">
                  Episode Generated Successfully!
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{generatedEpisode.title}</h4>
                  <p className="text-sm text-base-content/70 mt-1">
                    {generatedEpisode.summary?.slice(0, 150) ||
                      "Episode generated."}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-base-content/60">
                  <span>
                    Duration: {Math.round(generatedEpisode.duration / 60)}m
                  </span>
                  <span>
                    Cost: ${generatedEpisode.cost?.toFixed(3) || "N/A"}
                  </span>
                  <span>Voice: {generatedEpisode.voice}</span>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    className="btn btn-primary btn-sm gap-2"
                    onClick={() => {
                      if (generatedEpisode) {
                        playEpisode(generatedEpisode as any);
                      }
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Play Briefing
                  </Button>

                  <Button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (generatedEpisode.audioUrl) {
                        window.open(generatedEpisode.audioUrl, "_blank");
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>

                  <Button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      window.open(`/episodes/${generatedEpisode.id}`, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                    Detail Page
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
                    <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Enhanced Source Selector Modal */}
      {showSourceSelector && (
        <Dialog onOpenChange={setShowSourceSelector} open={showSourceSelector}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Select Content Source
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  className="input input-bordered w-full pl-10"
                  onChange={(e) => setSourceSearch(e.target.value)}
                  placeholder="Search sources by name, category, or URL..."
                  type="text"
                  value={sourceSearch}
                />
              </div>

              {/* Sources List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {sourcesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading sources...</span>
                  </div>
                ) : filteredSources.length === 0 ? (
                  <div className="text-center py-8 text-base-content/60">
                    {sourceSearch
                      ? "No sources match your search"
                      : "No sources available"}
                  </div>
                ) : (
                  filteredSources.map((source) => (
                    <div
                      className="p-3 border border-base-300 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                      key={source.id}
                      onClick={() => handleSourceSelect(source)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{source.name}</h3>
                          <p className="text-sm text-base-content/60 mt-1">
                            {source.url}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="badge badge-outline badge-xs">
                              {source.category}
                            </span>
                            {source.active && (
                              <span className="badge badge-success badge-xs">
                                Active
                              </span>
                            )}
                            {source.contentTier === "premium" && (
                              <span className="badge badge-primary badge-xs">
                                Premium
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-base-content/40" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Category Filter (if available) */}
              {sourcesByCategory &&
                Object.keys(sourcesByCategory).length > 1 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Browse by Category</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(sourcesByCategory).map(
                        ([category, sources]) => (
                          <button
                            className="btn btn-outline btn-xs"
                            key={category}
                            onClick={() => setSourceSearch(category)}
                          >
                            {category} ({sources.length})
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                className="btn btn-ghost"
                onClick={() => setShowSourceSelector(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
