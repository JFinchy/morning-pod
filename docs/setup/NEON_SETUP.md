# Neon Database Setup for Morning Pod

## ✅ Local Development Setup (Completed)

You've successfully set up Neon for local development! Here's what we accomplished:

### 1. Dependencies Installed

- ✅ `@neondatabase/serverless` - Neon's HTTP driver
- ✅ Updated database connection to use Neon

### 2. Database Configuration

- ✅ Updated `src/lib/db/connection.ts` to use Neon HTTP driver
- ✅ Environment variable support for multiple naming conventions
- ✅ Proper error handling and connection testing

### 3. Database Setup

- ✅ Migrations applied to Neon database
- ✅ Database seeded with sample data:
  - 5 news sources (TLDR Tech, Hacker News, Morning Brew, TechCrunch, The Verge)
  - 5 sample episodes with different statuses
  - 3 queue items for testing

## 🚀 Production Deployment (Vercel + Neon)

### Step 1: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your `morning-pod` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
# Database (Required)
POSTGRES_URL=postgresql://your-username:your-password@ep-xxx.neon.tech/neondb
POSTGRES_PRISMA_URL=postgresql://your-username:your-password@ep-xxx.neon.tech/neondb
POSTGRES_URL_NON_POOLING=postgresql://your-username:your-password@ep-xxx.neon.tech/neondb

# Set for all environments: Production, Preview, Development
```

### Step 2: Deploy Updated Code

```bash
# Deploy with new Neon configuration
vercel --prod
```

### Step 3: Run Production Migrations (if needed)

```bash
# Pull production environment variables
vercel env pull .env.production

# Run migrations against production database (if schema changes)
bun run db:migrate

# Seed production database (optional)
bun run db:seed
```

## 🔧 Development Workflow

### Environment Setup

Your `.env.local` should contain:

```bash
# Neon Database (Local Development)
POSTGRES_URL=postgresql://your-username:your-password@ep-xxx.neon.tech/neondb

# Other environment variables...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

### Neon Branches for Development

Neon supports database branching - perfect for safe development:

```bash
# Create a new branch for feature development
neon branches create --name feat/new-feature

# Get connection string for the branch
neon connection-string feat/new-feature

# Update .env.local to use branch URL
POSTGRES_URL=postgresql://user:pass@ep-branch-xxx.neon.tech/neondb

# Test migrations safely on branch
bun run db:migrate

# When ready, merge branch to main database
neon branches merge feat/new-feature main
```

## 🛠️ Database Management Commands

```bash
# Check connection status
bun run dev  # Will show connection status in console

# Apply schema changes
bun run db:migrate

# Reset and reseed database
bun run db:seed

# Generate new migration files
bun run db:generate

# View database in browser (Drizzle Studio)
bun run db:studio
```

## 📊 Connection Details

The updated connection supports:

- **Multi-environment variables**: Checks `POSTGRES_URL`, `DATABASE_URL`, `NEON_DATABASE_URL`
- **Connection testing**: `isDbConnected()` function for health checks
- **Detailed logging**: Debug info with `getDbInfo()`
- **Graceful fallbacks**: Falls back to mock data if database unavailable

## 🔍 Troubleshooting

### "No database URL found" Error

```bash
# Make sure environment variables are set
echo $POSTGRES_URL

# Copy example file if needed
cp env.local.example .env.local
```

### Connection Timeouts

- Neon pauses databases after inactivity
- First query may be slower (cold start)
- Subsequent queries will be fast

### Migration Issues

```bash
# Check current schema status
bun run drizzle-kit introspect

# Force regenerate migration files
bun run db:generate
```

## 🎯 Benefits of Neon Setup

✅ **Scale-to-zero billing** - Only pay when database is active
✅ **Database branching** - Safe testing of schema changes  
✅ **Serverless-first** - Perfect for Vercel deployment
✅ **PostgreSQL compatible** - Full SQL feature support
✅ **Fast cold starts** - Optimized for serverless environments
✅ **Multi-environment support** - Same setup for dev/staging/prod

## 🚀 Next Steps

1. **Test local development**: Your app should now use real Neon data instead of mocks
2. **Add Vercel environment variables**: Set `POSTGRES_URL` in Vercel dashboard
3. **Deploy to production**: `vercel --prod`
4. **Monitor usage**: Check Neon dashboard for database metrics
5. **Set up branching**: Use Neon branches for safe schema changes

Your Morning Pod app is now fully connected to Neon! 🎉
