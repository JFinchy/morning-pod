import { type TemplateFile } from "../utils/template-processor";

/**
 * Registry of all template files and their conditions
 */
export const templateFiles: TemplateFile[] = [
  // Root configuration files
  {
    source: "base/package.json.template",
    target: "package.json",
    template: true,
  },
  {
    source: "base/next.config.mjs",
    target: "next.config.mjs",
    template: true,
  },
  {
    source: "base/tailwind.config.ts",
    target: "tailwind.config.ts",
    template: true,
  },
  {
    source: "base/tsconfig.json",
    target: "tsconfig.json",
    template: false,
  },
  {
    source: "base/postcss.config.mjs",
    target: "postcss.config.mjs",
    template: false,
  },
  {
    source: "base/.gitignore",
    target: ".gitignore",
    template: false,
  },
  {
    source: "base/README.md",
    target: "README.md",
    template: true,
  },

  // App structure
  {
    source: "base/src/app/layout.tsx",
    target: "src/app/layout.tsx",
    template: true,
  },
  {
    source: "base/src/app/page.tsx",
    target: "src/app/page.tsx",
    template: true,
  },
  {
    source: "base/src/app/globals.css",
    target: "src/app/globals.css",
    template: false,
  },
  {
    source: "base/src/app/not-found.tsx",
    target: "src/app/not-found.tsx",
    template: true,
  },

  // UI Components (always included)
  {
    source: "base/src/components/ui/button.tsx",
    target: "src/components/ui/button.tsx",
    template: false,
  },
  {
    source: "base/src/components/ui/index.ts",
    target: "src/components/ui/index.ts",
    template: false,
  },

  // Layout components
  {
    source: "base/src/components/layouts/main-layout.tsx",
    target: "src/components/layouts/main-layout.tsx",
    template: true,
  },
  {
    source: "base/src/components/layouts/index.ts",
    target: "src/components/layouts/index.ts",
    template: false,
  },

  // Utilities
  {
    source: "base/src/lib/utils.ts",
    target: "src/lib/utils.ts",
    template: false,
  },

  // Documentation
  {
    source: "base/TASKS.md",
    target: "TASKS.md",
    template: true,
  },
  {
    source: "base/AI-RULES.md",
    target: "AI-RULES.md",
    template: true,
  },

  // ESLint and Prettier (always included)
  {
    source: "base/config/tooling/eslint.config.mjs",
    target: "config/tooling/eslint.config.mjs",
    template: false,
  },
  {
    source: "base/prettier.config.mjs",
    target: "prettier.config.mjs",
    template: false,
  },

  // Database files (conditional)
  {
    source: "features/database/src/lib/db/index.ts",
    target: "src/lib/db/index.ts",
    condition: { database: true },
    template: false,
  },
  {
    source: "features/database/src/lib/db/schema.ts",
    target: "src/lib/db/schema.ts",
    condition: { database: true },
    template: true,
  },
  {
    source: "features/database/drizzle.config.ts",
    target: "drizzle.config.ts",
    condition: { database: true },
    template: false,
  },

  // tRPC files (conditional)
  {
    source: "features/trpc/src/lib/trpc/client.ts",
    target: "src/lib/trpc/client.ts",
    condition: { trpc: true },
    template: false,
  },
  {
    source: "features/trpc/src/lib/trpc/provider.tsx",
    target: "src/lib/trpc/provider.tsx",
    condition: { trpc: true },
    template: false,
  },
  {
    source: "features/trpc/src/lib/trpc/server.ts",
    target: "src/lib/trpc/server.ts",
    condition: { trpc: true },
    template: false,
  },
  {
    source: "features/trpc/src/lib/trpc/root.ts",
    target: "src/lib/trpc/root.ts",
    condition: { trpc: true },
    template: true,
  },
  {
    source: "features/trpc/src/lib/trpc/routers/example.ts",
    target: "src/lib/trpc/routers/example.ts",
    condition: { trpc: true },
    template: false,
  },
  {
    source: "features/trpc/src/lib/trpc/routers/users.ts",
    target: "src/lib/trpc/routers/users.ts",
    condition: { trpc: true, database: true },
    template: false,
  },
  {
    source: "features/trpc/src/app/api/trpc/[trpc]/route.ts",
    target: "src/app/api/trpc/[trpc]/route.ts",
    condition: { trpc: true },
    template: false,
  },

  // Authentication files (conditional)
  {
    source: "features/auth/src/lib/auth/config.ts",
    target: "src/lib/auth/config.ts",
    condition: { auth: true },
    template: true,
  },
  {
    source: "features/auth/src/lib/auth/client.ts",
    target: "src/lib/auth/client.ts",
    condition: { auth: true },
    template: false,
  },
  {
    source: "features/auth/src/app/api/auth/[...all]/route.ts",
    target: "src/app/api/auth/[...all]/route.ts",
    condition: { auth: true },
    template: false,
  },

  // Analytics files (conditional)
  {
    source: "features/analytics/src/components/providers/PostHogProvider.tsx",
    target: "src/components/providers/PostHogProvider.tsx",
    condition: { analytics: true },
    template: false,
  },
  {
    source: "features/analytics/src/lib/posthog.ts",
    target: "src/lib/posthog.ts",
    condition: { analytics: true },
    template: false,
  },

  // Testing files (conditional)
  {
    source: "features/testing/vitest.config.ts",
    target: "vitest.config.ts",
    condition: { testing: true },
    template: false,
  },
  {
    source: "features/testing/playwright.config.ts",
    target: "playwright.config.ts",
    condition: { testing: true },
    template: false,
  },
  {
    source: "features/testing/src/tests/setup.ts",
    target: "src/tests/setup.ts",
    condition: { testing: true },
    template: false,
  },
  {
    source: "features/testing/src/tests/example.test.tsx",
    target: "src/tests/example.test.tsx",
    condition: { testing: true },
    template: true,
  },
  {
    source: "features/testing/src/tests/e2e/homepage.spec.ts",
    target: "src/tests/e2e/homepage.spec.ts",
    condition: { testing: true },
    template: true,
  },

  // Advanced deployment files (conditional)
  {
    source: "features/advanced/config/tooling/security.config.mjs",
    target: "config/tooling/security.config.mjs",
    condition: { advanced: true },
    template: true,
  },
];
