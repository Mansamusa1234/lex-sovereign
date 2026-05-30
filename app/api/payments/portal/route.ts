import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lex-sovereign-f6m4.vercel.app'

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json()
    if (!customer_id) return NextResponse.json({ error: 'customer_id required' }, { status: 400 })

    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${APP_URL}/dashboard`,
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
