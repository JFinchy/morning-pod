# 🌿 Branch Management Guide

Comprehensive guide to managing Git branches with our interactive branch management tool.

## Quick Start

```bash
# Most common: Quick branch switching
bun run script branches checkout

# Interactive mode (shows all options)
bun run script branches

# Show branch statistics
bun run script branches analysis
```

## 🔄 Branch Navigation

### Quick Checkout

Switch between your recently active branches with an interactive menu:

```bash
# Via script runner
bun run script branches checkout
bun run script branches --checkout

# Direct command
bun run tools/scripts/branch-manager.ts --checkout
bun run tools/scripts/branch-manager.ts -c
```

**Features:**

- Shows last 15 most recently active branches
- Displays branch age (e.g., "3d ago")
- Shows last commit message preview
- Highlights current branch
- Auto-stashes uncommitted changes if needed
- Smart conflict detection

**Example Output:**

```
Choose a branch to checkout:
> feat/user-auth (current)
  feat/api-improvements    2d ago - Add rate limiting middleware
  fix/login-validation     5d ago - Fix email validation regex
  feat/dashboard-ui        1w ago - Update dashboard layout
```

## 📦 Branch Archiving

### What "Archive" Means

**IMPORTANT**: Archiving is completely safe and reversible!

✅ **What happens:**

- Creates a Git tag `archive/branch-name` preserving ALL history
- Deletes the local branch to reduce clutter
- **NO CODE IS LOST** - everything is safely preserved in the tag

✅ **Benefits:**

- Cleaner `git branch` output
- Faster Git operations
- Full history preservation
- Easy restoration anytime

✅ **Restoration:**

```bash
# Restore any archived branch
git checkout -b <branch-name> archive/<branch-name>

# Example
git checkout -b feat/user-auth archive/feat/user-auth
```

### Archive Strategies

#### 1. Stale Branches (Time-based)

Archive branches that haven't been touched in a while:

```bash
# Default: Archive branches >30 days old
bun run script branches stale

# Custom threshold: Archive branches >60 days old
bun run tools/scripts/branch-manager.ts --stale --days=60

# Preview first (recommended)
bun run script branches preview
```

#### 2. Orphaned Branches (Local-only)

Archive branches that exist locally but not on the remote:

```bash
# Archive local-only branches
bun run script branches orphaned

# Preview first
bun run tools/scripts/branch-manager.ts --orphaned --dry-run
```

**Common scenarios:**

- Experimental branches never pushed
- Branches created for local testing
- Old feature branches removed from remote

#### 3. Merged Branches (Cleaned up remotely)

Archive branches that were merged to main and deleted from remote:

```bash
# Archive merged branches deleted from remote
bun run script branches merged

# Force mode (skip confirmations)
bun run tools/scripts/branch-manager.ts --merged --force
```

**Common scenarios:**

- Feature branches merged via PR
- Hotfix branches merged and cleaned up
- Completed work branches

## 📊 Branch Analysis

Get insights into your branch landscape:

```bash
bun run script branches analysis
```

**Sample Output:**

```
📊 Branch Analysis

📈 Total local branches: 12
⏰ Stale (>30 days): 3
🗿 Very stale (>90 days): 1
🔒 Local-only branches: 5
✅ Merged branches: 2

📋 Recent branches:
   feat/user-auth       3d ago ✓merged
   fix/login-bug        1w ago 🔒local-only
   feat/dashboard       2w ago
```

## 🎯 Interactive Mode

Full-featured interactive interface:

```bash
bun run script branches
```

**Options presented:**

1. **🔄 Switch to recent branch** - Quick checkout
2. **📊 Show branch analysis** - Statistics overview
3. **🗿 Archive stale branches** - Time-based cleanup
4. **🔒 Archive local-only branches** - Orphaned cleanup
5. **✅ Archive merged branches** - Post-merge cleanup
6. **🎯 Custom selection** - Pick specific branches

## 🛡️ Safety Features

### Dry Run Mode

Preview changes without making them:

```bash
# Preview what would be archived
bun run script branches preview
bun run tools/scripts/branch-manager.ts --dry-run
```

