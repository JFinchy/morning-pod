import {
  ArrowRight,
  Globe,
  Headphones,
  Play,
  Podcast,
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 60;

import {
  EpisodeCard,
  GenerateEpisodeButton,
  GenerationModal,
  ListenNowButton,
} from "@/components/features";
import { HomeClientWrapper, MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { db } from "@/lib/db";
import { Episode, episodes, sources, scrapedContent } from "@/lib/db/schema";
import {
  mockEpisodes,
  mockSources,
  mockScrapedContent,
} from "@/lib/mock-data/mocks";

async function getClientHomeData() {
  if (process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === "true") {
    return {
      episodes: mockEpisodes.slice(0, 3),
      sources: mockSources.filter((s) => s.active).slice(0, 3),
      latestStories: mockScrapedContent.slice(0, 4),
      latestReadyEpisode: mockEpisodes[0],
    };
  }

  try {
    const [recentEpisodes, activeSources, latestScraped, latestReady] =
      await Promise.all([
        db.query.episodes.findMany({
          limit: 3,
          orderBy: (episodesTable, { desc }) => [desc(episodesTable.createdAt)],
        }),
        db.query.sources.findMany({
          where: (sourcesTable, { eq }) => eq(sourcesTable.active, true),
          limit: 3,
        }),
        db.query.scrapedContent.findMany({
          limit: 4,
          orderBy: (scrapedTable, { desc }) => [desc(scrapedTable.publishedAt)],
        }),
        db.query.episodes.findFirst({
          where: (episodesTable, { eq }) => eq(episodesTable.status, "ready"),
          orderBy: (episodesTable, { desc }) => [desc(episodesTable.createdAt)],
        }),
      ]);

    return {
      episodes: recentEpisodes,
      sources: activeSources,
      latestStories: latestScraped,
      latestReadyEpisode: latestReady || null,
    };
  } catch (error) {
    console.error("Failed to fetch data, falling back to mock:", error);
    return {
      episodes: mockEpisodes.slice(0, 3),
      sources: mockSources.filter((s) => s.active).slice(0, 3),
      latestStories: [],
      latestReadyEpisode: null,
    };
  }
}
import { HeroIllustration } from "@/components/ui/hero-illustration";

export default async function Home() {
  const { episodes, sources, latestStories, latestReadyEpisode } =
    await getClientHomeData();

  return (
    <MainLayout>
      <HomeClientWrapper hasLatestStories={latestStories.length > 0}>
        <div className="space-y-16 pb-12">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-3xl bg-base-200 border border-base-300 p-8 lg:p-16">
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Daily Briefings
                </div>
                <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight text-base-content">
                  Your News, <br />
                  <span className="text-primary">In Your Ears.</span>
                </h1>
                <p className="text-xl text-base-content/70 mb-10 leading-relaxed max-w-xl">
                  Morning Pod transforms your favorite news sources into
                  personalized audio episodes. Stay informed while you commute,
                  workout, or start your day.
                </p>
                <div className="flex flex-wrap gap-4">
                  <ListenNowButton latestEpisode={latestReadyEpisode as any} />
                  <GenerateEpisodeButton />
                </div>
              </div>
              <div className="flex-1 w-full max-w-md hidden lg:block">
                <HeroIllustration className="w-full h-auto max-w-[400px] mx-auto" />
              </div>
            </div>
          </section>

          {/* Fresh from feeds */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Fresh from your feeds
                </h2>
                <p className="text-base-content/60">
                  The latest headlines waiting for generation
                </p>
              </div>
              <Link href="/sources">
                <Button btnStyle="ghost" className="gap-2 group">
                  View All Feeds
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {latestStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestStories.map((story) => (
                  <div
                    className="group bg-base-100 p-6 rounded-2xl border border-base-300 hover:shadow-xl transition-all duration-300 flex justify-between items-center gap-6"
                    key={story.id}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="badge badge-primary badge-outline badge-sm uppercase text-[10px] font-bold py-2">
                          {story.source}
                        </span>
                        <span className="text-xs text-base-content/40">
                          {new Date(story.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {story.title}
                      </h3>
                      <p className="text-sm text-base-content/60 line-clamp-2 leading-relaxed">
                        {story.summary}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <GenerationModal
                        autoStart={true}
                        initialSource={{
                          id:
                            story.sourceId ||
                            story.source.toLowerCase().replace(/\s+/g, "-"),
                          name: story.source,
                          url: story.url,
                        }}
                        trigger={
                          <Button
                            aria-label="Generate Podcast"
                            className="h-12 w-12 p-0 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                            variant="primary"
                          >
                            <Play className="w-5 h-5" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-base-200/20 rounded-2xl border-2 border-dashed border-base-300">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-base-content/60 font-medium">
                  Checking for latest news...
                </p>
                <p className="text-xs text-base-content/40 mt-1">
                  This will only take a moment
                </p>
              </div>
            )}
          </section>

          {/* Feature Grid */}
          <section>
            <h2 className="sr-only">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card bg-base-200/50 border border-base-300">
                <div className="card-body p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Global Sources</h3>
                  <p className="text-base-content/60 leading-relaxed">
                    Connect to major news outlets, tech blogs, and niche
                    publications for a comprehensive view.
                  </p>
                </div>
              </div>
              <div className="card bg-base-200/50 border border-base-300">
                <div className="card-body p-8">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Instant Generation</h3>
                  <p className="text-base-content/60 leading-relaxed">
                    Our AI summarizes long articles into concise, engaging
                    scripts and converts them to high-quality speech in seconds.
                  </p>
                </div>
              </div>
              <div className="card bg-base-200/50 border border-base-300">
                <div className="card-body p-8">
                  <div className="w-12 h-12 bg-info/10 rounded-2xl flex items-center justify-center mb-6">
                    <Headphones className="w-6 h-6 text-info" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    Crystal Clear Audio
                  </h3>
                  <p className="text-base-content/60 leading-relaxed">
                    Using state-of-the-art text-to-speech technology for a
                    natural listening experience that sounds like a professional
                    host.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Episodes */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Recent Episodes</h2>
                <p className="text-base-content/60">
                  The latest generation from your library
                </p>
              </div>
              <Link href="/episodes">
                <Button btnStyle="ghost" className="gap-2 group">
                  View All Library
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {episodes.map((episode) => (
                  <EpisodeCard episode={episode as Episode} key={episode.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-base-200/30 rounded-3xl border-2 border-dashed border-base-300">
                <Podcast className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
                <h3 className="text-xl font-medium mb-2">No episodes yet</h3>
                <p className="text-base-content/60 mb-8">
                  Start by generating your first podcast from a news source
                </p>
                <Link href="/sources">
                  <Button variant="primary">Explore Sources</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Featured Sources */}
          <section className="bg-base-200 rounded-3xl p-8 lg:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Sources</h2>
                <p className="text-base-content/60">
                  High-quality news providers ready for generation
                </p>
              </div>
              <Link href="/sources">
                <Button className="gap-2" btnStyle="outline">
                  Manage Sources
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sources.map((source) => (
                <div
                  className="bg-base-100 p-6 rounded-2xl border border-base-300 flex items-center gap-4 hover:shadow-lg transition-shadow"
                  key={source.id}
                >
                  <div className="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-base-content/40" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold truncate">{source.name}</h3>
                    <p className="text-xs text-base-content/60 truncate">
                      {new URL(source.url).hostname}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Footer */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-bold mb-6">Ready to listen?</h2>
            <Link href="/sources">
              <Button
                className="h-14 px-10 text-lg"
                size="lg"
                variant="primary"
              >
                Generate Your Morning Pod
              </Button>
            </Link>
          </section>
        </div>
      </HomeClientWrapper>
    </MainLayout>
  );
}
