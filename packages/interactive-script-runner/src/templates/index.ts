import type { ProjectTemplate, ProjectDetection } from "../types.js";

/**
 * Default project templates for different frameworks and project types
 */

/**
 * Get Next.js template based on project detection
 */
export function getNextjsTemplate(
  detection: ProjectDetection
): ProjectTemplate {
  return {
    name: "nextjs",
    type: "nextjs",
    description: "Next.js application with TypeScript, Tailwind, and testing",
    packageManager: detection.packageManager,
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
            name: "e2e",
            command: "playwright test",
            description: "Run E2E tests with Playwright",
          },
          {
            name: "all",
            command: "{pm} vitest && playwright test",
            description: "Run all tests",
          },
        ],
      },
      {
        name: "quality",
        description: "Code Quality",
        icon: "✨",
        commands: [
          {
            name: "lint",
            command: "{pm} run next lint",
            description: "Run ESLint",
          },
          {
            name: "format",
            command: "prettier --write .",
            description: "Format code with Prettier",
          },
          {
            name: "type-check",
            command: "tsc --noEmit",
            description: "Run TypeScript type checking",
          },
        ],
      },
      ...(detection.features.hasDatabase
        ? [
            {
              name: "db",
              description: "Database Commands",
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
              ],
            },
          ]
        : []),
    ],
  };
}

// Export alias for backward compatibility
export const getNextJsTemplate = getNextjsTemplate;

/**
 * Get React template based on project detection
 */
export function getReactTemplate(detection: ProjectDetection): ProjectTemplate {
  return {
    name: "react",
    type: "react",
    description: "React application with common tooling",
    packageManager: detection.packageManager,
    categories: [
      {
        name: "dev",
        description: "Development Commands",
        icon: "🚀",
        commands: [
          {
            name: "start",
            command: "{pm} start",
            description: "Start development server",
          },
          {
            name: "build",
            command: "{pm} run build",
            description: "Build for production",
          },
          {
            name: "preview",
            command: "{pm} run preview",
            description: "Preview production build",
          },
          {
            name: "clean",
            command: "rm -rf node_modules {lockfile} && {pm} install",
            description: "Clean install dependencies",
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
            command: "{pm} test",
            description: "Run unit tests",
          },
          {
            name: "coverage",
            command: "{pm} test --coverage",
            description: "Run tests with coverage",
          },
          ...(detection.features.hasTesting
            ? [
                {
                  name: "e2e",
                  command: "playwright test",
                  description: "Run E2E tests",
                },
              ]
            : []),
        ],
      },
      {
        name: "quality",
        description: "Code Quality",
        icon: "✨",
        commands: [
          ...(detection.features.hasLinting
            ? [
                {
                  name: "lint",
                  command: "{pm} run lint",
                  description: "Run ESLint",
                },
              ]
            : []),
          {
            name: "format",
            command: "prettier --write {srcDir}",
            description: "Format code with Prettier",
          },
          ...(detection.hasTypeScript
            ? [
                {
                  name: "type-check",
                  command: "tsc --noEmit",
                  description: "Run TypeScript type checking",
                },
              ]
            : []),
        ],
      },
    ],
  };
}

/**
 * Get Node.js template based on project detection
 */
