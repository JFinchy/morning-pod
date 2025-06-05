"use client";

import { Plus, Settings, Zap, Globe, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

export default function SourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: sources, isLoading } = api.sources.getAll.useQuery({});
  const { data: activeSources } = api.sources.getActive.useQuery();

  const categories = [
    { value: "all", label: "All Sources", count: sources?.length || 0 },
    {
      value: "tech",
      label: "Technology",
      count: sources?.filter((s) => s.category === "tech").length || 0,
    },
    {
      value: "business",
      label: "Business",
      count: sources?.filter((s) => s.category === "business").length || 0,
    },
    {
      value: "general",
      label: "General News",
      count: sources?.filter((s) => s.category === "general").length || 0,
    },
  ];

  const filteredSources =
    sources?.filter(
      (source) =>
        selectedCategory === "all" || source.category === selectedCategory
    ) || [];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "free":
        return "badge-ghost";
      case "premium":
        return "badge-warning";
      case "enterprise":
        return "badge-primary";
      default:
        return "badge-ghost";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-base-content">
              News Sources
            </h1>
            <p className="text-base-content/60">
              {activeSources?.length || 0} of {sources?.length || 0} sources
              active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button btnStyle="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Manage All
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Source
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-success">
              <Zap className="w-6 h-6" />
            </div>
            <div className="stat-title">Active Sources</div>
            <div className="stat-value text-success">
              {activeSources?.length || 0}
            </div>
            <div className="stat-desc">Ready to generate</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <div className="stat-title">Total Sources</div>
            <div className="stat-value text-primary">
              {sources?.length || 0}
            </div>
            <div className="stat-desc">All configured</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-warning">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-title">Daily Limit</div>
            <div className="stat-value text-warning">
              {sources?.reduce((sum, s) => sum + s.dailyLimit, 0) || 0}
            </div>
            <div className="stat-desc">Episodes per day</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow-sm border border-base-300">
            <div className="stat-figure text-info">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="stat-title">Premium</div>
            <div className="stat-value text-info">
              {sources?.filter((s) => s.contentTier === "premium").length || 0}
            </div>
            <div className="stat-desc">High-quality sources</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  className={`btn btn-sm ${
                    selectedCategory === category.value
                      ? "btn-primary"
                      : "btn-ghost"
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                  <span className="badge badge-sm ml-1">{category.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="card bg-base-100 shadow-sm border border-base-300"
              >
                <div className="card-body">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="h-3 bg-base-300 rounded w-full"></div>
                    <div className="h-3 bg-base-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                className={`card bg-base-100 shadow-sm border hover:shadow-md transition-all duration-200 ${
                  source.active ? "border-primary" : "border-base-300"
                }`}
              >
                <div className="card-body p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base-content">
                        {source.name}
                      </h3>
                      <p className="text-sm text-base-content/60">
                        {source.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`badge ${getTierBadge(source.contentTier)}`}
                      >
                        {source.contentTier}
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          source.active ? "bg-success" : "bg-base-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-base-content/60">
                        Daily Limit
                      </div>
                      <div className="font-medium">
                        {source.dailyLimit} episodes
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-base-content/60">
                        TTS Service
                      </div>
                      <div className="font-medium capitalize">
                        {source.ttsService}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant={source.active ? "success" : "neutral"}
                      btnStyle={source.active ? "outline" : "dash"}
                    >
                      {source.active ? "Active" : "Inactive"}
                    </Button>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        btnStyle="ghost"
                        className="w-8 h-8 p-0"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Source Card */}
        <div className="card bg-base-100 border-2 border-dashed border-base-300 hover:border-primary/50 transition-colors">
          <div className="card-body items-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium text-base-content mb-2">
              Add New Source
            </h3>
            <p className="text-sm text-base-content/60 mb-4">
              Connect a new RSS feed or news API to expand your content sources
            </p>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
