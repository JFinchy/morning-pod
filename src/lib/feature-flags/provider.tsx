"use client";

import { PostHogProvider } from "posthog-js/react";
import { type ReactNode } from "react";

import { PostHogClient } from "./posthog-client";

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const client = PostHogClient.getInstance();

  if (!client) {
    // If PostHog is not configured, just return children without provider
    return <>{children}</>;
  }

  return <PostHogProvider client={client}>{children}</PostHogProvider>;
}

// Utility to identify users for feature flag targeting
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  const client = PostHogClient.getInstance();
  if (client) {
    client.identify(userId, properties);
  }
}

// Utility to reset user identification
export function resetUser() {
  const client = PostHogClient.getInstance();
  if (client) {
    client.reset();
  }
}
