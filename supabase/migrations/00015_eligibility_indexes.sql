-- Indexes for the eligibility columns added in 00012.
--
-- Applied to the live project on 28 Jul 2026; written back here afterwards.
-- Safe to re-run.
--
-- 00012 added eleven columns and zero indexes. Three of them carry query load:
--
--   eligible_org_types (org_type[]) and eligible_countries (text[]) are the two
--   filters the eligibility questionnaire runs on. Today src/lib/eligibility.ts
--   evaluates them in JavaScript after pulling the whole catalogue, which is
--   only survivable at ~100 rows. GIN is the index type that serves the array
--   containment and overlap operators (@>, &&, <@) those filters become the
--   moment the predicate is pushed into Postgres, so adding it now means the
--   push-down is a query change and not a migration under load.
--
--   annual_value_usd already backs a live ORDER BY ... DESC NULLS LAST on the
--   eligibility results page and feeds the scorecard total. A btree index
--   supports both the ordering and range/threshold lookups over it.
--
-- All three are IF NOT EXISTS so this is idempotent and re-runnable, and none
-- of them changes row data or nullability — NULL still means "the vendor states
-- no rule", which matches everyone.

CREATE INDEX IF NOT EXISTS tools_eligible_org_types_gin
  ON public.tools USING GIN (eligible_org_types);

CREATE INDEX IF NOT EXISTS tools_eligible_countries_gin
  ON public.tools USING GIN (eligible_countries);

CREATE INDEX IF NOT EXISTS tools_annual_value_usd_idx
  ON public.tools (annual_value_usd);
