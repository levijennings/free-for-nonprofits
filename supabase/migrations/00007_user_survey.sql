-- Growth Engine — Phase 2
-- Optional targeting survey. (Already applied to the live project on 2026-06-23.)

create table if not exists public.user_survey (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mission_area text,
  team_size text,
  need_areas text[] not null default '{}',
  current_tools text,
  pain_points text,
  role text,
  budget text,
  updated_at timestamptz not null default now()
);

alter table public.user_survey enable row level security;

create policy survey_select_own on public.user_survey
  for select using (auth.uid() = user_id);
create policy survey_insert_own on public.user_survey
  for insert with check (auth.uid() = user_id);
create policy survey_update_own on public.user_survey
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
