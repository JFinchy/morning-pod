const { getCSP } = require("./security.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  /* other config options here */
};

module.exports = nextConfig;
