-- Free For NonProfits: Initial Schema Migration
-- Comprehensive database schema for the nonprofit software directory
-- Created: 2026-04-03

-- ============================================================================
-- 1. ENUMS & TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE org_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE pricing_model AS ENUM ('free', 'freemium', 'nonprofit_discount');


-- ============================================================================
-- 2. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  org_name TEXT,
  org_size org_size,
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profile information extending Supabase auth.users';
COMMENT ON COLUMN profiles.email IS 'Email address (denormalized from auth.users)';
COMMENT ON COLUMN profiles.display_name IS 'User''s public display name';
COMMENT ON COLUMN profiles.org_name IS 'Organization name (if applicable)';
COMMENT ON COLUMN profiles.org_size IS 'Organization size: small (1-10), medium (11-50), large (50+)';
COMMENT ON COLUMN profiles.role IS 'User role for access control';


-- ============================================================================
-- 3. CATEGORIES TABLE
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Software categories for organization';
COMMENT ON COLUMN categories.slug IS 'URL-friendly slug for categories';
COMMENT ON COLUMN categories.icon IS 'Emoji or icon identifier';
COMMENT ON COLUMN categories.display_order IS 'Order in which categories appear in UI';

CREATE INDEX idx_categories_slug ON categories(slug);


-- ============================================================================
-- 4. TOOLS TABLE (main directory entry)
-- ============================================================================

CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  pricing_model pricing_model NOT NULL,
  nonprofit_deal TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  rating_avg NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tools IS 'Directory of free and discounted software tools for nonprofits';
COMMENT ON COLUMN tools.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN tools.pricing_model IS 'Pricing type: free, freemium, or nonprofit_discount';
COMMENT ON COLUMN tools.nonprofit_deal IS 'Description of nonprofit-specific offer/discount';
COMMENT ON COLUMN tools.features IS 'JSON array of feature strings';
COMMENT ON COLUMN tools.tags IS 'Array of searchable tags';
COMMENT ON COLUMN tools.rating_avg IS 'Average rating from reviews (1-5)';
COMMENT ON COLUMN tools.review_count IS 'Total number of reviews';
COMMENT ON COLUMN tools.is_verified IS 'Tool has been verified as legitimate and working';
COMMENT ON COLUMN tools.is_featured IS 'Tool is featured on homepage';
COMMENT ON COLUMN tools.search_vector IS 'PostgreSQL full-text search vector';
COMMENT ON COLUMN tools.approved_at IS 'Timestamp when tool was approved';

CREATE INDEX idx_tools_category_id ON tools(category_id);
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_is_verified_featured ON tools(is_verified, is_featured);
CREATE INDEX idx_tools_rating_avg ON tools(rating_avg DESC);
CREATE INDEX idx_tools_search_vector ON tools USING GIN(search_vector);


-- ============================================================================
-- 5. REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  org_size org_size,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

COMMENT ON TABLE reviews IS 'User reviews for tools in the directory';
COMMENT ON COLUMN reviews.rating IS 'Numerical rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.org_size IS 'Organization size of reviewer (for filtering)';
COMMENT ON COLUMN reviews.helpful_count IS 'Number of users who found this review helpful';
COMMENT ON CONSTRAINT "reviews_tool_id_user_id_key" ON reviews IS 'Ensures one review per user per tool';

CREATE INDEX idx_reviews_tool_id ON reviews(tool_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);


-- ============================================================================
-- 6. SAVED_TOOLS TABLE (bookmarks)
-- ============================================================================

CREATE TABLE saved_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

COMMENT ON TABLE saved_tools IS 'User bookmarks/saved tools for future reference';
COMMENT ON CONSTRAINT "saved_tools_user_id_tool_id_key" ON saved_tools IS 'Ensures one bookmark per user per tool';

CREATE INDEX idx_saved_tools_user_id ON saved_tools(user_id);


-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function: update_updated_at()
-- Automatically updates the updated_at timestamp column on row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_updated_at() IS 'Trigger function to auto-update the updated_at timestamp column';


-- Function: update_tool_rating()
-- Recalculates tools.rating_avg and review_count when reviews are modified
CREATE OR REPLACE FUNCTION update_tool_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_tool_id UUID;
  v_avg_rating NUMERIC;
  v_count INTEGER;
