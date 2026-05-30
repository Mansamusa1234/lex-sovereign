
import { createClient } from '@supabase/supabase-js'
import type { Agent, AuditEntry } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client – safe for client components
export const supabase = createClient(url, anon)

// Admin client – server-side only (API routes, agents)
export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false },
})

// ── Audit helpers ─────────────────────────────────────────────────────────────

export async function logAudit(params: {
  agentName?: string
  action: string
  entity_type?: string
  entity_id?: string
  details?: Record<string, unknown>
  user_id?: string
}) {
  const { agentName, action, entity_type, entity_id, details, user_id } = params

  let agent_id: string | null = null
  if (agentName) {
    const { data } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('name', agentName)
      .single()
    agent_id = data?.id ?? null

    // Update last_active
    if (agent_id) {
      await supabaseAdmin
        .from('agents')
        .update({ last_active: new Date().toISOString(), status: 'active' })
        .eq('id', agent_id)
    }
  }

  await supabaseAdmin.from('audit_log').insert({
    agent_id,
    action,
    entity_type: entity_type ?? null,
    entity_id: entity_id ?? null,
    details: details ?? {},
    user_id: user_id ?? null,
  })
}

// ── Agent status helper ───────────────────────────────────────────────────────

export async function getAgents(): Promise<Agent[]> {
  const { data } = await supabaseAdmin
    .from('agents')
    .select('*')
    .order('created_at')
  return (data as Agent[]) ?? []
}

export async function getRecentAudit(limit = 20): Promise<AuditEntry[]> {
  const { data } = await supabaseAdmin
    .from('audit_log')
    .select('*, agent:agents(id,name,type,color)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as AuditEntry[]) ?? []
}

// ── Per-agent settings ────────────────────────────────────────────────────────

export async function getAgentSettings(type: string): Promise<{
  language: string
  color: string
  name: string
}> {
  const { data } = await supabaseAdmin
    .from('agents')
    .select('language, color, name')
    .eq('type', type)
    .single()
  return {
    language: data?.language ?? 'en',
    color:    data?.color    ?? 'amber',
    name:     data?.name     ?? type,
  }
}
