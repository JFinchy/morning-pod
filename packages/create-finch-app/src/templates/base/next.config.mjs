{{#if hasAdvanced}}import { getCSP } from "./config/tooling/security.config.mjs";{{/if}}

/**
 * Next.js configuration
 * @type {import('next').NextConfig}
 */
const nextConfig = {
{{#if hasAdvanced}}  async headers() {
    return [
      {
        headers: [
          // Security headers for protection against common attacks
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevents clickjacking attacks
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevents MIME type confusion attacks
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Controls referrer information
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), autoplay=(self), encrypted-media=(self), fullscreen=(self), picture-in-picture=(self)", // Disable mic/camera, allow audio playback
          },
          {
            key: "Content-Security-Policy",
            value: getCSP(), // Environment-specific CSP rules
          },
        ],
        source: "/(.*)",
      },
    ];
  },{{/if}}
{{#if hasAnalytics}}  async rewrites() {
    return [
      {
        destination: "https://us-assets.i.posthog.com/static/:path*",
        source: "/ingest/static/:path*",
      },
      {
        destination: "https://us.i.posthog.com/:path*",
        source: "/ingest/:path*",
      },
      {
        destination: "https://us.i.posthog.com/decide",
        source: "/ingest/decide",
      },
    ];
  },
  serverExternalPackages: ["posthog-node"],
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,{{/if}}
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;