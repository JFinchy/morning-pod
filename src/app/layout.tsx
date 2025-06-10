import "./globals.css";

import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";

import { PerformanceMonitor } from "@/components/ui/performance-monitor";

import { PostHogProvider } from "../components/providers/PostHogProvider";
import { FeatureFlagProvider } from "../lib/feature-flags/provider";
import { TRPCProvider } from "../lib/trpc/provider";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description:
    "AI-powered podcast generation from your favorite news sources. Stay informed with personalized audio content delivered daily.",
  title: "Morning Pod - AI Podcast Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PostHogProvider>
          <FeatureFlagProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </FeatureFlagProvider>
        </PostHogProvider>
        <PerformanceMonitor />
        <Toaster
          position="top-right"
          toastOptions={{
            className: "toast-custom",
            duration: 5000,
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
