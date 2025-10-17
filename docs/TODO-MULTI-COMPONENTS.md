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

### **Phase 1: Data Layer** ✅ COMPLETED

#### 1.1 Update Type Definitions

- [x] Update `lib/data/types.ts` - `ComponentSite` interface
  - [x] Add `latitude: number` (required)
  - [x] Add `longitude: number` (required)
  - [x] Add `wikidataUri: string`
  - [x] Add `country?: string`
  - [x] Keep existing `name`, `description`, `area`, `designation`
- [x] Add new type `UserComponentVisit`
  - [x] Fields: `id`, `userId`, `componentId`, `siteId`, `visitDate`, `notes`, `photos`
- [x] Add new type `PropertyVisitProgress`
  - [x] Fields: `siteId`, `totalComponents`, `visitedComponents`, `progress`, `isVisited`, `visitedComponentIds`
- [x] Update `UserSiteStatus` to include `visitProgress?: PropertyVisitProgress`
- [ ] **Estimated time**: 30 minutes

#### 1.2 Update Merge Script Type Definitions

- [x] Update `scripts/data-pipeline/2_merge_unesco.ts`
  - [x] Update `ComponentSite` interface (lines 73-80)
  - [x] Add `latitude`, `longitude` as required fields
  - [x] Add `wikidataUri` field
  - [x] Add `country?` optional field
- [ ] **Estimated time**: 15 minutes

#### 1.3 Create Wikidata Enrichment Script

- [x] Create `scripts/data-pipeline/3_enrich_wikidata.ts`
  - [x] Import and type definitions
  - [x] `extractBaseId()` function - normalize whs_id (handle bis/ter/quater/-001 formats)
  - [x] `extractWikidataId()` function - extract QID from URI
  - [x] Main flow:
    - [x] Load existing `data/sites.json`
    - [x] Load `data/raw/multi-sites-data.json`
    - [x] Deduplicate by Wikidata URI
    - [x] Group by base whs_id
    - [x] Merge into sites array
    - [x] Validate all components have coordinates
    - [x] Write updated `data/sites.json`
  - [x] Statistics logging
  - [x] Comprehensive error handling
- [ ] **Estimated time**: 2 hours

#### 1.4 Update Pipeline Scripts

- [x] Update `scripts/data-pipeline/run-all.sh`
  - [x] Add Stage 3: `npm run prepare:wikidata`
- [x] Update `package.json` scripts
  - [x] Add `"prepare:wikidata": "tsx scripts/data-pipeline/3_enrich_wikidata.ts"`
- [ ] **Estimated time**: 10 minutes

#### 1.5 Execute Data Integration

- [x] Run `npm run prepare:wikidata`
- [x] Verify `data/sites.json` updated correctly
- [x] Check statistics:
  - [x] Number of sites with components
  - [x] Total components added
  - [x] Average components per property
- [x] Commit updated `data/sites.json`
- [ ] **Estimated time**: 30 minutes

**Phase 1 Total**: ~3.5 hours

---

### **Phase 2: Database Layer** 🧱 READY

#### 2.1 Create Migration Script

- [x] Create `supabase/migrations/002_multi_components.sql`
  - [x] Create `user_component_visits` table
    - [x] Columns: `id`, `user_id`, `component_id`, `site_id`, `visit_date`, `notes`, `photos`, `created_at`, `updated_at`
    - [x] Unique constraint: `(user_id, component_id)`
    - [x] Indexes on `user_id`, `component_id`, `site_id`, `visit_date`
    - [x] RLS policies mirroring existing ownership rules
  - [x] Alter `user_wishlist` table
    - [x] Add `scope_type` column (property | component)
    - [x] Add `scope_id` column
    - [x] Create unique index on `(user_id, scope_type, scope_id)`
  - [x] Alter `user_bookmarks` table
    - [x] Add `scope_type` column
    - [x] Add `scope_id` column
    - [x] Create unique index
  - [x] Create `user_property_visit_progress` view
    - [x] Aggregate component visits by user and site
  - [x] Create `get_user_site_status()` function
  - [x] Mark `user_visits` as deprecated (comment, optional trigger to block writes) without dropping the table
- [ ] **Estimated time**: 2 hours

#### 2.2 Execute Migration

- [ ] Test migration locally (if possible)
- [ ] Run migration on Supabase: `supabase db push`
- [ ] Verify tables, views, and functions created correctly
- [ ] Verify RLS policies work
- [ ] Confirm `user_visits` is read-only and no longer used by services
- [ ] **Estimated time**: 30 minutes

**Phase 2 Total**: ~2.5 hours

---

### **Phase 3: API Layer** ✅ COMPLETED

#### 3.1 Create Components Service

- [x] Create `lib/services/components.ts`
  - [x] `getPropertyComponents(siteId)` - get all components of a property
  - [x] `getComponent(componentId)` - get single component details
  - [x] `hasComponents(siteId)` - check if property has components
  - [x] `getComponentCount(siteId)` - get total component count
- [ ] **Estimated time**: 1 hour

#### 3.2 Create User Visits Service

- [x] Create `lib/services/user-visits.ts`
  - [x] `markComponentVisited(userId, componentId, siteId, data)` - mark component as visited
  - [x] `getPropertyVisitProgress(userId, siteId)` - calculate visit progress
  - [x] `getUserComponentVisits(userId, siteId?)` - get user's component visits
  - [x] `unmarkComponentVisited(userId, componentId)` - remove visit mark
