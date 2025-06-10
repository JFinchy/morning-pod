/**
 * Core interfaces for the Interactive Script Runner package
 */

export interface ScriptCommand {
  /** Optional category override for command grouping */
  category?: string;
  /** The actual command to execute */
  command: string;
  /** Human-readable description of what this command does */
  description: string;
  /** Short name/alias for the command */
  name: string;
  /** Optional flags that this command supports */
  flags?: string[];
  /** Optional examples of how to use this command */
  examples?: string[];
  /** Whether this command requires confirmation before running */
  requiresConfirmation?: boolean;
  /** Environment variables this command might need */
  env?: Record<string, string>;
}

export interface ScriptCategory {
  /** List of commands in this category */
  commands: ScriptCommand[];
  /** Human-readable description of the category */
  description: string;
  /** Emoji or icon to display with the category */
  icon: string;
  /** Short name for the category */
  name: string;
  /** Optional color theme for the category */
  color?: string;
  /** Whether commands in this category can be run in parallel */
  allowParallel?: boolean;
}

export interface ScriptConfig {
  projectName?: string;
  projectType?: "nextjs" | "react" | "node" | "generic";
  packageManager?: "npm" | "yarn" | "pnpm" | "bun";
  categories: ScriptCategory[];
  globalEnv?: Record<string, string>;
}

export interface ParsedArgs {
  mode: "interactive" | "direct" | "category" | "list" | "help";
  category?: string;
  action?: string;
  flags: string[];
}

export interface ScriptRunnerOptions {
  cwd?: string;
  config?: ScriptConfig;
  colors?: boolean;
  logger?: (message: string, level?: "info" | "warn" | "error") => void;
}

export interface ProjectTemplate {
  name: string;
  type: string;
  description: string;
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  categories: ScriptCategory[];
  globalEnv?: Record<string, string>;
}

export interface ProjectDetection {
  type: "nextjs" | "react" | "node" | "generic";
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  framework?: string;
  hasTypeScript: boolean;
  features: {
    hasDatabase: boolean;
    hasLinting: boolean;
    hasTesting: boolean;
    hasStorybook: boolean;
    hasTailwind: boolean;
  };
}

export type CommandPlaceholder =
  | "{pm}" // Package manager (npm, yarn, pnpm, bun)
  | "{lockfile}" // Lock file name (package-lock.json, yarn.lock, etc.)
  | "{srcDir}" // Source directory (src, lib, etc.)
  | "{buildDir}" // Build/output directory (dist, build, .next, etc.)
  | "{configExt}" // Config file extension (.js, .ts, .mjs)
  | "{testExt}"; // Test file extension (.test.js, .spec.ts, etc.)
