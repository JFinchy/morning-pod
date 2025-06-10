# {{projectName}} - Development Tasks

## 🚀 Quick Start

- [ ] Set up environment variables
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open [http://localhost:3000](http://localhost:3000)

{{#if hasDatabase}}## 🗄️ Database Setup

- [ ] Configure database connection string
- [ ] Run `npm run db:generate` to create migration files
- [ ] Run `npm run db:push` to apply migrations
- [ ] (Optional) Run `npm run db:studio` to open database browser

{{/if}}{{#if hasTrpc}}## ⚡ tRPC API

- [ ] Review the example router in `src/lib/trpc/routers/`
- [ ] Add your API endpoints
- [ ] Use type-safe client in components

{{/if}}{{#if hasAuth}}## 🔐 Authentication

- [ ] Configure Better Auth providers
- [ ] Set up authentication pages
- [ ] Add protected routes

{{/if}}{{#if hasAnalytics}}## 📊 Analytics Setup

- [ ] Get PostHog API key from [posthog.com](https://posthog.com)
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` to environment variables
- [ ] Configure feature flags and events

{{/if}}{{#if hasTesting}}## 🧪 Testing

- [ ] Run unit tests: `npm run test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Check test coverage: `npm run test:coverage`

{{/if}}## 📋 Development Workflow

- [ ] Review project structure
- [ ] Customize components and styling
- [ ] Add your business logic
- [ ] Configure deployment
- [ ] Set up CI/CD pipeline

## 🛠️ Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

{{#if hasTesting}}### Testing

- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI

{{/if}}{{#if hasDatabase}}### Database

- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open database studio

{{/if}}## 📁 Project Structure

```
{{projectName}}/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable components
│   │   ├── ui/             # Base UI components
│   │   └── layouts/        # Layout components
│   └── lib/                # Utilities and configurations
{{#if hasDatabase}}│       ├── db/             # Database schema and connection
{{/if}}{{#if hasTrpc}}│       └── trpc/           # tRPC configuration and routers
{{/if}}{{#if hasTesting}}├── src/tests/           # Test files
{{/if}}├── config/              # Configuration files
└── docs/                   # Documentation
```

## 🎨 Customization

### Themes

Your app uses DaisyUI themes. Change the theme in:

- `src/app/layout.tsx` - Default theme
- Add theme switcher component for user selection

### Styling

- Tailwind CSS for utility classes
- DaisyUI for component classes
- Custom styles in `src/app/globals.css`

### Components

- Base UI components in `src/components/ui/`
- Layout components in `src/components/layouts/`
- Feature components in `src/components/features/`

---

Generated with [@finch/create-app](https://github.com/jacobfinch/create-finch-app)

💡 **Tip:** This file works great with AI assistants! They can read it to understand your project
structure and help with development tasks.
