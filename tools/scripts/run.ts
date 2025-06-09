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

import * as p from "@clack/prompts";
import { search } from "@inquirer/prompts";
import { execSync } from "child_process";

interface ScriptCommand {
  category?: string;
  command: string;
  description: string;
  name: string;
}

interface ScriptCategory {
  commands: ScriptCommand[];
  description: string;
  icon: string;
  name: string;
}

export class ScriptRunner {
  private categories: ScriptCategory[] = [
    {
      commands: [
        {
          command: "bun run next dev --turbo",
          description: "Start development server with Turbopack",
          name: "start",
        },
        {
          command: "bun run next build",
          description: "Build for production",
          name: "build",
        },
        {
          command: "bun run next start",
          description: "Start production server",
          name: "preview",
        },
        {
          command: "rm -rf node_modules bun.lockb && bun install",
          description: "Clean install dependencies",
          name: "clean",
        },
      ],
      description: "Development Commands",
      icon: "🚀",
      name: "dev",
    },
    {
      commands: [
        {
          command: "bun vitest --config config/testing/vitest.config.ts",
          description: "Run unit tests with Vitest",
          name: "unit",
        },
        {
          command:
            "bun vitest --config config/testing/vitest.config.ts --watch",
          description: "Run unit tests in watch mode",
          name: "unit:watch",
        },
        {
          command: "bun vitest --config config/testing/vitest.config.ts --ui",
          description: "Run unit tests with UI",
          name: "unit:ui",
        },
        {
          command:
            "bun vitest --config config/testing/vitest.config.ts --coverage",
          description: "Run unit tests with coverage",
          name: "unit:coverage",
        },
        {
          command:
            "bun vitest --config config/testing/vitest.config.performance.ts",
          description: "Run unit tests (performance optimized)",
          name: "unit:perf",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.ts",
          description: "Run E2E tests with Playwright",
          name: "e2e",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.ts --ui",
          description: "Run E2E tests with UI",
          name: "e2e:ui",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.ts --debug",
          description: "Debug E2E tests",
          name: "e2e:debug",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.ts --headed",
          description: "Run E2E tests in headed mode",
          name: "e2e:headed",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.ts --update-snapshots",
          description: "Update visual regression snapshots",
          name: "e2e:visual",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.performance.ts",
          description: "Run E2E tests (performance optimized)",
          name: "e2e:perf",
        },
        {
          command:
            "playwright test --config config/testing/playwright.config.ts src/tests/performance",
          description: "Run performance tests",
          name: "performance",
        },
        {
          command:
            "bun vitest --config config/testing/vitest.config.ts && playwright test --config config/testing/playwright.config.ts",
          description: "Run all tests (unit + E2E)",
          name: "all",
        },
        {
          command:
            "bun vitest --config config/testing/vitest.config.performance.ts && playwright test --config config/testing/playwright.config.performance.ts",
          description: "Run all tests (performance optimized)",
          name: "all:perf",
        },
      ],
      description: "Testing Commands",
      icon: "🧪",
      name: "test",
    },
    {
      commands: [
        {
          command: "bun run drizzle-kit generate",
          description: "Generate database migrations",
          name: "generate",
        },
        {
          command: "bun run drizzle-kit push",
          description: "Push migrations to database",
          name: "migrate",
        },
        {
          command: "bun run tools/scripts/seed.ts",
          description: "Seed database with test data",
          name: "seed",
        },
        {
          command: "bun run drizzle-kit studio",
          description: "Open Drizzle Studio",
          name: "studio",
        },
      ],
      description: "Database Commands",
      icon: "🗄️",
      name: "db",
    },
    {
      commands: [
        {
          command: "ncu --timeout 15000 --concurrency 2",
          description: "Check for available updates",
          name: "check",
        },
        {
          command:
            "ncu --target patch --timeout 15000 --concurrency 2 -u && bun install",
          description: "Update patch versions (safest)",
          name: "update:patch",
        },
        {
          command:
            "ncu --target minor --timeout 15000 --concurrency 2 -u && bun install",
          description: "Update minor versions",
          name: "update:minor",
        },
        {
          command:
            "ncu --target minor --timeout 15000 --concurrency 2 -u && bun install && bun test && bun run type-check",
          description: "Update with automatic testing",
          name: "update:safe",
        },
        {
          command: "ncu --target major --timeout 15000 --concurrency 2",
          description: "Show major updates (manual review)",
          name: "update:major",
        },
        {
          command: "ncu --doctor --timeout 15000 --concurrency 2 -u",
          description: "Automated safe updates with testing",
          name: "doctor",
        },
        {
          command: "bun outdated",
          description: "Show outdated packages (Bun native)",
          name: "outdated",
        },
        {
          command: "bun audit --audit-level moderate",
          description: "Check for security vulnerabilities",
          name: "audit",
        },
        {
          command: "bun audit fix",
          description: "Fix security vulnerabilities",
          name: "audit:fix",
        },
        {
          command:
            "bun audit --audit-level moderate && bun run tools/scripts/run.ts quality type-check",
          description: "Run comprehensive security checks",
          name: "security:check",
        },
      ],
      description: "Dependency Management",
      icon: "📦",
      name: "deps",
    },
    {
      commands: [
        {
          command: "bun run next lint",
          description: "Run ESLint",
          name: "lint",
        },
        {
          command: "bun run next lint --fix",
          description: "Fix ESLint issues",
          name: "lint:fix",
        },
        {
          command: "bun run next lint --quiet",
          description: "Run ESLint (errors only)",
          name: "lint:quiet",
        },
        {
          command: "bun run next lint --strict",
          description: "Setup strict ESLint config",
          name: "lint:strict",
        },
        {
          command: "prettier --write .",
          description: "Format code with Prettier",
          name: "format",
        },
        {
          command: "prettier --check .",
          description: "Check code formatting",
          name: "format:check",
        },
        {
          command: "tsc --noEmit",
          description: "Run TypeScript type checking",
          name: "type-check",
        },
        {
          command: "bun run next lint && prettier --check . && tsc --noEmit",
          description: "Run all quality checks",
          name: "all",
        },
      ],
      description: "Code Quality",
      icon: "✨",
      name: "quality",
    },
    {
      commands: [
        {
          command: "changeset",
          description: "Create a new changeset",
          name: "changeset",
        },
        {
          command: "changeset version",
          description: "Version packages and update changelog",
          name: "version",
        },
        {
          command: "changeset publish",
          description: "Publish packages",
          name: "publish",
        },
        {
          command: "changeset status",
          description: "Check changeset status",
          name: "status",
        },
        {
          command: "changeset version && bun run build && changeset publish",
          description: "Full release process",
          name: "release",
        },
      ],
      description: "Release Management",
      icon: "🚢",
      name: "release",
    },
    {
      commands: [
        {
          command: "bun run tools/scripts/branch-manager.ts --checkout",
          description: "Switch to recent branch interactively",
          name: "checkout",
        },
        {
          command: "bun run tools/scripts/branch-manager.ts",
          description: "Interactive branch management",
          name: "interactive",
        },
        {
          command: "bun run tools/scripts/branch-manager.ts --analysis",
          description: "Show branch analysis and statistics",
          name: "analysis",
        },
        {
          command: "bun run tools/scripts/branch-manager.ts --stale",
          description: "Archive stale branches (>30 days)",
          name: "stale",
        },
        {
          command: "bun run tools/scripts/branch-manager.ts --orphaned",
          description: "Archive local-only branches",
          name: "orphaned",
        },
        {
          command: "bun run tools/scripts/branch-manager.ts --merged",
          description: "Archive merged branches deleted from remote",
          name: "merged",
        },
        {
          command: "bun run tools/scripts/branch-manager.ts --stale --dry-run",
          description: "Preview stale branches (dry run)",
          name: "preview",
        },
      ],
      description: "Branch Management",
      icon: "🌿",
      name: "branches",
    },
  ];

