-- Signup bot protection
-- Backs IP-based rate limiting for POST /api/auth/signup.
-- (Client-side honeypot + timing checks live in application code; this table
-- is the server-side counter that survives across serverless invocations.)

create table if not exists public.signup_attempts (
  id         uuid        primary key default gen_random_uuid(),
  ip_address text        not null,
  created_at timestamptz not null default now()
);

create index if not exists signup_attempts_ip_created_idx
  on public.signup_attempts (ip_address, created_at desc);

alter table public.signup_attempts enable row level security;
-- No public policies: only the service role (used by /api/auth/signup) reads/writes this table.
