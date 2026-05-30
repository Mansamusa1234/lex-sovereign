import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  const checks: Record<string, unknown> = {
    version: '1.0.0',
    openai:  !!process.env.OPENAI_API_KEY,
    gmail:   !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN),
  }

  let supabaseOk = false
  let agentCount = 0
  try {
    const { count } = await supabaseAdmin
      .from('agents')
      .select('*', { count: 'exact', head: true })
    supabaseOk = true
    agentCount = count ?? 0
  } catch {}

  checks.supabase = supabaseOk
  checks.agents   = agentCount

  const status = supabaseOk && checks.openai ? 'healthy' : 'degraded'

  return NextResponse.json(
    {
      status,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
      ...checks,
    },
    { status: status === 'healthy' ? 200 : 207 }
  )
}
