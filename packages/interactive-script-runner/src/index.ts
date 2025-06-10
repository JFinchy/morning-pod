/**
 * Interactive Script Runner - Main package exports
 *
 * @description Beautiful interactive script runner for package.json commands
 * @author Jacob Finch
 */

// Main classes
export { ScriptRunner } from "./runner.js";
export { ConfigLoader } from "./config/loader.js";

// Types
export type {
  ScriptCommand,
  ScriptCategory,
  ScriptConfig,
  ParsedArgs,
  ScriptRunnerOptions,
  ProjectTemplate,
} from "./types.js";

// Templates
export { defaultTemplates } from "./templates/index.js";

// Default export for convenience
export { ScriptRunner as default } from "./runner.js";
