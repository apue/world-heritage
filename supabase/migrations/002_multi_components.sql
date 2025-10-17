-- Migration: Multi-Component Support
-- Created: 2025-10-17

BEGIN;

-- 1. Component-level visits table -------------------------------------------------
CREATE TABLE IF NOT EXISTS user_component_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL,
  site_id TEXT NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_component_visits_user_component_unique UNIQUE (user_id, component_id)
);

-- Indexes to support frequent lookups
CREATE INDEX IF NOT EXISTS idx_user_component_visits_user ON user_component_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_component_visits_component ON user_component_visits(component_id);
CREATE INDEX IF NOT EXISTS idx_user_component_visits_site ON user_component_visits(site_id);
CREATE INDEX IF NOT EXISTS idx_user_component_visits_date ON user_component_visits(visit_date DESC);

-- Reuse generic updated_at trigger
CREATE TRIGGER user_component_visits_updated_at
BEFORE UPDATE ON user_component_visits
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security and owner-only access
ALTER TABLE user_component_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own component visits" ON user_component_visits
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_component_visits TO authenticated;
GRANT ALL ON user_component_visits TO service_role;

COMMENT ON TABLE user_component_visits IS 'Component-level visit tracking for serial World Heritage properties.';
COMMENT ON COLUMN user_component_visits.component_id IS 'Wikidata QID identifying the component (e.g., Q29583927).';
COMMENT ON COLUMN user_component_visits.site_id IS 'Parent UNESCO site identifier (whs_id).';

-- 2. Wishlist table alterations ---------------------------------------------------
ALTER TABLE user_wishlist
  ADD COLUMN IF NOT EXISTS scope_type TEXT NOT NULL DEFAULT 'property'
    CHECK (scope_type IN ('property', 'component')),
  ADD COLUMN IF NOT EXISTS scope_id TEXT;

-- Backfill scope_id for existing rows
UPDATE user_wishlist
SET scope_id = site_id
WHERE scope_id IS NULL;

-- Ensure scope_id is not null going forward
ALTER TABLE user_wishlist
  ALTER COLUMN scope_id SET NOT NULL;

-- Replace unique constraint with scoped variant
ALTER TABLE user_wishlist
  DROP CONSTRAINT IF EXISTS user_wishlist_user_id_site_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS user_wishlist_scope_unique
  ON user_wishlist(user_id, scope_type, scope_id);

-- Helpful index for scoped lookups
CREATE INDEX IF NOT EXISTS idx_user_wishlist_scope
  ON user_wishlist(scope_type, scope_id);

COMMENT ON COLUMN user_wishlist.scope_type IS 'Target scope: property-level (whole site) or component-level.';
COMMENT ON COLUMN user_wishlist.scope_id IS 'Identifier matching the chosen scope (site_id or component_id).';

-- 3. Bookmark table alterations ---------------------------------------------------
ALTER TABLE user_bookmarks
  ADD COLUMN IF NOT EXISTS scope_type TEXT NOT NULL DEFAULT 'property'
    CHECK (scope_type IN ('property', 'component')),
  ADD COLUMN IF NOT EXISTS scope_id TEXT;

UPDATE user_bookmarks
SET scope_id = site_id
WHERE scope_id IS NULL;

ALTER TABLE user_bookmarks
  ALTER COLUMN scope_id SET NOT NULL;

ALTER TABLE user_bookmarks
  DROP CONSTRAINT IF EXISTS user_bookmarks_user_id_site_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS user_bookmarks_scope_unique
  ON user_bookmarks(user_id, scope_type, scope_id);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_scope
  ON user_bookmarks(scope_type, scope_id);

COMMENT ON COLUMN user_bookmarks.scope_type IS 'Target scope: property-level (whole site) or component-level.';
COMMENT ON COLUMN user_bookmarks.scope_id IS 'Identifier matching the chosen scope (site_id or component_id).';

-- 4. Aggregated progress view -----------------------------------------------------
CREATE OR REPLACE VIEW user_property_visit_progress AS
SELECT
  user_id,
  site_id,
  COUNT(DISTINCT component_id) AS visited_components,
  ARRAY_AGG(DISTINCT component_id ORDER BY component_id) AS visited_component_ids,
  MIN(visit_date) AS first_visit_date,
  MAX(visit_date) AS last_visit_date
FROM user_component_visits
GROUP BY user_id, site_id;

COMMENT ON VIEW user_property_visit_progress IS 'Aggregated component visit progress per user and site.';

GRANT SELECT ON user_property_visit_progress TO authenticated, service_role;

-- 5. Helper function for site status ---------------------------------------------
CREATE OR REPLACE FUNCTION get_user_site_status(p_user_id UUID, p_site_id TEXT)
RETURNS TABLE (
  visited BOOLEAN,
  visited_components INTEGER,
  visited_component_ids TEXT[],
  wishlist BOOLEAN,
  bookmark BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH progress AS (
    SELECT
      visited_components,
      visited_component_ids
    FROM user_property_visit_progress
    WHERE user_id = p_user_id
      AND site_id = p_site_id
  )
  SELECT
    COALESCE(progress.visited_components > 0, FALSE) AS visited,
    COALESCE(progress.visited_components, 0) AS visited_components,
    COALESCE(progress.visited_component_ids, ARRAY[]::TEXT[]) AS visited_component_ids,
    EXISTS (
      SELECT 1 FROM user_wishlist
      WHERE user_id = p_user_id
        AND scope_type = 'property'
        AND scope_id = p_site_id
    ) AS wishlist,
    EXISTS (
      SELECT 1 FROM user_bookmarks
      WHERE user_id = p_user_id
        AND scope_type = 'property'
        AND scope_id = p_site_id
    ) AS bookmark;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_user_site_status(UUID, TEXT) TO authenticated, service_role;

-- 6. Deprecate legacy user_visits table ------------------------------------------
COMMENT ON TABLE user_visits IS 'DEPRECATED: Replaced by user_component_visits. Pending removal after multi-component rollout.';

DROP POLICY IF EXISTS "Users can manage own visits" ON user_visits;

CREATE POLICY "Users can read own visits" ON user_visits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Optional: prevent inserts/updates by creating restrictive policies
CREATE POLICY "Prevent writes to user_visits" ON user_visits
  FOR INSERT TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY "Prevent updates to user_visits" ON user_visits
  FOR UPDATE TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY "Prevent deletes from user_visits" ON user_visits
  FOR DELETE TO authenticated
  USING (FALSE);

-- Allow service role to manage data if needed for backfills/debugging
GRANT SELECT ON user_visits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_visits TO service_role;

COMMIT;
