import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const [pendingRes, kbRes, docRes, agentRes] = await Promise.all([
    supabaseAdmin.from('approvals').select('*', { count: 'exact', head: true }).is('decision', null),
    supabaseAdmin.from('knowledge').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('documents').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  return NextResponse.json({
    pending_approvals: pendingRes.count ?? 0,
    knowledge_entries: kbRes.count ?? 0,
    documents: docRes.count ?? 0,
    active_agents: agentRes.count ?? 0,
  })
}
