#!/usr/bin/env bun

/**
 * Automated dependency update management script
 *
 * @description Handles safe dependency updates with automated testing
 * @business-context Prevents breaking changes while keeping dependencies current
 *                   for security patches and performance improvements
 * @decision-date 2024-01-22
 * @decision-by Development team for automated dependency management
 *
 * @usage
 * bun run scripts/update-dependencies.ts [options]
 *
 * Options:
 * --check        Check for available updates without applying
 * --patch        Update only patch versions (safe)
 * --minor        Update minor and patch versions (mostly safe)
 * --major        Show major version updates (requires manual review)
 * --interactive  Interactive mode for selecting updates
 * --doctor       Use ncu doctor mode for safe automated updates
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

interface UpdateOptions {
  check?: boolean;
  patch?: boolean;
  minor?: boolean;
  major?: boolean;
  interactive?: boolean;
  doctor?: boolean;
}

class DependencyUpdater {
  private packageJsonPath: string;
  private originalPackageJson: string;

  constructor() {
    this.packageJsonPath = path.join(process.cwd(), "package.json");
    this.originalPackageJson = readFileSync(this.packageJsonPath, "utf-8");
  }

  /**
   * Check for available updates without applying them
   */
  async checkUpdates(): Promise<void> {
    console.log("🔍 Checking for available updates...\n");

    try {
      execSync("bun ncu", { stdio: "inherit" });
    } catch (error) {
      console.error("❌ Failed to check for updates:", error);
      process.exit(1);
    }
  }

  /**
   * Update patch versions only (safest updates)
   */
  async updatePatch(): Promise<void> {
    console.log("🔧 Updating patch versions...\n");

    try {
      execSync("bun ncu --target patch -u", { stdio: "inherit" });
      await this.installAndTest();
    } catch (error) {
      console.error("❌ Patch update failed:", error);
      this.restorePackageJson();
      process.exit(1);
    }
  }

  /**
   * Update minor and patch versions (mostly safe)
   */
  async updateMinor(): Promise<void> {
    console.log("⬆️ Updating minor and patch versions...\n");

    try {
      execSync("bun ncu --target minor -u", { stdio: "inherit" });
      await this.installAndTest();
    } catch (error) {
      console.error("❌ Minor update failed:", error);
      this.restorePackageJson();
      process.exit(1);
    }
  }

  /**
   * Show major version updates that require manual review
   */
  async checkMajor(): Promise<void> {
    console.log(
      "🚨 Checking for major version updates (manual review required)...\n"
    );

    try {
      execSync("bun ncu --target major", { stdio: "inherit" });
      console.log("\n⚠️ Major updates shown above require manual review.");
      console.log("Review changelogs and breaking changes before applying.");
      console.log(
        "Use: bun ncu --target major -u [package-name] to update specific packages."
      );
    } catch (error) {
      console.error("❌ Failed to check major updates:", error);
      process.exit(1);
    }
  }

  /**
   * Interactive mode for selecting updates
   */
  async interactiveUpdate(): Promise<void> {
    console.log("🎯 Interactive dependency update...\n");

    try {
      execSync("bun ncu --interactive", { stdio: "inherit" });

      // Check if package.json was modified
      const currentPackageJson = readFileSync(this.packageJsonPath, "utf-8");
      if (currentPackageJson !== this.originalPackageJson) {
        await this.installAndTest();
      } else {
        console.log("ℹ️ No changes made.");
      }
    } catch (error) {
      console.error("❌ Interactive update failed:", error);
      this.restorePackageJson();
      process.exit(1);
    }
  }

  /**
   * Use ncu doctor mode for automated safe updates
   */
  async doctorUpdate(): Promise<void> {
    console.log("🏥 Running dependency doctor (automated safe updates)...\n");
    console.log(
      "This will iteratively update dependencies and run tests to ensure compatibility.\n"
    );

    try {
      execSync("bun ncu --doctor -u", { stdio: "inherit" });
      console.log("✅ Doctor mode completed successfully!");
    } catch (error) {
      console.error("❌ Doctor mode failed:", error);
      this.restorePackageJson();
      process.exit(1);
    }
  }

  /**
   * Install dependencies and run tests
   */
  private async installAndTest(): Promise<void> {
    console.log("📦 Installing updated dependencies...");

    try {
      execSync("bun install", { stdio: "inherit" });
      console.log("✅ Dependencies installed successfully.\n");

      console.log("🧪 Running tests to verify compatibility...");
      execSync("bun test", { stdio: "inherit" });
      console.log("✅ Tests passed!\n");

      console.log("🔍 Running type check...");
      execSync("bun run type-check", { stdio: "inherit" });
      console.log("✅ Type check passed!\n");

      console.log("🎉 Dependency update completed successfully!");
    } catch (error) {
      console.error("❌ Tests or type check failed. Rolling back changes...");
      this.restorePackageJson();
      throw error;
    }
  }

  /**
   * Restore original package.json on failure
   */
  private restorePackageJson(): void {
    writeFileSync(this.packageJsonPath, this.originalPackageJson);
    console.log("🔄 Restored original package.json");

    // Reinstall original dependencies
    try {
      execSync("bun install", { stdio: "inherit" });
      console.log("✅ Restored original dependencies");
    } catch (error) {
      console.error("❌ Failed to restore dependencies:", error);
    }
  }

  /**
   * Create a changeset for the dependency updates
   */
  async createChangeset(updateType: string): Promise<void> {
    const changesetPath = path.join(process.cwd(), ".changeset");
    if (!existsSync(changesetPath)) {
      console.log(
        "ℹ️ Changeset directory not found. Skipping changeset creation."
      );
      return;
    }

    const changesetContent = `---
"morning-pod": patch
---

chore: update dependencies (${updateType})

Automated dependency update maintaining compatibility and security.
- Updated ${updateType} versions
- All tests passing
- Type checking verified
`;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const changesetFile = path.join(
      changesetPath,
      `dependency-update-${timestamp}.md`
    );

    writeFileSync(changesetFile, changesetContent);
    console.log(`📝 Created changeset: ${path.basename(changesetFile)}`);
  }
}

