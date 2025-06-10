"use client";

import {
  AlertCircle,
  Brain as _Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import {
  AI_PROVIDERS,
  type AIModel,
  calculateSummarizationCost,
  calculateTTSCost,
  getModelsByType,
  isProviderConfigured,
  type ModelRecommendation,
  recommendModels,
} from "@/lib/services/ai/providers";

interface AIProviderSelectorProps {
  className?: string;
  contentLength?: number; // For cost estimation
  onModelSelect: (modelId: string) => void;
  priority?: "cost" | "quality" | "speed";
  selectedModel?: string;
  type: "summarization" | "tts";
}

export function AIProviderSelector({
  className = "",
  contentLength = 1000,
  onModelSelect,
  priority = "cost",
  selectedModel,
  type,
}: AIProviderSelectorProps) {
  const [viewMode, setViewMode] = useState<"comparison" | "grid">("grid");
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>(
    []
  );

  const models = getModelsByType(type);
  const configuredProviders = AI_PROVIDERS.filter((p) =>
    isProviderConfigured(p.id)
  );

  useEffect(() => {
    const recs = recommendModels(type, {
      contentLength,
      maxCost: 0.1, // $0.10 max cost
      priority,
    });
    setRecommendations(recs);
  }, [type, priority, contentLength]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "premium":
        return "text-error";
      case "standard":
        return "text-warning";
      case "basic":
        return "text-info";
      default:
        return "text-base-content";
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "premium":
        return "badge-error";
      case "standard":
        return "badge-warning";
      case "basic":
        return "badge-info";
      default:
        return "badge-ghost";
    }
  };

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case "fast":
        return <Zap className="text-success h-4 w-4" />;
      case "medium":
        return <Clock className="text-warning h-4 w-4" />;
      case "slow":
        return <Clock className="text-error h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.001) return `$${(cost * 1000).toFixed(3)}k`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  const calculateModelCost = (model: AIModel) => {
    if (type === "summarization" && model.costPer1kTokens) {
      return calculateSummarizationCost(
        model.id,
        contentLength,
        contentLength * 0.3
      );
    } else if (type === "tts" && model.costPerCharacter) {
      return calculateTTSCost(model.id, contentLength);
    }
    return 0;
  };

  const isRecommended = (modelId: string) => {
    return recommendations.some((r) => r.model.id === modelId);
  };

  const getRecommendationRank = (modelId: string) => {
    const index = recommendations.findIndex((r) => r.model.id === modelId);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base-content text-lg font-semibold">
            {type === "summarization" ? "Summarization" : "Text-to-Speech"}{" "}
            Models
          </h3>
          <p className="text-base-content/60 text-sm">
            Choose the AI model for{" "}
            {type === "summarization"
              ? "content summarization"
              : "audio generation"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("grid")}
            size="sm"
            variant={viewMode === "grid" ? "primary" : "secondary"}
          >
            Grid
          </Button>
          <Button
            onClick={() => setViewMode("comparison")}
            size="sm"
            variant={viewMode === "comparison" ? "primary" : "secondary"}
          >
            Compare
          </Button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="from-primary/5 to-secondary/5 border-primary/20 rounded-lg border bg-gradient-to-r p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <h4 className="text-base-content font-medium">
              Recommended for {priority}
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {recommendations.map((rec, index) => (
              <div
                className="bg-base-100 border-base-300 rounded-lg border p-3"
                key={rec.model.id}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{rec.model.name}</span>
                  <div className="badge badge-primary badge-sm">
                    #{index + 1}
                  </div>
                </div>
                <div className="text-base-content/60 mb-2 text-xs">
                  {rec.reasons.join(", ")}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {formatCost(rec.estimatedCost)}
                  </span>
                  <Button
                    className="px-2 py-1 text-xs"
                    onClick={() => onModelSelect(rec.model.id)}
                    size="sm"
                    variant={
                      selectedModel === rec.model.id ? "primary" : "secondary"
                    }
                  >
                    {selectedModel === rec.model.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Models Grid/Comparison */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => {
            const isConfigured = isProviderConfigured(model.provider);
            const cost = calculateModelCost(model);
            const rank = getRecommendationRank(model.id);

            return (
              <div
                className={`card bg-base-100 overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  selectedModel === model.id ? "ring-primary ring-2" : ""
                } ${!isConfigured ? "opacity-50" : ""}`}
                key={model.id}
              >
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-base-content font-semibold">
                          {model.name}
                        </h4>
                        {rank && (
                          <div className="badge badge-primary badge-sm">
                            #{rank}
                          </div>
                        )}
                      </div>
                      <p className="text-base-content/60 text-xs capitalize">
                        {model.provider}
                      </p>
                    </div>
                    {!isConfigured && (
                      <div title="API key required">
                        <AlertCircle className="text-warning h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Quality & Speed */}
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`badge ${getQualityBadge(model.quality)} badge-sm`}
                    >
                      {model.quality}
                    </div>
                    <div className="flex items-center gap-1">
                      {getSpeedIcon(model.speed)}
                      <span className="text-xs capitalize">{model.speed}</span>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/60 text-xs">
                        Estimated cost:
                      </span>
                      <span className="text-sm font-medium">
                        {formatCost(cost)}
                      </span>
                    </div>
                    <div className="text-base-content/50 text-xs">
                      {type === "summarization"
                        ? `${formatCost(model.costPer1kTokens || 0)}/1k tokens`
                        : `${formatCost(model.costPerCharacter || 0)}/char`}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature) => (
                        <span
                          className="badge badge-ghost badge-xs"
                          key={feature}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    className="w-full"
                    disabled={!isConfigured}
                    onClick={() => onModelSelect(model.id)}
                    size="sm"
                    variant={
                      selectedModel === model.id ? "primary" : "secondary"
                    }
                  >
                    {selectedModel === model.id ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Selected
                      </>
                    ) : (
                      "Select Model"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Comparison Table */
        <div className="overflow-x-auto">
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Quality</th>
                <th>Speed</th>
                <th>Cost</th>
                <th>Features</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => {
                const isConfigured = isProviderConfigured(model.provider);
                const cost = calculateModelCost(model);
                const rank = getRecommendationRank(model.id);

                return (
                  <tr
                    className={`${selectedModel === model.id ? "bg-primary/10" : ""} ${
                      !isConfigured ? "opacity-50" : ""
                    }`}
                    key={model.id}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {rank && (
                          <div className="badge badge-primary badge-sm">
                            #{rank}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="capitalize">{model.provider}</td>
                    <td>
                      <div
                        className={`badge ${getQualityBadge(model.quality)} badge-sm`}
                      >
                        {model.quality}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {getSpeedIcon(model.speed)}
                        <span className="capitalize">{model.speed}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium">{formatCost(cost)}</div>
                        <div className="text-base-content/50 text-xs">
                          {type === "summarization"
                            ? `${formatCost(model.costPer1kTokens || 0)}/1k tokens`
                            : `${formatCost(model.costPerCharacter || 0)}/char`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {model.features.slice(0, 2).map((feature) => (
                          <span
                            className="badge badge-ghost badge-xs"
                            key={feature}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Button
                        disabled={!isConfigured}
                        onClick={() => onModelSelect(model.id)}
                        size="sm"
                        variant={
                          selectedModel === model.id ? "primary" : "secondary"
                        }
                      >
                        {selectedModel === model.id ? "Selected" : "Select"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Provider Configuration Notice */}
      {configuredProviders.length < AI_PROVIDERS.length && (
        <div className="alert alert-warning">
          <Info className="h-5 w-5" />
          <div>
            <h4 className="font-medium">Additional providers available</h4>
            <p className="text-sm">
              Configure API keys for{" "}
              {AI_PROVIDERS.filter((p) => !isProviderConfigured(p.id))
                .map((p) => p.name)
                .join(", ")}
              to access more models and better pricing options.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
