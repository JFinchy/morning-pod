"use client";

import {
  ChevronDown,
  Clock,
  Compass,
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

import { QueueList } from "@/components/features/queue-list";

import { FeatureFlagAdmin } from "../features/feature-flag-admin";
import { GlobalAudioPlayer } from "../features/global-audio-player";
import { ThemeSwitcher } from "../ui/theme-switcher";
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
    description: "Find new stories",
    href: "/discover",
    icon: Compass,
    name: "Discover",
  },
  {
    description: "Browse your episodes",
    href: "/episodes",
    icon: Podcast,
    name: "My Episodes",
  },
  {
    description: "News sources",
    href: "/sources",
    icon: Radio,
    name: "Sources",
  },
  {
    description: "App preferences",
    href: "/settings",
    icon: Settings,
    name: "Settings",
  },
  {
    description: "Admin & Dev Tools",
    href: "/internal",
    icon: Shield,
    name: "Internal",
  },
];

const internalLinks = [
  {
    description: "Development overview",
    href: "/internal",
    name: "Admin Dashboard",
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
  {
    description: "Scraping strategies",
    href: "/internal/comparison/scraping",
    name: "Scraping Comparison",
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-base-200 border-r border-base-300 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between px-6 border-b border-base-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Podcast className="w-5 h-5 text-primary-content" />
              </div>
              <div>
                <div className="text-lg font-bold text-base-content">
                  Morning Pod
                </div>
                <p className="text-xs text-base-content/70">
                  AI Podcast Generator
                </p>
              </div>
            </div>
            <button
              aria-label="Close navigation menu"
              className="lg:hidden btn btn-ghost btn-sm btn-circle"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] ${
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
                            : "text-base-content/70"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Internal/Development Section - Only show when in /internal area */}
            {pathname.startsWith("/internal") && (
              <div className="pt-6 mt-6 border-t border-base-300 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-base-content/70 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
                <div className="space-y-1">
                  {internalLinks.map((item) => (
                    <Link
                      className={`group flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActiveRoute(item.href)
                          ? "bg-warning/20 text-warning-content shadow-sm"
                          : "text-base-content/70 hover:bg-base-300"
                      }`}
                      href={item.href}
                      key={item.name}
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
            )}
          </nav>

          {/* Footer */}
          <footer className="p-4 border-t border-base-300">
            <div className="flex items-center justify-between">
              <div className="text-xs text-base-content/70">v0.1.0-beta</div>
              <ThemeSwitcherCompact />
            </div>
          </footer>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between bg-base-100/95 backdrop-blur-sm border-b border-base-300 px-4 lg:px-6">
          <button
            aria-label="Open navigation menu"
            className="lg:hidden btn btn-ghost btn-sm btn-circle"
            onClick={() => setMobileMenuOpen(true)}
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
            <ThemeSwitcher />

            {/* Feature Flags Dropdown - Only show on internal pages */}
            {pathname.startsWith("/internal") && (
              <div className="relative">
                <button
                  aria-label="View feature flags"
                  className="btn btn-ghost btn-sm gap-2"
                  onClick={() =>
                    setFeatureFlagDropdownOpen(!featureFlagDropdownOpen)
                  }
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
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 pb-24">{children}</main>
      </div>

      <GlobalAudioPlayer />
    </div>
  );
}
