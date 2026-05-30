-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003 — Row Level Security
-- Enables RLS on all tables. The service_role key (used by all server routes)
-- bypasses RLS automatically. The anon key (browser client) can only read.
-- Run AFTER 001 and 002.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on every table
alter table agents     enable row level security;
alter table memory     enable row level security;
alter table documents  enable row level security;
alter table emails     enable row level security;
alter table drafts     enable row level security;
alter table approvals  enable row level security;
alter table knowledge  enable row level security;
alter table audit_log  enable row level security;

-- ── Anon read policies (browser client / dashboard stats) ─────────────────────
-- The browser client uses the anon key and may only read.
-- All writes go through server-side API routes (service_role key = RLS bypass).

create policy "anon_read_agents"    on agents    for select to anon using (true);
create policy "anon_read_knowledge" on knowledge for select to anon using (true);
create policy "anon_read_documents" on documents for select to anon using (true);
create policy "anon_read_emails"    on emails    for select to anon using (true);
create policy "anon_read_drafts"    on drafts    for select to anon using (true);
create policy "anon_read_approvals" on approvals for select to anon using (true);
create policy "anon_read_audit"     on audit_log for select to anon using (true);
create policy "anon_read_memory"    on memory    for select to anon using (true);

-- NOTE: To add user-level auth in the future, replace the `using (true)`
-- clauses with `using (auth.uid() = user_id)` after adding user_id columns.
