"use client";

import {
  Activity,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Settings,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { type ScrapedContent } from "../../lib/services/scraping/types";
import { api } from "../../lib/trpc/client";

export default function ScrapingPage() {
  const [selectedSource, setSelectedSource] = useState<string>("");

  // Queries
  const { data: availableScrapers } =
    api.scraping.getAvailableScrapers.useQuery();
  const { data: cachedContent, refetch: refetchCached } =
    api.scraping.getCachedContent.useQuery();
  const { data: metrics, refetch: refetchMetrics } =
    api.scraping.getMetrics.useQuery();

  // Mutations
  const scrapeAll = api.scraping.scrapeAll.useMutation({
    onError: (_error) => {
      // Error handled by mutation state
    },
    onSuccess: () => {
      refetchCached();
      refetchMetrics();
    },
  });

  const scrapeSource = api.scraping.scrapeSource.useMutation({
    onError: (_error) => {
      setSelectedSource("");
    },
    onSuccess: () => {
      refetchCached();
      refetchMetrics();
      setSelectedSource("");
    },
  });

  // Handle scrape all sources
  const handleScrapeAll = () => {
    scrapeAll.mutate();
  };

  // Handle scrape specific source
  const handleScrapeSource = (source: string) => {
    setSelectedSource(source);
    scrapeSource.mutate({ source });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    }).format(new Date(date));
  };

  const formatDuration = (ms: number) => {
    return `${ms}ms`;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-base-content text-3xl font-bold">
            Content Scraping
          </h1>
          <p className="text-base-content/70 mt-2">
            Monitor and manage content scraping from various news sources
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-primary gap-2"
            disabled={scrapeAll.isPending}
            onClick={handleScrapeAll}
          >
            {scrapeAll.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {scrapeAll.isPending ? "Scraping..." : "Scrape All Sources"}
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scrapers Status */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Available Scrapers</h3>
              <Settings className="text-base-content/60 h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {availableScrapers?.scrapers?.length || 0}
            </div>
            <div className="mt-4 space-y-2">
              {availableScrapers?.scrapers?.map((scraper) => (
                <div
                  className="flex items-center justify-between"
                  key={scraper}
                >
                  <span className="text-sm capitalize">{scraper}</span>
                  <button
                    className="btn btn-xs btn-outline"
                    disabled={
                      scrapeSource.isPending && selectedSource === scraper
                    }
                    onClick={() => handleScrapeSource(scraper)}
                  >
                    {scrapeSource.isPending && selectedSource === scraper ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      "Scrape"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Cached Content</h3>
              <Activity className="text-base-content/60 h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {cachedContent?.totalItems || 0}
            </div>
            <p className="text-base-content/60 text-xs">
              Total articles cached
            </p>
          </div>
        </div>

        {/* Last Scrape */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Last Activity</h3>
              <Clock className="text-base-content/60 h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {metrics?.metrics
                ? formatDate(
                    Object.values(metrics.metrics)[0]?.lastScrapeTime ||
                      new Date()
                  )
                : "Never"}
            </div>
            <p className="text-base-content/60 text-xs">Most recent scrape</p>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      {metrics?.metrics && Object.keys(metrics.metrics).length > 0 && (
        <div className="card bg-base-100 border-base-300 mb-8 border shadow-sm">
          <div className="card-body p-6">
            <h3 className="card-title mb-4 text-lg">Scraping Metrics</h3>
            <div className="overflow-x-auto">
              <table className="table-zebra table w-full">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Total Requests</th>
                    <th>Success Rate</th>
                    <th>Avg Response Time</th>
                    <th>Items Scraped</th>
                    <th>Last Scrape</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.metrics).map(([source, metric]) => (
                    <tr key={source}>
                      <td className="font-medium capitalize">{source}</td>
                      <td>{metric.totalRequests}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span>
                            {metric.totalRequests > 0
                              ? Math.round(
                                  (metric.successfulRequests /
                                    metric.totalRequests) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                          {metric.successfulRequests > 0 ? (
                            <CheckCircle className="text-success h-4 w-4" />
                          ) : (
                            <XCircle className="text-error h-4 w-4" />
                          )}
                        </div>
                      </td>
                      <td>{formatDuration(metric.averageResponseTime)}</td>
                      <td>{metric.itemsScraped}</td>
                      <td>{formatDate(metric.lastScrapeTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content Display */}
      {cachedContent?.content && cachedContent.content.length > 0 && (
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <h3 className="card-title mb-4 text-lg">Recent Content</h3>
            <div className="space-y-4">
              {[...cachedContent.content]
                .sort(
                  (a, b) =>
                    new Date(b.publishedAt).getTime() -
                    new Date(a.publishedAt).getTime()
                )
                .slice(0, 10)
                .map((article: ScrapedContent) => (
                  <div
                    className="border-base-300 hover:bg-base-200/50 rounded-lg border p-4 transition-colors"
                    key={article.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base-content mb-2 line-clamp-2 font-semibold">
                          {article.title}
                        </h3>
                        <p className="text-base-content/70 mb-3 line-clamp-2 text-sm">
                          {article.summary}
                        </p>
                        <div className="text-base-content/60 flex items-center gap-4 text-xs">
                          <span className="badge badge-sm badge-outline">
                            {article.source}
                          </span>
                          <span>{formatDate(article.publishedAt)}</span>
                          <span className="capitalize">{article.category}</span>
                        </div>
                        {article.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                className="badge badge-xs badge-secondary"
                                key={tag}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <a
                        className="btn btn-sm btn-outline"
                        href={article.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!cachedContent?.content || cachedContent.content.length === 0) && (
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body py-12 text-center">
            <Activity className="text-base-content/30 mx-auto mb-4 h-12 w-12" />
            <h3 className="text-base-content mb-2 text-lg font-medium">
              No content available
            </h3>
            <p className="text-base-content/60 mb-4">
              Start by scraping content from available sources
            </p>
            <button
              className="btn btn-primary"
              disabled={scrapeAll.isPending}
              onClick={handleScrapeAll}
            >
              {scrapeAll.isPending ? "Scraping..." : "Scrape All Sources"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
