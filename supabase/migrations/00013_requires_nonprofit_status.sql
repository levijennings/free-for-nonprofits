-- The distinction the schema was missing.
--
-- Applied to the live project on 28 Jul 2026; written back here afterwards.
-- Safe to re-run.
--
-- A directory row is one of two very different things:
--
--   (a) a programme gated behind nonprofit verification — you apply, you can
--       be refused, and it is genuinely "something you qualify for";
--   (b) a product free or cheap to everyone — GIMP, WordPress, Grants.gov —
--       where nonprofit status is irrelevant and there is nothing to apply for.
--
-- Without this column the eligibility snapshot returned the whole catalogue to
-- every visitor, and the personalisation was meaningless.

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS requires_nonprofit_status BOOLEAN;

COMMENT ON COLUMN tools.requires_nonprofit_status IS
  'TRUE = benefit is contingent on verified nonprofit status (an application exists and can be refused). FALSE = available to anyone; nonprofit status is irrelevant. NULL = not yet classified.';

CREATE INDEX IF NOT EXISTS idx_tools_requires_nonprofit
  ON tools (is_verified, requires_nonprofit_status);
