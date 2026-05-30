import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { embed } from '@/lib/openai'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)

  let query = supabaseAdmin
    .from('knowledge')
    .select('id, title, content, category, source, tags, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ knowledge: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, content, category, source, tags } = body

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: 'title, content, and category are required' }, { status: 400 })
  }

  const embedding = await embed(`${title}\n${content}`)

  const { data, error } = await supabaseAdmin
    .from('knowledge')
    .insert({
      title: title.trim(),
      content: content.trim(),
      category,
      source: source?.trim() ?? null,
      embedding,
      tags: tags ?? [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({
    action: 'knowledge_added',
    entity_type: 'knowledge',
    entity_id: data.id,
    details: { title, category },
  })

  return NextResponse.json({ entry: data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('knowledge').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit({ action: 'knowledge_deleted', entity_type: 'knowledge', entity_id: id })
  return NextResponse.json({ success: true })
}
