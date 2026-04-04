-- Weekly featured resource table
-- Each row represents one week's featured tool.
-- week_start should be set to the Monday of that week (or any consistent anchor date).
-- The blurb field is the editorial copy used on the dashboard AND pulled for newsletter generation.

CREATE TABLE IF NOT EXISTS weekly_features (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id     UUID        NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  week_start  DATE        NOT NULL,
  blurb       TEXT,                        -- editorial summary / newsletter copy
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(week_start)                       -- one featured resource per week
);

COMMENT ON TABLE weekly_features IS 'One featured tool per week, used on dashboard and newsletter generation';
COMMENT ON COLUMN weekly_features.week_start IS 'The Monday (or anchor date) of the feature week';
COMMENT ON COLUMN weekly_features.blurb IS 'Editorial copy describing why this tool is featured this week';

-- Row-level security
ALTER TABLE weekly_features ENABLE ROW LEVEL SECURITY;

-- Public can read all weekly features
DROP POLICY IF EXISTS "weekly_features_select_all" ON weekly_features;
CREATE POLICY "weekly_features_select_all"
  ON weekly_features FOR SELECT USING (true);

-- Only service role / admin can insert/update/delete (managed via Supabase dashboard or admin API)
DROP POLICY IF EXISTS "weekly_features_admin_insert" ON weekly_features;
CREATE POLICY "weekly_features_admin_insert"
  ON weekly_features FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "weekly_features_admin_update" ON weekly_features;
CREATE POLICY "weekly_features_admin_update"
  ON weekly_features FOR UPDATE USING (false);

DROP POLICY IF EXISTS "weekly_features_admin_delete" ON weekly_features;
CREATE POLICY "weekly_features_admin_delete"
  ON weekly_features FOR DELETE USING (false);

-- Grant read access to authenticated and anon users
GRANT SELECT ON weekly_features TO anon, authenticated;
