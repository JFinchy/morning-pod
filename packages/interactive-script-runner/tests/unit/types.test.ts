import { describe, it, expect } from "vitest";
import type {
  ScriptCommand,
  ScriptCategory,
  ScriptConfig,
  ProjectDetection,
  PackageManagerDetection,
  ParsedArgs,
  ScriptRunnerOptions,
} from "../../src/types";

describe("TypeScript Types", () => {
  describe("ScriptCommand", () => {
    it("should define a valid script command", () => {
      const command: ScriptCommand = {
        name: "Start dev server",
        command: "bun run dev",
        description: "Start development server",
      };

      expect(command.name).toBe("Start dev server");
      expect(command.command).toBe("bun run dev");
      expect(command.description).toBe("Start development server");
    });

    it("should support optional properties", () => {
      const command: ScriptCommand = {
        name: "Deploy",
        command: "npm run deploy --env {{environment}}",
        description: "Deploy to environment",
        args: [
          {
            name: "environment",
            description: "Target environment",
            required: true,
          },
        ],
        env: {
          NODE_ENV: "production",
        },
      };

      expect(command.args).toHaveLength(1);
      expect(command.args![0].name).toBe("environment");
      expect(command.env).toEqual({ NODE_ENV: "production" });
    });
  });

  describe("ScriptCategory", () => {
    it("should define a valid script category", () => {
      const category: ScriptCategory = {
        name: "🚀 Development",
        description: "Development commands",
        commands: {
          start: {
            name: "Start dev server",
            command: "bun run dev",
            description: "Start development server",
          },
          build: {
            name: "Build for production",
            command: "bun run build",
            description: "Build application",
          },
        },
      };

      expect(category.name).toBe("🚀 Development");
      expect(Object.keys(category.commands)).toHaveLength(2);
      expect(category.commands.start.name).toBe("Start dev server");
    });
  });

  describe("ScriptConfig", () => {
    it("should define a complete script configuration", () => {
      const config: ScriptConfig = {
        categories: {
          dev: {
            name: "🚀 Development",
            description: "Development commands",
            commands: {
              start: {
                name: "Start dev server",
                command: "bun run dev",
                description: "Start development server",
              },
            },
          },
          test: {
            name: "🧪 Testing",
            description: "Testing commands",
            commands: {
              unit: {
                name: "Run unit tests",
                command: "bun test",
                description: "Run unit tests",
              },
            },
          },
        },
        env: {
          NODE_ENV: "development",
          DEBUG: "true",
        },
      };

      expect(Object.keys(config.categories)).toHaveLength(2);
      expect(config.env).toEqual({
        NODE_ENV: "development",
        DEBUG: "true",
      });
    });
  });

  describe("ProjectDetection", () => {
    it("should define project detection result", () => {
      const detection: ProjectDetection = {
        type: "nextjs",
        features: ["react", "typescript", "testing"],
      };

      expect(detection.type).toBe("nextjs");
      expect(detection.features).toContain("react");
      expect(detection.features).toContain("typescript");
      expect(detection.features).toContain("testing");
    });

    it("should support all project types", () => {
      const types: ProjectDetection["type"][] = [
        "nextjs",
        "react",
        "node",
        "generic",
      ];

      types.forEach((type) => {
        const detection: ProjectDetection = {
          type,
          features: [],
        };
        expect(detection.type).toBe(type);
      });
    });
  });

  describe("PackageManagerDetection", () => {
    it("should define package manager detection result", () => {
      const detection: PackageManagerDetection = {
        manager: "bun",
        lockfile: "bun.lockb",
      };

      expect(detection.manager).toBe("bun");
      expect(detection.lockfile).toBe("bun.lockb");
    });

    it("should support all package managers", () => {
      const managers: Array<{
        manager: PackageManagerDetection["manager"];
        lockfile: string;
      }> = [
        { manager: "bun", lockfile: "bun.lockb" },
        { manager: "npm", lockfile: "package-lock.json" },
        { manager: "yarn", lockfile: "yarn.lock" },
        { manager: "pnpm", lockfile: "pnpm-lock.yaml" },
      ];

      managers.forEach(({ manager, lockfile }) => {
        const detection: PackageManagerDetection = { manager, lockfile };
        expect(detection.manager).toBe(manager);
        expect(detection.lockfile).toBe(lockfile);
      });
    });
  });

  describe("ParsedArgs", () => {
    it("should define parsed command line arguments", () => {
      const args: ParsedArgs = {
        category: "dev",
        command: "start",
        commandArgs: ["--port", "3001"],
        help: false,
        list: false,
        all: false,
      };

      expect(args.category).toBe("dev");
      expect(args.command).toBe("start");
      expect(args.commandArgs).toEqual(["--port", "3001"]);
      expect(args.help).toBe(false);
    });

    it("should support optional properties", () => {
      const args: ParsedArgs = {
        help: true,
      };

      expect(args.help).toBe(true);
      expect(args.category).toBeUndefined();
      expect(args.command).toBeUndefined();
    });
  });

  describe("ScriptRunnerOptions", () => {
    it("should define script runner options", () => {
      const options: ScriptRunnerOptions = {
        cwd: "/path/to/project",
        silent: true,
        env: {
          NODE_ENV: "test",
        },
      };

      expect(options.cwd).toBe("/path/to/project");
      expect(options.silent).toBe(true);
      expect(options.env).toEqual({ NODE_ENV: "test" });
    });

    it("should support minimal options", () => {
      const options: ScriptRunnerOptions = {};

      expect(options.cwd).toBeUndefined();
      expect(options.silent).toBeUndefined();
      expect(options.env).toBeUndefined();
    });
  });

  describe("Type Compatibility", () => {
    it("should allow extending interfaces", () => {
      interface ExtendedScriptCommand extends ScriptCommand {
        category?: string;
        priority?: number;
      }

      const extendedCommand: ExtendedScriptCommand = {
        name: "Extended command",
        command: 'echo "extended"',
        description: "Extended command description",
        category: "custom",
        priority: 1,
      };

      expect(extendedCommand.category).toBe("custom");
      expect(extendedCommand.priority).toBe(1);
    });

    it("should work with utility types", () => {
      type CommandKeys = keyof ScriptCommand;
      const keys: CommandKeys[] = [
        "name",
        "command",
        "description",
        "args",
        "env",
      ];

      expect(keys).toContain("name");
      expect(keys).toContain("command");
      expect(keys).toContain("description");
    });

    it("should support partial types", () => {
      const partialCommand: Partial<ScriptCommand> = {
        name: "Partial command",
      };

      expect(partialCommand.name).toBe("Partial command");
      expect(partialCommand.command).toBeUndefined();
    });
  });
});
