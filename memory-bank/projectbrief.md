# Morning Pod - Project Brief

## Core Project Definition

**Morning Pod** is an AI-powered podcast generation application that automatically creates podcast episodes from news sources using web scraping, AI summarization, and text-to-speech technology.

## Key Requirements

### Functional Requirements

- **Web scraping**: Extract content from news sources (TLDR, Hacker News, Morning Brew)
- **AI summarization**: Convert scraped content into podcast-format summaries
- **Text-to-speech**: Generate audio files from summaries
- **Database persistence**: Store scraped content, episodes, and metadata
- **Web interface**: Dashboard for managing sources, viewing episodes, and monitoring generation

### Technical Requirements

- **Next.js 15** with App Router and TypeScript
- **Bun** for package management and runtime
- **Neon PostgreSQL** with Drizzle ORM
- **tRPC** for type-safe APIs
- **TailwindCSS + DaisyUI** for UI components
- **OpenAI** for summarization and TTS
- **Vercel Blob** for audio file storage

## Development Approach

### Component-First Philosophy

- Build UI components with multiple variants for comparison
- Use mock data first, then connect to real data
- Implement sleek, modern designs with smooth animations
- Focus on user experience and performance

### Data Flow

1. **Scraping**: Web scrapers extract content from news sources
2. **Storage**: Content persisted to database with deduplication
3. **Generation**: AI summarizes content and generates audio
4. **Delivery**: Audio files stored and served through web interface

## Current Architecture Status

- ✅ **Foundation**: Next.js setup, UI components, layouts complete
- ✅ **Data Layer**: Database schema, tRPC API, real data integration complete
- ✅ **Scraping**: Multi-source scrapers with database persistence complete
- ✅ **Analytics**: PostHog integration for feature flags and analytics complete
- 🚧 **Audio Generation**: MVP on-demand generation pipeline in progress
- ⏳ **Queue System**: Advanced background processing (future enhancement)

## Success Criteria

### MVP Goals

- Users can trigger episode generation from available sources
- System scrapes content, summarizes it, and creates audio files
- Generated episodes are playable through the web interface
- Basic error handling and user feedback

### Future Enhancements

- Background queue processing for automatic generation
- Advanced scheduling and content curation
- Multi-voice options and customization
- Analytics and usage tracking
