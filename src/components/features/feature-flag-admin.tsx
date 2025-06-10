"use client";

import { Database, Settings, Shield, Users, Zap } from "lucide-react";

import { useAllFeatureFlags } from "@/lib/feature-flags/client";

export function FeatureFlagAdmin() {
  const flags = useAllFeatureFlags();

  const flagCategories = [
    {
      description: "AI-powered and advanced features",
      flags: [
        {
          description: "High-quality text-to-speech",
          key: "premium-tts-enabled",
          name: "Premium TTS",
        },
        {
          description: "AI content summarization",
          key: "ai-summarization-enabled",
          name: "AI Summarization",
        },
        {
          description: "OpenAI text-to-speech service",
          key: "openai-tts-enabled",
          name: "OpenAI TTS",
        },
        {
          description: "Google Cloud TTS service",
          key: "google-tts-enabled",
          name: "Google TTS",
        },
      ],
      icon: Zap,
      title: "Premium Features",
    },
    {
      description: "Available content sources",
      flags: [
        {
          description: "Tech news digest",
          key: "tldr-source-enabled",
          name: "TLDR Newsletter",
        },
        {
          description: "Community tech news",
          key: "hacker-news-source-enabled",
          name: "Hacker News",
        },
        {
          description: "Business news digest",
          key: "morning-brew-source-enabled",
          name: "Morning Brew",
        },
        {
          description: "Tech industry news",
          key: "techcrunch-source-enabled",
          name: "TechCrunch",
        },
      ],
      icon: Database,
      title: "Content Sources",
    },
    {
      description: "User tier and access controls",
      flags: [
        {
          description: "Access to premium content",
          key: "premium-content-enabled",
          name: "Premium Content",
        },
        {
          description: "Access to free content",
          key: "free-content-enabled",
          name: "Free Content",
        },
        {
          description: "Increased generation limits",
          key: "high-daily-limits-enabled",
          name: "High Daily Limits",
        },
        {
          description: "No generation limits",
          key: "unlimited-generation-enabled",
          name: "Unlimited Generation",
        },
      ],
      icon: Users,
      title: "User Access",
    },
    {
      description: "User interface enhancements",
      flags: [
        {
          description: "Enhanced audio player",
          key: "advanced-player-enabled",
          name: "Advanced Player",
        },
        {
          description: "Live queue updates",
          key: "real-time-queue-enabled",
          name: "Real-time Queue",
        },
        {
          description: "Enhanced episode cards",
          key: "visual-episode-cards-enabled",
          name: "Visual Episode Cards",
        },
      ],
      icon: Settings,
      title: "UI Features",
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
            <div className="space-y-2" key={category.title}>
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
                      className="flex items-center justify-between p-2 bg-base-200/50 rounded"
                      key={flag.key}
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
