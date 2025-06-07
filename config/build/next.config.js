const { getCSP } = require("../tooling/security.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["posthog-node"],
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
  async headers() {
    return [
      {
        source: "/(.*)",
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
            key: "X-XSS-Protection",
            value: "1; mode=block", // Legacy XSS protection
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // Disable unnecessary APIs
          },
          {
            key: "Content-Security-Policy",
            value: getCSP(), // Environment-specific CSP rules
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
