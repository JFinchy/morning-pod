import "./globals.css";

import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

{{#if hasAnalytics}}import { PostHogProvider } from "../components/providers/PostHogProvider";{{/if}}
{{#if hasTrpc}}import { TRPCProvider } from "../lib/trpc/provider";{{/if}}

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "{{projectName}}",
  description: "Generated with @finch/create-app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="forest">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
{{#if hasAnalytics}}        <PostHogProvider>{{/if}}
{{#if hasTrpc}}          <TRPCProvider>{{/if}}
            {children}
{{#if hasTrpc}}          </TRPCProvider>{{/if}}
{{#if hasAnalytics}}        </PostHogProvider>{{/if}}
      </body>
    </html>
  );
}