// Parse command line arguments
function parseArgs(): UpdateOptions {
  const args = process.argv.slice(2);
  const options: UpdateOptions = {};

  for (const arg of args) {
    switch (arg) {
      case "--check":
        options.check = true;
        break;
      case "--patch":
        options.patch = true;
        break;
      case "--minor":
        options.minor = true;
        break;
      case "--major":
        options.major = true;
        break;
      case "--interactive":
        options.interactive = true;
        break;
      case "--doctor":
        options.doctor = true;
        break;
      default:
        console.log(`Unknown option: ${arg}`);
        printUsage();
        process.exit(1);
    }
  }

  return options;
}

function printUsage(): void {
  console.log(`
Usage: bun run scripts/update-dependencies.ts [options]

Options:
  --check        Check for available updates without applying
  --patch        Update only patch versions (safest)
  --minor        Update minor and patch versions (mostly safe)
  --major        Show major version updates (requires manual review)
  --interactive  Interactive mode for selecting updates
  --doctor       Use ncu doctor mode for safe automated updates

Examples:
  bun run scripts/update-dependencies.ts --check
  bun run scripts/update-dependencies.ts --patch
  bun run scripts/update-dependencies.ts --minor
  bun run scripts/update-dependencies.ts --doctor
`);
}

// Main execution
async function main(): Promise<void> {
  const options = parseArgs();
  const updater = new DependencyUpdater();

  // Default to check if no options provided
  if (Object.keys(options).length === 0) {
    options.check = true;
  }

  try {
    if (options.check) {
      await updater.checkUpdates();
    } else if (options.patch) {
      await updater.updatePatch();
      await updater.createChangeset("patch");
    } else if (options.minor) {
      await updater.updateMinor();
      await updater.createChangeset("minor");
    } else if (options.major) {
      await updater.checkMajor();
    } else if (options.interactive) {
      await updater.interactiveUpdate();
      await updater.createChangeset("interactive");
    } else if (options.doctor) {
      await updater.doctorUpdate();
      await updater.createChangeset("doctor");
    }
  } catch (error) {
    console.error("❌ Dependency update failed:", error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
