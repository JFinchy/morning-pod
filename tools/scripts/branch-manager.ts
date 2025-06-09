#!/usr/bin/env bun

/**
 * Branch Management Tool
 *
 * @description Archive old branches, clean up merged branches, and navigate recent branches
 * @usage bun run tools/scripts/branch-manager.ts [options]
 *
 * ARCHIVING EXPLAINED:
 * - "Archive" means creating a Git tag to preserve the branch history
 * - The local branch is then deleted to reduce clutter
 * - NO CODE IS LOST - everything is preserved in the tag
 * - You can restore any archived branch later with: git checkout -b <name> archive/<name>
 * - Archive tags can be pushed to remote for team access
 */

import { execSync } from "child_process";

import * as p from "@clack/prompts";

interface BranchInfo {
  name: string;
  lastCommitDate: Date;
  lastCommitHash: string;
  lastCommitMessage: string;
  isRemote: boolean;
  isMerged: boolean;
  daysSinceLastCommit: number;
}

class BranchManager {
  private defaultBranch = "main";
  private excludedBranches = [
    "main",
    "master",
    "develop",
    "staging",
    "production",
  ];

  /**
   * Get all local branches with metadata
   */
  getLocalBranches(): BranchInfo[] {
    try {
      // Get branch names and last commit info
      const branchOutput = execSync(
        // cspell:disable-next-line - Git format placeholders
        'git for-each-ref --format="%(refname:short)|%(committerdate:iso8601)|%(objectname:short)|%(subject)" refs/heads/',
        { encoding: "utf8" }
      );

      const branches: BranchInfo[] = [];

      for (const line of branchOutput.trim().split("\n")) {
        if (!line) continue;

        const [name, dateStr, hash, message] = line.split("|");
        const lastCommitDate = new Date(dateStr);
        const daysSinceLastCommit = Math.floor(
          (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if branch exists on remote
        const isRemote = this.checkRemoteBranchExists(name);

        // Check if branch is merged into main
        const isMerged = this.checkBranchMerged(name);

        branches.push({
          name,
          lastCommitDate,
          lastCommitHash: hash,
          lastCommitMessage: message,
          isRemote,
          isMerged,
          daysSinceLastCommit,
        });
      }

      return branches.filter((b) => !this.excludedBranches.includes(b.name));
    } catch (error) {
      console.error("Error getting branch information:", error);
      return [];
    }
  }

  /**
   * Check if a branch exists on remote
   */
  private checkRemoteBranchExists(branchName: string): boolean {
    try {
      execSync(
        `git show-ref --verify --quiet refs/remotes/origin/${branchName}`,
        {
          stdio: "pipe",
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a branch is merged into main
   */
  private checkBranchMerged(branchName: string): boolean {
    try {
      const mergedBranches = execSync(
        `git branch --merged ${this.defaultBranch}`,
        { encoding: "utf8" }
      );
      return mergedBranches.includes(branchName);
    } catch {
      return false;
    }
  }

  /**
   * Get recently active branches for checkout
   */
  getRecentBranches(limit: number = 10): BranchInfo[] {
    const branches = this.getLocalBranches();
    return branches
      .sort((a, b) => b.lastCommitDate.getTime() - a.lastCommitDate.getTime())
      .slice(0, limit);
  }

  /**
   * Interactive branch checkout
   */
  async checkoutBranch(): Promise<void> {
    const branches = this.getRecentBranches(15);

    if (branches.length === 0) {
      console.log("✅ No branches available");
      return;
    }

    const currentBranch = execSync("git branch --show-current", {
      encoding: "utf8",
    }).trim();

    const choices = branches.map((b) => ({
      value: b.name,
      label: `${b.name}${b.name === currentBranch ? " (current)" : ""}`,
      hint: `${b.daysSinceLastCommit}d ago - ${b.lastCommitMessage.substring(0, 60)}`,
    }));

    try {
      const selected = (await p.select({
        message: "Choose a branch to checkout:",
        options: choices,
      })) as string;

      if (selected === currentBranch) {
        console.log(`✅ Already on branch '${selected}'`);
        return;
      }

      // Check if there are uncommitted changes
      try {
        execSync("git diff-index --quiet HEAD --", { stdio: "pipe" });
      } catch {
        const proceed = await p.confirm({
          message:
            "You have uncommitted changes. Proceed with checkout? (will stash changes)",
          initialValue: false,
        });

        if (!proceed) {
          console.log("❌ Checkout cancelled");
          return;
        }

        // Stash changes
        console.log("📦 Stashing uncommitted changes...");
        execSync("git stash push -m 'Auto-stash before branch checkout'", {
          stdio: "inherit",
        });
      }

      // Checkout the branch
      console.log(`🔄 Switching to branch '${selected}'...`);
      execSync(`git checkout ${selected}`, { stdio: "inherit" });
      console.log(`✅ Successfully switched to '${selected}'`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("cancelled")) {
        console.log("❌ Branch checkout cancelled");
      } else {
        console.error("❌ Failed to checkout branch:", error);
      }
    }
  }

  /**
   * Archive branches (create tags and delete local branches)
   *
   * WHAT ARCHIVING DOES:
   * 1. Creates a Git tag "archive/branch-name" pointing to the branch tip
   * 2. Deletes the local branch to reduce clutter
   * 3. Preserves ALL history and commits in the tag
   * 4. Allows easy restoration: git checkout -b <name> archive/<name>
   */
  async archiveBranches(
    branches: BranchInfo[],
    dryRun: boolean = false
  ): Promise<void> {
    if (branches.length === 0) {
      console.log("✅ No branches to archive");
      return;
    }

    console.log(
      `\n📦 ${dryRun ? "Would archive" : "Archiving"} ${branches.length} branches:\n`
    );

    for (const branch of branches) {
      const tagName = `archive/${branch.name}`;

      console.log(
        `${dryRun ? "🔍" : "📦"} ${branch.name} → ${tagName} (${branch.daysSinceLastCommit} days old)`
      );

      if (!dryRun) {
        try {
          // Create archive tag
          execSync(`git tag ${tagName} ${branch.name}`, { stdio: "pipe" });

          // Delete local branch
          execSync(`git branch -D ${branch.name}`, { stdio: "pipe" });

          console.log(`   ✅ Archived as ${tagName}`);
        } catch (error) {
          console.log(`   ❌ Failed to archive: ${error}`);
        }
      }
    }

    if (!dryRun) {
      console.log(`\n📝 Archive tags created. To restore a branch later, use:`);
      console.log(`   git checkout -b <branch-name> <tag-name>`);
      console.log(`\n📤 To push archive tags to remote:`);
      console.log(`   git push origin --tags`);
    }
  }

  /**
   * Find branches that are candidates for archival based on age
   */
  findStaleBranches(days: number): BranchInfo[] {
    const branches = this.getLocalBranches();
    return branches.filter(
      (b) =>
        b.daysSinceLastCommit > days && !this.excludedBranches.includes(b.name)
    );
  }

  /**
   * Find local branches that don't exist on remote
   */
  findOrphanedBranches(): BranchInfo[] {
    const branches = this.getLocalBranches();
    return branches.filter((b) => !b.isRemote);
  }

  /**
   * Find merged branches that were deleted from remote
   */
  findMergedDeletedBranches(): BranchInfo[] {
    const branches = this.getLocalBranches();
    return branches.filter((b) => b.isMerged && !b.isRemote);
  }

  /**
   * Interactive branch selection
   */
  async selectBranchesInteractively(
    branches: BranchInfo[]
  ): Promise<BranchInfo[]> {
    if (branches.length === 0) {
      console.log("✅ No branches found matching criteria");
      return [];
    }

    const choices = branches.map((b) => ({
      value: b.name,
      label: `${b.name} (${b.daysSinceLastCommit}d ago) ${b.isMerged ? "✓merged" : ""} ${!b.isRemote ? "🔒local-only" : ""}`,
      hint: b.lastCommitMessage.substring(0, 60),
    }));

    try {
      const selected = (await p.multiselect({
        message: "Select branches to archive:",
        options: choices,
        required: false,
      })) as string[];

      return branches.filter((b) => selected.includes(b.name));
    } catch {
      return [];
    }
  }

  /**
   * Show branch analysis
   */
  showBranchAnalysis(): void {
    const branches = this.getLocalBranches();

    console.log("\n📊 Branch Analysis\n");

    const totalBranches = branches.length;
    const staleBranches30 = branches.filter(
      (b) => b.daysSinceLastCommit > 30
    ).length;
    const staleBranches90 = branches.filter(
      (b) => b.daysSinceLastCommit > 90
    ).length;
    const orphanedBranches = branches.filter((b) => !b.isRemote).length;
    const mergedBranches = branches.filter((b) => b.isMerged).length;

    console.log(`📈 Total local branches: ${totalBranches}`);
    console.log(`⏰ Stale (>30 days): ${staleBranches30}`);
    console.log(`🗿 Very stale (>90 days): ${staleBranches90}`);
    console.log(`🔒 Local-only branches: ${orphanedBranches}`);
    console.log(`✅ Merged branches: ${mergedBranches}`);

    if (branches.length > 0) {
      console.log("\n📋 Recent branches:");
      branches
        .sort((a, b) => b.lastCommitDate.getTime() - a.lastCommitDate.getTime())
        .slice(0, 5)
        .forEach((b) => {
          const status = [];
          if (b.isMerged) status.push("✓merged");
          if (!b.isRemote) status.push("🔒local-only");

          console.log(
            `   ${b.name.padEnd(20)} ${b.daysSinceLastCommit.toString().padStart(3)}d ago ${status.join(" ")}`
          );
        });
    }
  }

  /**
   * Main execution method
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run") || args.includes("-d");
    const force = args.includes("--force") || args.includes("-f");
    const interactive = args.includes("--interactive") || args.includes("-i");
    const analysis = args.includes("--analysis") || args.includes("-a");
    const checkout = args.includes("--checkout") || args.includes("-c");

    // Parse days argument
    const daysArg = args.find((arg) => arg.startsWith("--days="));
    const days = daysArg ? parseInt(daysArg.split("=")[1]) : 30;

    p.intro("🌿 Branch Manager");

    if (analysis) {
      this.showBranchAnalysis();
      return;
    }

    if (checkout) {
      await this.checkoutBranch();
      return;
    }

    // Determine which branches to target
    let targetBranches: BranchInfo[] = [];

    if (args.includes("--stale")) {
      targetBranches = this.findStaleBranches(days);
      console.log(
        `\n🔍 Found ${targetBranches.length} stale branches (>${days} days old)`
      );
    } else if (args.includes("--orphaned")) {
      targetBranches = this.findOrphanedBranches();
      console.log(`\n🔍 Found ${targetBranches.length} local-only branches`);
    } else if (args.includes("--merged")) {
      targetBranches = this.findMergedDeletedBranches();
      console.log(
        `\n🔍 Found ${targetBranches.length} merged branches deleted from remote`
      );
    } else {
      // Default: show options
      const action = (await p.select({
        message: "What would you like to do?",
        options: [
          {
            value: "checkout",
            label: "🔄 Switch to recent branch",
            hint: "Quick branch switching",
          },
          {
            value: "analysis",
            label: "📊 Show branch analysis",
            hint: "View statistics",
          },
          {
            value: "stale",
            label: `🗿 Archive stale branches (>${days} days old)`,
            hint: "Clean up old branches",
          },
          {
            value: "orphaned",
            label: "🔒 Archive local-only branches",
            hint: "Branches not on remote",
          },
          {
            value: "merged",
            label: "✅ Archive merged branches",
            hint: "Deleted from remote",
          },
          {
            value: "custom",
            label: "🎯 Custom selection",
            hint: "Pick specific branches",
          },
        ],
      })) as string;

      switch (action) {
        case "checkout":
          await this.checkoutBranch();
          return;
        case "stale":
          targetBranches = this.findStaleBranches(days);
          break;
        case "orphaned":
          targetBranches = this.findOrphanedBranches();
          break;
        case "merged":
          targetBranches = this.findMergedDeletedBranches();
          break;
        case "analysis":
          this.showBranchAnalysis();
          return;
        case "custom":
          targetBranches = await this.selectBranchesInteractively(
            this.getLocalBranches()
          );
          break;
      }
    }

    if (targetBranches.length === 0) {
      p.outro("✅ No branches to archive");
      return;
    }

    // Interactive selection if requested
    if (interactive && !args.includes("--custom")) {
      targetBranches = await this.selectBranchesInteractively(targetBranches);
    }

    if (targetBranches.length === 0) {
      p.outro("✅ No branches selected");
      return;
    }

    // Confirm before proceeding
    if (!force && !dryRun) {
      const confirm = await p.confirm({
        message: `Archive ${targetBranches.length} branches? This will create tags and delete local branches.`,
        initialValue: false,
      });

      if (!confirm) {
        p.outro("❌ Operation cancelled");
        return;
      }
    }

    await this.archiveBranches(targetBranches, dryRun);

    const action = dryRun ? "analyzed" : "archived";
    p.outro(`✅ Successfully ${action} ${targetBranches.length} branches`);
  }
}

// Show help
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🌿 Branch Manager - Navigate, archive, and clean up branches

Usage:
  bun run tools/scripts/branch-manager.ts [options]

Options:
  --checkout, -c          Switch to recent branch interactively
  --analysis, -a          Show branch analysis and statistics
  --stale                 Archive stale branches (default: >30 days)
  --orphaned             Archive branches that don't exist on remote  
  --merged               Archive merged branches deleted from remote
  --days=N               Set staleness threshold in days (default: 30)
  --interactive, -i      Interactive branch selection
  --dry-run, -d         Show what would be archived without doing it
  --force, -f           Skip confirmation prompts
  --help, -h            Show this help

Examples:
  bun run tools/scripts/branch-manager.ts                    # Interactive mode
  bun run tools/scripts/branch-manager.ts --checkout         # Quick branch switching
  bun run tools/scripts/branch-manager.ts --analysis         # Show branch statistics
  bun run tools/scripts/branch-manager.ts --stale --days=60  # Archive branches >60 days old
  bun run tools/scripts/branch-manager.ts --orphaned -d      # Dry run for local-only branches
  bun run tools/scripts/branch-manager.ts --merged -f        # Archive merged branches (no confirm)

WHAT "ARCHIVE" MEANS:
  ✅ Creates a Git tag 'archive/branch-name' preserving ALL history
  ✅ Deletes the local branch to reduce clutter
  ✅ NO CODE IS LOST - everything is safely preserved
  ✅ Easy restoration: git checkout -b <name> archive/<name>
  ✅ Tags can be pushed to remote for team access

Navigation Features:
  - Quick checkout from recently active branches
  - Shows branch age and last commit message  
  - Auto-stash uncommitted changes if needed
  - Smart filtering by activity
`);
  process.exit(0);
}

// Run the script only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new BranchManager();
  manager.run().catch((error) => {
    console.error("Branch manager failed:", error);
    process.exit(1);
  });
}
