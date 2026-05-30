import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { openai } from '@/lib/openai'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()
  const checks: Record<string, unknown> = {}

  // Check Supabase
  let supabaseOk = false
  let agentCount = 0
  try {
    const { count } = await supabaseAdmin.from('agents').select('*', { count: 'exact', head: true })
    supabaseOk = true
    agentCount = count ?? 0
  } catch (e) {
    checks.supabase_error = (e as Error).message
  }

  // Check OpenAI key validity with a tiny test call
  let openaiOk = false
  let openaiError = ''
  const keyPresent = !!process.env.OPENAI_API_KEY
  if (keyPresent) {
    try {
      await openai.models.list()
      openaiOk = true
    } catch (e) {
      const msg = (e as Error).message ?? ''
      if (msg.includes('401') || msg.includes('invalid_api_key')) {
        openaiError = 'Invalid API key — check OPENAI_API_KEY in Vercel env vars'
      } else if (msg.includes('429') || msg.includes('quota') || msg.includes('billing')) {
        openaiError = 'No billing credit — add $5+ at platform.openai.com/billing'
      } else {
        openaiError = msg.slice(0, 100)
      }
    }
  } else {
    openaiError = 'OPENAI_API_KEY not set in Vercel environment variables'
  }

  checks.supabase       = supabaseOk
  checks.agents         = agentCount
  checks.openai_key     = keyPresent
  checks.openai_working = openaiOk
  checks.openai_error   = openaiError || null
  checks.gmail          = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN)
  checks.version        = '2.0.0'

  const status = supabaseOk && openaiOk ? 'healthy' : openaiOk ? 'partial' : 'degraded'

  return NextResponse.json(
    { status, latency_ms: Date.now() - start, timestamp: new Date().toISOString(), ...checks },
    { status: status === 'healthy' ? 200 : 207 }
  )
}
