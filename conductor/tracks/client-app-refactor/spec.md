# Specification: Client-Focused App Refactor

## Background

The current Morning Pod application has a developer-centric UI, exposing technical stats, debug tools, and complex configurations on the main routes. The goal is to move these to an `/internal` area and provide a clean, user-friendly "Morning Pod" experience for the general user.

## Requirements

### 1. Internal Route Migration

- Move all existing management and debug pages to `/internal`.
- Target routes: `/sources`, `/scraping`, `/queue`, `/settings`, `/episodes`, `/players`, `/test`, `/test-mock`.
- Ensure internal links are updated to point to the new `/internal/*` locations.

### 2. Client-Focused Homepage (`/`)

- **Hero Section**: Welcoming message and "Play Latest Episode" prominent call-to-action.
- **Recent Episodes**: A grid of the latest generated episodes.
- **Episode Library**: Access to all past episodes.
- **Source Selection**: A clean view of available news sources.
- **Episode Development**: A simplified flow to select a source, scrape content, and generate a new audio episode.

### 3. Clean UI/UX

- Use existing components (`EpisodeCard`, `Button`, `Card`, etc.).
- Focus on content (episodes) rather than metadata/stats.
- Maintain consistent theme and accessibility standards.

### 4. Simplified "Develop" Workflow

- User selects a source from their list.
- User triggers an episode generation.
- UI provides clear feedback on the scraping and generation progress.
