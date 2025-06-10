# {{projectName}} - AI Assistant Rules

This file contains important context and rules for AI assistants (Claude, Cursor, GitHub Copilot,
Windsurf, etc.) working on this project.

## 📁 Project Structure

```
{{projectName}}/
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Homepage
│   │   ├── not-found.tsx    # 404 page
{{#if hasTrpc}}│   │   └── api/
│   │       └── trpc/        # tRPC API routes
{{/if}}│   ├── components/
│   │   ├── ui/              # Base UI components (Button, etc.)
│   │   └── layouts/         # Layout components
│   └── lib/                 # Utilities and configurations
{{#if hasDatabase}}│       ├── db/             # Database schema and connection (Drizzle)
{{/if}}{{#if hasTrpc}}│       ├── trpc/          # tRPC setup and routers
{{/if}}{{#if hasAuth}}│       ├── auth/          # Authentication (Better Auth)
{{/if}}│       └── utils.ts        # Utility functions
{{#if hasTesting}}├── src/tests/           # Test files (Vitest + Playwright)
{{/if}}├── config/              # Configuration files
│   └── tooling/            # ESLint, Prettier, etc.
└── docs/                   # Documentation
```

## 🛠️ Tech Stack

### Core

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + DaisyUI + Radix UI
- **Icons**: Lucide React

### Optional Features

{{#if hasTrpc}}- **API**: tRPC for type-safe APIs {{/if}}{{#if hasDatabase}}- **Database**: Drizzle
ORM with SQLite/Turso {{/if}}{{#if hasAuth}}- **Authentication**: Better Auth
{{/if}}{{#if hasTesting}}- **Testing**: Vitest (unit) + Playwright (E2E)
{{/if}}{{#if hasAnalytics}}- **Analytics**: PostHog (analytics + feature flags) {{/if}}

## 🎯 Development Guidelines

### Code Style

- **ESLint**: Strict configuration with comprehensive rules
- **Prettier**: Consistent formatting with Tailwind plugin
- **TypeScript**: Strict mode, prefer type imports
- **Imports**: Use `@/` alias for src/ directory
- **Components**: Functional components with TypeScript interfaces

### File Conventions

- **Components**: PascalCase files (e.g., `MyComponent.tsx`)
- **Utilities**: camelCase files (e.g., `myHelper.ts`)
- **Pages**: lowercase with hyphens (e.g., `my-page/page.tsx`)
- **Types**: Use interfaces over types where possible

### Component Patterns

```typescript
// Preferred component structure
interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="container">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
```

### Styling Guidelines

- **Tailwind**: Use utility classes, prefer component composition
- **DaisyUI**: Use semantic component classes (btn, card, etc.)
- **Responsive**: Mobile-first approach with responsive utilities
- **Dark Mode**: DaisyUI theme system (theme switcher available)

{{#if hasTrpc}}### tRPC Patterns

- **Routers**: Group related procedures in feature-based routers
- **Procedures**: Use input validation with Zod schemas
- **Client**: Use `api.` prefix for tRPC calls in components
- **Types**: Export and reuse tRPC router types

```typescript
// Example tRPC usage
const { data, isLoading } = api.users.getAll.useQuery();
const createUser = api.users.create.useMutation();
```

{{/if}}

{{#if hasDatabase}}### Database Patterns

- **Schema**: Define types and relationships in `src/lib/db/schema.ts`
- **Migrations**: Use `npm run db:generate` and `npm run db:push`
- **Queries**: Use Drizzle's query builder, avoid raw SQL
- **Types**: Export and use inferred types from schema

```typescript
// Example database usage
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const allUsers = await db.select().from(users);
```

{{/if}}

{{#if hasTesting}}### Testing Patterns

- **Unit Tests**: Use Vitest with React Testing Library
- **E2E Tests**: Use Playwright for integration testing
- **File Location**: Tests alongside source files or in `src/tests/`
- **Naming**: `*.test.tsx` for unit, `*.spec.ts` for E2E

```typescript
// Example unit test
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("renders component", () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

{{/if}}

## 🚨 Important Rules

### DO

- ✅ Use TypeScript interfaces for component props
- ✅ Follow the established folder structure
- ✅ Use semantic HTML and proper accessibility
- ✅ Implement responsive design with Tailwind
- ✅ Use the existing UI components before creating new ones
- ✅ Write tests for new features and components
- ✅ Follow ESLint rules and fix all warnings

### DON'T

- ❌ Modify the core configuration files without reason
- ❌ Use `any` type - prefer proper TypeScript types
- ❌ Create duplicate components that already exist
- ❌ Ignore ESLint warnings or disable rules arbitrarily
- ❌ Use inline styles - prefer Tailwind classes
- ❌ Commit code that doesn't pass type checking

## 📋 Common Tasks

### Adding a New Page

1. Create `src/app/my-page/page.tsx`
2. Use the MainLayout component if needed
3. Add navigation links if appropriate
4. Write tests for the new page

### Adding a New Component

1. Create in appropriate folder (`src/components/ui/` or feature-specific)
2. Export from index.ts file
3. Write TypeScript interface for props
4. Add unit tests

{{#if hasTrpc}}### Adding a New API Endpoint

1. Create procedure in appropriate router (`src/lib/trpc/routers/`)
2. Add input validation with Zod
3. Export router from root router
4. Use type-safe client in components {{/if}}

{{#if hasDatabase}}### Adding Database Changes

1. Modify schema in `src/lib/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:push` to apply changes
4. Update TypeScript types if needed {{/if}}

## 🔧 Available Scripts

````bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler

{{#if hasTesting}}# Testing
npm run test             # Run unit tests
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests

{{/if}}{{#if hasDatabase}}# Database
npm run db:generate      # Generate migration files
npm run db:push          # Push schema to database
npm run db:studio        # Open database studio

{{/if}}```

## 💡 AI Assistant Tips

- This project follows strict TypeScript and ESLint rules
- Always check the existing components before creating new ones
- Use the established patterns and folder structure
- Test your changes thoroughly
- Ask for clarification if project structure is unclear

---

Generated with [@finch/create-app](https://github.com/jacobfinch/create-finch-app) 🐦
````
