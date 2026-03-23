# Implementation Plan: Client-Focused App Refactor

## Phase 1: Internal Migration

- [x] Create `/internal` directory if not already fully populated.
- [x] Move `src/app/sources` to `src/app/internal/sources`.
- [x] Move `src/app/scraping` to `src/app/internal/scraping`.
- [x] Move `src/app/queue` to `src/app/internal/queue`.
- [x] Move `src/app/settings` to `src/app/internal/settings`.
- [x] Move `src/app/episodes` to `src/app/internal/episodes`.
- [x] Move `src/app/players` to `src/app/internal/players`.
- [x] Move `src/app/test` and `src/app/test-mock` to `/internal`.
- [x] Update `src/components/layouts/main-nav.tsx` (if it exists) or wherever navigation is defined to point to `/internal` routes for admin tasks.

## Phase 2: Client Layout & Navigation

- [x] Create a new `ClientLayout` or update `MainLayout` to be more consumer-focused.
- [x] Define a clean navigation: "Home", "Library", "Sources", "Internal" (hidden or small).

## Phase 3: New Homepage Implementation

- [x] Update `src/app/page.tsx` with:
  - [x] Hero section with CTA.
  - [x] "Recent Episodes" grid.
  - [x] "Featured Sources" or "My Sources" list.
  - [x] "Create New Episode" button/workflow.

## Phase 4: Episode Library Page

- [x] Create `src/app/library/page.tsx` for browsing all episodes (Implemented at `/episodes`).

## Phase 5: Client Sources View

- [x] Create `src/app/sources/page.tsx` (new) as a simple list of sources for users to browse and trigger generations from.

## Phase 6: Refine "Develop" Workflow

- [x] Create a simplified `GenerationTrigger` or modal for the client side that hides technical details but shows progress (Used existing `GenerationModal`).

## Phase 7: Cleanup & Verification

- [x] Ensure all redirects work.
- [x] Verify no broken links.
- [x] Run basic accessibility audit on new pages.
