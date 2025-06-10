/**
 * Test fixtures for different project types and configurations
 */

export const nextjsProject = {
  packageJson: {
    name: "test-nextjs-app",
    version: "1.0.0",
    scripts: {
      dev: "next dev --turbo",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "^14.0.0",
      react: "^18.0.0",
      "react-dom": "^18.0.0",
    },
    devDependencies: {
      typescript: "^5.0.0",
      "@types/node": "^20.0.0",
      "@types/react": "^18.0.0",
      vitest: "^1.0.0",
      "@playwright/test": "^1.0.0",
      eslint: "^8.0.0",
      "eslint-config-next": "^14.0.0",
      prettier: "^3.0.0",
      tailwindcss: "^3.0.0",
      "@storybook/react": "^7.0.0",
      drizzle: "^1.0.0",
    },
  },
  files: [
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.js",
    "drizzle.config.ts",
    ".storybook/main.js",
    "bun.lockb",
  ],
};

export const reactProject = {
  packageJson: {
    name: "test-react-app",
    version: "1.0.0",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      test: "vitest",
      "test:ui": "vitest --ui",
      lint: "eslint src --ext ts,tsx",
      format: "prettier --write src/**/*.{ts,tsx}",
    },
    dependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      "react-router-dom": "^6.0.0",
    },
    devDependencies: {
      vite: "^5.0.0",
      "@vitejs/plugin-react": "^4.0.0",
      typescript: "^5.0.0",
      "@types/react": "^18.0.0",
      "@types/react-dom": "^18.0.0",
      vitest: "^1.0.0",
      "@testing-library/react": "^14.0.0",
      eslint: "^8.0.0",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      prettier: "^3.0.0",
      "@storybook/react-vite": "^7.0.0",
    },
  },
  files: [
    "vite.config.ts",
    "tsconfig.json",
    "vitest.config.ts",
    ".storybook/main.ts",
    "yarn.lock",
  ],
};

export const nodeProject = {
  packageJson: {
    name: "test-node-app",
    version: "1.0.0",
    main: "dist/index.js",
    scripts: {
      start: "node dist/index.js",
      dev: "node --watch src/index.ts",
      build: "tsc",
      test: "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      lint: "eslint src --ext .ts",
      format: "prettier --write src/**/*.ts",
    },
    dependencies: {
      express: "^4.18.0",
      cors: "^2.8.5",
      helmet: "^7.0.0",
    },
    devDependencies: {
      "@types/node": "^20.0.0",
      "@types/express": "^4.17.0",
      "@types/cors": "^2.8.0",
      typescript: "^5.0.0",
      "ts-node": "^10.9.0",
      jest: "^29.0.0",
      "@types/jest": "^29.0.0",
      "ts-jest": "^29.0.0",
      eslint: "^8.0.0",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      prettier: "^3.0.0",
      nodemon: "^3.0.0",
    },
  },
  files: ["tsconfig.json", "jest.config.js", "package-lock.json"],
};

export const genericProject = {
  packageJson: {
    name: "test-generic-project",
    version: "1.0.0",
    scripts: {
      start: 'echo "Hello World"',
      build: 'echo "Building..."',
      test: 'echo "Testing..."',
    },
    dependencies: {},
    devDependencies: {},
  },
  files: ["package.json", "README.md"],
};

export const monorepoProject = {
  packageJson: {
    name: "test-monorepo",
    version: "1.0.0",
    private: true,
    workspaces: ["packages/*", "apps/*"],
    scripts: {
      dev: "turbo run dev",
      build: "turbo run build",
      test: "turbo run test",
      lint: "turbo run lint",
      format: 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"',
      "changeset:version": "changeset version",
      "changeset:publish": "changeset publish",
    },
    dependencies: {},
    devDependencies: {
      turbo: "^1.0.0",
      "@changesets/cli": "^2.26.0",
      prettier: "^3.0.0",
      eslint: "^8.0.0",
      typescript: "^5.0.0",
    },
  },
  files: [
    "turbo.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    ".changeset/config.json",
    "packages/ui/package.json",
    "apps/web/package.json",
  ],
};

