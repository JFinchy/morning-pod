"use client";

import {
  Activity,
  Brain,
  Code,
  ExternalLink,
  Eye,
  Flag as _Flag,
  Layout,
  Palette,
  Search,
  Volume2,
} from "lucide-react";
import Link from "next/link";

import { CanaryMonitoringDashboard } from "@/components/internal/canary-monitoring-dashboard";
import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";

export default function InternalPage() {
  const componentVariants = [
    {
      description: "Different styles for displaying episode information",
      href: "/internal/comparison/episode-cards",
      name: "Episode Cards",
      status: "Complete",
      variants: ["Minimal", "Visual", "Compact"],
    },
    {
      description: "Audio player components with different UX approaches",
      href: "/internal/comparison/episode-players",
      name: "Episode Players",
      status: "Complete",
      variants: ["Traditional", "Spotify-style", "Waveform"],
    },
    {
      description: "Real-time queue monitoring with different layouts",
      href: "/internal/comparison/queue-status",
      name: "Queue Status",
      status: "Complete",
      variants: ["Progress Bar", "Dashboard", "Timeline"],
    },
  ];

  const developmentPages = [
    {
      category: "Content Pipeline",
      description:
        "Debug and monitor content scraping services with real-time metrics",
      href: "/internal/scraping",
      name: "Scraping Development Tools",
      status: "Active",
    },
    {
      category: "Content Pipeline",
      description:
        "Compare content sources and scraping strategies for optimal results",
      href: "/internal/scraping/comparison",
      name: "Scraping Strategy Comparison",
      status: "Active",
    },
    {
      category: "Analytics",
      description:
        "Test PostHog integration and monitor analytics events in real-time",
      href: "/internal/analytics",
      name: "Analytics Dashboard",
      status: "Active",
    },
    {
      category: "Deployment",
      description:
        "Real-time monitoring of canary deployments and feature flag rollouts",
      href: "#canary-monitoring",
      name: "Canary Monitoring",
      status: "Active",
    },
  ];

  const designPrinciples = [
    {
      description:
        "Build UI components with multiple variants before backend integration",
      icon: Code,
      title: "Component-First Development",
    },
    {
      description: "Clean, minimalist interfaces with purposeful animations",
      icon: Palette,
      title: "Modern Design Language",
    },
    {
      description: "Compare variants side-by-side to choose the best approach",
      icon: Eye,
      title: "Iterative Selection",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-base-content mb-4 text-3xl font-bold">
            Component Development Hub
          </h1>
          <p className="text-base-content/70 mx-auto max-w-2xl text-lg">
            This internal workspace showcases our component-first development
            approach. Each major UI element has been built with multiple
            variants to compare and select the best design patterns.
          </p>
        </div>

        {/* Design Principles */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <h2 className="mb-6 text-xl font-semibold">Design Principles</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {designPrinciples.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div className="text-center" key={principle.title}>
                    <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                      <Icon className="text-primary h-6 w-6" />
                    </div>
                    <h3 className="text-base-content mb-2 font-semibold">
                      {principle.title}
                    </h3>
                    <p className="text-base-content/60 text-sm">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <h2 className="mb-4 text-xl font-semibold">Development Tools</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                className="border-base-300 hover:bg-base-200/50 block rounded-lg border p-4 transition-colors"
                href="/api/trpc-ui"
                target="_blank"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Code className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base-content font-medium">tRPC UI</h3>
                    <p className="text-base-content/60 text-sm">
                      Interactive API testing interface
                    </p>
                  </div>
                  <ExternalLink className="text-base-content/40 ml-auto h-4 w-4" />
                </div>
              </Link>

              <div className="border-base-300 rounded-lg border p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="bg-base-300 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Eye className="text-base-content/50 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base-content/50 font-medium">
                      Performance Monitor
                    </h3>
                    <p className="text-base-content/40 text-sm">
                      Coming soon - Real-time performance metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Variants */}
        <div>
          <h2 className="mb-6 text-xl font-semibold">Component Variants</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {componentVariants.map((component) => (
              <div
                className="card bg-base-100 border-base-300 border shadow-sm transition-all duration-200 hover:shadow-md"
                key={component.name}
              >
                <div className="card-body p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-base-content font-bold">
                      {component.name}
                    </h3>
                    <div className="badge badge-success badge-sm">
                      {component.status}
                    </div>
                  </div>

                  <p className="text-base-content/70 mb-4 text-sm">
                    {component.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-base-content/60 mb-2 text-xs">
                      Variants:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {component.variants.map((variant) => (
                        <span
                          className="badge badge-outline badge-sm"
                          key={variant}
                        >
                          {variant}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card-actions">
                    <Link className="w-full" href={component.href}>
                      <Button
                        btnStyle="outline"
                        className="w-full gap-2"
                        size="sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Comparison
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Pages */}
        <div>
          <h2 className="mb-6 text-xl font-semibold">Development Pages</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {developmentPages.map((page) => (
              <div
                className="card bg-base-100 border-base-300 border shadow-sm transition-all duration-200 hover:shadow-md"
                key={page.name}
              >
                <div className="card-body p-6">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-base-content font-bold">{page.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-primary badge-sm">
                        {page.category}
                      </div>
                      <div className="badge badge-info badge-sm">
                        {page.status}
                      </div>
                    </div>
                  </div>

                  <p className="text-base-content/70 mb-4 text-sm">
                    {page.description}
                  </p>

                  <div className="card-actions">
                    <Link className="w-full" href={page.href}>
                      <Button
                        className="w-full gap-2"
                        size="sm"
                        variant="primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Tools
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Architecture */}
        <div className="card bg-base-100 border-base-300 border shadow-sm">
          <div className="card-body p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Component Architecture
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-medium">Folder Structure</h3>
                <div className="bg-base-200 rounded-lg p-4 font-mono text-sm">
                  <div className="space-y-1">
                    <div>src/components/</div>
                    <div className="ml-4">
                      ├── ui/{" "}
                      <span className="text-base-content/60">
                        # Base components
                      </span>
                    </div>
                    <div className="ml-4">
                      ├── features/{" "}
                      <span className="text-base-content/60">
                        # App-specific
                      </span>
                    </div>
                    <div className="ml-4">
                      ├── layouts/{" "}
                      <span className="text-base-content/60">
                        # Page layouts
                      </span>
                    </div>
                    <div className="ml-4">└── internal/</div>
                    <div className="ml-8">
                      └── variants/{" "}
                      <span className="text-base-content/60">
                        # Component versions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-medium">Development Workflow</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-content flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      1
                    </div>
                    <span className="text-sm">
                      Build 2-3 component variants
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-content flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      2
                    </div>
                    <span className="text-sm">Create comparison page</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-content flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      3
                    </div>
                    <span className="text-sm">
                      Test with different data states
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-content flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      4
                    </div>
                    <span className="text-sm">
                      Select best-performing design
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to Main Pages */}
        <div className="card from-primary/5 to-secondary/5 border-primary/20 border bg-gradient-to-br">
          <div className="card-body p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold">
              Explore the Application
            </h2>
            <p className="text-base-content/70 mb-6">
              See how these components work together in the full application
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/">
                <Button size="sm" variant="primary">
                  Dashboard
                </Button>
              </Link>
              <Link href="/episodes">
                <Button btnStyle="outline" size="sm">
                  Episodes
                </Button>
              </Link>
              <Link href="/sources">
                <Button btnStyle="outline" size="sm">
                  Sources
                </Button>
              </Link>
              <Link href="/queue">
                <Button btnStyle="outline" size="sm">
                  Queue
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Development Tools Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Scraping Tools */}
          <Link className="group" href="/internal/scraping">
            <div className="card bg-base-200 shadow-sm transition-all duration-200 group-hover:scale-[1.02] hover:shadow-md">
              <div className="card-body">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2 transition-colors group-hover:bg-blue-500/20">
                    <Search className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="card-title">Content Scraping</h3>
                </div>
                <p className="text-base-content/70 text-sm">
                  Test scrapers, monitor performance, and view real-time metrics
                  for TLDR, Hacker News, and Morning Brew content sources.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="badge badge-primary badge-sm">
                    Live Monitoring
                  </div>
                  <div className="badge badge-secondary badge-sm">
                    3 Sources
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* AI Summarization Lab */}
          <Link className="group" href="/internal/summarization">
            <div className="card bg-base-200 shadow-sm transition-all duration-200 group-hover:scale-[1.02] hover:shadow-md">
              <div className="card-body">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2 transition-colors group-hover:bg-purple-500/20">
                    <Brain className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="card-title">AI Summarization</h3>
                </div>
                <p className="text-base-content/70 text-sm">
                  Test AI summarization with different models, track costs and
                  quality metrics, and optimize content for TTS conversion.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="badge badge-primary badge-sm">
                    OpenAI GPT-4
                  </div>
                  <div className="badge badge-secondary badge-sm">
                    Quality Tracking
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* TTS Lab */}
          <Link className="group" href="/internal/tts">
            <div className="card bg-base-200 shadow-sm transition-all duration-200 group-hover:scale-[1.02] hover:shadow-md">
              <div className="card-body">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2 transition-colors group-hover:bg-green-500/20">
                    <Volume2 className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="card-title">TTS Lab</h3>
                </div>
                <p className="text-base-content/70 text-sm">
                  Test text-to-speech audio generation with multiple voices and
                  providers. Configure quality settings, monitor costs, and
                  preview podcast audio.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="badge badge-primary badge-sm">OpenAI TTS</div>
                  <div className="badge badge-secondary badge-sm">
                    Voice Selection
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Component Comparison */}
          <Link className="group" href="/internal/comparison/episode-cards">
            <div className="card bg-base-200 shadow-sm transition-all duration-200 group-hover:scale-[1.02] hover:shadow-md">
              <div className="card-body">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2 transition-colors group-hover:bg-green-500/20">
                    <Layout className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="card-title">Component Variants</h3>
                </div>
                <p className="text-base-content/70 text-sm">
                  Compare different UI component designs side-by-side. Episode
                  cards, players, and queue status variants.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="badge badge-primary badge-sm">
                    3 Variants Each
                  </div>
                  <div className="badge badge-secondary badge-sm">
                    A/B Testing
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Canary Monitoring Dashboard */}
        <div
          className="card bg-base-100 border-base-300 border shadow-sm"
          id="canary-monitoring"
        >
          <div className="card-body p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Canary Deployment Monitoring
                </h2>
                <p className="text-base-content/70 text-sm">
                  Real-time monitoring of canary deployments and automated
                  feature flag rollouts
                </p>
              </div>
            </div>

            <CanaryMonitoringDashboard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
