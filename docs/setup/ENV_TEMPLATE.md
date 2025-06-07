# Environment Variables Template

Copy this to your `.env.local` file and fill in the appropriate values.

```bash
# Database
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Google Cloud TTS (for cost optimization)
GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
# Alternative: Use service account key as JSON string
# GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# PostHog Feature Flags
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_SERVER_KEY="phx_..."

# Feature Flag Environment Overrides (optional)
# These override PostHog flags for local development or emergency toggles

# AI Model Selection (Cost Optimization)
USE_GPT4O_MINI="true"
USE_GPT4O="false"
USE_GPT35_TURBO="false"

# TTS Provider Selection
USE_GOOGLE_TTS="true"
USE_OPENAI_TTS="false"

# Content Generation Mode
DEFAULT_TO_PODCAST="true"
ENABLE_SUMMARY_MODE="true"

# Voice Style
USE_UPBEAT_VOICES="true"
USE_PROFESSIONAL_VOICES="false"

# Cost Optimization Features
ENABLE_CONTENT_CACHING="true"
ENABLE_QUALITY_FILTERING="true"
ENABLE_BUDGET_LIMITS="true"

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

## Google Cloud TTS Setup (Cost Optimization)

1. **Create Google Cloud Project**

   - Visit https://console.cloud.google.com
   - Create a new project or select existing one
   - Note your Project ID

2. **Enable Text-to-Speech API**

   - Go to APIs & Services > Library
   - Search for "Cloud Text-to-Speech API"
   - Click "Enable"

3. **Create Service Account**

   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: "morning-pod-tts"
   - Role: "Cloud Text-to-Speech Client"
   - Download JSON key file

4. **Set Environment Variables**
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to path of JSON file
   - Set `GOOGLE_CLOUD_PROJECT_ID` to your project ID
   - Alternative: Use `GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY` as JSON string

**Cost Savings**: Google Cloud TTS costs ~$4-16 per 1M characters vs OpenAI TTS at ~$15 per 1M characters (60-75% savings!)

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
