# @finch/create-app

Opinionated Next.js starter with TypeScript, Tailwind, and battle-tested patterns.

## Quick Start

```bash
npx @finch/create-app my-app
cd my-app
npm run dev
```

## What You Get

### Core Stack (Always Included)

- **Next.js 15** with App Router
- **TypeScript** with strict configuration
- **Tailwind CSS** + DaisyUI + Radix UI
- **ESLint** with comprehensive rules
- **Prettier** for code formatting
- **Lucide Icons** for consistent iconography
- **TASKS.md** workflow integration
- **AI tooling rules** for Cursor, Claude, VSCode, Windsurf

### Optional Features

- **🗄️ Database:** Drizzle ORM with schema examples
- **⚡ API Layer:** tRPC for type-safe APIs
- **🔐 Authentication:** Better Auth integration
- **🧪 Testing:** Playwright E2E + Vitest unit tests
- **📊 Analytics:** PostHog with feature flags & A/B testing
- **🚀 Advanced:** Security headers, canary deployments, monitoring

## Interactive Setup

The CLI will ask you a few questions to customize your project:

```
🐦 Welcome to Finch
✨ Let's set up your project with battle-tested patterns...

? Project name: my-app
? 🗄️  Include database (Drizzle ORM)? (Y/n)
? ⚡ Include tRPC for type-safe APIs? (Y/n)
? 🔐 Add Better Auth authentication? (Y/n)
? 🧪 Testing setup? (Full/Unit/None)
? 📊 Include PostHog (analytics + feature flags)? (Y/n)
? 🚀 Include advanced deployment features? (Y/n)
? 📝 Project starting point? (Clean/Demo)
```

## Command Line Options

```bash
npx @finch/create-app [project-name] [options]

Options:
  -t, --template <template>  Template to use (default: "default")
  --no-install              Skip installing dependencies
  --no-git                  Skip git repository initialization
  -h, --help                Display help for command
  -V, --version             Display version number
```

## Development

```bash
# Clone and install
git clone https://github.com/jacobfinch/create-finch-app.git
cd create-finch-app
npm install

# Build the CLI
npm run build

# Test locally
npm run create-app my-test-app

# Development mode with watch
npm run dev
```

## Philosophy

This starter is opinionated and follows patterns from production applications. It includes:

- **Type Safety:** Full TypeScript coverage with strict rules
- **Code Quality:** ESLint rules that catch bugs and enforce patterns
- **Performance:** Built-in optimizations and monitoring
- **Developer Experience:** AI tooling integration and workflow helpers
- **Production Ready:** Security headers, error handling, deployment patterns

## License

MIT
