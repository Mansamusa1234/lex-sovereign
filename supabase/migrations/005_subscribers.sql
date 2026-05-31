-- Migration 005 — Email subscribers for marketing
-- Run in Supabase SQL Editor AFTER 001–004

create table if not exists subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  name            text,
  source          text default 'landing_page',
  tags            text[] not null default '{}',
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  confirmed       boolean not null default false,
  ip_country      text
);

alter table subscribers enable row level security;
-- Only service role can read/write subscribers (server-side only)
