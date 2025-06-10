#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { createApp } from "./cli/create-app";

const packageJson = require("../package.json");

const program = new Command();

console.log(
  chalk.cyan(`
🐦 Welcome to Finch
${chalk.dim("Opinionated Next.js starter with battle-tested patterns")}
`)
);

program
  .name("create-finch-app")
  .description(
    "Create a new Next.js app with opinionated, production-ready configuration"
  )
  .version(packageJson.version)
  .argument("[project-name]", "Name of the project to create")
  .option("-t, --template <template>", "Template to use", "default")
  .option("--no-install", "Skip installing dependencies")
  .option("--no-git", "Skip git repository initialization")
  .action(async (projectName: string, options) => {
    try {
      await createApp(projectName, options);
    } catch (error) {
      console.error(chalk.red("Error creating app:"), error);
      process.exit(1);
    }
  });

program.parse();