export function getNodejsTemplate(
  detection: ProjectDetection
): ProjectTemplate {
  return {
    name: "nodejs",
    type: "node",
    description: "Node.js API or backend service",
    packageManager: detection.packageManager,
    categories: [
      {
        name: "dev",
        description: "Development Commands",
        icon: "🚀",
        commands: [
          {
            name: "start",
            command: "{pm} start",
            description: "Start the application",
          },
          {
            name: "dev",
            command: "{pm} run dev",
            description: "Start in development mode",
          },
          {
            name: "build",
            command: "{pm} run build",
            description: "Build the application",
          },
          {
            name: "clean",
            command: "rm -rf node_modules {lockfile} && {pm} install",
            description: "Clean install dependencies",
          },
        ],
      },
      ...(detection.features.hasDatabase
        ? [
            {
              name: "db",
              description: "Database Commands",
              icon: "🗄️",
              commands: [
                {
                  name: "migrate",
                  command: "{pm} run migrate",
                  description: "Run database migrations",
                },
                {
                  name: "seed",
                  command: "{pm} run seed",
                  description: "Seed database with test data",
                },
              ],
            },
          ]
        : []),
      {
        name: "test",
        description: "Testing Commands",
        icon: "🧪",
        commands: [
          {
            name: "test",
            command: "{pm} test",
            description: "Run tests",
          },
          ...(detection.features.hasTesting
            ? [
                {
                  name: "coverage",
                  command: "{pm} test --coverage",
                  description: "Run tests with coverage",
                },
              ]
            : []),
        ],
      },
    ],
  };
}

// Export alias for backward compatibility
export const getNodeJsTemplate = getNodejsTemplate;

/**
 * Get generic template for projects without specific framework detection
 */
export function getGenericTemplate(
  detection: ProjectDetection
): ProjectTemplate {
  return {
    name: "generic",
    type: "generic",
    description: "Generic JavaScript/TypeScript project",
    packageManager: detection.packageManager,
    categories: [
      {
        name: "dev",
        description: "Development Commands",
        icon: "🚀",
        commands: [
          {
            name: "start",
            command: "{pm} start",
            description: "Start the application",
          },
          {
            name: "build",
            command: "{pm} run build",
            description: "Build the application",
          },
          {
            name: "clean",
            command: "rm -rf node_modules {lockfile} && {pm} install",
            description: "Clean install dependencies",
          },
        ],
      },
      {
        name: "test",
        description: "Testing Commands",
        icon: "🧪",
        commands: [
          {
            name: "test",
            command: "{pm} test",
            description: "Run tests",
          },
        ],
      },
      ...(detection.features.hasLinting
        ? [
            {
              name: "quality",
              description: "Code Quality",
              icon: "✨",
              commands: [
                {
                  name: "lint",
                  command: "{pm} run lint",
                  description: "Run ESLint",
                },
                {
                  name: "format",
                  command: "prettier --write .",
                  description: "Format code with Prettier",
                },
                ...(detection.hasTypeScript
                  ? [
                      {
                        name: "type-check",
                        command: "tsc --noEmit",
                        description: "Run TypeScript type checking",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
    ],
  };
}

// Legacy exports for backward compatibility
export const nextjsTemplate = getNextjsTemplate({
  type: "nextjs",
  packageManager: "bun",
  hasTypeScript: true,
  features: {
    hasDatabase: false,
    hasLinting: true,
    hasTesting: true,
    hasStorybook: false,
    hasTailwind: true,
  },
});
export const reactTemplate = getReactTemplate({
  type: "react",
  packageManager: "npm",
  hasTypeScript: false,
  features: {
    hasDatabase: false,
    hasLinting: true,
    hasTesting: true,
    hasStorybook: false,
    hasTailwind: false,
  },
});
export const nodejsTemplate = getNodejsTemplate({
  type: "node",
  packageManager: "npm",
  hasTypeScript: false,
  features: {
    hasDatabase: true,
    hasLinting: true,
    hasTesting: true,
    hasStorybook: false,
    hasTailwind: false,
  },
});
export const genericTemplate = getGenericTemplate({
  type: "generic",
  packageManager: "npm",
  hasTypeScript: false,
  features: {
    hasDatabase: false,
    hasLinting: false,
    hasTesting: false,
    hasStorybook: false,
    hasTailwind: false,
  },
});

/**
 * All available project templates
 */
export const defaultTemplates: ProjectTemplate[] = [
  nextjsTemplate,
  reactTemplate,
  nodejsTemplate,
  genericTemplate,
];
