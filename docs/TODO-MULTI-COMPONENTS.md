# Multi-Component Sites Implementation - TODO

**Created**: 2025-10-16
**Status**: Planning Complete, Ready for Implementation
**Target**: Phase 6.5 - Serial Properties Support

---

## 🎯 Project Goal

Implement component-level tracking for UNESCO serial properties (串联遗产), enabling users to:

- View all component sites of a serial property
- Mark individual components as visited
- Track visit progress (e.g., "visited 3 out of 12 components")
- Add components to wishlist/bookmark

**Core Principle**: Store visits at component level, aggregate to property level using "Any" logic (visit any component → property is visited).

---

## 📋 Implementation Plan

### **Phase 1: Data Layer** 🔄 IN PROGRESS

#### 1.1 Update Type Definitions

- [ ] Update `lib/data/types.ts` - `ComponentSite` interface
  - [ ] Add `latitude: number` (required)
  - [ ] Add `longitude: number` (required)
  - [ ] Add `wikidataUri: string`
  - [ ] Add `country?: string`
  - [ ] Keep existing `name`, `description`, `area`, `designation`
- [ ] Add new type `UserComponentVisit`
  - [ ] Fields: `id`, `userId`, `componentId`, `siteId`, `visitDate`, `notes`, `photos`
- [ ] Add new type `PropertyVisitProgress`
  - [ ] Fields: `siteId`, `totalComponents`, `visitedComponents`, `progress`, `isVisited`, `visitedComponentIds`
- [ ] Update `UserSiteStatus` to include `visitProgress?: PropertyVisitProgress`
- [ ] **Estimated time**: 30 minutes

#### 1.2 Update Merge Script Type Definitions

- [ ] Update `scripts/data-pipeline/2_merge_unesco.ts`
  - [ ] Update `ComponentSite` interface (lines 73-80)
  - [ ] Add `latitude`, `longitude` as required fields
  - [ ] Add `wikidataUri` field
  - [ ] Add `country?` optional field
- [ ] **Estimated time**: 15 minutes

#### 1.3 Create Wikidata Enrichment Script

- [ ] Create `scripts/data-pipeline/3_enrich_wikidata.ts`
  - [ ] Import and type definitions
  - [ ] `extractBaseId()` function - normalize whs_id (handle bis/ter/quater/-001 formats)
  - [ ] `extractWikidataId()` function - extract QID from URI
  - [ ] Main flow:
    - [ ] Load existing `data/sites.json`
    - [ ] Load `data/raw/multi-sites-data.json`
    - [ ] Deduplicate by Wikidata URI
    - [ ] Group by base whs_id
    - [ ] Merge into sites array
    - [ ] Validate all components have coordinates
    - [ ] Write updated `data/sites.json`
  - [ ] Statistics logging
  - [ ] Comprehensive error handling
- [ ] **Estimated time**: 2 hours

#### 1.4 Update Pipeline Scripts

- [ ] Update `scripts/data-pipeline/run-all.sh`
  - [ ] Add Stage 3: `npm run prepare:wikidata`
- [ ] Update `package.json` scripts
  - [ ] Add `"prepare:wikidata": "tsx scripts/data-pipeline/3_enrich_wikidata.ts"`
- [ ] **Estimated time**: 10 minutes

#### 1.5 Execute Data Integration

- [ ] Run `npm run prepare:wikidata`
- [ ] Verify `data/sites.json` updated correctly
- [ ] Check statistics:
  - [ ] Number of sites with components
  - [ ] Total components added
  - [ ] Average components per property
- [ ] Commit updated `data/sites.json`
- [ ] **Estimated time**: 30 minutes

**Phase 1 Total**: ~3.5 hours

---

### **Phase 2: Database Layer** ⏳ PENDING

#### 2.1 Create Migration Script

- [ ] Create `supabase/migrations/002_multi_components.sql`
  - [ ] Create `user_component_visits` table
    - [ ] Columns: `id`, `user_id`, `component_id`, `site_id`, `visit_date`, `notes`, `photos`, `created_at`, `updated_at`
    - [ ] Unique constraint: `(user_id, component_id)`
    - [ ] Indexes on `user_id`, `component_id`, `site_id`, `visit_date`
  - [ ] Alter `user_wishlist` table
    - [ ] Add `scope_type` column (property | component)
    - [ ] Add `scope_id` column
    - [ ] Migrate existing data
    - [ ] Create unique index on `(user_id, scope_type, scope_id)`
  - [ ] Alter `user_bookmarks` table
    - [ ] Add `scope_type` column
    - [ ] Add `scope_id` column
    - [ ] Migrate existing data
    - [ ] Create unique index
  - [ ] Create `user_property_visit_progress` view
    - [ ] Aggregate component visits by user and site
  - [ ] Create `get_user_site_status()` function
  - [ ] Set up RLS policies
  - [ ] Migrate data from old `user_visits` table
- [ ] **Estimated time**: 2 hours

#### 2.2 Execute Migration

