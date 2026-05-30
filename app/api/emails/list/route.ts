import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { listRecentEmails } from '@/lib/gmail'
import { processIncomingEmail } from '@/lib/agents/emailDrafting'

// GET /api/emails/list — return emails from DB
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)
  const category = searchParams.get('category')
  const critical = searchParams.get('critical')

  let query = supabaseAdmin
    .from('emails')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (critical === 'true') query = query.eq('is_critical', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ emails: data ?? [] })
}

// POST /api/emails/list — sync from Gmail
export async function POST(req: NextRequest) {
  try {
    const { maxResults = 20 } = await req.json().catch(() => ({}))
    const gmailMessages = await listRecentEmails(maxResults)

    const saved = []
    for (const msg of gmailMessages) {
      try {
        const email = await processIncomingEmail(msg)
        saved.push(email)
      } catch {
        // skip duplicates / parse errors
      }
    }

    await logAudit({
      action: 'gmail_sync',
      details: { fetched: gmailMessages.length, saved: saved.length },
    })

    return NextResponse.json({ synced: saved.length, emails: saved })
  } catch (err) {
    console.error('Gmail sync error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
