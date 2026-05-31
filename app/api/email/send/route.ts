import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { sendEmail, marketingEmail, newsletterEmail } from '@/lib/email'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  // Protect with API secret
  const auth = req.headers.get('x-api-key')
  if (auth !== process.env.API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { type, filter = {}, ...params } = body

    // Get subscribers
    let query = supabaseAdmin
      .from('subscribers')
      .select('email, name')
      .is('unsubscribed_at', null)
      .eq('confirmed', true)

    if (filter.tags?.length) {
      query = query.overlaps('tags', filter.tags)
    }
    if (filter.source) {
      query = query.eq('source', filter.source)
    }

    const { data: subscribers, error } = await query.limit(filter.limit ?? 500)
    if (error) throw new Error(error.message)

    let sent = 0
    let failed = 0

    for (const sub of subscribers ?? []) {
      let html = ''
      let subject = ''

      if (type === 'marketing') {
        subject = params.subject_line
        html = marketingEmail({ ...params, email: sub.email, name: sub.name ?? '' })
      } else if (type === 'newsletter') {
        subject = `Lex Sovereign Weekly · Week ${params.week_number}`
        html = newsletterEmail({ ...params, email: sub.email })
      } else if (type === 'custom') {
        subject = params.subject
        html = params.html.replace('{{name}}', sub.name ?? 'there').replace('{{email}}', encodeURIComponent(sub.email))
      }

      if (!subject || !html) continue

      const result = await sendEmail({ to: sub.email, subject, html })
      if (result.success) sent++
      else failed++

      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 50))
    }

    await logAudit({
      action: 'marketing_email_sent',
      details: { type, total: subscribers?.length ?? 0, sent, failed },
    })

    return NextResponse.json({ success: true, sent, failed, total: subscribers?.length ?? 0 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
