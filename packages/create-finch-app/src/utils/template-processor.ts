import fs from "fs-extra";
import path from "path";

export interface TemplateVariables {
  projectName: string;
  projectNameKebab: string;
  projectNamePascal: string;
  hasDatabase: boolean;
  hasTrpc: boolean;
  hasAuth: boolean;
  hasTesting: boolean;
  hasAnalytics: boolean;
  hasAdvanced: boolean;
  isDemo: boolean;
}

export interface FileCondition {
  // Conditions under which this file should be included
  database?: boolean;
  trpc?: boolean;
  auth?: boolean;
  testing?: boolean;
  analytics?: boolean;
  advanced?: boolean;
  demo?: boolean;
}

export interface TemplateFile {
  source: string; // Source path in template
  target: string; // Target path in generated project
  condition?: FileCondition; // When to include this file
  template?: boolean; // Whether to process template variables
}

/**
 * Process template variables in file content
 */
export function processTemplate(
  content: string,
  variables: TemplateVariables
): string {
  let processed = content;

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    processed = processed.replace(regex, String(value));
  });

  // Handle conditional blocks
  processed = processConditionalBlocks(processed, variables);

  return processed;
}

/**
 * Process conditional blocks like {{#if hasDatabase}}...{{/if}}
 */
function processConditionalBlocks(
  content: string,
  variables: TemplateVariables
): string {
  let processed = content;

  // Handle if blocks
  const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
  processed = processed.replace(ifRegex, (match, condition, block) => {
    return variables[condition as keyof TemplateVariables] ? block : "";
  });

  // Handle unless blocks
  const unlessRegex = /{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g;
  processed = processed.replace(unlessRegex, (match, condition, block) => {
    return !variables[condition as keyof TemplateVariables] ? block : "";
  });

  return processed;
}

/**
 * Check if a file should be included based on conditions
 */
export function shouldIncludeFile(
  condition: FileCondition | undefined,
  variables: TemplateVariables
): boolean {
  if (!condition) return true;

  return Object.entries(condition).every(([key, value]) => {
    const variableKey =
      `has${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof TemplateVariables;
    const actualValue =
      key === "demo" ? variables.isDemo : variables[variableKey];
    return actualValue === value;
  });
}

/**
 * Copy and process template files
 */
export async function processTemplateFiles(
  templateDir: string,
  targetDir: string,
  files: TemplateFile[],
  variables: TemplateVariables
): Promise<void> {
  for (const file of files) {
    // Check if file should be included
    if (!shouldIncludeFile(file.condition, variables)) {
      continue;
    }

    const sourcePath = path.join(templateDir, file.source);
    const targetPath = path.join(targetDir, file.target);

    // Ensure target directory exists
    await fs.ensureDir(path.dirname(targetPath));

    if (file.template) {
      // Process template variables
      const content = await fs.readFile(sourcePath, "utf-8");
      const processed = processTemplate(content, variables);
      await fs.writeFile(targetPath, processed);
    } else {
      // Copy file as-is
      await fs.copy(sourcePath, targetPath);
    }
  }
}

/**
 * Create template variables from project config
 */
export function createTemplateVariables(config: {
  name: string;
  database: boolean;
  trpc: boolean;
  auth: boolean;
  testing: string;
  analytics: boolean;
  advanced: boolean;
  content: string;
}): TemplateVariables {
  const projectNameKebab = config.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const projectNamePascal = config.name
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  return {
    projectName: config.name,
    projectNameKebab,
    projectNamePascal,
    hasDatabase: config.database,
    hasTrpc: config.trpc,
    hasAuth: config.auth,
    hasTesting: config.testing !== "none",
    hasAnalytics: config.analytics,
    hasAdvanced: config.advanced,
    isDemo: config.content === "demo",
  };
}
