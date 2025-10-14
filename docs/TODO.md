# World Heritage Explorer - TODO List

**Last Updated**: 2025-10-14
**Current Phase**: Phase 2 - Building the All-in-One Hub

## 🎯 Product Vision

**World Heritage Explorer** is an all-in-one hub for discovering, planning, and recording World Heritage journeys.

**Core Philosophy**:

- Single central hub (Explore as Home) - no scattered navigation
- Progressive disclosure: basic browsing → games → personalized features
- Context-aware: everything centers around the map and geographic exploration
- Practical utility: not just browsing, but planning, gaming, and recording

**User Journey**:

1. **Explore & Plan** - Browse WH sites on map, search by country/category, plan travel routes
2. **Play & Learn** - Mini games for interactive learning (geo-challenge, image matching)
3. **Record & Review** - Mark visited/wishlist sites, write reviews (requires login)
4. **Export & Share** - Export to Notion/notes, generate travel checklists

---

## 📋 Phase 1: Foundation & Multi-language Setup

### ✅ Completed

- [x] Project initialization with Next.js 15 + TypeScript
- [x] Basic project structure and configuration
- [x] Map abstraction layer architecture design
- [x] Project documentation (README, development guide, map architecture)
- [x] Git repository setup and first push to GitHub
- [x] Collected UNESCO data (English + Chinese XML)

### ✅ Completed (Recently)

- [x] Write XML to JSON conversion script (`scripts/prepare-data.ts`)
  - [x] Parse XML files (en, zh)
  - [x] Merge data by `id_number`
  - [x] Clean HTML from descriptions
  - [x] Validate data integrity
  - [x] Generate `data/sites.json`
  - [x] Add script to package.json
- [x] Set up Next.js i18n configuration
  - [x] Create `lib/i18n/config.ts`
  - [x] Create `lib/i18n/hooks.ts`
  - [x] Create `lib/i18n/types.ts`
  - [x] Implement middleware for locale detection (`middleware.ts`)
  - [x] Update app structure to `app/[locale]/...`
- [x] Refactor home page to `app/[locale]/page.tsx`
- [x] Refactor layout to `app/[locale]/layout.tsx`
- [x] Basic language switcher in home page
- [x] **Explore Page with Interactive Map**
  - [x] Create data types with components field (future-ready)
  - [x] Implement data access layer (`lib/data/sites.ts`)
  - [x] Implement search and filter functions
  - [x] Install Leaflet + marker clustering
  - [x] Create HeritageMap component
  - [x] Create ExploreSidebar component
  - [x] Build Google Maps-style explore page
  - [x] Add category and status filters
  - [x] Multi-language search support

### 🔄 In Progress

_Nothing currently in progress_

### 📝 Pending

#### UI Translations (Optional Enhancement)

- [ ] Create translation files structure
  - [ ] `locales/en/common.json`
  - [ ] `locales/zh/common.json`
  - [ ] Translation helper utilities
- [ ] Create reusable language switcher component

---

## 📋 Phase 2: Map Integration

### ✅ Completed

- [x] Integrate Leaflet with OpenStreetMap
- [x] Implement marker clustering for performance
- [x] Add Leaflet CSS imports
- [x] Fix SSR issues with Leaflet (dynamic import)
- [x] Create HeritageMap component with full interactivity

### 📝 Pending (Future Enhancement)

- [ ] Map style switching (default, dark, terrain)
- [ ] Advanced marker customization by category
- [ ] Heatmap visualization option
- [ ] User location detection

---

## 📋 Phase 3: Heritage Sites Browsing

### ✅ Completed

- [x] Create data access functions (`lib/data/sites.ts`)
  - [x] `getAllSites()`
  - [x] `getSiteById(id)`
  - [x] `filterSites(filters)`
  - [x] `searchSites(query, locale)`
  - [x] `searchAndFilter(query, filters, locale)`
- [x] Create interactive explore page (`app/[locale]/explore`)

### ✅ Completed

- [x] Create heritage detail page (`app/[locale]/heritage/[id]/page.tsx`)
  - [x] Hero image section
  - [x] Site information display
  - [x] Small location map
  - [x] Related sites recommendations
  - [x] Share functionality
  - [x] Generate all 1,248 static pages
- [x] ~~Create map view page~~ → **Replaced by `/explore` page** ✅
  - [x] Full-screen interactive map
  - [x] Display all 1,247 sites as markers
  - [x] Marker clustering for performance
  - [x] Click marker to show popup
  - [x] Filter sites on map
  - [x] Jump to detail page from map

