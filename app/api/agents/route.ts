import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { AGENT_LANGUAGES, AGENT_COLORS } from '@/lib/types'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agents: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, language, color } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  if (language && !AGENT_LANGUAGES[language]) {
    return NextResponse.json({ error: `Unknown language: ${language}` }, { status: 400 })
  }
  if (color && !AGENT_COLORS[color]) {
    return NextResponse.json({ error: `Unknown color: ${color}` }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (language) updates.language = language
  if (color)    updates.color = color

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Provide language and/or color to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('agents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({
    action: 'agent_settings_updated',
    entity_type: 'agent',
    entity_id: id,
    details: updates,
  })

  return NextResponse.json({ agent: data })
}
