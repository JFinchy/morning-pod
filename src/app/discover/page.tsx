"use client";

import { Compass, Filter, Play, RefreshCw, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { GenerationModal } from "@/components/features/generation-modal";
import { ArticleModal } from "@/components/features/article-modal";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { api } from "@/lib/trpc/client";
import { sanitizeString } from "@/lib/utils/api-middleware";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const { data: sources } = api.sources.getAll.useQuery({});
  const {
    data: cachedContent,
    isLoading,
    refetch: refetchContent,
  } = api.scraping.getCachedContent.useQuery();

  const scrapeAll = api.scraping.scrapeAll.useMutation({
    onSuccess: () => {
      refetchContent();
    },
  });

  const filteredStories =
    cachedContent?.content?.filter((story: any) => {
      const matchesSearch =
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSource =
        selectedSource === "all" ||
        story.source.toLowerCase().includes(selectedSource.toLowerCase());

      return matchesSearch && matchesSource;
    }) || [];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-base-content flex items-center gap-3">
              <Compass className="w-10 h-10 text-primary" />
              Discover
            </h1>
            <p className="text-lg text-base-content/60 mt-2">
              The latest headlines from your news feeds, ready for
              transformation.
            </p>
          </div>

          <Button
            btnStyle="outline"
            className="gap-2 h-12 rounded-2xl border-base-300 font-bold"
            onClick={() => scrapeAll.mutate()}
            loading={scrapeAll.isPending}
          >
            {!scrapeAll.isPending && <RefreshCw className="w-4 h-4" />}
            {scrapeAll.isPending ? "Updating..." : "Refresh Feeds"}
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/30" />
            <input
              type="text"
              placeholder="Search news, headlines, or topics..."
              className="input input-bordered w-full pl-12 h-12 rounded-2xl bg-base-200 border-none shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeString(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-base-content/30" />
            <select
              className="select select-bordered h-12 rounded-2xl bg-base-200 border-none shadow-sm font-bold pr-10"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              {sources?.sources
                .filter((s) => s.active)
                .map((source) => (
                  <option key={source.id} value={source.name}>
                    {source.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-base-200 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStories
              .sort(
                (a: any, b: any) =>
                  new Date(b.publishedAt).getTime() -
                  new Date(a.publishedAt).getTime()
              )
              .map((story: any) => (
                <div
                  className="group cursor-pointer bg-base-100 p-6 rounded-3xl border border-base-300 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex justify-between items-center gap-8"
                  key={story.id}
                  onClick={() => setSelectedArticle(story)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(story.url, "_blank");
                        }}
                        btnStyle="outline"
                        className="badge-primary badge-sm uppercase text-[10px] font-black tracking-widest py-2 px-3"
                      >
                        {story.source}
                      </Button>
                      <span className="text-xs text-base-content/40 font-medium">
                        {new Date(story.publishedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {story.title}
                    </h3>
                    <p className="text-sm text-base-content/60 line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      aria-label="Develop Briefing"
                      className="h-14 w-14 p-0 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 bg-primary hover:bg-primary-focus border-none"
                    >
                      <Zap className="w-6 h-6 text-primary-content" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-base-200/20 rounded-[3rem] border-2 border-dashed border-base-300">
            <Compass className="w-20 h-20 text-base-content/10 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-base-content/70">
              No stories found
            </h3>
            <p className="text-base-content/40 max-w-sm mx-auto mt-2">
              Try adjusting your search or filters, or refresh your feeds to
              find the latest news.
            </p>
            <Button
              variant="primary"
              className="mt-8 rounded-2xl px-8"
              onClick={() => scrapeAll.mutate()}
            >
              Refresh Feeds
            </Button>
          </div>
        )}
      </div>

      <ArticleModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </MainLayout>
  );
}
