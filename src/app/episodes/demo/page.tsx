import { Clock, Calendar, User, Tag } from "lucide-react";

import { PlayerLayout } from "@/components/layouts";
import { Button } from "@/components/ui";

const demoEpisode = {
  id: "demo-1",
  title: "TLDR Tech News - January 4th, 2024",
  summary:
    "Today's tech highlights: OpenAI announces new features for ChatGPT, Apple releases iOS 17.3 with security updates, Microsoft's AI integration reaches new milestones, and startup funding trends for Q1 2024.",
  audioUrl: "/demo-audio.mp3",
  duration: 185, // 3:05
  source: "TLDR Newsletter",
};

export default function DemoEpisodePage() {
  return (
    <PlayerLayout episode={demoEpisode}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Episode Header */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Episode Artwork */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <div className="text-primary-content text-center">
                    <div className="text-4xl font-bold">MP</div>
                    <div className="text-sm opacity-80">Morning Pod</div>
                  </div>
                </div>
              </div>

              {/* Episode Info */}
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold text-base-content">
                  {demoEpisode.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-base-content/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>January 4, 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>3:05</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{demoEpisode.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
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
                <h3 className="font-semibold text-primary">
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
                <h3 className="font-semibold text-primary">
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
                <h3 className="font-semibold text-primary">
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
                <h3 className="font-semibold text-primary">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-primary font-bold text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      TLDR Tech News - January {3 - i}th, 2024
                    </h3>
                    <p className="text-xs text-base-content/70 mt-1">
                      Daily tech updates and insights • 3:12
                    </p>
                    <div className="flex items-center mt-2 gap-2">
                      <Button
                        size="sm"
                        btnStyle="ghost"
                        className="h-6 text-xs"
                      >
                        Play
                      </Button>
                      <Button
                        size="sm"
                        btnStyle="ghost"
                        className="h-6 text-xs"
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
