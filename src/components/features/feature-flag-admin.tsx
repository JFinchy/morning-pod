"use client";

import { Shield, Zap, Database, Users, Settings } from "lucide-react";

import { useAllFeatureFlags } from "@/lib/feature-flags/client";

export function FeatureFlagAdmin() {
  const flags = useAllFeatureFlags();

  const flagCategories = [
    {
      title: "Premium Features",
      icon: Zap,
      description: "AI-powered and advanced features",
      flags: [
        {
          key: "premium-tts-enabled",
          name: "Premium TTS",
          description: "High-quality text-to-speech",
        },
        {
          key: "ai-summarization-enabled",
          name: "AI Summarization",
          description: "AI content summarization",
        },
        {
          key: "openai-tts-enabled",
          name: "OpenAI TTS",
          description: "OpenAI text-to-speech service",
        },
        {
          key: "google-tts-enabled",
          name: "Google TTS",
          description: "Google Cloud TTS service",
        },
      ],
    },
    {
      title: "Content Sources",
      icon: Database,
      description: "Available content sources",
      flags: [
        {
          key: "tldr-source-enabled",
          name: "TLDR Newsletter",
          description: "Tech news digest",
        },
        {
          key: "hacker-news-source-enabled",
          name: "Hacker News",
          description: "Community tech news",
        },
        {
          key: "morning-brew-source-enabled",
          name: "Morning Brew",
          description: "Business news digest",
        },
        {
          key: "techcrunch-source-enabled",
          name: "TechCrunch",
          description: "Tech industry news",
        },
      ],
    },
    {
      title: "User Access",
      icon: Users,
      description: "User tier and access controls",
      flags: [
        {
          key: "premium-content-enabled",
          name: "Premium Content",
          description: "Access to premium content",
        },
        {
          key: "free-content-enabled",
          name: "Free Content",
          description: "Access to free content",
        },
        {
          key: "high-daily-limits-enabled",
          name: "High Daily Limits",
          description: "Increased generation limits",
        },
        {
          key: "unlimited-generation-enabled",
          name: "Unlimited Generation",
          description: "No generation limits",
        },
      ],
    },
    {
      title: "UI Features",
      icon: Settings,
      description: "User interface enhancements",
      flags: [
        {
          key: "advanced-player-enabled",
          name: "Advanced Player",
          description: "Enhanced audio player",
        },
        {
          key: "real-time-queue-enabled",
          name: "Real-time Queue",
          description: "Live queue updates",
        },
        {
          key: "visual-episode-cards-enabled",
          name: "Visual Episode Cards",
          description: "Enhanced episode cards",
        },
      ],
    },
  ];

  if (!flags || Object.keys(flags).length === 0) {
    return (
      <div className="bg-base-100 rounded-lg border border-base-300 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-base-content/70" />
          <span className="text-sm font-medium text-base-content/70">
            Feature Flags
          </span>
        </div>
        <p className="text-xs text-base-content/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg border border-base-300 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Feature Flags</span>
      </div>

      <div className="space-y-4">
        {flagCategories.map((category) => {
          const CategoryIcon = category.icon;

          return (
            <div key={category.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-3 h-3 text-base-content/60" />
                <span className="text-xs font-medium text-base-content/80">
                  {category.title}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 ml-5">
                {category.flags.map((flag) => {
                  const isEnabled = flags[flag.key as keyof typeof flags];

                  return (
                    <div
                      key={flag.key}
                      className="flex items-center justify-between p-2 bg-base-200/50 rounded"
                      title={flag.description}
                    >
                      <span className="text-xs text-base-content/70 truncate">
                        {flag.name}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isEnabled ? "bg-success" : "bg-error"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