### Confirmation Prompts

Default behavior includes safety prompts:

```bash
Archive 3 branches? This will create tags and delete local branches.
❯ No / Yes
```

Skip with `--force` for automation:

```bash
bun run tools/scripts/branch-manager.ts --merged --force
```

### Auto-stash

Automatically handles uncommitted changes during checkout:

```
You have uncommitted changes. Proceed with checkout? (will stash changes)
❯ No / Yes
```

## 🚀 Advanced Usage

### Custom Day Thresholds

```bash
# Archive branches older than 14 days
bun run tools/scripts/branch-manager.ts --stale --days=14

# Archive branches older than 3 months
bun run tools/scripts/branch-manager.ts --stale --days=90
```

### Batch Operations

```bash
# Non-interactive archival (for scripts)
bun run tools/scripts/branch-manager.ts --stale --force --dry-run

# Interactive selection from all branches
bun run tools/scripts/branch-manager.ts --interactive
```

### Team Workflows

Push archive tags to share with team:

```bash
# After archiving, push tags to remote
git push origin --tags

# Team members can then restore
git checkout -b feature-branch archive/feature-branch
```

## 📋 Complete Command Reference

### Script Runner Commands

```bash
bun run script branches checkout    # Quick branch switching
bun run script branches            # Interactive mode
bun run script branches analysis   # Branch statistics
bun run script branches stale      # Archive old branches
bun run script branches orphaned   # Archive local-only
bun run script branches merged     # Archive merged/deleted
bun run script branches preview    # Dry run for stale
```

### Direct Commands

```bash
# Navigation
bun run tools/scripts/branch-manager.ts --checkout
bun run tools/scripts/branch-manager.ts -c

# Analysis
bun run tools/scripts/branch-manager.ts --analysis
bun run tools/scripts/branch-manager.ts -a

# Archiving
bun run tools/scripts/branch-manager.ts --stale
bun run tools/scripts/branch-manager.ts --orphaned
bun run tools/scripts/branch-manager.ts --merged

# Safety options
bun run tools/scripts/branch-manager.ts --dry-run -d
bun run tools/scripts/branch-manager.ts --force -f
bun run tools/scripts/branch-manager.ts --interactive -i

# Custom thresholds
bun run tools/scripts/branch-manager.ts --stale --days=60
```

### Flag Shortcuts

```bash
# Via script runner with flags
bun run script branches --checkout
bun run script branches --analysis
bun run script branches --stale
bun run script branches --orphaned
bun run script branches --merged
bun run script branches --preview
```

## 🔧 Troubleshooting

### Common Issues

**Issue: "No branches found"**

- Solution: Ensure you're in a Git repository with multiple branches

**Issue: "Cannot archive current branch"**

- Solution: Switch to a different branch first (use checkout feature)

**Issue: "Uncommitted changes"**

- Solution: Let the tool auto-stash or commit/stash manually first

### Recovery

**Restore an archived branch:**

```bash
git checkout -b <branch-name> archive/<branch-name>
```

**List all archive tags:**

```bash
git tag -l "archive/*"
```

**Remove an archive tag (if needed):**

```bash
git tag -d archive/branch-name
```

## 💡 Best Practices

### Regular Maintenance

1. **Weekly**: Run `bun run script branches analysis` to check branch health
2. **Monthly**: Archive stale branches with `bun run script branches stale`
3. **After merges**: Clean up with `bun run script branches merged`

### Team Workflows

1. **Archive before vacation**: Clean up personal branches
2. **Share important archives**: Push tags for team access
3. **Document restoration**: Include archive names in handoff notes

### Development Workflow

1. **Use checkout feature**: Quick switching between active work
2. **Preview before archiving**: Always dry-run first for safety
3. **Customize thresholds**: Adjust staleness based on project pace

---

## 🔗 Related Documentation

- [Script Runner Guide](./SCRIPT_RUNNER.md) - Using the interactive script system
- [Git Workflow](../git/WORKFLOW.md) - General Git practices
- [Development Setup](../setup/) - Initial repository setup

_This tool is designed to keep your local Git environment clean while preserving all work safely. When in doubt, use preview mode first!_