### 📝 Deprecated / Removed

- ~~[ ] Create heritage list page (`app/[locale]/heritage/page.tsx`)~~ → **REMOVED**
  - **Reason**: Redundant with Explore page; goes against "single hub" philosophy
  - Explore page already provides comprehensive browsing experience

---

## 📋 Phase 4: The Central Hub Experience

### 🎯 Goal

Transform `/explore` into the home page - a comprehensive hub for all WH exploration needs

### ✅ Completed

#### Hub Infrastructure & Routing

- [x] Move `/explore` to `/` (home page)
  - [x] Update routing structure
  - [x] Redirect old home to new home
  - [x] Update navigation links
  - [x] Update metadata and SEO

#### Enhanced Filtering & Search

- [x] Advanced filters for travel planning
  - [x] Country multi-select filter (with search/autocomplete)
    - [x] Full country names instead of 2-letter codes
    - [x] Alphabetical sorting by country name
    - [x] 167 countries mapped with English + Chinese names
    - [x] Search by country name
  - [x] Year range slider (inscription year)
  - [x] Region/continent filter
  - [x] Danger status toggle (highlight endangered sites)

#### UI/UX Enhancements

- [x] Optimize layout for "hub" experience
  - [x] Better sidebar information density
  - [x] Quick stats display (total sites, countries, etc.)
  - [x] Expandable statistics section with category breakdown
- [x] Mobile responsiveness improvements
  - [x] Mobile menu button with overlay sidebar
  - [x] Auto-close sidebar on mobile when selecting site
  - [x] Touch-friendly interactions
- [x] Loading states and skeleton screens
- [x] Empty states with helpful prompts

### 📝 Pending (Future Enhancements)

#### Search UX Improvements

- [ ] Search suggestions/autocomplete
- [ ] Recent searches
- [ ] Popular searches hints

#### Localized UI Strings

- [ ] Create translation files structure
  - [ ] `locales/en/common.json`
  - [ ] `locales/zh/common.json`
  - [ ] Translation helper utilities
- [ ] Migrate hardcoded UI text to translation files
- [ ] Reusable language switcher component

#### User Onboarding (for anonymous users)

- [ ] First-time visitor guide/tutorial
- [ ] Tooltips for key features
- [ ] "Sign up to unlock more" prompts (non-intrusive)

#### Advanced Features

- [ ] Featured/highlighted sites section on home
- [ ] Country flag icons in country selector
- [ ] Advanced search filters (UNESCO criteria, danger period, etc.)

---

## 📋 Phase 5: Mini Games Integration

### 🎯 Goal

Add interactive mini-games to the hub for engaging, gamified learning

### 📝 Pending

#### Games Entry Point

- [ ] Add games entry in main hub
  - [ ] Floating action button OR
  - [ ] Sidebar games section OR
  - [ ] Top navigation games menu
- [ ] Game selection page (`app/[locale]/games/page.tsx`)
  - [ ] Game cards with descriptions
  - [ ] Best scores display (if logged in)
  - [ ] Daily challenge highlight

#### Game Infrastructure

- [ ] Create game components structure (`components/games/`)
- [ ] Implement game state management
- [ ] Create result card component
- [ ] Score calculation utilities
- [ ] Game analytics (optional, client-side tracking)

#### Geo-Location Challenge Game

- [x] Create geo-challenge page (`app/[locale]/games/geo-challenge/page.tsx`)
  - [x] Random site selection (10 sites per round)
  - [x] Interactive map for clicking
  - [x] Distance calculation (Haversine formula)
  - [x] Score calculation based on distance
  - [x] Round-by-round feedback with fun facts _(todo: enrich with fact data source)_
  - [x] Final results page with stats
  - [ ] "Play Again" and "Share Score" functionality _(share outstanding)_

#### Image Matching Game

- [ ] Create image-match page (`app/[locale]/games/image-match/page.tsx`)
  - [ ] 4-choice quiz format
  - [ ] Random site selection
  - [ ] Timer (optional, with different difficulty levels)
  - [ ] Score tracking
  - [ ] Results page with educational info
  - [ ] Streak tracking

#### Daily Challenge (Future)

- [ ] Implement seed-based daily generation
- [ ] localStorage for tracking completion
- [ ] Social sharing for daily scores
- [ ] Leaderboard (requires Supabase)

---

## 📋 Phase 6: User Personalization (Requires Supabase)

