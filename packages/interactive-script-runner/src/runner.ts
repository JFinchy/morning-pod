import * as p from "@clack/prompts";
import { search } from "@inquirer/prompts";
import { execSync } from "child_process";
import type {
  ScriptConfig,
  ScriptCategory,
  ParsedArgs,
  ScriptRunnerOptions,
} from "./types.js";
import { ConfigLoader } from "./config/loader.js";

/**
 * Interactive Script Runner - Main class for executing package.json scripts
 *
 * @business-context Provides both interactive menu and direct command execution
 *                   to reduce package.json script bloat while maintaining discoverability
 */
export class ScriptRunner {
  private config: ScriptConfig;
  private cwd: string;
  private colors: boolean;
  private logger: (message: string, level?: "info" | "warn" | "error") => void;

  constructor(options: ScriptRunnerOptions = {}) {
    this.cwd = options.cwd || process.cwd();
    this.colors = options.colors !== false;
    this.logger = options.logger || console.log;
    this.config = options.config || { categories: [] };
  }

  /**
   * Initialize the runner by loading configuration
   */
  async initialize(): Promise<void> {
    if (!this.config.categories?.length) {
      const loader = new ConfigLoader(this.cwd);
      this.config = await loader.loadConfig();
    }
  }

  /**
   * Main entry point for running the script runner
   */
  async run(): Promise<void> {
    await this.initialize();
    const args = this.parseArgs();

    switch (args.mode) {
      case "interactive":
        await this.showInteractiveMenu();
        break;
      case "list":
        this.listAllCommands();
        break;
      case "help":
        this.showHelp();
        break;
      case "category":
        if (args.category) {
          await this.showCategory(args.category);
        } else {
          this.showHelp();
        }
        break;
      case "direct":
        if (args.category && args.action) {
          this.executeCommand(args.category, args.action, args.flags);
        } else {
          this.showHelp();
        }
        break;
      default:
        this.showHelp();
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(): ParsedArgs {
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

    // Handle category-specific flags like: script-runner test --e2e
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
        test: {
          "--all": "--all",
          "--coverage": "unit:coverage",
          "--debug": "e2e:debug",
          "--e2e": "e2e",
          "--headed": "e2e:headed",
          "--performance": "performance",
          "--ui": "unit:ui",
          "--unit": "unit",
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
   * Show interactive menu for category and command selection
   */
  private async showInteractiveMenu(): Promise<void> {
    if (!this.config.categories?.length) {
      this.logger(
        "No script categories found. Consider adding a configuration file.",
        "warn"
      );
      return;
    }

    p.intro(`📋 ${this.config.projectName || "Project"} Script Runner`);

    const categoryOptions = this.config.categories.map((category) => ({
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

  /**
   * Show commands for a specific category with interactive selection
   */
  private async showCategory(categoryName: string): Promise<void> {
    const category = this.config.categories?.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      this.logger(`❌ Unknown category: ${categoryName}`);
      this.logger(
        "Available categories: " +
          (this.config.categories?.map((c) => c.name).join(", ") || "none")
      );
      return;
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
   * Execute a specific command
   */
  executeCommand(
    categoryName: string,
    actionName: string,
    flags: string[] = []
  ): void {
    const category = this.config.categories?.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      this.logger(`❌ Unknown category: ${categoryName}`, "error");
      this.logger(
        "Available categories: " +
          (this.config.categories?.map((c) => c.name).join(", ") || "none")
      );
      return;
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
      this.logger(
        `❌ Unknown command: ${actionName} in ${categoryName}`,
        "error"
      );
      this.logger(
        "Available commands: " + category.commands.map((c) => c.name).join(", ")
      );
      return;
    }

    console.log(`\\n▶️  ${category.icon} ${command.description}\\n`);
    console.log(`🔧 Command: ${command.command}\\n`);

    try {
      execSync(command.command, {
        cwd: this.cwd,
        stdio: "inherit",
        env: { ...process.env, ...this.config.globalEnv, ...command.env },
      });
      console.log(`\\n✅ ${command.name} completed successfully!`);
    } catch (error) {
      console.log(`\\n❌ Command failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Execute a specific command with additional arguments
   */
  private executeCommandWithArgs(
    categoryName: string,
    actionName: string,
    additionalArgs: string
  ): void {
    const category = this.config.categories?.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      this.logger(`❌ Unknown category: ${categoryName}`, "error");
      return;
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
      this.logger(`❌ Unknown command: ${actionName}`, "error");
      this.logger(
        "Available commands: " + category.commands.map((c) => c.name).join(", ")
      );
      return;
    }

    const fullCommand = additionalArgs
      ? `${command.command} ${additionalArgs}`
      : command.command;

    console.log(`\\n▶️  ${category.icon} ${command.description}\\n`);
    console.log(`🔧 Command: ${fullCommand}\\n`);

    try {
      execSync(fullCommand, {
        cwd: this.cwd,
        stdio: "inherit",
        env: { ...process.env, ...this.config.globalEnv, ...command.env },
      });
      console.log(`\\n✅ ${command.name} completed successfully!`);
    } catch (error) {
      console.log(`\\n❌ Command failed:`, error);
      process.exit(1);
    }
  }

  /**
   * Execute all commands in a category
   */
  private executeAllInCategory(category: ScriptCategory): void {
    const allCommand = category.commands.find((cmd) => cmd.name === "all");

    if (allCommand) {
      console.log(`\\n▶️  ${category.icon} ${allCommand.description}\\n`);
      console.log(`🔧 Command: ${allCommand.command}\\n`);

      try {
        execSync(allCommand.command, { cwd: this.cwd, stdio: "inherit" });
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
          execSync(command.command, { cwd: this.cwd, stdio: "inherit" });
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
   * Get context-specific argument examples based on category and command
   */
  private getArgumentExamples(
    categoryName: string,
    commandName: string
  ): string {
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
  private listAllCommands(): void {
    if (!this.config.categories?.length) {
      console.log("No categories configured.");
      return;
    }

    console.log(
      `\\n📋 All Available Commands for ${this.config.projectName || "Project"}`
    );
    console.log("━".repeat(60));

    for (const category of this.config.categories) {
      console.log(
        `\\n${category.icon} ${category.name} - ${category.description}`
      );

      for (const command of category.commands) {
        console.log(
          `   script-runner ${category.name} ${command.name.padEnd(15)} - ${command.description}`
        );
      }
    }

    console.log("\\n💡 Usage: script-runner <category> <command>");
    console.log("💡 Interactive: script-runner -i");
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    const categories = this.config.categories || [];

    console.log(`
📋 Interactive Script Runner

🎯 Usage:
  script-runner                     # Interactive mode
  script-runner -i                  # Interactive mode  
  script-runner <category>          # Show category commands
  script-runner <category> <cmd>    # Run specific command
  script-runner <category> --all    # Run all commands in category
  script-runner -l                  # List all commands
  script-runner -h                  # Show this help

🔧 Category Shortcuts:
  Testing:
    script-runner test --e2e        # Run E2E tests
    script-runner test --unit       # Run unit tests
    script-runner test --watch      # Run unit tests in watch mode
    script-runner test --all        # Run all tests
    
  Development:
    script-runner dev --start       # Start development server
    script-runner dev --build       # Build for production
    script-runner dev --preview     # Start production server
    
  Quality:
    script-runner quality --lint    # Run linting
    script-runner quality --format  # Format code
    script-runner quality --type    # Type checking
    script-runner quality --all     # All quality checks

📦 Categories:
${categories.map((cat) => `  ${cat.name.padEnd(10)} ${cat.icon} ${cat.description}`).join("\\n")}

🌟 Examples:
  script-runner                     # Interactive main menu
  script-runner test                # Interactive test menu  
  script-runner test unit           # Run unit tests directly
  script-runner quality lint src/   # Lint specific directory
  script-runner test e2e --headed   # E2E tests in headed mode

📝 Configuration:
  Create script-runner.config.js or .scriptrunner.json to customize categories and commands
    `);
  }
}
