# World Heritage Explorer - TODO List

**Last Updated**: 2025-01-13
**Current Phase**: Phase 1 - Foundation & Multi-language Setup

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

### 📝 Pending

#### List View

- [ ] Create heritage list page (`app/[locale]/heritage/page.tsx`)
  - [ ] Site card component
  - [ ] Grid/list layout
  - [ ] Pagination or infinite scroll
  - [ ] Filter sidebar (category, region, country)
  - [ ] Search functionality

#### Detail View

- [ ] Create heritage detail page (`app/[locale]/heritage/[id]/page.tsx`)
  - [ ] Hero image section
  - [ ] Site information display
  - [ ] Small location map
  - [ ] Related sites recommendations
  - [ ] Share functionality
  - [ ] Generate all 1,248 static pages

#### Map View

- [x] ~~Create map view page~~ → **Replaced by `/explore` page** ✅
  - [x] Full-screen interactive map
  - [x] Display all 1,247 sites as markers
  - [x] Marker clustering for performance
  - [x] Click marker to show popup
  - [x] Filter sites on map
  - [ ] Jump to detail page from map (pending detail page)

---

## 📋 Phase 4: Games Implementation

### 📝 Pending

#### Game Infrastructure

- [ ] Create game components structure (`components/games/`)
- [ ] Implement game state management
- [ ] Create result card component
- [ ] Create score calculation utilities

#### Geo-Location Challenge Game

- [ ] Create game selection page (`app/[locale]/games/page.tsx`)
- [ ] Create geo-challenge page (`app/[locale]/games/geo-challenge/page.tsx`)
  - [ ] Random site selection (10 sites)
  - [ ] Interactive map for clicking
  - [ ] Distance calculation (Haversine formula)
  - [ ] Score calculation based on distance
  - [ ] Round-by-round feedback
  - [ ] Final results page
  - [ ] "Play Again" functionality

#### Image Matching Game

- [ ] Create image-match page (`app/[locale]/games/image-match/page.tsx`)
  - [ ] 4-choice quiz format (recommended)
  - [ ] Random site selection
  - [ ] Timer (optional)
  - [ ] Score tracking
  - [ ] Results page

#### Daily Challenge (Optional)

- [ ] Implement seed-based random generation
- [ ] localStorage for tracking completion
- [ ] Leaderboard (client-side only initially)

---

## 📋 Phase 5: Supabase Integration (Future)

### 📝 Pending

#### Setup

- [ ] Create Supabase project
- [ ] Set up environment variables
- [ ] Install Supabase client libraries

#### Database Schema

- [ ] Design schema for:
  - [ ] Users table
  - [ ] User visits (visited sites)
  - [ ] User wishlist (want to visit)
  - [ ] User ratings (multi-dimension ratings)
  - [ ] Game results (optional)

#### Authentication

- [ ] Implement Supabase Auth
  - [ ] Sign up flow
  - [ ] Sign in flow
  - [ ] Social auth (Google, GitHub, etc.)
  - [ ] User profile page

#### User Features

- [ ] Visited sites tracking
- [ ] Wishlist functionality
- [ ] Rating system (Historical Value, Tourist Appeal, Accessibility, Value)
- [ ] Personal statistics dashboard
- [ ] User collection export

---

## 📋 Phase 6: Polish & Deploy

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

**Immediate tasks to focus on**:

1. **Heritage Detail Page** (HIGHEST PRIORITY)
   - File: `app/[locale]/heritage/[id]/page.tsx`
   - Goal: Create individual site page with full information
   - Features: Hero image, site info, small map, related sites
   - Estimated time: 2-3 hours

2. **Heritage List Page** (HIGH PRIORITY)
   - File: `app/[locale]/heritage/page.tsx`
   - Goal: Grid/list view of all sites with filtering
   - Features: Card layout, pagination, filters
   - Estimated time: 2-3 hours

3. **Advanced Filters on Explore Page** (MEDIUM PRIORITY)
   - Add country multi-select filter
   - Add year range slider
   - Estimated time: 1-2 hours

Once these are done, we can proceed with:

- Games implementation (for engagement)
- OR User features with Supabase (for personalization)
- OR Performance optimization and deployment

---

## 📊 Progress Tracking

- **Overall Progress**: ~40% complete ⬆️
- **Phase 1 (Foundation)**: 100% complete ✅
- **Phase 2 (Maps)**: 90% complete ⬆️ (core done, enhancements pending)
- **Phase 3 (Heritage)**: 40% complete ⬆️ (explore page done, detail/list pending)
- **Phase 4 (Games)**: 0% complete
- **Phase 5 (Supabase)**: 0% complete
- **Phase 6 (Polish)**: 0% complete

---

## 🐛 Known Issues

_No issues yet - project just started!_

---

## 💡 Ideas & Enhancements

- [ ] Add more languages (French, Spanish, Russian, Arabic)
- [ ] Offline support (PWA)
- [ ] AR features for on-site visitors
- [ ] User-generated content (photos, reviews)
- [ ] Social features (follow other users, share collections)
- [ ] Export travel itinerary
- [ ] Integration with travel booking services
- [ ] Virtual tours (360° photos)

---

## 📝 Notes

### Multi-language Architecture Decision

- **Approach**: Next.js i18n with `[locale]` dynamic routes
- **Data Structure**: Merged JSON with translations object
- **Initial Languages**: English + Chinese
- **URL Pattern**: `/en/heritage/1133`, `/zh/heritage/1133`
- **SEO**: Each language gets separate URLs for better indexing

### Map Provider Decision

- **Primary**: Leaflet + OpenStreetMap (free, unlimited)
- **Backup Options**: Mapbox, Google Maps, MapLibre
- **Switching**: Via environment variable (abstraction layer)

### Deployment Strategy

- **Platform**: Vercel (free tier for hobby projects)
- **Build**: Static Site Generation (SSG) for all heritage pages
- **Updates**: Rebuild when UNESCO data updates

---

## 🔗 Quick Links

- GitHub Repo: https://github.com/apue/world-heritage
- UNESCO Data Source: https://whc.unesco.org/
- Project Docs: `/docs/`
- Development Guide: `/docs/development.md`
- Map Architecture: `/docs/map-architecture.md`

---

**End of TODO** - Update this file as we make progress!
