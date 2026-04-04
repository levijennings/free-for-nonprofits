-- Affiliate tracking migration
-- Adds affiliate_url to tools and a click tracking table

-- Add affiliate_url column to tools
ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS affiliate_url TEXT;

-- Click tracking table
CREATE TABLE IF NOT EXISTS tool_clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id     UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  click_type  TEXT NOT NULL CHECK (click_type IN ('affiliate', 'website')),
  referrer    TEXT,
  user_agent  TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS tool_clicks_tool_id_idx ON tool_clicks(tool_id);
CREATE INDEX IF NOT EXISTS tool_clicks_created_at_idx ON tool_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS tool_clicks_type_idx ON tool_clicks(click_type);

-- RLS on tool_clicks
ALTER TABLE tool_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a click (anonymous tracking)
CREATE POLICY "clicks_insert_public" ON tool_clicks
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read click data
CREATE POLICY "clicks_select_admin" ON tool_clicks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );
