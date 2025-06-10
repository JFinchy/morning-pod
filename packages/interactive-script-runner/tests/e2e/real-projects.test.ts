import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ScriptRunner } from "@/runner";
import { ConfigLoader } from "@/config/loader";
import {
  TestProjectSetup,
  createMockSpawnResult,
  assertCommandExecuted,
} from "../fixtures/test-utils";
import spawn from "cross-spawn";

const mockedSpawn = vi.mocked(spawn);

describe("E2E: Real Project Scenarios", () => {
  let projectSetup: TestProjectSetup;

  beforeEach(() => {
    vi.clearAllMocks();
    projectSetup = new TestProjectSetup("/tmp/e2e-test");
  });

  afterEach(() => {
    projectSetup.reset();
  });

  describe("Complete Next.js Workflow", () => {
    beforeEach(() => {
      projectSetup.setupNextJsProject().withPackageManager("bun").apply();
    });

    it("should complete full development workflow", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });

      // Mock successful command executions
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Start development server
      let result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", ["run", "dev", "--turbo"]);

      // Run type checking
      result = await scriptRunner.run(["quality", "type-check"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", ["run", "type-check"]);

      // Run tests
      result = await scriptRunner.run(["test", "unit"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", ["test"]);

      // Build for production
      result = await scriptRunner.run(["dev", "build"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", ["run", "build"]);

      expect(mockedSpawn).toHaveBeenCalledTimes(4);
    });

    it("should run all tests with --all flag", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      const result = await scriptRunner.run(["test", "--all"]);
      expect(result).toBe(true);

      // Should execute both unit and e2e tests
      expect(mockedSpawn).toHaveBeenCalledTimes(2);
      expect(mockedSpawn).toHaveBeenNthCalledWith(
        1,
        "bun",
        ["test"],
        expect.any(Object)
      );
      expect(mockedSpawn).toHaveBeenNthCalledWith(
        2,
        "bun",
        ["run", "test:e2e"],
        expect.any(Object)
      );
    });

    it("should handle database operations", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Generate migration
      let result = await scriptRunner.run(["db", "generate"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", [
        "run",
        "drizzle-kit",
        "generate",
      ]);

      // Apply migration
      result = await scriptRunner.run(["db", "migrate"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", ["run", "drizzle-kit", "push"]);

      // Open studio
      result = await scriptRunner.run(["db", "studio"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", [
        "run",
        "drizzle-kit",
        "studio",
      ]);
    });
  });

  describe("React + Vite Project Workflow", () => {
    beforeEach(() => {
      projectSetup.setupReactProject().withPackageManager("yarn").apply();
    });

    it("should complete React development workflow", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Start Vite dev server
      let result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "yarn", ["dev"]);

      // Build with Vite
      result = await scriptRunner.run(["dev", "build"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "yarn", ["build"]);

      // Preview build
      result = await scriptRunner.run(["dev", "preview"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "yarn", ["preview"]);

      // Run Storybook
      result = await scriptRunner.run(["dev", "storybook"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "yarn", ["storybook"]);
    });
  });

  describe("Node.js API Project Workflow", () => {
    beforeEach(() => {
      projectSetup.setupNodeProject().withPackageManager("npm").apply();
    });

    it("should complete Node.js development workflow", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Start dev server with watch mode
      let result = await scriptRunner.run(["dev", "dev"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "npm", ["run", "dev"]);

      // Build TypeScript
      result = await scriptRunner.run(["dev", "build"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "npm", ["run", "build"]);

      // Run tests with coverage
      result = await scriptRunner.run(["test", "coverage"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "npm", ["run", "test:coverage"]);

      // Start production server
      result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "npm", ["start"]);
    });
  });

  describe("Monorepo Project Workflow", () => {
    beforeEach(() => {
      projectSetup.setupMonorepoProject().withPackageManager("pnpm").apply();
    });

    it("should handle Turbo-based monorepo commands", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Run dev across all packages
      let result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "pnpm", ["dev"]);

      // Build all packages
      result = await scriptRunner.run(["dev", "build"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "pnpm", ["build"]);

      // Release management
      result = await scriptRunner.run(["release", "changeset"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "pnpm", ["changeset:version"]);
    });
  });

  describe("Custom Configuration Workflow", () => {
    beforeEach(() => {
      projectSetup.setupCustomConfigProject().withPackageManager("bun").apply();
    });

    it("should execute custom deployment commands", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Deploy to staging
      let result = await scriptRunner.run(["deploy", "staging"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "bun", ["run", "deploy:staging"], {
        env: expect.objectContaining({
          NODE_ENV: "staging",
          API_URL: "https://api-staging.example.com",
        }),
      });
    });

    it("should handle commands with arguments", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Mock argument prompting
      const clackPrompts = vi.mocked(await vi.importActual("@clack/prompts"));
      clackPrompts.text.mockResolvedValue("v1.2.3");

      const result = await scriptRunner.run(["deploy", "production"]);
      expect(result).toBe(true);

      // Should prompt for version argument
      expect(clackPrompts.text).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Version to deploy"),
        })
      );
    });

    it("should handle Docker commands with argument replacement", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });
      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      // Mock argument prompting
      const clackPrompts = vi.mocked(await vi.importActual("@clack/prompts"));
      clackPrompts.text
        .mockResolvedValueOnce("my-custom-app") // imageName
        .mockResolvedValueOnce("8080"); // port

      // Build Docker image
      let result = await scriptRunner.run(["docker", "build"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "docker", [
        "build",
        "-t",
        "my-custom-app",
        ".",
      ]);

      // Run Docker container
      result = await scriptRunner.run(["docker", "run"]);
      expect(result).toBe(true);
      assertCommandExecuted(mockedSpawn, "docker", [
        "run",
        "-p",
        "8080:3000",
        "my-custom-app",
      ]);
    });
  });

  describe("Error Recovery Scenarios", () => {
    beforeEach(() => {
      projectSetup.setupNextJsProject().withPackageManager("bun").apply();
    });

    it("should handle command failures gracefully", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });

      // Mock command failure
      mockedSpawn.mockReturnValue(createMockSpawnResult(1, "", "Build failed"));

      const result = await scriptRunner.run(["dev", "build"]);
      expect(result).toBe(false);

      // Should still attempt the command
      assertCommandExecuted(mockedSpawn, "bun", ["run", "build"]);
    });

    it("should handle --all flag with mixed success/failure", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });

      let callCount = 0;
      mockedSpawn.mockImplementation(() => {
        callCount++;
        // First command succeeds, second fails
        return createMockSpawnResult(callCount === 1 ? 0 : 1);
      });

      const result = await scriptRunner.run(["test", "--all"]);
      expect(result).toBe(false); // Overall failure due to second command
      expect(mockedSpawn).toHaveBeenCalledTimes(2);
    });

    it("should handle spawn errors", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });

      // Mock spawn throwing an error
      mockedSpawn.mockImplementation(() => {
        throw new Error("Command not found");
      });

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(false);
    });
  });

  describe("Performance and Responsiveness", () => {
    beforeEach(() => {
      projectSetup.setupNextJsProject().withPackageManager("bun").apply();
    });

    it("should load configuration quickly", async () => {
      const startTime = Date.now();

      const configLoader = new ConfigLoader();
      const config = await configLoader.loadConfig(
        projectSetup.getProjectPath()
      );

      const loadTime = Date.now() - startTime;

      expect(config).toBeDefined();
      expect(loadTime).toBeLessThan(100); // Should load very quickly with mocked fs
    });

    it("should initialize ScriptRunner quickly", async () => {
      const startTime = Date.now();

      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
      });

      const initTime = Date.now() - startTime;

      expect(scriptRunner).toBeDefined();
      expect(initTime).toBeLessThan(50); // Should initialize very quickly
    });
  });

  describe("Cross-Platform Compatibility", () => {
    beforeEach(() => {
      projectSetup.setupNextJsProject().withPackageManager("bun").apply();
    });

    it("should handle Windows-style paths", async () => {
      const windowsPath = "C:\\projects\\my-app";
      const scriptRunner = new ScriptRunner({ cwd: windowsPath });

      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);

      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "dev", "--turbo"],
        expect.objectContaining({
          cwd: windowsPath,
        })
      );
    });

    it("should handle Unix-style paths", async () => {
      const unixPath = "/home/user/projects/my-app";
      const scriptRunner = new ScriptRunner({ cwd: unixPath });

      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      const result = await scriptRunner.run(["dev", "start"]);
      expect(result).toBe(true);

      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "dev", "--turbo"],
        expect.objectContaining({
          cwd: unixPath,
        })
      );
    });
  });

  describe("Environment Variable Handling", () => {
    beforeEach(() => {
      projectSetup.setupCustomConfigProject().withPackageManager("bun").apply();
    });

    it("should merge global and command-specific environment variables", async () => {
      const scriptRunner = new ScriptRunner({
        cwd: projectSetup.getProjectPath(),
        env: { CUSTOM_VAR: "custom-value" },
      });

      mockedSpawn.mockReturnValue(createMockSpawnResult(0));

      const result = await scriptRunner.run(["deploy", "staging"]);
      expect(result).toBe(true);

      expect(mockedSpawn).toHaveBeenCalledWith(
        "bun",
        ["run", "deploy:staging"],
        expect.objectContaining({
          env: expect.objectContaining({
            // Global env from config
            DEBUG: "true",
            LOG_LEVEL: "info",
            // Command-specific env
            NODE_ENV: "staging",
            API_URL: "https://api-staging.example.com",
            // Custom env from options
            CUSTOM_VAR: "custom-value",
          }),
        })
      );
    });
  });
});
