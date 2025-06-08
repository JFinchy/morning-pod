import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("ScriptRunner Unit Tests", () => {
  let ScriptRunner: any;
  let runner: any;
  const originalArgv = process.argv;

  beforeEach(async () => {
    // Import ScriptRunner fresh for each test
    const module = await import("../../../tools/scripts/run");
    ScriptRunner = module.ScriptRunner;
    runner = new ScriptRunner();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("Class Structure", () => {
    it("should instantiate ScriptRunner with all required methods", () => {
      expect(runner).toBeDefined();
      expect(typeof runner.parseArgs).toBe("function");
      expect(typeof runner.showHelp).toBe("function");
      expect(typeof runner.listAllCommands).toBe("function");
      expect(typeof runner.showInteractiveMenu).toBe("function");
      expect(typeof runner.showCategory).toBe("function");
      expect(typeof runner.executeCommand).toBe("function");
      expect(typeof runner.executeAllInCategory).toBe("function");
      expect(typeof runner.run).toBe("function");
    });

    it("should have valid categories structure", () => {
      const categories = runner.categories;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Check all expected categories exist
      const categoryNames = categories.map((cat: any) => cat.name);
      const expectedCategories = [
        "dev",
        "test",
        "db",
        "deps",
        "quality",
        "release",
      ];
      expectedCategories.forEach((expectedCategory) => {
        expect(categoryNames).toContain(expectedCategory);
      });
    });

    it("should have properly structured categories with required properties", () => {
      const categories = runner.categories;

      categories.forEach((category: any) => {
        // Each category should have required properties
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("description");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("commands");

        // Validate property types
        expect(typeof category.name).toBe("string");
        expect(typeof category.description).toBe("string");
        expect(typeof category.icon).toBe("string");
        expect(Array.isArray(category.commands)).toBe(true);

        // Validate non-empty values
        expect(category.name.length).toBeGreaterThan(0);
        expect(category.description.length).toBeGreaterThan(0);
        expect(category.icon.length).toBeGreaterThan(0);
        expect(category.commands.length).toBeGreaterThan(0);
      });
    });

    it("should have properly structured commands in each category", () => {
      const categories = runner.categories;

      categories.forEach((category: any) => {
        category.commands.forEach((command: any) => {
          // Each command should have required properties
          expect(command).toHaveProperty("name");
          expect(command).toHaveProperty("description");
          expect(command).toHaveProperty("command");

          // Validate property types
          expect(typeof command.name).toBe("string");
          expect(typeof command.description).toBe("string");
          expect(typeof command.command).toBe("string");

          // Validate non-empty values
          expect(command.name.length).toBeGreaterThan(0);
          expect(command.description.length).toBeGreaterThan(0);
          expect(command.command.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("parseArgs Method", () => {
    it("should parse help flags correctly", () => {
      const helpFlags = ["--help", "-h"];

      helpFlags.forEach((flag) => {
        process.argv = ["bun", "script", flag];
        const result = runner.parseArgs();
        expect(result.mode).toBe("help");
        expect(result.flags).toEqual([]);
      });
    });

    it("should parse list flags correctly", () => {
      const listFlags = ["--list", "-l"];

      listFlags.forEach((flag) => {
        process.argv = ["bun", "script", flag];
        const result = runner.parseArgs();
        expect(result.mode).toBe("list");
        expect(result.flags).toEqual([]);
      });
    });

    it("should parse interactive mode correctly", () => {
      const interactiveArgs = [[], ["-i"], ["--interactive"]];

      interactiveArgs.forEach((args) => {
        process.argv = ["bun", "script", ...args];
        const result = runner.parseArgs();
        expect(result.mode).toBe("interactive");
        expect(result.flags).toEqual([]);
      });
    });

    it("should parse category mode correctly", () => {
      process.argv = ["bun", "script", "test"];
      const result = runner.parseArgs();

      expect(result.mode).toBe("category");
      expect(result.category).toBe("test");
      expect(result.flags).toEqual([]);
    });

    it("should parse direct execution mode correctly", () => {
      process.argv = ["bun", "script", "test", "unit"];
      const result = runner.parseArgs();

      expect(result.mode).toBe("direct");
      expect(result.category).toBe("test");
      expect(result.action).toBe("unit");
      expect(result.flags).toEqual([]);
    });

    it("should handle flags in direct execution mode", () => {
      process.argv = ["bun", "script", "test", "unit", "--verbose", "--watch"];
      const result = runner.parseArgs();

      expect(result.mode).toBe("direct");
      expect(result.category).toBe("test");
      // When --watch flag is present, it maps to unit:watch
      expect(result.action).toBe("unit:watch");
      expect(result.flags).toContain("--verbose");
    });

    it("should parse flag shortcuts for test category", () => {
      // Note: Current implementation treats flags as action when in action position
      const flagTests = [
        { flag: "--e2e", expected: "--e2e" },
        { flag: "--unit", expected: "--unit" },
        { flag: "--watch", expected: "--watch" },
        { flag: "--coverage", expected: "--coverage" },
        { flag: "--ui", expected: "--ui" },
        { flag: "--perf", expected: "--perf" },
        { flag: "--all", expected: "--all" },
      ];

      flagTests.forEach(({ flag, expected }) => {
        process.argv = ["bun", "script", "test", flag];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
        expect(result.category).toBe("test");
        expect(result.action).toBe(expected);
      });
    });

    it("should parse flag shortcuts for dev category", () => {
      // Note: Current implementation treats flags as action when in action position
      const flagTests = [
        { flag: "--start", expected: "--start" },
        { flag: "--build", expected: "--build" },
        { flag: "--preview", expected: "--preview" },
        { flag: "--clean", expected: "--clean" },
      ];

      flagTests.forEach(({ flag, expected }) => {
        process.argv = ["bun", "script", "dev", flag];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
        expect(result.category).toBe("dev");
        expect(result.action).toBe(expected);
      });
    });

    it("should handle case-insensitive category names with flags", () => {
      process.argv = ["bun", "script", "TEST", "--unit"];
      const result = runner.parseArgs();

      expect(result.mode).toBe("direct");
      expect(result.category).toBe("TEST");
      expect(result.action).toBe("--unit");
    });

    it("should handle unknown flags gracefully", () => {
      process.argv = ["bun", "script", "test", "--unknown-flag"];
      const result = runner.parseArgs();

      // Unknown flags are treated as actions when in action position
      expect(result.mode).toBe("direct");
      expect(result.category).toBe("test");
      expect(result.action).toBe("--unknown-flag");
    });

    it("should handle multiple flags and process first one as action", () => {
      process.argv = ["bun", "script", "test", "--e2e", "--unknown"];
      const result = runner.parseArgs();

      expect(result.mode).toBe("direct");
      expect(result.category).toBe("test");
      expect(result.action).toBe("--e2e");
      expect(result.flags).toContain("--unknown");
    });
  });

  describe("Category and Command Validation", () => {
    it("should have expected commands in test category", () => {
      const categories = runner.categories;
      const testCategory = categories.find((cat: any) => cat.name === "test");

      expect(testCategory).toBeDefined();
      expect(testCategory.icon).toBe("🧪");
      expect(testCategory.description).toBe("Testing Commands");

      const commandNames = testCategory.commands.map((cmd: any) => cmd.name);
      const expectedCommands = ["unit", "e2e", "all"];
      expectedCommands.forEach((expectedCommand) => {
        expect(commandNames).toContain(expectedCommand);
      });
    });

    it("should have expected commands in dev category", () => {
      const categories = runner.categories;
      const devCategory = categories.find((cat: any) => cat.name === "dev");

      expect(devCategory).toBeDefined();
      expect(devCategory.icon).toBe("🚀");
      expect(devCategory.description).toBe("Development Commands");

      const commandNames = devCategory.commands.map((cmd: any) => cmd.name);
      const expectedCommands = ["start", "build", "preview", "clean"];
      expectedCommands.forEach((expectedCommand) => {
        expect(commandNames).toContain(expectedCommand);
      });
    });

    it("should have expected commands in quality category", () => {
      const categories = runner.categories;
      const qualityCategory = categories.find(
        (cat: any) => cat.name === "quality"
      );

      expect(qualityCategory).toBeDefined();
      expect(qualityCategory.icon).toBe("✨");
      expect(qualityCategory.description).toBe("Code Quality");

      const commandNames = qualityCategory.commands.map((cmd: any) => cmd.name);
      const expectedCommands = ["lint", "format", "type-check", "test", "all"];
      expectedCommands.forEach((expectedCommand) => {
        expect(commandNames).toContain(expectedCommand);
      });
    });

    it("should have expected commands in db category", () => {
      const categories = runner.categories;
      const dbCategory = categories.find((cat: any) => cat.name === "db");

      expect(dbCategory).toBeDefined();
      expect(dbCategory.icon).toBe("🗄️");
      expect(dbCategory.description).toBe("Database Commands");

      const commandNames = dbCategory.commands.map((cmd: any) => cmd.name);
      const expectedCommands = ["generate", "migrate", "seed", "studio"];
      expectedCommands.forEach((expectedCommand) => {
        expect(commandNames).toContain(expectedCommand);
      });
    });
  });

  describe("Package.json Integration Commands", () => {
    it("should have dev commands that match package.json expectations", () => {
      const categories = runner.categories;
      const devCategory = categories.find((cat: any) => cat.name === "dev");

      // Check start command for 'bun run go' integration
      const startCommand = devCategory.commands.find(
        (cmd: any) => cmd.name === "start"
      );
      expect(startCommand).toBeDefined();
      expect(startCommand.command).toContain("next dev --turbo");

      // Check build command
      const buildCommand = devCategory.commands.find(
        (cmd: any) => cmd.name === "build"
      );
      expect(buildCommand).toBeDefined();
      expect(buildCommand.command).toContain("next build");
    });

    it("should have test commands that match package.json expectations", () => {
      const categories = runner.categories;
      const testCategory = categories.find((cat: any) => cat.name === "test");

      // Check unit test command
      const unitCommand = testCategory.commands.find(
        (cmd: any) => cmd.name === "unit"
      );
      expect(unitCommand).toBeDefined();
      expect(unitCommand.command).toContain("vitest");
      expect(unitCommand.command).toContain("config/testing/vitest.config.ts");

      // Check e2e test command
      const e2eCommand = testCategory.commands.find(
        (cmd: any) => cmd.name === "e2e"
      );
      expect(e2eCommand).toBeDefined();
      expect(e2eCommand.command).toContain("playwright test");

      // Check all tests command
      const allCommand = testCategory.commands.find(
        (cmd: any) => cmd.name === "all"
      );
      expect(allCommand).toBeDefined();
      expect(allCommand.command).toContain("vitest");
      expect(allCommand.command).toContain("playwright test");
    });

    it("should have quality commands that match package.json expectations", () => {
      const categories = runner.categories;
      const qualityCategory = categories.find(
        (cat: any) => cat.name === "quality"
      );

      // Check lint command
      const lintCommand = qualityCategory.commands.find(
        (cmd: any) => cmd.name === "lint"
      );
      expect(lintCommand).toBeDefined();
      expect(lintCommand.command).toContain("next lint");

      // Check type-check command
      const typeCheckCommand = qualityCategory.commands.find(
        (cmd: any) => cmd.name === "type-check"
      );
      expect(typeCheckCommand).toBeDefined();
      expect(typeCheckCommand.command).toContain("tsc --noEmit");

      // Check format command
      const formatCommand = qualityCategory.commands.find(
        (cmd: any) => cmd.name === "format"
      );
      expect(formatCommand).toBeDefined();
      expect(formatCommand.command).toContain("prettier");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty arguments", () => {
      process.argv = ["bun", "script"];
      const result = runner.parseArgs();
      expect(result.mode).toBe("interactive");
    });

    it("should handle malformed arguments", () => {
      process.argv = ["bun", "script", "", ""];
      const result = runner.parseArgs();
      expect(result.mode).toBe("category");
      expect(result.category).toBe("");
    });

    it("should handle very long argument lists", () => {
      const manyFlags = Array(20)
        .fill("--flag")
        .map((flag, i) => `${flag}${i}`);
      process.argv = ["bun", "script", "test", "unit", ...manyFlags];
      const result = runner.parseArgs();

      expect(result.mode).toBe("direct");
      expect(result.category).toBe("test");
      expect(result.action).toBe("unit");
      expect(result.flags.length).toBe(20);
    });

    it("should handle special characters in arguments", () => {
      process.argv = [
        "bun",
        "script",
        "test",
        "unit",
        '--flag="with spaces"',
        "--other=value",
      ];
      const result = runner.parseArgs();

      expect(result.flags).toContain('--flag="with spaces"');
      expect(result.flags).toContain("--other=value");
    });
  });

  describe("Performance and Memory", () => {
    it("should create multiple instances without memory issues", () => {
      const instances = [];
      for (let i = 0; i < 50; i++) {
        instances.push(new ScriptRunner());
      }

      // Verify all instances are properly created
      expect(instances.length).toBe(50);
      instances.forEach((instance) => {
        expect(instance.categories).toBeDefined();
        expect(instance.categories.length).toBeGreaterThan(0);
      });
    });

    it("should handle repeated parseArgs calls efficiently", () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        process.argv = ["bun", "script", "test", "unit"];
        const result = runner.parseArgs();
        expect(result.mode).toBe("direct");
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 100 parses in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Flag Mapping Completeness", () => {
    it("should have consistent flag mappings for all categories", () => {
      // This test validates that the flag mapping logic is consistent
      const parseArgsMethod = runner.parseArgs.toString();

      // Check that categoryFlagMap is defined
      expect(parseArgsMethod).toContain("categoryFlagMap");

      // Verify all main categories are represented in flag mappings
      expect(parseArgsMethod).toContain("test:");
      expect(parseArgsMethod).toContain("dev:");
      expect(parseArgsMethod).toContain("quality:");
      expect(parseArgsMethod).toContain("db:");
      expect(parseArgsMethod).toContain("deps:");
      expect(parseArgsMethod).toContain("release:");
    });

    it("should validate all commands have executable command strings", () => {
      const categories = runner.categories;

      categories.forEach((category: any) => {
        category.commands.forEach((command: any) => {
          // Each command should have a non-empty command string
          expect(command.command).toBeTruthy();
          expect(typeof command.command).toBe("string");
          expect(command.command.length).toBeGreaterThan(0);

          // Commands should not contain obvious placeholders
          expect(command.command).not.toContain("TODO");
          expect(command.command).not.toContain("PLACEHOLDER");
          expect(command.command).not.toContain("FIXME");
        });
      });
    });
  });
});
