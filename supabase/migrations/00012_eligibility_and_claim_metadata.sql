-- Eligibility + claim metadata.
--
-- Applied to the live project on 28 Jul 2026 via the Supabase API before this
-- file existed. Written back here so the repo is not behind the database.
-- Safe to re-run.
--
-- Why: the directory could describe a programme but not say who qualifies for
-- it, so every visitor matched every row and "personalisation" was theatre.

DO $$ BEGIN
  CREATE TYPE org_type AS ENUM (
    'nonprofit_501c3',
    'nonprofit_501c6',
    'religious',
    'school',
    'charity_non_us'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS annual_value_usd    INTEGER,
  ADD COLUMN IF NOT EXISTS steps_count         SMALLINT,
  ADD COLUMN IF NOT EXISTS time_to_claim_days  SMALLINT,
  ADD COLUMN IF NOT EXISTS difficulty          TEXT,
  ADD COLUMN IF NOT EXISTS renewal             TEXT,
  ADD COLUMN IF NOT EXISTS nonprofit_url       TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eligible_org_types  org_type[],
  ADD COLUMN IF NOT EXISTS eligible_countries  TEXT[],
  ADD COLUMN IF NOT EXISTS min_budget_usd      BIGINT,
  ADD COLUMN IF NOT EXISTS max_budget_usd      BIGINT;

-- NULL means "the vendor states no rule", which matches everyone. An unstated
-- rule must never silently exclude an organisation from money it could claim.
COMMENT ON COLUMN tools.eligible_org_types IS
  'Org types the vendor explicitly admits. NULL = no stated restriction (matches all).';
COMMENT ON COLUMN tools.eligible_countries IS
  'ISO-3166-1 alpha-2 codes the vendor explicitly serves. NULL = no stated restriction.';
COMMENT ON COLUMN tools.last_verified_at IS
  'When a human last confirmed these terms against the vendor''s own page.';
