import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)

  let query = supabaseAdmin
    .from('approvals')
    .select(`
      *,
      draft:drafts (
        *,
        email:emails (*)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Fix: use .is() for null checks, .eq() for string values
  if (status === 'pending') {
    query = query.is('decision', null)
  } else {
    query = query.eq('decision', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ approvals: data ?? [] })
}
