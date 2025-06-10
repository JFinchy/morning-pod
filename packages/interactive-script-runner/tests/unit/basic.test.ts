import { describe, it, expect } from "vitest";

describe("Basic Test Setup", () => {
  it("should run basic tests", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle async tests", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });

  it("should handle object comparison", () => {
    const obj = { name: "test", value: 42 };
    expect(obj).toEqual({ name: "test", value: 42 });
  });
});
