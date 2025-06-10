# Interactive Script Runner

[![npm version](https://badge.fury.io/js/interactive-script-runner.svg)](https://badge.fury.io/js/interactive-script-runner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive CLI tool that organizes your package.json scripts into categories with both menu-driven and direct execution modes. Say goodbye to package.json script bloat and hello to discoverable, organized command execution.

## ✨ Features

- **🎯 Interactive Menu**: Beautiful category-based script selection
- **⚡ Direct Execution**: Run commands directly without menus
- **📁 Smart Detection**: Auto-detects project type (Next.js, React, Node.js)
- **🔧 Placeholder Support**: Dynamic command placeholders (`{pm}`, `{lockfile}`, etc.)
- **🎨 Project Templates**: Pre-built templates for popular frameworks
- **⚙️ Configurable**: Fully customizable via config files
- **🚀 Modern CLI**: Built with @clack/prompts for beautiful UX
- **📦 Zero Config**: Works out of the box with sensible defaults

## 🚀 Quick Start

### Installation

```bash
# Global installation (recommended)
npm install -g interactive-script-runner

# Or with your preferred package manager
yarn global add interactive-script-runner
pnpm add -g interactive-script-runner
bun add -g interactive-script-runner
```

### Usage

```bash
# Interactive mode (main menu)
script-runner

# List all available commands
script-runner -l

# Run specific category/command
script-runner test unit
script-runner dev start

# Category shortcuts
script-runner test --e2e
script-runner quality --lint
```

## 📋 Usage Examples

### Interactive Mode

```bash
script-runner
# Opens beautiful category selection menu
# Navigate with arrow keys, search by typing
# Add additional arguments interactively
```

### Direct Execution

```bash
# Development
script-runner dev start          # Start development server
script-runner dev build          # Build for production
script-runner dev clean          # Clean install dependencies

# Testing
script-runner test unit          # Run unit tests
script-runner test e2e           # Run E2E tests
script-runner test --all         # Run all tests

# Quality
script-runner quality lint       # Run linting
script-runner quality format     # Format code
script-runner quality --type     # Type checking
```

### Category Shortcuts

```bash
script-runner test --unit        # Quick unit tests
script-runner test --e2e         # Quick E2E tests
script-runner dev --start        # Quick dev server
script-runner quality --all      # All quality checks
```

## 🎨 Project Templates

The package automatically detects your project type and provides appropriate commands:

### Next.js Projects

- Development: `start`, `build`, `preview`, `clean`
- Testing: `unit` (Vitest), `e2e` (Playwright), `all`
- Quality: `lint` (Next.js ESLint), `format`, `type-check`
- Database: `generate`, `migrate`, `studio` (if Drizzle detected)

### React Projects

- Development: `start`, `build`, `preview`, `clean`
- Testing: `unit`, `coverage`, `e2e` (if detected)
- Quality: `lint`, `format`, `type-check` (if TypeScript)

### Node.js Projects

- Development: `start`, `dev`, `build`, `clean`
- Database: `migrate`, `seed` (if detected)
- Testing: `test`, `coverage` (if detected)

### Generic Projects

- Development: `start`, `build`, `clean`
- Testing: `test`
- Quality: `lint`, `format`, `type-check` (if applicable)

## ⚙️ Configuration

### Config File Options

Create a `script-runner.config.js` or `.scriptrunner.json` file:

```javascript
// script-runner.config.js
export default {
  projectName: "My Awesome Project",
  packageManager: "bun", // npm, yarn, pnpm, bun
  categories: [
    {
      name: "dev",
      description: "Development Commands",
      icon: "🚀",
      commands: [
        {
          name: "start",
          command: "{pm} run dev",
          description: "Start development server",
        },
        {
          name: "build",
          command: "{pm} run build",
          description: "Build for production",
        },
      ],
    },
    {
      name: "test",
      description: "Testing Commands",
      icon: "🧪",
      commands: [
        {
          name: "unit",
          command: "{pm} vitest",
          description: "Run unit tests",
        },
      ],
    },
  ],
  globalEnv: {
    NODE_ENV: "development",
  },
};
```

### JSON Configuration

```json
{
  "projectName": "My Project",
  "packageManager": "bun",
  "categories": [
    {
      "name": "dev",
      "description": "Development Commands",
      "icon": "🚀",
      "commands": [
        {
          "name": "start",
          "command": "{pm} run dev",
          "description": "Start development server"
        }
      ]
    }
  ]
}
```

## 🔧 Command Placeholders

Dynamic placeholders are automatically replaced:

- `{pm}` → Package manager (npm, yarn, pnpm, bun)
- `{lockfile}` → Lock file name (package-lock.json, yarn.lock, etc.)
- `{srcDir}` → Source directory (src, lib, app, or .)
- `{buildDir}` → Build directory (.next, build, dist)
- `{configExt}` → Config extension (.js or .ts)
- `{testExt}` → Test extension (.test.js or .test.ts)

### Example Usage

```javascript
{
  name: "lint",
  command: "{pm} run eslint {srcDir} --ext {configExt}",
  description: "Lint source files"
}
// Becomes: bun run eslint src --ext .ts
```

## 🎯 Advanced Usage

### Programmatic Usage

```javascript
import { ScriptRunner } from "interactive-script-runner";

const runner = new ScriptRunner({
  cwd: process.cwd(),
  colors: true,
  logger: console.log,
});

await runner.run();
```

### Custom Configuration

```javascript
import { ScriptRunner } from "interactive-script-runner";

const runner = new ScriptRunner({
  config: {
    projectName: "Custom Project",
    categories: [
      // Your custom categories
    ],
  },
});

await runner.run();
```

## 🔍 Project Detection

The package automatically detects:

- **Framework**: Next.js, React, Node.js, or generic
- **Package Manager**: bun, npm, yarn, or pnpm (via lock files)
- **TypeScript**: tsconfig.json or TypeScript dependencies
- **Features**: Database, linting, testing, Storybook, Tailwind

This enables smart template selection and appropriate command generation.

## 🌟 Benefits

### Solves Package.json Script Bloat

- **Before**: 20+ scripts cluttering package.json
- **After**: Clean package.json with organized, discoverable commands

### Improves Developer Experience

- **Interactive Discovery**: Browse available commands
- **Contextual Help**: See argument examples
- **Smart Defaults**: Framework-specific commands
- **Flexible Execution**: Menu or direct modes

### Team Collaboration

- **Consistent Interface**: Same commands across projects
- **Self-Documenting**: Built-in command descriptions
- **Onboarding**: New developers can discover commands easily

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/yourusername/interactive-script-runner.git

# Install dependencies
bun install

# Build the package
bun run build

# Test the CLI
node dist/cli.js --help

# Run tests
bun test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

MIT © [Jacob Finch](https://github.com/jacobfinch)

## 🙏 Inspiration

This package was inspired by the need to reduce package.json script bloat while maintaining discoverability and ease of use in modern JavaScript projects. Special thanks to the teams behind @clack/prompts and @inquirer/prompts for their excellent CLI libraries.

---

**Made with ❤️ for the JavaScript community**
