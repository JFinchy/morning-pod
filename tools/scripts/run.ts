#!/usr/bin/env bun

/**
 * Interactive script runner for package.json commands
 *
 * @description Provides both interactive menu and direct command execution
 * @business-context Reduces package.json script bloat while maintaining discoverability
 * @decision-date 2024-01-22
 * @decision-by Development team for better developer experience
 *
 * @usage
 * bun run script -i                    # Interactive mode
 * bun run script [category]            # Show category options
 * bun run script [category] [action]   # Direct execution
 * bun run script [category] --all      # Run all in category
 *
 * @examples
 * bun run script -i                    # Interactive menu
 * bun run script test                  # Show test options
 * bun run script test unit             # Run unit tests
 * bun run script test --all            # Run all tests
 * bun run script deps check            # Check dependencies
 */

import { execSync } from "child_process";
import * as p from "@clack/prompts";
import { search } from "@inquirer/prompts";

interface ScriptCommand {
  name: string;
  description: string;
  command: string;
  category?: string;
}

interface ScriptCategory {
  name: string;
  description: string;
  icon: string;
  commands: ScriptCommand[];
}

export class ScriptRunner {
  private categories: ScriptCategory[] = [
    {
      name: "dev",
      description: "Development Commands",
      icon: "🚀",
      commands: [
        {
          name: "start",
          description: "Start development server with Turbopack",
          command: "bun run next dev --turbo",
        },
        {
          name: "build",
          description: "Build for production",
          command: "bun run next build",
        },
        {
          name: "preview",
          description: "Start production server",
          command: "bun run next start",
        },
        {
          name: "clean",
          description: "Clean install dependencies",
          command: "rm -rf node_modules bun.lockb && bun install",
        },
      ],
    },
    {
      name: "test",
      description: "Testing Commands",
      icon: "🧪",
      commands: [
        {
          name: "unit",
          description: "Run unit tests with Vitest",
          command: "bun vitest --config config/testing/vitest.config.ts",
        },
        {
          name: "unit:watch",
          description: "Run unit tests in watch mode",
          command:
            "bun vitest --config config/testing/vitest.config.ts --watch",
        },
        {
          name: "unit:ui",
          description: "Run unit tests with UI",
          command: "bun vitest --config config/testing/vitest.config.ts --ui",
        },
        {
          name: "unit:coverage",
          description: "Run unit tests with coverage",
          command:
            "bun vitest --config config/testing/vitest.config.ts --coverage",
        },
        {
          name: "unit:perf",
          description: "Run unit tests (performance optimized)",
          command:
            "bun vitest --config config/testing/vitest.config.performance.ts",
        },
        {
          name: "e2e",
          description: "Run E2E tests with Playwright",
          command:
            "playwright test --config config/testing/playwright.config.ts",
        },
        {
          name: "e2e:ui",
          description: "Run E2E tests with UI",
          command:
            "playwright test --config config/testing/playwright.config.ts --ui",
        },
        {
          name: "e2e:debug",
          description: "Debug E2E tests",
          command:
            "playwright test --config config/testing/playwright.config.ts --debug",
        },
        {
          name: "e2e:headed",
          description: "Run E2E tests in headed mode",
          command:
            "playwright test --config config/testing/playwright.config.ts --headed",
        },
        {
          name: "e2e:visual",
          description: "Update visual regression snapshots",
          command:
            "playwright test --config config/testing/playwright.config.ts --update-snapshots",
        },
        {
          name: "e2e:perf",
          description: "Run E2E tests (performance optimized)",
          command:
            "playwright test --config config/testing/playwright.config.performance.ts",
        },
        {
          name: "performance",
          description: "Run performance tests",
          command:
            "playwright test --config config/testing/playwright.config.ts src/tests/performance",
        },
        {
          name: "all",
          description: "Run all tests (unit + E2E)",
          command:
            "bun vitest --config config/testing/vitest.config.ts && playwright test --config config/testing/playwright.config.ts",
        },
        {
          name: "all:perf",
          description: "Run all tests (performance optimized)",
          command:
            "bun vitest --config config/testing/vitest.config.performance.ts && playwright test --config config/testing/playwright.config.performance.ts",
        },
      ],
    },
    {
      name: "db",
      description: "Database Commands",
      icon: "🗄️",
      commands: [
        {
          name: "generate",
          description: "Generate database migrations",
          command: "bun run drizzle-kit generate",
        },
        {
          name: "migrate",
          description: "Push migrations to database",
          command: "bun run drizzle-kit push",
        },
        {
          name: "seed",
          description: "Seed database with test data",
          command: "bun run tools/scripts/seed.ts",
        },
        {
          name: "studio",
          description: "Open Drizzle Studio",
          command: "bun run drizzle-kit studio",
        },
      ],
    },
    {
      name: "deps",
      description: "Dependency Management",
      icon: "📦",
      commands: [
        {
          name: "check",
          description: "Check for available updates",
          command: "ncu --timeout 15000 --concurrency 2",
        },
        {
          name: "update:patch",
          description: "Update patch versions (safest)",
          command:
            "ncu --target patch --timeout 15000 --concurrency 2 -u && bun install",
        },
        {
          name: "update:minor",
          description: "Update minor versions",
          command:
            "ncu --target minor --timeout 15000 --concurrency 2 -u && bun install",
        },
        {
          name: "update:safe",
          description: "Update with automatic testing",
          command:
            "ncu --target minor --timeout 15000 --concurrency 2 -u && bun install && bun test && bun run type-check",
        },
        {
          name: "update:major",
          description: "Show major updates (manual review)",
          command: "ncu --target major --timeout 15000 --concurrency 2",
        },
        {
          name: "doctor",
          description: "Automated safe updates with testing",
          command: "ncu --doctor --timeout 15000 --concurrency 2 -u",
        },
        {
          name: "outdated",
          description: "Show outdated packages (Bun native)",
          command: "bun outdated",
        },
        {
          name: "audit",
          description: "Check for security vulnerabilities",
          command: "bun audit --audit-level moderate",
        },
        {
          name: "audit:fix",
          description: "Fix security vulnerabilities",
          command: "bun audit fix",
        },
        {
          name: "security:check",
          description: "Run comprehensive security checks",
          command:
            "bun audit --audit-level moderate && bun run tools/scripts/run.ts quality type-check",
        },
      ],
    },
    {
      name: "quality",
      description: "Code Quality",
      icon: "✨",
      commands: [
        {
          name: "lint",
          description: "Run ESLint",
          command: "bun run next lint",
        },
        {
          name: "lint:fix",
          description: "Fix ESLint issues",
          command: "bun run next lint --fix",
        },
        {
          name: "format",
          description: "Format code with Prettier",
          command: "prettier --write .",
        },
        {
          name: "format:check",
          description: "Check code formatting",
          command: "prettier --check .",
        },
        {
          name: "type-check",
          description: "Run TypeScript type checking",
          command: "tsc --noEmit",
        },
        {
          name: "all",
          description: "Run all quality checks",
          command: "bun run next lint && prettier --check . && tsc --noEmit",
        },
      ],
    },
    {
      name: "release",
      description: "Release Management",
      icon: "🚢",
      commands: [
        {
          name: "changeset",
          description: "Create a new changeset",
          command: "changeset",
        },
        {
          name: "version",
          description: "Version packages and update changelog",
          command: "changeset version",
        },
        {
          name: "publish",
          description: "Publish packages",
          command: "changeset publish",
        },
        {
          name: "status",
          description: "Check changeset status",
          command: "changeset status",
        },
        {
          name: "release",
          description: "Full release process",
          command: "changeset version && bun run build && changeset publish",
        },
      ],
    },
  ];

