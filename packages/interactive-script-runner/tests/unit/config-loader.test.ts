import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigLoader } from "@/config/loader";
import type { ScriptConfig } from "@/types";

// Mock the fs module
vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe("ConfigLoader", () => {
  let loader: ConfigLoader;
  const mockCwd = "/mock/project";

  beforeEach(() => {
    vi.clearAllMocks();
    loader = new ConfigLoader(mockCwd);
  });

  describe("Configuration Loading", () => {
    it("should generate template when no config file exists", async () => {
      const mockPackageJson = {
        name: "test-project",
        dependencies: {
          next: "^14.0.0",
        },
      };

      // Mock file system
      const fs = await import("fs");
      const existsSyncMock = vi.fn();
      const readFileSyncMock = vi.fn();

      existsSyncMock.mockImplementation((path: any) => {
        const pathStr = path.toString();
        if (pathStr.includes("package.json")) return true;
        if (pathStr.includes("bun.lockb")) return true;
        if (pathStr.includes("script-runner.config.json")) return false;
        return false;
      });

      readFileSyncMock.mockImplementation((path: any) => {
        if (path.toString().includes("package.json")) {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;
      (fs.readFileSync as any) = readFileSyncMock;

      const config = await loader.loadConfig();

      expect(config.projectName).toBe("test-project");
      expect(config.projectType).toBe("nextjs");
      expect(config.categories.length).toBeGreaterThan(0);
    });

    it("should handle missing package.json gracefully", async () => {
      // Mock file system with no files
      const fs = await import("fs");
      const existsSyncMock = vi.fn().mockReturnValue(false);
      const readFileSyncMock = vi.fn().mockImplementation(() => {
        throw new Error("File not found");
      });

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;
      (fs.readFileSync as any) = readFileSyncMock;

      const config = await loader.loadConfig();

      expect(config.projectType).toBe("generic");
      expect(config.packageManager).toBe("npm");
      expect(config.categories.length).toBeGreaterThan(0);
    });
  });

  describe("Project Type Detection Integration", () => {
    it("should detect Next.js project from package.json", async () => {
      const mockPackageJson = {
        name: "nextjs-app",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
          eslint: "^8.0.0",
          "@playwright/test": "^1.0.0",
        },
      };

      const fs = await import("fs");
      const existsSyncMock = vi.fn();
      const readFileSyncMock = vi.fn();

      existsSyncMock.mockImplementation((path: any) => {
        const pathStr = path.toString();
        if (pathStr.includes("package.json")) return true;
        if (pathStr.includes("bun.lockb")) return true;
        if (pathStr.includes("tsconfig.json")) return true;
        return false;
      });

      readFileSyncMock.mockImplementation((path: any) => {
        if (path.toString().includes("package.json")) {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;
      (fs.readFileSync as any) = readFileSyncMock;

      const config = await loader.loadConfig();

      expect(config.projectType).toBe("nextjs");
      expect(config.packageManager).toBe("bun");

      // Should have development commands
      const devCategory = config.categories.find((cat) => cat.name === "dev");
      expect(devCategory).toBeDefined();
      expect(devCategory?.commands.length).toBeGreaterThan(0);
    });

    it("should detect React project from package.json", async () => {
      const mockPackageJson = {
        name: "react-app",
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
        },
        devDependencies: {
          vite: "^4.0.0",
        },
      };

      const fs = await import("fs");
      const existsSyncMock = vi.fn();
      const readFileSyncMock = vi.fn();

      existsSyncMock.mockImplementation((path: any) => {
        const pathStr = path.toString();
        if (pathStr.includes("package.json")) return true;
        if (pathStr.includes("package-lock.json")) return true;
        return false;
      });

      readFileSyncMock.mockImplementation((path: any) => {
        if (path.toString().includes("package.json")) {
          return JSON.stringify(mockPackageJson);
        }
        return "";
      });

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;
      (fs.readFileSync as any) = readFileSyncMock;

      const config = await loader.loadConfig();

      expect(config.projectType).toBe("react");
      expect(config.packageManager).toBe("npm");
    });
  });

  describe("Package Manager Detection", () => {
    it("should detect package manager from lockfiles", async () => {
      const testCases = [
        { lockfile: "bun.lockb", expected: "bun" },
        { lockfile: "package-lock.json", expected: "npm" },
        { lockfile: "yarn.lock", expected: "yarn" },
        { lockfile: "pnpm-lock.yaml", expected: "pnpm" },
      ];

      for (const testCase of testCases) {
        const fs = await import("fs");
        const existsSyncMock = vi.fn();
        const readFileSyncMock = vi.fn();

        existsSyncMock.mockImplementation((path: any) => {
          const pathStr = path.toString();
          if (pathStr.includes("package.json")) return true;
          if (pathStr.includes(testCase.lockfile)) return true;
          return false;
        });

        readFileSyncMock.mockImplementation((path: any) => {
          if (path.toString().includes("package.json")) {
            return JSON.stringify({ name: "test" });
          }
          return "";
        });

        // Replace the mocked functions
        (fs.existsSync as any) = existsSyncMock;
        (fs.readFileSync as any) = readFileSyncMock;

        const config = await loader.loadConfig();
        expect(config.packageManager).toBe(testCase.expected);
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle JSON parsing errors gracefully", async () => {
      const fs = await import("fs");
      const existsSyncMock = vi.fn();
      const readFileSyncMock = vi.fn();

      existsSyncMock.mockImplementation((path: any) => {
        return path.toString().includes("package.json");
      });

      readFileSyncMock.mockImplementation((path: any) => {
        if (path.toString().includes("package.json")) {
          return "invalid json {";
        }
        return "";
      });

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;
      (fs.readFileSync as any) = readFileSyncMock;

      const config = await loader.loadConfig();

      // Should fallback to generic project
      expect(config.projectType).toBe("generic");
      expect(config.categories.length).toBeGreaterThan(0);
    });

    it("should handle file system errors gracefully", async () => {
      const fs = await import("fs");
      const existsSyncMock = vi.fn().mockImplementation(() => {
        throw new Error("Permission denied");
      });

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;

      const config = await loader.loadConfig();

      // Should fallback to generic project
      expect(config.projectType).toBe("generic");
      expect(config.packageManager).toBe("npm");
      expect(config.categories.length).toBeGreaterThan(0);
    });
  });

  describe("Configuration Processing", () => {
    it("should process and validate configuration structure", async () => {
      const fs = await import("fs");
      const existsSyncMock = vi.fn().mockReturnValue(false);

      // Replace the mocked functions
      (fs.existsSync as any) = existsSyncMock;

      const config = await loader.loadConfig();

      // Verify configuration structure
      expect(config).toHaveProperty("projectType");
      expect(config).toHaveProperty("packageManager");
      expect(config).toHaveProperty("categories");
      expect(Array.isArray(config.categories)).toBe(true);

      // Verify categories have proper structure
      config.categories.forEach((category) => {
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("description");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("commands");
        expect(Array.isArray(category.commands)).toBe(true);

        // Verify commands have proper structure
        category.commands.forEach((command) => {
          expect(command).toHaveProperty("name");
          expect(command).toHaveProperty("command");
          expect(command).toHaveProperty("description");
        });
      });
    });
  });
});
