# Morning Pod - AI Podcast Generator

<!-- Status Badges -->

[![Tests](https://img.shields.io/badge/tests-passing-green?style=for-the-badge&logo=checkmarx)]()
[![E2E Coverage](https://img.shields.io/badge/E2E_Coverage-48_combinations-blue?style=for-the-badge&logo=playwright)]()
[![Accessibility](https://img.shields.io/badge/WCAG-AA_Compliant-success?style=for-the-badge&logo=web-accessibility)]()

<!-- Tech Stack Badges -->

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://typescript.org)
[![Bun](https://img.shields.io/badge/Bun-1.0-f472b6?style=for-the-badge&logo=bun)](https://bun.sh)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

<!-- Quality Badges -->

[![Code Quality](https://img.shields.io/badge/ESLint-Passing-4B32C3?style=for-the-badge&logo=eslint)]()
[![Coverage](https://img.shields.io/badge/Unit_Coverage-100%25-brightgreen?style=for-the-badge&logo=vitest)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=open-source-initiative)]()

<!-- Performance & Accessibility -->

[![Lighthouse](https://img.shields.io/badge/Lighthouse-100-FF6B6B?style=for-the-badge&logo=lighthouse)]()
[![Core Web Vitals](https://img.shields.io/badge/Core_Web_Vitals-Excellent-00D8FF?style=for-the-badge)]()

<!-- Database & AI -->

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Vercel-4169E1?style=for-the-badge&logo=postgresql)](https://vercel.com/postgres)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)](https://openai.com)

Morning Pod is an AI-powered podcast generation platform that transforms news sources into personalized audio content. Built with modern web technologies and comprehensive testing infrastructure.

## 🚀 Development Status

**Current Phase**: v0.1.0-beta (Client Focused & Polished)  
**Foundation Complete**: ✅ End-to-end persistent generation pipeline  
**Latest Enhancements**: Persistent global audio playback, autonomous RSS discovery, and WCAG AA accessibility compliance.

## 🌟 Key Features

- **Autonomous Discovery**: Real-time RSS integration for Hacker News, TLDR Tech, and Morning Brew with background refreshing.
- **Persistent Global Audio**: Seamless, layout-level playback that survives navigation and page refreshes.
- **Real-time Generation**: Database-backed progress tracking (0-100%) for all AI pipeline stages.
- **Discovery Hub**: Centralized `/discover` page for browsing headlines and instant podcast creation.
- **Flexible Storage**: Production-ready Vercel Blob integration with automatic local filesystem fallback for development.
- **WCAG AA Compliance**: High-contrast, keyboard-navigable interface across 30+ themes.
- **Isolated Admin Tools**: Clean separation between user features and technical management tools under `/internal`.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 22+
- PostgreSQL database (Vercel Postgres)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/morning-pod.git
cd morning-pod

# Install dependencies (preferably with Bun)
bun install

# Set up environment variables
# See ENV_TEMPLATE.md for all available variables and setup instructions
touch .env.local
# Edit .env.local with your database and API keys (follow ENV_TEMPLATE.md)

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing Infrastructure

Our testing strategy ensures quality across all components and user workflows:

### Unit & Integration Tests (Vitest + React Testing Library)

```bash
# Run all tests (unit + E2E)
bun run test

# Run only unit tests
bun run test unit

# Interactive test menu with additional options
bun run test:interactive

# Run tests in watch mode with coverage
bun run test unit --watch --coverage
```

**Current Status**: ✅ 11/11 tests passing

- Component interaction testing
- Accessibility validation (ARIA compliance)
- Theme compatibility testing
- Keyboard navigation validation
- Loading state management

### End-to-End Tests (Playwright)

```bash
# Basic E2E testing
bun run test e2e          # All E2E tests
bun run test e2e --ui     # Interactive UI mode
bun run test e2e --debug  # Debug mode
bun run test e2e --headed # Run with browser UI

# Advanced E2E options
bun run test e2e --project=chromium    # Specific browser
bun run test e2e --update-snapshots    # Update visual snapshots
bun run test performance               # Performance tests only
```

**Test Matrix**: 48 combinations (4 themes × 3 browsers × 4 viewports)

- **Browsers**: Chromium, Firefox, WebKit
- **Themes**: Light, Dark, Forest, Cyberpunk
- **Viewports**: Mobile, Tablet, Desktop, Large Desktop
- **Accessibility**: Automated axe-core scanning with WCAG compliance
- **Performance**: Core Web Vitals tracking (FCP, LCP, CLS, TTI)
- **Visual Regression**: Automated screenshot comparison
- **Coverage Collection**: JavaScript and CSS usage tracking

### Performance Testing

```bash
# Run performance benchmarks
bun run test performance

# Run performance-optimized test suite
bun run test unit:perf && bun run test e2e:perf
```

### Accessibility Testing

All tests include accessibility validation:

- Color contrast compliance (WCAG AA)
- Keyboard navigation support
- Screen reader compatibility
- Semantic HTML structure
- ARIA labels and roles

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard homepage
│   ├── episodes/          # Episode management
│   ├── sources/           # News source configuration
│   ├── queue/             # Generation queue monitoring
│   └── internal/          # Development tools & component variants
├── components/
│   ├── ui/                # Base UI components (Button, Dialog, etc.)
│   ├── features/          # Application-specific components
│   ├── layouts/           # Page layouts with navigation
│   └── internal/          # Development & variant components
├── lib/
│   ├── trpc/              # Type-safe API layer
│   ├── db/                # Database schema & connection
│   ├── mock-data/         # Development mock data
│   └── utils/             # Utility functions
├── tests/
│   ├── unit/              # Unit & integration tests
│   ├── e2e/               # End-to-end tests
│   ├── performance/       # Performance benchmarks
│   └── README.md          # Comprehensive testing documentation
└── types/                 # TypeScript type definitions
```

## 🛠️ Tech Stack

### Core Framework

- **[Next.js 15](https://nextjs.org)** with App Router and TypeScript
- **[Bun](https://bun.sh)** for package management and runtime
- **[React 18](https://react.dev)** with Server Components

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com)** for utility-first styling
- **[DaisyUI](https://daisyui.com)** for component primitives and themes
- **[Radix UI](https://radix-ui.com)** for accessible interactions
- **[Framer Motion](https://framer.com/motion)** for animations
- **[Lucide React](https://lucide.dev)** for icons

### Backend & Data

- **[tRPC](https://trpc.io)** for type-safe APIs
- **[Drizzle ORM](https://orm.drizzle.team)** with Vercel Postgres
- **[Zod](https://zod.dev)** for schema validation
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** for audio storage

### AI & Services

- **[OpenAI GPT-4](https://openai.com)** for content summarization
- **[OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)** for voice synthesis
- **News APIs**: TLDR, Hacker News, Morning Brew integration

### Testing & Quality

- **[Vitest](https://vitest.dev)** for unit testing
- **[React Testing Library](https://testing-library.com/react)** for component testing
- **[Playwright](https://playwright.dev)** for E2E testing
- **[Axe-core](https://github.com/dequelabs/axe-core)** for accessibility testing
- **[ESLint](https://eslint.org)** & **[Prettier](https://prettier.io)** for code quality

## 📋 Task Management & TODOs

### Current Tasks

Check our task management system for detailed project planning:

- **Task Lists**: See `/.cursorrules` for comprehensive development guidelines
- **Component Variants**: Visit `/app/internal` for UI component development status
- **Test Coverage**: Check `/tests/README.md` for testing progress
- **API Development**: Review `/src/lib/trpc/routers/` for backend progress

### Priority Areas

1. **Audio Generation Pipeline**: TTS integration and storage
2. **News Source Scrapers**: Automated content fetching
3. **Queue System**: Background job processing
4. **User Authentication**: Session management
5. **Performance Optimization**: Core Web Vitals improvements

### Development Workflow

1. All changes require passing tests (unit + E2E)
2. Accessibility compliance mandatory
3. Component variants tested across themes
4. Performance impact assessed
5. Documentation updates included

## 🔧 Development Commands

Our project uses an interactive script runner for streamlined development:

### Quick Commands (Most Common)

```bash
# Development
bun dev                  # Start development server
bun build                # Production build
bun start                # Production server

# Testing & Quality
bun test                 # Run unit tests with Vitest
bun test:all             # Run all tests (unit + E2E)
bun lint                 # Run ESLint
bun type-check           # TypeScript type checking

# Database & Advanced Tools
bun run db generate      # Generate migrations
bun run db migrate       # Run migrations
bun run db seed          # Seed with sample data
bun kill                 # Interactive process killer (test/lint/VSCode processes)
```

### Interactive Mode & Advanced Options

```bash
# Interactive menus with context-specific examples
bun run test:interactive     # Interactive test menu
bun run quality:interactive  # Interactive quality menu

# Direct commands with additional arguments
bun run test unit --watch --coverage    # Unit tests with watch and coverage
bun run test e2e --headed --debug       # E2E tests in headed debug mode
bun run quality lint src/ --max-warnings 0  # Lint specific directory
bun run quality format src/ --check     # Format check specific directory

# Process Management
bun kill                    # Interactive process killer (default)
bun kill --force            # Force kill all test/lint/VSCode processes
bun kill --list             # List running processes without killing

# Advanced Script Runner
bun run script             # Interactive script runner menu
bun run script --help      # Show all available commands
```

### All Available Categories

```bash
# Get help and see all options
bun run script --help       # Show full help
bun run script --list       # List all commands

# Category shortcuts
bun run dev --start          # Start development server
bun run test --e2e           # Run E2E tests
bun run quality --lint       # Run linting
bun run deps --check         # Check for updates
```

## 🎨 Theme Testing

The application supports 30+ DaisyUI themes with automated testing:

**Light Themes**: light, cupcake, bumblebee, emerald, corporate, garden, retro, cyberpunk, valentine, garden, lofi, pastel, fantasy, wireframe

**Dark Themes**: dark, synthwave, halloween, forest, aqua, luxury, dracula, business, acid, lemonade, night, coffee, winter, dim, nord, sunset

Each theme is automatically tested for:

- Visual consistency across components
- Accessibility compliance
- Color contrast ratios
- Responsive behavior

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# DATABASE_URL, OPENAI_API_KEY, etc.
```

### Docker

```bash
# Build Docker image
docker build -t morning-pod .

# Run container
docker run -p 3000:3000 morning-pod
```

## 📚 Documentation

- **[Testing Guide](./tests/README.md)**: Comprehensive testing documentation
- **[Component Development](./src/components/README.md)**: UI component guidelines
- **[API Documentation](./src/lib/trpc/README.md)**: Backend API reference
- **[Deployment Guide](./docs/deployment.md)**: Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`bun test && bun test:e2e`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) team for the amazing framework
- [DaisyUI](https://daisyui.com) for beautiful theme system
- [Playwright](https://playwright.dev) for robust E2E testing
- [Vercel](https://vercel.com) for seamless deployment platform