  /**
   * Parse command line arguments
   */
  parseArgs(): {
    mode: "help" | "list" | "interactive" | "category" | "direct";
    category?: string;
    action?: string;
    flags: string[];
  } {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
      return { mode: "help", flags: [] };
    }

    if (args.includes("--list") || args.includes("-l")) {
      return { mode: "list", flags: [] };
    }

    if (
      args.includes("-i") ||
      args.includes("--interactive") ||
      args.length === 0
    ) {
      return { mode: "interactive", flags: [] };
    }

    const [category, action, ...flags] = args;

    // Handle category-specific flags like: bun run test --e2e, bun run dev --build
    if (category && flags.length > 0) {
      const categoryFlagMap: Record<string, Record<string, string>> = {
        test: {
          "--e2e": "e2e",
          "--unit": "unit",
          "--watch": "unit:watch",
          "--coverage": "unit:coverage",
          "--ui": "unit:ui",
          "--perf": "unit:perf",
          "--debug": "e2e:debug",
          "--headed": "e2e:headed",
          "--visual": "e2e:visual",
          "--e2e-ui": "e2e:ui",
          "--e2e-perf": "e2e:perf",
          "--e2e-visual": "e2e:visual",
          "--performance": "performance",
          "--all": "--all",
        },
        dev: {
          "--start": "start",
          "--build": "build",
          "--preview": "preview",
          "--clean": "clean",
        },
        quality: {
          "--lint": "lint",
          "--fix": "lint:fix",
          "--format": "format",
          "--check": "format:check",
          "--type": "type-check",
          "--all": "all",
        },
        db: {
          "--generate": "generate",
          "--migrate": "migrate",
          "--seed": "seed",
          "--studio": "studio",
        },
        deps: {
          "--check": "check",
          "--patch": "update:patch",
          "--minor": "update:minor",
          "--major": "update:major",
          "--safe": "update:safe",
          "--doctor": "doctor",
          "--outdated": "outdated",
          "--audit": "audit",
          "--audit-fix": "audit:fix",
          "--security": "security:check",
        },
        release: {
          "--changeset": "changeset",
          "--version": "version",
          "--publish": "publish",
          "--status": "status",
          "--release": "release",
        },
      };

      const categoryFlags = categoryFlagMap[category.toLowerCase()];
      if (categoryFlags) {
        for (const flag of flags) {
          if (categoryFlags[flag]) {
            return {
              mode: "direct",
              category,
              action: categoryFlags[flag],
              flags: flags.filter((f) => f !== flag),
            };
          }
        }
      }
    }

