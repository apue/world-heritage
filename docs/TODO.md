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

### 🔄 In Progress

_Nothing currently in progress_

### 📝 Pending

#### Data Processing

- [ ] Download Chinese XML data (`data/whc-zh.xml`)
- [ ] Run data processing script to generate `data/sites.json`
- [ ] Verify merged data quality

#### UI Translations

- [ ] Create translation files structure
  - [ ] `locales/en/common.json`
  - [ ] `locales/zh/common.json`
  - [ ] Translation helper utilities
- [ ] Create reusable language switcher component

---

## 📋 Phase 2: Map Integration

### 📝 Pending

#### Leaflet Adapter Implementation

- [ ] Implement Leaflet adapter (`lib/maps/adapters/leaflet.ts`)
  - [ ] Basic map initialization
  - [ ] Marker management
  - [ ] Event handling
  - [ ] Style switching (default, dark, terrain)

#### Map Components

- [ ] Create MapProvider component (`lib/maps/MapProvider.tsx`)
- [ ] Create MapFactory (`lib/maps/MapFactory.ts`)
- [ ] Create map hooks (`lib/maps/hooks/useMap.ts`)

#### Map Integration

- [ ] Test map with sample data
- [ ] Add Leaflet CSS imports
- [ ] Fix any SSR issues with Leaflet

---

## 📋 Phase 3: Heritage Sites Browsing

### 📝 Pending

#### Data Layer

- [ ] Create data access functions (`lib/data/sites.ts`)
  - [ ] `getAllSites(locale)`
  - [ ] `getSiteById(id, locale)`
  - [ ] `filterSites(criteria)`
  - [ ] `searchSites(query, locale)`

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

- [ ] Create map view page (`app/[locale]/heritage/map/page.tsx`)
  - [ ] Full-screen interactive map
  - [ ] Display all 1,248 sites as markers
  - [ ] Marker clustering for performance
  - [ ] Click marker to show popup
  - [ ] Filter sites on map
  - [ ] Jump to detail page from map

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

1. **Download Chinese XML Data** (HIGHEST PRIORITY)
   - File: `data/whc-zh.xml`
   - Goal: Get Chinese translations for all sites
   - Estimated time: 15 minutes

2. **Run Data Processing** (HIGHEST PRIORITY)
   - Command: `npm run prepare-data`
   - Goal: Generate merged `data/sites.json` with both languages
   - Estimated time: 5 minutes

3. **Test with Heritage Detail Page** (HIGH PRIORITY)
   - File: `app/[locale]/heritage/[id]/page.tsx`
   - Goal: Verify i18n works with real data
   - Estimated time: 1-2 hours

Once these are done, we can proceed with either:

- Map integration (for visual appeal)
- OR Heritage browsing pages (for content)
- OR Games (for engagement)

---

## 📊 Progress Tracking

- **Overall Progress**: ~25% complete
- **Phase 1 (Foundation)**: 80% complete ⬆️
- **Phase 2 (Maps)**: 0% complete
- **Phase 3 (Heritage)**: 0% complete
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
