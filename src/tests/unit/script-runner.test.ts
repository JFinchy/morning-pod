import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

// Mock child_process module
vi.mock("child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("child_process")>();
  return {
    ...actual,
    execSync: vi.fn(),
  };
});

import { execSync } from "child_process";

import { ScriptRunner } from "../../../tools/scripts/run";

// Get the mocked function
const mockExecSync = vi.mocked(execSync);

// Mock console methods
const consoleSpy = {
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
};

// Mock process.exit
const originalExit = process.exit;
const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit unexpectedly called");
});

// Mock process.argv
const originalArgv = process.argv;

describe("ScriptRunner", () => {
  let runner: ScriptRunner;

  beforeEach(() => {
    runner = new ScriptRunner();
    // Clear all mocks
    vi.clearAllMocks();
    mockExecSync.mockClear();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    processExitSpy.mockClear();
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.clearAllMocks();
  });

  afterAll(() => {
    (process.exit as unknown as typeof originalExit) = originalExit;
  });

  describe("parseArgs", () => {
    test("should return help mode for --help flag", () => {
      process.argv = ["bun", "script", "--help"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "help" });
    });

    test("should return help mode for -h flag", () => {
      process.argv = ["bun", "script", "-h"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "help" });
    });

    test("should return list mode for --list flag", () => {
      process.argv = ["bun", "script", "--list"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "list" });
    });

    test("should return list mode for -l flag", () => {
      process.argv = ["bun", "script", "-l"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "list" });
    });

    test("should return interactive mode for empty args", () => {
      process.argv = ["bun", "script"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "interactive" });
    });

    test("should return interactive mode for -i flag", () => {
      process.argv = ["bun", "script", "-i"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "interactive" });
    });

    test("should return interactive mode for --interactive flag", () => {
      process.argv = ["bun", "script", "--interactive"];
      const result = runner.parseArgs();
      expect(result).toEqual({ flags: [], mode: "interactive" });
    });

    test("should return category mode for category only", () => {
      process.argv = ["bun", "script", "test"];
      const result = runner.parseArgs();
      expect(result).toEqual({ category: "test", flags: [], mode: "category" });
    });

    test("should return direct mode for category and action", () => {
      process.argv = ["bun", "script", "test", "unit"];
      const result = runner.parseArgs();
      expect(result).toEqual({
        action: "unit",
        category: "test",
        flags: [],
        mode: "direct",
      });
    });

    test("should return direct mode with flags", () => {
      process.argv = ["bun", "script", "test", "unit", "--watch"];
      const result = runner.parseArgs();
      expect(result).toEqual({
        action: "unit",
        category: "test",
        flags: ["--watch"],
        mode: "direct",
      });
    });

    describe("flag shortcuts", () => {
      test("should parse test category flags correctly", () => {
        const testCases = [
          {
            args: ["test", "--e2e"],
            expected: { action: "e2e", category: "test" },
          },
          {
            args: ["test", "--unit"],
            expected: { action: "unit", category: "test" },
          },
          {
            args: ["test", "--watch"],
            expected: { action: "unit:watch", category: "test" },
          },
          {
            args: ["test", "--coverage"],
            expected: { action: "unit:coverage", category: "test" },
          },
          {
            args: ["test", "--ui"],
            expected: { action: "unit:ui", category: "test" },
          },
          {
            args: ["test", "--perf"],
            expected: { action: "unit:perf", category: "test" },
          },
          {
            args: ["test", "--debug"],
            expected: { action: "e2e:debug", category: "test" },
          },
          {
            args: ["test", "--headed"],
            expected: { action: "e2e:headed", category: "test" },
          },
          {
            args: ["test", "--visual"],
            expected: { action: "e2e:visual", category: "test" },
          },
          {
            args: ["test", "--performance"],
            expected: { action: "performance", category: "test" },
          },
          {
            args: ["test", "--all"],
            expected: { action: "--all", category: "test" },
          },
        ];

        for (const { args, expected } of testCases) {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        }
      });

      test("should parse dev category flags correctly", () => {
        const testCases = [
          {
            args: ["dev", "--start"],
            expected: { action: "start", category: "dev" },
          },
          {
            args: ["dev", "--build"],
            expected: { action: "build", category: "dev" },
          },
          {
            args: ["dev", "--preview"],
            expected: { action: "preview", category: "dev" },
          },
          {
            args: ["dev", "--clean"],
            expected: { action: "clean", category: "dev" },
          },
        ];

        for (const { args, expected } of testCases) {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        }
      });

      test("should parse quality category flags correctly", () => {
        const testCases = [
          {
            args: ["quality", "--lint"],
            expected: { action: "lint", category: "quality" },
          },
          {
            args: ["quality", "--fix"],
            expected: { action: "lint:fix", category: "quality" },
          },
          {
            args: ["quality", "--quiet"],
            expected: { action: "lint:quiet", category: "quality" },
          },
          {
            args: ["quality", "--strict"],
            expected: { action: "lint:strict", category: "quality" },
          },
          {
            args: ["quality", "--format"],
            expected: { action: "format", category: "quality" },
          },
          {
            args: ["quality", "--check"],
            expected: { action: "format:check", category: "quality" },
          },
          {
            args: ["quality", "--type"],
            expected: { action: "type-check", category: "quality" },
          },
          {
            args: ["quality", "--all"],
            expected: { action: "all", category: "quality" },
          },
        ];

        for (const { args, expected } of testCases) {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        }
      });

      test("should parse db category flags correctly", () => {
        const testCases = [
          {
            args: ["db", "--generate"],
            expected: { action: "generate", category: "db" },
          },
          {
            args: ["db", "--migrate"],
            expected: { action: "migrate", category: "db" },
          },
          {
            args: ["db", "--seed"],
            expected: { action: "seed", category: "db" },
          },
          {
            args: ["db", "--studio"],
            expected: { action: "studio", category: "db" },
          },
        ];

        for (const { args, expected } of testCases) {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        }
      });

      test("should parse deps category flags correctly", () => {
        const testCases = [
          {
            args: ["deps", "--check"],
            expected: { action: "check", category: "deps" },
          },
          {
            args: ["deps", "--patch"],
            expected: { action: "update:patch", category: "deps" },
          },
          {
            args: ["deps", "--minor"],
            expected: { action: "update:minor", category: "deps" },
          },
          {
            args: ["deps", "--major"],
            expected: { action: "update:major", category: "deps" },
          },
          {
            args: ["deps", "--safe"],
            expected: { action: "update:safe", category: "deps" },
          },
          {
            args: ["deps", "--doctor"],
            expected: { action: "doctor", category: "deps" },
          },
          {
            args: ["deps", "--outdated"],
            expected: { action: "outdated", category: "deps" },
          },
        ];

        for (const { args, expected } of testCases) {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        }
      });

      test("should parse release category flags correctly", () => {
        const testCases = [
          {
            args: ["release", "--changeset"],
            expected: { action: "changeset", category: "release" },
          },
          {
            args: ["release", "--version"],
            expected: { action: "version", category: "release" },
          },
          {
            args: ["release", "--publish"],
            expected: { action: "publish", category: "release" },
          },
          {
            args: ["release", "--status"],
            expected: { action: "status", category: "release" },
          },
          {
            args: ["release", "--release"],
            expected: { action: "release", category: "release" },
          },
        ];

        for (const { args, expected } of testCases) {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        }
      });

      test("should handle unknown flags gracefully", () => {
        process.argv = ["bun", "script", "test", "--unknown"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("category");
        expect(result.category).toBe("test");
        expect(result.flags).toContain("--unknown");
      });

      test("should handle multiple flags and process first recognized one", () => {
        process.argv = ["bun", "script", "test", "--e2e", "--unknown"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
        expect(result.category).toBe("test");
        expect(result.action).toBe("e2e");
        expect(result.flags).toContain("--unknown");
        expect(result.flags).not.toContain("--e2e");
      });

      test("should handle case-insensitive category names with flags", () => {
        process.argv = ["bun", "script", "TEST", "--unit"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
        expect(result.category).toBe("TEST");
        expect(result.action).toBe("unit");
      });

      test("should fall back to normal parsing for categories without flag mappings", () => {
        process.argv = ["bun", "script", "unknown-category", "--flag"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("category");
        expect(result.category).toBe("unknown-category");
        expect(result.flags).toContain("--flag");
      });
    });
  });

  describe("getArgumentExamples", () => {
    test("should return context-specific examples for test commands", () => {
      expect(runner.getArgumentExamples("test", "unit")).toBe(
        "--watch --coverage"
      );
      expect(runner.getArgumentExamples("test", "e2e")).toBe(
        "--headed --debug"
      );
      expect(runner.getArgumentExamples("test", "performance")).toBe(
        "--repeat-each=3"
      );
    });

    test("should return context-specific examples for quality commands", () => {
      expect(runner.getArgumentExamples("quality", "lint")).toBe(
        "src/ --max-warnings 0"
      );
      expect(runner.getArgumentExamples("quality", "lint:fix")).toBe(
        "src/components --quiet"
      );
      expect(runner.getArgumentExamples("quality", "format")).toBe(
        "src/ --check"
      );
    });

    test("should return context-specific examples for dev commands", () => {
      expect(runner.getArgumentExamples("dev", "start")).toBe("--port 3001");
      expect(runner.getArgumentExamples("dev", "build")).toBe("--debug");
    });

    test("should return default examples for unknown commands", () => {
      expect(runner.getArgumentExamples("test", "unknown")).toBe(
        "--timeout 30000"
      );
      expect(runner.getArgumentExamples("quality", "unknown")).toBe(
        "src/ --verbose"
      );
    });

    test("should return default examples for unknown categories", () => {
      expect(runner.getArgumentExamples("unknown", "command")).toBe("--help");
    });
  });

  describe("executeCommandWithArgs", () => {
    test("should execute command with additional arguments", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommandWithArgs("test", "unit", "--watch --coverage");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "🔧 Command: bun vitest --config config/testing/vitest.config.ts --watch --coverage\\n"
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts --watch --coverage",
        expect.any(Object)
      );
    });

    test("should execute command without additional arguments when empty", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommandWithArgs("test", "unit", "");

      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts",
        expect.any(Object)
      );
    });

    test("should handle --all flag properly", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommandWithArgs("test", "--all", "");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Run all tests (unit + E2E)\\n"
      );
    });
  });

  describe("showHelp", () => {
    test("should display help information", () => {
      runner.showHelp();

      expect(consoleSpy.log).toHaveBeenCalledWith();
      const helpOutput = consoleSpy.log.mock.calls[0][0];
      expect(helpOutput).toContain("🎯 Interactive Script Runner");
      expect(helpOutput).toContain("Usage:");
      expect(helpOutput).toContain("Categories:");
      expect(helpOutput).toContain("Examples:");
    });
  });

  describe("listAllCommands", () => {
    test("should list all available commands organized by category", () => {
      runner.listAllCommands();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n📋 All Available Commands\\n"
      );

      // Check that categories and commands are displayed
      const logCalls = consoleSpy.log.mock.calls.map((call) => call[0]);
      const allOutput = logCalls.join(" ");

      expect(allOutput).toContain("🚀 Development Commands");
      expect(allOutput).toContain("🧪 Testing Commands");
    });
  });

  describe("showInteractiveMenu", () => {
    test("should display interactive menu with categories", () => {
      runner.showInteractiveMenu();

      const logCalls = consoleSpy.log.mock.calls.map((call) => call[0]);
      const allOutput = logCalls.join(" ");

      expect(allOutput).toContain("🎯 Interactive Script Runner");
      expect(allOutput).toContain("Available categories:");
      expect(allOutput).toContain("1. 🚀 Development Commands");
      expect(allOutput).toContain("2. 🧪 Testing Commands");
    });
  });

  describe("showCategory", () => {
    test("should display commands for valid category", () => {
      runner.showCategory("test");

      const logCalls = consoleSpy.log.mock.calls.map((call) => call[0]);
      const allOutput = logCalls.join(" ");

      expect(allOutput).toContain("🧪 Testing Commands");
      expect(allOutput).toContain("bun run script test unit");
      expect(allOutput).toContain("bun run script test all");
    });

    test("should handle case-insensitive category names", () => {
      runner.showCategory("TEST");

      const logCalls = consoleSpy.log.mock.calls.map((call) => call[0]);
      const allOutput = logCalls.join(" ");

      expect(allOutput).toContain("🧪 Testing Commands");
    });

    test("should exit with error for invalid category", () => {
      expect(() => {
        runner.showCategory("invalid");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Unknown category: invalid"
      );
    });
  });

  describe("executeCommand", () => {
    test("should execute valid command successfully", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("test", "unit");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Run unit tests with Vitest\\n"
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "🔧 Command: bun vitest --config config/testing/vitest.config.ts\\n"
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts",
        {
          cwd: process.cwd(),
          stdio: "inherit",
        }
      );
    });

    test("should handle case-insensitive category and command names", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("TEST", "UNIT");

      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts",
        {
          cwd: process.cwd(),
          stdio: "inherit",
        }
      );
    });

    test("should exit with error for invalid category", () => {
      expect(() => {
        runner.executeCommand("invalid", "action");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Unknown category: invalid"
      );
    });

    test("should exit with error for invalid command", () => {
      expect(() => {
        runner.executeCommand("test", "invalid");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Unknown command: invalid in category test"
      );
    });

    test("should handle command execution failure", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("Command failed");
      });

      expect(() => {
        runner.executeCommand("test", "unit");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Command failed: Error: Command failed"
      );
    });

    test("should handle --all flag as action", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("test", "--all");

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  🧪 Run all tests\\n");
    });

    test("should handle --all flag in flags array", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("test", "unit", ["--all"]);

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  🧪 Run all tests\\n");
    });
  });

  describe("executeAllInCategory", () => {
    test("should execute 'all' command if it exists", () => {
      mockExecSync.mockReturnValue("success");

      const testCategory = {
        commands: [
          {
            command: "vitest && playwright test",
            description: "Run all tests",
            name: "all",
          },
        ],
        description: "Testing Commands",
        icon: "🧪",
        name: "test",
      };

      runner.executeAllInCategory(testCategory);

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  🧪 Run all tests\\n");
    });

    test("should execute all commands individually if no 'all' command exists", () => {
      mockExecSync.mockReturnValue("success");

      const testCategory = {
        commands: [
          { command: "vitest", description: "Run unit tests", name: "unit" },
          {
            command: "playwright test",
            description: "Run E2E tests",
            name: "e2e",
          },
        ],
        description: "Testing Commands",
        icon: "🧪",
        name: "test",
      };

      runner.executeAllInCategory(testCategory);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Running all Testing Commands...\\n"
      );
      expect(mockExecSync).toHaveBeenCalledWith("vitest", expect.any(Object));
      expect(mockExecSync).toHaveBeenCalledWith(
        "playwright test",
        expect.any(Object)
      );
    });

    test("should stop execution on first failure when running individual commands", () => {
      mockExecSync.mockReturnValueOnce("success").mockImplementationOnce(() => {
        throw new Error("Command failed");
      });

      const testCategory = {
        commands: [
          { command: "vitest", description: "Run unit tests", name: "unit" },
          {
            command: "playwright test",
            description: "Run E2E tests",
            name: "e2e",
          },
        ],
        description: "Testing Commands",
        icon: "🧪",
        name: "test",
      };

      expect(() => {
        runner.executeAllInCategory(testCategory);
      }).toThrow("process.exit unexpectedly called");
    });

    test("should handle 'all' command failure", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("All command failed");
      });

      const testCategory = {
        commands: [
          {
            command: "vitest && playwright test",
            description: "Run all tests",
            name: "all",
          },
        ],
        description: "Testing Commands",
        icon: "🧪",
        name: "test",
      };

      expect(() => {
        runner.executeAllInCategory(testCategory);
      }).toThrow("process.exit unexpectedly called");
    });
  });

  describe("run", () => {
    test("should call showHelp for help mode", () => {
      const showHelpSpy = vi
        .spyOn(runner, "showHelp")
        .mockImplementation(() => {});
      vi.spyOn(runner, "parseArgs").mockReturnValue({
        flags: [],
        mode: "help",
      });

      runner.run();

      expect(showHelpSpy).toHaveBeenCalledWith();
    });

    test("should call listAllCommands for list mode", () => {
      const listAllCommandsSpy = vi
        .spyOn(runner, "listAllCommands")
        .mockImplementation(() => {});
      vi.spyOn(runner, "parseArgs").mockReturnValue({
        flags: [],
        mode: "list",
      });

      runner.run();

      expect(listAllCommandsSpy).toHaveBeenCalledWith();
    });

    test("should call showInteractiveMenu for interactive mode", () => {
      const showInteractiveMenuSpy = vi
        .spyOn(runner, "showInteractiveMenu")
        .mockImplementation(async () => {});
      vi.spyOn(runner, "parseArgs").mockReturnValue({
        flags: [],
        mode: "interactive",
      });

      runner.run();

      expect(showInteractiveMenuSpy).toHaveBeenCalledWith();
    });

    test("should call showCategory for category mode", () => {
      const showCategorySpy = vi
        .spyOn(runner, "showCategory")
        .mockImplementation(async () => {});
      vi.spyOn(runner, "parseArgs").mockReturnValue({
        category: "test",
        flags: [],
        mode: "category",
      });

      runner.run();

      expect(showCategorySpy).toHaveBeenCalledWith("test");
    });

    test("should call executeCommand for direct mode", () => {
      const executeCommandSpy = vi
        .spyOn(runner, "executeCommand")
        .mockImplementation(() => {});
      vi.spyOn(runner, "parseArgs").mockReturnValue({
        action: "unit",
        category: "test",
        flags: [],
        mode: "direct",
      });

      runner.run();

      expect(executeCommandSpy).toHaveBeenCalledWith("test", "unit", []);
    });

    test("should call showHelp for default case", () => {
      const showHelpSpy = vi
        .spyOn(runner, "showHelp")
        .mockImplementation(() => {});
      vi.spyOn(runner, "parseArgs").mockReturnValue({
        flags: [],
        mode: "unknown" as unknown as
          | "category"
          | "direct"
          | "help"
          | "interactive"
          | "list",
      });

      runner.run();

      expect(showHelpSpy).toHaveBeenCalledWith();
    });
  });

  describe("integration scenarios", () => {
    test("should handle complete workflow for running unit tests", () => {
      mockExecSync.mockReturnValue("success");
      process.argv = ["bun", "script", "test", "unit"];

      runner.run();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Run unit tests with Vitest\\n"
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts",
        {
          cwd: process.cwd(),
          stdio: "inherit",
        }
      );
    });

    test("should handle complete workflow for running all tests in category", () => {
      mockExecSync.mockReturnValue("success");
      process.argv = ["bun", "script", "test", "--all"];

      runner.run();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Run all tests (unit + E2E)\\n"
      );
    });

    test("should handle edge case with mixed case category and command", () => {
      mockExecSync.mockReturnValue("success");
      process.argv = ["bun", "script", "QUALITY", "lint"];

      runner.run();

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  ✨ Run ESLint\\n");
    });
  });

  describe("error handling and edge cases", () => {
    test("should gracefully handle empty category list", () => {
      // Create runner with empty categories for this test
      const emptyRunner = new ScriptRunner();
      (emptyRunner as unknown as { categories: unknown[] }).categories = [];

      expect(() => {
        emptyRunner.showCategory("test");
      }).toThrow("process.exit unexpectedly called");
    });

    test("should handle complex command strings with special characters", () => {
      mockExecSync.mockReturnValue("success");

      // This tests that commands with special chars like && are handled properly
      runner.executeCommand("test", "all");

      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts && playwright test --config config/testing/playwright.config.ts",
        expect.any(Object)
      );
    });

    test("should handle all flag shortcuts end-to-end", () => {
      mockExecSync.mockReturnValue("success");

      const shortcuts = [
        {
          category: "test",
          expectedCommand:
            "playwright test --config config/testing/playwright.config.ts",
          flag: "--e2e",
        },
        {
          category: "test",
          expectedCommand:
            "bun vitest --config config/testing/vitest.config.ts",
          flag: "--unit",
        },
        {
          category: "test",
          expectedCommand:
            "bun vitest --config config/testing/vitest.config.ts --watch",
          flag: "--watch",
        },
        {
          category: "dev",
          expectedCommand: "bun run next build",
          flag: "--build",
        },
        {
          category: "quality",
          expectedCommand: "bun run next lint",
          flag: "--lint",
        },
      ];

      for (const { category, expectedCommand, flag } of shortcuts) {
        mockExecSync.mockClear();
        process.argv = ["bun", "script", category, flag];

        runner.run();

        expect(mockExecSync).toHaveBeenCalledWith(
          expectedCommand,
          expect.any(Object)
        );
      }
    });

    test("should maintain proper working directory context", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("test", "unit");

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cwd: process.cwd(),
        })
      );
    });
  });
});
