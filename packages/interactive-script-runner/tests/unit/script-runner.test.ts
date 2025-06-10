import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScriptRunner } from "@/runner";
import { ConfigLoader } from "@/config/loader";
import type { ScriptConfig, ParsedArgs } from "@/types";
import spawn from "cross-spawn";
import * as clackPrompts from "@clack/prompts";

vi.mock("@/config/loader");
vi.mock("cross-spawn");

const mockedConfigLoader = vi.mocked(ConfigLoader);
const mockedSpawn = vi.mocked(spawn);
const mockedClack = vi.mocked(clackPrompts);

describe("ScriptRunner", () => {
  let scriptRunner: ScriptRunner;
  let mockConfig: ScriptConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
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
            build: {
              name: "Build for production",
              command: "bun run build",
              description: "Build application for production",
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
              description: "Run unit tests with Vitest",
            },
            e2e: {
              name: "Run E2E tests",
              command: "bun run test:e2e",
              description: "Run end-to-end tests",
            },
          },
        },
      },
    };

    const mockConfigLoader = {
      loadConfig: vi.fn().mockResolvedValue(mockConfig),
      detectProjectType: vi.fn(),
      detectPackageManager: vi.fn(),
    };

    mockedConfigLoader.mockImplementation(() => mockConfigLoader as any);
    scriptRunner = new ScriptRunner();
  });

  describe("Initialization", () => {
    it("should initialize with default options", () => {
      expect(scriptRunner).toBeInstanceOf(ScriptRunner);
    });

    it("should initialize with custom options", () => {
      const options = { cwd: "/custom/path", silent: true };
      const customRunner = new ScriptRunner(options);
      expect(customRunner).toBeInstanceOf(ScriptRunner);
    });
  });

  describe("Command Execution", () => {
    it("should execute direct command successfully", async () => {
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);
      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "dev"],
        expect.any(Object)
      );
    });

    it("should handle command execution failure", async () => {
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(1), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(false);
    });

    it("should execute all commands in category", async () => {
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["test", "--all"]);
      expect(result).toBe(true);
      expect(mockedSpawn).toHaveBeenCalledTimes(2); // unit and e2e tests
    });

    it("should handle --all flag with failures", async () => {
      let callCount = 0;
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            callCount++;
            const exitCode = callCount === 1 ? 0 : 1; // First succeeds, second fails
            setTimeout(() => callback(exitCode), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["test", "--all"]);
      expect(result).toBe(false);
    });
  });

  describe("Interactive Mode", () => {
    it("should show category menu when no arguments provided", async () => {
      mockedClack.select.mockResolvedValueOnce("dev");
      mockedClack.select.mockResolvedValueOnce("start");

      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run([]);
      expect(result).toBe(true);
      expect(mockedClack.select).toHaveBeenCalledTimes(2);
    });

    it("should show command menu for category", async () => {
      mockedClack.select.mockResolvedValueOnce("start");

      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["dev"]);
      expect(result).toBe(true);
      expect(mockedClack.select).toHaveBeenCalledOnce();
    });

    it("should handle user cancellation", async () => {
      mockedClack.isCancel.mockReturnValue(true);
      mockedClack.select.mockResolvedValue(Symbol("cancel"));

      const result = await scriptRunner.run([]);
      expect(result).toBe(false);
    });

    it("should prompt for arguments when command requires them", async () => {
      const configWithArgs = {
        ...mockConfig,
        categories: {
          ...mockConfig.categories,
          custom: {
            name: "⚙️ Custom",
            description: "Custom commands",
            commands: {
              deploy: {
                name: "Deploy to environment",
                command: "bun run deploy",
                description: "Deploy to specified environment",
                args: [
                  {
                    name: "environment",
                    description: "Target environment",
                    required: true,
                  },
                ],
              },
            },
          },
        },
      };

      const mockConfigLoader = {
        loadConfig: vi.fn().mockResolvedValue(configWithArgs),
      };
      mockedConfigLoader.mockImplementation(() => mockConfigLoader as any);

      mockedClack.text.mockResolvedValue("production");
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["custom", "deploy"]);
      expect(result).toBe(true);
      expect(mockedClack.text).toHaveBeenCalled();
    });
  });

  describe("Argument Parsing", () => {
    it("should parse help flags", () => {
      const args1: ParsedArgs = scriptRunner.parseArgs(["--help"]);
      expect(args1.help).toBe(true);

      const args2: ParsedArgs = scriptRunner.parseArgs(["-h"]);
      expect(args2.help).toBe(true);
    });

    it("should parse list flag", () => {
      const args: ParsedArgs = scriptRunner.parseArgs(["-l"]);
      expect(args.list).toBe(true);
    });

    it("should parse all flag", () => {
      const args: ParsedArgs = scriptRunner.parseArgs(["test", "--all"]);
      expect(args.all).toBe(true);
      expect(args.category).toBe("test");
    });

    it("should parse category and command", () => {
      const args: ParsedArgs = scriptRunner.parseArgs(["dev", "start"]);
      expect(args.category).toBe("dev");
      expect(args.command).toBe("start");
    });

    it("should parse command arguments", () => {
      const args: ParsedArgs = scriptRunner.parseArgs([
        "dev",
        "start",
        "--port",
        "3001",
      ]);
      expect(args.category).toBe("dev");
      expect(args.command).toBe("start");
      expect(args.commandArgs).toEqual(["--port", "3001"]);
    });

    it("should handle empty arguments", () => {
      const args: ParsedArgs = scriptRunner.parseArgs([]);
      expect(args.category).toBeUndefined();
      expect(args.command).toBeUndefined();
      expect(args.help).toBe(false);
    });
  });

  describe("Help and List Functions", () => {
    it("should display help information", async () => {
      await scriptRunner.showHelp();
      expect(console.log).toHaveBeenCalled();
    });

    it("should list all commands", async () => {
      await scriptRunner.listCommands();
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid category", async () => {
      const result = await scriptRunner.run(["invalid-category"]);
      expect(result).toBe(false);
    });

    it("should handle invalid command", async () => {
      const result = await scriptRunner.run(["dev", "invalid-command"]);
      expect(result).toBe(false);
    });

    it("should handle config loading errors", async () => {
      const mockConfigLoader = {
        loadConfig: vi.fn().mockRejectedValue(new Error("Config error")),
      };
      mockedConfigLoader.mockImplementation(() => mockConfigLoader as any);

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(false);
    });

    it("should handle spawn errors", async () => {
      mockedSpawn.mockImplementation(() => {
        throw new Error("Spawn error");
      });

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(false);
    });
  });

  describe("Command Replacement", () => {
    it("should replace command arguments in command string", () => {
      const command =
        "bun run deploy --env {{environment}} --region {{region}}";
      const args = { environment: "production", region: "us-east-1" };

      const result = scriptRunner.replaceCommandArgs(command, args);
      expect(result).toBe("bun run deploy --env production --region us-east-1");
    });

    it("should handle missing arguments gracefully", () => {
      const command = "bun run deploy --env {{environment}}";
      const args = {};

      const result = scriptRunner.replaceCommandArgs(command, args);
      expect(result).toBe("bun run deploy --env {{environment}}");
    });
  });

  describe("Environment Variables", () => {
    it("should apply global environment variables", async () => {
      const configWithEnv = {
        ...mockConfig,
        env: {
          NODE_ENV: "development",
          DEBUG: "true",
        },
      };

      const mockConfigLoader = {
        loadConfig: vi.fn().mockResolvedValue(configWithEnv),
      };
      mockedConfigLoader.mockImplementation(() => mockConfigLoader as any);

      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      await scriptRunner.run(["dev", "start"]);

      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "dev"],
        expect.objectContaining({
          env: expect.objectContaining({
            NODE_ENV: "development",
            DEBUG: "true",
          }),
        })
      );
    });

    it("should apply command-specific environment variables", async () => {
      const configWithCommandEnv = {
        ...mockConfig,
        categories: {
          ...mockConfig.categories,
          dev: {
            ...mockConfig.categories.dev,
            commands: {
              ...mockConfig.categories.dev.commands,
              start: {
                ...mockConfig.categories.dev.commands.start,
                env: {
                  PORT: "3001",
                  HOST: "localhost",
                },
              },
            },
          },
        },
      };

      const mockConfigLoader = {
        loadConfig: vi.fn().mockResolvedValue(configWithCommandEnv),
      };
      mockedConfigLoader.mockImplementation(() => mockConfigLoader as any);

      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      await scriptRunner.run(["dev", "start"]);

      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "dev"],
        expect.objectContaining({
          env: expect.objectContaining({
            PORT: "3001",
            HOST: "localhost",
          }),
        })
      );
    });
  });
});
