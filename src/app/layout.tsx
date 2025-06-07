import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { StagewiseToolbar } from "@stagewise/toolbar-next";

import "./globals.css";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { PostHogProvider } from "../components/providers/PostHogProvider";
import { FeatureFlagProvider } from "../lib/feature-flags/provider";
import { TRPCProvider } from "../lib/trpc/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Morning Pod - AI Podcast Generator",
  description:
    "AI-powered podcast generation from your favorite news sources. Stay informed with personalized audio content delivered daily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <StagewiseToolbar
            config={{
              plugins: [], // Add custom plugins here when needed
            }}
          />
          <FeatureFlagProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </FeatureFlagProvider>
          <PerformanceMonitor />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              className: "toast-custom",
            }}
          />
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
      </body>
    </html>
  );
}
