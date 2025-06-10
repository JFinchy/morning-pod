"use client";

import posthog, { type PostHog } from "posthog-js";

import { POSTHOG_CONFIG } from "./config";

// Client-side PostHog instance (singleton)
let posthogInstance: null | PostHog = null;
let isInitialized = false;

export const PostHogClient = {
  getInstance(): null | PostHog {
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
  },

  shutdown(): void {
    if (posthogInstance) {
      posthogInstance.reset();
      posthogInstance = null;
      isInitialized = false;
    }
  },
};
