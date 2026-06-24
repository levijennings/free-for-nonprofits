-- Growth Engine — wishlist responses
-- Lets the team/agent post a public response to a community wishlist request.
-- (Already applied to the live project on 2026-06-24.)

alter table public.tool_requests
  add column if not exists admin_response text,
  add column if not exists responded_at timestamptz;
