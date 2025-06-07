"use client";

import {
  RefreshCw,
  Download,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { api } from "../../lib/trpc/client";

import { type ScrapedContent } from "../../lib/services/scraping/types";

export default function ScrapingPage() {
  const [selectedSource, setSelectedSource] = useState<string>("");

  // Queries
  const { data: availableScrapers, refetch: _refetchScrapers } =
    api.scraping.getAvailableScrapers.useQuery();
  const { data: cachedContent, refetch: refetchCached } =
    api.scraping.getCachedContent.useQuery();
  const { data: metrics, refetch: refetchMetrics } =
    api.scraping.getMetrics.useQuery();

  // Mutations
  const scrapeAll = api.scraping.scrapeAll.useMutation({
    onSuccess: () => {
      refetchCached();
      refetchMetrics();
    },
    onError: (error) => {
      console.error("Failed to scrape all sources:", error);
    },
  });

  const scrapeSource = api.scraping.scrapeSource.useMutation({
    onSuccess: () => {
      refetchCached();
      refetchMetrics();
      setSelectedSource("");
    },
    onError: (error) => {
      console.error(`Failed to scrape source:`, error);
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatDuration = (ms: number) => {
    return `${ms}ms`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Content Scraping
          </h1>
          <p className="text-base-content/70 mt-2">
            Monitor and manage content scraping from various news sources
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleScrapeAll}
            disabled={scrapeAll.isPending}
            className="btn btn-primary gap-2"
          >
            {scrapeAll.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {scrapeAll.isPending ? "Scraping..." : "Scrape All Sources"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Scrapers Status */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Available Scrapers</h3>
              <Settings className="h-4 w-4 text-base-content/60" />
            </div>
            <div className="text-2xl font-bold">
              {availableScrapers?.scrapers?.length || 0}
            </div>
            <div className="space-y-2 mt-4">
              {availableScrapers?.scrapers?.map((scraper) => (
                <div
                  key={scraper}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm capitalize">{scraper}</span>
                  <button
                    onClick={() => handleScrapeSource(scraper)}
                    disabled={
                      scrapeSource.isPending && selectedSource === scraper
                    }
                    className="btn btn-xs btn-outline"
                  >
                    {scrapeSource.isPending && selectedSource === scraper ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
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
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Cached Content</h3>
              <Activity className="h-4 w-4 text-base-content/60" />
            </div>
            <div className="text-2xl font-bold">
              {cachedContent?.totalItems || 0}
            </div>
            <p className="text-xs text-base-content/60">
              Total articles cached
            </p>
          </div>
        </div>

        {/* Last Scrape */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Last Activity</h3>
              <Clock className="h-4 w-4 text-base-content/60" />
            </div>
            <div className="text-2xl font-bold">
              {metrics?.metrics
                ? formatDate(
                    Object.values(metrics.metrics)[0]?.lastScrapeTime ||
                      new Date()
                  )
                : "Never"}
            </div>
            <p className="text-xs text-base-content/60">Most recent scrape</p>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      {metrics?.metrics && Object.keys(metrics.metrics).length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-300 mb-8">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">Scraping Metrics</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
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
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-error" />
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
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">Recent Content</h3>
            <div className="space-y-4">
              {cachedContent.content
                .sort(
                  (a, b) =>
                    new Date(b.publishedAt).getTime() -
                    new Date(a.publishedAt).getTime()
                )
                .slice(0, 10)
                .map((article: ScrapedContent) => (
                  <div
                    key={article.id}
                    className="border border-base-300 rounded-lg p-4 hover:bg-base-200/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-base-content/60">
                          <span className="badge badge-sm badge-outline">
                            {article.source}
                          </span>
                          <span>{formatDate(article.publishedAt)}</span>
                          <span className="capitalize">{article.category}</span>
                        </div>
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="badge badge-xs badge-secondary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
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
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body text-center py-12">
            <Activity className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">
              No content available
            </h3>
            <p className="text-base-content/60 mb-4">
              Start by scraping content from available sources
            </p>
            <button
              onClick={handleScrapeAll}
              disabled={scrapeAll.isPending}
              className="btn btn-primary"
            >
              {scrapeAll.isPending ? "Scraping..." : "Scrape All Sources"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