- [ ] Test migration locally (if possible)
- [ ] Run migration on Supabase: `supabase db push`
- [ ] Verify tables created correctly
- [ ] Verify RLS policies work
- [ ] Test data migration (if there's existing data)
- [ ] **Estimated time**: 30 minutes

**Phase 2 Total**: ~2.5 hours

---

### **Phase 3: API Layer** ⏳ PENDING

#### 3.1 Create Components Service

- [ ] Create `lib/services/components.ts`
  - [ ] `getPropertyComponents(siteId)` - get all components of a property
  - [ ] `getComponent(componentId)` - get single component details
  - [ ] `hasComponents(siteId)` - check if property has components
  - [ ] `getComponentCount(siteId)` - get total component count
- [ ] **Estimated time**: 1 hour

#### 3.2 Create User Visits Service

- [ ] Create `lib/services/user-visits.ts`
  - [ ] `markComponentVisited(userId, componentId, siteId, data)` - mark component as visited
  - [ ] `getPropertyVisitProgress(userId, siteId)` - calculate visit progress
  - [ ] `getUserComponentVisits(userId, siteId?)` - get user's component visits
  - [ ] `unmarkComponentVisited(userId, componentId)` - remove visit mark
- [ ] **Estimated time**: 1.5 hours

#### 3.3 Update Lists Service

- [ ] Update `lib/services/user-lists.ts`
  - [ ] Update `addToWishlist()` - support `scopeType` and `scopeId`
  - [ ] Update `addToBookmark()` - support component-level bookmarks
  - [ ] Update `removeFromWishlist()` - handle scope
  - [ ] Update `removeFromBookmark()` - handle scope
- [ ] **Estimated time**: 1 hour

#### 3.4 Create API Routes

- [ ] Create `app/api/sites/[id]/components/route.ts`
  - [ ] GET endpoint - return components list
- [ ] Create `app/api/user/visits/components/route.ts`
  - [ ] POST endpoint - mark component as visited
  - [ ] DELETE endpoint - unmark component
- [ ] Create `app/api/user/visits/progress/[siteId]/route.ts`
  - [ ] GET endpoint - return visit progress
- [ ] **Estimated time**: 1.5 hours

**Phase 3 Total**: ~5 hours

---

### **Phase 4: Frontend Layer** ⏳ PENDING

#### 4.1 Create Component List Component

- [ ] Create `components/sites/ComponentList.tsx`
  - [ ] Display list of components
  - [ ] Show visited status (checkmark icon)
  - [ ] Expandable details (coordinates, area, designation)
  - [ ] Click to show on mini-map (optional)
  - [ ] Responsive design (mobile-friendly)
- [ ] **Estimated time**: 2 hours

#### 4.2 Create Visit Progress Component

- [ ] Create `components/sites/VisitProgress.tsx`
  - [ ] Progress bar visualization
  - [ ] "X / Y visited" text
  - [ ] Percentage display
  - [ ] "Visited" badge if any component visited
- [ ] **Estimated time**: 1 hour

#### 4.3 Create Mark Visited Button

- [ ] Create `components/sites/MarkComponentVisitedButton.tsx`
  - [ ] "Mark as Visited" / "Visited ✓" button
  - [ ] Loading state
  - [ ] Optimistic UI update
  - [ ] Error handling with toast
- [ ] **Estimated time**: 1 hour

#### 4.4 Update Site Detail Page

- [ ] Update `app/[locale]/heritage/[id]/page.tsx`
  - [ ] Check if site has components
  - [ ] Fetch visit progress (if user logged in)
  - [ ] Render `<VisitProgress />` component
  - [ ] Render `<ComponentList />` component
  - [ ] Pass visited component IDs
  - [ ] Handle client-side interactions
- [ ] **Estimated time**: 1.5 hours

#### 4.5 Update Explore Page (Map Markers)

- [ ] Update map markers to show component count badge
- [ ] Update popup to show visit progress
- [ ] (Optional) Add toggle to show/hide component markers
- [ ] **Estimated time**: 1.5 hours

**Phase 4 Total**: ~7 hours

---

### **Phase 5: Testing & Documentation** ⏳ PENDING

#### 5.1 Create Validation Script

- [ ] Create `scripts/validate-components.ts`
  - [ ] Check all sites with `hasComponents=true` have components array
  - [ ] Verify all components have coordinates
  - [ ] Check componentCount matches array length
  - [ ] Validate Wikidata URIs format
  - [ ] Check for missing required fields
- [ ] **Estimated time**: 1 hour

#### 5.2 Manual Testing

- [ ] Test data pipeline end-to-end
- [ ] Test component list display
- [ ] Test marking component as visited (logged in)
- [ ] Test visit progress calculation
- [ ] Test on mobile devices
- [ ] Test with different sites (0 components, 1 component, 50+ components)
- [ ] **Estimated time**: 2 hours

#### 5.3 Update Documentation

- [ ] Create `docs/architecture/multi-components.md`
  - [ ] Overview of architecture
  - [ ] Data flow diagram
  - [ ] Database schema
  - [ ] API endpoints
  - [ ] Design decisions
  - [ ] Future enhancements
- [ ] Update `DATA_PIPELINE.md`
  - [ ] Document Stage 3 (Wikidata enrichment)
  - [ ] Update data flow diagram
  - [ ] Update output format section
- [ ] Update main `TODO.md`
  - [ ] Mark Phase 6.5 as completed
  - [ ] Update progress percentage
- [ ] **Estimated time**: 1.5 hours

**Phase 5 Total**: ~4.5 hours

---

## 📊 Progress Summary

| Phase                       | Status         | Estimated Time  | Actual Time |
| --------------------------- | -------------- | --------------- | ----------- |
| **Phase 1: Data Layer**     | 🔄 IN PROGRESS | 3.5 hours       | -           |
| **Phase 2: Database Layer** | ⏳ PENDING     | 2.5 hours       | -           |
| **Phase 3: API Layer**      | ⏳ PENDING     | 5 hours         | -           |
| **Phase 4: Frontend Layer** | ⏳ PENDING     | 7 hours         | -           |
| **Phase 5: Testing & Docs** | ⏳ PENDING     | 4.5 hours       | -           |
| **TOTAL**                   | -              | **~22.5 hours** | -           |

**Estimated Total**: 2-3 working days (assuming 8 hours/day)

---

## 🎯 Acceptance Criteria

### Data Layer ✅

- [ ] `data/sites.json` contains components with coordinates
- [ ] All components have `componentId`, `wikidataUri`, `latitude`, `longitude`, `name`
- [ ] No validation errors in `scripts/validate-components.ts`

### Database Layer ✅

- [ ] `user_component_visits` table created and accessible
- [ ] RLS policies work correctly
- [ ] Old `user_visits` data migrated successfully
- [ ] `user_property_visit_progress` view returns correct data

### API Layer ✅

- [ ] Can fetch components list via API
- [ ] Can mark component as visited (POST /api/user/visits/components)
- [ ] Can fetch visit progress (GET /api/user/visits/progress/[siteId])
- [ ] Proper error handling and authentication

### Frontend Layer ✅

- [ ] Component list displays correctly on site detail page
- [ ] Visit progress bar shows accurate percentage
- [ ] "Mark as Visited" button works
- [ ] Visited components show checkmark
- [ ] Responsive on mobile devices
- [ ] Loading states implemented

### Overall Quality ✅

- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] Git commits follow conventional commit format

