# {{projectName}}

A modern Next.js application built with TypeScript, Tailwind CSS, and battle-tested patterns.

## Features

- ⚡ **Next.js 15** with App Router
- 🔷 **TypeScript** with strict configuration
- 🎨 **Tailwind CSS** + DaisyUI + Radix UI
- 📱 **Responsive** design out of the box
- 🛠️ **ESLint & Prettier** for code quality
- 🚀 **Production ready** configurations

{{#if hasTrpc}}- 🔌 **tRPC** for type-safe APIs {{/if}}{{#if hasDatabase}}- 🗄️ **Drizzle ORM** for
database operations {{/if}}{{#if hasAuth}}- 🔐 **Better Auth** for authentication
{{/if}}{{#if hasAnalytics}}- 📊 **PostHog** for analytics and feature flags
{{/if}}{{#if hasTesting}}- 🧪 **Testing** with Vitest and Playwright {{/if}}

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

{{#if hasDatabase}}## Database Setup

1. **Set up your database connection:** Add your database URL to `.env.local`:

   ```
   DATABASE_URL="your-database-url"
   ```

2. **Push the schema:**

   ```bash
   npm run db:push
   ```

3. **Open database studio (optional):**
   ```bash
   npm run db:studio
   ```

{{/if}}{{#if hasAnalytics}}## Analytics Setup

1. **Get your PostHog API key** from [posthog.com](https://posthog.com)

2. **Add environment variables:**
   ```
   NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

{{/if}}## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

{{#if hasTesting}}### Testing

- `npm run test` - Run unit tests
- `npm run test:coverage` - Run with coverage
- `npm run test:e2e` - Run E2E tests

{{/if}}{{#if hasDatabase}}### Database

- `npm run db:generate` - Generate migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open database studio

{{/if}}## Project Structure

```
{{projectName}}/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── layouts/        # Layout components
│   └── lib/                # Utilities and configurations
{{#if hasDatabase}}│       ├── db/             # Database schema
{{/if}}{{#if hasTrpc}}│       └── trpc/           # tRPC setup
{{/if}}├── config/              # Configuration files
└── docs/                   # Documentation
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DaisyUI](https://daisyui.com/)
- [TypeScript](https://www.typescriptlang.org/docs/) {{#if hasTrpc}}- [tRPC](https://trpc.io/docs)
  {{/if}}{{#if hasDatabase}}- [Drizzle ORM](https://orm.drizzle.team/docs/overview) {{/if}}

## Deployment

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/{{projectName}})

---

Built with [@finch/create-app](https://github.com/jacobfinch/create-finch-app) 🐦
