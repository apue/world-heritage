# Multi-Component Architecture

## Overview

The multi-components feature brings component-level tracking to serial / multi-location World Heritage properties. This document captures the architecture after Phase 2–4:

- **Data pipeline** now writes the enriched site data to both `data/sites.json` (intermediate) and `public/sites.json` (used by the app). Running Stage 3 keeps the front-end bundle aligned with the latest component roster.
- **Database** stores component visits in `user_component_visits`, aggregates progress via `user_property_visit_progress`, and exposes status through `get_user_site_status()`.
- **API** endpoints under `/api/sites` and `/api/user/visits` handle component listings, visit mutations, and progress fetching—designed for optimistic UI updates.
- **Frontend** separates property overview and component details: Explore map shows only properties; detail pages render component lists/maps plus progress, backed by cached hooks.

## Data Pipeline

1. Stage 1–2 (unchanged) merge UNESCO XML → `data/sites.json` (intermediate).
2. Stage 3 enriches components from `data/raw/multi-sites-data.json`, dedupes by QID, groups by base `whs_id`, and writes **both** `data/sites.json` and `public/sites.json`.
3. Checkpoints (stats, validation) run during Stage 3; `public/sites.json` is committed and imported by Next.js pages.

## Database Schema

- `user_component_visits` — canonical component visits table (unique `(user_id, component_id)`, timestamps, RLS).
- `user_wishlist` / `user_bookmarks` — now scoped by `scope_type` + `scope_id` (property or component).
- `user_property_visit_progress` — view aggregating component visits per property/user.
- `get_user_site_status(user_id, site_id)` — function returning visited/wishlist/bookmark state and progress payload.
- Migration `003_remove_legacy_visits.sql` (new) drops the deprecated `user_visits` table and cleans old policies/indexes.

## API Surface

- `GET /api/sites/[siteId]/components` → static component list with metadata.
- `GET /api/user/visits/progress/[siteId]` → aggregated progress (auth required).
- `POST/DELETE /api/user/visits/components` → mark/unmark visits, return updated progress.
- Services: `lib/services/components.ts`, `lib/services/user-visits.ts` centralize lookups/mutations.

## Frontend Layers

- `UserSitesContext` caches property-level status. `applyVisitProgress` now uses stable refs to avoid re-fetch loops.
- `useComponentProgress(siteId)` fetches once per (site,user), caches progress, exposes `refresh`, and handles optimistic mark/unmark operations.
- Detail page renders: progress bar, `ComponentList` (selection + toggles), `ComponentMap` (Leaflet cluster map loaded client-side).
- Explore map only renders properties; no component badges—markers colored by aggregated status.

## Testing & Deployment Notes

- Run `npm run prepare:data:full` (or at least Stage 3) to sync `public/sites.json` before deployment.
- `npm run build` now succeeds (Leaflet loaded dynamically only in browser).
- Manual QA checklist (Phase 5) covers large serial properties, mobile, Explore/detail interplay.

## Cleanup & Next Steps

- After verifying new flow, apply migration `003_remove_legacy_visits.sql` to drop the old `user_visits` table.
- Consider adding caching layer (SWR/React Query) for progress endpoints, and expanding profile pages to show component-level lists.
