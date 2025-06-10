import { PostHog } from "posthog-node";

export const posthogServerClient = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  }
);

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn("PostHog key not found, skipping event tracking");
    return;
  }

  posthogServerClient.capture({
    distinctId,
    event,
    properties,
  });
}
