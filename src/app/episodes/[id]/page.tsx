"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Globe,
  Share2,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EpisodeCard } from "@/components/features/episode-card";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";
import { type Episode } from "@/lib/db/schema";
import { api } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAudio } from "@/components/providers/AudioProvider";

export default function EpisodePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { playEpisode } = useAudio();
  const [episode, setEpisode] = useState<any>(null);

  const deleteEpisode = api.episodes.delete.useMutation({
    onSuccess: () => {
      toast.success("Episode deleted successfully");
      router.push("/episodes");
    },
    onError: (error) => {
      toast.error(`Failed to delete episode: ${error.message}`);
    },
  });

  const { data, isLoading } = api.episodes.getById.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );

  useEffect(() => {
    if (data) {
      setEpisode(data);
      // Auto-play when entering the page if it's ready
      if (data.status === "ready" && data.audioUrl) {
        playEpisode(data as any);
      }
    }
  }, [data, playEpisode]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!episode) {
    return notFound();
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Navigation */}
        <Link href="/episodes">
          <Button btnStyle="ghost" className="gap-2 mb-8 group" size="sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Library
          </Button>
        </Link>

        {/* Episode Content */}
        <div className="grid grid-cols-1 gap-12">
          {/* Header */}
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="badge badge-primary badge-outline uppercase text-[10px] font-bold tracking-widest py-2">
                  {episode.sourceName || episode.sourceId}
                </span>
                <span className="text-xs text-base-content/40 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(episode.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs text-base-content/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(episode.duration)}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <h1 className="text-4xl lg:text-5xl font-black text-base-content leading-tight">
                  {episode.title}
                </h1>
                <EpisodeCard
                  episode={episode as any}
                  variant="compact"
                  className="md:w-72 bg-base-200 border-base-300"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-base-300">
              <Button className="gap-2" btnStyle="outline" size="sm">
                <Download className="w-4 h-4" />
                Download Audio
              </Button>
              <Button className="gap-2" btnStyle="outline" size="sm">
                <Share2 className="w-4 h-4" />
                Share Briefing
              </Button>
              <div className="ml-auto text-sm text-base-content/40 flex items-center gap-4">
                Generated via {episode.ttsService.toUpperCase()}
                <Button
                  btnStyle="outline"
                  className="w-full text-error border-error hover:bg-error hover:text-white"
                  onClick={() => deleteEpisode.mutate({ id: episode.id })}
                  size="sm"
                >
                  Delete Episode
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-base-content">
              <Volume2 className="w-6 h-6 text-primary" />
              Detailed Briefing
            </h2>
            <div className="prose prose-lg max-w-none text-base-content/80 leading-relaxed">
              {episode.summary.split("\n\n").map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Source Attribution */}
            <div className="mt-12 p-6 bg-base-200/50 rounded-2xl border border-base-300 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-base-300 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-base-content/40" />
                </div>
                <div>
                  <p className="text-xs text-base-content/40 uppercase font-bold">
                    Content Source
                  </p>
                  <p className="font-bold text-lg text-base-content">
                    {episode.sourceName}
                  </p>
                </div>
              </div>
              <a
                href={episode.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                Visit Source
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
