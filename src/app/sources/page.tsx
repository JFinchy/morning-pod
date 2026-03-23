"use client";

import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Zap,
  Play,
  ArrowRight,
  Info,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { MainLayout } from "@/components/layouts";
import { Button, Card } from "@/components/ui";
import { GenerationModal } from "@/components/features/generation-modal";
import { type Source } from "@/lib/db/schema";
import { api } from "@/lib/trpc/client";
import { useAudio } from "@/components/providers/AudioProvider";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);

  // Fetch sources
  const {
    data: sourcesData,
    error,
    isLoading,
  } = api.sources.getAll.useQuery({});

  // Fetch cached content
  const { data: cachedContent, refetch: refetchContent } =
    api.scraping.getCachedContent.useQuery();

  // Scrape all mutation
  const scrapeAll = api.scraping.scrapeAll.useMutation({
    onSuccess: () => {
      refetchContent();
    },
  });

  useEffect(() => {
    if (sourcesData?.sources) {
      // For client view, only show active and non-hidden (if we had a flag in DB, but we use local storage for now)
      setSources(sourcesData.sources.filter((s) => s.active));
    }
  }, [sourcesData]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-96">
            <div className="loading loading-spinner loading-lg text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-12">
          <div className="alert alert-error">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load sources: {error.message}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-4 flex items-center gap-3">
              <Globe className="w-10 h-10 text-primary" />
              News Sources
            </h1>
            <p className="text-lg text-base-content/60 max-w-2xl">
              Choose a news source to generate your next AI podcast episode. Our
              system will scrape the latest headlines and create a personalized
              audio summary just for you.
            </p>
          </div>
          <Button
            btnStyle="outline"
            className="gap-2"
            onClick={() => scrapeAll.mutate()}
            loading={scrapeAll.isPending}
          >
            {!scrapeAll.isPending && <RefreshCw className="w-4 h-4" />}
            {scrapeAll.isPending ? "Refreshing..." : "Refresh Feeds"}
          </Button>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>

        {/* Latest Feed Content */}
        {cachedContent?.content && cachedContent.content.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-warning" />
              Latest News in Feed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cachedContent.content
                .sort(
                  (a: any, b: any) =>
                    new Date(b.publishedAt).getTime() -
                    new Date(a.publishedAt).getTime()
                )
                .slice(0, 6)
                .map((item: any) => (
                  <div
                    className="group bg-base-200/50 p-4 rounded-xl border border-base-300 hover:bg-base-200 transition-all flex justify-between items-center gap-4"
                    key={item.id}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="badge badge-sm badge-outline opacity-70 uppercase text-[10px] font-bold">
                          {item.source}
                        </span>
                        <span className="text-[10px] opacity-50">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-base-content/60 line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      <GenerationModal
                        autoStart={false}
                        initialSource={{
                          id:
                            item.sourceId ||
                            item.source.toLowerCase().replace(/\s+/g, "-"),
                          name: item.source,
                          url: item.url,
                        }}
                        trigger={
                          <Button
                            size="sm"
                            className="w-10 p-0 hover:bg-base-300 transition-all border-none bg-transparent text-base-content/50"
                            btnStyle="ghost"
                            aria-label={`Settings for: ${item.title}`}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        }
                      />
                      <GenerateButton item={item} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {sources.length === 0 && (
          <div className="text-center py-20 bg-base-200/30 rounded-2xl border-2 border-dashed border-base-300">
            <Globe className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-base-content/70">
              No active sources found
            </h3>
            <p className="text-base-content/50 max-w-md mx-auto">
              Please contact an administrator to configure news sources for your
              account.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-16 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">How it works</h3>
            <p className="text-base-content/70">
              When you click "Develop Episode", Morning Pod visits the source
              URL, extracts the most relevant news, uses AI to write a
              natural-sounding script, and synthesizes it into a high-quality
              audio episode. This process typically takes about 30-60 seconds.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <div className="group relative bg-base-100 rounded-2xl shadow-sm hover:shadow-xl border border-base-300 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 relative">
        <div className="absolute top-4 right-4">
          <GenerationModal
            autoStart={false}
            initialSource={source}
            trigger={
              <Button
                className="w-10 h-10 p-0 rounded-full border-none bg-base-200/50 hover:bg-base-200 text-base-content/50 hover:text-base-content transition-all z-10"
                btnStyle="ghost"
              >
                <Settings className="w-4 h-4" />
              </Button>
            }
          />
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Globe className="w-6 h-6 text-base-content/40 group-hover:text-primary transition-colors" />
          </div>
          <div className="badge badge-outline badge-sm uppercase tracking-wider text-[10px] font-bold py-2 mr-10">
            {source.category}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors pr-10">
          {source.name}
        </h3>
        <p className="text-sm text-base-content/60 mb-6 line-clamp-2">
          Latest news and updates from {new URL(source.url).hostname}.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-base-content/70">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            Active Source
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-base-content/70">
            <Zap className="w-3.5 h-3.5 text-warning" />
            AI Audio Enabled
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 mt-auto">
        <GenerateButton
          item={{
            id: source.id,
            title: source.name,
            url: source.url,
            sourceId: source.id,
          }}
        />
      </div>
    </div>
  );
}

function GenerateButton({ item }: { item: any }) {
  const { addToQueue } = useAudio();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    const sourceId = item.sourceId || item.id || "manual-entry";
    const apiEndpoint =
      process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === "true"
        ? "/api/episodes/mocks/generate-mock"
        : "/api/episodes/generate";

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(apiEndpoint, {
            body: JSON.stringify({
              sourceId,
              sourceUrl: item.url,
              model: "tts-1",
              voice: "alloy",
            }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          if (!response.ok) throw new Error("Failed to start generation");

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No stream");

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
                const data = JSON.parse(line.slice(6));

                if (data.type === "complete") {
                  const ep = data.data || data.episode || {};
                  addToQueue({
                    ...ep,
                    id: ep.episodeId || ep.id,
                  });
                  setIsGenerating(false);
                  resolve(ep);
                  return;
                }

                if (data.type === "error") {
                  setIsGenerating(false);
                  reject(new Error(data.message));
                  return;
                }
              }
            }
          }
        } catch (err) {
          setIsGenerating(false);
          reject(err);
        }
      }),
      {
        loading: "Generating episode... will be added to queue.",
        success: "Episode perfectly generated and added to your queue!",
        error: "Failed to generate episode",
      }
    );
  };

  return (
    <Button
      className="w-full gap-2 group/btn"
      btnStyle={isGenerating ? "outline" : undefined}
      variant={!isGenerating ? "primary" : undefined}
      onClick={handleGenerate}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <span className="loading loading-spinner w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      {isGenerating ? "Developing..." : "Develop Episode"}
      {!isGenerating && (
        <ArrowRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
      )}
    </Button>
  );
}
