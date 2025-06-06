#!/usr/bin/env node

/**
 * Update component status in STATUS.json
 * Usage: node scripts/update-status.js <component> <status> [branch]
 * Example: node scripts/update-status.js ai-services in-progress feat/ai-services
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [, , component, status, branch] = process.argv;

if (!component || !status) {
  console.log(
    "Usage: node scripts/update-status.js <component> <status> [branch]"
  );
  console.log("Status options: not-started, in-progress, complete, blocked");
  process.exit(1);
}

const statusFile = path.join(__dirname, "../STATUS.json");

// Get current git branch
function getCurrentBranch() {
  try {
    return execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch (error) {
    console.warn("Could not detect git branch:", error.message);
    return "unknown";
  }
}

try {
  const statusData = JSON.parse(fs.readFileSync(statusFile, "utf8"));

  if (!statusData.components[component]) {
    console.log(
      `Component "${component}" not found. Available:`,
      Object.keys(statusData.components)
    );
    process.exit(1);
  }

  // Update global context
  statusData.lastUpdated = new Date().toISOString();
  statusData.branch = getCurrentBranch();

  // Update component status
  statusData.components[component].status = status;
  statusData.components[component].lastWorkedOn = new Date()
    .toISOString()
    .split("T")[0];

  // Update working branches
  const workingBranch = branch || statusData.branch;
  if (workingBranch && workingBranch !== "main") {
    const branches = statusData.components[component].workingBranches || [];
    if (status === "in-progress" && !branches.includes(workingBranch)) {
      branches.push(workingBranch);
    } else if (status === "complete") {
      statusData.components[component].workingBranches = [];
    }
    statusData.components[component].workingBranches = branches;
  }

  fs.writeFileSync(statusFile, JSON.stringify(statusData, null, 2));

  console.log(`✅ Updated ${component} status to: ${status}`);
  console.log(`   Branch: ${statusData.branch}`);
  if (workingBranch && workingBranch !== "main") {
    console.log(`   Working branch: ${workingBranch}`);
  }
} catch (error) {
  console.error("Error updating status:", error.message);
  process.exit(1);
}