  /**
   * Execute all commands in a category
   */
  executeAllInCategory(category: ScriptCategory): void {
    const allCommand = category.commands.find((cmd) => cmd.name === "all");

    if (allCommand) {
      console.log(`\\n▶️  ${category.icon} ${allCommand.description}\\n`);
      console.log(`🔧 Command: ${allCommand.command}\\n`);

      try {
        execSync(allCommand.command, { cwd: process.cwd(), stdio: "inherit" });
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
          execSync(command.command, { cwd: process.cwd(), stdio: "inherit" });
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
      execSync(command.command, { cwd: process.cwd(), stdio: "inherit" });
      console.log(`\\n✅ ${command.name} completed successfully!`);
    } catch (error) {
      console.log(`\\n❌ Command failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Execute a specific command with additional arguments
   */
  executeCommandWithArgs(
    categoryName: string,
    actionName: string,
    additionalArgs: string
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
    if (actionName === "--all") {
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

    const fullCommand = additionalArgs
      ? `${command.command} ${additionalArgs}`
      : command.command;

    console.log(`\\n▶️  ${category.icon} ${command.description}\\n`);
    console.log(`🔧 Command: ${fullCommand}\\n`);

    try {
      execSync(fullCommand, { cwd: process.cwd(), stdio: "inherit" });
      console.log(`\\n✅ ${command.name} completed successfully!`);
    } catch (error) {
      console.log(`\\n❌ Command failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Get context-specific argument examples based on category and command
   */
  getArgumentExamples(categoryName: string, commandName: string): string {
    const exampleMap: Record<string, Record<string, string>> = {
      db: {
        default: "--help",
        generate: "--name add_user_table",
        migrate: "--verbose",
      },
      default: {
        default: "--help",
      },
      deps: {
        check: "--target minor",
        default: "--help",
        "update:patch": "--interactive",
      },
      dev: {
        build: "--debug",
        default: "--help",
        preview: "--port 3000",
        start: "--port 3001",
      },
      quality: {
        default: "src/ --verbose",
        format: "src/ --check",
        "format:check": "src/components",
        lint: "src/ --max-warnings 0",
        "lint:fix": "src/components --quiet",
        "lint:quiet": "--max-warnings 5",
        "lint:strict": "--dir src/app",
        "type-check": "--incremental",
      },
      test: {
        default: "--timeout 30000",
        e2e: "--headed --debug",
        "e2e:debug": "--project=webkit",
        "e2e:ui": "--project=chromium",
        performance: "--repeat-each=3",
        unit: "--watch --coverage",
        "unit:coverage": "--reporter=verbose",
        "unit:watch": "--ui --coverage",
      },
    };

    const categoryExamples =
      exampleMap[categoryName.toLowerCase()] || exampleMap.default;
    return (
      categoryExamples[commandName] || categoryExamples.default || "--help"
    );
  }

  /**
   * List all available commands
   */
  listAllCommands(): void {
    console.log("\\n📋 All Available Commands\\n");

    for (const category of this.categories) {
      console.log(`${category.icon} ${category.description}:`);
      for (const command of category.commands) {
        console.log(
          `  bun run script ${category.name} ${command.name.padEnd(15)} - ${command.description}`
        );
      }
      console.log("");
    }
  }

  /**
   * Parse command line arguments
   */
  parseArgs(): {
    action?: string;
    category?: string;
    flags: string[];
    mode: "category" | "direct" | "help" | "interactive" | "list";
  } {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
      return { flags: [], mode: "help" };
    }

    if (args.includes("--list") || args.includes("-l")) {
      return { flags: [], mode: "list" };
    }

    if (
      args.includes("-i") ||
      args.includes("--interactive") ||
      args.length === 0
    ) {
      return { flags: [], mode: "interactive" };
    }

    const [category, action, ...flags] = args;

    // Handle category-specific flags like: bun run test --e2e, bun run dev --build
    if (category && flags.length > 0) {
      const categoryFlagMap: Record<string, Record<string, string>> = {
        db: {
          "--generate": "generate",
          "--migrate": "migrate",
          "--seed": "seed",
          "--studio": "studio",
        },
        deps: {
          "--audit": "audit",
          "--audit-fix": "audit:fix",
          "--check": "check",
          "--doctor": "doctor",
          "--major": "update:major",
          "--minor": "update:minor",
          "--outdated": "outdated",
          "--patch": "update:patch",
          "--safe": "update:safe",
          "--security": "security:check",
        },
        dev: {
          "--build": "build",
          "--clean": "clean",
          "--preview": "preview",
          "--start": "start",
        },
        quality: {
          "--all": "all",
          "--check": "format:check",
          "--fix": "lint:fix",
          "--format": "format",
          "--lint": "lint",
          "--quiet": "lint:quiet",
          "--strict": "lint:strict",
          "--type": "type-check",
        },
        release: {
          "--changeset": "changeset",
          "--publish": "publish",
          "--release": "release",
          "--status": "status",
          "--version": "version",
        },
        branches: {
          "--analysis": "analysis",
          "--checkout": "checkout",
          "--interactive": "interactive",
          "--merged": "merged",
          "--orphaned": "orphaned",
          "--preview": "preview",
          "--stale": "stale",
        },
        test: {
          "--all": "--all",
          "--coverage": "unit:coverage",
          "--debug": "e2e:debug",
          "--e2e": "e2e",
          "--e2e-perf": "e2e:perf",
          "--e2e-ui": "e2e:ui",
          "--e2e-visual": "e2e:visual",
          "--headed": "e2e:headed",
          "--perf": "unit:perf",
          "--performance": "performance",
          "--ui": "unit:ui",
          "--unit": "unit",
          "--visual": "e2e:visual",
          "--watch": "unit:watch",
        },
      };

      const categoryFlags = categoryFlagMap[category.toLowerCase()];
      if (categoryFlags) {
        for (const flag of flags) {
          if (categoryFlags[flag]) {
            return {
              action: categoryFlags[flag],
              category,
              flags: flags.filter((f) => f !== flag),
              mode: "direct",
            };
          }
        }
      }
    }

    if (!action) {
      return { category, flags, mode: "category" };
    }

    return { action, category, flags, mode: "direct" };
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    const { action, category, flags, mode } = this.parseArgs();

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
        name: `${cmd.name} - ${cmd.description}`,
        value: cmd.name,
      })),
      { name: "Run all commands in this category", value: "--all" },
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

    // Check if user wants to add additional arguments
    let additionalArgs = "";
    try {
      const examples = this.getArgumentExamples(categoryName, String(selected));
      const result = await p.text({
        defaultValue: "",
        message: `Additional arguments (optional, e.g., ${examples}):`,
        placeholder: "Press Enter to skip",
      });
      additionalArgs = String(result);
    } catch (error) {
      additionalArgs = "";
    }

    const fullCommand = additionalArgs
      ? `${selected} ${additionalArgs}`
      : selected;
    p.outro(`Running: ${fullCommand}`);

    this.executeCommandWithArgs(
      categoryName,
      selected as string,
      additionalArgs
    );
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
  bun run [category] [cmd] [args]   # Run command with additional arguments
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
    bun run quality --fix           # Fix ESLint issues
    bun run quality --quiet         # Run linting (errors only)
    bun run quality --strict        # Setup strict ESLint config
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
  bun run test                      # Run all tests (unit + E2E)
  bun run test:interactive          # Interactive test menu  
  bun run test unit                 # Run unit tests directly
  bun run test --e2e                # Quick E2E test shortcut
  bun run quality                   # Run all quality checks (lint + format + type)
  bun run quality:interactive       # Interactive quality menu
  bun run deps check                # Check dependencies

Passing Additional Arguments:
  bun run quality lint src/         # Lint specific directory
  bun run quality --quiet --max-warnings 0  # Quiet with max warnings
  bun run quality format src/ --check  # Format check specific directory
  bun run test unit --coverage --watch  # Unit tests with coverage and watch
  bun run test e2e --headed --debug     # E2E tests in headed debug mode
`);
  }

  /**
   * Show interactive menu with selection
   */
  async showInteractiveMenu(): Promise<void> {
    p.intro("🎯 Interactive Script Runner");

    const categoryOptions = this.categories.map((category) => ({
      name: `${category.icon} ${category.description}`,
      value: category.name,
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
}

// Run the script only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new ScriptRunner();
  runner.run().catch((error) => {
    console.error("Script runner failed:", error);
    process.exit(1);
  });
}
