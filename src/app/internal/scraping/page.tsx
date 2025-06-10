"use client";

import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Pause,
  Play,
  RefreshCw,
  Settings,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

interface ScraperDebugInfo {
  errors: string[];
  itemsScraped: number;
  lastRun?: Date;
  name: string;
  responseTime: number;
  status: "error" | "idle" | "running" | "success";
}

export default function ScrapingInternalPage() {
  // TODO: Implement scraper selection functionality
  // const [selectedScraper, setSelectedScraper] = useState<string>("all");
  const [debugMode, setDebugMode] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Queries
  const { data: metrics, refetch: refetchMetrics } =
    api.scraping.getMetrics.useQuery();
  const { data: cachedContent, refetch: refetchContent } =
    api.scraping.getCachedContent.useQuery();
  // TODO: Use availableScrapers for scraper selection
  // const { data: availableScrapers } =
  //   api.scraping.getAvailableScrapers.useQuery();

  // Mutations
  const scrapeAll = api.scraping.scrapeAll.useMutation({
    onSuccess: () => {
      refetchMetrics();
      refetchContent();
    },
  });

  const scrapeSource = api.scraping.scrapeSource.useMutation({
    onSuccess: () => {
      refetchMetrics();
      refetchContent();
    },
  });

  // Mock debug data for development
  const debugInfo: ScraperDebugInfo[] = [
    {
      errors: [],
      itemsScraped: 12,
      lastRun: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      name: "TLDR",
      responseTime: 850,
      status: "success",
    },
    {
      errors: [],
      itemsScraped: 8,
      lastRun: new Date(Date.now() - 1000 * 30), // 30 seconds ago
      name: "Hacker News",
      responseTime: 1200,
      status: "running",
    },
    {
      errors: ["Rate limit exceeded", "Invalid response format"],
      itemsScraped: 0,
      lastRun: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      name: "Morning Brew",
      responseTime: 5000,
      status: "error",
    },
  ];

  const getStatusIcon = (status: ScraperDebugInfo["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-warning animate-spin" />;
      case "error":
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return <AlertCircle className="w-4 h-4 text-base-content/50" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Scraping Development Tools
          </h1>
          <p className="text-base-content/70">
            Debug and monitor content scraping services
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-lg border">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">
                  <Settings className="w-5 h-5" />
                  Control Panel
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    className="btn-primary"
                    disabled={scrapeAll.isPending}
                    onClick={() => scrapeAll.mutate()}
                  >
                    {scrapeAll.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Scrape All
                  </Button>

                  <Button
                    btnStyle="outline"
                    onClick={() => {
                      refetchMetrics();
                      refetchContent();
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </Button>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Debug Mode</span>
                      <input
                        checked={debugMode}
                        className="toggle toggle-primary"
                        onChange={(e) => setDebugMode(e.target.checked)}
                        type="checkbox"
                      />
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Raw Data</span>
                      <input
                        checked={showRawData}
                        className="toggle toggle-secondary"
                        onChange={(e) => setShowRawData(e.target.checked)}
                        type="checkbox"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card bg-primary/10 border border-primary/20">
              <div className="card-body text-center">
                <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">
                  {cachedContent?.totalItems || 0}
                </div>
                <div className="text-sm text-primary/70">Total Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {debugMode && (
          <div className="mb-8">
            <div className="card bg-base-100 shadow-lg border">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">
                  <AlertCircle className="w-5 h-5" />
                  Real-time Debug Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {debugInfo.map((scraper) => (
                    <div className="card bg-base-200 border" key={scraper.name}>
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{scraper.name}</h3>
                          {getStatusIcon(scraper.status)}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-base-content/70">
                              Status:
                            </span>
                            <span
                              className={`capitalize ${
                                scraper.status === "success"
                                  ? "text-success"
                                  : scraper.status === "error"
                                    ? "text-error"
                                    : scraper.status === "running"
                                      ? "text-warning"
                                      : "text-base-content/50"
                              }`}
                            >
                              {scraper.status}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-base-content/70">Items:</span>
                            <span>{scraper.itemsScraped}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-base-content/70">
                              Response:
                            </span>
                            <span>{scraper.responseTime}ms</span>
                          </div>

                          {scraper.lastRun && (
                            <div className="flex justify-between">
                              <span className="text-base-content/70">
                                Last Run:
                              </span>
                              <span>{formatTime(scraper.lastRun)}</span>
                            </div>
                          )}

                          {scraper.errors.length > 0 && (
                            <div className="mt-3">
                              <div className="text-error text-xs font-medium mb-1">
                                Errors:
                              </div>
                              {scraper.errors.map((error) => (
                                <div
                                  className="text-error text-xs bg-error/10 p-2 rounded"
                                  key={error}
                                >
                                  {error}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <Button
                            btnStyle="outline"
                            className="w-full"
                            disabled={
                              scrapeSource.isPending ||
                              scraper.status === "running"
                            }
                            onClick={() =>
                              scrapeSource.mutate({
                                source: scraper.name
                                  .toLowerCase()
                                  .replace(/\s+/gu, ""),
                              })
                            }
                            size="sm"
                          >
                            {scraper.status === "running" ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            {scraper.status === "running"
                              ? "Running..."
                              : "Test Scrape"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Data View */}
        {showRawData && (
          <div className="mb-8">
            <div className="card bg-base-100 shadow-lg border">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">
                  <FileText className="w-5 h-5" />
                  Raw Data Output
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Metrics Data</h3>
                    <div className="mockup-code bg-base-300">
                      <pre className="text-xs">
                        <code>{JSON.stringify(metrics, null, 2)}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">
                      Recent Content Sample
                    </h3>
                    <div className="mockup-code bg-base-300">
                      <pre className="text-xs">
                        <code>
                          {JSON.stringify(
                            cachedContent?.content?.slice(0, 3),
                            null,
                            2
                          )}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-lg border">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                <Clock className="w-5 h-5" />
                Performance Timeline
              </h2>

              <div className="space-y-3">
                {debugInfo.map((scraper) => (
                  <div className="flex items-center gap-3" key={scraper.name}>
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {scraper.name}
                        </span>
                        <span className="text-xs text-base-content/70">
                          {scraper.lastRun
                            ? formatTime(scraper.lastRun)
                            : "Never"}
                        </span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            scraper.status === "success"
                              ? "bg-success"
                              : scraper.status === "error"
                                ? "bg-error"
                                : scraper.status === "running"
                                  ? "bg-warning"
                                  : "bg-base-content/20"
                          }`}
                          style={{
                            width: `${Math.min(100, (scraper.responseTime / 5000) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                <BarChart3 className="w-5 h-5" />
                Content Sources Breakdown
              </h2>

              <div className="space-y-4">
                {debugInfo.map((scraper) => (
                  <div key={scraper.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{scraper.name}</span>
                      <span>{scraper.itemsScraped} items</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(5, (scraper.itemsScraped / Math.max(...debugInfo.map((s) => s.itemsScraped))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-100 shadow-lg border">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              Quick Development Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button btnStyle="outline" className="justify-start">
                <RefreshCw className="w-4 h-4" />
                Clear Cache
              </Button>

              <Button btnStyle="outline" className="justify-start">
                <FileText className="w-4 h-4" />
                Export Logs
              </Button>

              <Button btnStyle="outline" className="justify-start">
                <Settings className="w-4 h-4" />
                Reset Config
              </Button>

              <Button btnStyle="outline" className="justify-start">
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
