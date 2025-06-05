"use client";

import posthog, { type PostHog } from "posthog-js";

import { POSTHOG_CONFIG } from "./config";

// Client-side PostHog instance (singleton)
let posthogInstance: PostHog | null = null;
let isInitialized = false;

export class PostHogClient {
  static getInstance(): PostHog | null {
    // Only initialize if we haven't already and PostHog is enabled
    if (
      !isInitialized &&
      POSTHOG_CONFIG.enabled &&
      POSTHOG_CONFIG.projectApiKey
    ) {
      if (typeof window !== "undefined") {
        posthog.init(POSTHOG_CONFIG.projectApiKey, POSTHOG_CONFIG.options);
        posthogInstance = posthog;
        isInitialized = true;
      }
    }

    return posthogInstance;
  }

  static shutdown(): void {
    if (posthogInstance) {
      posthogInstance.reset();
      posthogInstance = null;
      isInitialized = false;
    }
  }
}
