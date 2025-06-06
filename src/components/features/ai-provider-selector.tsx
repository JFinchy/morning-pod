"use client";

import {
  Brain,
  Zap,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui";
import {
  AI_PROVIDERS,
  getModelsByType,
  recommendModels,
  calculateSummarizationCost,
  calculateTTSCost,
  isProviderConfigured,
  type AIModel,
  type ModelRecommendation,
} from "@/lib/services/ai/providers";

interface AIProviderSelectorProps {
  type: "summarization" | "tts";
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
  contentLength?: number; // For cost estimation
  priority?: "cost" | "quality" | "speed";
  className?: string;
}

export function AIProviderSelector({
  type,
  selectedModel,
  onModelSelect,
  contentLength = 1000,
  priority = "cost",
  className = "",
}: AIProviderSelectorProps) {
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>(
    []
  );

  const models = getModelsByType(type);
  const configuredProviders = AI_PROVIDERS.filter((p) =>
    isProviderConfigured(p.id)
  );

  useEffect(() => {
    const recs = recommendModels(type, {
      priority,
      contentLength,
      maxCost: 0.1, // $0.10 max cost
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
        return <Zap className="w-4 h-4 text-success" />;
      case "medium":
        return <Clock className="w-4 h-4 text-warning" />;
      case "slow":
        return <Clock className="w-4 h-4 text-error" />;
      default:
        return <Clock className="w-4 h-4" />;
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
          <h3 className="text-lg font-semibold text-base-content">
            {type === "summarization" ? "Summarization" : "Text-to-Speech"}{" "}
            Models
          </h3>
          <p className="text-sm text-base-content/60">
            Choose the AI model for{" "}
            {type === "summarization"
              ? "content summarization"
              : "audio generation"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "primary" : "secondary"}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            size="sm"
            variant={viewMode === "comparison" ? "primary" : "secondary"}
            onClick={() => setViewMode("comparison")}
          >
            Compare
          </Button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-base-content">
              Recommended for {priority}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.map((rec, index) => (
              <div
                key={rec.model.id}
                className="bg-base-100 rounded-lg p-3 border border-base-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{rec.model.name}</span>
                  <div className="badge badge-primary badge-sm">
                    #{index + 1}
                  </div>
                </div>
                <div className="text-xs text-base-content/60 mb-2">
                  {rec.reasons.join(", ")}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {formatCost(rec.estimatedCost)}
                  </span>
                  <Button
                    size="sm"
                    variant={
                      selectedModel === rec.model.id ? "primary" : "secondary"
                    }
                    onClick={() => onModelSelect(rec.model.id)}
                    className="text-xs px-2 py-1"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => {
            const isConfigured = isProviderConfigured(model.provider);
            const cost = calculateModelCost(model);
            const rank = getRecommendationRank(model.id);

            return (
              <div
                key={model.id}
                className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
                  selectedModel === model.id ? "ring-2 ring-primary" : ""
                } ${!isConfigured ? "opacity-50" : ""}`}
              >
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-base-content">
                          {model.name}
                        </h4>
                        {rank && (
                          <div className="badge badge-primary badge-sm">
                            #{rank}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-base-content/60 capitalize">
                        {model.provider}
                      </p>
                    </div>
                    {!isConfigured && (
                      <div title="API key required">
                        <AlertCircle className="w-4 h-4 text-warning" />
                      </div>
                    )}
                  </div>

                  {/* Quality & Speed */}
                  <div className="flex items-center justify-between mb-3">
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
                      <span className="text-xs text-base-content/60">
                        Estimated cost:
                      </span>
                      <span className="font-medium text-sm">
                        {formatCost(cost)}
                      </span>
                    </div>
                    <div className="text-xs text-base-content/50">
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
                          key={feature}
                          className="badge badge-ghost badge-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    size="sm"
                    variant={
                      selectedModel === model.id ? "primary" : "secondary"
                    }
                    onClick={() => onModelSelect(model.id)}
                    disabled={!isConfigured}
                    className="w-full"
                  >
                    {selectedModel === model.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
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
          <table className="table table-zebra w-full">
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
                    key={model.id}
                    className={`${selectedModel === model.id ? "bg-primary/10" : ""} ${
                      !isConfigured ? "opacity-50" : ""
                    }`}
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
                        <div className="text-xs text-base-content/50">
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
                            key={feature}
                            className="badge badge-ghost badge-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant={
                          selectedModel === model.id ? "primary" : "secondary"
                        }
                        onClick={() => onModelSelect(model.id)}
                        disabled={!isConfigured}
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
          <Info className="w-5 h-5" />
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
