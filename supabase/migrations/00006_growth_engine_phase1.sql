-- Growth Engine — Phase 1
-- Audit log of automated agent runs + recipient helper for the weekly digest.
-- (Already applied to the live project on 2026-06-23.)

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('weekly_digest','monthly_report','research')),
  status text not null default 'started' check (status in ('started','success','error')),
  summary jsonb,
  detail text,
  created_at timestamptz not null default now()
);
alter table public.agent_runs enable row level security;
-- No public policies: only the service role reads/writes this table.

-- Recipients for the weekly digest: opted-in, email-confirmed, non-banned users
-- with their category preferences. Test/example domains are never emailed.
create or replace function public.digest_recipients()
returns table (
  user_id uuid,
  email text,
  display_name text,
  org_name text,
  category_slugs text[],
  pricing_models text[]
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select p.id, p.email, p.display_name, p.org_name,
         coalesce(up.category_slugs, '{}'::text[]),
         coalesce(up.pricing_models, '{}'::text[])
  from public.profiles p
  left join public.user_preferences up on up.user_id = p.id
  join auth.users u on u.id = p.id
  where coalesce(up.notify_new_tools, true) = true
    and u.email_confirmed_at is not null
    and (u.banned_until is null or u.banned_until < now())
    and p.email not ilike '%@example-nonprofit.org'
    and p.email not ilike '%@example.com'
    and p.email not ilike '%@example.org'
    and p.email not ilike '%@example.net';
$$;
revoke execute on function public.digest_recipients() from public, anon, authenticated;
