import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type {
  ScriptConfig,
  ProjectDetection,
  ProjectTemplate,
  CommandPlaceholder,
} from "../types.js";
import {
  getNextjsTemplate,
  getReactTemplate,
  getNodejsTemplate,
  getGenericTemplate,
} from "../templates/index.js";

/**
 * Configuration loader for script runner
 *
 * @business-context Automatically detects project type and loads appropriate
 *                   templates while allowing user customization
 */
export class ConfigLoader {
  private cwd: string;
  private projectDetection?: ProjectDetection;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Load configuration from files or templates
   */
  async loadConfig(): Promise<ScriptConfig> {
    // First try to load from config files
    const userConfig = this.loadUserConfig();
    if (userConfig) {
      return this.processConfig(userConfig);
    }

    // If no user config, detect project and use templates
    const detection = this.detectProject();
    const template = this.getTemplateForProject(detection);

    return this.processConfig({
      projectName: this.getProjectName(),
      projectType: detection.type,
      packageManager: detection.packageManager,
      categories: template.categories,
      globalEnv: template.globalEnv,
    });
  }

  /**
   * Load user configuration from config files
   */
  private loadUserConfig(): ScriptConfig | null {
    const configFiles = [
      "script-runner.config.js",
      "script-runner.config.mjs",
      "script-runner.config.json",
      ".scriptrunner.json",
      ".scriptrunnerrc.json",
    ];

    for (const fileName of configFiles) {
      const filePath = join(this.cwd, fileName);
      if (existsSync(filePath)) {
        try {
          if (fileName.endsWith(".json")) {
            const content = readFileSync(filePath, "utf-8");
            return JSON.parse(content);
          } else {
            // Dynamic import for JS/MJS files
            const module = require(filePath);
            return module.default || module;
          }
        } catch (error) {
          console.warn(`Failed to load config from ${fileName}:`, error);
        }
      }
    }

    return null;
  }

  /**
   * Detect project type and characteristics
   */
  private detectProject(): ProjectDetection {
    if (this.projectDetection) {
      return this.projectDetection;
    }

    const packageJsonPath = join(this.cwd, "package.json");
    let packageJson: any = {};

    if (existsSync(packageJsonPath)) {
      try {
        packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      } catch (error) {
        console.warn("Failed to parse package.json:", error);
      }
    }

    // Detect package manager
    const packageManager = this.detectPackageManager();

    // Detect TypeScript
    const hasTypeScript =
      existsSync(join(this.cwd, "tsconfig.json")) ||
      Boolean(packageJson.devDependencies?.typescript) ||
      Boolean(packageJson.dependencies?.typescript);

    // Detect framework/project type
    let type: ProjectDetection["type"] = "generic";
    let framework: string | undefined;

    if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
      type = "nextjs";
      framework = "Next.js";
    } else if (
      packageJson.dependencies?.react ||
      packageJson.devDependencies?.react
    ) {
      type = "react";
      framework = "React";
    } else if (
      packageJson.dependencies?.express ||
      packageJson.dependencies?.fastify ||
      packageJson.dependencies?.koa ||
      existsSync(join(this.cwd, "server.js")) ||
      existsSync(join(this.cwd, "index.js"))
    ) {
      type = "node";
      framework = "Node.js";
    }

    // Detect features
    const features = {
      hasDatabase: Boolean(
        packageJson.dependencies?.prisma ||
          packageJson.dependencies?.drizzle ||
          packageJson.dependencies?.mongoose ||
          packageJson.dependencies?.typeorm
      ),
      hasLinting: Boolean(
        packageJson.devDependencies?.eslint ||
          existsSync(join(this.cwd, ".eslintrc.js")) ||
          existsSync(join(this.cwd, ".eslintrc.json")) ||
          existsSync(join(this.cwd, "eslint.config.js"))
      ),
      hasTesting: Boolean(
        packageJson.devDependencies?.jest ||
          packageJson.devDependencies?.vitest ||
          packageJson.devDependencies?.playwright ||
          packageJson.devDependencies?.cypress
      ),
      hasStorybook: Boolean(
        packageJson.devDependencies?.storybook ||
          packageJson.devDependencies?.["@storybook/react"]
      ),
      hasTailwind: Boolean(
        packageJson.dependencies?.tailwindcss ||
          packageJson.devDependencies?.tailwindcss ||
          existsSync(join(this.cwd, "tailwind.config.js"))
      ),
    };

