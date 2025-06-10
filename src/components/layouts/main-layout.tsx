"use client";

import {
  ChevronDown,
  Clock,
  Home,
  Menu,
  Plus,
  Podcast,
  Radio,
  Settings,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FeatureFlagAdmin } from "../features/feature-flag-admin";
import { ThemeSwitcherCompact } from "../ui/theme-switcher-compact";

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    description: "Main dashboard",
    href: "/",
    icon: Home,
    name: "Home",
  },
  {
    description: "Browse all episodes",
    href: "/episodes",
    icon: Podcast,
    name: "Episodes",
  },
  {
    description: "Manage news sources",
    href: "/sources",
    icon: Radio,
    name: "Sources",
  },
  {
    description: "Content scraping",
    href: "/scraping",
    icon: Radio,
    name: "Scraping",
  },
  {
    description: "Generation queue",
    href: "/queue",
    icon: Clock,
    name: "Queue",
  },
  {
    description: "App preferences",
    href: "/settings",
    icon: Settings,
    name: "Settings",
  },
];

const internalLinks = [
  {
    description: "Development overview",
    href: "/internal",
    name: "Component Hub",
  },
  {
    description: "Processor management",
    href: "/queue/processor",
    name: "Queue Processor",
  },
  {
    description: "Episode card variants",
    href: "/internal/comparison/episode-cards",
    name: "Episode Cards",
  },
  {
    description: "Player variants",
    href: "/internal/comparison/episode-players",
    name: "Episode Players",
  },
  {
    description: "Queue status variants",
    href: "/internal/comparison/queue-status",
    name: "Queue Status",
  },
];

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featureFlagDropdownOpen, setFeatureFlagDropdownOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-base-100 min-h-screen">
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
        className={`bg-base-200 border-base-300 fixed inset-y-0 left-0 z-50 w-72 transform border-r shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-base-300 flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Podcast className="text-primary-content h-5 w-5" />
              </div>
              <div>
                <div className="text-base-content text-lg font-bold">
                  Morning Pod
                </div>
                <p className="text-base-content/60 text-xs">
                  AI Podcast Generator
                </p>
              </div>
            </div>
            <button
              aria-label="Close navigation menu"
              className="btn btn-ghost btn-sm btn-circle lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                      isActive
                        ? "bg-primary text-primary-content shadow-lg"
                        : "text-base-content hover:bg-base-300 hover:shadow-md"
                    }`}
                    href={item.href}
                    key={item.name}
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
            <div className="border-base-300 mt-6 border-t pt-6">
              <div className="mb-3 px-3">
                <h3 className="text-base-content/70 text-xs font-semibold tracking-wider uppercase">
                  Development
                </h3>
              </div>
              <div className="space-y-1">
                {internalLinks.map((item) => (
                  <Link
                    className={`group flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActiveRoute(item.href)
                        ? "bg-warning/20 text-warning-content"
                        : "text-base-content/70 hover:bg-base-300"
                    }`}
                    href={item.href}
                    key={item.name}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="bg-warning mr-3 h-2 w-2 flex-shrink-0 rounded-full" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-base-content/70 text-xs">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-base-300 border-t p-4">
            <div className="flex items-center justify-between">
              <div className="text-base-content/50 text-xs">
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
        <div className="bg-base-100/95 border-base-300 sticky top-0 z-30 flex h-12 items-center justify-between border-b px-4 backdrop-blur-sm lg:px-6">
          <button
            aria-label="Open navigation menu"
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 lg:flex-none">
            <div className="hidden lg:block">
              <h2 className="text-base-content text-lg font-semibold">
                {navigation.find((item) => isActiveRoute(item.href))?.name ||
                  "Morning Pod"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Feature Flags Dropdown */}
            <div className="relative">
              <button
                aria-label="View feature flags"
                className="btn btn-ghost btn-sm gap-2"
                onClick={() =>
                  setFeatureFlagDropdownOpen(!featureFlagDropdownOpen)
                }
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Flags</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {featureFlagDropdownOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 w-80">
                  <FeatureFlagAdmin />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
