import { PostHog } from "posthog-node";

export default function PostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    flushAt: 1,
    flushInterval: 0,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}
