"use client";

import {
  Home,
  Podcast,
  Radio,
  Settings,
  Clock,
  Menu,
  X,
  Plus,
  Shield,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FeatureFlagAdmin } from "../features/feature-flag-admin";
import { GenerationModal } from "../features/generation-modal";
import { ThemeSwitcherCompact } from "../ui/theme-switcher-compact";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Main dashboard",
  },
  {
    name: "Episodes",
    href: "/episodes",
    icon: Podcast,
    description: "Browse all episodes",
  },
  {
    name: "Sources",
    href: "/sources",
    icon: Radio,
    description: "Manage news sources",
  },
  {
    name: "Scraping",
    href: "/scraping",
    icon: Radio,
    description: "Content scraping",
  },
  {
    name: "Queue",
    href: "/queue",
    icon: Clock,
    description: "Generation queue",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "App preferences",
  },
];

const internalLinks = [
  {
    name: "Component Hub",
    href: "/internal",
    description: "Development overview",
  },
  {
    name: "Episode Cards",
    href: "/internal/comparison/episode-cards",
    description: "Episode card variants",
  },
  {
    name: "Episode Players",
    href: "/internal/comparison/episode-players",
    description: "Player variants",
  },
  {
    name: "Queue Status",
    href: "/internal/comparison/queue-status",
    description: "Queue status variants",
  },
];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const [featureFlagDropdownOpen, setFeatureFlagDropdownOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Feature flag dropdown backdrop */}
      {featureFlagDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setFeatureFlagDropdownOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-base-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Podcast className="w-5 h-5 text-primary-content" />
              </div>
              <div>
                <div className="text-lg font-bold text-base-content">
                  Morning Pod
                </div>
                <p className="text-xs text-base-content/60">
                  AI Podcast Generator
                </p>
              </div>
            </div>
            <button
              className="lg:hidden btn btn-ghost btn-sm btn-circle"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-content"
                        : "text-base-content hover:bg-base-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? "text-primary-content"
                          : "text-base-content/60"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div
                        className={`text-xs ${
                          isActive
                            ? "text-primary-content/80"
                            : "text-base-content/50"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Internal/Development Section */}
            <div className="pt-6 mt-6 border-t border-base-300">
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-base-content/70 uppercase tracking-wider">
                  Development
                </h3>
              </div>
              <div className="space-y-1">
                {internalLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActiveRoute(item.href)
                        ? "bg-warning/20 text-warning-content"
                        : "text-base-content/70 hover:bg-base-300"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-2 h-2 rounded-full bg-warning mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-base-content/70">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-base-300">
            <div className="flex items-center justify-between">
              <div className="text-xs text-base-content/50">
                v0.1.0 • Development
              </div>
              <ThemeSwitcherCompact />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-12 items-center justify-between bg-base-100/95 backdrop-blur-sm border-b border-base-300 px-4 lg:px-6">
          <button
            className="lg:hidden btn btn-ghost btn-sm btn-circle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-none">
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-base-content">
                {navigation.find((item) => isActiveRoute(item.href))?.name ||
                  "Morning Pod"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Feature Flags Dropdown */}
            <div className="relative">
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={() =>
                  setFeatureFlagDropdownOpen(!featureFlagDropdownOpen)
                }
                aria-label="View feature flags"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Flags</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {featureFlagDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 z-50">
                  <FeatureFlagAdmin />
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={() => setGenerationModalOpen(true)}
              aria-label="Generate new podcast episode"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Episode</span>
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Generation Modal */}
      <GenerationModal
        isOpen={generationModalOpen}
        onClose={() => setGenerationModalOpen(false)}
      />
    </div>
  );
}
