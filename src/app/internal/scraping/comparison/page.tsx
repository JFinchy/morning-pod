"use client";

import {
  Globe,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Zap,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { api } from "@/lib/trpc/client";

interface ContentSourceComparison {
  id: string;
  name: string;
  category: string;
  audience: string;
  updateFrequency: string;
  contentQuality: number; // 1-10
  scrapingDifficulty: number; // 1-10
  apiAvailable: boolean;
  rateLimit: string;
  pros: string[];
  cons: string[];
  sampleContent: {
    title: string;
    summary: string;
    tags: string[];
  };
}

const contentSources: ContentSourceComparison[] = [
  {
    id: "tldr",
    name: "TLDR Newsletter",
    category: "Technology",
    audience: "Developers & Tech Enthusiasts",
    updateFrequency: "Daily",
    contentQuality: 9,
    scrapingDifficulty: 3,
    apiAvailable: false,
    rateLimit: "10 req/min",
    pros: [
      "High-quality curated content",
      "Consistent formatting",
      "Tech-focused audience overlap",
      "Daily updates",
      "Concise summaries",
    ],
    cons: [
      "No official API",
      "Rate limiting required",
      "Paywall content",
      "Email-based distribution",
    ],
    sampleContent: {
      title: "OpenAI GPT-4 Turbo with Vision Now Available",
      summary:
        "OpenAI has released GPT-4 Turbo with vision capabilities, allowing the model to understand images and text together. The update includes improved performance and reduced costs.",
      tags: ["AI", "OpenAI", "GPT-4", "Vision", "API"],
    },
  },
  {
    id: "hackernews",
    name: "Hacker News",
    category: "Technology & Startups",
    audience: "Developer Community",
    updateFrequency: "Real-time",
    contentQuality: 8,
    scrapingDifficulty: 2,
    apiAvailable: true,
    rateLimit: "30 req/min",
    pros: [
      "Official API available",
      "Real-time updates",
      "High engagement metrics",
      "Developer-focused content",
      "No authentication required",
    ],
    cons: [
      "Variable content quality",
      "Noise in submissions",
      "Community-driven ranking",
      "Limited content metadata",
    ],
    sampleContent: {
      title: "Show HN: I built a collaborative Rust editor",
      summary:
        "A new collaborative code editor built in Rust with real-time synchronization and VS Code compatibility. Currently supports 10+ languages with syntax highlighting.",
      tags: ["Rust", "Editor", "Collaboration", "Show HN", "Development"],
    },
  },
  {
    id: "morningbrew",
    name: "Morning Brew",
    category: "Business & Finance",
    audience: "Business Professionals",
    updateFrequency: "Daily",
    contentQuality: 9,
    scrapingDifficulty: 5,
    apiAvailable: false,
    rateLimit: "15 req/min",
    pros: [
      "Professional business content",
      "Excellent writing quality",
      "Market insights",
      "Consistent schedule",
      "Broad business coverage",
    ],
    cons: [
      "Subscription model",
      "Complex scraping",
      "Anti-bot measures",
      "Legal considerations",
    ],
    sampleContent: {
      title: "Nvidia Hits $2 Trillion Market Cap Milestone",
      summary:
        "Nvidia has become the fourth company to reach a $2 trillion market valuation, driven by AI chip demand. The stock has surged 60% this year as data centers expand globally.",
      tags: ["Nvidia", "AI", "Stocks", "Market Cap", "Technology"],
    },
  },
];

const scrapingStrategies = [
  {
    name: "Direct Web Scraping",
    complexity: "Medium",
    reliability: 7,
    speed: 8,
    pros: ["Real-time data", "Full content access", "No API limits"],
    cons: ["Anti-bot measures", "Structure changes", "Legal concerns"],
  },
  {
    name: "RSS/Feed Parsing",
    complexity: "Low",
    reliability: 9,
    speed: 9,
    pros: ["Structured data", "Official support", "Reliable updates"],
    cons: ["Limited content", "Not all sources", "Delayed updates"],
  },
  {
    name: "API Integration",
    complexity: "Low",
    reliability: 10,
    speed: 10,
    pros: ["Official support", "Structured data", "Rate limiting", "Reliable"],
    cons: ["Limited sources", "API costs", "Rate limits", "Authentication"],
  },
  {
    name: "Email Parsing",
    complexity: "High",
    reliability: 6,
    speed: 5,
    pros: ["Newsletter access", "Formatted content", "Regular schedule"],
    cons: [
      "Email complexity",
      "Delayed delivery",
      "Spam filters",
      "Authentication",
    ],
  },
];

export default function ScrapingComparisonPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<
    "sources" | "strategies"
  >("sources");

  const getQualityColor = (score: number) => {
    if (score >= 8) return "text-success";
    if (score >= 6) return "text-warning";
    return "text-error";
  };

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return "text-success";
    if (score <= 6) return "text-warning";
    return "text-error";
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Content Source & Strategy Comparison
          </h1>
          <p className="text-base-content/70">
            Compare different content sources and scraping strategies for
            optimal podcast generation
          </p>
        </div>

        {/* Comparison Mode Toggle */}
        <div className="mb-8">
          <div className="tabs tabs-lifted">
            <button
              className={`tab tab-lg ${comparisonMode === "sources" ? "tab-active" : ""}`}
              onClick={() => setComparisonMode("sources")}
            >
              <Globe className="w-4 h-4 mr-2" />
              Content Sources
            </button>
            <button
              className={`tab tab-lg ${comparisonMode === "strategies" ? "tab-active" : ""}`}
              onClick={() => setComparisonMode("strategies")}
            >
              <Zap className="w-4 h-4 mr-2" />
              Scraping Strategies
            </button>
          </div>
        </div>

        {comparisonMode === "sources" ? (
          <>
            {/* Content Sources Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {contentSources.map((source) => (
                <div
                  key={source.id}
                  className={`card bg-base-100 shadow-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedSource === source.id
                      ? "border-primary shadow-xl"
                      : "border-base-300 hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setSelectedSource(
                      selectedSource === source.id ? null : source.id
                    )
                  }
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-2">
                      {source.name}
                      {source.apiAvailable && (
                        <div className="badge badge-success badge-sm">API</div>
                      )}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">Category:</span>
                        <span className="font-medium">{source.category}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">Updates:</span>
                        <span className="font-medium">
                          {source.updateFrequency}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">Quality:</span>
                        <span
                          className={`font-bold ${getQualityColor(source.contentQuality)}`}
                        >
                          {source.contentQuality}/10
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">
                          Difficulty:
                        </span>
                        <span
                          className={`font-bold ${getDifficultyColor(source.scrapingDifficulty)}`}
                        >
                          {source.scrapingDifficulty}/10
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">
                          Rate Limit:
                        </span>
                        <span className="font-medium">{source.rateLimit}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs text-base-content/70 mb-2">
                        Audience Match
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${source.contentQuality * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Source Analysis */}
            {selectedSource && (
              <div className="card bg-base-100 shadow-xl border-2 border-primary mb-8">
                <div className="card-body">
                  {(() => {
                    const source = contentSources.find(
                      (s) => s.id === selectedSource
                    );
                    if (!source) return null;

                    return (
                      <>
                        <h2 className="card-title text-2xl mb-6">
                          {source.name} - Detailed Analysis
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Pros & Cons */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <BarChart3 className="w-5 h-5 mr-2" />
                              Pros & Cons Analysis
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-success mb-2 flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Advantages
                                </h4>
                                <ul className="space-y-1">
                                  {source.pros.map((pro, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-base-content/80 flex items-start"
                                    >
                                      <span className="w-1 h-1 bg-success rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium text-error mb-2 flex items-center">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Challenges
                                </h4>
                                <ul className="space-y-1">
                                  {source.cons.map((con, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-base-content/80 flex items-start"
                                    >
                                      <span className="w-1 h-1 bg-error rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Sample Content */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <FileText className="w-5 h-5 mr-2" />
                              Sample Content
                            </h3>

                            <div className="card bg-base-200 border">
                              <div className="card-body p-4">
                                <h4 className="font-semibold text-base mb-2">
                                  {source.sampleContent.title}
                                </h4>
                                <p className="text-sm text-base-content/80 mb-3">
                                  {source.sampleContent.summary}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {source.sampleContent.tags.map(
                                    (tag, index) => (
                                      <span
                                        key={index}
                                        className="badge badge-primary badge-sm"
                                      >
                                        {tag}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Technical Metrics */}
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-4">
                            Technical Metrics
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div
                                className={`text-2xl font-bold ${getQualityColor(source.contentQuality)}`}
                              >
                                {source.contentQuality}/10
                              </div>
                              <div className="text-sm text-base-content/70">
                                Content Quality
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`text-2xl font-bold ${getDifficultyColor(source.scrapingDifficulty)}`}
                              >
                                {source.scrapingDifficulty}/10
                              </div>
                              <div className="text-sm text-base-content/70">
                                Scraping Difficulty
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {source.apiAvailable ? "Yes" : "No"}
                              </div>
                              <div className="text-sm text-base-content/70">
                                API Available
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-info">
                                {source.rateLimit}
                              </div>
                              <div className="text-sm text-base-content/70">
                                Rate Limit
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Scraping Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {scrapingStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className={`card bg-base-100 shadow-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedStrategy === strategy.name
                      ? "border-primary shadow-xl"
                      : "border-base-300 hover:border-primary/50"
                  }`}
                  onClick={() =>
                    setSelectedStrategy(
                      selectedStrategy === strategy.name ? null : strategy.name
                    )
                  }
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg mb-4">
                      {strategy.name}
                      <div
                        className={`badge ${
                          strategy.complexity === "Low"
                            ? "badge-success"
                            : strategy.complexity === "Medium"
                              ? "badge-warning"
                              : "badge-error"
                        }`}
                      >
                        {strategy.complexity}
                      </div>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reliability</span>
                          <span>{strategy.reliability}/10</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full"
                            style={{ width: `${strategy.reliability * 10}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Speed</span>
                          <span>{strategy.speed}/10</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div
                            className="bg-info h-2 rounded-full"
                            style={{ width: `${strategy.speed * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-success mb-1">
                        Pros:
                      </div>
                      <ul className="text-xs space-y-1">
                        {strategy.pros.slice(0, 2).map((pro, i) => (
                          <li key={i} className="text-base-content/70">
                            • {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategy Comparison Matrix */}
            <div className="card bg-base-100 shadow-xl border">
              <div className="card-body">
                <h2 className="card-title text-xl mb-6">
                  Strategy Comparison Matrix
                </h2>

                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Strategy</th>
                        <th>Complexity</th>
                        <th>Reliability</th>
                        <th>Speed</th>
                        <th>Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scrapingStrategies.map((strategy, index) => (
                        <tr key={index}>
                          <td className="font-semibold">{strategy.name}</td>
                          <td>
                            <div
                              className={`badge ${
                                strategy.complexity === "Low"
                                  ? "badge-success"
                                  : strategy.complexity === "Medium"
                                    ? "badge-warning"
                                    : "badge-error"
                              }`}
                            >
                              {strategy.complexity}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span>{strategy.reliability}/10</span>
                              <div className="w-16 bg-base-300 rounded-full h-2">
                                <div
                                  className="bg-success h-2 rounded-full"
                                  style={{
                                    width: `${strategy.reliability * 10}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span>{strategy.speed}/10</span>
                              <div className="w-16 bg-base-300 rounded-full h-2">
                                <div
                                  className="bg-info h-2 rounded-full"
                                  style={{ width: `${strategy.speed * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-sm text-base-content/70">
                            {strategy.pros[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="primary">Implement Selected Strategy</Button>
          <Button btnStyle="outline">Export Comparison Report</Button>
          <Button btnStyle="outline">View Implementation Guide</Button>
        </div>
      </div>
    </div>
  );
}
