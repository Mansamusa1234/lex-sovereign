import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, logAudit } from '@/lib/supabase'
import { sendEmail, welcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, name, source = 'landing_page', tags = [] } = await req.json()

    if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Upsert subscriber
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .upsert(
        { email: email.toLowerCase().trim(), name, source, tags, confirmed: true },
        { onConflict: 'email', ignoreDuplicates: true }
      )
      .select()
      .single()

    if (error && !error.message.includes('duplicate')) {
      throw new Error(error.message)
    }

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Lex Sovereign AI Brain — Know Your Rights',
      html: welcomeEmail(name ?? '', email),
    })

    await logAudit({
      action: 'email_subscribe',
      details: { email: email.toLowerCase(), source },
    })

    return NextResponse.json({ success: true, message: 'Subscribed! Check your email.' })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