BEGIN
  -- Determine which tool_id to update
  IF TG_OP = 'DELETE' THEN
    v_tool_id := OLD.tool_id;
  ELSE
    v_tool_id := NEW.tool_id;
  END IF;

  -- Calculate new average and count
  SELECT
    AVG(rating),
    COUNT(*)
  INTO v_avg_rating, v_count
  FROM reviews
  WHERE tool_id = v_tool_id;

  -- Update the tool record
  UPDATE tools
  SET
    rating_avg = COALESCE(v_avg_rating, 0),
    review_count = COALESCE(v_count, 0)
  WHERE id = v_tool_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_tool_rating() IS 'Trigger function to recalculate tool ratings and review counts after review changes';


-- Function: update_tool_search_vector()
-- Updates the full-text search vector when tool data changes
CREATE OR REPLACE FUNCTION update_tool_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.nonprofit_deal, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_tool_search_vector() IS 'Trigger function to auto-update full-text search vector on tool changes';


-- Function: handle_new_user()
-- Auto-creates a profile when a new user is created in auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user() IS 'Trigger function to create profile entry when user signs up';


-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Auto-update profiles.updated_at
CREATE TRIGGER trigger_profiles_update_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Auto-update tools.updated_at
CREATE TRIGGER trigger_tools_update_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Auto-update tools.updated_at and search_vector
CREATE TRIGGER trigger_tools_update_search_vector
BEFORE INSERT OR UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION update_tool_search_vector();

-- Recalculate tool ratings when reviews change
CREATE TRIGGER trigger_reviews_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_tool_rating();

-- Auto-update reviews.updated_at
CREATE TRIGGER trigger_reviews_update_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create profile when user signs up
CREATE TRIGGER trigger_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


-- ============================================================================
-- 9. ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tools ENABLE ROW LEVEL SECURITY;


-- PROFILES RLS Policies
-- Policy: Users can view all profiles
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Prevent profile deletion (handled by auth.users cascade)
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);


-- CATEGORIES RLS Policies
-- Policy: Anyone can view categories
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert categories
CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update categories
CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete categories
CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- TOOLS RLS Policies
-- Policy: Anyone can view verified or approved tools
CREATE POLICY "tools_select_public" ON tools
  FOR SELECT
  USING (
    is_verified = true
    OR approved_at IS NOT NULL
    OR auth.uid() = submitted_by
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Policy: Authenticated users can insert tools
CREATE POLICY "tools_insert_authenticated" ON tools
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND submitted_by = auth.uid()
  );

-- Policy: Tool submitters can update their own unverified tools
CREATE POLICY "tools_update_own" ON tools
  FOR UPDATE
  USING (
    submitted_by = auth.uid()
    AND is_verified = false
    AND approved_at IS NULL
  );

-- Policy: Admins and moderators can update any tool
CREATE POLICY "tools_update_admin" ON tools
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Policy: Admins and moderators can delete tools
CREATE POLICY "tools_delete_admin" ON tools
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );


-- REVIEWS RLS Policies
-- Policy: Anyone can view approved/verified tool reviews
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tools
      WHERE id = reviews.tool_id
      AND (is_verified = true OR approved_at IS NOT NULL)
    )
  );

-- Policy: Authenticated users can insert reviews
CREATE POLICY "reviews_insert_authenticated" ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Policy: Users can update their own reviews
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE
  USING (user_id = auth.uid());


-- SAVED_TOOLS RLS Policies
-- Policy: Users can only view their own saved tools
CREATE POLICY "saved_tools_select_own" ON saved_tools
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert their own saved tools
CREATE POLICY "saved_tools_insert_own" ON saved_tools
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Policy: Users can delete their own saved tools
CREATE POLICY "saved_tools_delete_own" ON saved_tools
  FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================================
-- 10. GRANTS & PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles, tools, reviews, saved_tools TO authenticated;
GRANT INSERT ON reviews TO authenticated;

-- Grant select to anon (unauthenticated) users for public views
GRANT SELECT ON categories, tools TO anon;


-- ============================================================================
-- 11. COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Free For NonProfits public schema';
