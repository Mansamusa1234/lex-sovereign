import { NextRequest, NextResponse } from 'next/server'
import { draftEmailReply } from '@/lib/agents/emailDrafting'

export async function POST(req: NextRequest) {
  try {
    const { email_id } = await req.json()
    if (!email_id) return NextResponse.json({ error: 'email_id required' }, { status: 400 })

    const result = await draftEmailReply(email_id)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Email analyze error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