    if (!action) {
      return { mode: "category", category, flags };
    }

    return { mode: "direct", category, action, flags };
  }

  /**
   * Show help
   */
  showHelp(): void {
    console.log(`
🎯 Interactive Script Runner

Usage:
  bun run                           # Interactive mode (main menu)
  bun run script                    # Interactive mode
  bun run script -i                 # Interactive mode  
  bun run script -l                 # List all commands
  bun run [category]                # Show category commands
  bun run [category] [cmd]          # Run specific command
  bun run [category] --all          # Run all commands in category

Category Flags:
  Testing:
    bun run test --e2e              # Run E2E tests
    bun run test --unit             # Run unit tests
    bun run test --watch            # Run unit tests in watch mode
    bun run test --coverage         # Run unit tests with coverage
    bun run test --all              # Run all tests
    
  Development:
    bun run dev --start             # Start development server
    bun run dev --build             # Build for production
    bun run dev --preview           # Start production server
    
  Quality:
    bun run quality --lint          # Run linting
    bun run quality --format        # Format code
    bun run quality --type          # Type checking
    bun run quality --all           # All quality checks
    
  Dependencies & Security:
    bun run deps --audit            # Check security vulnerabilities
    bun run deps --security         # Comprehensive security checks
    bun run deps --outdated         # Show outdated packages

Categories:
${this.categories.map((cat) => `  ${cat.name.padEnd(10)} ${cat.icon} ${cat.description}`).join("\\n")}

Examples:
  bun run                           # Interactive main menu
  bun run test                      # Interactive test menu  
  bun run test unit                 # Run unit tests directly
  bun run test --e2e                # Quick E2E test shortcut
  bun run test --all                # Run all tests
  bun run deps check                # Check dependencies
  bun run quality --all             # Run all quality checks
`);
  }

  /**
   * List all available commands
   */
  listAllCommands(): void {
    console.log("\\n📋 All Available Commands\\n");

    this.categories.forEach((category) => {
      console.log(`${category.icon} ${category.description}:`);
      category.commands.forEach((command) => {
        console.log(
          `  bun run script ${category.name} ${command.name.padEnd(15)} - ${command.description}`
        );
      });
      console.log("");
    });
  }

  /**
   * Show interactive menu with selection
   */
  async showInteractiveMenu(): Promise<void> {
    p.intro("🎯 Interactive Script Runner");

    const categoryOptions = this.categories.map((category) => ({
      value: category.name,
      name: `${category.icon} ${category.description}`,
    }));

    let selectedCategory;
    try {
      selectedCategory = await search({
        message: "Choose a category:",
        source: (input) => {
          const filtered = categoryOptions.filter((option) => {
            const searchTerm = (input || "").toLowerCase();
            return (
              option.name.toLowerCase().includes(searchTerm) ||
              option.value.toLowerCase().includes(searchTerm)
            );
          });
          return Promise.resolve(filtered);
        },
      });
    } catch (error) {
      p.outro("👋 See you later!");
      process.exit(0);
    }

    await this.showCategory(selectedCategory as string);
  }

  /**
   * Show category commands with interactive selection
   */
  async showCategory(categoryName: string): Promise<void> {
    const category = this.categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      console.log(`❌ Unknown category: ${categoryName}`);
      console.log(
        "Available categories:",
        this.categories.map((c) => c.name).join(", ")
      );
      process.exit(1);
    }

    p.intro(`${category.icon} ${category.description}`);

    const options = [
      ...category.commands.map((cmd) => ({
        value: cmd.name,
        name: `${cmd.name} - ${cmd.description}`,
      })),
      { value: "--all", name: "Run all commands in this category" },
    ];

    let selected;
    try {
      selected = await search({
        message: "Choose a command to run:",
        source: (input) => {
          const filtered = options.filter((option) => {
            const searchTerm = (input || "").toLowerCase();
            return (
              option.name.toLowerCase().includes(searchTerm) ||
              option.value.toLowerCase().includes(searchTerm)
            );
          });
          return Promise.resolve(filtered);
        },
      });
    } catch (error) {
      p.outro("👋 See you later!");
      process.exit(0);
    }

    p.outro(`Running: ${selected}`);

    this.executeCommand(categoryName, selected as string);
  }

  /**
   * Execute a specific command
   */
  executeCommand(
    categoryName: string,
    actionName: string,
    flags: string[] = []
  ): void {
    const category = this.categories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      console.log(`❌ Unknown category: ${categoryName}`);
      console.log(
        "Available categories:",
        this.categories.map((c) => c.name).join(", ")
      );
      process.exit(1);
    }

    // Handle --all flag
    if (actionName === "--all" || flags.includes("--all")) {
      this.executeAllInCategory(category);
      return;
    }

    const command = category.commands.find(
      (cmd) => cmd.name.toLowerCase() === actionName.toLowerCase()
    );

    if (!command) {
      console.log(`❌ Unknown command: ${actionName}`);
      console.log(
        "Available commands:",
        category.commands.map((c) => c.name).join(", ")
      );
      process.exit(1);
    }

    console.log(`\\n▶️  ${category.icon} ${command.description}\\n`);
    console.log(`🔧 Command: ${command.command}\\n`);

    try {
      execSync(command.command, { stdio: "inherit", cwd: process.cwd() });
      console.log(`\\n✅ ${command.name} completed successfully!`);
    } catch (error) {
      console.log(`\\n❌ Command failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Execute all commands in a category
   */
  executeAllInCategory(category: ScriptCategory): void {
    const allCommand = category.commands.find((cmd) => cmd.name === "all");

    if (allCommand) {
      console.log(`\\n▶️  ${category.icon} ${allCommand.description}\\n`);
      console.log(`🔧 Command: ${allCommand.command}\\n`);

      try {
        execSync(allCommand.command, { stdio: "inherit", cwd: process.cwd() });
        console.log(
          `\\n✅ All ${category.name} commands completed successfully!`
        );
      } catch (error) {
        console.log(`\\n❌ Command failed:`, error);
        process.exit(1);
      }
    } else {
      console.log(`\\n🔄 Running all ${category.name} commands...\\n`);

      for (const command of category.commands) {
        console.log(`\\n▶️  ${command.name}: ${command.description}`);
        console.log(`🔧 Command: ${command.command}\\n`);

        try {
          execSync(command.command, { stdio: "inherit", cwd: process.cwd() });
          console.log(`✅ ${command.name} completed successfully`);
        } catch (error) {
          console.log(`❌ ${command.name} failed:`, error);
          console.log("\\n🛑 Stopping execution due to failure");
          process.exit(1);
        }
      }

      console.log(
        `\\n🎉 All ${category.name} commands completed successfully!`
      );
    }
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    const { mode, category, action, flags } = this.parseArgs();

    switch (mode) {
      case "help":
        this.showHelp();
        break;
      case "list":
        this.listAllCommands();
        break;
      case "interactive":
        await this.showInteractiveMenu();
        break;
      case "category":
        if (category) {
          await this.showCategory(category);
        }
        break;
      case "direct":
        if (category && action) {
          this.executeCommand(category, action, flags);
        }
        break;
      default:
        this.showHelp();
    }
  }
}

// Run the script only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new ScriptRunner();
  runner.run().catch((error) => {
    console.error("Script runner failed:", error);
    process.exit(1);
  });
}
