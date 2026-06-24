-- Growth Engine — Phase 3
-- Monthly insights rollup, used by the admin tab and the monthly email report.
-- (Already applied to the live project on 2026-06-23.)

create or replace function public.monthly_report_stats()
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
as $$
with b as (
  select date_trunc('month', now()) as m0,
         date_trunc('month', now() - interval '1 month') as m1,
         now() - interval '30 days' as d30
),
items as (
  select
    count(*) filter (where coalesce(approved_at, created_at) >= (select m0 from b)) as this_month,
    count(*) filter (where coalesce(approved_at, created_at) >= (select m1 from b)
                       and coalesce(approved_at, created_at) <  (select m0 from b)) as prev_month
  from tools where is_verified = true
),
users_new as (
  select
    count(*) filter (where created_at >= (select m0 from b)) as this_month,
    count(*) filter (where created_at >= (select m1 from b) and created_at < (select m0 from b)) as prev_month
  from profiles
  where email not ilike '%@example-nonprofit.org'
),
active as (
  select count(distinct uid) as cnt from (
    select user_id as uid from saved_tools    where created_at >= (select d30 from b)
    union select user_id     from tool_favorites where created_at >= (select d30 from b)
    union select user_id     from tool_usages    where created_at >= (select d30 from b)
    union select user_id     from reviews        where created_at >= (select d30 from b)
    union select id          from auth.users     where last_sign_in_at >= (select d30 from b)
  ) s
  where uid is not null
),
totals as (
  select
    (select count(*) from profiles where email not ilike '%@example-nonprofit.org') as users,
    (select count(*) from tools where is_verified = true) as tools,
    (select count(*) from tool_submissions where status = 'pending') as pending_subs,
    (select count(*) from tool_requests where status = 'open') as open_requests
),
top_tools as (
  select coalesce(jsonb_agg(t), '[]'::jsonb) as data from (
    select name, slug, save_count, using_count, favorite_count
    from tools where is_verified = true
    order by save_count desc nulls last, using_count desc nulls last
    limit 5
  ) t
),
top_cats as (
  select coalesce(jsonb_agg(c), '[]'::jsonb) as data from (
    select cat.name, count(t.id) as tool_count
    from categories cat
    left join tools t on t.category_id = cat.id and t.is_verified = true
    group by cat.id, cat.name
    order by count(t.id) desc
    limit 5
  ) c
)
select jsonb_build_object(
  'generated_at',     now(),
  'month_label',      to_char(now(), 'FMMonth YYYY'),
  'items_added',      (select to_jsonb(items)     from items),
  'new_users',        (select to_jsonb(users_new) from users_new),
  'active_users_30d', (select cnt  from active),
  'totals',           (select to_jsonb(totals)    from totals),
  'top_tools',        (select data from top_tools),
  'top_categories',   (select data from top_cats)
);
$$;
revoke execute on function public.monthly_report_stats() from public, anon, authenticated;
