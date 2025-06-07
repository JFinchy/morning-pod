import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";

// Mock child_process module
vi.mock("child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("child_process")>();
  return {
    ...actual,
    execSync: vi.fn(),
  };
});

import { ScriptRunner } from "../../../tools/scripts/run";
import { execSync } from "child_process";

// Get the mocked function
const mockExecSync = vi.mocked(execSync);

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
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
    (process.exit as any) = originalExit;
  });

  describe("parseArgs", () => {
    it("should return help mode for --help flag", () => {
      process.argv = ["bun", "script", "--help"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "help", flags: [] });
    });

    it("should return help mode for -h flag", () => {
      process.argv = ["bun", "script", "-h"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "help", flags: [] });
    });

    it("should return list mode for --list flag", () => {
      process.argv = ["bun", "script", "--list"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "list", flags: [] });
    });

    it("should return list mode for -l flag", () => {
      process.argv = ["bun", "script", "-l"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "list", flags: [] });
    });

    it("should return interactive mode for empty args", () => {
      process.argv = ["bun", "script"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "interactive", flags: [] });
    });

    it("should return interactive mode for -i flag", () => {
      process.argv = ["bun", "script", "-i"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "interactive", flags: [] });
    });

    it("should return interactive mode for --interactive flag", () => {
      process.argv = ["bun", "script", "--interactive"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "interactive", flags: [] });
    });

    it("should return category mode for category only", () => {
      process.argv = ["bun", "script", "test"];
      const result = runner.parseArgs();
      expect(result).toEqual({ mode: "category", category: "test", flags: [] });
    });

    it("should return direct mode for category and action", () => {
      process.argv = ["bun", "script", "test", "unit"];
      const result = runner.parseArgs();
      expect(result).toEqual({
        mode: "direct",
        category: "test",
        action: "unit",
        flags: [],
      });
    });

    it("should return direct mode with flags", () => {
      process.argv = ["bun", "script", "test", "unit", "--watch"];
      const result = runner.parseArgs();
      expect(result).toEqual({
        mode: "direct",
        category: "test",
        action: "unit",
        flags: ["--watch"],
      });
    });

    describe("flag shortcuts", () => {
      it("should parse test category flags correctly", () => {
        const testCases = [
          {
            args: ["test", "--e2e"],
            expected: { category: "test", action: "e2e" },
          },
          {
            args: ["test", "--unit"],
            expected: { category: "test", action: "unit" },
          },
          {
            args: ["test", "--watch"],
            expected: { category: "test", action: "unit:watch" },
          },
          {
            args: ["test", "--coverage"],
            expected: { category: "test", action: "unit:coverage" },
          },
          {
            args: ["test", "--ui"],
            expected: { category: "test", action: "unit:ui" },
          },
          {
            args: ["test", "--perf"],
            expected: { category: "test", action: "unit:perf" },
          },
          {
            args: ["test", "--debug"],
            expected: { category: "test", action: "e2e:debug" },
          },
          {
            args: ["test", "--headed"],
            expected: { category: "test", action: "e2e:headed" },
          },
          {
            args: ["test", "--visual"],
            expected: { category: "test", action: "e2e:visual" },
          },
          {
            args: ["test", "--performance"],
            expected: { category: "test", action: "performance" },
          },
          {
            args: ["test", "--all"],
            expected: { category: "test", action: "--all" },
          },
        ];

        testCases.forEach(({ args, expected }) => {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        });
      });

      it("should parse dev category flags correctly", () => {
        const testCases = [
          {
            args: ["dev", "--start"],
            expected: { category: "dev", action: "start" },
          },
          {
            args: ["dev", "--build"],
            expected: { category: "dev", action: "build" },
          },
          {
            args: ["dev", "--preview"],
            expected: { category: "dev", action: "preview" },
          },
          {
            args: ["dev", "--clean"],
            expected: { category: "dev", action: "clean" },
          },
        ];

        testCases.forEach(({ args, expected }) => {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        });
      });

      it("should parse quality category flags correctly", () => {
        const testCases = [
          {
            args: ["quality", "--lint"],
            expected: { category: "quality", action: "lint" },
          },
          {
            args: ["quality", "--fix"],
            expected: { category: "quality", action: "lint:fix" },
          },
          {
            args: ["quality", "--format"],
            expected: { category: "quality", action: "format" },
          },
          {
            args: ["quality", "--check"],
            expected: { category: "quality", action: "format:check" },
          },
          {
            args: ["quality", "--type"],
            expected: { category: "quality", action: "type-check" },
          },
          {
            args: ["quality", "--all"],
            expected: { category: "quality", action: "all" },
          },
        ];

        testCases.forEach(({ args, expected }) => {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        });
      });

      it("should parse db category flags correctly", () => {
        const testCases = [
          {
            args: ["db", "--generate"],
            expected: { category: "db", action: "generate" },
          },
          {
            args: ["db", "--migrate"],
            expected: { category: "db", action: "migrate" },
          },
          {
            args: ["db", "--seed"],
            expected: { category: "db", action: "seed" },
          },
          {
            args: ["db", "--studio"],
            expected: { category: "db", action: "studio" },
          },
        ];

        testCases.forEach(({ args, expected }) => {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        });
      });

      it("should parse deps category flags correctly", () => {
        const testCases = [
          {
            args: ["deps", "--check"],
            expected: { category: "deps", action: "check" },
          },
          {
            args: ["deps", "--patch"],
            expected: { category: "deps", action: "update:patch" },
          },
          {
            args: ["deps", "--minor"],
            expected: { category: "deps", action: "update:minor" },
          },
          {
            args: ["deps", "--major"],
            expected: { category: "deps", action: "update:major" },
          },
          {
            args: ["deps", "--safe"],
            expected: { category: "deps", action: "update:safe" },
          },
          {
            args: ["deps", "--doctor"],
            expected: { category: "deps", action: "doctor" },
          },
          {
            args: ["deps", "--outdated"],
            expected: { category: "deps", action: "outdated" },
          },
        ];

        testCases.forEach(({ args, expected }) => {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        });
      });

      it("should parse release category flags correctly", () => {
        const testCases = [
          {
            args: ["release", "--changeset"],
            expected: { category: "release", action: "changeset" },
          },
          {
            args: ["release", "--version"],
            expected: { category: "release", action: "version" },
          },
          {
            args: ["release", "--publish"],
            expected: { category: "release", action: "publish" },
          },
          {
            args: ["release", "--status"],
            expected: { category: "release", action: "status" },
          },
          {
            args: ["release", "--release"],
            expected: { category: "release", action: "release" },
          },
        ];

        testCases.forEach(({ args, expected }) => {
          process.argv = ["bun", "script", ...args];
          const result = runner.parseArgs();
          expect(result.mode).toBe("direct");
          expect(result.category).toBe(expected.category);
          expect(result.action).toBe(expected.action);
        });
      });

      it("should handle unknown flags gracefully", () => {
        process.argv = ["bun", "script", "test", "--unknown"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("category");
        expect(result.category).toBe("test");
        expect(result.flags).toContain("--unknown");
      });

      it("should handle multiple flags and process first recognized one", () => {
        process.argv = ["bun", "script", "test", "--e2e", "--unknown"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
        expect(result.category).toBe("test");
        expect(result.action).toBe("e2e");
        expect(result.flags).toContain("--unknown");
        expect(result.flags).not.toContain("--e2e");
      });

      it("should handle case-insensitive category names with flags", () => {
        process.argv = ["bun", "script", "TEST", "--unit"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
        expect(result.category).toBe("TEST");
        expect(result.action).toBe("unit");
      });

      it("should fall back to normal parsing for categories without flag mappings", () => {
        process.argv = ["bun", "script", "unknown-category", "--flag"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("category");
        expect(result.category).toBe("unknown-category");
        expect(result.flags).toContain("--flag");
      });
    });
  });

  describe("showHelp", () => {
    it("should display help information", () => {
      runner.showHelp();

      expect(consoleSpy.log).toHaveBeenCalled();
      const helpOutput = consoleSpy.log.mock.calls[0][0];
      expect(helpOutput).toContain("🎯 Interactive Script Runner");
      expect(helpOutput).toContain("Usage:");
      expect(helpOutput).toContain("Categories:");
      expect(helpOutput).toContain("Examples:");
    });
  });

  describe("listAllCommands", () => {
    it("should list all available commands organized by category", () => {
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
    it("should display interactive menu with categories", () => {
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
    it("should display commands for valid category", () => {
      runner.showCategory("test");

      const logCalls = consoleSpy.log.mock.calls.map((call) => call[0]);
      const allOutput = logCalls.join(" ");

      expect(allOutput).toContain("🧪 Testing Commands");
      expect(allOutput).toContain("bun run script test unit");
      expect(allOutput).toContain("bun run script test all");
    });

    it("should handle case-insensitive category names", () => {
      runner.showCategory("TEST");

      const logCalls = consoleSpy.log.mock.calls.map((call) => call[0]);
      const allOutput = logCalls.join(" ");

      expect(allOutput).toContain("🧪 Testing Commands");
    });

    it("should exit with error for invalid category", () => {
      expect(() => {
        runner.showCategory("invalid");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Unknown category: invalid"
      );
    });
  });

  describe("executeCommand", () => {
    it("should execute valid command successfully", () => {
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
          stdio: "inherit",
          cwd: process.cwd(),
        }
      );
    });

    it("should handle case-insensitive category and command names", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("TEST", "UNIT");

      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts",
        {
          stdio: "inherit",
          cwd: process.cwd(),
        }
      );
    });

    it("should exit with error for invalid category", () => {
      expect(() => {
        runner.executeCommand("invalid", "action");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Unknown category: invalid"
      );
    });

    it("should exit with error for invalid command", () => {
      expect(() => {
        runner.executeCommand("test", "invalid");
      }).toThrow("process.exit unexpectedly called");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "❌ Unknown command: invalid in category test"
      );
    });

    it("should handle command execution failure", () => {
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

    it("should handle --all flag as action", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("test", "--all");

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  🧪 Run all tests\\n");
    });

    it("should handle --all flag in flags array", () => {
      mockExecSync.mockReturnValue("success");

      runner.executeCommand("test", "unit", ["--all"]);

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  🧪 Run all tests\\n");
    });
  });

  describe("executeAllInCategory", () => {
    it("should execute 'all' command if it exists", () => {
      mockExecSync.mockReturnValue("success");

      const testCategory = {
        name: "test",
        description: "Testing Commands",
        icon: "🧪",
        commands: [
          {
            name: "all",
            description: "Run all tests",
            command: "vitest && playwright test",
          },
        ],
      };

      runner.executeAllInCategory(testCategory);

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  🧪 Run all tests\\n");
    });

    it("should execute all commands individually if no 'all' command exists", () => {
      mockExecSync.mockReturnValue("success");

      const testCategory = {
        name: "test",
        description: "Testing Commands",
        icon: "🧪",
        commands: [
          { name: "unit", description: "Run unit tests", command: "vitest" },
          {
            name: "e2e",
            description: "Run E2E tests",
            command: "playwright test",
          },
        ],
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

    it("should stop execution on first failure when running individual commands", () => {
      mockExecSync.mockReturnValueOnce("success").mockImplementationOnce(() => {
        throw new Error("Command failed");
      });

      const testCategory = {
        name: "test",
        description: "Testing Commands",
        icon: "🧪",
        commands: [
          { name: "unit", description: "Run unit tests", command: "vitest" },
          {
            name: "e2e",
            description: "Run E2E tests",
            command: "playwright test",
          },
        ],
      };

      expect(() => {
        runner.executeAllInCategory(testCategory);
      }).toThrow("process.exit unexpectedly called");
    });

    it("should handle 'all' command failure", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("All command failed");
      });

      const testCategory = {
        name: "test",
        description: "Testing Commands",
        icon: "🧪",
        commands: [
          {
            name: "all",
            description: "Run all tests",
            command: "vitest && playwright test",
          },
        ],
      };

      expect(() => {
        runner.executeAllInCategory(testCategory);
      }).toThrow("process.exit unexpectedly called");
    });
  });

  describe("run", () => {
    it("should call showHelp for help mode", () => {
      const showHelpSpy = vi
        .spyOn(runner, "showHelp")
        .mockImplementation(() => {});
      const parseArgsSpy = vi
        .spyOn(runner, "parseArgs")
        .mockReturnValue({ mode: "help", flags: [] });

      runner.run();

      expect(showHelpSpy).toHaveBeenCalled();
    });

    it("should call listAllCommands for list mode", () => {
      const listAllCommandsSpy = vi
        .spyOn(runner, "listAllCommands")
        .mockImplementation(() => {});
      const parseArgsSpy = vi
        .spyOn(runner, "parseArgs")
        .mockReturnValue({ mode: "list", flags: [] });

      runner.run();

      expect(listAllCommandsSpy).toHaveBeenCalled();
    });

    it("should call showInteractiveMenu for interactive mode", () => {
      const showInteractiveMenuSpy = vi
        .spyOn(runner, "showInteractiveMenu")
        .mockImplementation(() => {});
      const parseArgsSpy = vi
        .spyOn(runner, "parseArgs")
        .mockReturnValue({ mode: "interactive", flags: [] });

      runner.run();

      expect(showInteractiveMenuSpy).toHaveBeenCalled();
    });

    it("should call showCategory for category mode", () => {
      const showCategorySpy = vi
        .spyOn(runner, "showCategory")
        .mockImplementation(() => {});
      const parseArgsSpy = vi.spyOn(runner, "parseArgs").mockReturnValue({
        mode: "category",
        category: "test",
        flags: [],
      });

      runner.run();

      expect(showCategorySpy).toHaveBeenCalledWith("test");
    });

    it("should call executeCommand for direct mode", () => {
      const executeCommandSpy = vi
        .spyOn(runner, "executeCommand")
        .mockImplementation(() => {});
      const parseArgsSpy = vi.spyOn(runner, "parseArgs").mockReturnValue({
        mode: "direct",
        category: "test",
        action: "unit",
        flags: [],
      });

      runner.run();

      expect(executeCommandSpy).toHaveBeenCalledWith("test", "unit", []);
    });

    it("should call showHelp for default case", () => {
      const showHelpSpy = vi
        .spyOn(runner, "showHelp")
        .mockImplementation(() => {});
      const parseArgsSpy = vi.spyOn(runner, "parseArgs").mockReturnValue({
        mode: "unknown" as any,
        flags: [],
      });

      runner.run();

      expect(showHelpSpy).toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete workflow for running unit tests", () => {
      mockExecSync.mockReturnValue("success");
      process.argv = ["bun", "script", "test", "unit"];

      runner.run();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Run unit tests with Vitest\\n"
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts",
        {
          stdio: "inherit",
          cwd: process.cwd(),
        }
      );
    });

    it("should handle complete workflow for running all tests in category", () => {
      mockExecSync.mockReturnValue("success");
      process.argv = ["bun", "script", "test", "--all"];

      runner.run();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "\\n▶️  🧪 Run all tests (unit + E2E)\\n"
      );
    });

    it("should handle edge case with mixed case category and command", () => {
      mockExecSync.mockReturnValue("success");
      process.argv = ["bun", "script", "QUALITY", "lint"];

      runner.run();

      expect(consoleSpy.log).toHaveBeenCalledWith("\\n▶️  ✨ Run ESLint\\n");
    });
  });

  describe("error handling and edge cases", () => {
    it("should gracefully handle empty category list", () => {
      // Create runner with empty categories for this test
      const emptyRunner = new ScriptRunner();
      (emptyRunner as any).categories = [];

      expect(() => {
        emptyRunner.showCategory("test");
      }).toThrow("process.exit unexpectedly called");
    });

    it("should handle complex command strings with special characters", () => {
      mockExecSync.mockReturnValue("success");

      // This tests that commands with special chars like && are handled properly
      runner.executeCommand("test", "all");

      expect(mockExecSync).toHaveBeenCalledWith(
        "bun vitest --config config/testing/vitest.config.ts && playwright test --config config/testing/playwright.config.ts",
        expect.any(Object)
      );
    });

    it("should handle all flag shortcuts end-to-end", () => {
      mockExecSync.mockReturnValue("success");

      const shortcuts = [
        {
          category: "test",
          flag: "--e2e",
          expectedCommand:
            "playwright test --config config/testing/playwright.config.ts",
        },
        {
          category: "test",
          flag: "--unit",
          expectedCommand:
            "bun vitest --config config/testing/vitest.config.ts",
        },
        {
          category: "test",
          flag: "--watch",
          expectedCommand:
            "bun vitest --config config/testing/vitest.config.ts --watch",
        },
        {
          category: "dev",
          flag: "--build",
          expectedCommand: "bun run next build",
        },
        {
          category: "quality",
          flag: "--lint",
          expectedCommand: "bun run next lint",
        },
      ];

      shortcuts.forEach(({ category, flag, expectedCommand }) => {
        mockExecSync.mockClear();
        process.argv = ["bun", "script", category, flag];

        runner.run();

        expect(mockExecSync).toHaveBeenCalledWith(
          expectedCommand,
          expect.any(Object)
        );
      });
    });

    it("should maintain proper working directory context", () => {
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
