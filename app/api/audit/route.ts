import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500)
  const agentType = searchParams.get('agent')

  let query = supabaseAdmin
    .from('audit_log')
    .select('*, agent:agents(id, name, type, color)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (agentType) {
    const { data: agents } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('type', agentType)
    const ids = (agents ?? []).map((a: any) => a.id)
    if (ids.length > 0) query = query.in('agent_id', ids)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data ?? [] })
}
