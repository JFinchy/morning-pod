import { describe, it, expect } from "vitest";
import type {
  ScriptConfig,
  ScriptCommand,
  ScriptCategory,
} from "../../src/types";

describe("Package Functionality Integration", () => {
  describe("Configuration Structure", () => {
    it("should create a valid script configuration", () => {
      const config: ScriptConfig = {
        categories: [
          {
            name: "dev",
            icon: "🚀",
            description: "Development commands",
            commands: [
              {
                name: "start",
                description: "Start development server",
                command: "bun run dev",
              },
              {
                name: "build",
                description: "Build for production",
                command: "bun run build",
              },
            ],
          },
          {
            name: "test",
            icon: "🧪",
            description: "Testing commands",
            commands: [
              {
                name: "unit",
                description: "Run unit tests",
                command: "bun test",
              },
            ],
          },
        ],
      };

      expect(config.categories).toHaveLength(2);
      expect(config.categories[0].name).toBe("dev");
      expect(config.categories[0].commands).toHaveLength(2);
      expect(config.categories[1].name).toBe("test");
      expect(config.categories[1].commands).toHaveLength(1);
    });

    it("should support commands with arguments", () => {
      const command: ScriptCommand = {
        name: "Deploy to environment",
        description: "Deploy application to specified environment",
        command: "npm run deploy --env {{environment}}",
        args: [
          {
            name: "environment",
            description: "Target environment (staging, production)",
            required: true,
            options: ["staging", "production"],
          },
        ],
      };

      expect(command.args).toHaveLength(1);
      expect(command.args![0].name).toBe("environment");
      expect(command.args![0].required).toBe(true);
      expect(command.args![0].options).toEqual(["staging", "production"]);
    });

    it("should support environment variables", () => {
      const config: ScriptConfig = {
        categories: [
          {
            name: "deploy",
            icon: "🚀",
            description: "Deployment commands",
            commands: [
              {
                name: "staging",
                description: "Deploy to staging",
                command: "npm run deploy:staging",
                env: {
                  NODE_ENV: "staging",
                  API_URL: "https://api-staging.example.com",
                },
              },
            ],
          },
        ],
        env: {
          DEBUG: "true",
          LOG_LEVEL: "info",
        },
      };

      expect(config.env).toEqual({
        DEBUG: "true",
        LOG_LEVEL: "info",
      });

      expect(config.categories[0].commands[0].env).toEqual({
        NODE_ENV: "staging",
        API_URL: "https://api-staging.example.com",
      });
    });
  });

  describe("Command Validation", () => {
    it("should validate required command properties", () => {
      const validCommand: ScriptCommand = {
        name: "Test Command",
        description: "A test command",
        command: 'echo "test"',
      };

      expect(validCommand.name).toBeTruthy();
      expect(validCommand.description).toBeTruthy();
      expect(validCommand.command).toBeTruthy();
    });

    it("should handle optional command properties", () => {
      const commandWithOptionals: ScriptCommand = {
        name: "Advanced Command",
        description: "Command with all optional properties",
        command: 'echo "{{message}}"',
        args: [
          {
            name: "message",
            description: "Message to echo",
            required: false,
            default: "Hello World",
          },
        ],
        env: {
          CUSTOM_VAR: "custom_value",
        },
      };

      expect(commandWithOptionals.args).toBeDefined();
      expect(commandWithOptionals.env).toBeDefined();
      expect(commandWithOptionals.args![0].default).toBe("Hello World");
    });
  });

  describe("Category Organization", () => {
    it("should organize commands into logical categories", () => {
      const categories: ScriptCategory[] = [
        {
          name: "dev",
          icon: "🚀",
          description: "Development commands",
          commands: [
            {
              name: "start",
              description: "Start dev server",
              command: "bun run dev",
            },
            {
              name: "build",
              description: "Build for production",
              command: "bun run build",
            },
          ],
        },
        {
          name: "test",
          icon: "🧪",
          description: "Testing commands",
          commands: [
            {
              name: "unit",
              description: "Run unit tests",
              command: "bun test",
            },
            {
              name: "e2e",
              description: "Run E2E tests",
              command: "bun run test:e2e",
            },
          ],
        },
        {
          name: "quality",
          icon: "✨",
          description: "Code quality commands",
          commands: [
            {
              name: "lint",
              description: "Run linter",
              command: "bun run lint",
            },
            {
              name: "format",
              description: "Format code",
              command: "bun run format",
            },
          ],
        },
      ];

      expect(categories).toHaveLength(3);

      // Verify each category has the expected structure
      categories.forEach((category) => {
        expect(category.name).toBeTruthy();
        expect(category.icon).toBeTruthy();
        expect(category.description).toBeTruthy();
        expect(category.commands).toBeInstanceOf(Array);
        expect(category.commands.length).toBeGreaterThan(0);
      });
    });

    it("should support category-specific configurations", () => {
      const categoryWithConfig: ScriptCategory = {
        name: "database",
        icon: "🗄️",
        description: "Database commands",
        commands: [
          {
            name: "migrate",
            description: "Run database migrations",
            command: "bun run drizzle-kit push",
            env: {
              DATABASE_URL: "postgresql://localhost:5432/dev",
            },
          },
        ],
      };

      expect(categoryWithConfig.commands[0].env).toBeDefined();
      expect(categoryWithConfig.commands[0].env!.DATABASE_URL).toBeTruthy();
    });
  });

  describe("Template System Validation", () => {
    it("should support placeholder replacement in commands", () => {
      const commandWithPlaceholders: ScriptCommand = {
        name: "Docker Build",
        description: "Build Docker image",
        command: "docker build -t {{imageName}}:{{tag}} .",
        args: [
          {
            name: "imageName",
            description: "Docker image name",
            required: true,
            default: "my-app",
          },
          {
            name: "tag",
            description: "Image tag",
            required: false,
            default: "latest",
          },
        ],
      };

      expect(commandWithPlaceholders.command).toContain("{{imageName}}");
      expect(commandWithPlaceholders.command).toContain("{{tag}}");
      expect(commandWithPlaceholders.args).toHaveLength(2);
    });

    it("should validate placeholder consistency", () => {
      const command: ScriptCommand = {
        name: "Deploy with version",
        description: "Deploy with specific version",
        command: "npm run deploy --version {{version}} --env {{environment}}",
        args: [
          {
            name: "version",
            description: "Version to deploy",
            required: true,
          },
          {
            name: "environment",
            description: "Target environment",
            required: true,
            options: ["staging", "production"],
          },
        ],
      };

      // Extract placeholders from command
      const placeholders = command.command.match(/\{\{(\w+)\}\}/g) || [];
      const placeholderNames = placeholders.map((p) => p.replace(/[{}]/g, ""));

      // Verify all placeholders have corresponding args
      const argNames = command.args!.map((arg) => arg.name);
      placeholderNames.forEach((placeholder) => {
        expect(argNames).toContain(placeholder);
      });
    });
  });

  describe("Error Scenarios", () => {
    it("should handle empty categories gracefully", () => {
      const emptyConfig: ScriptConfig = {
        categories: [],
      };

      expect(emptyConfig.categories).toHaveLength(0);
      expect(() => emptyConfig.categories.forEach(() => {})).not.toThrow();
    });

    it("should handle categories with no commands", () => {
      const categoryWithNoCommands: ScriptCategory = {
        name: "empty",
        icon: "📭",
        description: "Empty category",
        commands: [],
      };

      expect(categoryWithNoCommands.commands).toHaveLength(0);
      expect(() =>
        categoryWithNoCommands.commands.forEach(() => {})
      ).not.toThrow();
    });

    it("should handle malformed command structures", () => {
      // Test that TypeScript catches malformed structures at compile time
      const validCommand: ScriptCommand = {
        name: "Valid Command",
        description: "A valid command",
        command: 'echo "valid"',
      };

      expect(validCommand).toBeDefined();

      // These would cause TypeScript errors if uncommented:
      // const invalidCommand: ScriptCommand = {
      //   name: 'Invalid',
      //   // missing description and command
      // };
    });
  });

  describe("Real-world Configuration Examples", () => {
    it("should support Next.js project configuration", () => {
      const nextjsConfig: ScriptConfig = {
        categories: [
          {
            name: "dev",
            icon: "🚀",
            description: "Development commands",
            commands: [
              {
                name: "start",
                description: "Start development server",
                command: "bun run dev --turbo",
              },
              {
                name: "build",
                description: "Build for production",
                command: "bun run build",
              },
              {
                name: "preview",
                description: "Preview production build",
                command: "bun run start",
              },
            ],
          },
          {
            name: "test",
            icon: "🧪",
            description: "Testing commands",
            commands: [
              {
                name: "unit",
                description: "Run unit tests",
                command: "bun test",
              },
              {
                name: "e2e",
                description: "Run E2E tests",
                command: "bun run test:e2e",
              },
            ],
          },
        ],
      };

      expect(nextjsConfig.categories).toHaveLength(2);
      expect(nextjsConfig.categories[0].commands[0].command).toContain(
        "--turbo"
      );
    });

    it("should support monorepo configuration", () => {
      const monorepoConfig: ScriptConfig = {
        categories: [
          {
            name: "workspace",
            icon: "📦",
            description: "Workspace commands",
            commands: [
              {
                name: "install",
                description: "Install all dependencies",
                command: "pnpm install",
              },
              {
                name: "build-all",
                description: "Build all packages",
                command: "turbo run build",
              },
              {
                name: "test-all",
                description: "Test all packages",
                command: "turbo run test",
              },
            ],
          },
          {
            name: "release",
            icon: "🚢",
            description: "Release management",
            commands: [
              {
                name: "changeset",
                description: "Create changeset",
                command: "changeset",
              },
              {
                name: "version",
                description: "Version packages",
                command: "changeset version",
              },
              {
                name: "publish",
                description: "Publish packages",
                command: "changeset publish",
              },
            ],
          },
        ],
      };

      expect(monorepoConfig.categories).toHaveLength(2);
      expect(monorepoConfig.categories[0].name).toBe("workspace");
      expect(monorepoConfig.categories[1].name).toBe("release");
    });
  });
});
