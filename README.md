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

**Current Phase**: MVP Audio Generation Pipeline  
**Foundation Complete**: ✅ Web scraping system with full database persistence  
**Next**: AI summarization and text-to-speech integration for on-demand episode generation

## 🌟 Key Features

- **AI Content Generation**: Automated podcast creation from news sources (TLDR, Hacker News, Morning Brew)
- **Multi-Theme Support**: 30+ DaisyUI themes with accessibility testing
- **Component-First Architecture**: Reusable UI components with variant testing
- **Real-time Queue Management**: Live episode generation status tracking
- **Responsive Design**: Mobile-first with cross-browser compatibility
- **Comprehensive Testing**: Unit, integration, E2E, and accessibility testing

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
# Run all unit tests
bun test

# Run tests in watch mode
bun test:watch

# Generate coverage report
bun test:coverage
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
bun test:e2e              # All E2E tests
bun test:e2e:ui           # Interactive UI mode
bun test:e2e:debug        # Debug mode
bun test:e2e:headed       # Run with browser UI

# Advanced features
bun test:e2e:trace        # Enable trace collection
bun test:e2e:video        # Record test videos
bun test:e2e:visual       # Update visual snapshots
bun test:e2e:codegen      # Generate test code
bun test:e2e:report       # View HTML report
bun test:e2e:coverage     # JS/CSS coverage collection
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
bun test:performance

# Generate Lighthouse reports
bun test:lighthouse
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

```bash
# Development
bun run dev                 # Start development server
bun run build              # Production build
bun run start              # Production server
bun run type-check         # TypeScript validation

# Database
bun run db:generate        # Generate migrations
bun run db:migrate         # Run migrations
bun run db:seed            # Seed with sample data
bun run db:studio          # Open database GUI

# Testing
bun test                   # Unit tests
bun test:watch             # Watch mode
bun test:e2e              # End-to-end tests
bun test:e2e:ui           # E2E with UI
bun test:performance      # Performance tests
bun test:accessibility    # Accessibility audit

# Code Quality
bun run lint              # ESLint check
bun run lint:fix          # Auto-fix issues
bun run format            # Prettier formatting
bun run format:check      # Check formatting

# Dependencies
bun install               # Install packages
bun add <package>         # Add dependency
bun update               # Update all packages
bun outdated             # Check outdated packages
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
