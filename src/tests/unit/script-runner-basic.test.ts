import { describe, it, expect } from "vitest";

// Quick smoke tests to validate script runner can be imported and instantiated
describe("ScriptRunner Smoke Tests", () => {
  it("should import and instantiate ScriptRunner successfully", async () => {
    const { ScriptRunner } = await import("../../../tools/scripts/run");
    expect(ScriptRunner).toBeDefined();
    expect(typeof ScriptRunner).toBe("function");

    const runner = new ScriptRunner();
    expect(runner).toBeDefined();
    expect(typeof runner.parseArgs).toBe("function");
    expect(typeof runner.run).toBe("function");
  });

  it("should have valid category structure", async () => {
    const { ScriptRunner } = await import("../../../tools/scripts/run");
    const runner = new ScriptRunner();

    const categories = (runner as any).categories;
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    // Validate all expected categories exist
    const categoryNames = categories.map((cat: any) => cat.name);
    ["dev", "test", "db", "deps", "quality", "release"].forEach(
      (expectedCategory) => {
        expect(categoryNames).toContain(expectedCategory);
      }
    );
  });

  it("should have valid command structure in each category", async () => {
    const { ScriptRunner } = await import("../../../tools/scripts/run");
    const runner = new ScriptRunner();

    const categories = (runner as any).categories;
    categories.forEach((category: any) => {
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("description");
      expect(category).toHaveProperty("icon");
      expect(category).toHaveProperty("commands");
      expect(Array.isArray(category.commands)).toBe(true);

      category.commands.forEach((command: any) => {
        expect(command).toHaveProperty("name");
        expect(command).toHaveProperty("description");
        expect(command).toHaveProperty("command");
        expect(typeof command.name).toBe("string");
        expect(typeof command.description).toBe("string");
        expect(typeof command.command).toBe("string");
      });
    });
  });

  it("should parse basic argument patterns correctly", async () => {
    const { ScriptRunner } = await import("../../../tools/scripts/run");
    const runner = new ScriptRunner();
    const originalArgv = process.argv;

    try {
      // Test help mode
      process.argv = ["bun", "script", "--help"];
      expect(runner.parseArgs().mode).toBe("help");

      // Test interactive mode
      process.argv = ["bun", "script"];
      expect(runner.parseArgs().mode).toBe("interactive");

      // Test direct mode
      process.argv = ["bun", "script", "test", "unit"];
      const directResult = runner.parseArgs();
      expect(directResult.mode).toBe("direct");
      expect(directResult.category).toBe("test");
      expect(directResult.action).toBe("unit");

      // Test category mode
      process.argv = ["bun", "script", "test"];
      const categoryResult = runner.parseArgs();
      expect(categoryResult.mode).toBe("category");
      expect(categoryResult.category).toBe("test");
    } finally {
      process.argv = originalArgv;
    }
  });
});