### 🎯 Goal

Enable users to track, review, and manage their personal WH journey

### ✅ Completed

#### Supabase Setup

- [x] Create Supabase project
- [x] Set up environment variables
- [x] Install Supabase client libraries (`@supabase/supabase-js`, `@supabase/ssr`)

#### Authentication Flow

- [x] Implement Supabase Auth
  - [x] Social auth provider (Google OAuth)
  - [x] Auth state management (client/server/middleware)
  - [x] LoginButton component with Google branding
  - [x] UserMenu component with dropdown
  - [x] Sign out functionality with immediate UI update
  - [x] Integrate auth UI into ExploreSidebar header
  - [x] OAuth callback handling with comprehensive logging
  - [x] Token refresh in middleware

### 📝 Pending

#### Database Schema Design

- [ ] Design and create tables:
  - [ ] `users` - User profiles (auto-created by Supabase Auth)
  - [ ] `user_visits` - Visited sites tracking
    - Columns: `user_id`, `site_id`, `visit_date`, `notes`, `created_at`
  - [ ] `user_wishlist` - Want-to-visit sites
    - Columns: `user_id`, `site_id`, `added_at`, `priority`, `notes`
  - [ ] `user_reviews` - Site reviews and ratings
    - Columns: `user_id`, `site_id`, `rating_overall`, `rating_historical`, `rating_tourist_appeal`, `rating_accessibility`, `review_text`, `created_at`, `updated_at`
  - [ ] `game_scores` - Game results (optional)
    - Columns: `user_id`, `game_type`, `score`, `details (JSON)`, `played_at`
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database indexes for performance

#### User Profile & Settings

- [ ] User profile page (`app/[locale]/profile/page.tsx`)
  - [ ] Display user info
  - [ ] Edit profile
  - [ ] Account settings
- [ ] Additional auth features (future)
  - [ ] Email/password sign up
  - [ ] Password reset flow
  - [ ] GitHub OAuth provider

#### Visited Sites Feature

- [ ] Add "Mark as Visited" button in detail page
- [ ] Visited sites list view (`app/[locale]/profile/visited`)
  - [ ] Timeline view of visits
  - [ ] Filter by year/country/category
  - [ ] Add/edit visit notes
  - [ ] Export visited list
- [ ] Show visited markers differently on map (different color/icon)
- [ ] Personal statistics
  - [ ] Total sites visited
  - [ ] Countries visited
  - [ ] Categories breakdown
  - [ ] Completion percentage

#### Wishlist Feature

- [ ] Add "Add to Wishlist" button in detail page
- [ ] Wishlist page (`app/[locale]/profile/wishlist`)
  - [ ] Prioritized list (high/medium/low)
  - [ ] Group by country/region
  - [ ] Add notes for each site
  - [ ] Generate travel plan
- [ ] Show wishlist markers on map (different color/icon)

#### Review & Rating System

- [ ] Review form in detail page
  - [ ] Overall rating (1-5 stars)
  - [ ] Multi-dimension ratings:
    - Historical Value
    - Tourist Appeal
    - Accessibility
    - Value for Money
  - [ ] Review text (markdown support)
  - [ ] Photo upload (optional, future)
- [ ] Display reviews in detail page
  - [ ] User's own review (editable)
  - [ ] Community reviews (if multiple users)
  - [ ] Average ratings display
- [ ] Review management page (`app/[locale]/profile/reviews`)

#### Personal Dashboard

- [ ] Create dashboard page (`app/[locale]/profile/dashboard`)
  - [ ] Overview statistics
  - [ ] Recent activity
  - [ ] Visited sites map visualization
  - [ ] Wishlist summary
  - [ ] Game scores summary
  - [ ] Achievement badges (future)

---

## 📋 Phase 7: Data Export & Integration

### 🎯 Goal

Allow users to export their data to external tools for better personal knowledge management

### 📝 Pending

#### Export Infrastructure

- [ ] Create export utilities (`lib/export/`)
  - [ ] Data serialization functions
  - [ ] Format converters
  - [ ] API integrations

#### Notion Integration

- [ ] Research Notion API integration
- [ ] Implement Notion OAuth flow
- [ ] Create Notion export function
  - [ ] Export visited sites as database
  - [ ] Export wishlist
  - [ ] Export reviews
  - [ ] Include images and metadata
- [ ] Add "Export to Notion" button in profile

#### Other Export Formats

