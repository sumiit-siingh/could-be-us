-- Run this once in Supabase → SQL Editor (free tier works)

create table if not exists public.seen_sessions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed boolean not null default false,
  dodge_count integer not null default 0,
  answers jsonb not null default '[]'::jsonb
);

alter table public.seen_sessions enable row level security;

-- API uses the service role key (bypasses RLS). No public policies needed.
