-- ================================================================
-- 00004: Tool social interactions (favorites, using, submissions)
-- ================================================================

-- 1. Count columns on tools
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS save_count     INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorite_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS using_count    INT NOT NULL DEFAULT 0;

-- Backfill save_count from existing saved_tools
UPDATE tools t
SET save_count = (SELECT COUNT(*) FROM saved_tools s WHERE s.tool_id = t.id);

-- ----------------------------------------------------------------
-- 2. Favorites
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_favorites (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id    UUID        NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);
ALTER TABLE tool_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fav_select" ON tool_favorites;
DROP POLICY IF EXISTS "fav_insert" ON tool_favorites;
DROP POLICY IF EXISTS "fav_delete" ON tool_favorites;
CREATE POLICY "fav_select" ON tool_favorites FOR SELECT USING (true);
CREATE POLICY "fav_insert" ON tool_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fav_delete" ON tool_favorites FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 3. "I use this"
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_usages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id    UUID        NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);
ALTER TABLE tool_usages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usage_select" ON tool_usages;
DROP POLICY IF EXISTS "usage_insert" ON tool_usages;
DROP POLICY IF EXISTS "usage_delete" ON tool_usages;
CREATE POLICY "usage_select" ON tool_usages FOR SELECT USING (true);
CREATE POLICY "usage_insert" ON tool_usages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_delete" ON tool_usages FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 4. Tool submissions (community-submitted tools pending review)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_submissions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  name           TEXT        NOT NULL,
  website_url    TEXT        NOT NULL,
  category_slug  TEXT,
  pricing_model  TEXT        CHECK (pricing_model IN ('free', 'freemium', 'nonprofit_discount')),
  description    TEXT        NOT NULL,
  nonprofit_deal TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sub_insert" ON tool_submissions;
DROP POLICY IF EXISTS "sub_select_own" ON tool_submissions;
-- Anyone (even anon) can submit; logged-in users can see their own
CREATE POLICY "sub_insert"     ON tool_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "sub_select_own" ON tool_submissions FOR SELECT USING (auth.uid() = submitted_by OR submitted_by IS NULL);

-- ----------------------------------------------------------------
-- 5. Triggers — keep count columns in sync automatically
-- ----------------------------------------------------------------

-- save_count ← saved_tools
CREATE OR REPLACE FUNCTION _sync_save_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE tid UUID;
BEGIN
  tid := COALESCE(NEW.tool_id, OLD.tool_id);
  UPDATE tools SET save_count = (SELECT COUNT(*) FROM saved_tools WHERE tool_id = tid) WHERE id = tid;
  RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_save_count ON saved_tools;
CREATE TRIGGER trg_save_count
  AFTER INSERT OR DELETE ON saved_tools
  FOR EACH ROW EXECUTE FUNCTION _sync_save_count();

-- favorite_count ← tool_favorites
CREATE OR REPLACE FUNCTION _sync_favorite_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE tid UUID;
BEGIN
  tid := COALESCE(NEW.tool_id, OLD.tool_id);
  UPDATE tools SET favorite_count = (SELECT COUNT(*) FROM tool_favorites WHERE tool_id = tid) WHERE id = tid;
  RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_favorite_count ON tool_favorites;
CREATE TRIGGER trg_favorite_count
  AFTER INSERT OR DELETE ON tool_favorites
  FOR EACH ROW EXECUTE FUNCTION _sync_favorite_count();

-- using_count ← tool_usages
CREATE OR REPLACE FUNCTION _sync_using_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE tid UUID;
BEGIN
  tid := COALESCE(NEW.tool_id, OLD.tool_id);
  UPDATE tools SET using_count = (SELECT COUNT(*) FROM tool_usages WHERE tool_id = tid) WHERE id = tid;
  RETURN COALESCE(NEW, OLD);
END; $$;
DROP TRIGGER IF EXISTS trg_using_count ON tool_usages;
CREATE TRIGGER trg_using_count
  AFTER INSERT OR DELETE ON tool_usages
  FOR EACH ROW EXECUTE FUNCTION _sync_using_count();
