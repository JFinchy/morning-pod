/**
 * Test fixtures for different project types and configurations
 */

export const nextjsProject = {
  files: [
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.js",
    "drizzle.config.ts",
    ".storybook/main.js",
    "bun.lockb",
  ],
  packageJson: {
    dependencies: {
      next: "^14.0.0",
      react: "^18.0.0",
      "react-dom": "^18.0.0",
    },
    devDependencies: {
      "@playwright/test": "^1.0.0",
      "@storybook/react": "^7.0.0",
      "@types/node": "^20.0.0",
      "@types/react": "^18.0.0",
      drizzle: "^1.0.0",
      eslint: "^8.0.0",
      "eslint-config-next": "^14.0.0",
      prettier: "^3.0.0",
      tailwindcss: "^3.0.0",
      typescript: "^5.0.0",
      vitest: "^1.0.0",
    },
    name: "test-nextjs-app",
    scripts: {
      build: "next build",
      dev: "next dev --turbo",
      lint: "next lint",
      start: "next start",
    },
    version: "1.0.0",
  },
};

export const reactProject = {
  files: [
    "vite.config.ts",
    "tsconfig.json",
    "vitest.config.ts",
    ".storybook/main.ts",
    "yarn.lock",
  ],
  packageJson: {
    dependencies: {
      react: "^18.0.0",
      "react-dom": "^18.0.0",
      "react-router-dom": "^6.0.0",
    },
    devDependencies: {
      "@storybook/react-vite": "^7.0.0",
      "@testing-library/react": "^14.0.0",
      "@types/react": "^18.0.0",
      "@types/react-dom": "^18.0.0",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      "@vitejs/plugin-react": "^4.0.0",
      eslint: "^8.0.0",
      prettier: "^3.0.0",
      typescript: "^5.0.0",
      vite: "^5.0.0",
      vitest: "^1.0.0",
    },
    name: "test-react-app",
    scripts: {
      build: "vite build",
      dev: "vite",
      format: "prettier --write src/**/*.{ts,tsx}",
      lint: "eslint src --ext ts,tsx",
      preview: "vite preview",
      test: "vitest",
      "test:ui": "vitest --ui",
    },
    version: "1.0.0",
  },
};

export const nodeProject = {
  files: ["tsconfig.json", "jest.config.js", "package-lock.json"],
  packageJson: {
    dependencies: {
      cors: "^2.8.5",
      express: "^4.18.0",
      helmet: "^7.0.0",
    },
    devDependencies: {
      "@types/cors": "^2.8.0",
      "@types/express": "^4.17.0",
      "@types/jest": "^29.0.0",
      "@types/node": "^20.0.0",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      eslint: "^8.0.0",
      jest: "^29.0.0",
      nodemon: "^3.0.0",
      prettier: "^3.0.0",
      "ts-jest": "^29.0.0",
      "ts-node": "^10.9.0",
      typescript: "^5.0.0",
    },
    main: "dist/index.js",
    name: "test-node-app",
    scripts: {
      build: "tsc",
      dev: "node --watch src/index.ts",
      format: "prettier --write src/**/*.ts",
      lint: "eslint src --ext .ts",
      start: "node dist/index.js",
      test: "jest",
      "test:coverage": "jest --coverage",
      "test:watch": "jest --watch",
    },
    version: "1.0.0",
  },
};

export const genericProject = {
  files: ["package.json", "README.md"],
  packageJson: {
    dependencies: {},
    devDependencies: {},
    name: "test-generic-project",
    scripts: {
      build: 'echo "Building..."',
      start: 'echo "Hello World"',
      test: 'echo "Testing..."',
    },
    version: "1.0.0",
  },
};

export const monorepoProject = {
  files: [
    "turbo.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    ".changeset/config.json",
    "packages/ui/package.json",
    "apps/web/package.json",
  ],
  packageJson: {
    dependencies: {},
    devDependencies: {
      "@changesets/cli": "^2.26.0",
      eslint: "^8.0.0",
      prettier: "^3.0.0",
      turbo: "^1.0.0",
      typescript: "^5.0.0",
    },
    name: "test-monorepo",
    private: true,
    scripts: {
      build: "turbo run build",
      "changeset:publish": "changeset publish",
      "changeset:version": "changeset version",
      dev: "turbo run dev",
      format: 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"',
      lint: "turbo run lint",
      test: "turbo run test",
    },
    version: "1.0.0",
    workspaces: ["packages/*", "apps/*"],
  },
};

