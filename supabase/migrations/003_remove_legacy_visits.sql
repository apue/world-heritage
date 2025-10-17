-- Migration: Remove legacy user_visits table and dependencies
-- Created: 2025-10-17
-- Purpose: clean up deprecated property-level visit storage now that component visits are live

BEGIN;

-- Drop policies tied to user_visits
DROP POLICY IF EXISTS "Users can read own visits" ON user_visits;
DROP POLICY IF EXISTS "Prevent writes to user_visits" ON user_visits;
DROP POLICY IF EXISTS "Prevent updates to user_visits" ON user_visits;
DROP POLICY IF EXISTS "Prevent deletes from user_visits" ON user_visits;
DROP POLICY IF EXISTS "Users can manage own visits" ON user_visits;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_visits_user_id;
DROP INDEX IF EXISTS idx_user_visits_site_id;
DROP INDEX IF EXISTS idx_user_visits_date;

-- Drop trigger
DROP TRIGGER IF EXISTS user_visits_updated_at ON user_visits;

-- Drop table
DROP TABLE IF EXISTS user_visits;

COMMIT;
