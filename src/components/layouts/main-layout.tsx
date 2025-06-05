"use client";

import { Menu, X, Home, Mic, Settings, List, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ThemeSwitcher } from "@/components/ui";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Episodes", href: "/episodes", icon: Mic },
    { name: "Queue", href: "/queue", icon: List },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation Header */}
      <header className="navbar bg-base-100 shadow-sm border-b border-base-300">
        <div className="navbar-start">
          {/* Mobile menu button */}
          <div className="dropdown lg:hidden">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="btn btn-ghost text-xl font-bold">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-content fill-current" />
              </div>
              <span className="hidden sm:inline">Morning Pod</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-circle tooltip tooltip-left"
              data-tip="Generate Episode"
            >
              <Mic className="w-5 h-5" />
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 bg-base-100 shadow-lg z-50 lg:hidden">
            <ul className="menu menu-lg p-4">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="footer footer-center bg-base-200 text-base-content p-6 mt-12">
        <div className="grid grid-flow-col gap-4">
          <Link href="/about" className="link link-hover">
            About
          </Link>
          <Link href="/privacy" className="link link-hover">
            Privacy
          </Link>
          <Link href="/terms" className="link link-hover">
            Terms
          </Link>
          <Link href="/contact" className="link link-hover">
            Contact
          </Link>
        </div>
        <div>
          <p className="font-medium">Morning Pod</p>
          <p className="text-sm opacity-70">
            AI-powered podcast generation from your favorite news sources
          </p>
        </div>
        <div className="text-xs opacity-60">
          <p>© 2024 Morning Pod. Made with ❤️ and AI.</p>
        </div>
      </footer>
    </div>
  );
}
