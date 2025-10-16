-- Migration: User Sites Tables (Visits, Wishlist, Bookmarks)
-- Created: 2025-10-15

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. User Visits Table
CREATE TABLE user_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, site_id)
);

-- Indexes for user_visits
CREATE INDEX idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX idx_user_visits_site_id ON user_visits(site_id);
CREATE INDEX idx_user_visits_date ON user_visits(visit_date DESC);

-- Trigger for user_visits
CREATE TRIGGER user_visits_updated_at
BEFORE UPDATE ON user_visits
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. User Wishlist Table
CREATE TABLE user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  planned_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, site_id)
);

-- Indexes for user_wishlist
CREATE INDEX idx_user_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX idx_user_wishlist_priority ON user_wishlist(priority, created_at);

-- Trigger for user_wishlist
CREATE TRIGGER user_wishlist_updated_at
BEFORE UPDATE ON user_wishlist
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. User Bookmarks Table (renamed from favorites)
CREATE TABLE user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id TEXT NOT NULL,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, site_id)
);

-- Index for user_bookmarks
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_site_id ON user_bookmarks(site_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own data
CREATE POLICY "Users can manage own visits" ON user_visits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON user_wishlist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE user_visits IS 'Stores heritage sites that users have visited';
COMMENT ON TABLE user_wishlist IS 'Stores heritage sites that users want to visit';
COMMENT ON TABLE user_bookmarks IS 'Stores heritage sites that users have bookmarked for reference';

COMMENT ON COLUMN user_visits.visit_date IS 'Date when the user visited the site (defaults to today)';
COMMENT ON COLUMN user_visits.rating IS 'User rating from 1-5 stars (optional)';
COMMENT ON COLUMN user_wishlist.priority IS 'Priority level: high, medium, or low';
COMMENT ON COLUMN user_wishlist.planned_date IS 'Date when user plans to visit (optional)';
