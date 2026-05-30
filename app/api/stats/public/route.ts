import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // cache 5 minutes

export async function GET() {
  const [kbRes, docRes, auditRes, agentRes] = await Promise.all([
    supabaseAdmin.from('knowledge').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('documents').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('audit_log').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  // Get today's insight
  const { data: insightRow } = await supabaseAdmin
    .from('audit_log')
    .select('details')
    .eq('action', 'daily_insight')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const today = new Date()
  const launchDate = new Date('2025-05-30')
  const daysRunning = Math.floor((today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24))

  return NextResponse.json({
    knowledge_entries: kbRes.count ?? 0,
    documents: docRes.count ?? 0,
    ai_actions: auditRes.count ?? 0,
    active_agents: agentRes.count ?? 3,
    days_running: Math.max(1, daysRunning),
    languages_supported: 26,
    today_insight: insightRow?.details ?? null,
    last_updated: new Date().toISOString(),
  })
}