- [ ] **Estimated time**: 1.5 hours

#### 3.3 Update Lists Service

- [x] Handle wishlist/bookmark scope updates within `UserSitesContext` (client) while keeping API-ready helpers in the migration
  - [x] Writes include `scope_type` / `scope_id`
  - [x] Deletes filter by scope to avoid collisions
  - [ ] Future: extract shared helpers into `lib/services/user-lists.ts` if server usage grows
- [ ] **Estimated time**: 1 hour

#### 3.4 Create API Routes

- [x] Create `app/api/sites/[id]/components/route.ts`
  - [x] GET endpoint - return components list
- [x] Create `app/api/user/visits/components/route.ts`
  - [x] POST endpoint - mark component as visited
  - [x] DELETE endpoint - unmark component
- [x] Create `app/api/user/visits/progress/[siteId]/route.ts`
  - [x] GET endpoint - return visit progress
- [ ] **Estimated time**: 1.5 hours

**Phase 3 Total**: ~5 hours

---

### **Phase 4: Frontend Layer** 🔄 IN PROGRESS

#### 4.1 Create Component List Component

- [x] Create `components/heritage/ComponentList.tsx`
  - [x] Display list of components
  - [x] Show visited status (checkmark icon)
  - [x] Surface coordinates / area / designation when available
  - [ ] Click to show on mini-map (optional)
  - [x] Responsive design (mobile-friendly)
- [ ] **Estimated time**: 2 hours

#### 4.2 Create Visit Progress Component

- [x] Create `components/heritage/VisitProgress.tsx`
  - [x] Progress bar visualization
  - [x] "X / Y visited" text
  - [x] Percentage display
  - [ ] "Visited" badge if any component visited (optional, progress panel shows sign-in state instead)
- [ ] **Estimated time**: 1 hour

#### 4.3 Create Mark Visited Button

- [x] Integrate mark/unmark controls within `ComponentList` rows for streamlined UX
  - [x] "Mark as Visited" / "Visited ✓" states per row
  - [x] Loading feedback while syncing with API
  - [x] Optimistic UI with rollback on error
  - [ ] Replace alert with toast when notification system lands
- [ ] **Estimated time**: 1 hour

#### 4.4 Update Site Detail Page

- [x] Update `app/[locale]/heritage/[id]/page.tsx`
  - [x] Check if site has components
  - [x] Fetch visit progress (if user logged in)
  - [x] Render combined visits panel with progress + list
  - [x] Pass visited component IDs / handlers via panel
  - [x] Handle client-side interactions
- [ ] **Estimated time**: 1.5 hours

#### 4.5 Refine Explore Page (Property Overview)

- [ ] Keep Explore map marker set at property level (no component scatter by default)
- [ ] Ensure property marker state reflects component visits via aggregation
- [ ] Display lightweight summary in popup（如“共有 X 个组成地”）
- [ ] (Optional) provide deep-link按钮，引导至详情页的组件列表
- [ ] **Estimated time**: 1.5 hours

#### 4.6 Enhance Detail Page Component Map

- [ ] Add dedicated component map/mini-map with clustering适配高密度点位
- [ ] Sync component marker interactions with列表状态（标记已访、收藏等）
- [ ] Provide zoom/筛选手段（按区域或分页）以便管理超大串联遗产
- [ ] **Estimated time**: 2 hours

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
- [ ] Validate Explore 地图仅渲染 property marker 并正确反映访问状态
- [ ] Validate 详情页组件地图在密集串联遗产下的交互（聚类/缩放/列表同步）
- [ ] Test on mobile devices
- [ ] Test with不同规模的遗产（0 组件、1 组件、50+ 组件、>100 组件）
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

#### 5.4 Legacy Cleanup

- [ ] Prepare follow-up migration to drop `user_visits` and related artifacts after the new flow ships
- [ ] Remove residual references in services/tests before running the drop
- [ ] **Estimated time**: 15 minutes

**Phase 5 Total**: ~4.5 hours

---

## 📊 Progress Summary

| Phase                       | Status                        | Estimated Time  | Actual Time |
| --------------------------- | ----------------------------- | --------------- | ----------- |
| **Phase 1: Data Layer**     | ✅ COMPLETED                  | 3.5 hours       | 3.5 hours   |
| **Phase 2: Database Layer** | 🧱 READY (awaiting migration) | 2.5 hours       | -           |
| **Phase 3: API Layer**      | ✅ COMPLETED                  | 5 hours         | -           |
| **Phase 4: Frontend Layer** | 🔄 IN PROGRESS                | 7 hours         | -           |
| **Phase 5: Testing & Docs** | ⏳ PENDING                    | 4.5 hours       | -           |
| **TOTAL**                   | -                             | **~22.5 hours** | -           |

**Estimated Total**: 2-3 working days (assuming 8 hours/day)

---

## 🎯 Acceptance Criteria

### Data Layer ✅

- [x] `data/sites.json` contains components with coordinates
- [x] All components have `componentId`, `wikidataUri`, `latitude`, `longitude`, `name`
- [ ] No validation errors in `scripts/validate-components.ts`

### Database Layer ✅

- [ ] `user_component_visits` table created and accessible
- [ ] RLS policies work correctly
- [ ] Legacy `user_visits` table marked read-only and unused
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
- [ ] Explore 地图保持 property 级 marker，状态与组件访问同步
- [ ] 详情页组件地图/列表可用（含聚类或分页策略）
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
