-- ─────────────────────────────────────────────────────────────────────────────
-- Lex Sovereign AI Brain  –  initial schema
-- Run this in Supabase SQL Editor or via `supabase db push`
-- ─────────────────────────────────────────────────────────────────────────────

-- pgvector extension (one-time, requires Supabase pgvector add-on)
create extension if not exists vector;

-- ── Agents ───────────────────────────────────────────────────────────────────
create table if not exists agents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('orchestrator','legal_research','email_drafting','custom')),
  description text,
  status      text not null default 'active' check (status in ('active','idle','error','disabled')),
  last_active timestamptz,
  created_at  timestamptz not null default now()
);

-- ── Shared Memory ─────────────────────────────────────────────────────────────
create table if not exists memory (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid references agents(id) on delete set null,
  content    text not null,
  embedding  vector(1536),
  category   text check (category in ('statute','case_law','template','email','outcome','strategy','definition','other')),
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memory_embedding_idx
  on memory using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ── Documents ─────────────────────────────────────────────────────────────────
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  file_type   text not null check (file_type in ('pdf','docx','txt')),
  content     text,
  embedding   vector(1536),
  metadata    jsonb not null default '{}',
  uploaded_at timestamptz not null default now()
);

create index if not exists documents_embedding_idx
  on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ── Emails ───────────────────────────────────────────────────────────────────
create table if not exists emails (
  id          uuid primary key default gen_random_uuid(),
  gmail_id    text unique,
  thread_id   text,
  subject     text not null default '(no subject)',
  sender      text not null,
  recipient   text,
  body        text not null default '',
  received_at timestamptz,
  category    text check (category in ('legal','debt_collector','government','court','general')),
  is_critical boolean not null default false,
  processed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Drafts ───────────────────────────────────────────────────────────────────
create table if not exists drafts (
  id           uuid primary key default gen_random_uuid(),
  email_id     uuid references emails(id) on delete cascade,
  subject      text not null,
  body         text not null,
  generated_by text not null,
  risk_score   integer not null default 0 check (risk_score between 0 and 100),
  risk_flags   jsonb not null default '[]',
  status       text not null default 'pending' check (status in ('pending','approved','rejected','sent')),
  human_edit   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Approvals ────────────────────────────────────────────────────────────────
create table if not exists approvals (
  id          uuid primary key default gen_random_uuid(),
  draft_id    uuid not null references drafts(id) on delete cascade,
  urgency     text not null default 'normal' check (urgency in ('low','normal','high','critical')),
  reason      text not null,
  reviewed_by text,
  reviewed_at timestamptz,
  decision    text check (decision in ('approved','rejected')),
  notes       text,
  created_at  timestamptz not null default now()
);

-- ── Knowledge Base ────────────────────────────────────────────────────────────
create table if not exists knowledge (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null,
  category   text not null check (category in ('statute','case_law','definition','template','strategy','outcome')),
  source     text,
  embedding  vector(1536),
  tags       text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_embedding_idx
  on knowledge using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ── Audit Log ─────────────────────────────────────────────────────────────────
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid references agents(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  details     jsonb not null default '{}',
  user_id     text,
  created_at  timestamptz not null default now()
);

-- ── pgvector similarity search helpers ───────────────────────────────────────
create or replace function search_knowledge(
  query_embedding vector(1536),
  match_count     int default 5,
  filter_category text default null
)
returns table (
  id         uuid,
  title      text,
  content    text,
  category   text,
  source     text,
  tags       text[],
  similarity float
)
language sql stable as $$
  select
    id, title, content, category, source, tags,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge
  where
    embedding is not null
    and (filter_category is null or category = filter_category)
  order by embedding <=> query_embedding
  limit match_count;
$$;

create or replace function search_memory(
  query_embedding vector(1536),
  match_count     int default 5,
  filter_category text default null
)
returns table (
  id         uuid,
  content    text,
  category   text,
  metadata   jsonb,
  similarity float
)
language sql stable as $$
  select
    id, content, category, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from memory
  where
    embedding is not null
    and (filter_category is null or category = filter_category)
  order by embedding <=> query_embedding
  limit match_count;
$$;

create or replace function search_documents(
  query_embedding vector(1536),
  match_count     int default 5
)
returns table (
  id         uuid,
  filename   text,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql stable as $$
  select
    id, filename, content, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ── Seed agent registry ───────────────────────────────────────────────────────
insert into agents (name, type, description) values
  ('Supreme Orchestrator',   'orchestrator',    'Coordinates all agents, routes requests, assembles final responses'),
  ('Legal Research Agent',   'legal_research',  'Searches statutes, case law, and knowledge base; flags unsupported claims'),
  ('Email Drafting Agent',   'email_drafting',  'Reads Gmail, classifies emails, creates drafts requiring human approval')
on conflict do nothing;
