import { Calendar, Clock, Tag, User } from "lucide-react";

import { PlayerLayout } from "@/components/layouts";
import { Button } from "@/components/ui";

const demoEpisode = {
  audioUrl: "/demo-audio.mp3",
  duration: 185, // 3:05
  id: "demo-1",
  source: "TLDR Newsletter",
  summary:
    "Today's tech highlights: OpenAI announces new features for ChatGPT, Apple releases iOS 17.3 with security updates, Microsoft's AI integration reaches new milestones, and startup funding trends for Q1 2024.",
  title: "TLDR Tech News - January 4th, 2024",
};

export default function DemoEpisodePage() {
  return (
    <PlayerLayout episode={demoEpisode}>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Episode Header */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Episode Artwork */}
              <div className="flex-shrink-0">
                <div className="from-primary to-secondary flex h-48 w-48 items-center justify-center rounded-lg bg-gradient-to-br">
                  <div className="text-primary-content text-center">
                    <div className="text-4xl font-bold">MP</div>
                    <div className="text-sm opacity-80">Morning Pod</div>
                  </div>
                </div>
              </div>

              {/* Episode Info */}
              <div className="flex-1 space-y-4">
                <h1 className="text-base-content text-3xl font-bold">
                  {demoEpisode.title}
                </h1>

                <div className="text-base-content/70 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>January 4, 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>3:05</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{demoEpisode.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="badge badge-primary badge-sm">
                      Tech News
                    </span>
                  </div>
                </div>

                <p className="text-base-content/80 text-lg leading-relaxed">
                  {demoEpisode.summary}
                </p>

                <div className="flex gap-2">
                  <Button variant="primary">Listen Now</Button>
                  <Button btnStyle="outline">Add to Queue</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episode Content/Transcript */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Episode Highlights</h2>

            <div className="space-y-6">
              <div className="timeline-item">
                <h3 className="text-primary font-semibold">
                  OpenAI Announcements
                </h3>
                <p className="text-base-content/80 mt-1">
                  OpenAI has unveiled significant updates to ChatGPT, including
                  improved reasoning capabilities and better integration with
                  third-party applications. The new features aim to enhance user
                  productivity and provide more accurate responses across
                  various domains.
                </p>
              </div>

              <div className="timeline-item">
                <h3 className="text-primary font-semibold">
                  Apple iOS 17.3 Security Update
                </h3>
                <p className="text-base-content/80 mt-1">
                  Apple&apos;s latest iOS update addresses several critical
                  security vulnerabilities and introduces new privacy features.
                  The update is recommended for all users and includes
                  performance improvements for older device models.
                </p>
              </div>

              <div className="timeline-item">
                <h3 className="text-primary font-semibold">
                  Microsoft AI Integration
                </h3>
                <p className="text-base-content/80 mt-1">
                  Microsoft continues to expand AI capabilities across its
                  product suite, with new features in Office 365 and Azure
                  services. The integration promises to streamline workflows and
                  enhance collaboration for enterprise customers.
                </p>
              </div>

              <div className="timeline-item">
                <h3 className="text-primary font-semibold">
                  Q1 2024 Startup Funding Trends
                </h3>
                <p className="text-base-content/80 mt-1">
                  Early data suggests a continued focus on AI and sustainability
                  startups in Q1 2024. Venture capital firms are showing
                  increased interest in companies developing practical AI
                  applications and green technology solutions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Episodes */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">More from TLDR Newsletter</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  className="hover:bg-base-200 flex gap-3 rounded-lg p-3 transition-colors"
                  key={i}
                >
                  <div className="bg-primary/20 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg">
                    <div className="text-primary text-sm font-bold">
                      {i + 1}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">
                      TLDR Tech News - January {3 - i}th, 2024
                    </h3>
                    <p className="text-base-content/70 mt-1 text-xs">
                      Daily tech updates and insights • 3:12
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        btnStyle="ghost"
                        className="h-6 text-xs"
                        size="sm"
                      >
                        Play
                      </Button>
                      <Button
                        btnStyle="ghost"
                        className="h-6 text-xs"
                        size="sm"
                      >
                        Queue
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PlayerLayout>
  );
}
