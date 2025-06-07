"use client";

import { ExternalLink, Palette, Code, Eye } from "lucide-react";
import Link from "next/link";

import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui";

export default function InternalPage() {
  const componentVariants = [
    {
      name: "Episode Cards",
      description: "Different styles for displaying episode information",
      href: "/internal/comparison/episode-cards",
      variants: ["Minimal", "Visual", "Compact"],
      status: "Complete",
    },
    {
      name: "Episode Players",
      description: "Audio player components with different UX approaches",
      href: "/internal/comparison/episode-players",
      variants: ["Traditional", "Spotify-style", "Waveform"],
      status: "Complete",
    },
    {
      name: "Queue Status",
      description: "Real-time queue monitoring with different layouts",
      href: "/internal/comparison/queue-status",
      variants: ["Progress Bar", "Dashboard", "Timeline"],
      status: "Complete",
    },
  ];

  const developmentPages = [
    {
      name: "Scraping Development Tools",
      description:
        "Debug and monitor content scraping services with real-time metrics",
      href: "/internal/scraping",
      category: "Content Pipeline",
      status: "Active",
    },
    {
      name: "Scraping Strategy Comparison",
      description:
        "Compare content sources and scraping strategies for optimal results",
      href: "/internal/scraping/comparison",
      category: "Content Pipeline",
      status: "Active",
    },
    {
      name: "Analytics Dashboard",
      description:
        "Test PostHog integration and monitor analytics events in real-time",
      href: "/internal/analytics",
      category: "Analytics",
      status: "Active",
    },
  ];

  const designPrinciples = [
    {
      title: "Component-First Development",
      description:
        "Build UI components with multiple variants before backend integration",
      icon: Code,
    },
    {
      title: "Modern Design Language",
      description: "Clean, minimalist interfaces with purposeful animations",
      icon: Palette,
    },
    {
      title: "Iterative Selection",
      description: "Compare variants side-by-side to choose the best approach",
      icon: Eye,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-base-content mb-4">
            Component Development Hub
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            This internal workspace showcases our component-first development
            approach. Each major UI element has been built with multiple
            variants to compare and select the best design patterns.
          </p>
        </div>

        {/* Design Principles */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="text-xl font-semibold mb-6">Design Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {designPrinciples.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div key={principle.title} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base-content mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Development Tools */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="text-xl font-semibold mb-4">Development Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/api/trpc-ui"
                target="_blank"
                className="block p-4 border border-base-300 rounded-lg hover:bg-base-200/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base-content">tRPC UI</h3>
                    <p className="text-sm text-base-content/60">
                      Interactive API testing interface
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-base-content/40 ml-auto" />
                </div>
              </Link>

              <div className="p-4 border border-base-300 rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-300 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-base-content/50" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base-content/50">
                      Performance Monitor
                    </h3>
                    <p className="text-sm text-base-content/40">
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
          <h2 className="text-xl font-semibold mb-6">Component Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {componentVariants.map((component) => (
              <div
                key={component.name}
                className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all duration-200"
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base-content">
                      {component.name}
                    </h3>
                    <div className="badge badge-success badge-sm">
                      {component.status}
                    </div>
                  </div>

                  <p className="text-sm text-base-content/70 mb-4">
                    {component.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-xs text-base-content/60 mb-2">
                      Variants:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {component.variants.map((variant) => (
                        <span
                          key={variant}
                          className="badge badge-outline badge-sm"
                        >
                          {variant}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="card-actions">
                    <Link href={component.href} className="w-full">
                      <Button
                        btnStyle="outline"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
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
          <h2 className="text-xl font-semibold mb-6">Development Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {developmentPages.map((page) => (
              <div
                key={page.name}
                className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-all duration-200"
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base-content">{page.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-primary badge-sm">
                        {page.category}
                      </div>
                      <div className="badge badge-info badge-sm">
                        {page.status}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-base-content/70 mb-4">
                    {page.description}
                  </p>

                  <div className="card-actions">
                    <Link href={page.href} className="w-full">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
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
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="text-xl font-semibold mb-4">
              Component Architecture
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Folder Structure</h3>
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
                <h3 className="font-medium mb-3">Development Workflow</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <span className="text-sm">
                      Build 2-3 component variants
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <span className="text-sm">Create comparison page</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <span className="text-sm">
                      Test with different data states
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs font-bold">
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
        <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
          <div className="card-body p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Explore the Application
            </h2>
            <p className="text-base-content/70 mb-6">
              See how these components work together in the full application
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/">
                <Button variant="primary" size="sm">
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
      </div>
    </MainLayout>
  );
}
