/**
 * Unit tests for kill-processes script
 * @description Tests the ProcessKiller class functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";

// Mock child_process
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

// Mock @clack/prompts
vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
}));

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
};

// Import the ProcessKiller class (we need to dynamically import it)
let ProcessKiller: any;

beforeEach(async () => {
  vi.clearAllMocks();

  // Dynamic import to avoid issues with mocked modules
  const module = await import("../../../tools/scripts/kill-processes");
  ProcessKiller = (module as any).ProcessKiller;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ProcessKiller", () => {
  let killer: any;

  beforeEach(() => {
    killer = new ProcessKiller();
  });

  describe("findProcesses", () => {
    it("should return empty array when no processes found", () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("No processes found");
      });

      const result = killer.findProcesses();
      expect(result).toEqual([]);
    });

    it("should parse process output correctly", () => {
      const mockOutput = `user     12345  0.1  0.5  12345  67890 s001  S+   10:30AM   0:01.23 node vitest
user     12346  0.2  0.4  23456  78901 s002  S+   10:31AM   0:02.34 bun playwright`;

      vi.mocked(execSync).mockReturnValue(mockOutput);

      const result = killer.findProcesses();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        pid: "12345",
        command: "node vitest",
      });
      expect(result[1]).toEqual({
        pid: "12346",
        command: "bun playwright",
      });
    });

    it("should filter out empty lines", () => {
      const mockOutput = `user     12345  0.1  0.5  12345  67890 s001  S+   10:30AM   0:01.23 node vitest

user     12346  0.2  0.4  23456  78901 s002  S+   10:31AM   0:02.34 bun eslint`;

      vi.mocked(execSync).mockReturnValue(mockOutput);

      const result = killer.findProcesses();
      expect(result).toHaveLength(2);
    });
  });

  describe("killSelectedProcesses", () => {
    const mockProcesses = [
      { pid: "12345", command: "node vitest" },
      { pid: "12346", command: "bun playwright" },
    ];

    it("should kill processes gracefully by default", () => {
      killer.killSelectedProcesses(mockProcesses, false);

      expect(vi.mocked(execSync)).toHaveBeenCalledWith("kill 12345 12346", {
        stdio: "inherit",
      });
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("🔄 Attempting graceful shutdown")
      );
    });

    it("should force kill when requested", () => {
      const forceKillSpy = vi.spyOn(killer, "forceKillPids" as any);
      killer.killSelectedProcesses(mockProcesses, true);

      expect(forceKillSpy).toHaveBeenCalledWith(["12345", "12346"]);
    });

    it("should fallback to force kill on graceful failure", () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error("Kill failed");
      });

      const forceKillSpy = vi.spyOn(killer, "forceKillPids" as any);
      killer.killSelectedProcesses(mockProcesses, false);

      expect(forceKillSpy).toHaveBeenCalledWith(["12345", "12346"]);
    });
  });

  describe("killProcesses", () => {
    it("should log message when no processes found", () => {
      vi.spyOn(killer, "findProcesses").mockReturnValue([]);

      killer.killProcesses();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "✅ No test/lint processes found running"
      );
    });

    it("should attempt graceful kill by default", () => {
      const mockProcesses = [{ pid: "12345", command: "node vitest" }];
      vi.spyOn(killer, "findProcesses").mockReturnValue(mockProcesses);

      killer.killProcesses(false);

      expect(vi.mocked(execSync)).toHaveBeenCalledWith("kill 12345", {
        stdio: "inherit",
      });
    });

    it("should force kill when requested", () => {
      const mockProcesses = [{ pid: "12345", command: "node vitest" }];
      vi.spyOn(killer, "findProcesses").mockReturnValue(mockProcesses);
      const forceKillSpy = vi.spyOn(killer, "forceKillPids" as any);

      killer.killProcesses(true);

      expect(forceKillSpy).toHaveBeenCalledWith(["12345"]);
    });
  });

  describe("listProcesses", () => {
    it("should log message when no processes found", () => {
      vi.spyOn(killer, "findProcesses").mockReturnValue([]);

      killer.listProcesses();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "✅ No test/lint processes currently running"
      );
    });

    it("should list found processes", () => {
      const mockProcesses = [
        { pid: "12345", command: "node vitest --watch" },
        { pid: "12346", command: "bun playwright test" },
      ];
      vi.spyOn(killer, "findProcesses").mockReturnValue(mockProcesses);

      killer.listProcesses();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("Found 2 test/lint processes:")
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "  PID 12345: node vitest --watch"
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "  PID 12346: bun playwright test"
      );
    });
  });

  describe("run method", () => {
    beforeEach(() => {
      // Mock process.argv
      const originalArgv = process.argv;
      afterEach(() => {
        process.argv = originalArgv;
      });
    });

    it("should run listProcesses when --list flag provided", async () => {
      process.argv = ["node", "script.ts", "--list"];
      const listSpy = vi.spyOn(killer, "listProcesses");

      await killer.run();

      expect(listSpy).toHaveBeenCalled();
    });

    it("should run interactive mode by default", async () => {
      process.argv = ["node", "script.ts"];
      const interactiveSpy = vi.spyOn(killer, "killProcessesInteractive");

      await killer.run();

      expect(interactiveSpy).toHaveBeenCalled();
    });

    it("should run killProcesses when --force flag provided", async () => {
      process.argv = ["node", "script.ts", "--force"];
      const killSpy = vi.spyOn(killer, "killProcesses");

      await killer.run();

      expect(killSpy).toHaveBeenCalledWith(true);
    });
  });

  describe("process patterns", () => {
    it("should include test-related patterns", () => {
      expect(killer.processPatterns).toContain("vitest");
      expect(killer.processPatterns).toContain("playwright");
      expect(killer.processPatterns).toContain("eslint");
    });

    it("should include VSCode-related patterns", () => {
      expect(killer.processPatterns).toContain("tsserver");
      expect(killer.processPatterns).toContain("typescript-language-server");
      expect(killer.processPatterns).toContain("vscode-helper");
      expect(killer.processPatterns).toContain("extensionHost");
    });

    it("should include runtime patterns", () => {
      expect(killer.processPatterns).toContain("node.*vitest");
      expect(killer.processPatterns).toContain("bun.*playwright");
      expect(killer.processPatterns).toContain("node.*typescript");
    });
  });
});
