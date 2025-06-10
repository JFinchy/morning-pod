import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { ScriptRunner } from "@/runner";
import { ConfigLoader } from "@/config/loader";
import spawn from "cross-spawn";
import * as clackPrompts from "@clack/prompts";

const mockedFs = vi.mocked(fs);
const mockedSpawn = vi.mocked(spawn);
const mockedClack = vi.mocked(clackPrompts);

describe("Full Workflow Integration Tests", () => {
  let tempDir: string;
  let scriptRunner: ScriptRunner;

  beforeEach(() => {
    vi.clearAllMocks();
    tempDir = "/tmp/test-project";
    scriptRunner = new ScriptRunner({ cwd: tempDir });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Next.js Project Workflow", () => {
    beforeEach(() => {
      // Mock Next.js project structure
      mockedFs.existsSync.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        return (
          pathStr.includes("next.config") ||
          pathStr.includes("package.json") ||
          pathStr.includes("tsconfig.json") ||
          pathStr.includes("bun.lockb")
        );
      });

      mockedFs.readJSONSync.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        if (pathStr.includes("package.json")) {
          return {
            name: "test-nextjs-app",
            scripts: {
              dev: "next dev --turbo",
              build: "next build",
              start: "next start",
            },
            dependencies: {
              next: "^14.0.0",
              react: "^18.0.0",
            },
            devDependencies: {
              typescript: "^5.0.0",
              vitest: "^1.0.0",
              "@playwright/test": "^1.0.0",
            },
          };
        }
        return {};
      });
    });

    it("should detect Next.js project and generate appropriate config", async () => {
      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig(tempDir);

      expect(config.categories).toBeDefined();
      expect(config.categories.dev).toBeDefined();
      expect(config.categories.test).toBeDefined();
      expect(config.categories.quality).toBeDefined();

      // Should include Next.js specific commands
      expect(config.categories.dev?.commands.start?.command).toContain("bun");
      expect(config.categories.dev?.commands.build?.command).toBeDefined();
    });

    it("should execute development server command", async () => {
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
        ["run", "dev", "--turbo"],
        expect.objectContaining({
          cwd: tempDir,
          stdio: "inherit",
        })
      );
    });

    it("should run build process", async () => {
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run(["dev", "build"]);
      expect(result).toBe(true);
      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "build"],
        expect.any(Object)
      );
    });

    it("should run all test commands", async () => {
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
  });

  describe("React Project Workflow", () => {
    beforeEach(() => {
      // Mock React project (not Next.js)
      mockedFs.existsSync.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        return (
          pathStr.includes("package.json") ||
          pathStr.includes("tsconfig.json") ||
          pathStr.includes("yarn.lock") ||
          pathStr.includes("vite.config")
        );
      });

      mockedFs.readJSONSync.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        if (pathStr.includes("package.json")) {
          return {
            name: "test-react-app",
            scripts: {
              dev: "vite",
              build: "vite build",
              preview: "vite preview",
            },
            dependencies: {
              react: "^18.0.0",
              vite: "^5.0.0",
            },
            devDependencies: {
              typescript: "^5.0.0",
              vitest: "^1.0.0",
            },
          };
        }
        return {};
      });
    });

    it("should detect React project with Yarn", async () => {
      const configLoader = new ConfigLoader();
      const packageManager = configLoader.detectPackageManager(tempDir);

      expect(packageManager.manager).toBe("yarn");
      expect(packageManager.lockfile).toBe("yarn.lock");
    });

    it("should generate React-specific commands", async () => {
      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig(tempDir);

      expect(config.categories.dev?.commands.start?.command).toContain("yarn");
      expect(config.categories.dev?.commands.preview?.command).toContain(
        "preview"
      );
    });
  });

  describe("Node.js Project Workflow", () => {
    beforeEach(() => {
      // Mock Node.js project
      mockedFs.existsSync.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        return (
          pathStr.includes("package.json") ||
          pathStr.includes("package-lock.json")
        );
      });

      mockedFs.readJSONSync.mockImplementation((filePath: string) => {
        const pathStr = filePath.toString();
        if (pathStr.includes("package.json")) {
          return {
            name: "test-node-app",
            main: "index.js",
            scripts: {
              start: "node index.js",
              dev: "node --watch index.js",
            },
            dependencies: {
              express: "^4.0.0",
            },
          };
        }
        return {};
      });
    });

    it("should detect Node.js project with npm", async () => {
      const configLoader = new ConfigLoader();
      const projectType = configLoader.detectProjectType(tempDir);
      const packageManager = configLoader.detectPackageManager(tempDir);

      expect(projectType.type).toBe("node");
      expect(packageManager.manager).toBe("npm");
    });

    it("should generate Node.js specific commands", async () => {
      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig(tempDir);

      expect(config.categories.dev?.commands.start?.command).toContain("npm");
      expect(config.categories.dev?.commands.dev?.command).toContain("--watch");
    });
  });

  describe("Interactive Mode Workflow", () => {
    beforeEach(() => {
      // Mock basic project
      mockedFs.existsSync.mockImplementation((filePath: string) => {
        return filePath.toString().includes("package.json");
      });

      mockedFs.readJSONSync.mockReturnValue({
        name: "test-app",
        scripts: { start: "node index.js" },
      });
    });

    it("should show category selection menu", async () => {
      mockedClack.select
        .mockResolvedValueOnce("dev") // Select dev category
        .mockResolvedValueOnce("start"); // Select start command

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

    it("should show command selection for specific category", async () => {
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

    it("should handle user cancellation gracefully", async () => {
      mockedClack.isCancel.mockReturnValue(true);
      mockedClack.select.mockResolvedValue(Symbol("cancel"));

      const result = await scriptRunner.run([]);
      expect(result).toBe(false);
      expect(mockedClack.cancel).toHaveBeenCalled();
    });
  });

  describe("Configuration File Workflow", () => {
    it("should load JavaScript configuration file", async () => {
      mockedFs.existsSync.mockImplementation((filePath: string) => {
        return filePath.toString().includes("script-runner.config.js");
      });

      const mockConfig = {
        categories: {
          custom: {
            name: "⚙️ Custom",
            description: "Custom commands",
            commands: {
              deploy: {
                name: "Deploy",
                command: "npm run deploy",
                description: "Deploy application",
              },
            },
          },
        },
      };

      // Mock dynamic import
      vi.doMock(
        `${tempDir}/script-runner.config.js`,
        () => ({ default: mockConfig }),
        { virtual: true }
      );

      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig(tempDir);

      expect(config.categories.custom).toBeDefined();
      expect(config.categories.custom?.commands.deploy).toBeDefined();
    });

    it("should load JSON configuration file", async () => {
      mockedFs.existsSync.mockImplementation((filePath: string) => {
        return filePath.toString().includes(".scriptrunnerrc.json");
      });

      const mockConfig = {
        categories: {
          custom: {
            name: "⚙️ Custom",
            description: "Custom commands",
            commands: {
              test: {
                name: "Test",
                command: "npm test",
                description: "Run tests",
              },
            },
          },
        },
      };

      mockedFs.readJSONSync.mockReturnValue(mockConfig);

      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig(tempDir);

      expect(config.categories.custom).toBeDefined();
      expect(config.categories.custom?.commands.test).toBeDefined();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle command execution failures gracefully", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readJSONSync.mockReturnValue({ name: "test" });

      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(1), 100); // Exit with error
          }
        }),
      } as any);

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(false);
    });

    it("should handle spawn errors", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readJSONSync.mockReturnValue({ name: "test" });

      mockedSpawn.mockImplementation(() => {
        throw new Error("Command not found");
      });

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(false);
    });

    it("should handle missing commands gracefully", async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readJSONSync.mockReturnValue({ name: "test" });

      const result = await scriptRunner.run(["nonexistent", "command"]);
      expect(result).toBe(false);
    });
  });

  describe("Command Arguments Integration", () => {
    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readJSONSync.mockReturnValue({
        name: "test-app",
        scripts: { start: "node index.js" },
      });
    });

    it("should pass command arguments correctly", async () => {
      mockedSpawn.mockReturnValue({
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === "close") {
            setTimeout(() => callback(0), 100);
          }
        }),
      } as any);

      const result = await scriptRunner.run([
        "dev",
        "start",
        "--port",
        "3001",
        "--host",
        "localhost",
      ]);
      expect(result).toBe(true);

      expect(mockedSpawn).toHaveBeenCalledWith(
        "npm",
        ["run", "start", "--port", "3001", "--host", "localhost"],
        expect.any(Object)
      );
    });

    it("should handle environment variables", async () => {
      // Create a config with environment variables
      const configWithEnv = {
        categories: {
          dev: {
            name: "Development",
            description: "Dev commands",
            commands: {
              start: {
                name: "Start",
                command: "npm start",
                description: "Start server",
                env: {
                  PORT: "3000",
                  NODE_ENV: "development",
                },
              },
            },
          },
        },
        env: {
          DEBUG: "true",
        },
      };

      // Mock config loading
      vi.spyOn(ConfigLoader.prototype, "loadConfig").mockResolvedValue(
        configWithEnv
      );

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
        "npm",
        ["start"],
        expect.objectContaining({
          env: expect.objectContaining({
            PORT: "3000",
            NODE_ENV: "development",
            DEBUG: "true",
          }),
        })
      );
    });
  });
});