---

## 📝 Development Notes

### GitHub Workflow

**Branch Strategy**:

```bash
# Create feature branch
git checkout -b feat/multi-component-sites

# Work on Phase 1
git add .
git commit -m "feat(data): update ComponentSite type with coordinates"

# Continue with incremental commits
git commit -m "feat(data): create Wikidata enrichment script"
git commit -m "feat(data): integrate components into sites.json"

# Phase 2
git commit -m "feat(db): add user_component_visits table"
git commit -m "feat(db): update wishlist/bookmark for component scope"

# Phase 3
git commit -m "feat(api): create components service"
git commit -m "feat(api): add component visit tracking"

# Phase 4
git commit -m "feat(ui): create ComponentList component"
git commit -m "feat(ui): add visit progress visualization"

# Phase 5
git commit -m "test: add components data validation"
git commit -m "docs: document multi-component architecture"

# Final PR
git push origin feat/multi-component-sites
# Create Pull Request on GitHub
```

**Commit Message Format**:

- `feat(scope): description` - New features
- `fix(scope): description` - Bug fixes
- `refactor(scope): description` - Code refactoring
- `docs(scope): description` - Documentation updates
- `test(scope): description` - Testing
- `chore(scope): description` - Maintenance

**Scopes**: `data`, `db`, `api`, `ui`, `docs`

### Code Review Checklist

Before creating PR:

- [ ] All TODO items in current phase marked as complete
- [ ] No `console.log()` statements left
- [ ] TypeScript strict mode passes
- [ ] ESLint passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Manual testing completed
- [ ] Documentation updated

---

## 🔗 Related Documents

- [Main TODO.md](./TODO.md) - Project-wide TODO
- [DATA_PIPELINE.md](../DATA_PIPELINE.md) - Data processing pipeline
- [multi-components.md](./multi-components.md) - UX requirements (Chinese)
- [001_user_sites.sql](../supabase/migrations/001_user_sites.sql) - Existing schema

---

## 🚀 Quick Start (for Developer)

```bash
# 1. Start development (already running)
npm run dev

# 2. Start working on Phase 1
# Edit: lib/data/types.ts
# Edit: scripts/data-pipeline/2_merge_unesco.ts
# Create: scripts/data-pipeline/3_enrich_wikidata.ts

# 3. Run data pipeline
npm run prepare:wikidata

# 4. Verify data
tsx scripts/validate-components.ts

# 5. Commit changes
git add .
git commit -m "feat(data): implement Wikidata component enrichment"

# 6. Move to Phase 2...
```

---

**Next Step**: Start with Phase 1.1 - Update Type Definitions ✅

**End of TODO** - Update checkboxes as we progress!