- [ ] Export to Markdown
  - [ ] Generate markdown files for each site
  - [ ] Include frontmatter metadata
  - [ ] Suitable for Obsidian/Logseq
- [ ] Export to CSV
  - [ ] For Excel/Google Sheets
  - [ ] Include all relevant fields
- [ ] Export to JSON
  - [ ] For programmatic use
  - [ ] Full data export

#### Travel Checklist Generator

- [ ] Create travel checklist page (`app/[locale]/profile/travel-plan`)
- [ ] Select sites from wishlist
- [ ] Generate printable checklist (PDF)
- [ ] Include useful travel info (location, opening hours, etc.)
- [ ] Export to calendar (iCal format)

---

## 📋 Phase 8: Polish & Deploy

### 📝 Pending

#### Performance Optimization

- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size analysis
- [ ] Lighthouse audit

#### SEO & Metadata

- [ ] Generate sitemap.xml (multi-language)
- [ ] robots.txt
- [ ] Open Graph tags
- [ ] Structured data (JSON-LD)
- [ ] Meta descriptions for all pages

#### Testing

- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] E2E tests for critical flows
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

#### Deployment

- [ ] Vercel deployment setup
- [ ] Environment variables configuration
- [ ] Custom domain setup (if any)
- [ ] Analytics integration (optional)
- [ ] Error tracking (Sentry, etc.) (optional)

#### Documentation

- [ ] User guide
- [ ] Contributing guidelines
- [ ] API documentation (if any)
- [ ] Deployment guide

---

## 🎯 Current Priority (Next Steps)

**Status**: Phase 6 (Authentication) in progress! 🔐

### ✅ Recently Completed: Google OAuth Authentication (2025-10-14)

**Phase 6 - Sprint 1: Supabase Setup & Google OAuth** - ✅ COMPLETED

1. ✅ **Supabase Infrastructure**
   - Installed `@supabase/supabase-js` (v2.48.1) and `@supabase/ssr` (v0.5.2)
   - Created client utilities for client/server/middleware environments
   - Configured environment variables for Vercel deployment

2. ✅ **Google OAuth Login**
   - LoginButton component with Google branding
   - OAuth callback route with comprehensive logging
   - Token refresh in middleware on every request
   - Redirect URL configuration with wildcard support

3. ✅ **User Menu & Profile**
   - UserMenu component with user avatar and dropdown
   - Real-time auth state synchronization
   - Client-side sign out with immediate UI update
   - Integrated into ExploreSidebar header

**Key Achievement**: Users can now sign in with Google and maintain session across page refreshes!

---

### ✅ Previously Completed: Phase 4 - The Central Hub Experience

**Sprint 1: Foundation** - ✅ COMPLETED (2025-10-14)

1. ✅ **Move Explore to Home**
   - Restructured routing: `/explore` → `/` (home page)
   - Updated all navigation links
   - Added redirect for backward compatibility
   - Enhanced metadata/SEO with Open Graph tags

2. ✅ **Enhanced Filtering**
   - Country multi-select with full names (not codes!)
   - Alphabetical sorting by country name
   - Year range slider (1978-2024)
   - Region/continent filter (5 UNESCO regions)
   - Danger status toggle

3. ✅ **UI/UX Polish**
   - Optimized sidebar layout for "hub" experience
   - Quick stats display (1,247 sites, 167 countries)
   - Expandable statistics section
   - Loading states with spinner
   - Mobile responsiveness with overlay sidebar
   - Empty states with helpful prompts

**Key Achievement**: Country filter improved based on user feedback

- Before: 2-letter codes (CN, US, GB), sorted by site count
- After: Full names (China, United States, United Kingdom), alphabetically sorted

---

### 🎯 Next Focus: Choose Your Path

**Sprint 2: Localization & Onboarding (Optional, Estimated: 2-3 hours)**

4. **Localized UI Strings**
   - Create `locales/en/common.json` & `locales/zh/common.json`
   - Migrate hardcoded text
   - Translation helper utilities
   - Estimated time: 1-2 hours

5. **User Onboarding**
   - First-time visitor guide
   - Tooltips for key features
   - "Sign up to unlock" prompts
   - Estimated time: 1 hour

---

### 🚀 Recommended Next Phases

**Option A: Phase 5 - Mini Games** (for engagement & fun)

- Add games entry point to hub
- Implement geo-location challenge
- Implement image matching game
- Daily challenge

**Option B: Phase 6 - User Personalization** (for stickiness)

- Supabase setup
- Authentication flow
- Visited/wishlist features
- Review system

