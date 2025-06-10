#!/usr/bin/env node

import { ScriptRunner } from "./runner.js";

/**
 * CLI entry point for the Interactive Script Runner
 */
async function main() {
  try {
    const runner = new ScriptRunner();
    await runner.run();
  } catch (error) {
    console.error("❌ Script runner failed:", error);
    process.exit(1);
  }
}

main();
