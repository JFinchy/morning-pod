#!/usr/bin/env bun

/**
 * Kill runaway test and lint processes
 *
 * @description Emergency script to kill stuck vitest, playwright, eslint, and related processes
 * @usage bun run tools/scripts/kill-processes.ts [--force]
 */

import { execSync } from "child_process";
import * as p from "@clack/prompts";

interface ProcessInfo {
  pid: string;
  command: string;
}

class ProcessKiller {
  private readonly processPatterns = [
    "vitest",
    "playwright",
    "eslint",
    "next.*lint",
    "node.*vitest",
    "node.*playwright",
    "node.*eslint",
    "bun.*vitest",
    "bun.*playwright",
    "bun.*lint",
    "tsserver",
    "typescript-language-server",
    "vscode-typescript-language-server",
    "node.*typescript",
    "node.*tsserver",
    "extensionHost",
    "vscode-helper",
  ];

  /**
   * Find all matching processes
   */
  findProcesses(): ProcessInfo[] {
    try {
      const pattern = this.processPatterns.join("|");
      const output = execSync(
        `ps aux | grep -E "(${pattern})" | grep -v grep`,
        {
          encoding: "utf8",
        }
      );

      return output
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          return {
            pid: parts[1],
            command: parts.slice(10).join(" "),
          };
        });
    } catch (error) {
      // No processes found or grep failed
      return [];
    }
  }

  /**
   * Interactive process selection and killing
   */
  async killProcessesInteractive(): Promise<void> {
    const processes = this.findProcesses();

    if (processes.length === 0) {
      console.log("✅ No test/lint/VSCode processes found running");
      return;
    }

    p.intro("🎯 Process Killer - Interactive Mode");

    const options = [
      ...processes.map((proc, index) => ({
        value: index.toString(),
        label: `PID ${proc.pid}: ${proc.command.substring(0, 60)}${proc.command.length > 60 ? "..." : ""}`,
      })),
      { value: "all", label: "🔥 Kill ALL processes" },
    ];

    try {
      const selected = await p.multiselect({
        message: "Select processes to kill:",
        options,
        required: false,
      });

      if (!selected || selected.length === 0) {
        p.outro("👋 No processes selected");
        return;
      }

      const killAll = selected.includes("all");
      const selectedProcesses = killAll
        ? processes
        : selected.map((index) => processes[parseInt(index)]).filter(Boolean);

      if (selectedProcesses.length === 0) {
        p.outro("👋 No valid processes selected");
        return;
      }

      const forceKill = await p.confirm({
        message: `Kill ${selectedProcesses.length} process(es) with force (SIGKILL)?`,
        initialValue: false,
      });

      this.killSelectedProcesses(selectedProcesses, forceKill);
      p.outro("✅ Process killing completed");
    } catch (error) {
      p.outro("👋 Cancelled");
    }
  }

  /**
   * Kill specific processes
   */
  killSelectedProcesses(
    processes: ProcessInfo[],
    force: boolean = false
  ): void {
    const pids = processes.map((p) => p.pid);

    console.log(`\n🔍 Killing ${processes.length} processes:`);
    processes.forEach((proc) => {
      console.log(
        `  PID ${proc.pid}: ${proc.command.substring(0, 80)}${proc.command.length > 80 ? "..." : ""}`
      );
    });

    if (!force) {
      console.log("\n🔄 Attempting graceful shutdown (SIGTERM)...");
      try {
        execSync(`kill ${pids.join(" ")}`, { stdio: "inherit" });
        console.log("✅ Graceful kill completed");
      } catch (error) {
        console.log("❌ Graceful kill failed, trying force kill...");
        this.forceKillPids(pids);
      }
    } else {
      this.forceKillPids(pids);
    }
  }

  /**
   * Kill processes gracefully first, then forcefully if needed
   */
  killProcesses(force: boolean = false): void {
    const processes = this.findProcesses();

    if (processes.length === 0) {
      console.log("✅ No test/lint processes found running");
      return;
    }

    console.log(`🔍 Found ${processes.length} processes to kill:`);
    processes.forEach((proc) => {
      console.log(
        `  PID ${proc.pid}: ${proc.command.substring(0, 80)}${proc.command.length > 80 ? "..." : ""}`
      );
    });

    const pids = processes.map((p) => p.pid);

    if (!force) {
      // Try graceful kill first
      console.log("\n🔄 Attempting graceful shutdown (SIGTERM)...");
      try {
        execSync(`kill ${pids.join(" ")}`, { stdio: "inherit" });

        // Wait a moment and check if any are still running
        setTimeout(() => {
          const remaining = this.findProcesses();
          if (remaining.length > 0) {
            console.log(
              `⚠️  ${remaining.length} processes still running, use --force for SIGKILL`
            );
          } else {
            console.log("✅ All processes terminated gracefully");
          }
        }, 2000);
      } catch (error) {
        console.log("❌ Graceful kill failed, trying force kill...");
        this.forceKillPids(pids);
      }
    } else {
      this.forceKillPids(pids);
    }
  }

  /**
   * Force kill with SIGKILL
   */
  private forceKillPids(pids: string[]): void {
    console.log("\n💀 Force killing processes (SIGKILL)...");
    try {
      execSync(`kill -9 ${pids.join(" ")}`, { stdio: "inherit" });
      console.log("✅ Force kill completed");

      // Verify they're gone
      setTimeout(() => {
        const remaining = this.findProcesses();
        if (remaining.length === 0) {
          console.log("✅ All processes successfully terminated");
        } else {
          console.log(
            `⚠️  ${remaining.length} processes still running (may require sudo)`
          );
        }
      }, 1000);
    } catch (error) {
      console.log("❌ Force kill failed, you may need to run with sudo");
      console.log("Try: sudo bun run tools/scripts/kill-processes.ts --force");
    }
  }

  /**
   * Show current test/lint processes without killing
   */
  listProcesses(): void {
    const processes = this.findProcesses();

    if (processes.length === 0) {
      console.log("✅ No test/lint processes currently running");
      return;
    }

    console.log(`🔍 Found ${processes.length} test/lint processes:`);
    processes.forEach((proc) => {
      console.log(`  PID ${proc.pid}: ${proc.command}`);
    });
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const force = args.includes("--force");
    const list = args.includes("--list");
    const interactive =
      args.includes("--interactive") ||
      args.includes("-i") ||
      args.length === 0;

    console.log("🎯 Process Killer - Test & Lint & VSCode Cleanup\n");

    if (list) {
      this.listProcesses();
    } else if (interactive) {
      await this.killProcessesInteractive();
    } else {
      this.killProcesses(force);
    }
  }
}

// Show help
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🎯 Process Killer - Kill runaway test, lint, and VSCode processes

Usage:
  bun run tools/scripts/kill-processes.ts             # Interactive mode (default)
  bun run tools/scripts/kill-processes.ts -i          # Interactive mode  
  bun run tools/scripts/kill-processes.ts --force     # Force kill all (SIGKILL)
  bun run tools/scripts/kill-processes.ts --list      # List processes without killing

Targets:
  - vitest processes
  - playwright processes  
  - eslint processes
  - TypeScript language server
  - VSCode helper processes
  - Related node/bun processes

Examples:
  bun run tools/scripts/kill-processes.ts             # Interactive selection
  bun run tools/scripts/kill-processes.ts --force     # Immediate force kill all
  bun run tools/scripts/kill-processes.ts --list      # Just show what's running
`);
  process.exit(0);
}

// Run the script only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const killer = new ProcessKiller();
  killer.run().catch((error) => {
    console.error("Process killer failed:", error);
    process.exit(1);
  });
}
