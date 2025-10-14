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

### 📝 Pending

#### Hub Infrastructure & Routing

- [ ] Move `/explore` to `/` (home page)
  - [ ] Update routing structure
  - [ ] Redirect old home to new home
  - [ ] Update navigation links
  - [ ] Update metadata and SEO

#### Enhanced Filtering & Search

- [ ] Advanced filters for travel planning
  - [ ] Country multi-select filter (with search/autocomplete)
  - [ ] Year range slider (inscription year)
  - [ ] Region/continent filter
  - [ ] Danger status toggle (highlight endangered sites)
- [ ] Improve search UX
  - [ ] Search suggestions/autocomplete
  - [ ] Recent searches
  - [ ] Popular searches hints

#### UI/UX Enhancements

- [ ] Optimize layout for "hub" experience
  - [ ] Better sidebar information density
  - [ ] Quick stats display (total sites, countries, etc.)
  - [ ] Featured/highlighted sites section
- [ ] Mobile responsiveness improvements
- [ ] Loading states and skeleton screens
- [ ] Empty states with helpful prompts

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

- [ ] Create geo-challenge page (`app/[locale]/games/geo-challenge/page.tsx`)
  - [ ] Random site selection (10 sites per round)
  - [ ] Interactive map for clicking
  - [ ] Distance calculation (Haversine formula)
  - [ ] Score calculation based on distance
  - [ ] Round-by-round feedback with fun facts
  - [ ] Final results page with stats
  - [ ] "Play Again" and "Share Score" functionality

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

### 📝 Pending

#### Supabase Setup

- [ ] Create Supabase project
- [ ] Set up environment variables
- [ ] Install Supabase client libraries (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)

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

#### Authentication Flow

- [ ] Implement Supabase Auth
  - [ ] Sign up form with email validation
  - [ ] Sign in form
  - [ ] Password reset flow
  - [ ] Social auth providers (Google, GitHub)
  - [ ] Auth state management (context/hooks)
- [ ] User profile page (`app/[locale]/profile/page.tsx`)
  - [ ] Display user info
  - [ ] Edit profile
  - [ ] Account settings
  - [ ] Sign out functionality

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

**New Product Direction**: Transform Explore into an all-in-one hub (Home Page)

### Immediate Focus: Phase 4 - The Central Hub Experience

**Sprint 1: Foundation (Estimated: 3-4 hours)** ⭐ **START HERE**

1. **Move Explore to Home** (HIGHEST PRIORITY)
   - Restructure routing: `/explore` → `/` (home page)
   - Update all navigation links
   - Redirect old home if needed
   - Update metadata/SEO
   - Estimated time: 30 mins

2. **Enhanced Filtering** (HIGH PRIORITY)
   - Country multi-select filter with search
   - Year range slider
   - Region/continent filter
   - Danger status toggle
   - Estimated time: 2-3 hours

3. **UI/UX Polish** (MEDIUM PRIORITY)
   - Optimize sidebar layout for "hub" feel
   - Add quick stats (total sites, countries, etc.)
   - Loading states and skeleton screens
   - Mobile responsiveness check
   - Estimated time: 1-2 hours

**Sprint 2: Localization & Onboarding (Estimated: 2-3 hours)**

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

### Next Phases (After Sprint 1 & 2)

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

- **Overall Progress**: ~35% complete (recalibrated based on new scope)
- **Phase 1 (Foundation)**: 100% complete ✅
- **Phase 2 (Maps)**: 100% complete ✅ (core done, Leaflet integrated)
- **Phase 3 (Heritage Browsing)**: 100% complete ✅ (explore + detail pages done)
- **Phase 4 (Central Hub)**: 0% complete ⭐ **CURRENT FOCUS**
- **Phase 5 (Mini Games)**: 0% complete
- **Phase 6 (User Personalization)**: 0% complete
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
- **Backend (Future)**: Supabase (auth + database)
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
