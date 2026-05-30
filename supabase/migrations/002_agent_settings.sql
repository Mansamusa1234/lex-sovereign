-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002 — per-agent language and color settings
-- Run in Supabase SQL Editor AFTER 001_initial.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table agents
  add column if not exists language text not null default 'en',
  add column if not exists color    text not null default 'amber';

-- Apply sensible default colors per agent type
update agents set color = 'orange' where type = 'orchestrator';
update agents set color = 'blue'   where type = 'legal_research';
update agents set color = 'amber'  where type = 'email_drafting';