**Option C: Phase 7 - Data Export** (for power users)

- Notion integration
- Markdown/CSV/JSON export
- Travel checklist generator

**Recommendation**: After completing Phase 4 (Hub), go with **Option A (Games)** first to increase engagement, then move to **Option B (User Features)** for retention.

---

## 📊 Progress Tracking

- **Overall Progress**: ~55% complete ⬆️ (authentication milestone reached!)
- **Phase 1 (Foundation)**: 100% complete ✅
- **Phase 2 (Maps)**: 100% complete ✅ (core done, Leaflet integrated)
- **Phase 3 (Heritage Browsing)**: 100% complete ✅ (explore + detail pages done)
- **Phase 4 (Central Hub)**: 100% complete ✅
  - Routing restructured
  - Advanced filters (country, year, region, status)
  - Mobile responsive
  - SEO optimized
- **Phase 5 (Mini Games)**: 20% complete (geo-challenge done, image matching pending)
- **Phase 6 (User Personalization)**: 25% complete 🔐 **IN PROGRESS**
  - ✅ Supabase setup
  - ✅ Google OAuth authentication
  - ⏳ Database schema & user features pending
- **Phase 7 (Data Export)**: 0% complete
- **Phase 8 (Polish & Deploy)**: 0% complete

---

## 🐛 Known Issues

_No issues yet - project just started!_

---

## 💡 Future Ideas & Enhancements

### User Experience

- [ ] Add more languages (French, Spanish, Russian, Arabic)
- [ ] Offline support (PWA)
- [ ] Dark mode
- [ ] Accessibility improvements (WCAG AA compliance)

### Advanced Features

- [ ] AR features for on-site visitors
- [ ] Virtual tours (360° photos / Street View integration)
- [ ] Integration with travel booking services (flights, hotels)
- [ ] Weather information for planning visits
- [ ] Best time to visit recommendations

### Social & Community

- [ ] Social features (follow other users, share collections)
- [ ] User-generated content (photos, tips)
- [ ] Comments system
- [ ] Community challenges and leaderboards
- [ ] Travel buddy matching

### Gamification

- [ ] Achievement badges system
- [ ] Streak tracking (daily visits)
- [ ] Heritage explorer levels
- [ ] Challenges and quests

### Data & Insights

- [ ] Personal insights dashboard (travel patterns, favorite categories, etc.)
- [ ] Global statistics (most visited, most wishlisted, etc.)
- [ ] Travel trends analysis
- [ ] Carbon footprint calculator for travel plans

---

## 📝 Notes

### Product Strategy Decision (2025-10-14)

**Key Decision**: Transform `/explore` into home page - single hub philosophy

**Rationale**:

- Avoid feature redundancy (list page vs explore page)
- Focus on core value: exploration, not navigation
- Better user experience with single source of truth
- Clearer product positioning

**Removed Features**:

- Heritage list page (`/heritage/page.tsx`) - redundant with explore
- Standalone games pages - will integrate into hub

### Multi-language Architecture

- **Approach**: Next.js i18n with `[locale]` dynamic routes
- **Data Structure**: Merged JSON with translations object
- **Initial Languages**: English + Chinese
- **URL Pattern**: `/en/heritage/1133`, `/zh/heritage/1133`
- **SEO**: Each language gets separate URLs for better indexing

### Map Provider Decision

- **Primary**: Leaflet + OpenStreetMap (free, unlimited)
- **Backup Options**: Mapbox, Google Maps, MapLibre
- **Switching**: Via environment variable (abstraction layer)
- **Status**: Leaflet successfully integrated ✅

### Deployment Strategy

- **Platform**: Vercel (free tier for hobby projects)
- **Build**: Static Site Generation (SSG) for detail pages (1,248 pages)
- **Home/Hub**: Server-side rendering or static with ISR
- **Updates**: Rebuild when UNESCO data updates

### Technology Stack

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **Map**: Leaflet + React Leaflet + Marker Clustering
- **Backend**: Supabase (auth + database) ✅
- **Authentication**: Google OAuth via Supabase Auth ✅
- **Deployment**: Vercel

---

## 🔗 Quick Links

- GitHub Repo: https://github.com/apue/world-heritage
- UNESCO Data Source: https://whc.unesco.org/
- Project Docs: `/docs/`
- Development Guide: `/docs/development.md`
- Map Architecture: `/docs/map-architecture.md`

---

**End of TODO** - Update this file as we make progress!
