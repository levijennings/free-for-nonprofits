-- Claim state tracking.
--
-- Applied to the live project on 28 Jul 2026; written back here afterwards.
-- Safe to re-run.
--
-- This is the 2.0's answer to the audit's core diagnosis: nothing behind the
-- account wall was worth more than what sat free in front of it. Saving and
-- favouriting are bookkeeping. Claim progress is not — it holds a user's place
-- in EXTERNAL processes that take weeks (TechSoup validation, Google approval),
-- which is a real reason to have an account.

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM (
    'not_started',
    'gathering_docs',
    'applied',
    'approved'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.tool_claims (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id     UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  status      claim_status NOT NULL DEFAULT 'not_started',
  note        TEXT,
  applied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tool_claims_user_id_tool_id_key UNIQUE (user_id, tool_id),
  CONSTRAINT tool_claims_note_length CHECK (note IS NULL OR char_length(note) <= 1000)
);

-- Leading column of the unique index serves "this user + this tool"; the
-- composite below serves the dashboard's "my claims, most recent first".
CREATE INDEX IF NOT EXISTS idx_tool_claims_user_updated
  ON public.tool_claims (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_claims_tool_id
  ON public.tool_claims (tool_id);

DROP TRIGGER IF EXISTS set_tool_claims_updated_at ON public.tool_claims;
CREATE TRIGGER set_tool_claims_updated_at
  BEFORE UPDATE ON public.tool_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.tool_claims ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.tool_claims FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_claims TO authenticated;

-- A user may only ever see or touch their own rows.
DROP POLICY IF EXISTS tool_claims_select_own ON public.tool_claims;
CREATE POLICY tool_claims_select_own ON public.tool_claims
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS tool_claims_insert_own ON public.tool_claims;
CREATE POLICY tool_claims_insert_own ON public.tool_claims
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS tool_claims_update_own ON public.tool_claims;
CREATE POLICY tool_claims_update_own ON public.tool_claims
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS tool_claims_delete_own ON public.tool_claims;
CREATE POLICY tool_claims_delete_own ON public.tool_claims
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