export const customConfigProject = {
  configFile: {
    categories: {
      deploy: {
        commands: {
          production: {
            args: [
              {
                description: "Version to deploy",
                name: "version",
                required: true,
              },
            ],
            command: "npm run deploy:prod",
            description: "Deploy application to production",
            env: {
              API_URL: "https://api.example.com",
              NODE_ENV: "production",
            },
            name: "Deploy to production",
          },
          staging: {
            command: "npm run deploy:staging",
            description: "Deploy application to staging environment",
            env: {
              API_URL: "https://api-staging.example.com",
              NODE_ENV: "staging",
            },
            name: "Deploy to staging",
          },
        },
        description: "Deployment commands",
        name: "🚀 Deploy",
      },
      docker: {
        commands: {
          build: {
            args: [
              {
                default: "my-app",
                description: "Docker image name",
                name: "imageName",
                required: true,
              },
            ],
            command: "docker build -t {{imageName}} .",
            description: "Build Docker image",
            name: "Build Docker image",
          },
          run: {
            args: [
              {
                default: "3000",
                description: "Port to bind",
                name: "port",
                required: false,
              },
              {
                default: "my-app",
                description: "Docker image name",
                name: "imageName",
                required: true,
              },
            ],
            command: "docker run -p {{port}}:3000 {{imageName}}",
            description: "Run Docker container",
            name: "Run Docker container",
          },
        },
        description: "Docker commands",
        name: "🐳 Docker",
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
  packageJson: {
    dependencies: {},
    devDependencies: {},
    name: "test-custom-config",
    scripts: {
      start: "node index.js",
    },
    version: "1.0.0",
  },
};

export const packageManagers = {
  bun: {
    commands: {
      dev: "bun run dev",
      install: "bun install",
      run: "bun run",
      test: "bun test",
    },
    files: ["bun.lockb"],
  },
  npm: {
    commands: {
      dev: "npm run dev",
      install: "npm install",
      run: "npm run",
      test: "npm test",
    },
    files: ["package-lock.json"],
  },
  pnpm: {
    commands: {
      dev: "pnpm dev",
      install: "pnpm install",
      run: "pnpm",
      test: "pnpm test",
    },
    files: ["pnpm-lock.yaml"],
  },
  yarn: {
    commands: {
      dev: "yarn dev",
      install: "yarn install",
      run: "yarn",
      test: "yarn test",
    },
    files: ["yarn.lock"],
  },
};

export const configFiles = {
  esm: {
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
    filename: "script-runner.config.mjs",
  },
  javascript: {
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
    filename: "script-runner.config.js",
  },
  json: {
    content: JSON.stringify(
      {
        categories: {
          custom: {
            commands: {
              hello: {
                command: 'echo "Hello from JSON config"',
                description: "Print hello message",
                name: "Say hello",
              },
            },
            description: "Custom commands",
            name: "⚙️ Custom",
          },
        },
      },
      null,
      2
    ),
    filename: ".scriptrunnerrc.json",
  },
  yaml: {
    content: `categories:
  custom:
    name: ⚙️ Custom
    description: Custom commands
    commands:
      hello:
        name: Say hello
        command: echo "Hello from YAML config"
        description: Print hello message`,
    filename: ".scriptrunnerrc.yml",
  },
};

export const errorScenarios = {
  brokenConfigFile: {
    configFile: "module.exports = { invalid: javascript",
    files: ["script-runner.config.js", "package.json"],
    packageJson: {
      name: "test-broken-config",
      version: "1.0.0",
    },
  },
  emptyProject: {
    files: [],
  },
  invalidPackageJson: {
    files: ["package.json"],
    packageJson: "{ invalid json",
  },
  missingPackageJson: {
    files: ["README.md"],
  },
};
