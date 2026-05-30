-- Migration 004 — Stripe subscriptions
-- Run in Supabase SQL Editor AFTER 001, 002, 003

create table if not exists subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  stripe_subscription_id  text unique not null,
  stripe_customer_id      text not null,
  plan                    text not null default 'free',
  status                  text not null default 'active',
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table subscriptions enable row level security;
create policy "anon_read_subscriptions" on subscriptions for select to anon using (true);

-- Add to audit log: subscription events tracked automatically via webhook
