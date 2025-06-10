"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Heart as _Heart,
  MoreVertical as _MoreVertical,
  Settings as _Settings,
  TrendingUp as _TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { type Source } from "@/lib/db/schema";
import { api } from "@/lib/trpc/client";
import {
  getHiddenSources,
  hideSource,
  isSourceHidden,
  showSource,
} from "@/lib/utils/local-storage";

interface SourceWithStats extends Source {
  episodeCount?: number;
  lastEpisode?: string;
  totalPlays?: number;
}

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceWithStats[]>([]);
  const [_hiddenSources, setHiddenSources] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // Fetch sources
  const {
    data: sourcesData,
    error,
    isLoading,
  } = api.sources.getAll.useQuery({});

  useEffect(() => {
    if (sourcesData?.sources) {
      setSources(sourcesData.sources);
    }
  }, [sourcesData]);

  useEffect(() => {
    setHiddenSources(getHiddenSources());
  }, []);

  const toggleSourceVisibility = (sourceId: string) => {
    const isHidden = isSourceHidden(sourceId);

    if (isHidden) {
      showSource(sourceId);
      setHiddenSources((prev) => prev.filter((id) => id !== sourceId));
    } else {
      hideSource(sourceId);
      setHiddenSources((prev) => [...prev, sourceId]);
    }
  };

  const visibleSources = sources.filter(
    (source) => showHidden || !isSourceHidden(source.id)
  );

  const hiddenCount = sources.filter((source) =>
    isSourceHidden(source.id)
  ).length;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-96 items-center justify-center">
            <div className="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load sources: {error.message}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-base-content text-3xl font-bold">Sources</h1>
              <p className="text-base-content/70 mt-1">
                Manage your podcast content sources and preferences
              </p>
            </div>
          </div>

          {/* Stats & Controls */}
          <div className="flex items-center justify-between">
            <div className="stats bg-base-200 shadow">
              <div className="stat px-6 py-4">
                <div className="stat-title text-xs">Total Sources</div>
                <div className="stat-value text-lg">{sources.length}</div>
              </div>
              <div className="stat px-6 py-4">
                <div className="stat-title text-xs">Active</div>
                <div className="stat-value text-success text-lg">
                  {sources.filter((s) => s.active).length}
                </div>
              </div>
              <div className="stat px-6 py-4">
                <div className="stat-title text-xs">Hidden</div>
                <div className="stat-value text-warning text-lg">
                  {hiddenCount}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {hiddenCount > 0 && (
                <Button
                  className="gap-2"
                  onClick={() => setShowHidden(!showHidden)}
                  size="sm"
                  variant={showHidden ? "primary" : "secondary"}
                >
                  {showHidden ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  {showHidden
                    ? `Hide ${hiddenCount} Hidden`
                    : `Show ${hiddenCount} Hidden`}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleSources.map((source) => (
            <SourceCard
              isHidden={isSourceHidden(source.id)}
              key={source.id}
              onToggleVisibility={toggleSourceVisibility}
              source={source}
            />
          ))}
        </div>

        {visibleSources.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📡</div>
            <h3 className="mb-2 text-xl font-semibold">
              {showHidden ? "No sources to display" : "No visible sources"}
            </h3>
            <p className="text-base-content/60 mb-4">
              {(() => {
                if (showHidden) return "Check your source configuration.";
                if (hiddenCount > 0)
                  return `You have ${hiddenCount} hidden sources. Click "Show Hidden" to view them.`;
                return "Sources will appear here once configured.";
              })()}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

interface SourceCardProps {
  isHidden: boolean;
  onToggleVisibility: (sourceId: string) => void;
  source: SourceWithStats;
}

function SourceCard({ isHidden, onToggleVisibility, source }: SourceCardProps) {
  const getStatusIcon = () => {
    if (!source.active) return <AlertCircle className="text-error h-5 w-5" />;
    return <CheckCircle2 className="text-success h-5 w-5" />;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "badge-warning";
      case "pro":
        return "badge-error";
      default:
        return "badge-info";
    }
  };

  return (
    <div
      className={`card from-base-100 to-base-200 overflow-hidden border-0 bg-gradient-to-br shadow-lg transition-all duration-300 hover:shadow-xl ${
        isHidden ? "opacity-50" : ""
      }`}
    >
      <div className="card-body p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {getStatusIcon()}
              <h3 className="card-title text-base-content text-lg font-bold">
                {source.name}
              </h3>
            </div>
            <div
              className={`badge ${getTierColor(source.contentTier || "free")} badge-sm`}
            >
              {source.contentTier || "free"}
            </div>
          </div>

          <Button
            btnStyle="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onToggleVisibility(source.id)}
            size="sm"
            title={isHidden ? "Show source" : "Hide source"}
          >
            {isHidden ? (
              <EyeOff className="text-warning h-4 w-4" />
            ) : (
              <Eye className="text-base-content/70 h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Source Info */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="text-base-content/50 h-4 w-4" />
            <span className="text-base-content/70 truncate">{source.url}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Zap className="text-base-content/50 h-4 w-4" />
            <span className="text-base-content/70">
              TTS: {source.ttsService || "openai"}
            </span>
          </div>

          {source.dailyLimit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="text-base-content/50 h-4 w-4" />
              <span className="text-base-content/70">
                Limit: {source.dailyLimit} episodes/day
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="text-base-content/60 flex items-center justify-between text-xs">
          <span className="capitalize">{source.category}</span>
          <span>Added {new Date(source.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
