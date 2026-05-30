import { NextRequest, NextResponse } from 'next/server'
import { processIncomingEmail } from '@/lib/agents/emailDrafting'

export async function POST(req: NextRequest) {
  try {
    const { subject, sender, body } = await req.json()
    if (!subject?.trim() || !sender?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'subject, sender, and body are required' }, { status: 400 })
    }

    const email = await processIncomingEmail({
      id: `manual-${Date.now()}`,
      threadId: '',
      subject: subject.trim(),
      sender: sender.trim(),
      recipient: '',
      body: body.trim(),
      date: new Date().toISOString(),
    })

    return NextResponse.json({ email })
  } catch (err) {
    console.error('Manual email error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
