-- The admin users list previously called supabase-js's
-- `admin.auth.admin.listUsers({ page: 1, perPage: 1000 })`, which goes
-- through the separate GoTrue Admin HTTP API rather than a normal
-- PostgREST query. In production that call was silently returning only a
-- handful of users (4) despite auth.users having 104+ rows — no error
-- surfaced, it just came back short.
--
-- This RPC does the same auth.users + profiles join entirely in Postgres
-- via the same reliable PostgREST path already used everywhere else in
-- the admin panel (e.g. the "Total users" count), sidestepping whatever
-- was wrong with the Admin API call.
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  auth_created_at timestamptz,
  email_confirmed boolean,
  last_sign_in_at timestamptz,
  display_name text,
  org_name text,
  org_size text
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    u.id,
    u.email,
    u.created_at as auth_created_at,
    (u.email_confirmed_at is not null) as email_confirmed,
    u.last_sign_in_at,
    p.display_name,
    p.org_name,
    p.org_size
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by u.created_at desc;
$$;

-- Only callable via the service-role admin client (same access model as
-- the existing monthly_report_stats() RPC) — never exposed to normal users.
revoke execute on function public.admin_list_users() from public, anon, authenticated;