export const customConfigProject = {
  packageJson: {
    name: "test-custom-config",
    version: "1.0.0",
    scripts: {
      start: "node index.js",
    },
    dependencies: {},
    devDependencies: {},
  },
  configFile: {
    categories: {
      deploy: {
        name: "🚀 Deploy",
        description: "Deployment commands",
        commands: {
          staging: {
            name: "Deploy to staging",
            command: "npm run deploy:staging",
            description: "Deploy application to staging environment",
            env: {
              NODE_ENV: "staging",
              API_URL: "https://api-staging.example.com",
            },
          },
          production: {
            name: "Deploy to production",
            command: "npm run deploy:prod",
            description: "Deploy application to production",
            args: [
              {
                name: "version",
                description: "Version to deploy",
                required: true,
              },
            ],
            env: {
              NODE_ENV: "production",
              API_URL: "https://api.example.com",
            },
          },
        },
      },
      docker: {
        name: "🐳 Docker",
        description: "Docker commands",
        commands: {
          build: {
            name: "Build Docker image",
            command: "docker build -t {{imageName}} .",
            description: "Build Docker image",
            args: [
              {
                name: "imageName",
                description: "Docker image name",
                required: true,
                default: "my-app",
              },
            ],
          },
          run: {
            name: "Run Docker container",
            command: "docker run -p {{port}}:3000 {{imageName}}",
            description: "Run Docker container",
            args: [
              {
                name: "port",
                description: "Port to bind",
                required: false,
                default: "3000",
              },
              {
                name: "imageName",
                description: "Docker image name",
                required: true,
                default: "my-app",
              },
            ],
          },
        },
      },
    },
    env: {
      DEBUG: "true",
      LOG_LEVEL: "info",
    },
  },
  files: [
    "script-runner.config.js",
    "Dockerfile",
    "docker-compose.yml",
    "package.json",
  ],
};

export const packageManagers = {
  bun: {
    files: ["bun.lockb"],
    commands: {
      install: "bun install",
      run: "bun run",
      test: "bun test",
      dev: "bun run dev",
    },
  },
  npm: {
    files: ["package-lock.json"],
    commands: {
      install: "npm install",
      run: "npm run",
      test: "npm test",
      dev: "npm run dev",
    },
  },
  yarn: {
    files: ["yarn.lock"],
    commands: {
      install: "yarn install",
      run: "yarn",
      test: "yarn test",
      dev: "yarn dev",
    },
  },
  pnpm: {
    files: ["pnpm-lock.yaml"],
    commands: {
      install: "pnpm install",
      run: "pnpm",
      test: "pnpm test",
      dev: "pnpm dev",
    },
  },
};

export const configFiles = {
  javascript: {
    filename: "script-runner.config.js",
    content: `module.exports = {
  categories: {
    custom: {
      name: '⚙️ Custom',
      description: 'Custom commands',
      commands: {
        hello: {
          name: 'Say hello',
          command: 'echo "Hello from JS config"',
          description: 'Print hello message',
        },
      },
    },
  },
};`,
  },
  esm: {
    filename: "script-runner.config.mjs",
    content: `export default {
  categories: {
    custom: {
      name: '⚙️ Custom',
      description: 'Custom commands',
      commands: {
        hello: {
          name: 'Say hello',
          command: 'echo "Hello from ESM config"',
          description: 'Print hello message',
        },
      },
    },
  },
};`,
  },
  json: {
    filename: ".scriptrunnerrc.json",
    content: JSON.stringify(
      {
        categories: {
          custom: {
            name: "⚙️ Custom",
            description: "Custom commands",
            commands: {
              hello: {
                name: "Say hello",
                command: 'echo "Hello from JSON config"',
                description: "Print hello message",
              },
            },
          },
        },
      },
      null,
      2
    ),
  },
  yaml: {
    filename: ".scriptrunnerrc.yml",
    content: `categories:
  custom:
    name: ⚙️ Custom
    description: Custom commands
    commands:
      hello:
        name: Say hello
        command: echo "Hello from YAML config"
        description: Print hello message`,
  },
};

export const errorScenarios = {
  invalidPackageJson: {
    packageJson: "{ invalid json",
    files: ["package.json"],
  },
  missingPackageJson: {
    files: ["README.md"],
  },
  brokenConfigFile: {
    packageJson: {
      name: "test-broken-config",
      version: "1.0.0",
    },
    configFile: "module.exports = { invalid: javascript",
    files: ["script-runner.config.js", "package.json"],
  },
  emptyProject: {
    files: [],
  },
};
