# Production Setup Guide

## Database: Neon PostgreSQL (Recommended)

### Why Neon?

- **Cost-effective**: Scale-to-zero billing
- **Developer-friendly**: Database branching for safe deployments
- **PostgreSQL compatible**: No code changes needed
- **Better free tier**: 512MB vs Vercel's 256MB

### Setup Steps

1. **Create Neon Account**

   ```bash
   # Go to https://neon.tech
   # Create new project: morning-pod-prod
   # Get connection string
   ```

2. **Configure Environment**

   ```bash
   # Vercel Dashboard → Settings → Environment Variables
   POSTGRES_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb"
   POSTGRES_PRISMA_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb"
   POSTGRES_URL_NON_POOLING="postgresql://user:pass@ep-xxx.neon.tech/neondb"
   ```

3. **Deploy with Database Migration**

   ```bash
   # Deploy to Vercel
   vercel --prod

   # Run migrations on production
   vercel env pull .env.production
   bun run db:migrate
   bun run db:seed  # Optional: Add initial sources
   ```

## Cost Optimization Architecture

### Tier 1: Free ($0/month)

```
Neon Free Tier (512MB)
+ Vercel Hobby (100GB bandwidth)
+ PostHog Free (1M events)
= Perfect for MVP/testing
```

### Tier 2: Minimal Production (~$25/month)

```
Neon Pro ($19/month)
+ Vercel Pro ($20/month)
+ Vercel Blob storage (~$2/month for audio)
= $41/month for serious production
```

### Advanced: Multi-Database Strategy

For high-scale, consider hybrid approach:

```typescript
// src/lib/db/hybrid-connection.ts
import { neon } from "@neondatabase/serverless";
import { kv } from "@vercel/kv";

// Primary database (Neon)
const sql = neon(process.env.POSTGRES_URL!);

// Cache layer (Vercel KV)
export const cache = {
  episodes: {
    get: async (id: string) => await kv.get(`episode:${id}`),
    set: async (id: string, data: any) =>
      await kv.set(`episode:${id}`, data, { ex: 3600 }),
  },
};

// Queue processing (Redis for real-time)
export const queue = {
  add: async (job: any) => await kv.lpush("generation-queue", job),
  process: async () => await kv.rpop("generation-queue"),
};
```

## Database Branching Strategy (Neon)

```bash
# Development workflow with Neon branching
neon branches create --name feat/new-feature
# Get branch connection string
# Test migrations safely
# Merge to main branch when ready
```

## Monitoring & Alerts

### Database Monitoring

```typescript
// src/lib/monitoring/db-health.ts
export async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT NOW()`;
    return { status: "healthy", latency: Date.now() - start };
  } catch (error) {
    // Alert via Vercel Functions + email/Slack
    return { status: "unhealthy", error };
  }
}
```

### Cost Monitoring

```typescript
// Monitor Neon usage
export async function checkDatabaseUsage() {
  // Query Neon API for current usage
  // Alert if approaching limits
  // Suggest optimizations
}
```

## Migration Strategy

### From Development to Production

1. **Export schema**: `bun run db:generate`
2. **Test on Neon branch**: Safe migration testing
3. **Deploy**: Zero-downtime deployment
4. **Verify**: Health checks and data integrity

### Backup Strategy

```bash
# Automated backups with Neon
# Point-in-time recovery available
# Cross-region replication for critical data
```

## Performance Optimization

### Query Optimization

```typescript
// Efficient queries for Morning Pod
export const optimizedQueries = {
  // Use indexes for common queries
  episodesByStatus: sql`
    SELECT * FROM episodes 
    WHERE status = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `,

  // Batch operations for queue processing
  batchUpdateQueue: sql`
    UPDATE queue 
    SET status = $1, progress = $2 
    WHERE id = ANY($3)
  `,
};
```

### Connection Pooling

```typescript
// Neon automatically handles connection pooling
// No additional configuration needed
// Scales based on traffic
```

## Security Best Practices

1. **Environment Variables**: Never commit connection strings
2. **Database Users**: Create specific users for different environments
3. **SSL**: Always use SSL connections (default with Neon)
4. **Monitoring**: Set up alerts for unusual query patterns

## Scaling Path

```
Free Tier → Neon Pro → Neon Scale → Multi-region
$0        → $19      → $69      → Custom pricing
```

This gives you a clear upgrade path as Morning Pod grows!
