-- ─────────────────────────────────────────────────────────────
-- Wishlist / Preferences schema
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Tool requests: users ask for specific tools
create table if not exists tool_requests (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users(id) on delete set null,
  name         text        not null,
  url          text,
  category_slug text,
  description  text,
  status       text        not null default 'open',  -- open | fulfilled | declined
  vote_count   int         not null default 1,
  created_at   timestamptz not null default now()
);

-- Upvotes on tool requests
create table if not exists tool_request_votes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade not null,
  request_id  uuid        references tool_requests(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, request_id)
);

-- User preferences: category + pricing interests for notifications
create table if not exists user_preferences (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        references auth.users(id) on delete cascade not null unique,
  category_slugs  text[]      not null default '{}',
  pricing_models  text[]      not null default '{}',
  notify_new_tools boolean    not null default true,
  updated_at      timestamptz not null default now()
);

-- ── Indexes ────────────────────────────────────────────────────
create index if not exists tool_requests_vote_count_idx on tool_requests(vote_count desc);
create index if not exists tool_requests_status_idx on tool_requests(status);
create index if not exists tool_request_votes_request_id_idx on tool_request_votes(request_id);
create index if not exists tool_request_votes_user_id_idx on tool_request_votes(user_id);

-- ── Row Level Security ─────────────────────────────────────────
alter table tool_requests        enable row level security;
alter table tool_request_votes   enable row level security;
alter table user_preferences     enable row level security;

-- tool_requests: public read, auth insert, own update
create policy "Anyone can view tool requests"
  on tool_requests for select using (true);

create policy "Auth users can submit requests"
  on tool_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own requests"
  on tool_requests for update
  using (auth.uid() = user_id);

-- tool_request_votes: public read, auth insert/delete own
create policy "Anyone can view votes"
  on tool_request_votes for select using (true);

create policy "Auth users can upvote"
  on tool_request_votes for insert
  with check (auth.uid() = user_id);

create policy "Auth users can remove their vote"
  on tool_request_votes for delete
  using (auth.uid() = user_id);

-- user_preferences: private to owner
create policy "Users can read own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can create own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);
