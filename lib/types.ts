export type AgentType = 'orchestrator' | 'legal_research' | 'email_drafting' | 'custom'
export type AgentStatus = 'active' | 'idle' | 'error' | 'disabled'
export type EmailCategory = 'legal' | 'debt_collector' | 'government' | 'court' | 'general'
export type DraftStatus = 'pending' | 'approved' | 'rejected' | 'sent'
export type Urgency = 'low' | 'normal' | 'high' | 'critical'
export type KnowledgeCategory = 'statute' | 'case_law' | 'definition' | 'template' | 'strategy' | 'outcome'
export type MemoryCategory = 'statute' | 'case_law' | 'template' | 'email' | 'outcome' | 'strategy' | 'definition' | 'other'
export type RiskFlagType = 'unsupported_claim' | 'unverified_citation' | 'legal_demand' | 'statute_reference' | 'threat' | 'pii'
export type RiskSeverity = 'low' | 'medium' | 'high'

export interface Agent {
  id: string
  name: string
  type: AgentType
  description: string | null
  status: AgentStatus
  language: string
  color: string
  last_active: string | null
  created_at: string
}

export const AGENT_LANGUAGES: Record<string, string> = {
  en:    'English',
  es:    'Spanish',
  fr:    'French',
  de:    'German',
  pt:    'Portuguese',
  it:    'Italian',
  nl:    'Dutch',
  pl:    'Polish',
  ru:    'Russian',
  zh:    'Mandarin Chinese',
  ja:    'Japanese',
  ko:    'Korean',
  ar:    'Arabic',
  hi:    'Hindi',
  tr:    'Turkish',
  sv:    'Swedish',
  no:    'Norwegian',
  da:    'Danish',
  fi:    'Finnish',
  he:    'Hebrew',
  ro:    'Romanian',
  uk:    'Ukrainian',
  id:    'Indonesian',
  ms:    'Malay',
  th:    'Thai',
  vi:    'Vietnamese',
}

export const AGENT_COLORS: Record<string, {
  label: string
  dot: string
  badge: string
  ring: string
  glow: string
}> = {
  amber:   { label: 'Amber',   dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',   ring: 'ring-amber-500',   glow: 'shadow-amber-500/20' },
  orange:  { label: 'Orange',  dot: 'bg-orange-400',  badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', ring: 'ring-orange-500',  glow: 'shadow-orange-500/20' },
  blue:    { label: 'Blue',    dot: 'bg-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       ring: 'ring-blue-500',    glow: 'shadow-blue-500/20' },
  emerald: { label: 'Emerald', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', ring: 'ring-emerald-500', glow: 'shadow-emerald-500/20' },
  purple:  { label: 'Purple',  dot: 'bg-purple-400',  badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30', ring: 'ring-purple-500',  glow: 'shadow-purple-500/20' },
  pink:    { label: 'Pink',    dot: 'bg-pink-400',    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/30',       ring: 'ring-pink-500',    glow: 'shadow-pink-500/20' },
  cyan:    { label: 'Cyan',    dot: 'bg-cyan-400',    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',       ring: 'ring-cyan-500',    glow: 'shadow-cyan-500/20' },
  red:     { label: 'Red',     dot: 'bg-red-400',     badge: 'bg-red-500/10 text-red-400 border-red-500/30',         ring: 'ring-red-500',     glow: 'shadow-red-500/20' },
  teal:    { label: 'Teal',    dot: 'bg-teal-400',    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/30',       ring: 'ring-teal-500',    glow: 'shadow-teal-500/20' },
  indigo:  { label: 'Indigo',  dot: 'bg-indigo-400',  badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', ring: 'ring-indigo-500',  glow: 'shadow-indigo-500/20' },
  rose:    { label: 'Rose',    dot: 'bg-rose-400',    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',       ring: 'ring-rose-500',    glow: 'shadow-rose-500/20' },
  lime:    { label: 'Lime',    dot: 'bg-lime-400',    badge: 'bg-lime-500/10 text-lime-400 border-lime-500/30',       ring: 'ring-lime-500',    glow: 'shadow-lime-500/20' },
}

export interface Memory {
  id: string
  agent_id: string | null
  content: string
  category: MemoryCategory | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  filename: string
  file_type: 'pdf' | 'docx' | 'txt'
  content: string | null
  metadata: Record<string, unknown>
  uploaded_at: string
}

export interface Email {
  id: string
  gmail_id: string | null
  thread_id: string | null
  subject: string
  sender: string
  recipient: string | null
  body: string
  received_at: string | null
  category: EmailCategory | null
  is_critical: boolean
  processed: boolean
  created_at: string
}

export interface RiskFlag {
  type: RiskFlagType
  severity: RiskSeverity
  text: string
  reason: string
}

export interface Draft {
  id: string
  email_id: string | null
  subject: string
  body: string
  generated_by: string
  risk_score: number
  risk_flags: RiskFlag[]
  status: DraftStatus
  human_edit: string | null
  created_at: string
  updated_at: string
  email?: Email
}

export interface Approval {
  id: string
  draft_id: string
  urgency: Urgency
  reason: string
  reviewed_by: string | null
  reviewed_at: string | null
  decision: 'approved' | 'rejected' | null
  notes: string | null
  created_at: string
  draft?: Draft
}

export interface Knowledge {
  id: string
  title: string
  content: string
  category: KnowledgeCategory
  source: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface AuditEntry {
  id: string
  agent_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown>
  user_id: string | null
  created_at: string
  agent?: Agent
}

export interface KnowledgeSearchResult {
  id: string
  title: string
  content: string
  category: string
  source: string | null
  tags: string[]
  similarity: number
}

export interface OrchestrationRequest {
  query: string
  email_id?: string
  document_id?: string
  context?: string
}

export interface OrchestrationResult {
  response: string
  agents_used: string[]
  memory_added: number
  drafts_created: number
  risk_flags: RiskFlag[]
  requires_approval: boolean
  approval_id?: string
}