    this.projectDetection = {
      type,
      packageManager,
      framework,
      hasTypeScript,
      features,
    };

    return this.projectDetection;
  }

  /**
   * Detect the package manager being used
   */
  private detectPackageManager(): "npm" | "yarn" | "pnpm" | "bun" {
    if (existsSync(join(this.cwd, "bun.lockb"))) return "bun";
    if (existsSync(join(this.cwd, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(join(this.cwd, "yarn.lock"))) return "yarn";
    return "npm";
  }

  /**
   * Get project name from package.json or directory name
   */
  private getProjectName(): string {
    const packageJsonPath = join(this.cwd, "package.json");

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (packageJson.name) {
          return packageJson.name;
        }
      } catch (error) {
        // Fallback to directory name
      }
    }

    return this.cwd.split("/").pop() || "project";
  }

  /**
   * Get template based on project detection
   */
  private getTemplateForProject(detection: ProjectDetection): ProjectTemplate {
    switch (detection.type) {
      case "nextjs":
        return getNextjsTemplate(detection);
      case "react":
        return getReactTemplate(detection);
      case "node":
        return getNodejsTemplate(detection);
      default:
        return getGenericTemplate(detection);
    }
  }

  /**
   * Process config by replacing placeholders and validating
   */
  private processConfig(config: ScriptConfig): ScriptConfig {
    const detection = this.detectProject();

    // Process each category and command
    const processedCategories = config.categories.map((category) => ({
      ...category,
      commands: category.commands.map((command) => ({
        ...command,
        command: this.replacePlaceholders(command.command, detection),
      })),
    }));

    return {
      ...config,
      categories: processedCategories,
    };
  }

  /**
   * Replace placeholders in command strings
   */
  private replacePlaceholders(
    command: string,
    detection: ProjectDetection
  ): string {
    const placeholders: Record<CommandPlaceholder, string> = {
      "{pm}": detection.packageManager,
      "{lockfile}": this.getLockfileName(detection.packageManager),
      "{srcDir}": this.getSourceDirectory(),
      "{buildDir}": this.getBuildDirectory(detection.type),
      "{configExt}": detection.hasTypeScript ? ".ts" : ".js",
      "{testExt}": detection.hasTypeScript ? ".test.ts" : ".test.js",
    };

    let processedCommand = command;

    for (const [placeholder, value] of Object.entries(placeholders)) {
      processedCommand = processedCommand.replace(
        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
        value
      );
    }

    return processedCommand;
  }

  /**
   * Get lockfile name for package manager
   */
  private getLockfileName(packageManager: string): string {
    switch (packageManager) {
      case "yarn":
        return "yarn.lock";
      case "pnpm":
        return "pnpm-lock.yaml";
      case "bun":
        return "bun.lockb";
      default:
        return "package-lock.json";
    }
  }

  /**
   * Detect source directory
   */
  private getSourceDirectory(): string {
    if (existsSync(join(this.cwd, "src"))) return "src";
    if (existsSync(join(this.cwd, "lib"))) return "lib";
    if (existsSync(join(this.cwd, "app"))) return "app";
    return ".";
  }

  /**
   * Get build/output directory based on project type
   */
  private getBuildDirectory(projectType: string): string {
    switch (projectType) {
      case "nextjs":
        return ".next";
      case "react":
        return "build";
      case "node":
        return "dist";
      default:
        return "dist";
    }
  }
}
