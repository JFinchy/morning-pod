# Environment Variables Template

Copy this to your `.env.local` file and fill in the appropriate values.

```bash
# Database
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# PostHog Feature Flags
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_SERVER_KEY="phx_..."

# Feature Flag Environment Overrides (optional)
# These override PostHog flags for local development or emergency toggles

# Premium Features
PREMIUM_TTS_ENABLED="true"
AI_SUMMARIZATION_ENABLED="true"
OPENAI_TTS_ENABLED="true"
GOOGLE_TTS_ENABLED="true"

# Source Availability
TLDR_SOURCE_ENABLED="true"
HACKER_NEWS_SOURCE_ENABLED="true"
MORNING_BREW_SOURCE_ENABLED="true"
TECHCRUNCH_SOURCE_ENABLED="false"

# Content Tiers
PREMIUM_CONTENT_ENABLED="true"
FREE_CONTENT_ENABLED="true"

# Generation Limits
HIGH_DAILY_LIMITS_ENABLED="false"
UNLIMITED_GENERATION_ENABLED="false"
```

## PostHog Setup

1. Sign up for PostHog at https://posthog.com
2. Create a new project
3. Get your project API key (starts with `phc_`)
4. Generate a personal API key for server-side usage (starts with `phx_`)
5. Add the keys to your environment variables

## Feature Flag Emergency Overrides

Environment variables take precedence over PostHog flags, allowing you to:

- Quickly disable expensive features in production
- Turn off problematic sources without PostHog access
- Override flags during local development

## Local Development

For local development without PostHog, the system will fall back to:

1. Environment variable overrides
2. Default values defined in `src/lib/feature-flags/config.ts`
