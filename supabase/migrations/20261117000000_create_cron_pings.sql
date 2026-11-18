-- Append-only log of cron keep-alive pings.
-- Each /api/cron/health-check invocation inserts a row, so the ping is a real
-- database write (Supabase pauses free projects based on user activity) and
-- every run leaves a durable record — Vercel keeps no cron run history on Hobby.

create table if not exists cron_pings (
  id uuid default gen_random_uuid() primary key,
  source text not null default 'vercel-cron',
  created_at timestamptz not null default now()
);

create index if not exists cron_pings_created_at_idx
  on cron_pings (created_at desc);

-- Enable Row Level Security (RLS)
alter table cron_pings enable row level security;
