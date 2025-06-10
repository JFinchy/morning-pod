/**
 * Example Interactive Script Runner Configuration
 *
 * Place this file in your project root as:
 * - script-runner.config.js
 * - script-runner.config.mjs
 * - .scriptrunner.json
 * - .scriptrunnerrc.json
 */

export default {
  // Project metadata
  projectName: "My Awesome Project",
  projectType: "nextjs", // nextjs, react, node, generic
  packageManager: "bun", // npm, yarn, pnpm, bun

  // Global environment variables for all commands
  globalEnv: {
    NODE_ENV: "development",
    DEBUG: "app:*",
  },

  // Organized command categories
  categories: [
    {
      name: "dev",
      description: "Development Commands",
      icon: "🚀",
      commands: [
        {
          name: "start",
          command: "{pm} run next dev --turbo",
          description: "Start development server with Turbopack",
          // Command-specific environment variables
          env: {
            NODE_ENV: "development",
          },
        },
        {
          name: "build",
          command: "{pm} run next build",
          description: "Build for production",
        },
        {
          name: "preview",
          command: "{pm} run next start",
          description: "Start production server",
        },
        {
          name: "clean",
          command: "rm -rf node_modules {lockfile} && {pm} install",
          description: "Clean install dependencies",
        },
        {
          name: "reset",
          command: "rm -rf {buildDir} && {pm} run build",
          description: "Clean build cache and rebuild",
        },
      ],
    },
    {
      name: "test",
      description: "Testing Commands",
      icon: "🧪",
      commands: [
        {
          name: "unit",
          command: "{pm} vitest",
          description: "Run unit tests with Vitest",
        },
        {
          name: "unit:watch",
          command: "{pm} vitest --watch",
          description: "Run unit tests in watch mode",
        },
        {
          name: "unit:coverage",
          command: "{pm} vitest --coverage",
          description: "Run unit tests with coverage",
        },
        {
          name: "e2e",
          command: "playwright test",
          description: "Run E2E tests with Playwright",
        },
        {
          name: "e2e:ui",
          command: "playwright test --ui",
          description: "Run E2E tests with UI mode",
        },
        {
          name: "e2e:debug",
          command: "playwright test --debug",
          description: "Run E2E tests in debug mode",
        },
        {
          name: "all",
          command: "{pm} vitest && playwright test",
          description: "Run all tests (unit + E2E)",
        },
      ],
    },
    {
      name: "quality",
      description: "Code Quality & Linting",
      icon: "✨",
      commands: [
        {
          name: "lint",
          command: "{pm} run next lint",
          description: "Run ESLint with Next.js config",
        },
        {
          name: "lint:fix",
          command: "{pm} run next lint --fix",
          description: "Run ESLint and auto-fix issues",
        },
        {
          name: "format",
          command: "prettier --write {srcDir}",
          description: "Format code with Prettier",
        },
        {
          name: "format:check",
          command: "prettier --check {srcDir}",
          description: "Check code formatting",
        },
        {
          name: "type-check",
          command: "tsc --noEmit",
          description: "Run TypeScript type checking",
        },
        {
          name: "all",
          command:
            "{pm} run next lint && prettier --check {srcDir} && tsc --noEmit",
          description: "Run all quality checks",
        },
      ],
    },
    {
      name: "db",
      description: "Database Operations",
      icon: "🗄️",
      commands: [
        {
          name: "generate",
          command: "{pm} run drizzle-kit generate",
          description: "Generate database migrations",
        },
        {
          name: "migrate",
          command: "{pm} run drizzle-kit push",
          description: "Apply database migrations",
        },
        {
          name: "studio",
          command: "{pm} run drizzle-kit studio",
          description: "Open database studio",
        },
        {
          name: "seed",
          command: "{pm} run db:seed",
          description: "Seed database with test data",
        },
        {
          name: "reset",
          command: "{pm} run db:reset && {pm} run db:seed",
          description: "Reset database and reseed",
        },
      ],
    },
    {
      name: "deps",
      description: "Dependency Management",
      icon: "📦",
      commands: [
        {
          name: "install",
          command: "{pm} install",
          description: "Install dependencies",
        },
        {
          name: "update",
          command: "{pm} update",
          description: "Update dependencies",
        },
        {
          name: "audit",
          command: "{pm} audit",
          description: "Audit dependencies for vulnerabilities",
        },
        {
          name: "outdated",
          command: "{pm} outdated",
          description: "Check for outdated packages",
        },
        {
          name: "clean",
          command: "rm -rf node_modules {lockfile}",
          description: "Remove node_modules and lock file",
        },
      ],
    },
    {
      name: "release",
      description: "Release Management",
      icon: "🚢",
      commands: [
        {
          name: "changeset",
          command: "{pm} changeset",
          description: "Create a changeset",
        },
        {
          name: "version",
          command: "{pm} changeset version",
          description: "Version packages",
        },
        {
          name: "publish",
          command: "{pm} changeset publish",
          description: "Publish packages",
        },
        {
          name: "preview",
          command: "{pm} changeset status",
          description: "Preview release changes",
        },
      ],
    },
    {
      name: "docker",
      description: "Docker Operations",
      icon: "🐳",
      commands: [
        {
          name: "build",
          command: "docker build -t my-app .",
          description: "Build Docker image",
        },
        {
          name: "run",
          command: "docker run -p 3000:3000 my-app",
          description: "Run Docker container",
        },
        {
          name: "compose:up",
          command: "docker-compose up -d",
          description: "Start services with Docker Compose",
        },
        {
          name: "compose:down",
          command: "docker-compose down",
          description: "Stop services",
        },
        {
          name: "logs",
          command: "docker-compose logs -f",
          description: "Follow service logs",
        },
      ],
    },
  ],
};
