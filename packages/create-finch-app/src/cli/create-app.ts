import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import { input, select, confirm } from "@inquirer/prompts";
import validateProjectName from "validate-npm-package-name";
import {
  createTemplateVariables,
  processTemplateFiles,
  type TemplateVariables,
} from "../utils/template-processor";
import { templateFiles } from "../templates/file-registry";

interface CreateAppOptions {
  template?: string;
  install?: boolean;
  git?: boolean;
}

interface ProjectConfig {
  name: string;
  database: boolean;
  trpc: boolean;
  auth: boolean;
  testing: "full" | "unit" | "none";
  analytics: boolean;
  advanced: boolean;
  content: "clean" | "demo";
}

export async function createApp(
  projectName: string,
  options: CreateAppOptions
): Promise<void> {
  console.log(
    chalk.blue(
      "\n✨ Let's set up your project with battle-tested patterns...\n"
    )
  );

  // Get project name if not provided
  if (!projectName) {
    projectName = await input({
      message: "Project name:",
      default: "my-finch-app",
      validate: (input: string) => {
        const validation = validateProjectName(input);
        if (!validation.validForNewPackages) {
          return validation.errors?.[0] || "Invalid project name";
        }
        return true;
      },
    });
  }

  // Validate project name
  const validation = validateProjectName(projectName);
  if (!validation.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: ${validation.errors?.[0]}`));
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`Directory ${projectName} already exists!`));
    process.exit(1);
  }

  // Interactive configuration
  const config = await getProjectConfig(projectName);

  // Create the project
  await generateProject(projectPath, config, options);

  console.log(
    chalk.green(`
✅ Project created successfully!

Next steps:
  ${chalk.cyan(`cd ${projectName}`)}
  ${chalk.cyan("npm run dev")}

📚 Check TASKS.md for development workflows
🤖 AI rules configured for Cursor, Claude, VSCode, Windsurf
`)
  );
}

async function getProjectConfig(projectName: string): Promise<ProjectConfig> {
  console.log(chalk.dim("Answer a few questions to customize your setup:\n"));

  const database = await confirm({
    message: "🗄️  Include database (Drizzle ORM)?",
    default: true,
  });

  const trpc = await confirm({
    message: "⚡ Include tRPC for type-safe APIs?",
    default: true,
  });

  const auth = await confirm({
    message: "🔐 Add Better Auth authentication?",
    default: false,
  });

  const testing = (await select({
    message: "🧪 Testing setup?",
    choices: [
      { name: "🎭 Full suite (Playwright E2E + Vitest unit)", value: "full" },
      { name: "🧪 Unit tests only (Vitest)", value: "unit" },
      { name: "❌ No testing setup", value: "none" },
    ],
    default: "full",
  })) as "full" | "unit" | "none";

  const analytics = await confirm({
    message: "📊 Include PostHog (analytics + feature flags)?",
    default: false,
  });

  const advanced = await confirm({
    message: "🚀 Include advanced deployment features?",
    default: false,
  });

  const content = (await select({
    message: "📝 Project starting point?",
    choices: [
      { name: "🏗️  Clean template (minimal examples)", value: "clean" },
      { name: "📋 Demo content (mock data, example pages)", value: "demo" },
    ],
    default: "clean",
  })) as "clean" | "demo";

  return {
    name: projectName,
    database,
    trpc,
    auth,
    testing,
    analytics,
    advanced,
    content,
  };
}

async function generateProject(
  projectPath: string,
  config: ProjectConfig,
  options: CreateAppOptions
): Promise<void> {
  const spinner = ora("Creating project structure...").start();

  try {
    // Create project directory
    await fs.ensureDir(projectPath);

    // TODO: Copy and process template files based on config
    spinner.text = "Copying template files...";

    // Basic Next.js structure for now
    await createBasicStructure(projectPath, config);

    spinner.succeed("Project structure created!");

    // Install dependencies
    if (options.install !== false) {
      const installSpinner = ora("Installing dependencies...").start();
      // TODO: Install dependencies
      installSpinner.succeed("Dependencies installed!");
    }

    // Initialize git
    if (options.git !== false) {
      const gitSpinner = ora("Initializing git repository...").start();
      // TODO: Initialize git
      gitSpinner.succeed("Git repository initialized!");
    }
  } catch (error) {
    spinner.fail("Failed to create project");
    throw error;
  }
}

async function createBasicStructure(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  // Create template variables
  const variables = createTemplateVariables(config);

  // Get template directory path
  // Templates are copied to dist/templates during build
  const templateDir = path.join(__dirname, "..", "templates");

  // Process and copy template files
  await processTemplateFiles(
    templateDir,
    projectPath,
    templateFiles,
    variables
  );
}
